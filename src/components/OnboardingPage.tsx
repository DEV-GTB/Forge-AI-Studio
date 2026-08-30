import React, { useState } from "react";
import { 
  Sparkles, GraduationCap, Check, 
  Code2, Play, Laptop, 
  UserCheck, ArrowRight, ArrowLeft, RefreshCw,
  Bot, User, Shield
} from "lucide-react";

interface OnboardingPageProps {
  userName: string;
  onOnboardingComplete: (preferences: {
    experience: string;
    interest: string;
    initialProjectName: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
  }) => void;
}

export default function OnboardingPage({ userName, onOnboardingComplete }: OnboardingPageProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Step 1: Identity Customization
  const [displayName, setDisplayName] = useState(userName || "Creator");
  
  const generatedBase = (userName || "creator").toLowerCase().replace(/[^a-z0-9]/g, "_");
  const [username, setUsername] = useState(() => {
    return generatedBase + "_" + Math.floor(Math.random() * 900 + 100);
  });

  const presetAvatars = [
    `https://api.dicebear.com/7.x/bottts/svg?seed=${generatedBase}`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=spark_${generatedBase}`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=cyber_${generatedBase}`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=forge_${generatedBase}`
  ];
  const [selectedAvatar, setSelectedAvatar] = useState(presetAvatars[0]);

  const [customRole, setCustomRole] = useState("");
  const [selectedRole, setSelectedRole] = useState("developer");

  // Step 2: Areas of Interest
  const [interest, setInterest] = useState<string>("websites");
  const [customInterest, setCustomInterest] = useState("");

  // Step 3: AI Companion Behavior/Tone
  const [aiTone, setAiTone] = useState("explanatory");
  const [customAiInstruction, setCustomAiInstruction] = useState("");

  // Step 4: Workspace Project Setup
  const [projName, setProjName] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("dark");

  // Generate a new random username suggestion on button click
  const generateRandomUsername = () => {
    const prefixes = ["forge", "dev", "tech", "code", "cyber", "builder", "stack", "pixel", "quantum", "apex"];
    const suffixes = ["dev", "creator", "x", "pro", "lab", "studio", "io", "core", "bot", "v2"];
    const base = displayName.trim().toLowerCase().replace(/[^a-z0-9]/g, "_") || "creator";
    const randPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const num = Math.floor(Math.random() * 99) + 1;

    const options = [
      `${randPrefix}_${base}`,
      `${base}_${randSuffix}`,
      `${base}_${num}`,
      `@${randPrefix}_${base}_${num}`.replace("@", "")
    ];

    const chosen = options[Math.floor(Math.random() * options.length)];
    setUsername(chosen);
  };

  const usernameSuggestions = [
    `${generatedBase}`,
    `dev_${generatedBase}`,
    `${generatedBase}_forge`,
    `innovator_${generatedBase}`
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = () => {
    localStorage.setItem("forgeai_onboarded", "true");
    
    const finalInterest = interest === "custom" && customInterest.trim() 
      ? "websites" 
      : interest;

    const finalDisplayName = displayName.trim() || userName || "Creator";
    const finalUsername = username.trim() || generatedBase;

    localStorage.setItem("forgeai_user_name", finalDisplayName);
    localStorage.setItem("forgeai_user_username", finalUsername);
    localStorage.setItem("forgeai_user_avatar", selectedAvatar);
    localStorage.setItem("forgeai_selected_theme", selectedTheme);
    document.documentElement.className = `theme-${selectedTheme}`;

    try {
      const existingPrefStr = localStorage.getItem("forgeai_preferences");
      const existingPref = existingPrefStr ? JSON.parse(existingPrefStr) : {};
      localStorage.setItem("forgeai_preferences", JSON.stringify({ ...existingPref, theme: selectedTheme }));
    } catch (e) {
      console.error(e);
    }

    if (aiTone === "custom" && customAiInstruction.trim()) {
      localStorage.setItem("forgeai_custom_ai_tone", customAiInstruction);
    } else {
      localStorage.setItem("forgeai_custom_ai_tone", aiTone);
    }

    onOnboardingComplete({
      experience: customRole || selectedRole,
      interest: finalInterest,
      initialProjectName: projName.trim() || `ForgeSpace_${interest}`,
      username: finalUsername,
      displayName: finalDisplayName,
      avatarUrl: selectedAvatar
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-teal-500/30 selection:text-teal-300 font-sans">
      
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-teal-500/5 rounded-full filter blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-xl bg-slate-900/50 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-xl flex flex-col justify-between min-h-[520px]">
        
        {/* Header progress bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-6">
          <div className="flex items-center space-x-2">
            <div className="h-7 w-7 bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Sparkles className="h-3.5 w-3.5 text-slate-950" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white font-mono">FORGE AI ONBOARDING</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button 
              onClick={handleSkip}
              className="text-[10px] font-mono text-teal-400 hover:text-teal-300 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20 transition cursor-pointer">
              Skip Setup
            </button>
            <div className="h-4 w-px bg-slate-800"></div>
            <span className="font-mono text-[10px] text-slate-400">
              Step {step} of {totalSteps}
            </span>
          </div>
        </div>

        {/* STEP 1: Custom Display Name, Username, & Avatar Selection */}
        {step === 1 && (
          <div className="space-y-5 flex-grow flex flex-col justify-center animate-in fade-in duration-200">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-widest block">STEP 1 • IDENTITY RESOLUTION</span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Profile & Username Selection
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Customize how your handle and avatar appear across chat logs, compiler output, and project commits.
              </p>
            </div>

            {/* Display Name & Avatar Header */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Display Name Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Display Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <User className="h-3.5 w-3.5" />
                  </span>
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Display Name"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-teal-500/80 rounded-xl py-2.5 pl-8 pr-3 text-xs text-white focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Username Handle Input with Randomizer Icon Button */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Custom Username Handle</label>
                <div className="relative username-input-container">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-teal-400 font-bold font-mono text-xs">
                    @
                  </span>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="username_handle"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-teal-500/80 rounded-xl py-2.5 pl-7 pr-9 text-xs font-mono text-teal-300 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={generateRandomUsername}
                    title="Generate Random Username"
                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-teal-400 transition cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Handle Chips */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider">Handle Suggestions</label>
              <div className="flex flex-wrap gap-1.5 username-suggestion-list">
                {usernameSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setUsername(suggestion)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition cursor-pointer ${
                      username === suggestion 
                        ? 'bg-teal-500 text-slate-950 font-bold' 
                        : 'bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400'
                    }`}>
                    @{suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar Selector */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Choose Profile Avatar</label>
              <div className="flex items-center space-x-3">
                {presetAvatars.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedAvatar(url)}
                    className={`h-11 w-11 rounded-2xl border-2 overflow-hidden p-0.5 transition cursor-pointer ${
                      selectedAvatar === url ? 'border-teal-400 bg-teal-500/20 scale-105' : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}>
                    <img src={url} alt="Avatar" className="h-full w-full object-cover rounded-xl" />
                  </button>
                ))}
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Your Main Specialty</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "developer", title: "Full-Stack Developer" },
                  { id: "designer", title: "UI/UX Designer" },
                  { id: "creator", title: "Creative Innovator" },
                  { id: "student", title: "Student / Learner" }
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => { setSelectedRole(role.id); setCustomRole(""); }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                      selectedRole === role.id && !customRole
                        ? 'bg-teal-500/15 border-teal-500 text-white font-bold' 
                        : 'bg-slate-950/60 border-slate-850/50 text-slate-400 hover:bg-slate-900'
                    }`}>
                    <span>{role.title}</span>
                    {selectedRole === role.id && !customRole && <Check className="h-3.5 w-3.5 text-teal-400" />}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: Creative Goals */}
        {step === 2 && (
          <div className="space-y-5 flex-grow flex flex-col justify-center animate-in fade-in duration-200">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-widest block">STEP 2 • CREATIVE GOALS</span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                What do you want to create?
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                ForgeAI tailors starter components, compiler settings, and AI prompts according to your focus.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: "apps", title: "Web & Mobile Apps", desc: "Interactive full-stack applications & tools", icon: Code2 },
                { id: "games", title: "Interactive Games", desc: "2D & 3D canvas games, arcade models", icon: Play },
                { id: "websites", title: "Websites & Portfolios", desc: "Responsive landing pages, stores, and blogs", icon: Laptop },
                { id: "ai", title: "AI & Neural Tools", desc: "Generative canvas, voice assistants, and bots", icon: Sparkles },
                { id: "learn", title: "Learn Programming", desc: "Interactive code tutorials & exercises", icon: GraduationCap }
              ].map((item) => {
                const IconComponent = item.icon;
                const isSelected = interest === item.id;
                return (
                  <div 
                    key={item.id}
                    onClick={() => { setInterest(item.id); setCustomInterest(""); }}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-start space-x-3 text-left ${
                      isSelected && !customInterest
                        ? 'bg-teal-500/10 border-teal-500 text-white' 
                        : 'bg-slate-950/80 border-slate-850/50 text-slate-400 hover:bg-slate-900/60'
                    }`}>
                    <div className={`p-1.5 rounded-xl shrink-0 ${isSelected && !customInterest ? 'bg-teal-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold block">{item.title}</h4>
                      <p className="text-[9px] text-slate-500 leading-normal">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Or describe custom goal</label>
              <input 
                type="text" 
                value={customInterest}
                onChange={(e) => {
                  setCustomInterest(e.target.value);
                  setInterest("custom");
                }}
                placeholder="E.g. Real-time audio synthesizer app..."
                className="w-full bg-slate-950/80 border border-slate-850 focus:border-teal-500/80 rounded-xl py-2 px-3.5 text-xs text-white focus:outline-none transition"
              />
            </div>
          </div>
        )}

        {/* STEP 3: AI Assistant Behavior */}
        {step === 3 && (
          <div className="space-y-5 flex-grow flex flex-col justify-center animate-in fade-in duration-200">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-widest block">STEP 3 • ENGINE CALIBRATION</span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Configure AI Personality
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Choose the behavioral style and explanation depth of the ForgeAI assistant companion.
              </p>
            </div>

            <div className="space-y-2">
              {[
                { id: "concise", title: "Artisan Speedrunner (Highly Concise)", desc: "Outputs direct code blocks with minimal verbal introduction. Perfect for fast implementation." },
                { id: "explanatory", title: "Mentor Explainer (Tutorial & Concepts)", desc: "Explains syntax line-by-line, teaches layout guidelines, and suggests architecture improvements." },
                { id: "creative", title: "Creative Spark (Immersive Pair Programmer)", desc: "Suggests experimental layouts, futuristic styling ideas, and micro-interactions." }
              ].map((tone) => (
                <div
                  key={tone.id}
                  onClick={() => { setAiTone(tone.id); setCustomAiInstruction(""); }}
                  className={`p-3 rounded-xl border cursor-pointer transition text-left flex items-start space-x-3 ${
                    aiTone === tone.id && !customAiInstruction
                      ? 'bg-teal-500/10 border-teal-500 text-white' 
                      : 'bg-slate-950/80 border-slate-850/50 text-slate-400 hover:bg-slate-900/60'
                  }`}>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    aiTone === tone.id && !customAiInstruction ? 'border-teal-400 bg-teal-400/20' : 'border-slate-700'
                  }`}>
                    {aiTone === tone.id && !customAiInstruction && <div className="h-1.5 w-1.5 rounded-full bg-teal-400" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">{tone.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">{tone.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Custom system instruction</label>
              <textarea 
                value={customAiInstruction}
                onChange={(e) => {
                  setCustomAiInstruction(e.target.value);
                  setAiTone("custom");
                }}
                rows={2}
                placeholder="E.g. Be a concise TypeScript architect..."
                className="w-full bg-slate-950/80 border border-slate-850 focus:border-teal-500/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none transition resize-none font-mono"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Launch Project Configuration */}
        {step === 4 && (
          <div className="space-y-5 flex-grow flex flex-col justify-center animate-in fade-in duration-200">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-widest block">STEP 4 • COMPILE MATRIX</span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Launch Workspace Project
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Provide a creative title for your starter repository space.
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Workspace Repository Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Laptop className="h-4 w-4" />
                  </span>
                  <input 
                    type="text" 
                    placeholder={`E.g. ${displayName}'s Next App`}
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-teal-500/80 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none transition font-sans"
                  />
                </div>
              </div>

              {/* Theme selection */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Visual Workspace Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "dark", label: "Forge Slate", bg: "bg-slate-950 border-slate-800" },
                    { id: "midnight", label: "Midnight", bg: "bg-neutral-950 border-neutral-800" },
                    { id: "ocean", label: "Ocean Sky", bg: "bg-sky-950 border-sky-900" },
                    { id: "forest", label: "Forest Wood", bg: "bg-stone-950 border-stone-900" }
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`p-2 rounded-xl border text-center transition flex flex-col justify-between items-center cursor-pointer h-14 ${
                        selectedTheme === theme.id 
                          ? 'bg-teal-500/15 border-teal-500 text-teal-400' 
                          : `${theme.bg} text-slate-500 hover:text-slate-300`
                      }`}>
                      <div className="h-2.5 w-2.5 rounded-full bg-teal-400 border border-teal-500/20"></div>
                      <span className="text-[9px] font-bold block">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Card */}
              <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-xl flex items-center space-x-3">
                <img src={selectedAvatar} alt="Avatar" className="h-9 w-9 rounded-xl border border-teal-500/40 shrink-0" />
                <div className="space-y-0.5 overflow-hidden">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white truncate">{displayName}</span>
                    <span className="text-[10px] font-mono text-teal-400">@{username}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">Specialty: {customRole || selectedRole} • Ready to compile!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 mt-6">
          {step > 1 ? (
            <button 
              type="button"
              onClick={handleBack}
              className="py-2 px-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition flex items-center space-x-1.5 cursor-pointer">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button 
            type="button"
            onClick={handleNext}
            className="py-2.5 px-5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-teal-500/20 flex items-center space-x-1.5 transition transform hover:-translate-y-0.5 cursor-pointer">
            <span>{step === totalSteps ? "Launch Workspace" : "Continue"}</span>
            {step === totalSteps ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
