// GitHub REST API Integration Helper for Pushing/Pulling Workspace Files

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  description: string | null;
  default_branch: string;
  private: boolean;
}

export function getGitHubToken(): string | null {
  return localStorage.getItem("forgeai_github_token");
}

export function setGitHubToken(token: string): void {
  localStorage.setItem("forgeai_github_token", token);
}

export function removeGitHubToken(): void {
  localStorage.removeItem("forgeai_github_token");
  localStorage.removeItem("forgeai_github_user");
  localStorage.removeItem("forgeai_github_linked_repo");
}

function encodeGitHubPath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

/**
 * Fetch authenticated user's repositories from GitHub REST API
 */
export async function fetchUserRepos(token: string): Promise<GitHubRepo[]> {
  const res = await fetch("https://api.github.com/user/repos?sort=updated&per_page=50", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json"
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `GitHub API request failed with status ${res.status}`);
  }

  return await res.json();
}

/**
 * Pull repository files into a workspace object dictionary
 */
export async function pullRepoFiles(token: string, owner: string, repo: string, branch = "main"): Promise<{ files: Record<string, string>; defaultBranch: string }> {
  // First attempt to get tree on target branch
  let refBranch = branch;
  let treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${refBranch}?recursive=1`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json"
    }
  });

  // Fallback to master if main branch isn't found
  if (!treeRes.ok && branch === "main") {
    refBranch = "master";
    treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${refBranch}?recursive=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json"
      }
    });
  }

  if (!treeRes.ok) {
    const err = await treeRes.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch repository tree for ${owner}/${repo}`);
  }

  const treeData = await treeRes.json();
  const treeItems: Array<{ path: string; type: string; url: string; size?: number }> = treeData.tree || [];

  const workspaceFiles: Record<string, string> = {};

  // Fetch blob content for relevant code files (limit to standard text files)
  const textExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.md', '.txt', '.env', '.yaml', '.yml', '.xml', '.svg'];

  const fileItems = treeItems.filter(item => {
    if (item.type !== 'blob') return false;
    if (item.path.startsWith('.') && !item.path.startsWith('.env')) return false;
    if (item.path.includes('node_modules/') || item.path.includes('dist/')) return false;
    const lower = item.path.toLowerCase();
    return textExtensions.some(ext => lower.endsWith(ext)) || !lower.includes('.');
  }).slice(0, 40); // Cap at 40 files for responsive performance

  await Promise.all(
    fileItems.map(async (item) => {
      try {
        const fileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeGitHubPath(item.path)}?ref=${refBranch}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json"
          }
        });
        if (fileRes.ok) {
          const fileData = await fileRes.json();
          if (fileData.content && fileData.encoding === 'base64') {
            // Standard base64 decoding handling UTF-8 characters correctly
            const raw = atob(fileData.content.replace(/\n/g, ''));
            const bytes = new Uint8Array(raw.length);
            for (let i = 0; i < raw.length; i++) {
              bytes[i] = raw.charCodeAt(i);
            }
            const decoded = new TextDecoder().decode(bytes);
            workspaceFiles[item.path] = decoded;
          }
        }
      } catch (e) {
        console.warn(`Could not pull file ${item.path}:`, e);
      }
    })
  );

  return { files: workspaceFiles, defaultBranch: refBranch };
}

/**
 * Push workspace files directly to GitHub repo
 */
export async function pushWorkspaceFiles(
  token: string, 
  owner: string, 
  repo: string, 
  files: Record<string, string>, 
  commitMessage: string,
  branch = "main"
): Promise<{ updatedCount: number; commitSha?: string }> {
  let updatedCount = 0;

  for (const [path, content] of Object.entries(files)) {
    try {
      // 1. Get existing file SHA if present
      let existingSha: string | undefined;
      const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeGitHubPath(path)}?ref=${branch}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json"
        }
      });

      if (getRes.ok) {
        const existingData = await getRes.json();
        existingSha = existingData.sha;
      }

      // Encode UTF-8 content to base64
      const utf8Bytes = new TextEncoder().encode(content);
      let binaryStr = "";
      for (let i = 0; i < utf8Bytes.length; i++) {
        binaryStr += String.fromCharCode(utf8Bytes[i]);
      }
      const base64Content = btoa(binaryStr);

      // 2. Put file contents
      const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeGitHubPath(path)}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json"
        },
        body: JSON.stringify({
          message: `${commitMessage} (${path})`,
          content: base64Content,
          branch: branch,
          ...(existingSha ? { sha: existingSha } : {})
        })
      });

      if (putRes.ok) {
        updatedCount++;
      } else {
        const errJson = await putRes.json().catch(() => ({}));
        console.warn(`Failed to push file ${path}:`, errJson.message);
      }
    } catch (e) {
      console.error(`Error pushing file ${path}:`, e);
    }
  }

  return { updatedCount };
}
