import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const LogoutTest = () => {
  const { user, session } = useAuth();

  const testSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log("Teste de sessão:", { data, error });
      
      if (error) {
        console.error("Erro na sessão:", error);
      } else {
        console.log("Sessão válida:", data.session?.user?.email);
      }
    } catch (err) {
      console.error("Erro ao testar sessão:", err);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold mb-2">Debug de Autenticação</h3>
      <div className="space-y-2 text-sm">
        <p><strong>Usuário:</strong> {user?.email || "Não logado"}</p>
        <p><strong>Sessão:</strong> {session ? "Ativa" : "Inativa"}</p>
        <Button onClick={testSession} size="sm" variant="outline">
          Testar Sessão
        </Button>
      </div>
    </div>
  );
};

export default LogoutTest;