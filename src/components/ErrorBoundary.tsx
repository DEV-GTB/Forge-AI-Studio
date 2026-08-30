import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RefreshCw, Copy, Terminal, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error, 
      errorInfo: null, 
      showDetails: false 
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an exception:", error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    // Attempt local state resets or simple page reloads
    localStorage.removeItem("forgeai_last_error");
    window.location.reload();
  };

  private handleCopyError = () => {
    if (this.state.error) {
      const errorText = `${this.state.error.name}: ${this.state.error.message}\n\nStack Trace:\n${this.state.error.stack || ''}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack || ''}`;
      navigator.clipboard.writeText(errorText);
      alert("Error trace copied to clipboard!");
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-red-500/30 selection:text-red-300">
          
          {/* Neon warning grid backdrop */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none"></div>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full filter blur-[120px] pointer-events-none"></div>

          <div className="w-full max-w-2xl bg-slate-900/60 border border-red-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-xl space-y-6">
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left pb-4 border-b border-slate-800">
              <div className="h-12 w-12 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-400 shrink-0">
                <AlertOctagon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest block">FATAL CORE EXCEPTION</span>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                  Application Runtime Interrupted
                </h1>
                <p className="text-slate-400 text-xs">
                  An unexpected React component level exception occurred in the sandbox frame.
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-2">
              <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider">Exception Payload</span>
              <p className="text-red-400 font-mono text-xs font-bold leading-normal break-words">
                {this.state.error?.name || "Error"}: {this.state.error?.message || "Unknown runtime exception caught."}
              </p>
            </div>

            {/* Collapsible stack details */}
            <div className="space-y-2">
              <button
                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400 hover:text-white transition cursor-pointer"
              >
                <Terminal className="h-3.5 w-3.5 text-teal-500" />
                <span>{this.state.showDetails ? "Hide Stack Trace" : "Show Diagnostic Stack Trace"}</span>
                {this.state.showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>

              {this.state.showDetails && (
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl text-[10px] font-mono text-slate-400 overflow-x-auto max-h-[220px] scrollbar-thin whitespace-pre leading-relaxed">
                  <p className="text-slate-300 font-bold mb-2">Stack Trace:</p>
                  {this.state.error?.stack || "No call stack trace is available."}
                  
                  {this.state.errorInfo?.componentStack && (
                    <>
                      <p className="text-slate-300 font-bold mt-4 mb-2">Component Stack Tree:</p>
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Recovery actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 px-5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-95 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/10 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4 animate-spin-slow" />
                <span>Reload Application Frame</span>
              </button>

              <button
                onClick={this.handleCopyError}
                className="py-3 px-5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Copy className="h-4 w-4" />
                <span>Copy Diagnostic Logs</span>
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
