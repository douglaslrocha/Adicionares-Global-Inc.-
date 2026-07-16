import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('--- SUPABASE CLIENT DEBUG ---');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? supabaseUrl : 'NÃO CONFIGURADA');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'CONFIGURADA (tamanho: ' + supabaseAnonKey.length + ')' : 'NÃO CONFIGURADA');
console.log('-----------------------------');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
