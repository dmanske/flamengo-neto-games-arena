// ========================================
// CONFIGURAÇÃO DO SUPABASE - NETO TOURS
// ========================================
// 🔒 SEGURO: Usa as mesmas credenciais do sistema React
// ✅ Não expõe dados sensíveis no GitHub

// 🔧 CONFIGURAÇÕES DO SUPABASE
// Usando as mesmas credenciais do sistema principal
const SUPABASE_CONFIG = {
  // URL do projeto Supabase (mesma do sistema React)
  url: 'https://uroukakmvanyeqxicuzw.supabase.co',
  
  // Chave pública (anon key) - mesma do sistema React
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb3VrYWttdmFueWVxeGljdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MzMzOTYsImV4cCI6MjA2MjQwOTM5Nn0.fFRtqvpf7kwbJyAh5JHYjTU2zbEI9BvAjDp2rXikrO8',
  
  // Configurações opcionais (mesmas do sistema React)
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web'
      }
    }
  }
};

// 🔒 SEGURANÇA:
// - Estas são as mesmas credenciais já usadas no sistema React
// - A chave "anon" é segura para usar no frontend
// - Ela permite apenas operações que você configurou nas RLS (Row Level Security)
// - As credenciais já estão funcionando no sistema principal

// ✅ VANTAGENS:
// - Não precisa configurar nada
// - Usa a mesma base de dados
// - Mesmas permissões e segurança
// - Funciona automaticamente

// Exportar configuração
window.SUPABASE_CONFIG = SUPABASE_CONFIG;