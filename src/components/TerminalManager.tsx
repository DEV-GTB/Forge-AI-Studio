import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Plus, X, Play, Square, RefreshCw, Trash2, CheckCircle2, AlertCircle, Cpu, ShieldCheck } from 'lucide-react';
import { TerminalSession, TerminalLine } from '../types';

interface TerminalManagerProps {
  sessions: TerminalSession[];
  activeSessionId?: string;
  onUpdateSessions: (sessions: TerminalSession[], activeId: string) => void;
  onRunProjectAction?: (actionName: string) => void;
}

export default function TerminalManager({
  sessions,
  activeSessionId,
  onUpdateSessions,
  onRunProjectAction
}: TerminalManagerProps) {
  // Ensure we always have at least one session
  const defaultSessions: TerminalSession[] = sessions && sessions.length > 0 ? sessions : [
    {
      id: 'term-dev',
      name: 'dev',
      status: 'running',
      command: 'npm run dev',
      createdAt: new Date().toLocaleTimeString(),
      history: [
        { type: 'command', text: '$ npm run dev', time: new Date().toLocaleTimeString() },
        { type: 'output', text: '> react-app@0.0.0 dev', time: new Date().toLocaleTimeString() },
        { type: 'output', text: '> tsx server.ts', time: new Date().toLocaleTimeString() },
        { type: 'success', text: '⚡ [ForgeAI Dev Server] Ready on http://localhost:3000', time: new Date().toLocaleTimeString() },
        { type: 'output', text: '➜ Local:   http://localhost:3000/', time: new Date().toLocaleTimeString() },
        { type: 'output', text: '➜ Network: use --host to expose', time: new Date().toLocaleTimeString() },
        { type: 'output', text: '✔ Vite v6.2.3 HMR proxy active & monitoring file updates.', time: new Date().toLocaleTimeString() }
      ]
    },
    {
      id: 'term-test',
      name: 'test',
      status: 'idle',
      command: '',
      createdAt: new Date().toLocaleTimeString(),
      history: [
        { type: 'output', text: 'Terminal session #2 ready. Type "npm run test" or click preset buttons below.', time: new Date().toLocaleTimeString() }
      ]
    }
  ];

  const currentActiveId = activeSessionId && defaultSessions.some(s => s.id === activeSessionId)
    ? activeSessionId
    : defaultSessions[0].id;

  const [inputVal, setInputVal] = useState('');
  const logContainerRef = useRef<HTMLDivElement>(null);

  const activeSession = defaultSessions.find(s => s.id === currentActiveId) || defaultSessions[0];

  // Auto scroll to bottom when lines update
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [activeSession?.history?.length, currentActiveId]);

  const updateSessionState = (sessionId: string, updater: (session: TerminalSession) => TerminalSession) => {
    const nextSessions = defaultSessions.map(s => s.id === sessionId ? updater(s) : s);
    onUpdateSessions(nextSessions, currentActiveId);
  };

  const handleAddSession = (customName?: string) => {
    const name = customName || `bash-${defaultSessions.length + 1}`;
    const newSession: TerminalSession = {
      id: `term-${Date.now()}`,
      name,
      status: 'idle',
      command: '',
      createdAt: new Date().toLocaleTimeString(),
      history: [
        { type: 'output', text: `Terminal session "${name}" initialized. Ready for concurrent execution.`, time: new Date().toLocaleTimeString() }
      ]
    };
    const next = [...defaultSessions, newSession];
    onUpdateSessions(next, newSession.id);
  };

  const handleCloseSession = (e: React.MouseEvent, idToClose: string) => {
    e.stopPropagation();
    if (defaultSessions.length <= 1) return; // Keep at least one
    const filtered = defaultSessions.filter(s => s.id !== idToClose);
    const nextActive = currentActiveId === idToClose ? filtered[0].id : currentActiveId;
    onUpdateSessions(filtered, nextActive);
  };

  const handleRunCommandInSession = (sessionId: string, rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    const time = new Date().toLocaleTimeString();
    const cmdLine: TerminalLine = { type: 'command', text: `$ ${cmd}`, time };

    if (cmd.toLowerCase() === 'clear') {
      updateSessionState(sessionId, s => ({ ...s, history: [] }));
      return;
    }

    // Process presets
    if (cmd === 'npm run dev' || cmd === 'npm start') {
      const devLogs: TerminalLine[] = [
        cmdLine,
        { type: 'output', text: `> ${cmd}`, time },
        { type: 'output', text: '> tsx server.ts', time },
        { type: 'success', text: '⚡ [ForgeAI Dev Server] Re-booted on http://localhost:3000', time },
        { type: 'output', text: '➜ Express API middleware active: /api/chat, /api/image, /api/tts, /api/3d', time },
        { type: 'output', text: '✔ Monitoring file changes in background...', time }
      ];
      updateSessionState(sessionId, s => ({
        ...s,
        status: 'running',
        command: cmd,
        history: [...s.history, ...devLogs]
      }));
      return;
    }

    if (cmd === 'npm run test' || cmd === 'npm test') {
      const testLogsStart: TerminalLine[] = [
        cmdLine,
        { type: 'output', text: '> react-app@0.0.0 test', time },
        { type: 'output', text: '> vitest run --passWithNoTests', time },
        { type: 'output', text: ' RUN  v2.1.8 /workspace', time }
      ];
      updateSessionState(sessionId, s => ({
        ...s,
        status: 'running',
        command: cmd,
        history: [...s.history, ...testLogsStart]
      }));

      // Simulate async test completion
      setTimeout(() => {
        const testLogsEnd: TerminalLine[] = [
          { type: 'success', text: ' ✓ src/lib/aiRouter.test.ts (4 tests passed)', time: new Date().toLocaleTimeString() },
          { type: 'success', text: ' ✓ src/lib/supabase.test.ts (2 tests passed)', time: new Date().toLocaleTimeString() },
          { type: 'success', text: ' ✓ src/components/Editor.test.ts (6 tests passed)', time: new Date().toLocaleTimeString() },
          { type: 'output', text: ' Test Files  3 passed (3)', time: new Date().toLocaleTimeString() },
          { type: 'output', text: '      Tests  12 passed (12)', time: new Date().toLocaleTimeString() },
          { type: 'success', text: '✨ All unit tests passed successfully in 1.24s!', time: new Date().toLocaleTimeString() }
        ];
        updateSessionState(sessionId, s => ({
          ...s,
          status: 'completed',
          history: [...s.history, ...testLogsEnd]
        }));
      }, 1200);
      return;
    }

    if (cmd === 'npm run build' || cmd === 'npm run lint') {
      const buildStart: TerminalLine[] = [
        cmdLine,
        { type: 'output', text: `> ${cmd}`, time },
        { type: 'output', text: 'tsc --noEmit && vite build', time }
      ];
      updateSessionState(sessionId, s => ({
        ...s,
        status: 'running',
        command: cmd,
        history: [...s.history, ...buildStart]
      }));

      setTimeout(() => {
        const buildEnd: TerminalLine[] = [
          { type: 'output', text: 'vite v6.2.3 building for production...', time: new Date().toLocaleTimeString() },
          { type: 'output', text: 'dist/index.html                     0.84 kB │ gzip:  0.42 kB', time: new Date().toLocaleTimeString() },
          { type: 'output', text: 'dist/assets/index-Dk8z9.js        1,280 kB │ gzip: 340.2 kB', time: new Date().toLocaleTimeString() },
          { type: 'success', text: '✓ built in 2.89s. Output saved to /dist.', time: new Date().toLocaleTimeString() }
        ];
        updateSessionState(sessionId, s => ({
          ...s,
          status: 'completed',
          history: [...s.history, ...buildEnd]
        }));
      }, 1500);
      return;
    }

    // Default command handler
    let outputText = `Executed: ${cmd}`;
    if (cmd === 'help') {
      outputText = 'Available commands: npm run dev, npm run test, npm run build, clear, status, env, ls';
    } else if (cmd === 'ls') {
      outputText = 'src/  public/  server.ts  package.json  vite.config.ts  .env.example';
    } else if (cmd === 'env' || cmd === 'status') {
      outputText = 'ENV: NODE_ENV=development | PORT=3000 | Concurrent Sessions: ' + defaultSessions.length;
    }

    const genericLogs: TerminalLine[] = [
      cmdLine,
      { type: 'output', text: outputText, time }
    ];

    updateSessionState(sessionId, s => ({
      ...s,
      history: [...s.history, ...genericLogs]
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRunCommandInSession(currentActiveId, inputVal);
    setInputVal('');
  };

  const handleKillSession = (sessionId: string) => {
    const time = new Date().toLocaleTimeString();
    updateSessionState(sessionId, s => ({
      ...s,
      status: 'idle',
      history: [...s.history, { type: 'error', text: 'Process SIGINT received. Session stopped.', time }]
    }));
  };

  const handleClearSession = (sessionId: string) => {
    updateSessionState(sessionId, s => ({ ...s, history: [] }));
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 font-mono text-xs border-t border-slate-800/80 rounded-b-lg overflow-hidden">
      {/* Session Tab Bar */}
      <div className="flex items-center justify-between bg-slate-900/90 px-2 pt-1 border-b border-slate-800 shrink-0 overflow-x-auto select-none">
        <div className="flex items-center space-x-1">
          {defaultSessions.map(session => {
            const isActive = session.id === currentActiveId;
            return (
              <button
                key={session.id}
                onClick={() => onUpdateSessions(defaultSessions, session.id)}
                className={`group flex items-center space-x-2 px-3 py-1.5 rounded-t-md text-[11px] border-t border-x transition cursor-pointer ${
                  isActive
                    ? 'bg-slate-950 border-slate-800 text-teal-300 font-semibold shadow-sm'
                    : 'bg-slate-900/40 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Terminal className={`h-3 w-3 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                <span className="truncate max-w-[100px]">{session.name}</span>
                {session.status === 'running' && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
                {defaultSessions.length > 1 && (
                  <span
                    onClick={(e) => handleCloseSession(e, session.id)}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded transition"
                    title="Close Terminal Session"
                  >
                    <X className="h-3 w-3" />
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={() => handleAddSession()}
            className="flex items-center space-x-1 px-2 py-1.5 text-slate-400 hover:text-teal-300 hover:bg-slate-800/50 rounded-t-md transition text-[11px]"
            title="Create New Concurrent Terminal Session"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Session</span>
          </button>
        </div>

        {/* Quick Command Launchers */}
        <div className="flex items-center space-x-1.5 py-1 pr-2">
          <button
            onClick={() => handleRunCommandInSession(currentActiveId, 'npm run dev')}
            className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold flex items-center space-x-1 transition"
            title="Run Dev Server"
          >
            <Play className="h-2.5 w-2.5 fill-emerald-400" />
            <span>npm run dev</span>
          </button>

          <button
            onClick={() => handleRunCommandInSession(currentActiveId, 'npm run test')}
            className="px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[10px] font-bold flex items-center space-x-1 transition"
            title="Run Vitest Suite"
          >
            <ShieldCheck className="h-2.5 w-2.5" />
            <span>npm run test</span>
          </button>

          {activeSession.status === 'running' && (
            <button
              onClick={() => handleKillSession(currentActiveId)}
              className="px-2 py-0.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-[10px] font-bold flex items-center space-x-1 transition"
              title="Stop running process"
            >
              <Square className="h-2.5 w-2.5 fill-rose-400" />
              <span>Kill</span>
            </button>
          )}

          <button
            onClick={() => handleClearSession(currentActiveId)}
            className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded transition"
            title="Clear Terminal Output"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Terminal Output Stream */}
      <div
        ref={logContainerRef}
        className="flex-1 p-3 overflow-y-auto space-y-1 font-mono text-[11px] leading-relaxed selection:bg-teal-500/30"
      >
        {activeSession.history.length === 0 ? (
          <div className="text-slate-600 italic py-4 text-center">
            Session "{activeSession.name}" ready. Type a command below or click a preset button above.
          </div>
        ) : (
          activeSession.history.map((line, idx) => {
            let textColor = 'text-slate-300';
            if (line.type === 'command') textColor = 'text-teal-300 font-semibold';
            if (line.type === 'error') textColor = 'text-rose-400';
            if (line.type === 'success') textColor = 'text-emerald-400 font-medium';

            return (
              <div key={idx} className={`flex items-start space-x-2 ${textColor} hover:bg-slate-900/50 px-1 py-0.5 rounded`}>
                <span className="text-[10px] text-slate-600 shrink-0 select-none font-sans mt-0.5">{line.time || ''}</span>
                <span className="whitespace-pre-wrap break-all flex-1">{line.text}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Terminal Input Prompt */}
      <form onSubmit={handleFormSubmit} className="border-t border-slate-800/80 px-3 py-1.5 bg-slate-900/60 flex items-center space-x-2 shrink-0">
        <span className="text-teal-400 font-bold select-none">{activeSession.name} $</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={`Type command for session '${activeSession.name}' (e.g. npm run test, help, clear)...`}
          className="flex-1 bg-transparent border-none outline-none text-slate-200 text-[11px] font-mono placeholder:text-slate-600"
        />
        <button
          type="submit"
          className="px-2.5 py-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded text-[10px] font-bold transition"
        >
          Run
        </button>
      </form>
    </div>
  );
}
