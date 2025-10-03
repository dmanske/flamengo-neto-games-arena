import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { JogoDetails } from '@/hooks/useJogoDetails';
import { Ingresso } from '@/types/ingressos';
import { ResumoFinanceiroJogo as ResumoFinanceiroType, SetorAnalytics } from '@/hooks/financeiro/useJogoFinanceiro';
import { formatCurrency } from '@/utils/formatters';
import { formatarDataBrasil } from '@/utils/dateUtils';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle,
  Target,
  Calculator,
  Trophy,
  Users,
  Calendar,
  BarChart3,
  Eye,
  EyeOff
} from 'lucide-react';

interface ResumoFinanceiroJogoProps {
  jogo: JogoDetails;
  ingressos: Ingresso[];
  resumoFinanceiro: ResumoFinanceiroType | null;
  setorAnalytics: SetorAnalytics[];
}

export function ResumoFinanceiroJogo({ 
  jogo, 
  ingressos, 
  resumoFinanceiro, 
  setorAnalytics 
}: ResumoFinanceiroJogoProps) {
  
  // Estado para controlar visibilidade dos valores financeiros
  const [showValues, setShowValues] = useState({
    receita: false,
    custo: false,
    lucro: false,
    pendencias: false
  });

  // Função para alternar visibilidade de um card específico
  const toggleVisibility = (card: keyof typeof showValues) => {
    setShowValues(prev => ({
      ...prev,
      [card]: !prev[card]
    }));
  };
  
  // Calcular estatísticas básicas dos ingressos
  const estatisticasIngressos = useMemo(() => {
    const totalCusto = ingressos.reduce((sum, ing) => sum + (ing.preco_custo || 0), 0);
    const totalReceita = jogo.receita_total;
    const totalLucro = jogo.lucro_total;
    const margemPercentual = totalReceita > 0 ? (totalLucro / totalReceita) * 100 : 0;
    
    // Análise por status
    const ingressosPagos = ingressos.filter(ing => ing.situacao_financeira === 'pago');
    const ingressosPendentes = ingressos.filter(ing => ing.situacao_financeira === 'pendente');
    const ingressosCancelados = ingressos.filter(ing => ing.situacao_financeira === 'cancelado');
    
    const receitaPaga = ingressosPagos.reduce((sum, ing) => sum + ing.valor_final, 0);
    const receitaPendente = ingressosPendentes.reduce((sum, ing) => sum + ing.valor_final, 0);
    const receitaCancelada = ingressosCancelados.reduce((sum, ing) => sum + ing.valor_final, 0);
    
    // Análise temporal das vendas
    const evolucaoTemporal = ingressos.reduce((acc, ing) => {
      const dataVenda = new Date(ing.created_at || jogo.jogo_data).toISOString().split('T')[0];
      if (!acc[dataVenda]) {
        acc[dataVenda] = {
          data: dataVenda,
          vendas: 0,
          receita: 0,
          vendasAcumuladas: 0,
          receitaAcumulada: 0
        };
      }
      acc[dataVenda].vendas++;
      acc[dataVenda].receita += ing.valor_final;
      return acc;
    }, {} as Record<string, {
      data: string;
      vendas: number;
      receita: number;
      vendasAcumuladas: number;
      receitaAcumulada: number;
    }>);

    // Calcular valores acumulados
    const evolucaoOrdenada = Object.values(evolucaoTemporal)
      .sort((a, b) => a.data.localeCompare(b.data));
    
    let vendasAcum = 0;
    let receitaAcum = 0;
    evolucaoOrdenada.forEach(ponto => {
      vendasAcum += ponto.vendas;
      receitaAcum += ponto.receita;
      ponto.vendasAcumuladas = vendasAcum;
      ponto.receitaAcumulada = receitaAcum;
    });

    return {
      totalCusto,
      totalReceita,
      totalLucro,
      margemPercentual,
      receitaPaga,
      receitaPendente,
      receitaCancelada,
      evolucaoTemporal: evolucaoOrdenada
    };
  }, [jogo, ingressos]);

  // Usar dados do resumo financeiro se disponível, senão usar cálculos básicos
  const dadosFinanceiros = resumoFinanceiro || {
    receita_total: estatisticasIngressos.totalReceita,
    custo_total: estatisticasIngressos.totalCusto,
    lucro_total: estatisticasIngressos.totalLucro,
    receitas_manuais: 0,
    despesas_operacionais: 0,
    receita_ingressos_total: estatisticasIngressos.totalReceita,
    custo_ingressos_total: estatisticasIngressos.totalCusto,
    ticket_medio: jogo.total_ingressos > 0 ? estatisticasIngressos.totalReceita / jogo.total_ingressos : 0
  };

  // Análise dos setores (top 3)
  const topSetores = useMemo(() => {
    const setores = ingressos.reduce((acc, ing) => {
      const setor = ing.setor_estadio;
      if (!acc[setor]) {
        acc[setor] = {
          nome: setor,
          quantidade: 0,
          receita: 0,
          lucro: 0,
          precoMedio: 0
        };
      }
      acc[setor].quantidade++;
      acc[setor].receita += ing.valor_final;
      acc[setor].lucro += (ing.valor_final - (ing.preco_custo || 0));
      return acc;
    }, {} as Record<string, any>);
    
    // Calcular preço médio e ordenar por receita
    return Object.values(setores)
      .map((setor: any) => ({
        ...setor,
        precoMedio: setor.receita / setor.quantidade
      }))
      .sort((a: any, b: any) => b.receita - a.receita)
      .slice(0, 3);
  }, [ingressos]);

  // Componente auxiliar para renderizar valores ocultos/visíveis
  const renderHiddenValue = (
    value: string, 
    isVisible: boolean, 
    cardKey: keyof typeof showValues,
    placeholder: string = "••••••"
  ) => (
    <div 
      className={`cursor-pointer select-none transition-all duration-200 hover:scale-105 ${
        !isVisible ? 'hover:bg-gray-50 rounded-md p-1 -m-1' : ''
      }`}
      onClick={() => toggleVisibility(cardKey)}
      title={isVisible ? "Clique para ocultar valor" : "Clique para mostrar valor"}
    >
      <div className="flex items-center gap-2">
        {isVisible ? (
          <span className="text-2xl font-bold transition-all duration-300 animate-in fade-in-0 slide-in-from-left-2">
            {value}
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-400 tracking-wider">
              {placeholder}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              <Eye className="h-3 w-3" />
              <span>Clique para ver</span>
            </div>
          </div>
        )}
        {isVisible && (
          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Controle de Visibilidade */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Resumo Financeiro</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Valores:</span>
          <button
            onClick={() => {
              const allVisible = Object.values(showValues).every(v => v);
              setShowValues({
                receita: !allVisible,
                custo: !allVisible,
                lucro: !allVisible,
                pendencias: !allVisible
              });
            }}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
          >
            {Object.values(showValues).every(v => v) ? (
              <>
                <EyeOff className="h-4 w-4" />
                Ocultar Todos
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Mostrar Todos
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cards Principais de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Receita Total */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <div className="text-green-600">
                  {renderHiddenValue(
                    formatCurrency(dadosFinanceiros.receita_total),
                    showValues.receita,
                    'receita',
                    'R$ ••••••'
                  )}
                </div>
                {resumoFinanceiro && resumoFinanceiro.receitas_manuais > 0 && showValues.receita && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Ingressos:</span>
                      <span>{formatCurrency(resumoFinanceiro.receita_ingressos_total)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Extras:</span>
                      <span>{formatCurrency(resumoFinanceiro.receitas_manuais)}</span>
                    </div>
                  </div>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Custo Total */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Custo Total</p>
                <div className="text-red-600">
                  {renderHiddenValue(
                    formatCurrency(dadosFinanceiros.custo_total),
                    showValues.custo,
                    'custo',
                    'R$ ••••••'
                  )}
                </div>
                {resumoFinanceiro && resumoFinanceiro.despesas_operacionais > 0 && showValues.custo && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Ingressos:</span>
                      <span>{formatCurrency(resumoFinanceiro.custo_ingressos_total)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Operacionais:</span>
                      <span>{formatCurrency(resumoFinanceiro.despesas_operacionais)}</span>
                    </div>
                  </div>
                )}
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        {/* Lucro Líquido */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Lucro Líquido</p>
                <div className={dadosFinanceiros.lucro_total >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {renderHiddenValue(
                    formatCurrency(dadosFinanceiros.lucro_total),
                    showValues.lucro,
                    'lucro',
                    'R$ ••••••'
                  )}
                </div>
                {showValues.lucro && (
                  <p className="text-xs text-gray-500 mt-1">
                    {dadosFinanceiros.lucro_total >= 0 ? '✅ Lucro' : '❌ Prejuízo'}
                  </p>
                )}
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Pendências */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Pendências</p>
                <div className="text-orange-600">
                  {renderHiddenValue(
                    formatCurrency(estatisticasIngressos.receitaPendente),
                    showValues.pendencias,
                    'pendencias',
                    'R$ ••••••'
                  )}
                </div>
                {showValues.pendencias && (
                  <p className="text-xs text-gray-500 mt-1">
                    {jogo.ingressos_pendentes} ingresso{jogo.ingressos_pendentes !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant={jogo.ingressos_pendentes === 0 ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {jogo.ingressos_pendentes === 0 ? '✅ Completo' : `⏳ ${jogo.ingressos_pendentes} pendentes`}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {jogo.ingressos_pagos} de {jogo.total_ingressos} pagos
                </p>
              </div>
              <div className="text-2xl">📊</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards Secundários de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Margem de Lucro */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Margem de Lucro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold">
                {estatisticasIngressos.margemPercentual.toFixed(1)}%
              </div>
              <Progress 
                value={Math.max(0, Math.min(100, estatisticasIngressos.margemPercentual))} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {estatisticasIngressos.margemPercentual >= 30 
                  ? 'Excelente margem de lucro'
                  : estatisticasIngressos.margemPercentual >= 20
                    ? 'Boa margem de lucro'
                    : estatisticasIngressos.margemPercentual >= 10
                      ? 'Margem regular'
                      : estatisticasIngressos.margemPercentual >= 0
                        ? 'Margem baixa'
                        : 'Operação com prejuízo'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Médio */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {formatCurrency(dadosFinanceiros.ticket_medio)}
              </div>
              <p className="text-xs text-muted-foreground">
                Valor médio por ingresso
              </p>
              <div className="text-xs text-gray-500">
                {jogo.total_ingressos} ingresso{jogo.total_ingressos !== 1 ? 's' : ''} vendido{jogo.total_ingressos !== 1 ? 's' : ''}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Taxa de Conversão */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Taxa de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">
                {jogo.total_ingressos > 0 
                  ? ((jogo.ingressos_pagos / jogo.total_ingressos) * 100).toFixed(1)
                  : 0
                }%
              </div>
              <p className="text-xs text-muted-foreground">
                Ingressos pagos vs total
              </p>
              <div className="text-xs text-gray-500">
                {jogo.ingressos_pagos} de {jogo.total_ingressos} pagos
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução Temporal das Vendas */}
      {estatisticasIngressos.evolucaoTemporal.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              {estatisticasIngressos.evolucaoTemporal.length === 1 
                ? 'Resumo das Vendas do Dia' 
                : 'Evolução Temporal das Vendas'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Resumo da evolução */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-lg font-bold text-blue-600">
                    {estatisticasIngressos.evolucaoTemporal.length}
                  </div>
                  <div className="text-xs text-blue-700">Dias com Vendas</div>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-lg font-bold text-green-600">
                    {estatisticasIngressos.evolucaoTemporal.reduce((max, ponto) => Math.max(max, ponto.vendas), 0)}
                  </div>
                  <div className="text-xs text-green-700">Pico de Vendas/Dia</div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-lg font-bold text-purple-600">
                    {(jogo.total_ingressos / Math.max(1, estatisticasIngressos.evolucaoTemporal.length)).toFixed(1)}
                  </div>
                  <div className="text-xs text-purple-700">Média/Dia</div>
                </div>
                
                <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-lg font-bold text-orange-600">
                    {formatCurrency(estatisticasIngressos.totalReceita / Math.max(1, estatisticasIngressos.evolucaoTemporal.length))}
                  </div>
                  <div className="text-xs text-orange-700">Receita Média/Dia</div>
                </div>
              </div>

              {/* Gráfico de barras da evolução */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-700">
                    {estatisticasIngressos.evolucaoTemporal.length === 1 
                      ? 'Detalhes das Vendas' 
                      : 'Vendas por Dia'
                    }
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span>Vendas Diárias</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>Acumulado</span>
                    </div>
                  </div>
                </div>

                {/* Nota explicativa para 1 dia */}
                {estatisticasIngressos.evolucaoTemporal.length === 1 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      📅 <strong>Vendas concentradas:</strong> Todos os {jogo.total_ingressos} ingressos foram vendidos em um único dia.
                      {jogo.total_ingressos > 10 && ' Excelente performance de vendas!'}
                    </p>
                  </div>
                )}
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {estatisticasIngressos.evolucaoTemporal.map((ponto, index) => {
                    const maxVendas = Math.max(...estatisticasIngressos.evolucaoTemporal.map(p => p.vendas));
                    const maxAcumulado = Math.max(...estatisticasIngressos.evolucaoTemporal.map(p => p.vendasAcumuladas));
                    const larguraVendas = maxVendas > 0 ? (ponto.vendas / maxVendas) * 100 : 0;
                    const larguraAcumulado = maxAcumulado > 0 ? (ponto.vendasAcumuladas / maxAcumulado) * 100 : 0;
                    
                    return (
                      <div key={ponto.data} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium min-w-[80px]">
                              {formatarDataBrasil(ponto.data)}
                            </span>
                            <div className="text-xs text-gray-500">
                              Dia {index + 1}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-blue-600">
                              {ponto.vendas} venda{ponto.vendas !== 1 ? 's' : ''}
                            </div>
                            <div className="text-xs text-gray-600">
                              {formatCurrency(ponto.receita)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Barra de vendas diárias */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Vendas do dia</span>
                            <span>{ponto.vendas}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                              style={{ width: `${larguraVendas}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Barra acumulada */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Acumulado até o dia</span>
                            <span>{ponto.vendasAcumuladas} ({formatCurrency(ponto.receitaAcumulada)})</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 bg-green-500 rounded-full transition-all duration-300"
                              style={{ width: `${larguraAcumulado}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Insights da evolução */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium text-blue-800">Velocidade de Vendas</h4>
                  </div>
                  <div className="text-sm text-blue-700">
                    <div className="font-bold text-lg text-blue-600 mb-1">
                      {(jogo.total_ingressos / Math.max(1, estatisticasIngressos.evolucaoTemporal.length)).toFixed(1)} vendas/dia
                    </div>
                    <div>
                      {estatisticasIngressos.evolucaoTemporal.length === 1 
                        ? 'Todas as vendas em um único dia'
                        : `Vendas distribuídas em ${estatisticasIngressos.evolucaoTemporal.length} dias`
                      }
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium text-green-800">Melhor Dia</h4>
                  </div>
                  <div className="text-sm text-green-700">
                    {(() => {
                      const melhorDia = estatisticasIngressos.evolucaoTemporal.reduce((max, ponto) => 
                        ponto.vendas > max.vendas ? ponto : max
                      );
                      return (
                        <>
                          <div className="font-bold text-lg text-green-600 mb-1">
                            {melhorDia.vendas} vendas
                          </div>
                          <div>
                            {formatarDataBrasil(melhorDia.data)} • {formatCurrency(melhorDia.receita)}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análise por Status de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Análise por Status de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(estatisticasIngressos.receitaPaga)}
              </div>
              <div className="text-sm text-green-700 font-medium">
                Receita Paga
              </div>
              <div className="text-xs text-green-600 mt-1">
                {jogo.ingressos_pagos} ingresso{jogo.ingressos_pagos !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {estatisticasIngressos.totalReceita > 0 
                  ? `${((estatisticasIngressos.receitaPaga / estatisticasIngressos.totalReceita) * 100).toFixed(1)}% do total`
                  : '0% do total'
                }
              </div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(estatisticasIngressos.receitaPendente)}
              </div>
              <div className="text-sm text-yellow-700 font-medium">
                Receita Pendente
              </div>
              <div className="text-xs text-yellow-600 mt-1">
                {jogo.ingressos_pendentes} ingresso{jogo.ingressos_pendentes !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {estatisticasIngressos.totalReceita > 0 
                  ? `${((estatisticasIngressos.receitaPendente / estatisticasIngressos.totalReceita) * 100).toFixed(1)}% do total`
                  : '0% do total'
                }
              </div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(estatisticasIngressos.receitaCancelada)}
              </div>
              <div className="text-sm text-red-700 font-medium">
                Receita Cancelada
              </div>
              <div className="text-xs text-red-600 mt-1">
                {ingressos.filter(ing => ing.situacao_financeira === 'cancelado').length} ingresso{ingressos.filter(ing => ing.situacao_financeira === 'cancelado').length !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Valor perdido por cancelamentos
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Setores por Performance */}
      {topSetores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏟️ Top 3 Setores por Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSetores.map((setor, index) => (
                <div key={setor.nome} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{setor.nome}</div>
                      <div className="text-sm text-gray-600">
                        {setor.quantidade} ingresso{setor.quantidade > 1 ? 's' : ''} • 
                        Preço médio: {formatCurrency(setor.precoMedio)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{formatCurrency(setor.receita)}</div>
                    <div className={`text-sm font-medium ${setor.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Lucro: {formatCurrency(setor.lucro)}
                    </div>
                    <Badge 
                      variant={index === 0 ? 'default' : 'secondary'} 
                      className="mt-1"
                    >
                      {index === 0 ? '🥇 Melhor' : index === 1 ? '🥈 2º Lugar' : '🥉 3º Lugar'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado vazio */}
      {ingressos.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium mb-2">Nenhum dado financeiro</h3>
            <p className="text-muted-foreground">
              Cadastre ingressos para ver o resumo financeiro detalhado do jogo.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}