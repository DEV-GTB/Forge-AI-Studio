import React, { useState } from "react";
import { 
  History as HistoryIcon, Clock, RefreshCw, FileText, Check, ArrowLeft, 
  Trash2, RotateCcw, AlertTriangle, Search, FolderOpen, Calendar
} from "lucide-react";
import { Project, VersionHistoryItem } from "../types";

interface HistoryViewProps {
  activeProject: Project | undefined;
  onRestoreVersion: (version: VersionHistoryItem) => void;
  onDeleteVersion: (versionId: string) => void;
  addNotification: (text: string, type: 'info' | 'success' | 'warning') => void;
}

export default function HistoryView({
  activeProject,
  onRestoreVersion,
  onDeleteVersion,
  addNotification
}: HistoryViewProps) {
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  if (!activeProject) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 text-center space-y-4">
        <HistoryIcon className="h-12 w-12 text-slate-700 animate-pulse" />
        <h2 className="text-sm font-bold text-slate-300">No Active Project Workspace</h2>
        <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
          Version recovery and automated snapshot timelines require an active IDE workspace. Please switch to the Projects tab and open or create a workspace first!
        </p>
      </div>
    );
  }

  const history = activeProject.versionHistory || [];
  const selectedVersion = history.find(v => v.id === selectedVersionId);

  const handleRestore = (v: VersionHistoryItem) => {
    onRestoreVersion(v);
    addNotification(`Restored project workspace to snapshot: "${v.description}"`, "success");
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 sm:p-10 space-y-8 selection:bg-teal-500/30 selection:text-teal-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest block font-bold">SNAPSHOT RECOVERY</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Active Timeline</h1>
          <p className="text-xs text-slate-400">Restore files from automatic backup points, compile history, and manual branches.</p>
        </div>

        <div className="px-3 py-1.5 bg-slate-900 border border-slate-850 rounded-xl text-xs font-semibold text-slate-300 font-mono">
          Project: <span className="text-teal-400">{activeProject.name}</span>
        </div>
      </div>

      {/* Main split grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left side: List of commits/versions */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Snapshot Backups ({history.length})</h2>
          
          {history.length === 0 ? (
            <div className="p-10 bg-slate-900/20 border border-slate-900 rounded-2xl text-center text-slate-500 text-xs">
              No historical checkpoints exist yet. Make changes in the code editor or run a compile inside Projects to trigger auto-backup saves!
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((v, index) => {
                const isSelected = selectedVersionId === v.id;
                const dateObj = new Date(v.timestamp);
                const formattedDate = dateObj.toLocaleDateString();
                const formattedTime = dateObj.toLocaleTimeString();

                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVersionId(v.id)}
                    className={`p-4 bg-slate-900/40 hover:bg-slate-900 border rounded-xl cursor-pointer transition flex items-start justify-between group ${
                      isSelected ? "border-teal-500 bg-teal-950/5" : "border-slate-900 hover:border-slate-850"
                    }`}>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                        <Clock className="h-3.5 w-3.5 text-slate-600" />
                        <span>{formattedDate} • {formattedTime}</span>
                        {index === 0 && (
                          <span className="px-1.5 py-0.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[8px] uppercase font-bold rounded">Latest Backup</span>
                        )}
                      </div>

                      <h3 className="text-xs font-extrabold text-white group-hover:text-teal-400 transition">{v.description}</h3>
                      <p className="text-[10px] font-mono text-slate-500">Includes {Object.keys(v.files).length} files</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRestore(v); }}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-teal-500 text-slate-300 hover:text-slate-950 text-[10px] font-bold rounded border border-slate-700 hover:border-teal-500 transition-all flex items-center space-x-1"
                        title="Revert workspace state">
                        <RotateCcw className="h-3 w-3" />
                        <span>Restore</span>
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteVersion(v.id); if (selectedVersionId === v.id) setSelectedVersionId(null); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition"
                        title="Remove snapshot">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right side: Selected snapshot details / comparison file preview */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900/50 border border-slate-850 rounded-2xl p-5 space-y-5 sticky top-6">
            <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FolderOpen className="h-4 w-4 text-teal-400" />
                <h3 className="text-xs sm:text-sm font-extrabold text-white">Snapshot Details</h3>
              </div>
              {selectedVersion && (
                <span className="text-[9px] font-mono text-slate-500 uppercase">INDEX REF: {selectedVersion.id.substring(0, 12)}</span>
              )}
            </div>

            {selectedVersion ? (
              <div className="space-y-4">
                <div className="p-3 bg-slate-950/80 border border-slate-850 rounded-xl space-y-2 text-[11px] leading-relaxed text-slate-400">
                  <div className="flex items-center space-x-1.5 text-xs text-white font-bold">
                    <Calendar className="h-4 w-4 text-teal-400" />
                    <span>Checkpoint Description</span>
                  </div>
                  <p className="italic text-slate-300">"{selectedVersion.description}"</p>
                  <p>
                    Reverting your workspace will restore exactly {Object.keys(selectedVersion.files).length} file elements to this timestamp. This will overwrite any unsaved code updates in your live Projects editor.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider block font-bold">STAGED FILE SYSTEM INDEX:</span>
                  <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-850 space-y-1 max-h-48 overflow-y-auto font-mono text-[11px]">
                    {Object.keys(selectedVersion.files).map(filePath => (
                      <div key={filePath} className="flex items-center justify-between py-1 border-b border-slate-900 last:border-0 text-slate-300">
                        <span className="truncate">{filePath}</span>
                        <span className="text-[9px] text-slate-500">{(selectedVersion.files[filePath].length / 1024).toFixed(2)} kb</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-amber-950/15 border border-amber-900/30 rounded-xl flex items-start space-x-2 text-[10px] text-amber-400 leading-normal">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Warning: Overwriting is immediate and clears any active compilation hot-fixes in the IDE page. Make sure your local updates are backed up.
                  </span>
                </div>

                <button
                  onClick={() => handleRestore(selectedVersion)}
                  className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-teal-500/15 cursor-pointer">
                  <RotateCcw className="h-4 w-4" />
                  <span>Confirm and Revert Workspace to this Checkpoint</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 space-y-2">
                <HistoryIcon className="h-8 w-8 text-slate-600 mx-auto animate-pulse" />
                <p className="text-xs">Select any historical timeline checkpoint on the left to inspect its staged file system index and initiate an immediate restore.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
