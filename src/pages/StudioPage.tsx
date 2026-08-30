import React, { useState } from 'react';
import {
  Activity,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code2,
  Copy,
  File,
  FileCode,
  FileText,
  FolderOpen,
  Layers,
  MessageSquare,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Settings,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react';

interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: FileNode[];
}

interface StudioPageProps {
  onNavigateToPage?: (page: string) => void;
}

const fileTree: FileNode[] = [
  {
    id: 'root',
    name: 'Nexa rebranding',
    type: 'folder',
    children: [
      { id: 'index', name: 'index.html', type: 'file' },
      { id: 'metadata', name: 'metadata.json', type: 'file' },
      { id: 'netlify', name: 'netlify.toml', type: 'file' },
      { id: 'package', name: 'package.json', type: 'file' },
      { id: 'server', name: 'server.ts', type: 'file' },
      { id: 'vite', name: 'vite.config.ts', type: 'file' },
      {
        id: 'src',
        name: 'src',
        type: 'folder',
        children: [
          { id: 'app', name: 'App.tsx', type: 'file' },
          { id: 'main', name: 'main.tsx', type: 'file' },
          { id: 'styles', name: 'index.css', type: 'file' },
        ],
      },
      {
        id: 'functions',
        name: 'functions',
        type: 'folder',
        children: [{ id: 'chat', name: 'api/chat.ts', type: 'file' }],
      },
      {
        id: 'backend',
        name: 'backend',
        type: 'folder',
        children: [{ id: 'backend-main', name: 'main.py', type: 'file' }],
      },
    ],
  },
];

const codeSnippet = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Forge AI - Studio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

const chatHistory = [
  {
    role: 'assistant',
    text: 'How can I make this app work? The "hidden screen" issue is resolved instead of just cosmetic.',
  },
  {
    role: 'assistant',
    text: 'Reviewed and updated VisitingPage.tsx. Running npm run build in the project root.',
  },
  {
    role: 'assistant',
    text: 'vite build completed successfully. The app is now ready for Studio preview.',
  },
];

