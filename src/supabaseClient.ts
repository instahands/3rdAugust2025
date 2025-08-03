// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// ❗️ WARNING: TEMPORARY AND INSECURE. FOR TESTING ONLY.
const supabaseUrl = "https://jjirowcfoblviyklpuyz.supabase.co"; // Paste your URL
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqaXJvd2Nmb2Jsdml5a2xwdXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODY5MzUsImV4cCI6MjA2OTU2MjkzNX0.RdgDKyBFb8BnvMHAsBMApe816Gxaq0a3LvpqMUVjGJ0"; // Paste your anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);