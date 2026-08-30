import React, { useState, useRef } from 'react';
import { Copy, Check, Save, Eye, EyeOff, Search, FileCode } from 'lucide-react';

interface CodeEditorWithHighlightProps {
  filePath: string;
  content: string;
  onChange: (newContent: string) => void;
  fontFamily?: string;
  fontSize?: string;
}

export default function CodeEditorWithHighlight({
  filePath,
  content,
  onChange,
  fontFamily = 'JetBrains Mono',
  fontSize = 'base'
}: CodeEditorWithHighlightProps) {
  const [copied, setCopied] = useState(false);
  const [foldedLines, setFoldedLines] = useState<Record<number, boolean>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = content.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFoldLine = (lineIdx: number) => {
    setFoldedLines(prev => ({ ...prev, [lineIdx]: !prev[lineIdx] }));
  };

  // Basic syntax highlighter helper for token spans
  const highlightToken = (token: string, line: string) => {
    // Keywords
    if (/^(import|export|from|const|let|var|function|return|if|else|switch|case|default|for|while|async|await|try|catch|class|interface|type|extends|implements|default)$/.test(token)) {
      return <span className="text-purple-400 font-bold">{token}</span>;
    }
    // Booleans & Null
    if (/^(true|false|null|undefined)$/.test(token)) {
      return <span className="text-amber-400 font-semibold">{token}</span>;
    }
    // Numbers
    if (/^\d+$/.test(token)) {
      return <span className="text-teal-300">{token}</span>;
    }
    // Types
    if (/^(string|number|boolean|any|void|unknown|never|Record|Array|Promise)$/.test(token)) {
      return <span className="text-cyan-400">{token}</span>;
    }
    return <span>{token}</span>;
  };

  // Render a syntax-colorized line view
  const renderColorizedLine = (lineText: string) => {
    if (lineText.trim().startsWith('//') || lineText.trim().startsWith('/*')) {
      return <span className="text-slate-500 italic">{lineText}</span>;
    }

    // Split string literals vs tokens
    const parts = lineText.split(/(".*?"|'.*?'|`.*?`|\b)/g);
    return (
      <span>
        {parts.map((part, i) => {
          if (/^(".*?"|'.*?'|`.*?`)$/.test(part)) {
            return <span key={i} className="text-emerald-300">{part}</span>;
          }
          if (part.startsWith('<') || part.endsWith('>')) {
            return <span key={i} className="text-rose-400">{part}</span>;
          }
          return <span key={i}>{highlightToken(part, lineText)}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono text-xs select-text">
      {/* Editor Control Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-300 text-[11px] shrink-0">
        <div className="flex items-center space-x-2">
          <FileCode className="h-3.5 w-3.5 text-teal-400" />
          <span className="font-bold text-white">{filePath}</span>
          <span className="text-[10px] text-slate-500 font-sans">({lines.length} lines, {content.length} chars)</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-emerald-400 font-sans flex items-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Auto-Saved</span>
          </span>

          <button
            onClick={handleCopy}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-sans flex items-center space-x-1 transition"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Editor Main Canvas & Textarea */}
      <div className="relative flex-1 overflow-auto flex bg-slate-950">
        {/* Line Numbers Column */}
        <div className="w-12 py-3 bg-slate-950 border-r border-slate-800/60 select-none text-right pr-3 text-slate-600 font-mono text-[11px] shrink-0 space-y-0.5">
          {lines.map((_, idx) => (
            <div key={idx} className="h-5 flex items-center justify-end space-x-1">
              {(lines[idx].includes('{') || lines[idx].includes('(')) && (
                <span
                  onClick={() => toggleFoldLine(idx)}
                  className="cursor-pointer text-slate-600 hover:text-teal-400 text-[9px] mr-0.5"
                  title="Toggle fold block"
                >
                  {foldedLines[idx] ? '▶' : '▼'}
                </span>
              )}
              <span>{idx + 1}</span>
            </div>
          ))}
        </div>

        {/* Editable Overlay Editor Area */}
        <div className="relative flex-1 py-3 px-3">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            className="w-full h-full bg-transparent text-slate-200 outline-none resize-none font-mono text-[11px] leading-5 selection:bg-teal-500/30 font-medium whitespace-pre"
            style={{ fontFamily }}
          />
        </div>
      </div>
    </div>
  );
}
