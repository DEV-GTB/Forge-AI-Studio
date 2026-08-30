import React, { useState } from "react";
import { 
  Compass, Layout, Gamepad, Bot, Code, Terminal, Box, Play, 
  Search, Check, Plus, ArrowRight, FolderOpen, ChevronRight, FileCode
} from "lucide-react";
import { PROJECT_TEMPLATES } from "../templates";

interface TemplatesViewProps {
  onCreateProjectFromTemplate: (name: string, description: string, type: string, files: Record<string, string>) => void;
  addNotification: (text: string, type: 'info' | 'success' | 'warning') => void;
}

const CATEGORIES = [
  { id: "all", name: "All Blueprints" },
  { id: "Websites", name: "Websites" },
  { id: "Web Apps", name: "Web Apps" },
  { id: "React Apps", name: "React Apps" },
  { id: "Games", name: "Games" },
  { id: "Game Projects", name: "Game Projects" },
  { id: "Discord Bots", name: "Discord Bots" },
  { id: "Minecraft Plugins", name: "Minecraft Plugins" },
  { id: "Python Apps", name: "Python Apps" },
  { id: "API Servers", name: "API Servers" }
];

export default function TemplatesView({
  onCreateProjectFromTemplate,
  addNotification
}: TemplatesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Load custom templates from local storage
  const [customTemplates, setCustomTemplates] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("forgeai_custom_templates");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Combine official templates and custom user templates
  const allTemplates: Record<string, { name: string; description: string; type: string; files: Record<string, string>; isCustom?: boolean; id?: string }> = {
    ...PROJECT_TEMPLATES
  };

  customTemplates.forEach(tmpl => {
    allTemplates[tmpl.id] = {
      name: tmpl.name,
      description: tmpl.description,
      type: tmpl.type,
      files: tmpl.files,
      isCustom: true,
      id: tmpl.id
    };
  });

  // Parse template keys
  const templateKeys = Object.keys(allTemplates);
  
  const filteredKeys = templateKeys.filter(key => {
    const tmpl = allTemplates[key];
    const matchesSearch = tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tmpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === "all" || tmpl.type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeploy = (key: string) => {
    const tmpl = allTemplates[key];
    if (!tmpl) return;

    onCreateProjectFromTemplate(
      tmpl.name,
      tmpl.description,
      tmpl.type,
      tmpl.files
    );
    addNotification(`Successfully initialized workspace with "${tmpl.name}" blueprint.`, "success");
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "Websites":
        return <Layout className="h-4 w-4 text-teal-400" />;
      case "Games":
      case "Game Projects":
        return <Gamepad className="h-4 w-4 text-purple-400" />;
      case "Discord Bots":
        return <Bot className="h-4 w-4 text-blue-400" />;
      case "React Apps":
        return <Code className="h-4 w-4 text-cyan-400" />;
      case "API Servers":
        return <Terminal className="h-4 w-4 text-rose-400" />;
      case "Minecraft Plugins":
        return <Box className="h-4 w-4 text-emerald-400" />;
      default:
        return <Compass className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 sm:p-10 space-y-8 selection:bg-teal-500/30 selection:text-teal-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest block font-bold">TEMPLATE BLUEPRINTS</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Deploy Instant Sandboxes</h1>
          <p className="text-xs text-slate-400">Launch premium starter environments and let our AI engine expand them for you.</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search templates..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-850 focus:border-teal-500 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Categories Filter Bar */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1.5 scrollbar-none">
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setSelectedTemplateId(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                isActive 
                  ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/10" 
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-850"
              }`}>
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Main Grid split: Templates list and inspected file preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Templates Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredKeys.length === 0 ? (
            <div className="p-10 bg-slate-900/20 border border-slate-900 rounded-2xl text-center text-slate-500 text-xs col-span-2">
              No matching blueprints found. Refine your query or select another category above.
            </div>
          ) : (
            filteredKeys.map(key => {
              const tmpl = allTemplates[key];
              const fileCount = Object.keys(tmpl.files).length;
              const isSelected = selectedTemplateId === key;

              return (
                <div 
                  key={key}
                  onClick={() => setSelectedTemplateId(key)}
                  className={`p-5 bg-slate-900/40 hover:bg-slate-900 border rounded-2xl flex flex-col justify-between space-y-4 cursor-pointer transition group ${
                    isSelected ? "border-teal-500 bg-teal-950/5" : "border-slate-900 hover:border-slate-800"
                  }`}>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono uppercase bg-slate-950 border border-slate-850 text-slate-400 px-2 py-0.5 rounded flex items-center space-x-1">
                        {getCategoryIcon(tmpl.type)}
                        <span>{tmpl.type}</span>
                        {tmpl.isCustom && <span className="text-teal-400 font-extrabold ml-1 border-l border-slate-800 pl-1">★ USER</span>}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">{fileCount} files</span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-extrabold text-white group-hover:text-teal-400 transition">{tmpl.name}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{tmpl.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-950 text-[10px] font-mono">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500 hover:text-slate-300 transition">Inspect Files</span>
                      {tmpl.isCustom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const confirmDel = window.confirm(`Are you sure you want to delete your custom template "${tmpl.name}"?`);
                            if (confirmDel) {
                              const updated = customTemplates.filter(t => t.id !== tmpl.id);
                              setCustomTemplates(updated);
                              localStorage.setItem("forgeai_custom_templates", JSON.stringify(updated));
                              addNotification(`Deleted custom blueprint template "${tmpl.name}".`, "info");
                              if (selectedTemplateId === key) {
                                setSelectedTemplateId(null);
                              }
                            }
                          }}
                          className="text-red-400 hover:text-red-300 ml-2 transition hover:underline cursor-pointer">
                          Delete
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeploy(key); }}
                      className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-lg flex items-center space-x-1 transition shadow-lg shadow-teal-500/10 cursor-pointer">
                      <span>Deploy</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Right column: Inspected File Preview */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900/50 border border-slate-850 rounded-2xl p-5 space-y-4 sticky top-6">
            <div className="border-b border-slate-850 pb-3 flex items-center space-x-2">
              <FolderOpen className="h-4 w-4 text-teal-400" />
              <h3 className="text-xs sm:text-sm font-extrabold text-white">Blueprint Inspector</h3>
            </div>

            {selectedTemplateId ? (
              (() => {
                const tmpl = allTemplates[selectedTemplateId];
                const filePaths = Object.keys(tmpl.files);

                return (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-teal-300">{tmpl.name}</h4>
                      <p className="text-[11px] text-slate-400 leading-normal">{tmpl.description}</p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider block font-bold">DIRECTORY FILE TREE:</span>
                      <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-850 space-y-1 max-h-60 overflow-y-auto">
                        {filePaths.map(path => (
                          <div key={path} className="flex items-center space-x-2 text-[11px] text-slate-300 py-1 border-b border-slate-900/50 last:border-0 font-mono">
                            <FileCode className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">{path}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeploy(selectedTemplateId)}
                      className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-teal-500/15 cursor-pointer">
                      <span>Deploy Workspace Blueprint</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <Compass className="h-8 w-8 text-slate-600 mx-auto animate-pulse" />
                <p className="text-xs">Select any blueprint card on the left to inspect its file structures and configuration files before deploying.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