export default function StudioPage({ onNavigateToPage }: StudioPageProps) {
  const [selectedFile, setSelectedFile] = useState('index.html');
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [bottomOpen, setBottomOpen] = useState(true);
  const [bottomTab, setBottomTab] = useState<'terminal' | 'problems' | 'output' | 'debug'>('terminal');

  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => {
      const isFolder = node.type === 'folder';
      const isSelected = selectedFile === node.name;

      return (
        <div key={node.id}>
          <button
            type="button"
            onClick={() => {
              if (!isFolder) {
                setSelectedFile(node.name);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '7px 10px',
              paddingLeft: 10 + depth * 16,
              background: isSelected ? 'rgba(45, 212, 191, 0.12)' : 'transparent',
              color: isSelected ? '#dfe7ef' : '#bac6d4',
              borderRadius: 8,
              border: isSelected ? '1px solid rgba(45, 212, 191, 0.25)' : '1px solid transparent',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            {isFolder ? (
              <ChevronRight size={13} style={{ color: '#7c8aa5', transform: 'rotate(90deg)' }} />
            ) : (
              <File size={13} style={{ color: '#8ea0b9' }} />
            )}
            <span style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.name}</span>
          </button>
          {isFolder && node.children && <div>{renderTree(node.children, depth + 1)}</div>}
        </div>
      );
    });
  };

  const mainTabs = [
    { name: 'index.html', active: true },
    { name: 'App.tsx', active: false },
    { name: 'chat.ts', active: false },
  ];

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        background: '#0d1117',
        color: '#ebf1f8',
        fontFamily: 'Inter, Segoe UI, sans-serif',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: 58,
          background: '#111827',
          borderRight: '1px solid rgba(148,163,184,0.14)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 16,
          gap: 14,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #34d399, #0ea5e9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 20px rgba(45, 212, 191, 0.25)',
          }}
        >
          <Code2 size={18} color="#05141b" />
        </div>

        {[MessageSquare, FolderOpen, Sparkles, Settings].map((Icon, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onNavigateToPage?.(index === 0 ? 'chat' : index === 1 ? 'studio' : index === 2 ? 'help' : 'settings')}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: '1px solid transparent',
              background: index === 2 ? 'rgba(45, 212, 191, 0.12)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: index === 2 ? '#5eead4' : '#8ea0b9',
              cursor: 'pointer',
            }}
          >
            <Icon size={18} />
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #1f2937, #0f172a)',
            border: '1px solid rgba(148,163,184,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#dfe7ef',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          V
        </div>
      </div>

      {explorerOpen && (
        <div
          style={{
            width: 290,
            background: '#111827',
            borderRight: '1px solid rgba(148,163,184,0.12)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              height: 42,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 12px',
              borderBottom: '1px solid rgba(148,163,184,0.12)',
              color: '#dfe7ef',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <span>Explorer</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <Plus size={14} />
              </button>
              <button type="button" onClick={() => setExplorerOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <ChevronLeft size={14} />
              </button>
            </div>
          </div>

          <div style={{ padding: '10px 12px 8px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#0b1220',
                border: '1px solid rgba(148,163,184,0.12)',
                borderRadius: 8,
                padding: '6px 8px',
              }}
            >
              <Search size={12} color="#7c8aa5" />
              <input
                value=""
                readOnly
                placeholder="Search files..."
                style={{ background: 'transparent', border: 'none', color: '#dfe7ef', width: '100%', outline: 'none', fontSize: 12 }}
              />
            </div>
          </div>

          <div style={{ padding: '6px 8px 0' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#dfe7ef',
                fontWeight: 600,
                fontSize: 12,
                padding: '6px 8px',
                borderRadius: 6,
              }}
            >
              <FolderOpen size={13} color="#9ca3af" />
              <span>Open Editors</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedFile('index.html')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 10px',
                background: selectedFile === 'index.html' ? 'rgba(45, 212, 191, 0.12)' : 'transparent',
                color: selectedFile === 'index.html' ? '#dfe7ef' : '#bac6d4',
                borderRadius: 8,
                border: selectedFile === 'index.html' ? '1px solid rgba(45, 212, 191, 0.25)' : '1px solid transparent',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <FileCode size={13} style={{ color: '#8ea0b9' }} />
              <span style={{ fontSize: 12 }}>index.html</span>
            </button>
          </div>

          <div style={{ flex: 1, padding: '8px 8px 12px', overflowY: 'auto' }}>{renderTree(fileTree)}</div>
        </div>
      )}

      {!explorerOpen && (
        <button
          type="button"
          onClick={() => setExplorerOpen(true)}
          style={{
            position: 'absolute',
            left: 58,
            top: 80,
            width: 18,
            height: 46,
            borderRadius: '0 8px 8px 0',
            background: '#111827',
            border: '1px solid rgba(148,163,184,0.12)',
            borderLeft: 'none',
            color: '#dfe7ef',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronRight size={14} />
        </button>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div
          style={{
            height: 42,
            background: '#111827',
            borderBottom: '1px solid rgba(148,163,184,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <span style={{ color: '#c5d0df', fontSize: 12, fontWeight: 500 }}>File</span>
            <span style={{ color: '#c5d0df', fontSize: 12, fontWeight: 500 }}>Edit</span>
            <span style={{ color: '#c5d0df', fontSize: 12, fontWeight: 500 }}>Selection</span>
            <span style={{ color: '#c5d0df', fontSize: 12, fontWeight: 500 }}>View</span>
            <span style={{ color: '#c5d0df', fontSize: 12, fontWeight: 500 }}>Go</span>
            <span style={{ color: '#c5d0df', fontSize: 12, fontWeight: 500 }}>Run</span>
            <span style={{ color: '#c5d0df', fontSize: 12, fontWeight: 500 }}>...</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{ color: '#dfe7ef', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>Nexa rebranding</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {[Bell, Copy, Play, FileText].map((Icon, idx) => (
              <button key={idx} type="button" style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            height: 34,
            background: '#0f172a',
            borderBottom: '1px solid rgba(148,163,184,0.12)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px 0 10px',
            gap: 12,
          }}
        >
          {mainTabs.map((tab) => (
            <div
              key={tab.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 8,
                background: tab.active ? '#0d1117' : 'transparent',
                border: tab.active ? '1px solid rgba(148,163,184,0.12)' : 'none',
                color: tab.active ? '#dfe7ef' : '#94a3b8',
                fontSize: 12,
              }}
            >
              <FileText size={12} />
              {tab.name}
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <button type="button" style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <MoreHorizontal size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, display: 'flex', minWidth: 0, background: '#0d1117' }}>
            <div
              style={{
                width: 36,
                background: '#0b1220',
                borderRight: '1px solid rgba(148,163,184,0.12)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: 8,
                gap: 12,
              }}
            >
              {[FileText, Activity, Terminal, Play, Layers, Search, Settings].map((Icon, index) => (
                <button
                  key={index}
                  type="button"
                  style={{
                    background: index === 0 ? 'rgba(45, 212, 191, 0.12)' : 'transparent',
                    border: 'none',
                    color: index === 0 ? '#5eead4' : '#94a3b8',
                    borderRadius: 8,
                    width: 26,
                    height: 26,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>

            <div style={{ flex: 1, minWidth: 0, overflow: 'auto', display: 'flex' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '42px 1fr',
                    fontSize: 13,
                    lineHeight: 1.6,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    color: '#dfe7ef',
                    minHeight: '100%',
                    background: '#0d1117',
                  }}
                >
                  <div style={{ color: '#6b7280', textAlign: 'right', padding: '18px 10px 0 0', background: 'rgba(15, 23, 42, 0.7)' }}>
                    {Array.from({ length: 14 }, (_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <pre style={{ margin: 0, padding: '18px 16px 26px 0', whiteSpace: 'pre-wrap', color: '#dfe7ef' }}>{codeSnippet}</pre>
                </div>
              </div>
            </div>
          </div>

          {chatOpen && (
            <div style={{ width: 340, background: '#111827', borderLeft: '1px solid rgba(148,163,184,0.12)', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  height: 42,
                  borderBottom: '1px solid rgba(148,163,184,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 12px',
                  color: '#dfe7ef',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageSquare size={15} color="#5eead4" />
                  <span>Chat</span>
                </div>
                <button type="button" onClick={() => setChatOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              </div>

              <div style={{ flex: 1, padding: 12, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {chatHistory.map((message, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: idx === 0 ? '#0b1220' : '#111827',
                      border: '1px solid rgba(148,163,184,0.12)',
                      borderRadius: 12,
                      padding: '10px 12px',
                      color: '#dfe7ef',
                      fontSize: 12,
                      lineHeight: 1.55,
                    }}
                  >
                    {message.text}
                  </div>
                ))}
              </div>

              <div style={{ padding: 12, borderTop: '1px solid rgba(148,163,184,0.12)' }}>
                <textarea
                  value=""
                  readOnly
                  style={{ width: '100%', minHeight: 68, background: '#0b1220', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 10, color: '#dfe7ef', padding: 10, resize: 'none', outline: 'none' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="button" style={{ border: 'none', background: '#14b8a6', color: '#031014', padding: '8px 14px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {bottomOpen && (
          <div style={{ background: '#0f172a', borderTop: '1px solid rgba(148,163,184,0.12)', height: 174, display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                height: 36,
                display: 'flex',
                alignItems: 'center',
                padding: '0 10px',
                gap: 10,
                borderBottom: '1px solid rgba(148,163,184,0.12)',
                color: '#94a3b8',
                fontSize: 12,
              }}
            >
              {(['Problems', 'Output', 'Debug Console', 'Terminal'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setBottomTab(tab === 'Terminal' ? 'terminal' : tab === 'Problems' ? 'problems' : tab === 'Debug Console' ? 'debug' : 'output')}
                  style={{
                    background: bottomTab === (tab === 'Terminal' ? 'terminal' : tab === 'Problems' ? 'problems' : tab === 'Debug Console' ? 'debug' : 'output') ? '#0d1117' : 'transparent',
                    border: '1px solid transparent',
                    borderRadius: 8,
                    padding: '5px 8px',
                    color: '#c5d0df',
                    cursor: 'pointer',
                  }}
                >
                  {tab}
                </button>
              ))}
              <div style={{ flex: 1 }} />
              <button type="button" onClick={() => setBottomOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <ChevronDown size={14} />
              </button>
            </div>

            <div style={{ flex: 1, padding: 10, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12, color: '#dfe7ef', overflow: 'auto' }}>
              {bottomTab === 'terminal' && (
                <div>
                  <div style={{ color: '#5eead4' }}>PS C:\Users\IT Engineer\OneDrive\Documents\Nexa rebranding&gt; npm run build</div>
                  <div style={{ color: '#dfe7ef' }}>vite v6.4.3 building for production...</div>
                  <div style={{ color: '#34d399' }}>✓ built in 38.08s</div>
                </div>
              )}
              {bottomTab === 'problems' && <div style={{ color: '#fbbf24' }}>No editor problems detected.</div>}
              {bottomTab === 'debug' && <div style={{ color: '#7dd3fc' }}>Debugger ready. No breakpoints yet.</div>}
              {bottomTab === 'output' && <div style={{ color: '#cbd5e1' }}>Application output is healthy. Build completed successfully.</div>}
            </div>
          </div>
        )}

        {!bottomOpen && (
          <button
            type="button"
            onClick={() => setBottomOpen(true)}
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 0,
              transform: 'translateX(-50%)',
              background: '#111827',
              border: '1px solid rgba(148,163,184,0.12)',
              borderBottom: 'none',
              borderRadius: '8px 8px 0 0',
              color: '#dfe7ef',
              padding: '8px 12px',
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <Terminal size={12} /> Terminal
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
