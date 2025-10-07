import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useLogout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const logout = async () => {
    try {
      setIsLoading(true);
      console.log("Iniciando processo de logout...");

      // 1. Primeiro, tenta fazer logout no Supabase
      try {
        const { error } = await supabase.auth.signOut({ scope: 'global' });
        if (error) {
          console.warn("Aviso no signOut do Supabase:", error);
          // Não para o processo, continua com limpeza local
        }
      } catch (supabaseError) {
        console.warn("Erro no signOut do Supabase, continuando com limpeza local:", supabaseError);
      }

      // 2. Limpa todos os dados de autenticação locais
      try {
        // Limpa localStorage
        const keysToRemove = [
          'supabase.auth.token',
          'sb-uroukakmvanyeqxicuzw-auth-token',
          'supabase-auth-token'
        ];
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });

        // Limpa sessionStorage também
        sessionStorage.clear();
      } catch (storageError) {
        console.warn("Erro ao limpar storage:", storageError);
      }

      // 3. Força recarregamento da página para garantir limpeza completa
      console.log("Logout concluído, redirecionando...");
      toast.success("Logout realizado com sucesso!");
      
      // Usa window.location para garantir limpeza completa
      window.location.href = '/login';
      
    } catch (error: any) {
      console.error("Erro geral no logout:", error);
      toast.error("Erro ao fazer logout, mas você será redirecionado.");
      
      // Mesmo com erro, força redirecionamento
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  };

  return { logout, isLoading };
};