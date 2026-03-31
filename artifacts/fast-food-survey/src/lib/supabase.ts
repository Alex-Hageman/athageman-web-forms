import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SurveyResponse {
  id?: string;
  created_at?: string;
  favorite_chain: string;
  region: string;
  frequency: string;
  factors: string[];
  other_factor?: string | null;
}
