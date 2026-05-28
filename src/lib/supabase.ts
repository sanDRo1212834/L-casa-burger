import { createClient } from '@supabase/supabase-js';

let envUrl = import.meta.env.VITE_SUPABASE_URL || '';
if (typeof envUrl === 'string') {
  if (envUrl.startsWith('"') && envUrl.endsWith('"')) {
    envUrl = envUrl.replace(/^"|"$/g, '');
  }
  envUrl = envUrl.trim();
}

const supabaseUrl = envUrl && envUrl !== "" 
  ? (envUrl.startsWith('http') ? envUrl : `https://${envUrl}`) 
  : 'https://placeholder.supabase.co';

let envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
if (typeof envKey === 'string') {
  if (envKey.startsWith('"') && envKey.endsWith('"')) {
    envKey = envKey.replace(/^"|"$/g, '');
  }
  envKey = envKey.trim();
}

const supabaseAnonKey = envKey && envKey !== "" 
  ? envKey 
  : 'placeholder';

const isPlaceholder = supabaseUrl.includes('placeholder.supabase.co');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: !isPlaceholder,
    persistSession: !isPlaceholder,
    detectSessionInUrl: !isPlaceholder
  }
});
