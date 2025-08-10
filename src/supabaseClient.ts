// src/supabaseClient.ts (TEMPORARY HARDCODED FIX)

import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // Comment this line out
const supabaseUrl = "https://jjirowcfoblviyklpuyz.supabase.co"; // Add this line with your actual URL

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);