import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderPlus, FilePlus, FileText, Trash2, Search, Edit2, Code2, Image as ImageIcon, Box } from 'lucide-react';

export interface FileTreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  children?: FileTreeNode[];
}

interface FileTreeExplorerProps {
  files: Record<string, string>; // path -> content
  folders?: string[]; // explicit empty folders
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
  onCreateFile: (folderPath?: string) => void;
  onCreateFolder: (parentFolderPath?: string) => void;
  onDeletePath: (path: string, isFolder: boolean) => void;
}

export default function FileTreeExplorer({
  files,
  folders = [],
  selectedPath,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onDeletePath
}: FileTreeExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'src': true,
    'src/components': true,
    'src/lib': true,
    'public': true
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Convert flat path dictionary into hierarchical tree structure
  const buildTree = (): FileTreeNode[] => {
    const root: FileTreeNode[] = [];
    const folderMap: Record<string, FileTreeNode> = {};

    const getOrCreateFolderNode = (folderPath: string): FileTreeNode => {
      if (folderMap[folderPath]) return folderMap[folderPath];

      const parts = folderPath.split('/').filter(Boolean);
      let currentPath = '';
      let parentNodeList = root;
      let createdNode: FileTreeNode | null = null;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!folderMap[currentPath]) {
          const newFolderNode: FileTreeNode = {
            name: part,
            path: currentPath,
            isFolder: true,
            children: []
          };
          folderMap[currentPath] = newFolderNode;
          parentNodeList.push(newFolderNode);
        }

        createdNode = folderMap[currentPath];
        parentNodeList = createdNode.children!;
      }

      return createdNode!;
    };

    // Ensure explicit folder entries exist
    folders.forEach(f => {
      if (f) getOrCreateFolderNode(f);
    });

    // Populate files into hierarchy
    Object.keys(files).forEach(filePath => {
      const parts = filePath.split('/').filter(Boolean);
      if (parts.length === 1) {
        // Root file
        root.push({
          name: parts[0],
          path: filePath,
          isFolder: false
        });
      } else {
        const fileName = parts.pop()!;
        const parentFolderPath = parts.join('/');
        const parentFolderNode = getOrCreateFolderNode(parentFolderPath);
        parentFolderNode.children!.push({
          name: fileName,
          path: filePath,
          isFolder: false
        });
      }
    });

    // Sort folders first, then files alphabetically
    const sortNodes = (nodes: FileTreeNode[]) => {
      nodes.sort((a, b) => {
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
        return a.name.localeCompare(b.name);
      });
      nodes.forEach(n => {
        if (n.children) sortNodes(n.children);
      });
    };

    sortNodes(root);
    return root;
  };

  const treeData = buildTree();

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderPath]: !prev[folderPath]
    }));
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) return <Code2 className="h-3.5 w-3.5 text-teal-400 shrink-0" />;
    if (fileName.endsWith('.ts') || fileName.endsWith('.js')) return <Code2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />;
    if (fileName.endsWith('.json')) return <Code2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />;
    if (fileName.endsWith('.css') || fileName.endsWith('.html')) return <Code2 className="h-3.5 w-3.5 text-rose-400 shrink-0" />;
    if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.svg')) return <ImageIcon className="h-3.5 w-3.5 text-purple-400 shrink-0" />;
    if (fileName.endsWith('.obj')) return <Box className="h-3.5 w-3.5 text-indigo-400 shrink-0" />;
    return <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />;
  };

  const renderNode = (node: FileTreeNode, depth = 0) => {
    // Search filter check
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchesSearch = node.name.toLowerCase().includes(term) || node.path.toLowerCase().includes(term);
      if (!matchesSearch && !node.isFolder) return null;
    }

    const isExpanded = expandedFolders[node.path] ?? false;
    const isSelected = selectedPath === node.path;

    if (node.isFolder) {
      return (
        <div key={node.path} className="select-none">
          <div
            className={`group flex items-center justify-between px-2 py-1 hover:bg-slate-800/60 rounded cursor-pointer transition text-slate-300 text-xs`}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={() => toggleFolder(node.path)}
          >
            <div className="flex items-center space-x-1.5 truncate">
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              )}
              <Folder className="h-3.5 w-3.5 text-amber-400/90 shrink-0" />
              <span className="font-medium text-slate-200 truncate">{node.name}</span>
            </div>

            <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateFile(node.path);
                }}
                className="p-1 text-slate-400 hover:text-teal-300 rounded hover:bg-slate-700"
                title={`New file in ${node.path}`}
              >
                <FilePlus className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateFolder(node.path);
                }}
                className="p-1 text-slate-400 hover:text-amber-300 rounded hover:bg-slate-700"
                title={`New folder in ${node.path}`}
              >
                <FolderPlus className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePath(node.path, true);
                }}
                className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-700"
                title={`Delete folder ${node.path}`}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>

          {isExpanded && node.children && (
            <div className="space-y-0.5">
              {node.children.map(child => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // Render File
    return (
      <div
        key={node.path}
        className={`group flex items-center justify-between px-2 py-1 rounded cursor-pointer transition text-xs select-none ${
          isSelected
            ? 'bg-teal-500/15 text-teal-300 font-semibold border-l-2 border-teal-400'
            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
        }`}
        style={{ paddingLeft: `${depth * 12 + 20}px` }}
        onClick={() => onSelectFile(node.path)}
      >
        <div className="flex items-center space-x-2 truncate">
          {getFileIcon(node.name)}
          <span className="truncate">{node.name}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeletePath(node.path, false);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-700 transition"
          title={`Delete file ${node.name}`}
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 text-slate-300 font-sans text-xs">
      {/* Explorer Header */}
      <div className="p-2 border-b border-slate-800 flex items-center justify-between shrink-0">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">EXPLORER</span>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onCreateFile()}
            className="p-1 text-slate-400 hover:text-teal-300 hover:bg-slate-800 rounded transition"
            title="Create File at Root"
          >
            <FilePlus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onCreateFolder()}
            className="p-1 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded transition"
            title="Create Folder at Root"
          >
            <FolderPlus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Search Input Filter */}
      <div className="px-2 py-1.5 border-b border-slate-800/60 bg-slate-950/40 shrink-0">
        <div className="flex items-center space-x-1.5 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[11px]">
          <Search className="h-3 w-3 text-slate-500 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter files..."
            className="w-full bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Hierarchical Tree Body */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {treeData.map(node => renderNode(node, 0))}
      </div>
    </div>
  );
}
