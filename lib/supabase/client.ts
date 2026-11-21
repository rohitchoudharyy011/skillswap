import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Throwing here crashes every page during prerender and in the browser, which shows as a
// blank screen. A placeholder client keeps rendering; data calls fail with visible errors
// until real credentials are injected at runtime.
const placeholderUrl = 'https://placeholder.supabase.co';
const placeholderKey = 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Row level security on every table is what protects data; the anon key is safe to ship to the browser.
export const supabase = createClient(supabaseUrl ?? placeholderUrl, supabaseAnonKey ?? placeholderKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
