import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JogoDetails } from '@/hooks/useJogoDetails';
import { Ingresso } from '@/types/ingressos';
import { useJogoFinanceiro } from '@/hooks/financeiro/useJogoFinanceiro';
import { useCobrancaJogo } from '@/hooks/financeiro/useCobrancaJogo';

// Importar componentes das sub-abas
import { ResumoFinanceiroJogo } from './financeiro/ResumoFinanceiroJogo';
import { ReceitasJogo } from './financeiro/ReceitasJogo';
import { DespesasJogo } from './financeiro/DespesasJogo';
import { ListaClientesJogo } from './financeiro/ListaClientesJogo';
import { PendenciasJogo } from './financeiro/PendenciasJogo';

interface FinanceiroJogoProps {
  jogo: JogoDetails;
  ingressos: Ingresso[];
}

export function FinanceiroJogo({ jogo, ingressos }: FinanceiroJogoProps) {
  // Estado da aba ativa
  const [activeTab, setActiveTab] = useState('resumo');
  
  // Gerar jogo_key para os hooks - corrigir fuso horário
  const dataJogoFormatada = new Date(jogo.jogo_data).toISOString().split('T')[0]; // YYYY-MM-DD
  const jogoKey = `${jogo.adversario}-${dataJogoFormatada}-${jogo.local_jogo}`;
  
  console.log('🔍 JogoKey gerado:', jogoKey, 'de jogo_data original:', jogo.jogo_data);
  
  // Hooks para dados financeiros
  const jogoFinanceiro = useJogoFinanceiro(jogoKey);
  const cobrancaJogo = useCobrancaJogo(jogoKey);
  
  // Loading state
  if (jogoFinanceiro.isLoading || cobrancaJogo.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando dados financeiros...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sistema de Abas Financeiras */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="resumo" className="flex items-center gap-2">
            📊 Resumo
          </TabsTrigger>
          <TabsTrigger value="receitas" className="flex items-center gap-2">
            💰 Receitas
          </TabsTrigger>
          <TabsTrigger value="despesas" className="flex items-center gap-2">
            💸 Despesas
          </TabsTrigger>
          <TabsTrigger value="clientes" className="flex items-center gap-2">
            👥 Clientes
          </TabsTrigger>
          <TabsTrigger value="pendencias" className="flex items-center gap-2">
            ⚠️ Pendências
          </TabsTrigger>
        </TabsList>

        {/* Aba Resumo */}
        <TabsContent value="resumo">
          <ResumoFinanceiroJogo
            jogo={jogo}
            ingressos={ingressos}
            resumoFinanceiro={jogoFinanceiro.resumoFinanceiro}
            setorAnalytics={jogoFinanceiro.setorAnalytics}
          />
        </TabsContent>

        {/* Aba Receitas */}
        <TabsContent value="receitas">
          <ReceitasJogo
            jogo={jogo}
            ingressos={ingressos}
            receitas={jogoFinanceiro.receitas}
            resumoFinanceiro={jogoFinanceiro.resumoFinanceiro}
            onAdicionarReceita={jogoFinanceiro.adicionarReceita}
            onEditarReceita={jogoFinanceiro.editarReceita}
            onExcluirReceita={jogoFinanceiro.excluirReceita}
          />
        </TabsContent>

        {/* Aba Despesas */}
        <TabsContent value="despesas">
          <DespesasJogo
            jogo={jogo}
            ingressos={ingressos}
            despesas={jogoFinanceiro.despesas}
            resumoFinanceiro={jogoFinanceiro.resumoFinanceiro}
            onAdicionarDespesa={jogoFinanceiro.adicionarDespesa}
            onEditarDespesa={jogoFinanceiro.editarDespesa}
            onExcluirDespesa={jogoFinanceiro.excluirDespesa}
          />
        </TabsContent>

        {/* Aba Lista de Clientes */}
        <TabsContent value="clientes">
          <ListaClientesJogo
            ingressos={ingressos}
          />
        </TabsContent>

        {/* Aba Pendências */}
        <TabsContent value="pendencias">
          <PendenciasJogo
            ingressos={ingressos}
            jogo={jogo}
            ingressosPendentes={cobrancaJogo.ingressosPendentes}
            historicoCobrancas={cobrancaJogo.historicoCobrancas}
            estatisticasGerais={cobrancaJogo.calcularEstatisticasGerais()}
            onRegistrarCobranca={cobrancaJogo.registrarCobranca}
            onMarcarComoRespondido={cobrancaJogo.marcarComoRespondido}
            onMarcarComoPago={cobrancaJogo.marcarComoPago}
            templates={cobrancaJogo.obterTemplatesCobranca()}
            onGerarMensagem={cobrancaJogo.gerarMensagemPersonalizada}
          />
        </TabsContent>


      </Tabs>
    </div>
  );
}