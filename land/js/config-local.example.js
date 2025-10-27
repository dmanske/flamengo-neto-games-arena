// ========================================
// CONFIGURAÇÃO LOCAL - NETO TOURS
// ========================================
// 📝 INSTRUÇÕES:
// 1. Copie este arquivo para "config-local.js"
// 2. Substitua pelas suas credenciais locais se necessário
// 3. O arquivo "config-local.js" não será enviado para o GitHub

// 🔧 CONFIGURAÇÕES LOCAIS DO SUPABASE
const SUPABASE_CONFIG_LOCAL = {
  // URL do seu projeto Supabase local/desenvolvimento
  url: 'https://seu-projeto-local.supabase.co',
  
  // Chave pública local
  anonKey: 'sua_chave_local_aqui',
  
  // Configurações opcionais
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  }
};

// Exportar configuração local
window.SUPABASE_CONFIG = SUPABASE_CONFIG_LOCAL;