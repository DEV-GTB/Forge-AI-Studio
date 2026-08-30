import React, { useState } from "react";
import { User, Sparkles, Check, ArrowRight, ShieldCheck } from "lucide-react";

interface OAuthCustomizationPageProps {
  onCustomizationComplete: (user: { email?: string; name: string; username?: string }) => void;
  defaultName?: string;
  defaultUsername?: string;
  defaultEmail?: string;
}

export default function OAuthCustomizationPage({
  onCustomizationComplete,
  defaultName = "",
  defaultUsername = "",
  defaultEmail = ""
}: OAuthCustomizationPageProps) {
  const [fullName, setFullName] = useState(defaultName);
  const [customUsername, setCustomUsername] = useState(defaultUsername);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = fullName.trim();
    const cleanUsername = customUsername.trim();

    if (!cleanName || !cleanUsername) {
      setError("Please fill in your permanent name and username.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      onCustomizationComplete({
        email: defaultEmail || undefined,
        name: cleanName,
        username: cleanUsername.toLowerCase()
      });
    } catch (err: any) {
      setError(err?.message || "Failed to save profile details.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateUsernameSuggestion = () => {
    const baseName = fullName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    const suggestions = [
      `${baseName || "creator"}_forge`,
      `forge_${baseName || "creator"}`,
      `${baseName || "creator"}_studio`,
      `${baseName || "creator"}_build`
    ];
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    setCustomUsername(randomSuggestion);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 mb-4 shadow-lg shadow-teal-500/20">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Set up your profile</h1>
          <p className="text-slate-400 text-sm">Temporary local-only account flow</p>
          {defaultEmail && <p className="text-teal-400 text-xs font-mono mt-1">{defaultEmail}</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
              Permanent Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition"
                required
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">This name is permanent and unique for your workspace identity.</p>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">@</span>
              <input
                type="text"
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="Choose a username"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition"
                required
              />
              <button
                type="button"
                onClick={generateUsernameSuggestion}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-teal-400 transition"
                title="Generate suggestion"
              >
                <Sparkles className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Username can repeat and does not need uniqueness restrictions for this temporary build.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <div className="p-3 bg-teal-500/5 border border-teal-500/10 rounded-lg flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400 leading-relaxed">
              This temporary account setup keeps things local and avoids OAuth or email login dependency while still giving you a clean profile identity.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Complete Setup</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
