import { create } from "zustand";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  loading: boolean;
  /** Initialize auth listener - call once on mount */
  init: () => () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loading: true,

  init: () => {
    const sb = getSupabaseBrowserClient();
    if (!sb) {
      set({ loading: false });
      return () => {};
    }

    // Check existing session
    sb.auth.getUser().then(({ data }) => {
      set({ user: data.user ?? null, loading: false });
    });

    // Listen for auth changes
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, loading: false });
    });

    return () => subscription.unsubscribe();
  },

  signInWithGoogle: async () => {
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth/callback?next=/track",
      },
    });
  },

  signInWithEmail: async (email: string) => {
    const sb = getSupabaseBrowserClient();
    if (!sb) return { error: "Auth not configured" };

    const { error } = await sb.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + "/auth/callback?next=/track",
      },
    });

    return { error: error?.message ?? null };
  },

  signOut: async () => {
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    await sb.auth.signOut();
    set({ user: null });
  },
}));
