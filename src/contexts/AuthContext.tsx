
import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nome: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Configura o listener para mudanças de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);

        // Redireciona apenas quando há um evento de login/logout explícito
        // e não quando a página apenas ganha ou perde foco
        if (event === 'SIGNED_OUT') {
          console.log("Usuário deslogado, redirecionando para login");
          // Limpa qualquer estado local se necessário
          localStorage.removeItem('supabase.auth.token');
          // Redireciona para login independente da rota atual
          navigate("/login", { replace: true });
        } else if (event === 'SIGNED_IN' && location.pathname === '/login') {
          console.log("Usuário logado, redirecionando para dashboard");
          navigate("/dashboard");
        }
      }
    );

    // Verifica se já existe uma sessão ativa
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Erro ao obter sessão:", error);
        // Se há erro na sessão, limpa tudo
        setSession(null);
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      console.log("Sessão inicial:", session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // Se existir uma sessão ativa e o usuário estiver na página de login,
      // redireciona para o dashboard
      if (session && location.pathname === '/login') {
        navigate("/dashboard");
      }
    }).catch((error) => {
      console.error("Erro ao verificar sessão:", error);
      setSession(null);
      setUser(null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }

      toast.success("Login realizado com sucesso!");
      navigate("/dashboard"); // Ensure we navigate to dashboard after login
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      toast.error(error.message || "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, nome: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            nome
          }
        }
      });
      
      if (error) {
        throw error;
      }

      toast.success("Cadastro realizado com sucesso! Por favor, faça login.");
      navigate("/login");
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error);
      toast.error(error.message || "Erro ao cadastrar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      console.log("Iniciando logout...");
      
      // Primeiro, limpa o estado local
      setUser(null);
      setSession(null);
      
      // Limpa o localStorage
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-uroukakmvanyeqxicuzw-auth-token');
      
      // Executa o signOut do Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error("Erro no signOut:", error);
        // Mesmo com erro, continua o processo de logout local
      }

      console.log("Logout realizado com sucesso!");
      toast.success("Logout realizado com sucesso!");
      
      // Força navegação para login após logout
      navigate("/login", { replace: true });
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error);
      toast.error(error.message || "Erro ao fazer logout.");
      
      // Mesmo com erro, força o logout local
      setUser(null);
      setSession(null);
      navigate("/login", { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, signIn, signUp, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  
  return context;
};
