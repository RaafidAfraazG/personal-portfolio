import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const canCreateBrowserClient = typeof window !== "undefined";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || "raafid122@gmail.com";

export const supabase = isSupabaseConfigured && canCreateBrowserClient
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
