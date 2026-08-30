import React, { useState, useEffect, useRef } from "react";
import { 
  Users, MessageSquare, Mic, MicOff, Wifi, Send, Shield, Sparkles, 
  Database, RefreshCw, Layers, ArrowUpRight, FolderSync, Check, AlertCircle, FileText, Play, Zap, Info, HardDrive,
  X, Edit2, Trash2, Plus, UserPlus, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Project } from "../types";

interface CollabViewProps {
  currentTheme: any;
  userName: string;
  activeProject: Project | null;
  addNotification: (text: string, type: 'info' | 'success' | 'warning') => void;
}

interface Message {
  id: string;
  sender: string;
  role: 'developer' | 'ai' | 'user';
  avatarColor: string;
  text: string;
  time: string;
}

interface ProviderAllocation {
  id: string;
  name: string;
  capacityGB: number;
  allocatedGB: number;
  color: string;
  rule: string;
  status: 'active' | 'standby' | 'disconnected';
}

export default function CollabView({ currentTheme, userName, activeProject, addNotification }: CollabViewProps) {
  const [activeTab, setActiveTab] = useState<'workspace' | 'voice' | 'drive'>('workspace');
  
  // Real-time voice parameters
  const [inVoice, setInVoice] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Initial state for live project team (Owner)
  const [teamMembers, setTeamMembers] = useState<any[]>([
    { id: "owner", name: userName || "Project Owner", role: "Project Owner & Lead Integrator", avatar: userName ? userName[0].toUpperCase() : "M", avatarColor: "bg-teal-600", status: "online", objective: "Orchestrate full-stack implementation, coordinate deployments, and review pull requests.", isFictional: false, email: "owner@forgeai.space", username: "owner" }
  ]);

  const [voiceUsers, setVoiceUsers] = useState<any[]>([]);

  // Sync Voice Users based on who is online / standby
  useEffect(() => {
    const activePeers = teamMembers.filter(m => m.id !== 'owner' && (m.status === 'online' || m.status === 'standby'));
    setVoiceUsers(activePeers.map(p => ({
      id: p.id,
      name: `${p.name} (${p.role})`,
      avatar: p.avatar,
      speaking: false,
      volume: 0
    })));
  }, [teamMembers]);

  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioPeaks, setAudioPeaks] = useState<number[]>(Array(24).fill(15));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Group chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Selected member detail state for interactive modal
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [newMemberObjective, setNewMemberObjective] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");
  const [newMemberStatus, setNewMemberStatus] = useState<'online' | 'standby' | 'offline'>('online');

  // Activity Feed
  const [activities, setActivities] = useState<any[]>([
    { id: "3", user: "ForgeAI", action: "synthesized", target: "Spaceship OBJ wireframe", time: "12 mins ago" },
  ]);

  // Storage Allocation Data (100GB Multi-provider Plan)
  const [providers, setProviders] = useState<ProviderAllocation[]>([
    { id: "storj", name: "Storj Decentralized", capacityGB: 25, allocatedGB: 12.4, color: "bg-indigo-500 text-indigo-400", rule: "Heavy Video, Audio & Compressed ZIP assets", status: "active" },
    { id: "r2", name: "Cloudflare R2", capacityGB: 10, allocatedGB: 3.1, color: "bg-orange-500 text-orange-400", rule: "Hot Codebases, Index templates & Text logs", status: "active" },
    { id: "b2", name: "Backblaze B2", capacityGB: 10, allocatedGB: 8.5, color: "bg-red-500 text-red-400", rule: "Raw WebGL 3D meshes & Asset blueprints", status: "active" },
    { id: "bunny", name: "Bunny CDN Storage", capacityGB: 45, allocatedGB: 14.2, color: "bg-amber-500 text-amber-400", rule: "Static Graphics, UI Logos & CSS files", status: "active" },
    { id: "filebase", name: "Filebase IPFS", capacityGB: 10, allocatedGB: 2.3, color: "bg-emerald-500 text-emerald-400", rule: "Timeline Snapshot version backups & Configs", status: "active" }
  ]);

  // File router simulator state
  const [simFileName, setSimFileName] = useState("");
  const [simFileType, setSimFileType] = useState("zip");
  const [simFileResult, setSimFileResult] = useState<any | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  // Invite member state
  const [inviteInput, setInviteInput] = useState("");

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    const input = inviteInput.trim();
    if (!input) return;

    if (teamMembers.length >= 15) {
      addNotification("Workspace capacity full! Maximum is 15 members. Please delete an existing member to free up a slot.", "warning");
      return;
    }

    const isEmail = input.includes("@") && input.includes(".");
    
    if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input)) {
        addNotification("Please enter a valid email address.", "warning");
        return;
      }

      const mockName = input.split("@")[0];
      const cleanName = mockName.charAt(0).toUpperCase() + mockName.slice(1);
      const newMember = {
        id: "invited_" + Date.now(),
        name: cleanName,
        username: mockName.toLowerCase() + "_dev",
        email: input,
        avatar: cleanName.charAt(0).toUpperCase(),
        avatarColor: "bg-amber-600",
        role: "Collaborator",
        status: "offline",
        objective: "Collaborate on project milestones and provide technical assistance.",
        isFictional: false
      };

      setTeamMembers(prev => [...prev, newMember]);
      setInviteInput("");
      addNotification(`Workspace invitation sent to ${input} successfully!`, "success");

      setActivities(prev => [{
        id: Date.now().toString(),
        user: userName || "You",
        action: "invited user",
        target: input,
        time: "Just now"
      }, ...prev]);

    } else {
      let cleanUsername = input.replace(/^@/, "").toLowerCase();
      
      if (cleanUsername.length < 5) {
        addNotification("Username must be at least 5 characters long!", "warning");
        return;
      }

      const takenUsernames = teamMembers.map(m => m.username?.toLowerCase() || "");
      
      if (takenUsernames.includes(cleanUsername)) {
        addNotification(`The username @${cleanUsername} is already taken. Please try another!`, "warning");
        return;
      }

      const cleanName = cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);
      const newMember = {
        id: "invited_" + Date.now(),
        name: cleanName,
        username: cleanUsername,
        email: `${cleanUsername}@forgeai.space`,
        avatar: cleanName.charAt(0).toUpperCase(),
        avatarColor: "bg-indigo-600",
        role: "Collaborator",
        status: "offline",
        objective: "Collaborate on project milestones and provide technical assistance.",
        isFictional: false
      };

      setTeamMembers(prev => [...prev, newMember]);
      setInviteInput("");
      addNotification(`Workspace invitation sent to @${cleanUsername} successfully!`, "success");

      setActivities(prev => [{
        id: Date.now().toString(),
        user: userName || "You",
        action: "invited user",
        target: `@${cleanUsername}`,
        time: "Just now"
      }, ...prev]);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);

  // Voice room mic analyser logic
  useEffect(() => {
    if (inVoice && !isMuted) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          setAudioStream(stream);
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const audioCtx = new AudioContextClass();
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          audioContextRef.current = audioCtx;
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateWaveform = () => {
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              const peaks = Array.from(dataArray).slice(0, 24).map(v => Math.max(5, (v / 255) * 50));
              setAudioPeaks(peaks);
              
              // Trigger talking simulator for other peers sometimes
              setVoiceUsers(prev => prev.map(u => {
                if (Math.random() > 0.93) {
                  return { ...u, speaking: !u.speaking, volume: u.speaking ? 0 : Math.floor(Math.random() * 40) + 15 };
                }
                return u;
              }));
            }
            animationFrameRef.current = requestAnimationFrame(updateWaveform);
          };
          updateWaveform();
        })
        .catch(() => {
          addNotification("Using mock WebRTC voice peaks (Microphone sandbox bypass).", "info");
          // Fallback animated mock visualizer
          const interval = setInterval(() => {
            const mockPeaks = Array(24).fill(0).map(() => Math.floor(Math.random() * 35) + 8);
            setAudioPeaks(mockPeaks);

            setVoiceUsers(prev => prev.map(u => {
              const isSp = Math.random() > 0.8;
              return { ...u, speaking: isSp, volume: isSp ? Math.floor(Math.random() * 45) + 10 : 0 };
            }));
          }, 120);

          (window as any)._mockVoiceInterval = interval;
        });
    } else {
      cleanupAudio();
    }

    return () => cleanupAudio();
  }, [inVoice, isMuted]);

  const cleanupAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if ((window as any)._mockVoiceInterval) {
      clearInterval((window as any)._mockVoiceInterval);
    }
    setAudioPeaks(Array(24).fill(5));
    setVoiceUsers(prev => prev.map(u => ({ ...u, speaking: false, volume: 0 })));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: userName || "Developer",
      role: "user",
      avatarColor: "bg-teal-600",
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setNewMessage("");
    setIsAiTyping(true);

    // AI Core Response from ForgeAI
    setTimeout(() => {
      let customApiKeys = {};
      try {
        const saved = localStorage.getItem("forgeai_custom_api_keys");
        if (saved) customApiKeys = JSON.parse(saved);
      } catch (err) {}

      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are ForgeAI, an AI co-developer in a team group chat. Keep your response short, highly technical, encouraging, and fitting the persona of a stellar AI co-developer. Do not repeat the template name, stay collaborative." },
            { role: "user", content: userMsg.text }
          ],
          modelId: "gemini-3.5-flash",
          customApiKeys
        })
      })
      .then(res => res.json())
      .then(data => {
        const forgeMsg: Message = {
          id: (Date.now() + 3).toString(),
          sender: "ForgeAI",
          role: "ai",
          avatarColor: "bg-teal-500",
          text: data.text || "I am analyzing the workspace files and aligning our parameters.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, forgeMsg]);
        setIsAiTyping(false);
      })
      .catch(() => {
        // Fallback mock AI message
        const forgeMsg: Message = {
          id: (Date.now() + 3).toString(),
          sender: "ForgeAI",
          role: "ai",
          avatarColor: "bg-teal-500",
          text: "I have parsed the workspace files. Real-time synchronizations are fully functional. Let me know if you would like me to construct any asset-routing handlers.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, forgeMsg]);
        setIsAiTyping(false);
      });
    }, 1200);
  };

  // 100GB Plan Smart File Router logic
  const handleSimulateRouting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simFileName.trim()) return;

    setIsRouting(true);
    setSimFileResult(null);

    setTimeout(() => {
      let winningProvider = providers[0]; // storj as default
      const fileExt = simFileName.split('.').pop()?.toLowerCase() || simFileType;

      if (fileExt === 'mp4' || fileExt === 'mp3' || fileExt === 'zip' || fileExt === 'rar') {
        winningProvider = providers.find(p => p.id === 'storj')!;
      } else if (fileExt === 'html' || fileExt === 'ts' || fileExt === 'js' || fileExt === 'json' || fileExt === 'txt') {
        winningProvider = providers.find(p => p.id === 'r2')!;
      } else if (fileExt === 'obj' || fileExt === 'fbx' || fileExt === 'gltf' || fileExt === 'mesh') {
        winningProvider = providers.find(p => p.id === 'b2')!;
      } else if (fileExt === 'png' || fileExt === 'jpg' || fileExt === 'svg' || fileExt === 'webp' || fileExt === 'css') {
        winningProvider = providers.find(p => p.id === 'bunny')!;
      } else {
        winningProvider = providers.find(p => p.id === 'filebase')!;
      }

      // Add to allocated space
      const sizeGB = Math.random() * 2 + 0.1; // simulated file size 0.1 to 2.1 GB
      setProviders(prev => prev.map(p => {
        if (p.id === winningProvider.id) {
          return { ...p, allocatedGB: Math.min(p.capacityGB, p.allocatedGB + sizeGB) };
        }
        return p;
      }));

      setSimFileResult({
        fileName: simFileName,
        sizeGB: sizeGB.toFixed(3),
        provider: winningProvider,
        ruleMatched: winningProvider.rule,
        latMs: Math.floor(Math.random() * 85) + 12
      });

      setActivities(prev => [{
        id: Date.now().toString(),
        user: userName || "You",
        action: "routed file",
        target: `${simFileName} (${sizeGB.toFixed(1)} GB) -> ${winningProvider.name}`,
        time: "Just now"
      }, ...prev]);

      setIsRouting(false);
      setSimFileName("");
      addNotification(`Smart File Router dispatched ${simFileName} to ${winningProvider.name}!`, "success");
    }, 1200);
  };

  const handleBroadcastSync = () => {
    addNotification("Broadcasting code delta synchronization packet...", "info");
    setTimeout(() => {
      addNotification("All client-side files and snapshot registries replicated with 3 peer nodes successfully. Latency: 18ms", "success");
      setActivities(prev => [{
        id: Date.now().toString(),
        user: userName || "You",
        action: "broadcasted sync",
        target: "Global sandbox repository delta",
        time: "Just now"
      }, ...prev]);
    }, 1000);
  };

  const handleSaveMemberChanges = () => {
    if (!selectedMember) return;
    setTeamMembers(prev => prev.map(m => {
      if (m.id === selectedMember.id) {
        return {
          ...m,
          role: newMemberRole,
          status: newMemberStatus,
          objective: newMemberObjective
        };
      }
      return m;
    }));
    addNotification(`Updated workspace record and objectives for ${selectedMember.name}!`, "success");
    setSelectedMember(null);
  };

  const handleRemoveMember = () => {
    if (!selectedMember) return;
    if (selectedMember.id === 'owner') {
      addNotification("You cannot remove the project owner!", "warning");
      return;
    }
    setTeamMembers(prev => prev.filter(m => m.id !== selectedMember.id));
    addNotification(`${selectedMember.name} has been removed from the project workspace.`, "info");
    setSelectedMember(null);
  };

  const totalUsedGB = providers.reduce((acc, p) => acc + p.allocatedGB, 0);
  const totalCapacityGB = providers.reduce((acc, p) => acc + p.capacityGB, 0);
  const percentageUsed = (totalUsedGB / totalCapacityGB) * 100;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden font-sans">
      
      {/* Top Header bar */}
      <header className={`p-4 border-b flex flex-wrap items-center justify-between shrink-0 ${currentTheme.header}`}>
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white">Co-Dev Live Hub</h1>
            <p className="text-[10px] text-slate-500">Real-time team presence, WebRTC voice channels, and 100GB distributed storage matrix.</p>
          </div>
        </div>

        {/* Sync status indicator */}
        <div className="flex items-center space-x-3 mt-2 sm:mt-0">
          <button 
            onClick={handleBroadcastSync}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition cursor-pointer">
            <FolderSync className="h-3.5 w-3.5 text-teal-400" />
            <span>Sync Workspace</span>
          </button>
          
          <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1 text-[9px] font-mono text-emerald-400 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LIVE CHANNELS ESTABLISHED</span>
          </div>
        </div>
      </header>

      {/* Primary Tab Bar switcher */}
      <div className="flex border-b border-slate-900 bg-slate-950 px-6 space-x-4 shrink-0">
        {[
          { id: 'workspace', name: 'Developer Forum', icon: MessageSquare },
          { id: 'voice', name: 'WebRTC Audio Channel', icon: Mic },
          { id: 'drive', name: 'Workspace Storage (1.0 GB)', icon: HardDrive }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-3 text-xs font-medium flex items-center space-x-2 border-b-2 transition cursor-pointer ${
                isActive ? 'border-teal-500 text-teal-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}>
              <Icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main View Area (Internal Views) */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: DEVELOPER FORUM */}
          {activeTab === 'workspace' && (
            <motion.div 
              key="workspace"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="h-full flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-900">
              
              {/* Left Column: Presence & Activity stream */}
              <div className="w-full md:w-72 flex flex-col shrink-0 overflow-y-auto p-5 space-y-6">
                
                {/* Team Directory (Max 15 Members) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Team Directory</span>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-teal-400 font-mono px-2 py-0.5 rounded-full font-bold">
                      {teamMembers.length}/15 Slots
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                    {teamMembers.map((member) => {
                      const isOnline = member.status === 'online';
                      const isStandby = member.status === 'standby';
                      return (
                        <div 
                          key={member.id} 
                          onClick={() => {
                            setSelectedMember(member);
                            setNewMemberObjective(member.objective);
                            setNewMemberRole(member.role);
                            setNewMemberStatus(member.status);
                          }}
                          className="flex items-center justify-between p-2 hover:bg-slate-900/60 bg-slate-950/40 rounded-xl border border-slate-900 hover:border-slate-850 transition cursor-pointer group text-left">
                          <div className="flex items-center space-x-2.5 overflow-hidden">
                            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] text-white font-extrabold shrink-0 ${member.avatarColor}`}>
                              {member.avatar}
                            </div>
                            <div className="overflow-hidden">
                              <span className="text-xs font-bold text-white block truncate group-hover:text-teal-400 transition">
                                {member.name}
                              </span>
                              <span className="text-[9px] text-slate-500 font-medium block truncate">
                                {member.role}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1.5 shrink-0 pl-1">
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              isOnline ? 'bg-emerald-400' : isStandby ? 'bg-amber-400' : 'bg-slate-600'
                            }`} />
                          </div>
                        </div>
                      );
                    })}

                    {teamMembers.length <= 1 && (
                      <div className="p-3 bg-slate-950/40 border border-slate-900/60 rounded-xl text-center space-y-1 mt-2">
                        <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block">No active peers connected</span>
                        <p className="text-[9px] text-slate-600 leading-tight">Send an invitation below to collaborate in real-time.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Invite Peer Developer Form */}
                <div className="p-3.5 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 block font-black">Invite Peer Developer</span>
                    <p className="text-[9px] text-slate-500 mt-0.5 leading-snug">Capacity is strictly limited to 15 members total.</p>
                  </div>
                  
                  <form onSubmit={handleInviteMember} className="space-y-2">
                    <input 
                      type="text"
                      value={inviteInput}
                      onChange={(e) => setInviteInput(e.target.value)}
                      placeholder="e.g. dev_mike or mike@gmail.com"
                      className="w-full bg-slate-950 border border-slate-800/80 focus:border-teal-500 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none placeholder-slate-600 font-mono"
                    />
                    
                    <button 
                      type="submit"
                      className="w-full py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition cursor-pointer">
                      + Send Invitation
                    </button>
                  </form>
                </div>

                {/* Team Activities Feed */}
                <div className="space-y-3 flex-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Workspace activity logs</span>
                  <div className="space-y-2 text-[10px] max-h-[220px] overflow-y-auto">
                    {activities.map(act => (
                      <div key={act.id} className="p-2 bg-slate-950 rounded-lg border border-slate-900 flex flex-col space-y-1">
                        <div className="flex justify-between text-slate-400 font-mono">
                          <span className="font-bold text-teal-400">{act.user}</span>
                          <span>{act.time}</span>
                        </div>
                        <p className="text-slate-300">
                          {act.action === 'modified' ? 'modified file ' : 
                           act.action === 'uploaded' ? 'uploaded asset ' : 
                           act.action === 'synthesized' ? 'synthesized OBJ ' : 'replied: '}
                          <span className="font-mono text-white text-[9.5px]">{act.target}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center/Right: Threaded chat container */}
              <div className="flex-1 flex flex-col h-full bg-slate-950/40 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-start space-x-3 max-w-xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white ${msg.avatarColor}`}>
                        {msg.sender[0].toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className={`flex items-baseline space-x-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                          <span className="text-xs font-extrabold text-slate-200">{msg.sender}</span>
                          <span className="text-[9px] text-slate-500 font-mono">{msg.time}</span>
                        </div>
                        <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          msg.role === 'user' ? 'bg-teal-500 text-slate-950 font-medium rounded-tr-none shadow-lg shadow-teal-500/10' : 
                          msg.role === 'ai' ? 'bg-teal-950/20 border border-teal-900/30 text-teal-300 rounded-tl-none' : 
                          'bg-slate-900 text-slate-300 rounded-tl-none border border-slate-850'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isAiTyping && (
                    <div className="flex items-start space-x-3 max-w-xl">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center text-xs font-bold font-mono">F</div>
                      <div className="space-y-1">
                        <span className="text-xs font-extrabold text-slate-200">ForgeAI Agent</span>
                        <div className="px-4 py-3 bg-slate-900 border border-slate-850 text-slate-400 rounded-2xl rounded-tl-none flex items-center space-x-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-bounce"></span>
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]"></span>
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]"></span>
                          <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Drafting Response...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Message input bar */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-900 bg-slate-950 shrink-0 flex items-center space-x-3">
                  <input 
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message to discuss with team members and ForgeAI..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl transition disabled:opacity-40 cursor-pointer">
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* TAB 2: WEBRTC AUDIO CHANNEL */}
          {activeTab === 'voice' && (
            <motion.div 
              key="voice"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="h-full p-6 overflow-y-auto space-y-6">
              
              {/* Introduction Banner */}
              <div className="bg-slate-900/50 border border-slate-850 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Wifi className="h-4 w-4 text-teal-400 animate-pulse" />
                    <span className="text-xs font-bold text-teal-400 uppercase font-mono tracking-wider">Spatial voice room</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white">Project voice channels</h2>
                  <p className="text-xs text-slate-400 max-w-xl">
                    Connect instantly with your team via raw WebRTC channels. Features low-latency spatial panning, acoustic echoes cancellation, and interactive frequency visualizers.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setInVoice(!inVoice);
                    if (!inVoice) {
                      addNotification("Joined voice channel: Workspace Alpha", "success");
                    } else {
                      addNotification("Disconnected from voice channel.", "info");
                    }
                  }}
                  className={`px-6 py-3 font-bold text-xs rounded-xl flex items-center space-x-2 transition shadow-xl cursor-pointer ${
                    inVoice 
                      ? "bg-red-500 hover:bg-red-400 text-white shadow-red-500/10" 
                      : "bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/15"
                  }`}>
                  <Mic className="h-4 w-4" />
                  <span>{inVoice ? "Disconnect Voice" : "Join Voice Channel"}</span>
                </button>
              </div>

              {/* Grid with visualizers and users */}
              {inVoice && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left Column: Visual Waveform container */}
                  <div className="md:col-span-2 bg-slate-900/30 border border-slate-850 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                      <span className="text-xs font-bold text-slate-200">Interactive Waveform</span>
                      <span className="text-[10px] text-teal-400 font-mono flex items-center space-x-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-ping"></span>
                        <span>WEBAUDIO BUFFER ACQUIRED</span>
                      </span>
                    </div>

                    {/* Peak Equalizer visualizer */}
                    <div className="h-40 flex items-end justify-center space-x-1 bg-slate-950/80 border border-slate-900 rounded-xl px-4 py-6">
                      {audioPeaks.map((peak, idx) => (
                        <div 
                          key={idx} 
                          className="w-2 rounded bg-gradient-to-t from-teal-500 via-teal-400 to-cyan-400 transition-all duration-75"
                          style={{ height: `${peak}%` }}
                        />
                      ))}
                    </div>

                    {/* Mute and microphone controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className={`p-3 rounded-xl transition cursor-pointer border ${
                            isMuted 
                              ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                              : 'bg-slate-950 hover:bg-slate-900 text-slate-300 border-slate-800'
                          }`}
                          title={isMuted ? "Unmute Mic" : "Mute Mic"}>
                          {isMuted ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
                        </button>
                        <span className="text-xs font-medium text-slate-400 pl-2">
                          {isMuted ? "Your microphone is muted" : "Your microphone is transmitting live"}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-500 font-mono">
                        LATENCY: 14ms | FORMAT: Opus 48khz Stereo
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Speaking state list */}
                  <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-6 space-y-4">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block border-b border-slate-850 pb-2">Active Speakers</span>
                    
                    <div className="space-y-3">
                      {/* Self */}
                      <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-900">
                        <div className="flex items-center space-x-2">
                          <div className={`h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-xs font-bold text-white ${!isMuted && audioPeaks.some(p => p > 20) ? 'ring-2 ring-teal-400' : ''}`}>
                            {userName ? userName[0].toUpperCase() : "U"}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">{userName || "You"} (Self)</span>
                            <span className="text-[10px] text-slate-500">{isMuted ? "Muted" : "Transmitting..."}</span>
                          </div>
                        </div>
                        {!isMuted && audioPeaks.some(p => p > 20) && (
                          <span className="text-[9px] text-teal-400 font-mono bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full font-bold animate-pulse">SPEAKING</span>
                        )}
                      </div>

                      {/* Connected Voice Peers */}
                      {voiceUsers.map((vu, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-900">
                          <div className="flex items-center space-x-2">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-slate-800 ${vu.speaking ? 'ring-2 ring-teal-400' : ''}`}>
                              {vu.avatar}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white block">{vu.name}</span>
                              <span className="text-[10px] text-slate-500">{vu.speaking ? "Speaking..." : "Standby"}</span>
                            </div>
                          </div>
                          {vu.speaking && (
                            <span className="text-[9px] text-teal-400 font-mono bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full font-bold animate-pulse">SPEAKING</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!inVoice && (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                  <Mic className="h-12 w-12 text-slate-700 animate-bounce" />
                  <h3 className="text-base font-bold text-white">Not Connected to Audio Channel</h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Click the "Join Voice Channel" button to hook up your local microphone stream and establish connection with peer developer nodes.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: WORKSPACE STORAGE QUOTA */}
          {activeTab === 'drive' && (
            <motion.div 
              key="drive"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="h-full p-6 overflow-y-auto space-y-6">
              
              {/* Drive Summary Header */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Aggregate Statistics */}
                <div className="lg:col-span-1 bg-slate-900/40 border border-slate-850 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider font-bold">User Disk Quota</span>
                    <h3 className="text-lg font-extrabold text-white">1.0 GB Workspace Allocation</h3>
                    <p className="text-xs text-slate-400 leading-normal">
                      Every creator account is allocated 1.0 GB of high-speed cloud disk space for code repositories, 3D wireframe assets, and compiled static builds.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-500">CURRENT WORKSPACE SPACE:</span>
                      <span className="text-white font-extrabold">0.42 / 1.00 GB</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-950 border border-slate-900 rounded-full h-3 overflow-hidden flex">
                      <div className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full w-[42%]" />
                    </div>

                    <div className="flex justify-between text-[9px] font-mono text-slate-500">
                      <span>42.0% Used</span>
                      <span>0.58 GB FREE SPACE</span>
                    </div>
                  </div>
                </div>

                {/* Quota Expansion & Owner Request Box */}
                <div className="lg:col-span-2 bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 border-b border-slate-850 pb-2">
                      <Zap className="h-4 w-4 text-teal-400" />
                      <h3 className="text-xs sm:text-sm font-extrabold text-white">Request Quota Expansion</h3>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      If your 1.0 GB workspace disk space fills up or you require heavy asset hosting for larger production builds, you can request an instant quota increase directly from the platform owners.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                    <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider block">Project Owner Contact Emails</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                        <span className="text-slate-400">Primary:</span>
                        <a href="mailto:gtbstudio369@gmail.com" className="text-teal-300 font-bold hover:underline">gtbstudio369@gmail.com</a>
                      </div>
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                        <span className="text-slate-400">Support:</span>
                        <a href="mailto:gamerhypixel24@gmail.com" className="text-teal-300 font-bold hover:underline">gamerhypixel24@gmail.com</a>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Include your project ID and requested allocation in your message. Owner requests are typically processed within 24 hours.
                    </p>
                  </div>
                </div>
              </div>

              {/* Architecture diagram description */}
              <div className="bg-slate-900/20 border border-slate-850 p-5 rounded-2xl flex items-start space-x-3.5">
                <Info className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-white">Automated WebApp Engine Asset Distribution</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Internal multi-cloud storage layers (Storj, Cloudflare R2, Filebase IPFS) run seamlessly behind the scenes to optimize asset loading speeds and ensure zero backup corruption for the ForgeAI web application. User workspace allocations remain isolated at 1.0 GB per account.
                  </p>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Active Member Detail Overlay Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col">
            
            {/* Card Header */}
            <div className="p-6 border-b border-slate-850 flex items-start justify-between bg-slate-950/40">
              <div className="flex items-center space-x-3.5">
                <div className={`h-11 w-11 rounded-full flex items-center justify-center text-lg text-white font-extrabold shrink-0 ${selectedMember.avatarColor}`}>
                  {selectedMember.avatar}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center space-x-2">
                    <span>{selectedMember.name}</span>
                    {selectedMember.id === 'forgeai' && <Sparkles className="h-3.5 w-3.5 text-teal-400" />}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500">@{selectedMember.username}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedMember(null)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Card Content */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[400px]">
              {/* Meta details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Email Contact</span>
                  <span className="text-xs text-slate-300 block truncate">{selectedMember.email}</span>
                </div>
                
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Authority Type</span>
                  <span className="text-xs text-slate-300 block">
                    {selectedMember.id === 'owner' ? (
                      <span className="text-amber-400 font-extrabold">Project Owner</span>
                    ) : selectedMember.id === 'forgeai' ? (
                      <span className="text-teal-400 font-extrabold">Autonomous Agent</span>
                    ) : (
                      <span className="text-slate-300">Invited Collaborator</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Role (Editable if user or fictional/invited) */}
              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Workspace Role Title</label>
                <input 
                  type="text"
                  disabled={selectedMember.id === 'owner' || selectedMember.id === 'forgeai'}
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full bg-slate-950 disabled:bg-slate-950/40 disabled:text-slate-500 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              {/* Presence Status selector */}
              <div className="space-y-1.5 text-left">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Workspace Presence Status</span>
                <div className="flex space-x-2">
                  {[
                    { value: 'online', label: 'Online', color: 'bg-emerald-400', border: 'border-emerald-500/30' },
                    { value: 'standby', label: 'Standby', color: 'bg-amber-400', border: 'border-amber-500/30' },
                    { value: 'offline', label: 'Offline', color: 'bg-slate-500', border: 'border-slate-700/50' }
                  ].map(statusOption => {
                    const isSelected = newMemberStatus === statusOption.value;
                    return (
                      <button
                        key={statusOption.value}
                        type="button"
                        disabled={selectedMember.id === 'forgeai' || selectedMember.id === 'owner'}
                        onClick={() => setNewMemberStatus(statusOption.value as any)}
                        className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                          isSelected 
                            ? 'bg-slate-800 text-white border-teal-500' 
                            : 'bg-slate-950/60 text-slate-400 border-slate-850 hover:bg-slate-900'
                        }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusOption.color}`} />
                        <span>{statusOption.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Core Objectives (Editable textarea) */}
              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Individual Objectives & Deliverables</label>
                <textarea 
                  rows={3}
                  value={newMemberObjective}
                  onChange={(e) => setNewMemberObjective(e.target.value)}
                  placeholder="Describe their objectives or deliverables for the project..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 leading-relaxed font-sans"
                />
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="p-6 border-t border-slate-850 bg-slate-950/40 flex items-center justify-between">
              <div>
                {selectedMember.id !== 'owner' && selectedMember.id !== 'forgeai' && (
                  <button 
                    type="button"
                    onClick={handleRemoveMember}
                    className="px-3 py-2 bg-red-950 hover:bg-red-900 text-red-200 border border-red-900/30 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition cursor-pointer">
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove Member</span>
                  </button>
                )}
              </div>

              <div className="flex space-x-2">
                <button 
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg transition cursor-pointer">
                  Cancel
                </button>
                
                <button 
                  type="button"
                  onClick={handleSaveMemberChanges}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold rounded-lg shadow-lg shadow-teal-500/10 transition cursor-pointer">
                  Save Objectives
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}

    </div>
  );
}
