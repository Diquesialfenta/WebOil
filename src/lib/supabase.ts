import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://demo.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "demo-key";

// Check if we're in demo mode (when real Supabase credentials are not configured)
export const isDemoMode =
  supabaseUrl === "https://demo.supabase.co" || supabaseAnonKey === "demo-key";

export const supabase = isDemoMode
  ? null
  : createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  name?: string;
  created_at: string;
};
