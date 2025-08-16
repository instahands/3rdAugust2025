// vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // Add any other environment variables here
  // --- NEW: Add the Google Maps API key here ---
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  // Add any other environment variables here
  readonly VITE_GOOGLE_MAP_ID: string;
  readonly VITE_RAZORPAY_KEY_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}