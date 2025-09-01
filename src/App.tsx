
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
import ClienteDetalhes from "@/pages/ClienteDetalhes";
import Viagens from "@/pages/Viagens";
import CadastrarViagem from "@/pages/CadastrarViagem";
import EditarViagem from "@/pages/EditarViagem";
import DetalhesViagem from '@/pages/DetalhesViagem';
import ListaPresenca from '@/pages/ListaPresenca';
import Onibus from '@/pages/Onibus';
import CadastrarOnibus from '@/pages/CadastrarOnibus';
import EditarOnibus from '@/pages/EditarOnibus';
import DetalhesOnibus from '@/pages/DetalhesOnibus';
import Passageiros from '@/pages/Passageiros';
import CadastrarPassageiro from '@/pages/CadastrarPassageiro';
import CadastrarPassageiroSimples from '@/pages/CadastrarPassageiroSimples';
// Sistema de parcelamento removido
import GerenciadorWhatsApp from '@/pages/GerenciadorWhatsApp';
import Loja from '@/pages/Loja';
import LojaAdmin from '@/pages/LojaAdmin';

// Landing Page
import CadastroPublico from "@/pages/CadastroPublico";
import Index from "@/pages/Index";
import Homepage from "@/pages/Homepage";

// Galeria Pages
import GaleriaFotos from "@/pages/GaleriaFotos";
import GaleriaVideos from "@/pages/GaleriaVideos";

// Import novas páginas
import PagamentoSucesso from "@/pages/PagamentoSucesso";
import Pagamentos from "@/pages/Pagamentos";

// Import páginas financeiras
import DashboardFinanceiro from "@/pages/financeiro/DashboardFinanceiro";
import Receitas from "@/pages/financeiro/Receitas";
import Despesas from "@/pages/financeiro/Despesas";
import ContasPagarSimples from "@/pages/financeiro/ContasPagarSimples";
import Relatorios from "@/pages/financeiro/Relatorios";
import FluxoCaixa from "@/pages/financeiro/FluxoCaixa";
import FinanceiroGeral from "@/pages/FinanceiroGeral";

// Import página de configuração da empresa
import EmpresaConfigPage from "@/pages/EmpresaConfigPage";

// Import página pública Meu Ônibus
import MeuOnibus from "@/pages/MeuOnibus";
import MeuOnibusTest from "@/pages/MeuOnibusTest";
import MeuOnibusSimple from "@/pages/MeuOnibusSimple";

// Import Sistema de Ingressos
import Ingressos from "@/pages/Ingressos";
import CadastrarViagemIngressos from "@/pages/CadastrarViagemIngressos";
import ViagensIngressos from "@/pages/ViagensIngressos";

// Import Sistema de Créditos de Viagem
import Creditos from "@/pages/Creditos";

// Import Sistema de Configuração de Passeios
import ConfiguracaoPasseios from "@/pages/ConfiguracaoPasseios";

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SidebarProvider>
            <Routes>
              {/* Landing Page como página inicial */}
              <Route path="/" element={<Index />} />
              
              {/* Homepage completa */}
              <Route path="/homepage" element={<Homepage />} />
              
              {/* Loja pública */}
              <Route path="/loja" element={<Loja />} />
              
              {/* Galeria pública */}
              <Route path="/galeria-fotos" element={<GaleriaFotos />} />
              <Route path="/galeria-videos" element={<GaleriaVideos />} />
              
              {/* Página pública Meu Ônibus */}
              <Route path="/viagem/:id/meu-onibus" element={<MeuOnibus />} />
              <Route path="/viagem/:id/test" element={<MeuOnibusTest />} />
              <Route path="/viagem/:id/simple" element={<MeuOnibusSimple />} />
              
              {/* Auth routes */}
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
                  <Route path="clientes/:id" element={<ClienteDetalhes />} />
                  <Route path="clientes/:id/editar" element={<EditarCliente />} />
                  <Route path="cadastrar-cliente" element={<CadastrarCliente />} />
                  <Route path="viagens" element={<Viagens />} />
                  <Route path="viagem/:id" element={<DetalhesViagem />} />
                  <Route path="viagem/:id/editar" element={<EditarViagem />} />
                  <Route path="cadastrar-viagem" element={<CadastrarViagem />} />
                  <Route path="presenca/:viagemId" element={<ListaPresenca />} />
                  <Route path="cadastrar-passageiro" element={<CadastrarPassageiro />} />
                  <Route path="cadastrar-passageiro-simples" element={<CadastrarPassageiroSimples />} />
                  {/* Route demo-parcelamento removida - sistema desabilitado */}

                  {/* Route cadastro-passageiro-simples removida - página não existe */}
                  <Route path="onibus" element={<Onibus />} />
                  <Route path="onibus/:id" element={<DetalhesOnibus />} />
                  <Route path="editar-onibus/:id" element={<EditarOnibus />} />
                  <Route path="cadastrar-onibus" element={<CadastrarOnibus />} />
                  <Route path="passageiros" element={<Passageiros />} />
                  <Route path="whatsapp" element={<GerenciadorWhatsApp />} />
                  <Route path="pagamentos" element={<Pagamentos />} />
                  <Route path="loja" element={<Loja />} />
                  <Route path="loja-admin" element={<LojaAdmin />} />
                  
                  {/* Sistema de Ingressos */}
                  <Route path="ingressos" element={<Ingressos />} />
                  <Route path="cadastrar-viagem-ingressos" element={<CadastrarViagemIngressos />} />
                  <Route path="viagens-ingressos" element={<ViagensIngressos />} />
                  
                  {/* Sistema de Créditos de Viagem */}
                  <Route path="creditos" element={<Creditos />} />
                  
                  {/* Sistema de Configuração de Passeios */}
                  <Route path="configuracao-passeios" element={<ConfiguracaoPasseios />} />
                  
                  {/* Rotas Financeiras */}
                  <Route path="financeiro" element={<FinanceiroGeral />} />
                  <Route path="financeiro/geral" element={<FinanceiroGeral />} />
                  <Route path="financeiro/receitas" element={<Receitas />} />
                  <Route path="financeiro/despesas" element={<Despesas />} />
                  <Route path="financeiro/contas-pagar" element={<ContasPagarSimples />} />
                  <Route path="financeiro/relatorios" element={<Relatorios />} />
                  <Route path="financeiro/fluxo-caixa" element={<FluxoCaixa />} />
                  
                  {/* Configurações da Empresa */}
                  <Route path="empresa/configuracoes" element={<EmpresaConfigPage />} />
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
