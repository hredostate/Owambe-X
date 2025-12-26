import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');

export const callEdgeFunction = async <T,>(name: string, body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });
  return { data, error };
};
