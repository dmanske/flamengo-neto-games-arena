
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  
  // Enquanto está carregando, não toma nenhuma decisão
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }
  
  // Se não estiver logado, redireciona para a página de login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Se estiver logado, permite o acesso à rota
  return <Outlet />;
};
