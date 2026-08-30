import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL || "https://lainjwlggcsvhjcwifnv.supabase.co";
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "sb_publishable_eQOoBZh6uR_FCMwlfT6kKQ_QOdHV4Ev";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: window.localStorage,
  }
});

// Auth Helper Functions
export const auth = {
  // Sign up with email and password
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign in with Google (Popup Flow)
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://forgeai-studio.netlify.app/auth/callback',
        skipBrowserRedirect: true,
      },
    });
    return { data, error };
  },

  // Sign in with GitHub
  async signInWithGitHub() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: 'https://forgeai-studio.netlify.app/auth/callback',
        skipBrowserRedirect: true,
      },
    });
    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Reset password for email
  async resetPasswordForEmail(email: string, options?: { redirectTo?: string }) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, options);
    return { error };
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

export async function checkSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.from('projects').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      return { success: false, message: error.message };
    }
    return { success: true, message: "Connected to Supabase PostgreSQL database successfully." };
  } catch (err: any) {
    return { success: false, message: err?.message || "Failed to reach Supabase server." };
  }
}
