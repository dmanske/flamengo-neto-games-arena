
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Auth
import Login from "@/pages/Login";
import Cadastro from "@/pages/Cadastro";
import { ProtectedRoute } from '@/components/ProtectedRoute';
import NotFound from '@/pages/NotFound';
import { AuthProvider } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';

// Dashboard Layout
import MainLayout from './components/layout/MainLayout';
import Dashboard from "@/pages/Dashboard";
import Clientes from "@/pages/Clientes";
import CadastrarCliente from "@/pages/CadastrarCliente";
import EditarCliente from "@/pages/EditarCliente";
import Viagens from "@/pages/Viagens";
import CadastrarViagem from "@/pages/CadastrarViagem";
import EditarViagem from "@/pages/EditarViagem";
import DetalhesViagem from '@/pages/DetalhesViagem';
import Onibus from '@/pages/Onibus';
import Passageiros from '@/pages/Passageiros';
import CadastrarPassageiro from '@/pages/CadastrarPassageiro';
import GerenciadorWhatsApp from '@/pages/GerenciadorWhatsApp';
import Loja from '@/pages/Loja'; // Import the new Loja page

// Landing Page
import LandingPage from "@/pages/LandingPage";
import CadastroPublico from "@/pages/CadastroPublico";

const queryClient = new QueryClient()

// Import novas páginas
import PagamentoSucesso from "@/pages/PagamentoSucesso";
import Pagamentos from "@/pages/Pagamentos";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SidebarProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/cadastro-publico" element={<CadastroPublico />} />
              
              {/* Rotas de pagamento */}
              <Route path="/pagamento-sucesso" element={<PagamentoSucesso />} />

              {/* Rotas protegidas */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<MainLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="clientes" element={<Clientes />} />
                  <Route path="clientes/:id/editar" element={<EditarCliente />} />
                  <Route path="cadastrar-cliente" element={<CadastrarCliente />} />
                  <Route path="viagens" element={<Viagens />} />
                  <Route path="viagem/:id" element={<DetalhesViagem />} />
                  <Route path="viagem/:id/editar" element={<EditarViagem />} />
                  <Route path="cadastrar-viagem" element={<CadastrarViagem />} />
                  <Route path="cadastrar-passageiro" element={<CadastrarPassageiro />} />
                  <Route path="onibus" element={<Onibus />} />
                  <Route path="passageiros" element={<Passageiros />} />
                  <Route path="whatsapp" element={<GerenciadorWhatsApp />} />
                  <Route path="pagamentos" element={<Pagamentos />} />
                  <Route path="loja" element={<Loja />} /> {/* Add the new Loja route */}
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
