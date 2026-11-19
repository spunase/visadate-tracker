import { create } from "zustand";
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

const EMAIL_STORAGE_KEY = "visadate_email_for_signin";

interface AuthState {
  user: User | null;
  loading: boolean;
  /** Initialize auth listener - call once on mount */
  init: () => () => void;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  completeEmailLinkSignIn: (
    href: string,
    emailOverride?: string,
  ) => Promise<{ error: string | null; needsEmail?: boolean }>;
  signOut: () => Promise<void>;
}

function getAuthErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return "Authentication failed. Please try again.";
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loading: true,

  init: () => {
    const auth = getFirebaseAuth();
    if (!auth) {
      set({ loading: false });
      return () => {};
    }

    // Complete any pending redirect sign-in cleanly
    getRedirectResult(auth).catch(() => {
      // Ignore redirect errors on initial mount; listener handles active state
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user: user ?? null, loading: false });
    });

    return unsubscribe;
  },

  signInWithGoogle: async () => {
    const auth = getFirebaseAuth();
    if (!auth) return { error: "Auth not configured" };

    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      return { error: null };
    } catch (err) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: unknown }).code)
          : "";
      if (code === "auth/popup-blocked") {
        await signInWithRedirect(auth, provider);
        return { error: null };
      }
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        return { error: null };
      }
      return { error: getAuthErrorMessage(err) };
    }
  },

  signInWithEmail: async (email: string) => {
    const auth = getFirebaseAuth();
    if (!auth) return { error: "Auth not configured" };

    try {
      await sendSignInLinkToEmail(auth, email, {
        url: `${window.location.origin}/auth/callback?next=/track`,
        handleCodeInApp: true,
      });
      window.localStorage.setItem(EMAIL_STORAGE_KEY, email);
      return { error: null };
    } catch (err) {
      return { error: getAuthErrorMessage(err) };
    }
  },

  completeEmailLinkSignIn: async (href: string, emailOverride?: string) => {
    const auth = getFirebaseAuth();
    if (!auth) return { error: "Auth not configured" };

    if (!isSignInWithEmailLink(auth, href)) {
      return { error: "Invalid or expired sign-in link." };
    }

    const email =
      emailOverride?.trim() || window.localStorage.getItem(EMAIL_STORAGE_KEY);
    if (!email) {
      return { error: null, needsEmail: true };
    }

    try {
      await signInWithEmailLink(auth, email, href);
      window.localStorage.removeItem(EMAIL_STORAGE_KEY);
      return { error: null };
    } catch (err) {
      return { error: getAuthErrorMessage(err) };
    }
  },

  signOut: async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await firebaseSignOut(auth);
    set({ user: null });
  },
}));
