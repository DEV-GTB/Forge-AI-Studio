import React, { useState } from 'react';
import { GitCompare, RotateCcw, Check, FileText, ArrowLeftRight, Copy } from 'lucide-react';
import { VersionHistoryItem } from '../types';

interface CodeDiffViewerProps {
  filePath: string;
  currentContent: string;
  versionHistory?: VersionHistoryItem[];
  onRevertFile: (filePath: string, restoredContent: string) => void;
  onCloseDiff?: () => void;
}

interface DiffLine {
  type: 'add' | 'remove' | 'same';
  oldLineNumber?: number;
  newLineNumber?: number;
  text: string;
}

export default function CodeDiffViewer({
  filePath,
  currentContent,
  versionHistory,
  onRevertFile,
  onCloseDiff
}: CodeDiffViewerProps) {
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>(
    versionHistory && versionHistory.length > 0 ? versionHistory[versionHistory.length - 1].id : ''
  );
  const [copied, setCopied] = useState(false);

  // Find target snapshot content for this file
  const snapshot = versionHistory?.find(v => v.id === selectedSnapshotId) || versionHistory?.[versionHistory.length - 1];
  const oldContent = snapshot?.files?.[filePath] ?? '';

  // Generate simple line-by-line diff
  const computeDiff = (oldText: string, newText: string): DiffLine[] => {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    const result: DiffLine[] = [];

    let oldIdx = 0;
    let newIdx = 0;

    // Simple diff matcher
    while (oldIdx < oldLines.length || newIdx < newLines.length) {
      if (oldIdx < oldLines.length && newIdx < newLines.length && oldLines[oldIdx] === newLines[newIdx]) {
        result.push({
          type: 'same',
          oldLineNumber: oldIdx + 1,
          newLineNumber: newIdx + 1,
          text: oldLines[oldIdx]
        });
        oldIdx++;
        newIdx++;
      } else if (newIdx < newLines.length && (!oldLines.includes(newLines[newIdx], oldIdx) || oldIdx >= oldLines.length)) {
        result.push({
          type: 'add',
          newLineNumber: newIdx + 1,
          text: newLines[newIdx]
        });
        newIdx++;
      } else if (oldIdx < oldLines.length) {
        result.push({
          type: 'remove',
          oldLineNumber: oldIdx + 1,
          text: oldLines[oldIdx]
        });
        oldIdx++;
      }
    }

    return result;
  };

  const diffLines = computeDiff(oldContent, currentContent);
  const addCount = diffLines.filter(l => l.type === 'add').length;
  const removeCount = diffLines.filter(l => l.type === 'remove').length;

  const handleCopyOld = () => {
    navigator.clipboard.writeText(oldContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevertEntireFile = () => {
    if (window.confirm(`Revert "${filePath}" back to checkpoint from ${snapshot?.timestamp || 'last snapshot'}?`)) {
      onRevertFile(filePath, oldContent);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 font-mono text-xs">
      {/* Diff Toolbar Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-teal-400 font-bold">
            <GitCompare className="h-4 w-4" />
            <span>Diff Comparison:</span>
            <span className="text-white font-mono bg-slate-800 px-2 py-0.5 rounded text-[11px]">{filePath}</span>
          </div>

          <div className="flex items-center space-x-2 text-[11px]">
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">+{addCount}</span>
            <span className="text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">-{removeCount}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Select Version Snapshot to compare with */}
          {versionHistory && versionHistory.length > 0 && (
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400 text-[10px]">Compare against:</span>
              <select
                value={selectedSnapshotId}
                onChange={(e) => setSelectedSnapshotId(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-[11px] rounded px-2 py-1 outline-none"
              >
                {versionHistory.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.timestamp} - {v.description.substring(0, 30)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleCopyOld}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-sans flex items-center space-x-1 transition"
            title="Copy snapshot code"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? 'Copied' : 'Copy Snapshot'}</span>
          </button>

          <button
            onClick={handleRevertEntireFile}
            className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[11px] font-sans font-bold flex items-center space-x-1.5 transition"
            title="Revert current file to selected snapshot version"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Revert File to Snapshot</span>
          </button>
        </div>
      </div>

      {/* Line-by-Line Code Diff Body */}
      <div className="flex-1 overflow-auto font-mono text-[11px] leading-relaxed select-text bg-slate-950 p-2 space-y-0.5">
        {diffLines.length === 0 ? (
          <div className="text-slate-500 italic p-6 text-center">
            No changes detected between working copy and saved checkpoint.
          </div>
        ) : (
          diffLines.map((line, idx) => {
            let bgClass = 'hover:bg-slate-900/60 text-slate-300';
            let prefix = ' ';
            let prefixColor = 'text-slate-600';

            if (line.type === 'add') {
              bgClass = 'bg-emerald-950/40 text-emerald-200 border-l-2 border-emerald-500/80';
              prefix = '+';
              prefixColor = 'text-emerald-400 font-bold';
            } else if (line.type === 'remove') {
              bgClass = 'bg-rose-950/40 text-rose-200 border-l-2 border-rose-500/80 line-through opacity-80';
              prefix = '-';
              prefixColor = 'text-rose-400 font-bold';
            }

            return (
              <div key={idx} className={`flex items-start px-2 py-0.5 rounded-sm ${bgClass}`}>
                {/* Old line num */}
                <span className="w-10 text-right pr-2 text-slate-600 select-none text-[10px]">
                  {line.oldLineNumber || ''}
                </span>
                {/* New line num */}
                <span className="w-10 text-right pr-2 text-slate-600 select-none text-[10px] border-r border-slate-800/80 mr-2">
                  {line.newLineNumber || ''}
                </span>
                {/* Marker */}
                <span className={`w-4 select-none ${prefixColor}`}>{prefix}</span>
                {/* Code Line */}
                <span className="whitespace-pre-wrap break-all flex-1">{line.text}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
