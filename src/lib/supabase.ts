import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifica se as variáveis estão configuradas
let supabase: SupabaseClient | null = null;
let isConfigured = false;

// Log de diagnóstico (sem expor a chave completa)
if (supabaseUrl) {
  const urlPreview = supabaseUrl.length > 50 ? supabaseUrl.substring(0, 50) + '...' : supabaseUrl;
  console.log('🔍 Supabase URL configurada:', urlPreview);
} else {
  console.error('⚠️ VITE_SUPABASE_URL não encontrada!');
}

if (supabaseAnonKey) {
  const keyPreview = supabaseAnonKey.length > 20 ? supabaseAnonKey.substring(0, 20) + '...' : supabaseAnonKey;
  console.log('🔍 Supabase Key configurada:', keyPreview);
} else {
  console.error('⚠️ VITE_SUPABASE_ANON_KEY não encontrada!');
}

if (supabaseUrl && supabaseAnonKey) {
  // Valida se as variáveis não estão vazias
  if (supabaseUrl.trim() && supabaseAnonKey.trim()) {
    // Valida formato básico da URL
    if (!supabaseUrl.includes('supabase.co') && !supabaseUrl.includes('http')) {
      console.error('⚠️ URL do Supabase parece inválida. Deve ser algo como: https://xxxxx.supabase.co');
    }
    try {
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        },
        // Adiciona configurações de timeout
        global: {
          headers: {
            'x-client-info': 'roteiriza-gdm'
          }
        }
      });
      isConfigured = true;
      console.log('✅ Cliente Supabase inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao criar cliente Supabase:', error);
      isConfigured = false;
    }
  } else {
    console.error('⚠️ Variáveis de ambiente do Supabase estão vazias!');
    console.error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env');
  }
} else {
  console.error('⚠️ Variáveis de ambiente do Supabase não configuradas!');
  console.error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env');
  console.error('IMPORTANTE: Após criar/modificar o .env, REINICIE o servidor de desenvolvimento (npm run dev)');
}

// Exporta o cliente ou um objeto mock que lança erros informativos
export const supabaseClient: SupabaseClient = supabase || (() => {
  const errorMsg = 'Supabase não configurado. Verifique as variáveis de ambiente.';
  console.warn('⚠️ Usando cliente Supabase mock - funcionalidades limitadas');
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: { message: errorMsg } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: errorMsg } }),
      signOut: () => Promise.resolve({ error: { message: errorMsg } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: () => Promise.resolve({ data: null, error: { message: errorMsg } })
    },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: { message: errorMsg } }) }) }),
      insert: () => Promise.resolve({ data: null, error: { message: errorMsg } }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: { message: errorMsg } }) }),
      delete: () => ({ eq: () => Promise.resolve({ data: null, error: { message: errorMsg } }) })
    })
  } as unknown as SupabaseClient;
})();

// Exporta flag para verificar se está configurado
export const isSupabaseConfigured = isConfigured && supabase !== null;

export { supabaseClient as supabase };
