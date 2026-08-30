import React, { useState, useMemo, useRef } from "react";
import { 
  Scale, Shield, ShieldCheck, HelpCircle, Search, FileText, 
  Terminal, ArrowRight, ExternalLink, AlertTriangle, CheckCircle2, 
  Bug, Sparkles, BookOpen, Cpu, Layers, Video, MessageSquare, 
  Key, RefreshCw, Info, X, ChevronRight, Laptop, PlayCircle,
  Plus, Send, AlertCircle, Copy, Check, Upload, Clock, Radio, 
  Activity, Globe, ShieldAlert, Heart, Mail
} from "lucide-react";

interface TrustCenterViewProps {
  onBackToDashboard?: () => void;
  initialTab?: "terms" | "privacy" | "security" | "support";
  addNotification?: (text: string, type: 'success' | 'warning' | 'info') => void;
  userEmail?: string;
}

export default function TrustCenterView({ 
  onBackToDashboard, 
  initialTab = "support", 
  addNotification,
  userEmail = "tutug3736@gmail.com"
}: TrustCenterViewProps) {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy" | "security" | "support">(initialTab);
  const [supportSearch, setSupportSearch] = useState("");
  
  // Local notification fallback to ensure robustness
  const triggerNotification = (text: string, type: 'success' | 'warning' | 'info') => {
    if (addNotification) {
      addNotification(text, type);
    } else {
      alert(`[${type.toUpperCase()}] ${text}`);
    }
  };

  // Bug Form State
  const [bugTitle, setBugTitle] = useState("");
  const [bugDesc, setBugDesc] = useState("");
  const [bugSteps, setBugSteps] = useState("");
  const [bugCategory, setBugCategory] = useState("AI Chat");
  const [bugBrowser, setBugBrowser] = useState("Google Chrome");
  const [bugOS, setBugOS] = useState("Windows 11");
  const [bugScreenshot, setBugScreenshot] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Feature Suggestion State
  const [featureTitle, setFeatureTitle] = useState("");
  const [featureDesc, setFeatureDesc] = useState("");
  const [featureCategory, setFeatureCategory] = useState("AI Model");
  const [featureSuggestions, setFeatureSuggestions] = useState([
    { id: "feat1", title: "Integrate Forge AI Ultra-Deep Reasoning Mode", desc: "Allow running deep reasoning chains directly for complex architecture plans.", category: "AI Model", votes: 42 },
    { id: "feat2", title: "Native C# compiler sandbox", desc: "Support compiling Unity or Godot scripts inside browser-isolated partitions.", category: "Workspace IDE", votes: 29 },
    { id: "feat3", title: "Websocket collaborative terminal", desc: "Allow real-time terminal sync between shared workspace participants.", category: "Language/Libraries", votes: 55 },
    { id: "feat4", title: "Custom SVG Asset generator", desc: "Forging layered vector graphic assets directly saved inside assets/.", category: "UI Improvements", votes: 18 },
  ]);

  // System Status Switcher (for interactive playground feel)
  const [systemStatus, setSystemStatus] = useState<"operational" | "disruption">("operational");

  // Help articles database for interactive search
  const helpArticles = useMemo(() => [
    { id: "art1", title: "Create your first project", category: "Getting Started", tags: ["project", "create", "new", "workspace"], desc: "Step-by-step guide on creating websites, retro games, and server APIs using built-in presets." },
    { id: "art2", title: "How AI Workspaces function", category: "AI Chat", tags: ["ai", "prompt", "ide", "autogen"], desc: "Understand how the virtual file structure is processed and compiled inside browser-isolated memory partitions." },
    { id: "art3", title: "Managing chat history", category: "AI Chat", tags: ["history", "delete", "rename", "archive"], desc: "Organize, rename, pin, and restore previous conversational streams with the generative companion." },
    { id: "art4", title: "Exporting projects as ZIP", category: "Creating Projects", tags: ["export", "zip", "download", "local"], desc: "Download full structural project files including virtual layouts, stylesheets, and scripts for local editing." },
    { id: "art5", title: "Generating eye-safe images", category: "Image Generation", tags: ["image", "aspect", "vector", "art"], desc: "Leverage standard prompts to forge logos, backgrounds, or gameplay sprites automatically sorted in assets/." },
    { id: "art6", title: "Sharing workspaces safely", category: "Workspace Guide", tags: ["share", "preview", "publish", "url"], desc: "How to publish live development URLs to invite testers, verify layouts, and test animations." },
    { id: "art7", title: "Using templates and blueprints", category: "Getting Started", tags: ["templates", "lesson", "blueprint", "presets"], desc: "Deploy pre-configured sandboxes like Discord Bots, Minecraft Plugins, and orthographic 3D models." },
    { id: "art8", title: "Keyboard shortcuts cheatsheet", category: "Workspace Guide", tags: ["shortcuts", "hotkeys", "palette", "keys"], desc: "Master the command palette and canvas controls with quick desktop hotkey commands." },
    { id: "art9", title: "Recovering deleted projects", category: "Account Settings", tags: ["recovery", "deleted", "restore", "backups"], desc: "Revert or snapshot sandbox history to restore lost code snippets or generated meshes." },
    { id: "art10", title: "Managing assets folder structure", category: "Creating Projects", tags: ["assets", "images", "3D", "mesh"], desc: "Organize and bind generated image assets or compiled Wavefront OBJ files inside active codes." },
    { id: "art11", title: "Resolving billing and payment", category: "Billing", tags: ["payment", "stripe", "subscription", "price"], desc: "Details on Stripe billing cycles, premium models access, and invoices download procedures." },
    { id: "art12", title: "Restoring accounts with passkeys", category: "Login Issues", tags: ["passkey", "password", "reset", "login"], desc: "Step-by-step setup for login credentials recovery, password resets, and MFA activation steps." }
  ], []);

  const filteredArticles = useMemo(() => {
    if (!supportSearch) return helpArticles;
    const query = supportSearch.toLowerCase();
    return helpArticles.filter(art => 
      art.title.toLowerCase().includes(query) ||
      art.desc.toLowerCase().includes(query) ||
      art.category.toLowerCase().includes(query) ||
      art.tags.some(t => t.includes(query))
    );
  }, [supportSearch, helpArticles]);

  // Frequently Asked Questions database (18 entries)
  const faqs = useMemo(() => [
    { q: "How do I get started with Forge AI?", a: "Welcome! Simply click 'Get Started' to create a new sandbox workspace. You can choose from preconfigured templates like Retro Games, full-stack websites, or custom AI integrations to quickly run live code." },
    { q: "How does the AI Chat companion assist with coding?", a: "The integrated AI companion can write entire files, debug compiler warnings, explain complex logic, and optimize stylesheets. It directly injects code modifications into your active workspace folder structure." },
    { q: "What is the difference between Guest and Registered accounts?", a: "Guests can create up to 3 sandbox projects stored strictly in their browser's local state. Registered users get unlimited projects, persistent cloud storage backup, higher AI model limits, and shared collaboration hubs." },
    { q: "Is my workspace code kept private and secure?", a: "Yes, absolutely. All project files, generated vectors, and chat prompts are completely private to your account. We enforce HTTPS encryption, and we never sell your data or use your sandbox codes to train public models." },
    { q: "How do daily usage quotas and limits refresh?", a: "Free plan sandboxes have standard daily limits (e.g. 80 chats, 50 code generations, 20 graphics syntheses) to maintain secure server balance. These quotas fully reset every day at 00:00 UTC." },
    { q: "Can I export my project to run locally or host elsewhere?", a: "Yes! Click the 'Export project as ZIP' in your workspace header to instantly download a complete standalone package of your HTML, CSS, JS, and asset files. It can be run on any local environment." },
    { q: "How do I generate custom images or visual assets?", a: "Open the Generative Media Lab or enter a graphic prompt in the AI chat specifying you need a logo, illustration, or background. Forge AI automatically compiles the bitmap and stores it directly in your project's `/assets` folder." },
    { q: "What is the WebGL 3D Mesh generator?", a: "Forge AI has a built-in 3D renderer. You can prompt the AI companion to create a 3D Wavefront OBJ mesh (e.g., 'low-poly vehicle'), and inspect, rotate, or wireframe it dynamically inside the 3D canvas tab." },
    { q: "How do I debug syntax or compilation errors?", a: "Our integrated system features a continuous background linter. Any unclosed brackets, missing imports, or syntax failures are highlighted instantly in the 'Problems' tab at the footer of your editor." },
    { q: "Can I connect my own custom API keys?", a: "Yes. In the Settings tab, you can input your private Forge AI keys, Stripe tokens, or other SDK secrets. These are loaded locally and securely kept hidden from external scripts." },
    { q: "How does real-time collaboration work in the Live Hub?", a: "Navigate to the Co-Dev Live Hub tab and copy your active session sync token. Share it with a colleague to allow them to securely read, write, and compile code in real time." },
    { q: "Is payment processing secure on Forge AI?", a: "Yes. All subscription billing and transaction processes are handled by fully compliant payment merchants (like Stripe) using HTTPS and encrypted handshakes. We do not store plain-text payment information." },
    { q: "What frontend and backend languages are supported?", a: "Our sandboxes natively compile React 18, TypeScript, Tailwind CSS utility layers, HTML5 standards, Node.js scripts, Lucide-react icons, Recharts visualization suites, and basic Express server routers." },
    { q: "How do I reset my account password?", a: "In the login screen, select 'Login Issues', submit your registered email, and a secure time-limited reset token link will be dispatched to verify your identity and update credentials." },
    { q: "What browsers and operating systems are recommended?", a: "For optimal WebGL rendering, keyboard shortcuts mapping, and layout fluidity, we recommend modern desktop browsers like Chrome, Brave, or Safari running on Windows, macOS, or Linux systems." },
    { q: "How does the workspace crash containment shield work?", a: "If your React code triggers a fatal runtime render exception, our global ErrorBoundary intercepts the crash, blocks white-screens, and displays a diagnostic Recovery console to reload safely." },
    { q: "Can I request new templates or suggest features?", a: "Absolutely! We love creator ideas. Head to the Support Helpdesk, type your suggestion into our Feature Proposal board, and upvote existing submissions from other developers." },
    { q: "Who do I contact for enterprise licensing or custom domains?", a: "For corporate plans with custom memory allocations, dedicated server ingress, and unlimited high-reasoning model tokens, reach our engineering team directly at support@forgeai.dev." }
  ], []);

  // Screenshot File Selector and Drag handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      triggerNotification("Please select an image file as a screenshot.", "warning");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setBugScreenshot(event.target?.result as string);
      triggerNotification(`Screenshot uploaded successfully: ${file.name}`, "success");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Submit Bug Form
  const handleBugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugTitle.trim() || !bugDesc.trim()) {
      triggerNotification("Please complete the bug title and description.", "warning");
      return;
    }
    triggerNotification(`Bug report "${bugTitle}" registered in compiler diagnostics queue.`, "success");
    setBugTitle("");
    setBugDesc("");
    setBugSteps("");
    setBugScreenshot(null);
  };

  // Submit Feature Proposal
  const handleFeatureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureTitle.trim()) {
      triggerNotification("Please enter a feature proposal title.", "warning");
      return;
    }
    const newProposal = {
      id: `feat_${Date.now()}`,
      title: featureTitle.trim(),
      desc: featureDesc.trim() || "No detailed description provided by creator.",
      category: featureCategory,
      votes: 1
    };
    setFeatureSuggestions(prev => [newProposal, ...prev]);
    triggerNotification(`Feature idea posted successfully: "${featureTitle}"`, "success");
    setFeatureTitle("");
    setFeatureDesc("");
  };

  const handleUpvoteFeature = (id: string, title: string) => {
    setFeatureSuggestions(prev => prev.map(f => f.id === id ? { ...f, votes: f.votes + 1 } : f));
    triggerNotification(`Upvoted feature request: "${title}"`, "success");
  };

  return (
    <div id="trust-center-viewport" className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-y-auto min-h-screen font-sans select-text selection:bg-teal-500/20 selection:text-teal-300">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900/50 to-slate-950 border-b border-slate-900 px-6 py-12 sm:px-10 text-center space-y-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-500/5 via-slate-950/0 to-slate-950/0 pointer-events-none" />
        
        {/* Back navigation button if applicable */}
        {onBackToDashboard && (
          <button 
            onClick={onBackToDashboard}
            className="absolute left-4 top-4 px-3.5 py-1.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            <span>Back to Dashboard</span>
          </button>
        )}

        <div className="inline-flex items-center space-x-2 bg-teal-500/10 border border-teal-500/20 px-3.5 py-1 rounded-full text-[10px] font-mono uppercase text-teal-400 tracking-wider">
          <ShieldCheck className="h-3 w-3 animate-pulse" />
          <span>ForgeAI Trust Center & Safety Portal</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-2xl mx-auto">
          Security, Legal & Support Hub
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Review our structured terms of service, strict data protection charts, HTTPS encryption parameters, or query our detailed Frequently Asked Questions.
        </p>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4 max-w-xl mx-auto">
          {[
            { id: "support", name: "Support Helpdesk", icon: <HelpCircle className="h-3.5 w-3.5" /> },
            { id: "terms", name: "Terms of Service", icon: <Scale className="h-3.5 w-3.5" /> },
            { id: "privacy", name: "Privacy Policy", icon: <Shield className="h-3.5 w-3.5" /> },
            { id: "security", name: "Security Compliance", icon: <ShieldCheck className="h-3.5 w-3.5" /> }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSupportSearch("");
                }}
                className={`px-4 py-2.5 rounded-xl flex items-center space-x-2 text-xs font-semibold border transition duration-200 cursor-pointer ${
                  isActive 
                    ? "bg-teal-500 text-slate-950 border-teal-400 shadow-lg shadow-teal-500/15 font-bold" 
                    : "bg-slate-900/40 border-slate-900 text-slate-400 hover:text-white hover:border-slate-800"
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-12 space-y-12">
        
        {/* ======================================= */}
        {/* TAB 1: SUPPORT HELPDESK                  */}
        {/* ======================================= */}
        {activeTab === "support" && (
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* Search and System Status section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Search bar & Popular Topics */}
              <div className="lg:col-span-2 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-bold text-white tracking-tight">What can we help you with?</h2>
                    <p className="text-xs text-slate-400 leading-normal">Search our guides, shortcuts database, or filter popular developer topics.</p>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input 
                      type="text"
                      placeholder="Type keywords (e.g. create project, 3DOBJ, account settings)..."
                      value={supportSearch}
                      onChange={(e) => setSupportSearch(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-850 focus:border-teal-500/50 rounded-2xl outline-none text-xs font-mono text-white placeholder-slate-600 transition"
                    />
                    {supportSearch && (
                      <button 
                        onClick={() => setSupportSearch("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <span className="block text-[10px] font-mono uppercase text-slate-500 tracking-wider">Popular Topics</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Getting Started", "Creating Projects", "AI Chat", "Image Generation", 
                      "Account Settings", "Billing (Stripe)", "Login Issues", "Password Reset", 
                      "Workspace Guide", "API Questions", "Bug Reports", "Contact Support"
                    ].map((topic) => (
                      <button
                        key={topic}
                        onClick={() => {
                          setSupportSearch(topic);
                          triggerNotification(`Filtering help articles for topic: "${topic}"`, "info");
                        }}
                        className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 rounded-lg text-[10px] text-slate-400 hover:text-white transition cursor-pointer"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status and Response Times */}
              <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="block text-[10px] font-mono uppercase text-slate-500 tracking-wider">System Live Feed</span>
                  
                  {/* System Status Display */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-300 font-semibold">Active Status</span>
                      <button 
                        onClick={() => {
                          setSystemStatus(prev => prev === "operational" ? "disruption" : "operational");
                          triggerNotification("System operational feed toggled for demonstration.", "info");
                        }}
                        className="text-[9px] font-mono text-slate-500 hover:text-white underline cursor-pointer"
                      >
                        Mock toggle
                      </button>
                    </div>

                    {systemStatus === "operational" ? (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center space-x-2.5 text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold font-mono tracking-wide uppercase">🟢 All Systems Operational</span>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center space-x-2.5 text-amber-400">
                        <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-xs font-bold font-mono tracking-wide uppercase">🟠 Partial Service Disruption</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Response Times block */}
                <div className="space-y-3.5 border-t border-slate-900 pt-4 text-xs">
                  <span className="block text-[10px] font-mono uppercase text-slate-500 tracking-wider">Guaranteed Response Times</span>
                  <div className="space-y-2 font-mono">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>General Questions</span>
                      <span className="text-teal-400 font-bold bg-teal-500/5 px-1.5 py-0.5 rounded border border-teal-500/10">Within 24 hours</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Technical Issues</span>
                      <span className="text-teal-400 font-bold bg-teal-500/5 px-1.5 py-0.5 rounded border border-teal-500/10">Within 24–48 hours</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Critical Issues</span>
                      <span className="text-rose-400 font-bold bg-rose-500/5 px-1.5 py-0.5 rounded border border-rose-500/10">As soon as possible</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Dynamic Help Search Results */}
            {supportSearch && (
              <div className="space-y-4 animate-in slide-in-from-top-1 duration-200">
                <h3 className="text-xs font-mono uppercase text-slate-500 flex items-center space-x-2">
                  <Activity className="h-3.5 w-3.5" />
                  <span>Search Results for "{supportSearch}" ({filteredArticles.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredArticles.map((art) => (
                    <div 
                      key={art.id}
                      className="p-4 bg-slate-900/20 border border-slate-900 hover:border-teal-500/10 rounded-2xl space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono text-teal-400 font-bold bg-teal-500/5 px-2 py-0.5 rounded border border-teal-500/10 uppercase">
                          {art.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-200">{art.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-mono">{art.desc}</p>
                      </div>
                      <button 
                        onClick={() => triggerNotification(`Loading help article: "${art.title}"`, "info")}
                        className="text-[10px] text-teal-400 font-mono hover:underline flex items-center space-x-1 pt-1.5 w-fit cursor-pointer"
                      >
                        <span>View Guide</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {filteredArticles.length === 0 && (
                    <div className="col-span-full py-8 text-center text-xs text-slate-500 font-mono bg-slate-900/10 rounded-2xl border border-slate-900">
                      No matching topics found. Try typing another term like "Billing" or "AI Chat".
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact channels with simulated links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl space-y-2 text-center sm:text-left">
                <Mail className="h-5 w-5 text-teal-400 mx-auto sm:mx-0" />
                <h4 className="text-xs font-bold text-white">Email Support</h4>
                <p className="text-[11px] text-slate-400 leading-normal">Get help from real developers atgtbstudio369@gmail.com and gamerhypixel24@gmail.com.</p>
                <div className="pt-2">
                  <a 
                    href="mailto:gtbstudio369@gmail.com?subject=Forge%20AI%20Support%20Request"
                    className="text-[10px] font-mono text-teal-400 font-bold hover:underline"
                  >
                    Compose Email →
                  </a>
                </div>
              </div>

              <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl space-y-2 text-center sm:text-left relative overflow-hidden">
                <span className="absolute top-3 right-3 text-[9px] font-mono font-bold text-purple-400 bg-purple-500/5 px-2 py-0.5 rounded border border-purple-500/10">COMING SOON</span>
                <MessageSquare className="h-5 w-5 text-purple-400 mx-auto sm:mx-0 opacity-80" />
                <h4 className="text-xs font-bold text-white opacity-80">Live Chat</h4>
                <p className="text-[11px] text-slate-500 leading-normal opacity-80">Chat directly with a developer live inside your sandbox workspace for debugging.</p>
                <div className="pt-2">
                  <span className="text-[10px] font-mono text-slate-600 font-bold select-none">Unavailable on Free plan</span>
                </div>
              </div>

              <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl space-y-2 text-center sm:text-left relative overflow-hidden">
                <span className="absolute top-3 right-3 text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10">COMING SOON</span>
                <Globe className="h-5 w-5 text-cyan-400 mx-auto sm:mx-0 opacity-80" />
                <h4 className="text-xs font-bold text-white opacity-80">Community Forum</h4>
                <p className="text-[11px] text-slate-500 leading-normal opacity-80">Share codes, templates, retros, and learn visual design loops with other creators.</p>
                <div className="pt-2">
                  <span className="text-[10px] font-mono text-slate-600 font-bold select-none">Launches Q4 2026</span>
                </div>
              </div>
            </div>

            {/* Interactive Forms: Bug Reporter & Feature proposals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Report a Bug Form (supporting screenshot upload) */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <div className="flex items-center space-x-2">
                    <Bug className="h-4.5 w-4.5 text-rose-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Report a System Bug</h3>
                  </div>
                  <span className="text-[9px] font-mono text-rose-400 bg-rose-500/5 border border-rose-500/10 px-2 py-0.5 rounded">
                    Engine Diagnostics
                  </span>
                </div>

                <form onSubmit={handleBugSubmit} className="space-y-4 font-mono text-xs">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-500 text-[10px] font-bold">BUG TITLE</label>
                      <input 
                        type="text"
                        placeholder="E.g. 3D mesh fails to rotate"
                        value={bugTitle}
                        onChange={(e) => setBugTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-slate-200 outline-none focus:border-rose-500/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 text-[10px] font-bold">AFFECTED REGION</label>
                      <select 
                        value={bugCategory}
                        onChange={(e) => setBugCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-slate-300 outline-none focus:border-rose-500/50"
                      >
                        <option value="AI Chat">AI Chat Companion</option>
                        <option value="IDE Editor">Code Studio Editor</option>
                        <option value="3D WebGL">3D WebGL Mesh Viewer</option>
                        <option value="Media Lab">Generative Media Lab</option>
                        <option value="Terminal">Simulated Server Terminal</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 text-[10px] font-bold">BUG DESCRIPTION</label>
                    <textarea 
                      placeholder="Explain exactly what happened, and how to trigger the exception."
                      rows={3}
                      value={bugDesc}
                      onChange={(e) => setBugDesc(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-slate-200 outline-none focus:border-rose-500/50 resize-none"
                    />
                  </div>

                  {/* Browser & OS select inputs (User specified in prompt) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-500 text-[10px] font-bold">BROWSER IN USE</label>
                      <select 
                        value={bugBrowser}
                        onChange={(e) => setBugBrowser(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-slate-300 outline-none focus:border-rose-500/50"
                      >
                        <option value="Google Chrome">Google Chrome</option>
                        <option value="Mozilla Firefox">Mozilla Firefox</option>
                        <option value="Apple Safari">Apple Safari</option>
                        <option value="Microsoft Edge">Microsoft Edge</option>
                        <option value="Brave Browser">Brave Browser</option>
                        <option value="Other">Other Browser</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 text-[10px] font-bold">OPERATING SYSTEM</label>
                      <select 
                        value={bugOS}
                        onChange={(e) => setBugOS(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-slate-300 outline-none focus:border-rose-500/50"
                      >
                        <option value="Windows 11">Windows 11</option>
                        <option value="Windows 10">Windows 10</option>
                        <option value="macOS Sequoia">macOS Sequoia</option>
                        <option value="macOS Sonoma">macOS Sonoma</option>
                        <option value="Linux Ubuntu">Linux Ubuntu/Debian</option>
                        <option value="Android Mobile">Android Mobile OS</option>
                        <option value="Apple iOS">Apple iOS (iPhone/iPad)</option>
                        <option value="Other">Other OS</option>
                      </select>
                    </div>
                  </div>

                  {/* Drag-and-Drop Screenshot Upload (User specified) */}
                  <div className="space-y-2">
                    <label className="text-slate-500 text-[10px] font-bold uppercase">Screenshot Upload</label>
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition ${
                        isDragging 
                          ? "border-rose-500/60 bg-rose-500/5 text-rose-300" 
                          : bugScreenshot 
                            ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-300" 
                            : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      
                      {bugScreenshot ? (
                        <div className="space-y-2 flex flex-col items-center">
                          <img src={bugScreenshot} className="h-16 w-32 object-cover rounded-lg border border-slate-800 shadow-lg" alt="Screenshot uploaded" />
                          <span className="text-[10px] text-emerald-400 font-mono font-bold">✓ Screenshot Attached. Click to replace.</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5 py-2">
                          <Upload className="h-5 w-5 mx-auto text-slate-500" />
                          <div className="text-[11px] font-bold">Drag & Drop screenshot here</div>
                          <p className="text-[9px] text-slate-500">or click to browse local files (PNG, JPG up to 5MB)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center space-x-1"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit Diagnostic Bug Report</span>
                  </button>

                </form>
              </div>

              {/* Feature Request suggestions with active upvoting */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4.5 w-4.5 text-teal-400" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Feature Suggestion Box</h3>
                    </div>
                    <span className="text-[9px] font-mono text-teal-400 bg-teal-500/5 border border-teal-500/10 px-2 py-0.5 rounded">
                      Community Upvotes
                    </span>
                  </div>

                  <p className="text-[11px] font-mono text-slate-400 leading-normal">
                    Submit creative proposals or upvote existing ideas to influence our strategic strategic roadmap directly!
                  </p>

                  <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                    {featureSuggestions.map((feat) => (
                      <div 
                        key={feat.id}
                        className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between gap-4 font-mono text-[11px]"
                      >
                        <div className="truncate space-y-0.5">
                          <span className="text-[8px] text-teal-400 font-bold bg-teal-500/5 border border-teal-500/10 px-1.5 py-0.2 rounded uppercase">{feat.category}</span>
                          <span className="block text-slate-200 font-bold truncate mt-0.5">{feat.title}</span>
                          <span className="text-[9px] text-slate-500 block truncate leading-relaxed">{feat.desc}</span>
                        </div>
                        <button 
                          onClick={() => handleUpvoteFeature(feat.id, feat.title)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-teal-500 hover:text-slate-950 border border-slate-800 text-[10px] text-teal-400 font-bold rounded-lg transition shrink-0 flex items-center space-x-1 cursor-pointer"
                        >
                          <span>▲ {feat.votes}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proposal Submission form */}
                <form onSubmit={handleFeatureSubmit} className="pt-4 border-t border-slate-850 space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-slate-500 text-[9px] font-bold">PROPOSAL TITLE</label>
                      <input 
                        type="text"
                        placeholder="E.g. PixiJS support in sandbox"
                        value={featureTitle}
                        onChange={(e) => setFeatureTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-200 outline-none focus:border-teal-500/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 text-[9px] font-bold">CATEGORY</label>
                      <select 
                        value={featureCategory}
                        onChange={(e) => setFeatureCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-xl text-slate-400 outline-none focus:border-teal-500/50"
                      >
                        <option value="AI Model">AI Model</option>
                        <option value="Workspace IDE">Workspace IDE</option>
                        <option value="Language/Libraries">Languages</option>
                        <option value="UI Improvements">UI Upgrade</option>
                        <option value="Custom Assets">Custom Assets</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 text-[9px] font-bold">DETAILED ADVANTAGE EXPLAINER</label>
                    <input 
                      type="text"
                      placeholder="Why is this feature valuable for you and the sandbox community?"
                      value={featureDesc}
                      onChange={(e) => setFeatureDesc(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300 outline-none focus:border-teal-500/50"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition duration-200"
                  >
                    Post New Feature Idea
                  </button>
                </form>
              </div>

            </div>

            {/* Frequently Asked Questions Accordion List (15-20 entries required) */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2 uppercase tracking-wider">
                <HelpCircle className="h-4.5 w-4.5 text-teal-400" />
                <span>Frequently Asked Questions ({faqs.length})</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {faqs.map((faq, idx) => (
                  <details 
                    key={idx}
                    className="group bg-slate-900/30 border border-slate-900 rounded-2xl p-4.5 cursor-pointer [&_summary::-webkit-details-marker]:hidden transition duration-200"
                  >
                    <summary className="flex items-center justify-between text-xs font-bold text-slate-200 select-none">
                      <span className="pr-4 leading-normal hover:text-teal-400 transition">{faq.q}</span>
                      <span className="transition-transform duration-200 group-open:rotate-180 text-teal-400 text-lg leading-none shrink-0">↓</span>
                    </summary>
                    <p className="mt-3 text-[11px] text-slate-400 leading-relaxed font-mono border-t border-slate-850/50 pt-3">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ======================================= */}
        {/* TAB 2: TERMS OF SERVICE                 */}
        {/* ======================================= */}
        {activeTab === "terms" && (
          <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto leading-relaxed">
            
            <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Scale className="h-4.5 w-4.5 text-teal-400" />
                  <span>Terms of Service Agreement</span>
                </h2>
                <p className="text-xs text-slate-400 leading-normal">These Terms govern the rules and specifications for using the Forge AI application services.</p>
              </div>
              <div className="text-[10px] font-mono text-slate-500 text-right shrink-0">
                <div>Last Updated: July 2026</div>
                <div>Compliance Code: TOS-v2.1</div>
              </div>
            </div>

            <div className="space-y-6 text-slate-300 text-xs sm:text-sm">
              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-teal-400">1. Acceptance of Terms</h3>
                <p>
                  By registering an account, invoking compiler threads, deploying virtual test channels, or utilizing the AI chat generators on Forge AI, you explicitly agree to be bound by these terms. If you disagree with any section, you must terminate your usage immediately.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-teal-400">2. Eligibility</h3>
                <p>
                  Forge AI is designed for software developers, designers, and learning creators. The minimum age requirement to register or maintain an active account is 13+ years of age (or 18+ depending on the laws of your specific region or jurisdiction). Underage students must have parental consent before accessing high-inference AI modules.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-teal-400">3. User Accounts & Safety</h3>
                <p>
                  You are solely responsible for keeping your credentials and tokens secure. You must not share passwords or delegate account control. Forge AI isn't liable for security breaches arising from local key leaks, password sharing, or compromised browser storage parameters.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-teal-400">4. Acceptable Use Guidelines</h3>
                <p>
                  To protect our cloud compute partitions and verify secure compiler workflows, users must strictly adhere to our usage policies. Prohibited activities on Forge AI include:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-4 bg-emerald-950/15 border border-emerald-900/35 rounded-2xl text-emerald-400 text-xs space-y-1">
                    <span className="font-extrabold block uppercase tracking-wider mb-1">✔ COMPLIANT USE CASES</span>
                    <ul className="list-disc pl-4 space-y-1 leading-normal font-mono text-[11px]">
                      <li>Personal prototyping & visual mockups</li>
                      <li>Client projects & static app publishing</li>
                      <li>Interactive gaming engine compilations</li>
                      <li>Academic sandbox coding & logic teaching</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-rose-950/15 border border-rose-900/35 rounded-2xl text-rose-400 text-xs space-y-1">
                    <span className="font-extrabold block uppercase tracking-wider mb-1">❌ FORBIDDEN ACTIVITIES</span>
                    <ul className="list-disc pl-4 space-y-1 leading-normal font-mono text-[11px]">
                      <li>No illegal activities or phishing hooks</li>
                      <li>No malware creation or executable exploits</li>
                      <li>No spam email dispatch loops</li>
                      <li>No copyright infringement or code theft</li>
                      <li>No abuse or overload of platform APIs</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-teal-400">5. AI Generated Content Notice</h3>
                <p>
                  Forge AI acts as a mediator providing smart auto-generative assistance. Due to current language model boundaries, AI responses may contain semantic mistakes, logic omissions, or syntax warnings. Creators are fully responsible for checking, refining, and verifying all critical information prior to compiling or distributing codes.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-teal-400">6. Intellectual Property & Ownership</h3>
                <p>
                  Forge AI owns all platform branding elements, core IDE layouts, graphic architectures, and compile container layers. However, you own all the files, assets, mesh lists, and text materials that you actively create inside your workspaces. Forge AI claims zero rights or ownership parameters over user- authored designs unless otherwise stated.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-teal-400">7. Service Availability & Patches</h3>
                <p>
                  We strive to preserve 99.9% uptime across all compilation grids. However, service parameters, model integrations, and workspace features may change, undergo temporary disruption, or be suspended during routine patch deployments.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-teal-400">8. Account Suspension & Termination</h3>
                <p>
                  Accounts violating acceptable use guidelines, abusing API quotas, or conducting malicious scans of server ingress channels may be immediately suspended or terminated permanently without prior notification.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-teal-400">9. Limitation of Liability</h3>
                <p className="font-mono text-slate-400 text-xs uppercase leading-relaxed">
                  FORGE AI AND ITS DIRECT DEVELOPERS IS NOT RESPONSIBLE FOR ANY INDIRECT LOSSES, COMPILER FAILURES, SYSTEM DISRUPTIONS, CORRUPTED ASSETS, OR MISSING DATABASE ENTRIES ARISEN FROM INCORRECT AI OUTPUTS OR DOWNSTREAM EXECUTABLE RUNS.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-teal-400">10. Terms Updates</h3>
                <p>
                  To secure compliance with evolving digital safety protocols, these Terms may be updated over time. We will publish notifications in your active workspace dashboard whenever major revisions occur.
                </p>
              </section>
            </div>

          </div>
        )}

        {/* ======================================= */}
        {/* TAB 3: PRIVACY POLICY                   */}
        {/* ======================================= */}
        {activeTab === "privacy" && (
          <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto leading-relaxed">
            
            <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Shield className="h-4.5 w-4.5 text-teal-400" />
                  <span>Privacy & Data Protection Policy</span>
                </h2>
                <p className="text-xs text-slate-400 leading-normal">Explains exactly what information is collected, what is not collected, and how we handle data.</p>
              </div>
              <div className="text-[10px] font-mono text-slate-500 text-right shrink-0">
                <div>Last Updated: July 2026</div>
                <div>Compliance Code: PRIV-v2.3</div>
              </div>
            </div>

            <div className="space-y-6 text-slate-300 text-xs sm:text-sm">
              
              {/* Collected and Not Collected Side-by-side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-900/40 border border-slate-900 rounded-2xl space-y-2">
                  <span className="text-teal-400 font-bold font-mono text-xs block uppercase">1. Information Collected</span>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-400 leading-normal font-mono">
                    <li>Email address</li>
                    <li>Username and nickname handle</li>
                    <li>Profile picture (optional avatar file)</li>
                    <li>Account preference configurations</li>
                    <li>Usage analytics & compile statistics</li>
                    <li>Project metadata (tab selections, file sizes)</li>
                  </ul>
                </div>

                <div className="p-5 bg-slate-900/40 border border-slate-900 rounded-2xl space-y-2">
                  <span className="text-rose-400 font-bold font-mono text-xs block uppercase">2. Information NOT Collected</span>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-400 leading-normal font-mono">
                    <li>Passwords in plain text (always hashed)</li>
                    <li>Payment card credentials (managed via Stripe)</li>
                    <li>Personal files unless explicitly uploaded</li>
                    <li>Microphone/camera streams unless enabled</li>
                  </ul>
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-teal-400">3. How Data Is Used</h3>
                <p>
                  All parameters logged during active sessions are utilized strictly to operate, secure, and personalize our sandboxes:
                </p>
                <ul className="list-disc pl-5 space-y-1 font-mono text-xs text-slate-400">
                  <li>Improve AI responses and refine linter code recommendations</li>
                  <li>Save projects to Firestore and synchronize files across browsers</li>
                  <li>Personalize the experience (persisting custom layout colors & themes)</li>
                  <li>Maintain security & scan incoming terminal requests for script injections</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-teal-400">4. Cookie Policy</h3>
                <p>
                  Forge AI places standard functional cookies in browser directories. These cookies exist exclusively for:
                </p>
                <ul className="list-disc pl-5 space-y-1 font-mono text-xs text-slate-400">
                  <li><strong className="text-slate-300">Authentication:</strong> Keeping you securely signed in during active sessions</li>
                  <li><strong className="text-slate-300">Preferences:</strong> Saving custom editor preferences like font sizes & tab modes</li>
                  <li><strong className="text-slate-300">Performance:</strong> Tracking workspace render speed scores to optimize lag</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-teal-400">5. Data Sharing</h3>
                <p>
                  We enforce an absolute rule: <strong className="text-slate-200">Your personal data is never sold.</strong> We share basic prompt or log packets strictly when necessary with required cloud infrastructure partners (such as Firebase or the Forge AI Router Engine) to run the workspace smoothly.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-teal-400">6. Data Security</h3>
                <p>
                  To shield our creators, we incorporate comprehensive data safety parameters across our hosting systems:
                </p>
                <ul className="list-disc pl-5 space-y-1 font-mono text-xs text-slate-400">
                  <li><strong className="text-slate-300">Encryption:</strong> All files are encrypted with AES-256 at rest and TLS 1.3 in transit</li>
                  <li><strong className="text-slate-300">Secure Servers:</strong> Cloud storage blocks are hosted on Google Cloud servers</li>
                  <li><strong className="text-slate-300">Access Controls:</strong> Fine-grained token scopes separate tenant database keys</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-teal-400">7. User Rights</h3>
                <p>
                  As the sole owner of your workspace contents, you hold full legal authority over your parameters, enabling you to:
                </p>
                <ul className="list-disc pl-5 space-y-1 font-mono text-xs text-slate-400">
                  <li>Download account data (ZIP raw archive files directly from editor)</li>
                  <li>Delete account (permanent purge of all workspace documents from our servers)</li>
                  <li>Change profile information (update email, passwords, name, and preferences)</li>
                </ul>
              </section>

              <section className="space-y-1.5 pt-4 border-t border-slate-900 font-mono text-xs">
                <p className="text-slate-500">For privacy compliance audits, contact our Privacy team:</p>
                <span className="font-bold text-teal-400">privacy@forgeai.dev</span>
              </section>

            </div>

          </div>
        )}

        {/* ======================================= */}
        {/* TAB 4: SECURITY COMPLIANCE               */}
        {/* ======================================= */}
        {activeTab === "security" && (
          <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto leading-relaxed">
            
            {/* Audited status header */}
            <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-teal-400" />
                  <span>Security & Compliance Framework</span>
                </h2>
                <p className="text-xs text-slate-400">Explains our structural procedures to protect your software code sandbox assets.</p>
              </div>

              {/* Simple Security Status (User specified in prompt) */}
              <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-2xl shrink-0 space-y-1.5 text-xs font-mono font-bold w-full md:w-auto">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 border-b border-slate-900 pb-1.5">SECURITY STATUS</div>
                <div className="flex items-center space-x-1.5 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>✅ Authentication Protected</span>
                </div>
                <div className="flex items-center space-x-1.5 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>✅ Encrypted Connections</span>
                </div>
                <div className="flex items-center space-x-1.5 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>✅ Regular Security Updates</span>
                </div>
                <div className="flex items-center space-x-1.5 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>✅ Secure Infrastructure</span>
                </div>
              </div>
            </div>

            {/* Structured details of security measures */}
            <div className="space-y-6 text-slate-300 text-xs sm:text-sm">
              <p>
                Forge AI is built on security-first cloud computing architectures. We apply extensive automated safeguards to prevent cyberthreat actions, data leaks, and linter crashes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl space-y-1.5">
                  <span className="text-white font-bold font-mono text-xs block uppercase tracking-wider">🔒 HTTPS Encryption & TLS</span>
                  <p className="text-xs text-slate-400 font-mono leading-normal">
                    All requests inside your sandbox are funneled through TLS 1.3 encryption tunnels. This blocks packet sniffs and man-in-the-middle exploits.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl space-y-1.5">
                  <span className="text-white font-bold font-mono text-xs block uppercase tracking-wider">🔑 Secure Authentication</span>
                  <p className="text-xs text-slate-400 font-mono leading-normal">
                    Active sessions utilize secure tokens with automatic timeouts. Integrations support single sign-on (SSO) secure handshakes.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl space-y-1.5">
                  <span className="text-white font-bold font-mono text-xs block uppercase tracking-wider">🛡 Password Hashing</span>
                  <p className="text-xs text-slate-400 font-mono leading-normal">
                    Plain-text passwords never touch our databases. We apply salted multi-pass cryptographic hashing blocks (bcrypt algorithm).
                  </p>
                </div>

                <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl space-y-1.5">
                  <span className="text-white font-bold font-mono text-xs block uppercase tracking-wider">🗄 Encrypted Data Storage</span>
                  <p className="text-xs text-slate-400 font-mono leading-normal">
                    Workspace assets and configuration logs are encrypted with AES-256 standard keys, managed dynamically on Google Cloud Platform.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl space-y-1.5">
                  <span className="text-white font-bold font-mono text-xs block uppercase tracking-wider">👥 Role-Based Permissions</span>
                  <p className="text-xs text-slate-400 font-mono leading-normal">
                    Fine-grained Firebase Firestore rules isolate tenant records. No user can read or edit another creator's workspace data.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl space-y-1.5">
                  <span className="text-white font-bold font-mono text-xs block uppercase tracking-wider">📊 Continuous Monitoring</span>
                  <p className="text-xs text-slate-400 font-mono leading-normal">
                    Our platform tracks API request bursts, anomalous server accesses, and linter syntax leaks to coordinate real-time defense.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl space-y-1.5">
                  <span className="text-white font-bold font-mono text-xs block uppercase tracking-wider">🔄 Backup Procedures</span>
                  <p className="text-xs text-slate-400 font-mono leading-normal">
                    We maintain incremental daily cloud backups of all registered sandboxes to secure your files against hardware disk crashes.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl space-y-1.5">
                  <span className="text-white font-bold font-mono text-xs block uppercase tracking-wider">🤖 AI Safety Protections</span>
                  <p className="text-xs text-slate-400 font-mono leading-normal">
                    Generative models undergo continuous safety filters to shield creators from malicious code injections or harmful vector outputs.
                  </p>
                </div>
              </div>

              {/* Responsible reporting details */}
              <div className="p-5 bg-teal-950/15 border border-teal-900/35 rounded-2xl space-y-2">
                <span className="text-teal-400 font-bold font-mono text-xs block uppercase tracking-wider">Responsible Vulnerability Disclosure</span>
                <p className="text-xs text-slate-400 font-mono leading-relaxed">
                  We encourage white-hat researchers to report safety anomalies or compiler leaks responsibly. If you discover a vulnerability, email our team at <span className="text-teal-400 font-bold">security@forgeai.dev</span>. We coordinate patches immediately.
                </p>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Trust Center site-wide footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 text-slate-500 text-xs font-mono p-6 sm:p-10 select-none">
        <div className="max-w-6xl w-full mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <span className="block text-[10px] uppercase font-bold text-slate-300">TRUST CENTER</span>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={() => { setActiveTab("terms"); window.scrollTo({top:0, behavior:'smooth'}); }} className="hover:text-teal-400 transition cursor-pointer">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab("privacy"); window.scrollTo({top:0, behavior:'smooth'}); }} className="hover:text-teal-400 transition cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab("security"); window.scrollTo({top:0, behavior:'smooth'}); }} className="hover:text-teal-400 transition cursor-pointer">
                  Security & Compliance
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab("support"); window.scrollTo({top:0, behavior:'smooth'}); }} className="hover:text-teal-400 transition cursor-pointer">
                  Support Helpdesk
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="block text-[10px] uppercase font-bold text-slate-300">PRODUCT LINKS</span>
            <ul className="space-y-1.5 text-[11px]">
              <li className="hover:text-teal-400 transition cursor-pointer" onClick={() => triggerNotification("Redirecting to Workspace Editor...", "info")}>About Forge AI</li>
              <li className="hover:text-teal-400 transition cursor-pointer" onClick={() => triggerNotification("Opening visual features guide...", "info")}>Features</li>
              <li className="hover:text-teal-400 transition cursor-pointer" onClick={() => triggerNotification("Loading compiler documentation...", "info")}>Documentation</li>
              <li className="hover:text-teal-400 transition cursor-pointer" onClick={() => triggerNotification("Opening platform release notes...", "info")}>Release Notes</li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="block text-[10px] uppercase font-bold text-slate-300">RESOURCES</span>
            <ul className="space-y-1.5 text-[11px]">
              <li className="hover:text-teal-400 transition cursor-pointer" onClick={() => triggerNotification("AI Safety protocols loaded.", "info")}>AI Safety</li>
              <li className="hover:text-teal-400 transition cursor-pointer" onClick={() => triggerNotification("Responsible AI guidelines loaded.", "info")}>Responsible AI</li>
              <li className="hover:text-teal-400 transition cursor-pointer" onClick={() => triggerNotification("Careers portal loaded. We are hiring developers!", "info")}>Careers (Coming Soon)</li>
              <li className="hover:text-teal-400 transition cursor-pointer" onClick={() => triggerNotification("Contact us portal available at support@forgeai.dev", "info")}>Contact Us</li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="block text-[10px] uppercase font-bold text-slate-300">OTHER GUIDES</span>
            <ul className="space-y-1.5 text-[11px]">
              <li className="hover:text-teal-400 transition cursor-pointer" onClick={() => triggerNotification("Opening interactive feedback board...", "info")}>Feedback</li>
              <li className="hover:text-teal-400 transition cursor-pointer" onClick={() => triggerNotification("Opening platform roadmap...", "info")}>Roadmap</li>
              <li className="hover:text-teal-400 transition cursor-pointer" onClick={() => triggerNotification("Ctrl + Shift + P: Toggle Palette", "info")}>Keyboard Shortcuts</li>
              <li className="hover:text-teal-400 transition cursor-pointer" onClick={() => triggerNotification("Enabling screen readers optimization...", "info")}>Accessibility</li>
            </ul>
          </div>

        </div>

        {/* Brand Copyright Notice (User specified in prompt) */}
        <div className="max-w-6xl w-full mx-auto border-t border-slate-900 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-[10px] text-slate-600 gap-4">
          <span className="text-slate-500 max-w-xl text-center md:text-left leading-relaxed">
            © 2026 ForgeAI Technologies Inc. All rights reserved. Forge AI and its associated logos are trademarks of ForgeAI Technologies Inc. Unauthorized reproduction or redistribution of any part of this platform is prohibited.
          </span>
          <div className="flex space-x-4 shrink-0">
            <span className="hover:text-teal-400 transition cursor-pointer" onClick={() => { setActiveTab("privacy"); triggerNotification("Cookie policy loaded.", "info"); }}>Cookie Policy</span>
            <span className="hover:text-teal-400 transition cursor-pointer" onClick={() => triggerNotification("Open source licenses: MIT & Apache 2.0.", "info")}>Open Source Licenses</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
