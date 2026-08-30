import React, { useState, useEffect } from "react";
import { 
  GitBranch, Github, Download, Upload, RefreshCw, Check, 
  AlertCircle, ExternalLink, Key, FolderGit2, Sparkles, Layers
} from "lucide-react";
import { 
  getGitHubToken, setGitHubToken, removeGitHubToken, 
  fetchUserRepos, pullRepoFiles, pushWorkspaceFiles, GitHubRepo 
} from "../lib/githubSync";

interface GitHubSyncWidgetProps {
  currentFiles?: Record<string, string>;
  onApplyPulledFiles?: (files: Record<string, string>) => void;
  addNotification?: (text: string, type: 'info' | 'success' | 'warning') => void;
}

export default function GitHubSyncWidget({
  currentFiles = {},
  onApplyPulledFiles,
  addNotification
}: GitHubSyncWidgetProps) {
  const [token, setToken] = useState<string | null>(getGitHubToken());
  const [manualTokenInput, setManualTokenInput] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [githubUser, setGithubUser] = useState<string | null>(() => localStorage.getItem("forgeai_github_user"));
  
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [linkedRepoName, setLinkedRepoName] = useState<string>(() => localStorage.getItem("forgeai_github_linked_repo") || "");
  
  const [commitMsg, setCommitMsg] = useState("Update workspace files via ForgeAI Workbench");
  const [branchName, setBranchName] = useState("main");
  
  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load repos when token is available
  useEffect(() => {
    if (token) {
      loadRepositories(token);
    }
  }, [token]);

  const loadRepositories = async (authToken: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const list = await fetchUserRepos(authToken);
      setRepos(list);
      
      // Auto select linked repo if previously saved
      if (linkedRepoName) {
        const found = list.find(r => r.full_name === linkedRepoName);
        if (found) setSelectedRepo(found);
      } else if (list.length > 0) {
        setSelectedRepo(list[0]);
      }
    } catch (err: any) {
      console.error("Failed to fetch GitHub repos:", err);
      setErrorMsg(err.message || "Failed to load GitHub repositories. Check your token scope.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveManualToken = () => {
    if (!manualTokenInput.trim()) return;
    const clean = manualTokenInput.trim();
    setGitHubToken(clean);
    setToken(clean);
    setShowTokenInput(false);
    addNotification?.("GitHub Personal Access Token saved.", "success");
    loadRepositories(clean);
  };

  const handleDisconnect = () => {
    removeGitHubToken();
    setToken(null);
    setGithubUser(null);
    setRepos([]);
    setSelectedRepo(null);
    addNotification?.("GitHub connection removed.", "info");
  };

  const handleSelectRepo = (repoFullName: string) => {
    const found = repos.find(r => r.full_name === repoFullName);
    if (found) {
      setSelectedRepo(found);
      setLinkedRepoName(found.full_name);
      localStorage.setItem("forgeai_github_linked_repo", found.full_name);
      setBranchName(found.default_branch || "main");
    }
  };

  const handlePullFiles = async () => {
    if (!token || !selectedRepo) return;
    setLoading(true);
    setErrorMsg(null);
    setActionStatus("Fetching repository tree and files...");

    try {
      const { files, defaultBranch } = await pullRepoFiles(
        token, 
        selectedRepo.owner.login, 
        selectedRepo.name, 
        branchName || selectedRepo.default_branch || "main"
      );

      const fileCount = Object.keys(files).length;
      if (fileCount === 0) {
        throw new Error("No readable text files found in target branch.");
      }

      onApplyPulledFiles?.(files);
      setActionStatus(`Successfully pulled ${fileCount} files from ${selectedRepo.full_name}!`);
      addNotification?.(`Pulled ${fileCount} files into workspace from ${selectedRepo.name}.`, "success");
    } catch (err: any) {
      console.error("Pull error:", err);
      setErrorMsg(err.message || "Failed to pull repository files.");
    } finally {
      setLoading(false);
    }
  };

  const handlePushFiles = async () => {
    if (!token || !selectedRepo) return;
    const filesToPush = currentFiles;
    const fileCount = Object.keys(filesToPush).length;

    if (fileCount === 0) {
      setErrorMsg("Workspace has no files to push.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setActionStatus(`Pushing ${fileCount} workspace files to ${selectedRepo.full_name}...`);

    try {
      const result = await pushWorkspaceFiles(
        token,
        selectedRepo.owner.login,
        selectedRepo.name,
        filesToPush,
        commitMsg.trim() || "Update via ForgeAI Workbench",
        branchName || selectedRepo.default_branch || "main"
      );

      setActionStatus(`Successfully pushed ${result.updatedCount} files to ${selectedRepo.full_name}!`);
      addNotification?.(`Pushed ${result.updatedCount} workspace files to GitHub repository.`, "success");
    } catch (err: any) {
      console.error("Push error:", err);
      setErrorMsg(err.message || "Failed to push files to repository.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-5 text-xs text-slate-200">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-teal-400">
            <Github className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">GitHub Workspace Repository Linker</h3>
            <p className="text-[11px] text-slate-400">Sync workspace code directly with your GitHub repositories</p>
          </div>
        </div>

        {token && (
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-950/40 border border-emerald-800/40 rounded-full text-[10px] text-emerald-400 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Connected {githubUser ? `@${githubUser}` : ''}</span>
            </span>
            <button
              onClick={handleDisconnect}
              className="text-[10px] font-mono text-slate-400 hover:text-red-400 underline transition">
              Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Auth State: Not Connected */}
      {!token ? (
        <div className="space-y-4 py-2">
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Link your GitHub account to directly pull source files into this interactive environment or push your code changes to GitHub repositories.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowTokenInput(!showTokenInput)}
              className="px-3.5 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-semibold rounded-xl transition flex items-center space-x-1.5 cursor-pointer">
              <Key className="h-3.5 w-3.5 text-teal-400" />
              <span>Use Personal Access Token</span>
            </button>
          </div>

          {showTokenInput && (
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
              <label className="block text-[10px] font-mono text-slate-400 uppercase">GitHub Personal Access Token (classic or fine-grained)</label>
              <div className="flex space-x-2">
                <input 
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={manualTokenInput}
                  onChange={(e) => setManualTokenInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
                <button
                  onClick={handleSaveManualToken}
                  className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-lg transition">
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Auth State: Connected */
        <div className="space-y-4">
          
          {/* Repository Selector */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <label className="md:col-span-3 text-[10px] font-mono text-slate-400 uppercase">Select Target Repository</label>
            <div className="md:col-span-9 flex space-x-2">
              <select
                value={selectedRepo?.full_name || ""}
                onChange={(e) => handleSelectRepo(e.target.value)}
                disabled={loading || repos.length === 0}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500">
                {repos.length === 0 ? (
                  <option value="">No repositories found</option>
                ) : (
                  repos.map((r) => (
                    <option key={r.id} value={r.full_name}>
                      {r.full_name} {r.private ? "(Private)" : ""}
                    </option>
                  ))
                )}
              </select>

              <button
                onClick={() => loadRepositories(token)}
                disabled={loading}
                title="Refresh Repositories"
                className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {selectedRepo && (
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2 text-slate-300 font-mono">
                  <FolderGit2 className="h-4 w-4 text-teal-400" />
                  <a 
                    href={selectedRepo.html_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="hover:underline flex items-center space-x-1 font-semibold text-white">
                    <span>{selectedRepo.full_name}</span>
                    <ExternalLink className="h-3 w-3 text-slate-500" />
                  </a>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-400 font-mono text-[10px]">
                  <GitBranch className="h-3 w-3 text-teal-400" />
                  <span>Branch:</span>
                  <input 
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-16 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-white font-mono text-[10px]"
                  />
                </div>
              </div>

              {/* Commit message input for pushes */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase">Commit Message for Push</label>
                <input 
                  type="text"
                  value={commitMsg}
                  onChange={(e) => setCommitMsg(e.target.value)}
                  placeholder="Update workspace code via ForgeAI"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              {/* Action buttons: Pull & Push */}
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={handlePullFiles}
                  disabled={loading}
                  className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-teal-300 font-semibold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50">
                  <Download className="h-4 w-4" />
                  <span>Pull Files to Workspace</span>
                </button>

                <button
                  onClick={handlePushFiles}
                  disabled={loading || Object.keys(currentFiles).length === 0}
                  className="flex-1 py-2 px-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50">
                  <Upload className="h-4 w-4" />
                  <span>Push Workspace to GitHub ({Object.keys(currentFiles).length} files)</span>
                </button>
              </div>
            </div>
          )}

          {actionStatus && (
            <div className="p-2.5 bg-teal-950/30 border border-teal-900/40 rounded-xl text-teal-300 text-[11px] flex items-center space-x-2">
              <Check className="h-4 w-4 shrink-0 text-teal-400" />
              <span>{actionStatus}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-red-950/30 border border-red-900/40 rounded-xl text-red-300 text-[11px] flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
