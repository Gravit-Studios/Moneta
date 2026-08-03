import { createClient } from '@supabase/supabase-js';

// A chave "publishable/anon" é feita para ficar no front-end — a segurança
// dos dados vem das políticas de RLS no banco (ver supabase/schema.sql),
// não do sigilo desta chave.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;
