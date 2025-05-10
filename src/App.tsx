
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import CadastrarCliente from "./pages/CadastrarCliente";
import EditarCliente from "./pages/EditarCliente";
import Clientes from "./pages/Clientes";
import Viagens from "./pages/Viagens";
import CadastrarViagem from "./pages/CadastrarViagem";
import DetalhesViagem from "./pages/DetalhesViagem";
import EditarViagem from "./pages/EditarViagem";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import Onibus from "./pages/Onibus";

// Configurar o QueryClient com opções mais robustas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SidebarProvider>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              
              {/* Rotas protegidas */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/cadastrar-cliente" element={<CadastrarCliente />} />
                  <Route path="/editar-cliente/:id" element={<EditarCliente />} />
                  <Route path="/viagens" element={<Viagens />} />
                  <Route path="/cadastrar-viagem" element={<CadastrarViagem />} />
                  <Route path="/viagem/:id" element={<DetalhesViagem />} />
                  <Route path="/editar-viagem/:id" element={<EditarViagem />} />
                  <Route path="/clientes" element={<Clientes />} />
                  <Route path="/onibus" element={<Onibus />} />
                  <Route path="/pagamentos" element={<div className="container py-6"><h1 className="text-3xl font-bold">Pagamentos</h1></div>} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                </Route>
              </Route>
              
              {/* Redirecionar para Login se nenhuma rota corresponder */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
