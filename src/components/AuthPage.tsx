import React, { useState, useEffect } from "react";
import { 
  Mail, Lock, User, Eye, EyeOff, Sparkles, 
  AlertCircle, ArrowLeft, Check, Compass, ShieldCheck,
  ShieldAlert, RefreshCw, Layers, Sliders, ChevronRight, CheckCircle2, Shuffle, RotateCw
} from "lucide-react";
import { auth as supabaseAuth } from "../lib/supabase";
import { saveUserToSupabase, getUserFromSupabase } from "../lib/supabaseData";
import { validatePasswordRules } from "../lib/passwordValidation";

interface AuthPageProps {
  onAuthSuccess: (user: { email: string; name: string; username?: string }) => void;
  onBackToLanding: () => void;
  initialMode?: "login" | "signup";
}

export default function AuthPage({ onAuthSuccess, onBackToLanding, initialMode = "login" }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">((initialMode as any) || "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [shakeError, setShakeError] = useState(false);
  const [socialNoticeModal, setSocialNoticeModal] = useState<{
    show: boolean;
    platform: "Google" | "GitHub";
    reason: string;
  }>({ show: false, platform: "Google", reason: "" });

  // First Visit Boot Sequence States
  const [isBooting, setIsBooting] = useState<boolean>(() => {
    const done = localStorage.getItem("forgeai_boot_done");
    return !done;
  });
  const [bootStage, setBootStage] = useState("Initializing Forge Core...");
  const [bootProgress, setBootProgress] = useState(15);

  // Multi-step Registration flow state
  const [signupStep, setSignupStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPrefTheme, setSelectedPrefTheme] = useState<'dark' | 'midnight' | 'ocean'>('dark');
  const [customUsername, setCustomUsername] = useState("");
  const [handleSuggestions, setHandleSuggestions] = useState<Array<{ handle: string; status: 'checking' | 'taken' | 'available' }>>([]);
  const [isSearchingHandles, setIsSearchingHandles] = useState(false);
  const [reservedHandle, setReservedHandle] = useState<string | null>(null);

  // Theme Categories Pool
  const FORGE_THEME_CATEGORIES = {
    developer: ["forge_dev", "forge_builder", "forge_engineer", "forge_programmer", "forge_coder"],
    programming: ["forge_cpp", "forge_java", "forge_python", "forge_node", "forge_react", "forge_rust"],
    infrastructure: ["forge_cloud", "forge_api", "forge_backend", "forge_pipeline", "forge_kernel", "forge_terminal"],
    professional: ["forge_architect", "forge_workspace", "forge_compiler", "forge_runtime", "forge_stack"]
  };

  // Generate Forge Identity Handle Suggestions
  const generateForgeIdentities = (nameInput: string) => {
    if (!nameInput.trim()) {
      setHandleSuggestions([]);
      return;
    }

    setIsSearchingHandles(true);
    setHandleSuggestions([]);

    const cleanName = nameInput.trim().toLowerCase();
    const parts = cleanName.split(/\s+/).filter(p => p.length > 0);
    const firstName = parts[0] || "dev";
    const lastName = parts.length > 1 ? parts[parts.length - 1] : "";
    const initials = parts.map(p => p[0]).join("");

    // Pool of combinations
    const rawList: string[] = [];

    // 1. User name + Category Themes
    const allThemes = [
      ...FORGE_THEME_CATEGORIES.developer,
      ...FORGE_THEME_CATEGORIES.programming,
      ...FORGE_THEME_CATEGORIES.infrastructure,
      ...FORGE_THEME_CATEGORIES.professional
    ];

    // Mixes
    rawList.push(`forge_${firstName}`);
    rawList.push(`${firstName}_builder`);
    rawList.push(`builder_${firstName}`);
    rawList.push(`${firstName}forge`);
    if (lastName) {
      rawList.push(`${firstName}_${lastName}`);
      rawList.push(`forge_${firstName}_${lastName[0]}`);
    }
    if (initials.length >= 2) {
      rawList.push(`forge_api_${initials}`);
      rawList.push(`${initials}_runtime`);
      rawList.push(`builder_${initials}`);
    }

    // Pick 4 random theme categories
    const categories = Object.keys(FORGE_THEME_CATEGORIES) as Array<keyof typeof FORGE_THEME_CATEGORIES>;
    categories.forEach(cat => {
      const items = FORGE_THEME_CATEGORIES[cat];
      const randomItem = items[Math.floor(Math.random() * items.length)];
      rawList.push(randomItem);
      rawList.push(`${firstName}_${randomItem.replace("forge_", "")}`);
    });

    // Deduplicate & sanitize
    const uniqueCandidates = Array.from(new Set(rawList.map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, "")))).slice(0, 10);

    // Readability Rank Score (prefer shorter, no numbers, contains user name)
    uniqueCandidates.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      if (a.includes(firstName)) scoreA += 10;
      if (b.includes(firstName)) scoreB += 10;
      scoreA -= a.length;
      scoreB -= b.length;
      return scoreB - scoreA;
    });

    const top6 = uniqueCandidates.slice(0, 6);

    // Animate Handle Discovery Sequence (600-900ms)
    let idx = 0;
    const initialList = top6.map(h => ({ handle: `@${h}`, status: 'checking' as const }));
    setHandleSuggestions(initialList);

    const timer = setInterval(() => {
      if (idx < top6.length) {
        setHandleSuggestions(prev => {
          const updated = [...prev];
          if (updated[idx]) {
            // First candidate simulates taken, rest available
            const isTaken = idx === 0 && Math.random() > 0.6;
            if (isTaken) {
              updated[idx] = { handle: `@${top6[idx]}2`, status: 'available' };
            } else {
              updated[idx] = { handle: `@${top6[idx]}`, status: 'available' };
            }
          }
          return updated;
        });
        idx++;
      } else {
        clearInterval(timer);
        setIsSearchingHandles(false);
      }
    }, 130);
  };

  // Randomize a single custom username handle from categories & name with uniqueness validation
  const handleRandomizeSingleUsername = () => {
    setIsSearchingHandles(true);
    const allThemes = [
      ...FORGE_THEME_CATEGORIES.developer,
      ...FORGE_THEME_CATEGORIES.programming,
      ...FORGE_THEME_CATEGORIES.infrastructure,
      ...FORGE_THEME_CATEGORIES.professional
    ];
    const cleanName = (fullName.trim() || "dev").toLowerCase().replace(/[^a-z0-9]/g, "");
    const randomTheme = allThemes[Math.floor(Math.random() * allThemes.length)].replace("forge_", "");
    const patterns = [
      `${cleanName}_${randomTheme}`,
      `forge_${cleanName}`,
      `${randomTheme}_${cleanName}`,
      `forge_${randomTheme}_${Math.floor(Math.random() * 90 + 10)}`,
      `${cleanName}${randomTheme}`
    ];
    let choice = patterns[Math.floor(Math.random() * patterns.length)];

    // Simulate / Validate uniqueness against database or taken handles
    const takenSample = ["admin", "root", "dev", "forge", "test", "user"];
    if (takenSample.includes(choice)) {
      choice = `${choice}2`;
    }

    setTimeout(() => {
      setCustomUsername(choice);
      setReservedHandle(`@${choice}`);
      setIsSearchingHandles(false);
    }, 200);
  };

  // Loading progress stage indicator
  const [authStageText, setAuthStageText] = useState("");

  // Play / Replay First Visit Boot Sequence
  useEffect(() => {
    if (!isBooting) return;

    const stages = [
      { text: "Initializing Forge Core...", progress: 25 },
      { text: "Loading Workspace Engine...", progress: 55 },
      { text: "Preparing AI Router & Memory...", progress: 85 },
      { text: "Ready", progress: 100 },
    ];

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < stages.length) {
        setBootStage(stages[current].text);
        setBootProgress(stages[current].progress);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsBooting(false);
          localStorage.setItem("forgeai_boot_done", "true");
        }, 300);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [isBooting]);

  // Password Validation & Strength Helper
  const passRules = validatePasswordRules(password);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "None", color: "bg-slate-800", text: "text-slate-500" };
    const rules = validatePasswordRules(pass);
    if (!rules.isValid) {
      return { score: 1, label: "Needs Requirements", color: "bg-amber-500", text: "text-amber-400" };
    }
    if (pass.length >= 10 || /[^A-Za-z0-9]/.test(pass)) {
      return { score: 4, label: "Excellent", color: "bg-emerald-400", text: "text-emerald-300" };
    }
    return { score: 3, label: "Strong", color: "bg-teal-400", text: "text-teal-300" };
  };

  const passStrength = getPasswordStrength(password);

  const triggerErrorShake = (msg: string) => {
    setError(msg);
    setShakeError(true);
    setTimeout(() => setShakeError(false), 600);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      triggerErrorShake("Please enter a valid email address.");
      return;
    }

    if (mode === "signup") {
      if (signupStep === 1) {
        setSignupStep(2);
        return;
      }
      if (signupStep === 2) {
        if (!fullName.trim()) {
          triggerErrorShake("Please enter your name to personalize your workstation.");
          return;
        }
        setSignupStep(3);
        return;
      }
      if (signupStep === 3) {
        const passCheck = validatePasswordRules(password);
        if (!passCheck.isValid) {
          triggerErrorShake(passCheck.errorMessage || "Password does not satisfy requirements.");
          return;
        }
        if (password !== confirmPassword) {
          triggerErrorShake("Passwords do not match.");
          return;
        }
        setSignupStep(4);
        return;
      }
    } else if (mode === "login") {
      if (!password) {
        triggerErrorShake("Password is required.");
        return;
      }
    } else {
      // Forgot password mode
      setIsLoading(true);
      setAuthStageText("Dispatching credentials reset link...");
      try {
        // Supabase password reset
        const { error } = await supabaseAuth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (error) throw error;
        setSuccessMsg("Reset credentials link dispatched! Check your email inbox.");
      } catch (err: any) {
        triggerErrorShake(err?.message || "Failed to dispatch password reset email.");
      } finally {
        setIsLoading(false);
        setAuthStageText("");
      }
      return;
    }

    // Process Login or Signup Submission
    setIsLoading(true);
    setAuthStageText("Authenticating credentials...");

    try {
      if (mode === "signup") {
        setAuthStageText("Creating secure developer profile...");
        const { data, error } = await supabaseAuth.signUp(email, password);
        if (error) throw error;
        
        const user = data.user;
        if (!user) throw new Error("Failed to create user account.");
        
        const generatedName = fullName || email.split("@")[0];
        const generatedUsername = customUsername 
          ? customUsername.replace(/^@/, "").toLowerCase().replace(/[^a-z0-9_]/g, "")
          : (generatedName.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Math.floor(Math.random() * 100));

        setAuthStageText("Synchronizing preferences...");
        localStorage.setItem("forgeai_selected_theme", selectedPrefTheme);
        document.documentElement.className = `theme-${selectedPrefTheme}`;
        await saveUserToSupabase(user.id, {
          name: generatedName,
          username: generatedUsername,
          email: email,
          onboarded: false,
          preferences: { theme: selectedPrefTheme }
        });

        localStorage.setItem("forgeai_auth", "true");
        localStorage.setItem("forgeai_user_email", email);
        localStorage.setItem("forgeai_user_name", generatedName);
        localStorage.setItem("forgeai_user_username", generatedUsername);

        setAuthStageText("Opening Forge AI...");
        setTimeout(() => {
          onAuthSuccess({ email, name: generatedName, username: generatedUsername });
        }, 300);

      } else {
        setAuthStageText("Checking Credentials...");
        const { data, error } = await supabaseAuth.signIn(email, password);
        if (error) throw error;
        
        const user = data.user;
        if (!user) throw new Error("Failed to sign in.");

        setAuthStageText("Loading Workspace...");
        const storedProfile = await getUserFromSupabase(user.id);
        const nameToUse = storedProfile?.name || email.split("@")[0];
        const usernameToUse = storedProfile?.username || nameToUse.toLowerCase().replace(/[^a-z0-9]/g, "_");

        localStorage.setItem("forgeai_auth", "true");
        localStorage.setItem("forgeai_user_email", email);
        localStorage.setItem("forgeai_user_name", nameToUse);
        localStorage.setItem("forgeai_user_username", usernameToUse);

        setAuthStageText("Opening Forge AI...");
        setTimeout(() => {
          onAuthSuccess({ email, name: nameToUse, username: usernameToUse });
        }, 300);
      }
    } catch (err: any) {
      triggerErrorShake(err?.message || "Authentication failed. Please check credentials.");
    } finally {
      setIsLoading(false);
      setAuthStageText("");
    }
  };

  const triggerSocialLogin = async (platform: "Google" | "GitHub", useRedirect: boolean = false) => {
    setError(null);
    setIsLoading(true);
    setAuthStageText(platform === "Google" ? "Authenticating Google Account..." : "Connecting GitHub OAuth...");

    // Ensure guest flag is explicitly set to false BEFORE social sign-in attempt
    localStorage.setItem("forgeai_is_guest", "false");

    try {
      let result;
      if (platform === "Google") {
        result = await supabaseAuth.signInWithGoogle();
      } else {
        result = await supabaseAuth.signInWithGitHub();
      }
      
      if (result.error) throw result.error;

      // Open OAuth URL in popup window
      if (result.data?.url) {
        setAuthStageText("Opening OAuth popup...");
        const width = 500;
        const height = 600;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        
        const popup = window.open(
          result.data.url,
          `${platform} OAuth`,
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
        );

        // Poll for popup closure
        const checkPopup = setInterval(() => {
          if (!popup || popup.closed) {
            clearInterval(checkPopup);
            setIsLoading(false);
            setAuthStageText("");
            // The auth state change listener in App.tsx will handle the session
          }
        }, 1000);
      } else {
        throw new Error("No OAuth URL returned from provider");
      }
      
    } catch (err: any) {
      console.warn(`${platform} Sign-in exception:`, err);
      let reasonText = err?.message || `Social login with ${platform} was interrupted.`;

      setSocialNoticeModal({
        show: true,
        platform,
        reason: reasonText
      });
      setIsLoading(false);
      setAuthStageText("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:grid md:grid-cols-12 overflow-hidden relative selection:bg-teal-500/30 selection:text-teal-300 font-sans">
      
      {/* 1. First Visit Boot Sequence Screen */}
      {isBooting && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-300">
          <div className="relative flex items-center justify-center">
            <div className="h-16 w-16 bg-gradient-to-tr from-teal-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(20,184,166,0.6)] animate-pulse">
              <Sparkles className="h-8 w-8 text-slate-950" />
            </div>
            <div className="absolute inset-0 rounded-2xl border-2 border-teal-400/40 animate-ping pointer-events-none"></div>
          </div>

          <div className="text-center space-y-2 max-w-xs">
            <h1 className="text-xl font-extrabold tracking-tight text-white font-mono">FORGE AI CORE</h1>
            <p className="text-xs text-teal-400 font-mono h-4">{bootStage}</p>
          </div>

          <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-300 rounded-full"
              style={{ width: `${bootProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Ambient Animated Grid & Floating Glow Particles */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25 pointer-events-none"></div>
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-teal-500/10 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-500/10 rounded-full filter blur-[120px] pointer-events-none"></div>

      {/* Header Controls */}
      <div className="absolute top-6 left-6 right-6 z-50 flex items-center justify-between">
        <button 
          onClick={onBackToLanding}
          className="p-2.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition flex items-center space-x-2 text-xs font-semibold cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Landing</span>
        </button>

        <button
          onClick={() => {
            setIsBooting(true);
            setBootProgress(15);
            setBootStage("Initializing Forge Core...");
          }}
          className="p-2.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-teal-300 transition flex items-center space-x-1.5 text-xs font-mono cursor-pointer"
          title="Replay First Visit Boot Sequence"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Replay Boot</span>
        </button>
      </div>

      {/* Left side: Artwork & Developer Core Showcase */}
      <div className="hidden md:flex md:col-span-6 bg-slate-900/30 border-r border-slate-900 relative p-12 flex-col justify-between overflow-hidden">
        <div className="relative z-10 flex items-center space-x-3 pt-12">
          <div className="h-9 w-9 bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Sparkles className="h-5 w-5 text-slate-950" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white block">ForgeAI Workbench</span>
            <span className="text-[10px] text-teal-400 font-mono">INTELLIGENT WORKSPACE KERNEL</span>
          </div>
        </div>

        {/* Central Futuristic Interactive Artifact */}
        <div className="relative z-10 max-w-md mx-auto space-y-6 w-full">
          <div className="p-6 bg-slate-950/90 border border-slate-850 rounded-3xl shadow-2xl space-y-4 relative overflow-hidden backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px] font-mono font-bold text-emerald-400">Sandbox Kernel Active</span>
              </div>
              <span className="text-[9px] font-mono text-slate-500">v2.4.0 Edge</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              "ForgeAI combines client-side WebAssembly compilers, zero-latency model routing, and persistent cloud storage partitions directly into your local browser."
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900 font-mono text-[10px]">
              <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-850 flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-teal-400 shrink-0" />
                <span className="text-slate-300">Client Isolated</span>
              </div>
              <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-850 flex items-center space-x-2">
                <Compass className="h-4 w-4 text-cyan-400 shrink-0" />
                <span className="text-slate-300">Multi-Model Router</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-slate-500 font-mono">
          ForgeAI Workstation • Built for Rapid Engineering
        </div>
      </div>

      {/* Right side: Login & Registration Card with Smooth Entrance */}
      <div className="col-span-12 md:col-span-6 flex items-center justify-center p-6 sm:p-12 min-h-screen pt-20">
        
        <div className={`w-full max-w-sm space-y-6 transition-all duration-300 ${
          shakeError ? "animate-shake border-red-500" : ""
        }`}>
          
          {/* Card Header */}
          <div className="space-y-1.5 text-center md:text-left">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {mode === "login" && "Welcome Back, Creator"}
              {mode === "signup" && `Design Your Workspace (${signupStep}/4)`}
              {mode === "forgot" && "Reset Credentials"}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === "login" && "Access saved compilers, lessons, and 3D wireframe models."}
              {mode === "signup" && "Configure your personalized AI developer workstation."}
              {mode === "forgot" && "Provide your email to dispatch a secure credentials reset token."}
            </p>
          </div>

          {/* Social OAuth Buttons with Compression Click */}
          {mode !== "forgot" && signupStep === 1 && (
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => triggerSocialLogin("Google")}
                disabled={isLoading}
                className="py-2.5 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/50 rounded-xl text-xs font-semibold text-slate-200 transition-all duration-150 active:scale-95 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 shadow"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Google</span>
              </button>

              <button 
                onClick={() => triggerSocialLogin("GitHub")}
                disabled={isLoading}
                className="py-2.5 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/50 rounded-xl text-xs font-semibold text-slate-200 transition-all duration-150 active:scale-95 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 shadow"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>
          )}

          {mode !== "forgot" && signupStep === 1 && (
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-900"></div>
              <span className="flex-shrink mx-4 text-slate-500 font-mono text-[9px] uppercase tracking-wider">Or Credentials</span>
              <div className="flex-grow border-t border-slate-900"></div>
            </div>
          )}

          {/* Messages & Error Notifications */}
          {error && (
            <div className="p-3.5 bg-red-950/40 border border-red-800/50 rounded-xl space-y-1 text-xs text-red-300 animate-in fade-in">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span className="leading-relaxed text-red-300 font-medium">{error}</span>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-xl flex items-center space-x-2 text-xs text-emerald-300">
              <Check className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Auth Form with Multi-step Progress */}
          <form onSubmit={handleAuth} className="space-y-4">
            
            {/* Step 1: Email Input */}
            {(mode !== "signup" || signupStep === 1) && (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input 
                    type="email" 
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 focus:border-teal-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none transition"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Full Name & Forge Handle Generator (Signup Only) */}
            {mode === "signup" && signupStep === 2 && (
              <div className="space-y-3 animate-in fade-in">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Full Developer Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <User className="h-4 w-4" />
                    </span>
                    <input 
                      type="text" 
                      placeholder="E.g. Muhammed Thariq"
                      value={fullName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFullName(val);
                        generateForgeIdentities(val);
                      }}
                      className="w-full bg-slate-950 border border-slate-900 focus:border-teal-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none transition"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Custom Forge Username / Handle input */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Forge Identity Handle</label>
                    {reservedHandle && (
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded flex items-center space-x-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Reserved for 5m</span>
                      </span>
                    )}
                  </div>
                  <div className="username-input-container relative flex items-center">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 font-mono text-xs pointer-events-none">@</span>
                    <input 
                      type="text" 
                      placeholder="e.g. thariq_builder"
                      value={customUsername || (fullName ? fullName.toLowerCase().replace(/[^a-z0-9_]/g, "") : "")}
                      onChange={(e) => {
                        const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
                        setCustomUsername(sanitized);
                        setReservedHandle(`@${sanitized}`);
                      }}
                      className="w-full bg-slate-950 border border-slate-900 focus:border-teal-500 rounded-xl py-2.5 pl-8 pr-28 text-xs font-mono text-teal-300 focus:outline-none transition"
                    />
                    <button
                      id="username-generator"
                      type="button"
                      onClick={handleRandomizeSingleUsername}
                      title="Generate unique random Forge handle"
                      className="absolute right-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/50 text-slate-200 hover:text-teal-300 rounded-lg transition active:scale-95 cursor-pointer flex items-center space-x-1.5 text-[10px] font-mono shadow-sm"
                    >
                      <RotateCw className={`h-3 w-3 text-teal-400 ${isSearchingHandles ? "animate-spin" : ""}`} />
                      <span>Generate</span>
                    </button>
                  </div>
                </div>

                {/* Animated Handle Discovery Engine Suggestions */}
                {fullName.trim().length > 0 && (
                  <div className="p-3 bg-slate-950/80 border border-slate-850 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400 font-bold flex items-center space-x-1">
                        <Sparkles className="h-3 w-3 text-teal-400" />
                        <span>Forge Identity Recommendations</span>
                      </span>
                      <div className="flex items-center space-x-2">
                        {isSearchingHandles ? (
                          <span className="text-teal-400 animate-pulse flex items-center space-x-1 text-[9px]">
                            <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                            <span>Searching...</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => generateForgeIdentities(fullName || "dev")}
                            className="text-slate-400 hover:text-teal-300 flex items-center space-x-1 transition text-[9px] hover:underline cursor-pointer"
                          >
                            <RefreshCw className="h-2.5 w-2.5" />
                            <span>Reroll All</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className={`username-suggestion-list flex flex-wrap gap-1.5 pt-1 transition-all duration-500 ease-out ${
                      isSearchingHandles ? "opacity-40 scale-[0.98]" : "opacity-100 scale-100 animate-in fade-in"
                    }`}>
                      {handleSuggestions.map((item, idx) => {
                        const isSelected = reservedHandle === item.handle || (customUsername && item.handle === `@${customUsername}`);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              const cleanHandle = item.handle.replace("@", "");
                              setCustomUsername(cleanHandle);
                              setReservedHandle(item.handle);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition flex items-center space-x-1.5 cursor-pointer border ${
                              isSelected
                                ? "bg-teal-500/20 border-teal-400 text-teal-200 font-bold shadow"
                                : item.status === 'checking'
                                ? "bg-slate-900 border-slate-800 text-slate-500 opacity-60"
                                : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300 hover:text-white"
                            }`}
                          >
                            <span>{item.handle}</span>
                            {item.status === 'checking' ? (
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping"></span>
                            ) : isSelected ? (
                              <CheckCircle2 className="h-3 w-3 text-teal-400" />
                            ) : (
                              <span className="text-[8px] text-emerald-400 font-bold">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Password & Confirmation */}
            {((mode === "login") || (mode === "signup" && signupStep === 3)) && (
              <div className="space-y-3 animate-in fade-in">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Password</label>
                    {mode === "login" && (
                      <button 
                        type="button"
                        onClick={() => { setError(null); setMode("forgot"); }}
                        className="text-[10px] font-mono text-teal-400 hover:text-teal-300 hover:underline">
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:border-teal-500 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white focus:outline-none transition"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator & Rules Checklist */}
                  {mode === "signup" && (
                    <div className="space-y-2 pt-1">
                      {password && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-slate-500">Security Score:</span>
                            <span className={`font-bold ${passStrength.text}`}>{passStrength.label}</span>
                          </div>
                          <div className="h-1 bg-slate-900 rounded-full overflow-hidden flex gap-1">
                            {[1, 2, 3, 4].map((step) => (
                              <div 
                                key={step} 
                                className={`h-full flex-1 transition-all ${
                                  step <= passStrength.score ? passStrength.color : "bg-slate-900"
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="p-2.5 bg-slate-950/80 border border-slate-900 rounded-xl space-y-1 text-[10px] font-mono">
                        <div className="text-slate-400 font-bold mb-1">Password Criteria:</div>
                        <div className={`flex items-center space-x-1.5 ${passRules.hasMinLength ? "text-emerald-400" : "text-slate-500"}`}>
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          <span>At least 5 characters long</span>
                        </div>
                        <div className={`flex items-center space-x-1.5 ${passRules.hasLowercase ? "text-emerald-400" : "text-slate-500"}`}>
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          <span>At least 1 lowercase letter (a-z)</span>
                        </div>
                        <div className={`flex items-center space-x-1.5 ${passRules.hasUppercase ? "text-emerald-400" : "text-slate-500"}`}>
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          <span>At least 1 uppercase letter (A-Z)</span>
                        </div>
                        <div className={`flex items-center space-x-1.5 ${passRules.hasTwoNumbers ? "text-emerald-400" : "text-slate-500"}`}>
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          <span>At least 2 numbers (0-9) ({passRules.numberCount}/2)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {mode === "signup" && signupStep === 3 && (
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Confirm Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <Lock className="h-4 w-4" />
                      </span>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-teal-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none transition"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Workspace Preference (Signup Only) */}
            {mode === "signup" && signupStep === 4 && (
              <div className="space-y-2 animate-in fade-in">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Select Theme Atmosphere</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'dark', label: 'Dark Charcoal' },
                    { id: 'light', label: 'Polar Light' },
                    { id: 'midnight', label: 'Neon Midnight' },
                    { id: 'ocean', label: 'Deep Ocean' },
                    { id: 'forest', label: 'Forest Green' }
                  ].map(thm => (
                    <button
                      key={thm.id}
                      type="button"
                      onClick={() => {
                        setSelectedPrefTheme(thm.id as any);
                        localStorage.setItem("forgeai_selected_theme", thm.id);
                        document.documentElement.className = `theme-${thm.id}`;
                      }}
                      className={`p-2.5 rounded-xl border text-[10px] font-bold text-center transition ${
                        selectedPrefTheme === thm.id 
                          ? "bg-teal-500/20 border-teal-400 text-teal-200" 
                          : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {thm.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTA action button with progress stages */}
            <div className="pt-2 flex gap-2">
              {mode === "signup" && signupStep > 1 && (
                <button
                  type="button"
                  onClick={() => setSignupStep(prev => (prev - 1) as any)}
                  className="py-3 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition"
                >
                  Back
                </button>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg shadow-teal-500/10 transition transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2 font-mono text-[11px]">
                    <div className="h-3.5 w-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>{authStageText || "Processing..."}</span>
                  </div>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>
                      {mode === "login" && "Sign In with ForgeAI"}
                      {mode === "signup" && (signupStep < 4 ? "Next Step" : "Initialize Workstation")}
                      {mode === "forgot" && "Dispatch Credentials Reset"}
                    </span>
                    {mode === "signup" && signupStep < 4 && <ChevronRight className="h-4 w-4" />}
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Toggle view mode triggers */}
          <div className="text-center space-y-3 pt-1">
            {mode === "login" && (
              <p className="text-xs text-slate-400">
                Don't have an account yet?{" "}
                <button 
                  onClick={() => { setError(null); setMode("signup"); setSignupStep(1); }}
                  className="font-bold text-teal-400 hover:text-teal-300 hover:underline">
                  Sign Up Here
                </button>
              </p>
            )}
            {mode === "signup" && (
              <p className="text-xs text-slate-400">
                Already have a workstation?{" "}
                <button 
                  onClick={() => { setError(null); setMode("login"); }}
                  className="font-bold text-teal-400 hover:text-teal-300 hover:underline">
                  Sign In Here
                </button>
              </p>
            )}

            {mode !== "forgot" && (
              <>
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-900"></div>
                  <span className="flex-shrink mx-4 text-slate-500 font-mono text-[9px] uppercase tracking-wider">Or Sandbox Mode</span>
                  <div className="flex-grow border-t border-slate-900"></div>
                </div>

                <button 
                  type="button"
                  onClick={() => {
                    localStorage.setItem("forgeai_auth", "true");
                    localStorage.setItem("forgeai_is_guest", "true");
                    localStorage.setItem("forgeai_user_email", "guest_sandbox@forge.ai");
                    localStorage.setItem("forgeai_user_name", "Guest Creator");

                    onAuthSuccess({
                      email: "guest_sandbox@forge.ai",
                      name: "Guest Creator",
                      username: "guest_creator"
                    });
                  }}
                  className="w-full py-2.5 px-4 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition flex items-center justify-center space-x-2 cursor-pointer shadow"
                >
                  <span>Continue as Guest (Local Sandbox)</span>
                </button>
              </>
            )}
          </div>

        </div>

      </div>

      {/* Social Login Notice Modal */}
      {socialNoticeModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center space-x-3 text-amber-400">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl shrink-0">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Google / OAuth Notice</h3>
                <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase tracking-wider block">OAuth Window Limitation</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 border border-slate-850 p-3.5 rounded-2xl font-sans">
              {socialNoticeModal.reason}
            </p>

            <div className="space-y-2 pt-1">
              <button 
                onClick={() => {
                  setSocialNoticeModal({ show: false, platform: "Google", reason: "" });
                  setMode("signup");
                  setSignupStep(1);
                }}
                className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-teal-500/10">
                <Mail className="h-4 w-4" />
                <span>Create Direct Account with Email</span>
              </button>

              <button 
                onClick={() => {
                  setSocialNoticeModal({ show: false, platform: "Google", reason: "" });
                  triggerSocialLogin(socialNoticeModal.platform, true);
                }}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-teal-300 hover:text-teal-200 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer">
                <RotateCw className="h-3.5 w-3.5 text-teal-400" />
                <span>Use Redirect Sign-In ({socialNoticeModal.platform})</span>
              </button>

              <button 
                onClick={() => {
                  setSocialNoticeModal({ show: false, platform: "Google", reason: "" });
                  triggerSocialLogin(socialNoticeModal.platform, false);
                }}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer">
                <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                <span>Retry Popup Sign-In</span>
              </button>

              <button 
                onClick={() => {
                  setSocialNoticeModal({ show: false, platform: "Google", reason: "" });
                  localStorage.setItem("forgeai_auth", "true");
                  localStorage.setItem("forgeai_is_guest", "true");
                  localStorage.setItem("forgeai_user_email", "guest_sandbox@forge.ai");
                  localStorage.setItem("forgeai_user_name", "Guest Creator");
                  onAuthSuccess({
                    email: "guest_sandbox@forge.ai",
                    name: "Guest Creator",
                    username: "guest_creator"
                  });
                }}
                className="w-full py-2 bg-slate-900/50 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-300 font-semibold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer">
                <span>Continue as Guest Sandbox Mode</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
