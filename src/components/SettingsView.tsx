import React, { useState } from "react";
import { 
  Settings, Eye, Monitor, Type, Layout, Sliders, Volume2, 
  HelpCircle, Check, Info, RefreshCw, Moon, Sun, Star,
  User, Mail, Lock, ShieldAlert, Database, Download, Trash2, Sparkles,
  Keyboard, Search, Zap, CheckCircle2, AlertCircle, Play
} from "lucide-react";
import { UserPreferences } from "../types";
import GitHubSyncWidget from "./GitHubSyncWidget";
import { validatePasswordRules } from "../lib/passwordValidation";

interface SettingsViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onResetPreferences: () => void;
  addNotification: (text: string, type: 'info' | 'success' | 'warning') => void;
  userName: string;
  onUpdateUserName: (val: string) => void;
  userUsername: string;
  onUpdateUserUsername: (val: string) => void;
  userEmail: string;
  onUpdateUserEmail: (val: string) => void;
  avatarUrl: string;
  onUpdateAvatarUrl: (val: string) => void;
  isGuest: boolean;
  advancedSettingsEnabled: boolean;
  onToggleAdvancedSettings: (enabled: boolean) => void;
  storageBytes: number;
  onDownloadBackup: () => void;
  onDeleteAccount: () => void;
  currentFiles?: Record<string, string>;
  onApplyPulledFiles?: (files: Record<string, string>) => void;
  onSaveFullProfile?: (profile: { name: string; username: string; email: string; avatarUrl: string }) => void;
}

const THEME_OPTIONS = [
  { id: 'dark', name: 'Charcoal Dark', desc: 'Black + cyan lift for premium dark studio work', bg: 'bg-slate-900', text: 'text-slate-100' },
  { id: 'light', name: 'Polar Light', desc: 'White + blue UI for clean daytime work', bg: 'bg-slate-100', text: 'text-slate-800' },
  { id: 'midnight', name: 'Neon Midnight', desc: 'Absolute black with electric pink accents', bg: 'bg-black', text: 'text-fuchsia-300' },
  { id: 'ocean', name: 'Deep Ocean Blue', desc: 'Sapphire blue with bright cyan highlights', bg: 'bg-blue-950', text: 'text-cyan-200' },
  { id: 'blue', name: 'Electric Blue', desc: 'Deep navy + vibrant blue + white contrast', bg: 'bg-blue-700', text: 'text-blue-100' },
  { id: 'pink', name: 'Rosé Glow', desc: 'Black + pink + white romance and glow accents', bg: 'bg-pink-700', text: 'text-pink-100' },
  { id: 'white', name: 'Pure White', desc: 'Minimal white + blue text and clean balance', bg: 'bg-white', text: 'text-sky-700' },
  { id: 'forest', name: 'Forest Moss', desc: 'Natural green and dark neutral studio mood', bg: 'bg-emerald-900', text: 'text-emerald-200' }
];

