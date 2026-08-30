import React, { useState, useEffect } from "react";
import { 
  HelpCircle, ShieldAlert, Mail, MessageSquare, AlertCircle, 
  Trash2, Sparkles, Send, CheckCircle2, RefreshCw, Layers, LifeBuoy
} from "lucide-react";
import { supabase } from "../lib/supabase";

interface HelpViewProps {
  userEmail: string;
  isGuest: boolean;
  getRemainingUsage: (feature: 'chats' | 'codeGen' | 'imageGen' | 'model3D' | 'analysis' | 'debugRequests') => number;
  getMaxLimit: (feature: 'chats' | 'codeGen' | 'imageGen' | 'model3D' | 'analysis' | 'debugRequests') => number;
  addNotification: (text: string, type: 'info' | 'success' | 'warning') => void;
}

interface Complaint {
  id: string;
  email: string;
  category: string;
  message: string;
  timestamp: string;
}

export default function HelpView({
  userEmail,
  isGuest,
  getRemainingUsage,
  getMaxLimit,
  addNotification
}: HelpViewProps) {
  const [category, setCategory] = useState("Bug Report");
  const [complaintText, setComplaintText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Real-time usage analytics state
  const [usageData, setUsageData] = useState<Record<string, { used: number; max: number; percentage: number }>>({});
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Admin complaints view state
  const isAdminUser = userEmail === "gtbstudio369@gmail.com" || userEmail === "gamerhypixel24@gmail.com";
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(false);

  // Real-time usage analytics update
  const updateUsageAnalytics = () => {
    const features: ('chats' | 'codeGen' | 'imageGen' | 'model3D' | 'analysis')[] = [
      'chats', 'codeGen', 'imageGen', 'model3D', 'analysis'
    ];
    
    const newUsageData: Record<string, { used: number; max: number; percentage: number }> = {};
    
    features.forEach((feat) => {
      const max = getMaxLimit(feat);
      const remaining = getRemainingUsage(feat);
      const used = Math.max(0, max - remaining);
      const percentage = max > 0 ? (used / max) * 100 : 0;
      
      newUsageData[feat] = { used, max, percentage };
    });
    
    setUsageData(newUsageData);
    setLastUpdated(new Date());
  };

  // Auto-refresh usage analytics every 30 seconds
  useEffect(() => {
    updateUsageAnalytics(); // Initial update
    
    const interval = setInterval(() => {
      updateUsageAnalytics();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [getRemainingUsage, getMaxLimit]);

  // Load complaints for admin accounts
  const fetchComplaints = async () => {
    if (!isAdminUser) return;
    setIsLoadingComplaints(true);
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      const list: Complaint[] = (data || []).map((item: any) => ({
        id: item.id,
        email: item.email || "Anonymous",
        category: item.category || "General",
        message: item.message || "",
        timestamp: item.timestamp || new Date().toISOString()
      }));
      setComplaints(list);
    } catch (err: any) {
      console.error("Error loading complaints:", err);
      addNotification("Failed to retrieve complaints database.", "warning");
    } finally {
      setIsLoadingComplaints(false);
    }
  };

  useEffect(() => {
    if (isAdminUser) {
      fetchComplaints();
    }
  }, [isAdminUser]);

  // Submit new feedback/complaint
  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) {
      addNotification("Please enter details about your issue or suggestion.", "warning");
      return;
    }

    if (complaintText.trim().length < 15) {
      addNotification("Please provide a more detailed description (minimum 15 characters).", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('complaints')
        .insert({
          email: userEmail || "guest_sandbox",
          category,
          message: complaintText.trim(),
          timestamp: new Date().toISOString()
        });
      
      if (error) throw error;

      addNotification("Complaint submitted successfully. Our engineering team is reviewing.", "success");
      setComplaintText("");
      
      // Refresh admin list if user is admin
      if (isAdminUser) {
        fetchComplaints();
      }
    } catch (err: any) {
      console.error("Supabase submit complaint error:", err);
      addNotification("Submission failed. Trying offline local persistence.", "warning");
      
      // Local fallback representation
      const localComplaints = JSON.parse(localStorage.getItem("forgeai_local_complaints") || "[]");
      localComplaints.push({
        id: `complaint_${Date.now()}`,
        email: userEmail || "guest_sandbox",
        category,
        message: complaintText.trim(),
        timestamp: new Date().toISOString()
      });
      localStorage.setItem("forgeai_local_complaints", JSON.stringify(localComplaints));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin delete complaint
  const handleDeleteComplaint = async (id: string) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      addNotification("Complaint deleted permanently from database.", "success");
      setComplaints(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      console.error("Supabase delete error:", err);
      addNotification("Could not delete record.", "warning");
    }
  };

  // Calculate usage percentages
  const features: ('chats' | 'codeGen' | 'imageGen' | 'model3D' | 'analysis')[] = [
    'chats', 'codeGen', 'imageGen', 'model3D', 'analysis'
  ];

  const featureLabels = {
    chats: "Conversational Chats",
    codeGen: "Workspace Compilation & Coding",
    imageGen: "Visual Engine Synthesis",
    model3D: "WebGL 3D Meshes Generation",
    analysis: "Multimodal Video/Audio Understanding"
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-slate-950 font-sans text-slate-100 max-w-5xl mx-auto w-full">
      
      {/* Header section */}
      <div className="flex items-center space-x-3.5 border-b border-slate-900 pb-5">
        <div className="p-3 bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-2xl shadow-lg shadow-teal-500/10">
          <LifeBuoy className="h-6 w-6 text-slate-950" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Help & Support</h1>
          <p className="text-xs text-slate-500">View sandbox allocations, report problems, and propose features.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left column: Limitations & Quotas */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <ShieldAlert className="h-4 w-4 text-teal-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Free Plan Sandbox Limitations</h2>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Your virtual environment is run on serverless cloud containers. High-inference actions have standard daily quota limits. Let's inspect your current exact sandbox runtime usage details:
            </p>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 pb-1">
              <span className="font-mono text-[10px]">Real-time Analytics</span>
              <span className="font-mono text-[10px] text-teal-400">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {features.map((feat) => {
                const data = usageData[feat] || { used: 0, max: 0, percentage: 0 };
                const { used, max, percentage } = data;
                
                return (
                  <div key={feat} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-300">{featureLabels[feat]}</span>
                      <span className="font-mono text-teal-400">{used} / {max} runs</span>
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentage >= 90 
                            ? "bg-gradient-to-r from-red-500 to-pink-500" 
                            : percentage >= 60 
                              ? "bg-gradient-to-r from-yellow-500 to-amber-400" 
                              : "bg-gradient-to-r from-teal-500 to-emerald-400"
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Account type and limits info */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">Account Type</span>
                <span className={`font-mono font-bold ${isGuest ? 'text-amber-400' : 'text-teal-400'}`}>
                  {isGuest ? 'GUEST (40 chats/day)' : 'NORMAL (80 chats/day)'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2">
                <span className="font-semibold text-slate-400">Project AI Limit</span>
                <span className="font-mono text-teal-400">50 queries per project</span>
              </div>
            </div>
          </div>

          {/* Guidelines on What to input (Guide to avoid spamming) */}
          <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl space-y-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-teal-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Help Guidelines & Anti-Spam Safeguard</h3>
            </div>
            <div className="text-xs text-slate-400 space-y-2.5 leading-relaxed">
              <p>
                To provide the highest-tier cloud compilers, we screen all feedback, complaints, and requests rigorously. To ensure your request receives fast action and to avoid spam-filter blocking, please stick to the following instructions:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400 font-mono text-[10px]">
                <li><strong className="text-slate-300">Features Proposal:</strong> Name the technology or library explicitly, and outline the specific utility (e.g. "Add PixiJS for faster canvas 2D layers").</li>
                <li><strong className="text-slate-300">Problems Faced:</strong> Write the exact steps to recreate the issue, with terminal outputs or linter errors if applicable.</li>
                <li><strong className="text-slate-300">Spam Avoidance:</strong> Avoid entering repeated single words, emojis, or nonsense characters. Submitting empty complaints or vulgar text will result in instant sandbox container termination.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right column: Submit complaint form & Contact details */}
        <div className="space-y-6">
          
          {/* Contact Details box */}
          <div className="p-5 bg-gradient-to-b from-slate-900/50 to-slate-950 border border-slate-900 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Mail className="h-3.5 w-3.5 text-teal-400" />
              <span>Contact Details</span>
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Facing complex workspace compilation failures or need developer partnerships? Contact us:
            </p>
            <div className="space-y-2 font-mono text-[10px] text-slate-500 pt-1">
              <div className="flex items-center space-x-2">
                <span className="text-teal-400">Email:</span>
                <span className="text-slate-300">gtbstudio369@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-teal-400">Support:</span>
                <span className="text-slate-300">gamerhypixel24@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-teal-400">Instance:</span>
                <span className="text-slate-400">ForgeAI Dev Hub</span>
              </div>
            </div>
          </div>

          {/* Feedback/Complaint form */}
          <div className="p-5 bg-slate-900/40 border border-slate-900 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-teal-400" />
              <span>Submit Feedback</span>
            </h3>
            
            <form onSubmit={handleSubmitComplaint} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500/50 transition"
                >
                  <option value="Bug Report">🐛 Bug / Compilation Error</option>
                  <option value="Storage Quota Increase">💾 Storage Quota Increase (1.0 GB Reached)</option>
                  <option value="Feature Proposal">💡 Feature Suggestion</option>
                  <option value="Suggestion">⚡ Experience Improvement</option>
                  <option value="Spam / Other">❓ Other Query</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase">Message Details</label>
                <textarea 
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  rows={4}
                  placeholder="Describe what occurred, step-by-step..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-teal-500/50 transition resize-none placeholder-slate-600"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !complaintText.trim()}
                className="w-full py-2 px-4 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-bold uppercase rounded-xl tracking-wider transition duration-200 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Send to Engineering</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* ADMIN COMPLAINTS INBOX */}
      {isAdminUser && (
        <div id="admin-complaints-box" className="p-6 bg-slate-900/30 border border-teal-500/20 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-1 bg-teal-500/10 rounded-lg text-teal-400">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Incoming Complaints Inbox</h3>
                <p className="text-[10px] text-slate-500">Live feed of submitted customer issues and features.</p>
              </div>
            </div>
            
            <button 
              onClick={fetchComplaints}
              disabled={isLoadingComplaints}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              title="Refresh inbox"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingComplaints ? 'animate-spin text-teal-400' : ''}`} />
            </button>
          </div>

          {isLoadingComplaints ? (
            <div className="py-10 text-center text-xs text-slate-500 font-mono">
              Loading security complaint registries...
            </div>
          ) : complaints.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500 font-mono bg-slate-950/40 rounded-xl border border-slate-900">
              📭 Inbox clean. No complaints registered.
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
              {complaints.map((c) => (
                <div 
                  key={c.id} 
                  className="p-4 bg-slate-950/80 border border-slate-900 rounded-xl relative group hover:border-slate-800 transition duration-200"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9px] font-mono text-slate-400 font-bold uppercase">
                          {c.category}
                        </span>
                        <span className="text-[10px] font-mono text-teal-400 font-semibold">
                          @{c.email}
                        </span>
                        <span className="text-[9px] text-slate-600 font-mono">
                          {new Date(c.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium whitespace-pre-wrap leading-relaxed pt-1.5">
                        {c.message}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteComplaint(c.id)}
                      className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition duration-200 cursor-pointer"
                      title="Delete complaint permanent"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* GTB Studio Credits */}
      <div className="p-6 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 border border-teal-500/20 rounded-2xl space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-850 pb-3">
          <Sparkles className="h-4 w-4 text-teal-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">GTB Studio Team</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-teal-400 uppercase font-mono">Owners</div>
            <div className="text-xs text-white font-semibold">Muhammed Thariq P.S</div>
            <div className="text-xs text-white font-semibold">Sreehari K.M</div>
          </div>
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-purple-400 uppercase font-mono">Developers</div>
            <div className="text-xs text-white font-semibold">Azhar</div>
            <div className="text-xs text-white font-semibold">Thariq</div>
          </div>
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-cyan-400 uppercase font-mono">UI/FX</div>
            <div className="text-xs text-white font-semibold">Sreehari K.M</div>
          </div>
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-emerald-400 uppercase font-mono">Founders</div>
            <div className="text-xs text-white font-semibold">Thariq</div>
            <div className="text-xs text-white font-semibold">Azhar</div>
          </div>
        </div>
      </div>

    </div>
  );
}
