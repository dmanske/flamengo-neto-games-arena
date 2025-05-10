
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import CadastrarPassageiro from "./pages/CadastrarPassageiro";
import Passageiros from "./pages/Passageiros";
import CadastrarCliente from "./pages/CadastrarCliente";
import EditarCliente from "./pages/EditarCliente";
import Clientes from "./pages/Clientes";
import Viagens from "./pages/Viagens";
import CadastrarViagem from "./pages/CadastrarViagem";
import DetalhesViagem from "./pages/DetalhesViagem";
import EditarViagem from "./pages/EditarViagem";
import NotFound from "./pages/NotFound";

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
        <SidebarProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/cadastrar-passageiro" element={<CadastrarPassageiro />} />
              <Route path="/cadastrar-cliente" element={<CadastrarCliente />} />
              <Route path="/editar-cliente/:id" element={<EditarCliente />} />
              <Route path="/viagens" element={<Viagens />} />
              <Route path="/cadastrar-viagem" element={<CadastrarViagem />} />
              <Route path="/viagem/:id" element={<DetalhesViagem />} />
              <Route path="/editar-viagem/:id" element={<EditarViagem />} />
              <Route path="/passageiros" element={<Passageiros />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/onibus" element={<div className="container py-6"><h1 className="text-3xl font-bold">Ônibus</h1></div>} />
              <Route path="/embarques" element={<div className="container py-6"><h1 className="text-3xl font-bold">Embarques</h1></div>} />
              <Route path="/pagamentos" element={<div className="container py-6"><h1 className="text-3xl font-bold">Pagamentos</h1></div>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