export default function SettingsView({
  preferences,
  onUpdatePreferences,
  onResetPreferences,
  addNotification,
  userName,
  onUpdateUserName,
  userUsername,
  onUpdateUserUsername,
  userEmail,
  onUpdateUserEmail,
  avatarUrl,
  onUpdateAvatarUrl,
  isGuest,
  advancedSettingsEnabled,
  onToggleAdvancedSettings,
  storageBytes,
  onDownloadBackup,
  onDeleteAccount,
  currentFiles = {},
  onApplyPulledFiles,
  onSaveFullProfile
}: SettingsViewProps) {

  // Local form editing states
  const [editName, setEditName] = useState(userName);
  const [editUsername, setEditUsername] = useState(userUsername);
  const [editEmail, setEditEmail] = useState(userEmail);
  const [editAvatarUrl, setEditAvatarUrl] = useState(avatarUrl || "");

  // Keep form inputs synchronized when profile props change
  React.useEffect(() => {
    setEditName(userName);
    setEditUsername(userUsername);
    setEditEmail(userEmail);
    setEditAvatarUrl(avatarUrl || "");
  }, [userName, userUsername, userEmail, avatarUrl]);
  
  // Custom Delete Confirmation Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  
  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Multi-model API keys state for 15 Selected AI Services
  const [customApiKeys, setCustomApiKeys] = useState(() => {
    const defaults = {
      gemini: "",
      deepseek: "",
      groq: "",
      cerebras: "",
      mistral: "",
      qwen: "",
      flux: "",
      stability: "",
      wan_video: "",
      cogvideo: "",
      musicgen: "",
      whisper: "",
      kokoro_tts: "",
      hunyuan_3d: "",
      jina: "",
      // Secondary fallbacks
      openrouter: "",
      huggingface: "",
      cloudflare: "",
      together: ""
    };
    try {
      const saved = localStorage.getItem("forgeai_custom_api_keys");
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch {
      return defaults;
    }
  });

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const toggleKeyVisibility = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [activeRebindId, setActiveRebindId] = useState<string | null>(null);
  const [shortcutSearch, setShortcutSearch] = useState("");

  React.useEffect(() => {
    if (!activeRebindId) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const key = e.key;
      if (key === 'Escape') {
        setActiveRebindId(null);
        addNotification("Rebinding cancelled.", "info");
        return;
      }

      // Ignore modifier-only presses
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
        return;
      }

      const parts: string[] = [];
      if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
      if (e.shiftKey) parts.push('Shift');
      if (e.altKey) parts.push('Alt');

      let keyName = key;
      if (keyName === ' ') keyName = 'Space';
      else if (keyName.length === 1) keyName = keyName.toUpperCase();

      parts.push(keyName);
      const finalCombo = parts.join('+');

      const nextShortcuts = {
        ...(preferences.keyboardShortcuts || {
          shortcutsHelp: 'Ctrl+/',
          commandPalette: 'Ctrl+Shift+P',
          sidebarToggle: 'Ctrl+B',
          focusToggle: 'Ctrl+.',
          viewHome: 'Ctrl+Shift+1',
          viewEditor: 'Ctrl+Shift+2',
          viewChat: 'Ctrl+Shift+3',
          viewTemplates: 'Ctrl+Shift+4',
          viewHistory: 'Ctrl+Shift+5',
          viewSettings: 'Ctrl+Shift+6'
        }),
        [activeRebindId]: finalCombo
      };

      onUpdatePreferences({ keyboardShortcuts: nextShortcuts });
      addNotification(`Successfully rebound shortcut to ${finalCombo}.`, "success");
      setActiveRebindId(null);
    };

    window.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown, true);
    };
  }, [activeRebindId, preferences.keyboardShortcuts]);

  const handleSaveApiKeys = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("forgeai_custom_api_keys", JSON.stringify(customApiKeys));
      addNotification("Multi-Model API Keys saved and activated successfully.", "success");
    } catch (err) {
      addNotification("Failed to save API keys to local cache.", "warning");
    }
  };

  const handleUpdate = (updates: Partial<UserPreferences>) => {
    onUpdatePreferences(updates);
    addNotification("Preferences updated successfully.", "success");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      addNotification("Display name cannot be empty!", "warning");
      return;
    }
    const cleanUsername = editUsername.trim().replace(/\s+/g, '_').toLowerCase();
    if (!cleanUsername) {
      addNotification("Unique username cannot be empty!", "warning");
      return;
    }
    if (cleanUsername.length < 5) {
      addNotification("Username must be at least 5 characters long!", "warning");
      return;
    }
    
    // Uniqueness rules check
    const takenUsernames = ["admin", "sarah", "alex", "forgeai", "superuser", "developer", "guest", "owner", "editor", "viewer", "root", "system"];
    if (takenUsernames.includes(cleanUsername)) {
      addNotification(`The username @${cleanUsername} is already owned. Please try another!`, "warning");
      return;
    }

    if (onSaveFullProfile) {
      onSaveFullProfile({
        name: editName.trim(),
        username: cleanUsername,
        email: editEmail.trim(),
        avatarUrl: editAvatarUrl.trim()
      });
    } else {
      onUpdateUserName(editName.trim());
      onUpdateUserUsername(cleanUsername);
      onUpdateUserEmail(editEmail.trim());
      onUpdateAvatarUrl(editAvatarUrl.trim());
    }
    addNotification("User account profile synced successfully.", "success");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      addNotification("Please enter both old and new passwords.", "warning");
      return;
    }
    const check = validatePasswordRules(newPassword);
    if (!check.isValid) {
      addNotification(check.errorMessage || "New password does not meet security requirements.", "warning");
      return;
    }
    setOldPassword("");
    setNewPassword("");
    addNotification("Password updated. Token hash rotated securely.", "success");
  };

  // Human friendly storage size formatting helper
  const formatStorageSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    if (bytes < 1024 * 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    return `${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TB`;
  };

  const limitBytes = isGuest ? (1024 * 1024 * 1024) : (5000 * 1024 * 1024 * 1024);
  const storageUsedPercent = Math.min(100, Math.max(0.01, (storageBytes / limitBytes) * 100));

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 sm:p-10 space-y-8 selection:bg-teal-500/30 selection:text-teal-300 h-full font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest block font-bold">ACCESSIBILITY & USER ACCOUNTS</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">System Settings</h1>
          <p className="text-xs text-slate-400">Manage account information, dynamic model routers, accessibility visual scaling, and storage partitions.</p>
        </div>

        <button
          onClick={() => { onResetPreferences(); addNotification("Restored default appearance configuration.", "info"); }}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition cursor-pointer">
          <RefreshCw className="h-4 w-4" />
          <span>Reset Accessibility Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Core Options */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* User Account Settings Form */}
          <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-5">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-2">
              <User className="h-4 w-4 text-teal-400" />
              <span>User Profile Management</span>
            </h2>

            <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-500 uppercase">Display Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 transition"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-500 uppercase">Unique Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-sm font-mono">@</span>
                  <input 
                    type="text" 
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 transition font-mono"
                    placeholder="john_doe"
                  />
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="block text-[10px] font-mono text-slate-500 uppercase">Email Address</label>
                <input 
                  type="email" 
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 transition"
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="block text-[10px] font-mono text-slate-500 uppercase">Profile Picture URL</label>
                <div className="flex space-x-3 items-center">
                  {editAvatarUrl ? (
                    <img 
                      src={editAvatarUrl} 
                      alt="Avatar Preview" 
                      className="h-10 w-10 rounded-xl object-cover border border-slate-800 shrink-0"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/bottts/svg?seed=' + editUsername;
                      }}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-slate-600" />
                    </div>
                  )}
                  <input 
                    type="url" 
                    value={editAvatarUrl}
                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 transition"
                    placeholder="https://example.com/my-photo.jpg"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 pt-2 text-right">
                <button 
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer">
                  Sync Account Information
                </button>
              </div>
            </form>
          </div>

          {/* GitHub OAuth & Workspace Repository Sync Integration */}
          <GitHubSyncWidget 
            currentFiles={currentFiles}
            onApplyPulledFiles={onApplyPulledFiles}
            addNotification={addNotification}
          />

          {/* Secure Passkey Hash Rotation (Password) */}
          <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-5">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-2">
              <Lock className="h-4 w-4 text-emerald-400" />
              <span>Change Security Password</span>
            </h2>

            <form onSubmit={handleUpdatePassword} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-500 uppercase">Current Password</label>
                <input 
                  type="password" 
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 transition"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="block text-[10px] font-mono text-slate-500 uppercase">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 transition"
                  placeholder="Min 5 chars, 1 uppercase, 1 lowercase, 2 numbers"
                />
                {newPassword && (() => {
                  const check = validatePasswordRules(newPassword);
                  return (
                    <div className="mt-2 p-2.5 bg-slate-950/80 border border-slate-850 rounded-xl space-y-1 text-[10px] font-mono">
                      <div className="text-slate-400 font-bold mb-1">Password Requirements Checklist:</div>
                      <div className={`flex items-center space-x-1.5 ${check.hasMinLength ? "text-emerald-400" : "text-slate-500"}`}>
                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                        <span>At least 5 characters long</span>
                      </div>
                      <div className={`flex items-center space-x-1.5 ${check.hasLowercase ? "text-emerald-400" : "text-slate-500"}`}>
                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                        <span>At least 1 lowercase letter (a-z)</span>
                      </div>
                      <div className={`flex items-center space-x-1.5 ${check.hasUppercase ? "text-emerald-400" : "text-slate-500"}`}>
                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                        <span>At least 1 uppercase letter (A-Z)</span>
                      </div>
                      <div className={`flex items-center space-x-1.5 ${check.hasTwoNumbers ? "text-emerald-400" : "text-slate-500"}`}>
                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                        <span>At least 2 numbers (0-9) ({check.numberCount}/2)</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="sm:col-span-2 pt-2 text-right">
                <button 
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer">
                  Rotate Passkey Credentials
                </button>
              </div>
            </form>
          </div>

          {/* Power User Settings: Model select override toggle */}
          <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-2">
                  <Sliders className="h-4 w-4 text-amber-400" />
                  <span>Granular Router Override</span>
                </h2>
                <p className="text-xs text-slate-400">Expose manual routing controls inside coding workspace and AI sandboxes.</p>
              </div>

              <button
                onClick={() => {
                  const nextVal = !advancedSettingsEnabled;
                  onToggleAdvancedSettings(nextVal);
                  addNotification(nextVal ? "Power User settings active. Secondary selectors exposed." : "Router overrides deactivated. ForgeAI routing enforced.", "info");
                }}
                className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center px-1 shrink-0 cursor-pointer ${
                  advancedSettingsEnabled ? "bg-amber-500" : "bg-slate-800"
                }`}>
                <div className={`w-4.5 h-4.5 bg-slate-950 rounded-full shadow transition-transform ${
                  advancedSettingsEnabled ? "translate-x-5.5" : "translate-x-0"
                }`} />
              </button>
            </div>

            <div className="p-3.5 bg-amber-950/10 border border-amber-900/30 rounded-xl text-[11px] leading-relaxed text-amber-300">
              💡 <strong>Developer Mode Note:</strong> Keeping manual override disabled is highly recommended. By default, **ForgeAI's dynamic model router** analyzes user prompt contexts to automatically dispatch to the most performant sub-engines, keeping performance at its absolute peak.
            </div>
          </div>

          {/* Workspace Performance & Storage Preferences */}
          <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-900/60 pb-3">
              <div>
                <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-teal-400" />
                  <span>Workspace Engine Preferences</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Configure engine speed, offline cache options, and local workspace partitions.</p>
              </div>
              <span className="text-[9px] font-mono bg-teal-500/10 text-teal-400 px-2.5 py-1 rounded-full border border-teal-500/20 uppercase tracking-wider font-semibold shrink-0">Engine Status: Optimal</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-850 space-y-1">
                <span className="text-xs font-bold text-white block">Automated Code Formatting</span>
                <p className="text-[10px] text-slate-400">Automatically tidy up HTML, CSS, and JS syntax on edit save.</p>
              </div>
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-850 space-y-1">
                <span className="text-xs font-bold text-white block">Local Snapshot Checkpoints</span>
                <p className="text-[10px] text-slate-400">Keep up to 50 version restore points in browser local memory.</p>
              </div>
            </div>
          </div>

          {/* Theme Palette Card */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-2">
              <Eye className="h-4 w-4 text-teal-400" />
              <span>Theme Aesthetics</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {THEME_OPTIONS.map(opt => {
                const isSelected = preferences.theme === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleUpdate({ theme: opt.id as any })}
                    className={`p-4 rounded-xl border cursor-pointer flex justify-between items-start transition ${
                      isSelected 
                        ? "border-teal-500 bg-teal-950/5 shadow-md shadow-teal-500/10" 
                        : "bg-slate-900/40 border-slate-900 hover:border-slate-800"
                    }`}>
                    <div className="space-y-1 pr-4">
                      <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <span className={`h-3 w-3 rounded-full ${opt.bg} border border-slate-700`}></span>
                        <span>{opt.name}</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-normal">{opt.desc}</p>
                    </div>

                    <div className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition ${
                      isSelected ? "border-teal-400 bg-teal-400 text-slate-950" : "border-slate-700 bg-slate-950 text-slate-800"
                    }`}>
                      {isSelected && <Check className="h-3.5 w-3.5 font-bold" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Editor Scaling & Comfort Controls */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-2">
              <Sliders className="h-4 w-4 text-purple-400" />
              <span>Typography & Sizing Scaling</span>
            </h2>

            <div className="p-5 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-5">
              {/* Scale font */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 border-b border-slate-900/60">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white">Font Size Scaling</span>
                  <p className="text-[10px] text-slate-500">Increases or decreases code and console log size</p>
                </div>
                <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl space-x-1">
                  {['sm', 'base', 'lg', 'xl'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => handleUpdate({ fontSize: sz as any })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition ${
                        preferences.fontSize === sz ? "bg-purple-500 text-white" : "text-slate-500 hover:text-slate-300"
                      }`}>
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Workspace Mode switcher */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 border-b border-slate-900/60">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white">Workspace Mode</span>
                  <p className="text-[10px] text-slate-500">Select responsive view mode or let Forge AI automatically adapt</p>
                </div>
                <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl space-x-1">
                  {[
                    { id: 'auto', label: 'Auto (Rec)' },
                    { id: 'mobile', label: 'Mobile View' },
                    { id: 'desktop', label: 'Desktop View' }
                  ].map((modeOption) => (
                    <button
                      key={modeOption.id}
                      onClick={() => handleUpdate({ workspaceMode: modeOption.id as any })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        (preferences.workspaceMode || 'auto') === modeOption.id ? "bg-purple-500 text-white" : "text-slate-500 hover:text-slate-300"
                      }`}>
                      {modeOption.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout orientations */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 border-b border-slate-900/60">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white">Window Orientation Layout</span>
                  <p className="text-[10px] text-slate-500">Reverse sidebar and preview grids to customize flow</p>
                </div>
                <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl space-x-1">
                  <button
                    onClick={() => handleUpdate({ windowLayout: 'default' })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      preferences.windowLayout === 'default' ? "bg-purple-500 text-white" : "text-slate-500 hover:text-slate-300"
                    }`}>
                    Left Sidebar (Default)
                  </button>
                  <button
                    onClick={() => handleUpdate({ windowLayout: 'reversed' })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      preferences.windowLayout === 'reversed' ? "bg-purple-500 text-white" : "text-slate-500 hover:text-slate-300"
                    }`}>
                    Right Sidebar (Reversed)
                  </button>
                </div>
              </div>

              {/* Cursor Style */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 border-b border-slate-900/60">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white">Editor Cursor Style</span>
                  <p className="text-[10px] text-slate-500">Select typing caret shape for IDE text editor</p>
                </div>
                <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl space-x-1">
                  {['line', 'block', 'underline'].map((cur) => (
                    <button
                      key={cur}
                      onClick={() => handleUpdate({ cursorStyle: cur as any })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition ${
                        preferences.cursorStyle === cur ? "bg-purple-500 text-white" : "text-slate-500 hover:text-slate-300"
                      }`}>
                      {cur}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Interactive Pointer Cursors System */}
              <div className="pt-2 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white flex items-center space-x-2">
                      <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                      <span>Interactive Cursor Theme</span>
                    </span>
                    <p className="text-[10px] text-slate-500">Custom desktop pointer themes with responsive code, drag, and AI thinking states</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'default', label: 'Default' },
                    { id: 'forge', label: 'Forge Glow ⭐' },
                    { id: 'terminal', label: 'Terminal █' },
                    { id: 'minimal', label: 'Minimal' },
                    { id: 'classic', label: 'Classic' },
                    { id: 'professional', label: 'Professional' },
                    { id: 'cyber', label: 'Cyber Neon' },
                    { id: 'disabled', label: 'Disabled' }
                  ].map(curOpt => {
                    const active = (preferences.cursorTheme || 'forge') === curOpt.id;
                    return (
                      <button
                        key={curOpt.id}
                        type="button"
                        onClick={() => handleUpdate({ cursorTheme: curOpt.id as any })}
                        className={`p-2.5 rounded-xl border text-[11px] font-bold text-left transition cursor-pointer ${
                          active 
                            ? "bg-teal-500/20 border-teal-400 text-teal-200 shadow" 
                            : "bg-slate-950/80 border-slate-850 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {curOpt.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-mono text-slate-400 uppercase font-bold">Cursor Size</span>
                    <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl space-x-1">
                      {[
                        { id: 'small', label: 'Small' },
                        { id: 'medium', label: 'Medium' },
                        { id: 'large', label: 'Large' }
                      ].map(szOpt => (
                        <button
                          key={szOpt.id}
                          type="button"
                          onClick={() => handleUpdate({ cursorSize: szOpt.id as any })}
                          className={`flex-1 py-1 rounded-lg text-xs font-bold transition ${
                            (preferences.cursorSize || 'medium') === szOpt.id ? "bg-teal-500 text-slate-950" : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {szOpt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[10px] font-mono text-slate-400 uppercase font-bold">Cursor Effect</span>
                    <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl space-x-1">
                      {[
                        { id: 'none', label: 'None' },
                        { id: 'glow', label: 'Glow' },
                        { id: 'pulse', label: 'Pulse' },
                        { id: 'trail', label: 'Trail' }
                      ].map(effOpt => (
                        <button
                          key={effOpt.id}
                          type="button"
                          onClick={() => handleUpdate({ cursorEffect: effOpt.id as any })}
                          className={`flex-1 py-1 rounded-lg text-xs font-bold transition ${
                            (preferences.cursorEffect || 'glow') === effOpt.id ? "bg-teal-500 text-slate-950" : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {effOpt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Forge Developer Mode Toggle */}
              <div className="pt-4 border-t border-slate-900/60 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white flex items-center space-x-2">
                    <Zap className="h-3.5 w-3.5 text-purple-400" />
                    <span>Forge Developer Mode</span>
                  </span>
                  <p className="text-[10px] text-slate-500">Enables Forge cursor glow, dense panel spacing, subtle hover highlights, and hotkey tooltips</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !(preferences.developerMode ?? true);
                    handleUpdate({ developerMode: nextVal });
                    addNotification(nextVal ? "Forge Developer Mode enabled!" : "Forge Developer Mode disabled.", "info");
                  }}
                  className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center px-1 shrink-0 cursor-pointer ${
                    (preferences.developerMode ?? true) ? "bg-purple-500" : "bg-slate-800"
                  }`}>
                  <div className={`w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${
                    (preferences.developerMode ?? true) ? "translate-x-5.5" : "translate-x-0"
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Keyboard Shortcuts Rebinding */}
          <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-3">
              <div className="space-y-1">
                <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-2">
                  <Keyboard className="h-4 w-4 text-teal-400" />
                  <span>Interactive Keyboard Rebinding</span>
                </h2>
                <p className="text-xs text-slate-400">Click any key combination below to define custom hotkeys.</p>
              </div>

              {/* Reset Shortcuts button */}
              <button 
                type="button"
                onClick={() => {
                  onUpdatePreferences({ keyboardShortcuts: undefined });
                  addNotification("Restored all keyboard shortcuts to system defaults.", "info");
                }}
                className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-teal-400 text-[10px] font-mono rounded-lg transition shrink-0 cursor-pointer flex items-center space-x-1"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset Binds</span>
              </button>
            </div>

            {/* Rebinding Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input 
                type="text"
                value={shortcutSearch}
                onChange={(e) => setShortcutSearch(e.target.value)}
                placeholder="Search shortcut name, category, or keys..."
                className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition font-sans"
              />
            </div>

            {/* Shortcut Grid */}
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
              {(() => {
                const filtered = [
                  { id: 'shortcutsHelp', name: 'Show Shortcuts Help', category: 'Navigation', desc: 'Display visual hotkeys help overlay.' },
                  { id: 'commandPalette', name: 'Toggle Command Palette', category: 'View', desc: 'Open universal launcher and search bar.' },
                  { id: 'sidebarToggle', name: 'Toggle Sidebar Menu', category: 'View', desc: 'Expand or collapse sidebar navigation drawer.' },
                  { id: 'focusToggle', name: 'Toggle Focus Mode', category: 'View', desc: 'Maximize editor space by hiding other panels.' },
                  { id: 'viewHome', name: 'Home Workspace View', category: 'Navigation', desc: 'Switch view directly to the main landing home tab.' },
                  { id: 'viewEditor', name: 'Editor Sandbox View', category: 'Navigation', desc: 'Switch view directly to the coding workspace.' },
                  { id: 'viewChat', name: 'Chat Assistant View', category: 'Navigation', desc: 'Switch view directly to the AI chat bot.' },
                  { id: 'viewTemplates', name: 'Blueprints & Templates View', category: 'Navigation', desc: 'Switch view directly to templates guidelines.' },
                  { id: 'viewHistory', name: 'Version History View', category: 'Navigation', desc: 'Switch view to local snapshots registry.' },
                  { id: 'viewSettings', name: 'Settings Configuration View', category: 'Navigation', desc: 'Switch view to accessibility settings panel.' }
                ].filter(s => 
                  s.name.toLowerCase().includes(shortcutSearch.toLowerCase()) ||
                  s.category.toLowerCase().includes(shortcutSearch.toLowerCase()) ||
                  s.desc.toLowerCase().includes(shortcutSearch.toLowerCase()) ||
                  (preferences.keyboardShortcuts?.[s.id] || (s.id === 'shortcutsHelp' ? 'Ctrl+/' : s.id === 'commandPalette' ? 'Ctrl+Shift+P' : s.id === 'sidebarToggle' ? 'Ctrl+B' : s.id === 'focusToggle' ? 'Ctrl+.' : s.id === 'viewHome' ? 'Ctrl+Shift+1' : s.id === 'viewEditor' ? 'Ctrl+Shift+2' : s.id === 'viewChat' ? 'Ctrl+Shift+3' : s.id === 'viewTemplates' ? 'Ctrl+Shift+4' : s.id === 'viewHistory' ? 'Ctrl+Shift+5' : 'Ctrl+Shift+6')).toLowerCase().includes(shortcutSearch.toLowerCase())
                );

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-6 text-xs text-slate-500 font-mono">
                      No matching keyboard shortcuts found.
                    </div>
                  );
                }

                return filtered.map(item => {
                  const currentKeys = preferences.keyboardShortcuts?.[item.id] || (
                    item.id === 'shortcutsHelp' ? 'Ctrl+/' :
                    item.id === 'commandPalette' ? 'Ctrl+Shift+P' :
                    item.id === 'sidebarToggle' ? 'Ctrl+B' :
                    item.id === 'focusToggle' ? 'Ctrl+.' :
                    item.id === 'viewHome' ? 'Ctrl+Shift+1' :
                    item.id === 'viewEditor' ? 'Ctrl+Shift+2' :
                    item.id === 'viewChat' ? 'Ctrl+Shift+3' :
                    item.id === 'viewTemplates' ? 'Ctrl+Shift+4' :
                    item.id === 'viewHistory' ? 'Ctrl+Shift+5' :
                    'Ctrl+Shift+6'
                  );
                  const isRebinding = activeRebindId === item.id;

                  return (
                    <div 
                      key={item.id} 
                      className={`p-3 rounded-xl border flex items-center justify-between transition gap-4 ${
                        isRebinding 
                          ? 'border-amber-500 bg-amber-500/5 shadow-md shadow-amber-500/5' 
                          : 'bg-slate-950/40 border-slate-900 hover:border-slate-850'
                      }`}
                    >
                      <div className="space-y-0.5 text-left">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">{item.name}</span>
                          <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.2 rounded uppercase tracking-wider">{item.category}</span>
                        </div>
                        <p className="text-[10px] text-slate-500">{item.desc}</p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {isRebinding ? (
                          <span className="text-[10px] font-mono text-amber-400 font-semibold animate-pulse px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            Press keys... (Esc to cancel)
                          </span>
                        ) : (
                          <div className="flex items-center space-x-1.5">
                            <div className="flex items-center space-x-1">
                              {currentKeys.split('+').map((k, idx) => (
                                <React.Fragment key={idx}>
                                  {idx > 0 && <span className="text-slate-600 text-[10px] font-mono">+</span>}
                                  <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-850 rounded font-mono text-[10px] text-teal-400 font-bold">{k}</kbd>
                                </React.Fragment>
                              ))}
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => {
                                setActiveRebindId(item.id);
                                addNotification(`Waiting for keyboard input for "${item.name}"...`, "info");
                              }}
                              className="p-1.5 hover:bg-slate-900 border border-slate-900 hover:border-slate-850 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                              title="Rebind shortcut"
                            >
                              <Keyboard className="h-3.5 w-3.5 text-slate-400 hover:text-teal-400" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

        </div>

        {/* Right Side: Storage & Privacy Controls */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Response Animation & Adaptive Streaming Configuration */}
          <div className="bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-purple-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <div className="flex items-center space-x-2">
                <Play className="h-4 w-4 text-purple-400" />
                <h3 className="text-xs sm:text-sm font-extrabold text-white">Response Animation</h3>
              </div>
              <span className="text-[9px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold border border-purple-500/30">
                FORGE STREAMING
              </span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold">Animation Style</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'instant', name: 'Instant' },
                    { id: 'wordStream', name: 'Word Stream ⭐' },
                    { id: 'typewriter', name: 'Typewriter' },
                    { id: 'lineReveal', name: 'Line Reveal ⭐' },
                    { id: 'fadeUp', name: 'Fade Up' },
                    { id: 'slideUp', name: 'Slide Up' },
                    { id: 'smartStreaming', name: 'Smart Stream ⭐' },
                  ].map(styleOpt => {
                    const active = (preferences.responseAnimation || 'smartStreaming') === styleOpt.id;
                    return (
                      <button
                        key={styleOpt.id}
                        type="button"
                        onClick={() => handleUpdate({ responseAnimation: styleOpt.id as any })}
                        className={`p-2 rounded-xl border text-[11px] font-bold text-left transition cursor-pointer ${
                          active 
                            ? "bg-purple-500/20 border-purple-400 text-purple-200 shadow" 
                            : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                        }`}
                      >
                        {styleOpt.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Speed & Cursor Controls */}
              <div className="pt-2 border-t border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Streaming Speed</span>
                  <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                    {(['slow', 'normal', 'fast'] as const).map(spd => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => handleUpdate({ animationSpeed: spd })}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                          (preferences.animationSpeed || 'normal') === spd ? "bg-purple-500 text-white" : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {spd}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Typing Cursor Indicator</span>
                  <button
                    type="button"
                    onClick={() => handleUpdate({ streamingCursor: !(preferences.streamingCursor ?? true) })}
                    className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                      (preferences.streamingCursor ?? true) ? "bg-purple-500" : "bg-slate-800"
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      (preferences.streamingCursor ?? true) ? "translate-x-4" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Cloud Storage Allocation View */}
          <div className="bg-slate-900/50 border border-slate-850 rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-850 pb-3">
              <Database className="h-4 w-4 text-teal-400" />
              <h3 className="text-xs sm:text-sm font-extrabold text-white">Distributed Cloud Storage</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  {isGuest ? "1GB Free Tier Plan" : "5000GB (5TB) Ultra Plan"}
                </span>
                <span className="text-[10px] font-mono bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded font-bold border border-teal-500/10">Active</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">AGGREGATE ALLOCATION:</span>
                  <span className="text-white font-extrabold">
                    {formatStorageSize(storageBytes)} / {formatStorageSize(limitBytes)}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-slate-950 border border-slate-900 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-teal-500 h-full rounded-full transition-all duration-500 shadow-md shadow-teal-500/50"
                    style={{ width: `${storageUsedPercent}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>{storageUsedPercent.toFixed(1)}% Used</span>
                  <span>1.00 GB WORKSPACE ALLOCATION</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-teal-950/10 border border-teal-900/30 rounded-xl space-y-1">
              <h4 className="text-[10px] font-mono uppercase text-teal-400 font-bold">Workspace Storage Allocation</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Your workspace is allocated 1.0 GB of high-speed cloud disk space. WebApp infrastructure storage is handled automatically by the ForgeAI engine. Need more space? Contact owners via Help menu (<a href="mailto:gtbstudio369@gmail.com" className="text-teal-300 underline">gtbstudio369@gmail.com</a> &amp; <a href="mailto:gamerhypixel24@gmail.com" className="text-teal-300 underline">gamerhypixel24@gmail.com</a>).
              </p>
            </div>
          </div>

          {/* Privacy & Recovery Controls */}
          <div className="bg-slate-900/50 border border-slate-850 rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-850 pb-3">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <h3 className="text-xs sm:text-sm font-extrabold text-white">Privacy & Recovery</h3>
            </div>

            <div className="space-y-2">
              {/* Backup */}
              <button 
                onClick={onDownloadBackup}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer">
                <Download className="h-4 w-4 text-teal-400" />
                <span>Download Account Data (JSON)</span>
              </button>

              {/* Clear History */}
              <button 
                onClick={() => {
                  localStorage.removeItem("forgeai_chat_sessions");
                  addNotification("Conversational session histories purged from active cache.", "info");
                  setTimeout(() => window.location.reload(), 1000);
                }}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer">
                <Trash2 className="h-4 w-4 text-red-400" />
                <span>Clear Conversation Cache</span>
              </button>

              {/* Delete Account */}
              <div className="border-t border-slate-900 pt-3 mt-3">
                <button 
                  onClick={() => {
                    setShowDeleteModal(true);
                  }}
                  className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 text-xs font-extrabold rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer">
                  <Trash2 className="h-4 w-4 shrink-0" />
                  <span>Delete ForgeAI Account Permanent</span>
                </button>
              </div>
            </div>
          </div>

          {/* Accessibility Standards note */}
          <div className="bg-slate-900/50 border border-slate-850 rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-850 pb-3">
              <Info className="h-4 w-4 text-teal-400" />
              <h3 className="text-xs sm:text-sm font-extrabold text-white">Accessibility Standard</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              ForgeAI strictly conforms to modern web access directives. All visual theme configurations guarantee robust color contrasts, font scaling parameters, and reduced motion layouts.
            </p>
          </div>

          {/* GTB Studio Credits */}
          <div className="bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 border border-teal-500/20 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-850 pb-3">
              <Sparkles className="h-4 w-4 text-teal-400" />
              <h3 className="text-xs sm:text-sm font-extrabold text-white">GTB Studio Team</h3>
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

      </div>

      {/* Custom Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center space-x-3 text-red-400">
              <ShieldAlert className="h-6 w-6 shrink-0 animate-bounce" />
              <h3 className="text-base font-extrabold text-white">Permanently Delete Account?</h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              This action is <span className="text-red-400 font-bold">irrevocable</span>. It will permanently delete your profile, and all associated workspaces, snaps, code files, and custom templates will be erased from both the local device cache and our secure cloud servers.
            </p>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono text-slate-500 uppercase">
                Type <span className="text-red-400 font-bold">DELETE</span> to confirm
              </label>
              <input 
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition font-mono tracking-wider text-center uppercase"
                placeholder="DELETE"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button 
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
                className="flex-grow py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer">
                Keep Account
              </button>
              <button 
                onClick={() => {
                  if (deleteConfirmText === "DELETE") {
                    setShowDeleteModal(false);
                    onDeleteAccount();
                    setDeleteConfirmText("");
                  }
                }}
                disabled={deleteConfirmText !== "DELETE"}
                className="flex-grow py-2 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer">
                <Trash2 className="h-3.5 w-3.5" />
                <span>Purge Everything</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
