import { supabase, isDemoMode } from "./supabase";

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Demo user storage for demo mode
let demoUser: any = null;
let demoCallbacks: ((event: string, session: any) => void)[] = [];

export const authService = {
  // Sign up new user
  async signUp({ email, password, name }: SignUpData) {
    if (isDemoMode) {
      // Demo mode - simulate successful signup
      demoUser = {
        id: "demo-user-id",
        email,
        user_metadata: { name },
        created_at: new Date().toISOString(),
      };

      // Simulate email verification requirement
      setTimeout(() => {
        demoCallbacks.forEach((cb) => cb("SIGNED_IN", { user: demoUser }));
      }, 100);

      return { user: demoUser, session: { user: demoUser } };
    }

    if (!supabase) throw new Error("Supabase not configured");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  // Sign in existing user
  async signIn({ email, password }: SignInData) {
    if (isDemoMode) {
      // Demo mode - simulate successful login
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      demoUser = {
        id: "demo-user-id",
        email,
        user_metadata: { name: "Usuario Demo" },
        created_at: new Date().toISOString(),
      };

      setTimeout(() => {
        demoCallbacks.forEach((cb) => cb("SIGNED_IN", { user: demoUser }));
      }, 100);

      return { user: demoUser, session: { user: demoUser } };
    }

    if (!supabase) throw new Error("Supabase not configured");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign out current user
  async signOut() {
    if (isDemoMode) {
      demoUser = null;
      setTimeout(() => {
        demoCallbacks.forEach((cb) => cb("SIGNED_OUT", null));
      }, 100);
      return;
    }

    if (!supabase) throw new Error("Supabase not configured");

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getUser() {
    if (isDemoMode) {
      return demoUser;
    }

    if (!supabase) throw new Error("Supabase not configured");

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Get current session
  async getSession() {
    if (isDemoMode) {
      return demoUser ? { user: demoUser } : null;
    }

    if (!supabase) throw new Error("Supabase not configured");

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (isDemoMode) {
      demoCallbacks.push(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              demoCallbacks = demoCallbacks.filter((cb) => cb !== callback);
            },
          },
        },
      };
    }

    if (!supabase) throw new Error("Supabase not configured");

    return supabase.auth.onAuthStateChange(callback);
  },
};
