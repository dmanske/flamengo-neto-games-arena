import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  FileText,
  AlertTriangle,
  Download,
  Filter,
  RefreshCw,
  Users,
  BarChart3,
  Ticket
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useFinanceiroGeral } from '@/hooks/useFinanceiroGeral';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FluxoCaixaTab } from '@/components/financeiro-geral/FluxoCaixaTab';
import { ContasReceberTab } from '@/components/financeiro-geral/ContasReceberTab';
import { ContasPagarTab } from '@/components/financeiro-geral/ContasPagarTab';
import { RelatoriosTab } from '@/components/financeiro-geral/RelatoriosTab';
import { CalendarButton } from '@/components/ui/calendar-picker';

export default function FinanceiroGeral() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [periodoView, setPeriodoView] = useState<'mensal' | 'trimestral' | 'anual' | 'personalizado'>('mensal');
  const [mesAtual, setMesAtual] = useState(new Date().getMonth());
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  
  // Calcular datas baseado no período selecionado
  const calcularFiltroData = () => {
    const hoje = new Date();
    
    switch (periodoView) {
      case 'mensal':
        return {
          inicio: new Date(anoAtual, mesAtual, 1).toISOString().split('T')[0],
          fim: new Date(anoAtual, mesAtual + 1, 0).toISOString().split('T')[0]
        };
      case 'trimestral':
        const trimestreInicio = Math.floor(mesAtual / 3) * 3;
        return {
          inicio: new Date(anoAtual, trimestreInicio, 1).toISOString().split('T')[0],
          fim: new Date(anoAtual, trimestreInicio + 3, 0).toISOString().split('T')[0]
        };
      case 'anual':
        return {
          inicio: new Date(anoAtual, 0, 1).toISOString().split('T')[0],
          fim: new Date(anoAtual, 11, 31).toISOString().split('T')[0]
        };
      default:
        return {
          inicio: new Date(anoAtual, mesAtual, 1).toISOString().split('T')[0],
          fim: new Date().toISOString().split('T')[0]
        };
    }
  };

  const [filtroData, setFiltroData] = useState(calcularFiltroData());

  // Atualizar filtro quando período mudar
  React.useEffect(() => {
    const novoFiltro = calcularFiltroData();
    console.log('🔄 Atualizando filtro:', {
      periodoView,
      mesAtual,
      anoAtual,
      novoFiltro
    });
    setFiltroData(novoFiltro);
  }, [periodoView, mesAtual, anoAtual]);

  const {
    resumoGeral,
    fluxoCaixa,
    contasReceber,
    contasPagar,
    viagensFinanceiro,
    ingressosFinanceiro, // ✨ ADICIONADO
    isLoading,
    loadingResumo,
    loadingContas,
    atualizarDados
  } = useFinanceiroGeral(filtroData);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando dados financeiros...</span>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financeiro Geral</h1>
          <p className="text-gray-600">
            Gestão financeira consolidada - {
              periodoView === 'mensal' 
                ? new Date(anoAtual, mesAtual).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                : periodoView === 'anual' 
                ? `Ano ${anoAtual}`
                : 'Período personalizado'
            }
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={atualizarDados}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Seletor de Período */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Visualização:</span>
              </div>
              
              {/* Botões de Período */}
              <div className="flex gap-2">
                {[
                  { key: 'mensal', label: 'Mensal' },
                  { key: 'trimestral', label: 'Trimestral' },
                  { key: 'anual', label: 'Anual' }
                ].map((periodo) => (
                  <Button
                    key={periodo.key}
                    variant={periodoView === periodo.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setPeriodoView(periodo.key as any);
                      setFiltroData(calcularFiltroData());
                    }}
                  >
                    {periodo.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Navegação de Período */}
            <div className="flex items-center gap-3">
              {periodoView === 'mensal' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      let novoMes, novoAno;
                      if (mesAtual === 0) {
                        novoMes = 11;
                        novoAno = anoAtual - 1;
                      } else {
                        novoMes = mesAtual - 1;
                        novoAno = anoAtual;
                      }
                      
                      console.log('⬅️ Navegando para mês anterior:', novoMes, novoAno);
                      setMesAtual(novoMes);
                      setAnoAtual(novoAno);
                      
                      // ✨ CORREÇÃO: Forçar atualização imediata do filtro
                      const novoFiltro = {
                        inicio: new Date(novoAno, novoMes, 1).toISOString().split('T')[0],
                        fim: new Date(novoAno, novoMes + 1, 0).toISOString().split('T')[0]
                      };
                      setFiltroData(novoFiltro);
                    }}
                  >
                    ← Anterior
                  </Button>
                  
                  {/* Calendário Visual */}
                  <CalendarButton
                    selectedMonth={mesAtual}
                    selectedYear={anoAtual}
                    onMonthChange={(month, year) => {
                      console.log('📅 Calendário mudou para:', month, year);
                      setMesAtual(month);
                      setAnoAtual(year);
                      
                      // ✨ CORREÇÃO: Forçar atualização imediata do filtro
                      const novoFiltro = {
                        inicio: new Date(year, month, 1).toISOString().split('T')[0],
                        fim: new Date(year, month + 1, 0).toISOString().split('T')[0]
                      };
                      setFiltroData(novoFiltro);
                    }}
                  />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      let novoMes, novoAno;
                      if (mesAtual === 11) {
                        novoMes = 0;
                        novoAno = anoAtual + 1;
                      } else {
                        novoMes = mesAtual + 1;
                        novoAno = anoAtual;
                      }
                      
                      console.log('➡️ Navegando para próximo mês:', novoMes, novoAno);
                      setMesAtual(novoMes);
                      setAnoAtual(novoAno);
                      
                      // ✨ CORREÇÃO: Forçar atualização imediata do filtro
                      const novoFiltro = {
                        inicio: new Date(novoAno, novoMes, 1).toISOString().split('T')[0],
                        fim: new Date(novoAno, novoMes + 1, 0).toISOString().split('T')[0]
                      };
                      setFiltroData(novoFiltro);
                    }}
                  >
                    Próximo →
                  </Button>
                </>
              )}

              {periodoView === 'anual' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAnoAtual(anoAtual - 1)}
                  >
                    ← {anoAtual - 1}
                  </Button>
                  
                  <div className="text-center min-w-[80px]">
                    <span className="font-semibold">{anoAtual}</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAnoAtual(anoAtual + 1)}
                  >
                    {anoAtual + 1} →
                  </Button>
                </>
              )}

              <Button 
                size="sm"
                onClick={() => setFiltroData(calcularFiltroData())}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="fluxo-caixa">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="contas-receber">Contas a Receber</TabsTrigger>
          <TabsTrigger value="contas-pagar">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Receita Total</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(resumoGeral?.total_receitas || 0)}
                    </p>
                    {/* ✨ NOVO: Breakdown das receitas incluindo ingressos */}
                    {resumoGeral && (resumoGeral.receitas_viagem > 0 || resumoGeral.receitas_passeios > 0 || resumoGeral.receitas_extras > 0 || resumoGeral.receitas_ingressos > 0) && (
                      <div className="mt-2 space-y-1">
                        {resumoGeral.receitas_viagem > 0 && (
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>• Viagens:</span>
                            <span>{formatCurrency(resumoGeral.receitas_viagem)}</span>
                          </div>
                        )}
                        {resumoGeral.receitas_passeios > 0 && (
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>• Passeios:</span>
                            <span>{formatCurrency(resumoGeral.receitas_passeios)}</span>
                          </div>
                        )}
                        {resumoGeral.receitas_ingressos > 0 && (
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>• Ingressos:</span>
                            <span>{formatCurrency(resumoGeral.receitas_ingressos)}</span>
                          </div>
                        )}
                        {resumoGeral.receitas_extras > 0 && (
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>• Extras:</span>
                            <span>{formatCurrency(resumoGeral.receitas_extras)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-2">
                  <Badge className={`${
                    (resumoGeral?.crescimento_receitas || 0) >= 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {(resumoGeral?.crescimento_receitas || 0) >= 0 ? '+' : ''}
                    {resumoGeral?.crescimento_receitas || 0}% vs {
                      periodoView === 'mensal' ? 'mês anterior' :
                      periodoView === 'anual' ? 'ano anterior' : 'período anterior'
                    }
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Despesas Totais</p>
                    <p className="text-2xl font-bold text-red-600">
                      {loadingContas && loadingResumo ? (
                        <span className="animate-pulse">Carregando...</span>
                      ) : (() => {
                        // ✨ CORREÇÃO: Cálculo rápido igual ao card de receitas
                        const totalDespesasResumo = resumoGeral?.total_despesas || 0;
                        const totalDespesasArray = contasPagar?.reduce((sum, d) => sum + d.valor, 0) || 0;
                        
                        console.log('🔍 DEBUG Despesas Card:', {
                          totalDespesasResumo,
                          totalDespesasArray,
                          contasPagarCount: contasPagar?.length || 0,
                          resumoGeral: resumoGeral ? 'existe' : 'null',
                          loadingContas,
                          loadingResumo
                        });
                        
                        // Usar o valor do resumo se disponível, senão calcular das contas
                        return formatCurrency(totalDespesasResumo || totalDespesasArray);
                      })()}
                    </p>
                    {/* ✨ NOVO: Breakdown das despesas igual ao card de receitas */}
                    {contasPagar && contasPagar.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {(() => {
                          const despesasManuais = contasPagar.filter(d => d.status !== 'calculado').reduce((sum, d) => sum + d.valor, 0);
                          const custosPasseios = contasPagar.filter(d => d.status === 'calculado' && d.categoria === 'passeios').reduce((sum, d) => sum + d.valor, 0);
                          const custosIngressos = contasPagar.filter(d => d.status === 'calculado' && d.categoria === 'ingressos').reduce((sum, d) => sum + d.valor, 0);
                          
                          return (
                            <>
                              {despesasManuais > 0 && (
                                <div className="flex justify-between text-xs text-gray-600">
                                  <span>• Operacionais:</span>
                                  <span>{formatCurrency(despesasManuais)}</span>
                                </div>
                              )}
                              {custosPasseios > 0 && (
                                <div className="flex justify-between text-xs text-gray-600">
                                  <span>• Custos Passeios:</span>
                                  <span>{formatCurrency(custosPasseios)}</span>
                                </div>
                              )}
                              {custosIngressos > 0 && (
                                <div className="flex justify-between text-xs text-gray-600">
                                  <span>• Custos Ingressos:</span>
                                  <span>{formatCurrency(custosIngressos)}</span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
                <div className="mt-2">
                  <Badge className={`${
                    (resumoGeral?.crescimento_despesas || 0) <= 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {(resumoGeral?.crescimento_despesas || 0) >= 0 ? '+' : ''}
                    {resumoGeral?.crescimento_despesas || 0}% vs {
                      periodoView === 'mensal' ? 'mês anterior' :
                      periodoView === 'anual' ? 'ano anterior' : 'período anterior'
                    }
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Lucro Líquido</p>
                    <p className={`text-2xl font-bold ${
                      (() => {
                        // ✨ CORREÇÃO: Cálculo rápido do lucro
                        const receitas = resumoGeral?.total_receitas || 0;
                        const totalDespesasResumo = resumoGeral?.total_despesas || 0;
                        const totalDespesasArray = contasPagar?.reduce((sum, d) => sum + d.valor, 0) || 0;
                        const despesas = totalDespesasResumo || totalDespesasArray;
                        const lucro = receitas - despesas;
                        return lucro >= 0 ? 'text-green-600' : 'text-red-600';
                      })()
                    }`}>
                      {(() => {
                        // ✨ CORREÇÃO: Cálculo rápido do lucro
                        const receitas = resumoGeral?.total_receitas || 0;
                        const totalDespesasResumo = resumoGeral?.total_despesas || 0;
                        const totalDespesasArray = contasPagar?.reduce((sum, d) => sum + d.valor, 0) || 0;
                        const despesas = totalDespesasResumo || totalDespesasArray;
                        const lucro = receitas - despesas;
                        return formatCurrency(lucro);
                      })()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    Margem: {(() => {
                      // ✨ CORREÇÃO: Cálculo rápido da margem
                      const receitas = resumoGeral?.total_receitas || 0;
                      const totalDespesasResumo = resumoGeral?.total_despesas || 0;
                      const totalDespesasArray = contasPagar?.reduce((sum, d) => sum + d.valor, 0) || 0;
                      const despesas = totalDespesasResumo || totalDespesasArray;
                      const lucro = receitas - despesas;
                      const margem = receitas > 0 ? (lucro / receitas) * 100 : 0;
                      return margem.toFixed(1);
                    })()}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pendências</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(resumoGeral?.total_pendencias || 0)}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
                <div className="mt-2">
                  <Badge className="bg-orange-100 text-orange-800">
                    {resumoGeral?.count_pendencias || 0} passageiros
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navegação Rápida de Meses (apenas na view mensal) */}
          {periodoView === 'mensal' && (
            <Card>
              <CardHeader>
                <CardTitle>Navegação Rápida - {anoAtual}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 12 }, (_, i) => {
                    const isAtual = i === mesAtual;
                    const mesNome = new Date(anoAtual, i).toLocaleDateString('pt-BR', { month: 'short' });
                    
                    return (
                      <Button
                        key={i}
                        variant={isAtual ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          console.log('🗓️ Clicando no mês:', i, 'Nome:', mesNome);
                          setMesAtual(i);
                          // ✨ CORREÇÃO: Forçar atualização imediata do filtro
                          const novoFiltro = {
                            inicio: new Date(anoAtual, i, 1).toISOString().split('T')[0],
                            fim: new Date(anoAtual, i + 1, 0).toISOString().split('T')[0]
                          };
                          console.log('📅 Novo filtro:', novoFiltro);
                          setFiltroData(novoFiltro);
                        }}
                        className={`${isAtual ? 'bg-blue-600 text-white' : ''}`}
                      >
                        {mesNome}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ✨ MELHORADO: Performance por Viagem - Lista Detalhada */}
          {viagensFinanceiro && viagensFinanceiro.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance por Viagem
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Análise detalhada de receitas, despesas e margem por viagem realizada
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {viagensFinanceiro.map((viagem) => (
                    <div key={viagem.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Flamengo x {viagem.adversario}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>📅 {format(new Date(viagem.data_jogo), 'dd/MM/yyyy', { locale: ptBR })}</span>
                              <span>👥 {viagem.total_passageiros} passageiros</span>
                              {viagem.pendencias > 0 && (
                                <span className="text-yellow-600">⚠️ {viagem.pendencias} pendências</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            viagem.margem >= 15 ? 'bg-green-100 text-green-800' :
                            viagem.margem >= 10 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            ✈️ Margem: {viagem.margem.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      
                      {/* Métricas Financeiras da Viagem */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Receita Total</p>
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(viagem.total_receitas)}
                          </p>
                          <div className="text-xs text-gray-500 mt-1">
                            <div>• Viagens: {formatCurrency(viagem.receitas_viagem)}</div>
                            {viagem.receitas_passeios > 0 && (
                              <div>• Passeios: {formatCurrency(viagem.receitas_passeios)}</div>
                            )}
                            {viagem.receitas_extras > 0 && (
                              <div>• Extras: {formatCurrency(viagem.receitas_extras)}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Despesas</p>
                          <p className="text-lg font-bold text-red-600">
                            {formatCurrency(viagem.total_despesas)}
                          </p>
                          <div className="text-xs text-gray-500 mt-1">
                            <div>• Operacionais</div>
                            <div>• Combustível</div>
                            <div>• Outras</div>
                          </div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Lucro</p>
                          <p className={`text-lg font-bold ${
                            viagem.lucro >= 0 ? 'text-blue-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(viagem.lucro)}
                          </p>
                          <div className="text-xs text-gray-500 mt-1">
                            <div>{viagem.lucro >= 0 ? '📈 Positivo' : '📉 Negativo'}</div>
                          </div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Margem</p>
                          <p className={`text-lg font-bold ${
                            viagem.margem >= 15 ? 'text-green-600' :
                            viagem.margem >= 10 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {viagem.margem.toFixed(1)}%
                          </p>
                          <div className="text-xs text-gray-500 mt-1">
                            <div>
                              {viagem.margem >= 15 ? '🟢 Excelente' :
                               viagem.margem >= 10 ? '🟡 Boa' :
                               '🔴 Baixa'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Resumo das Viagens */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-3">📊 Resumo das Viagens</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Total Viagens</p>
                      <p className="text-lg font-bold text-gray-900">
                        {viagensFinanceiro.length}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Receita Total</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(viagensFinanceiro.reduce((sum, v) => sum + v.total_receitas, 0))}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Despesas Total</p>
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(viagensFinanceiro.reduce((sum, v) => sum + v.total_despesas, 0))}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Lucro Total</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(viagensFinanceiro.reduce((sum, v) => sum + v.lucro, 0))}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ✨ NOVO: Card Apenas Ingressos */}
          {ingressosFinanceiro && ingressosFinanceiro.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Apenas Ingressos
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Relatório exclusivo dos ingressos vendidos no período
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ingressosFinanceiro.map((ingresso) => (
                    <div key={ingresso.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <Ticket className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Flamengo x {ingresso.adversario}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>📅 {format(new Date(ingresso.jogo_data), 'dd/MM/yyyy', { locale: ptBR })}</span>
                              <span>🏟️ {ingresso.setor_estadio}</span>
                              <span>👤 {ingresso.cliente_nome}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            ingresso.situacao_financeira === 'pago' 
                              ? 'bg-green-100 text-green-800'
                              : ingresso.situacao_financeira === 'pendente'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {ingresso.situacao_financeira === 'pago' ? '✅ Pago' : 
                             ingresso.situacao_financeira === 'pendente' ? '⏳ Pendente' : '❌ Cancelado'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Métricas Financeiras do Ingresso */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Receita</p>
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(ingresso.receita)}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Custo</p>
                          <p className="text-lg font-bold text-red-600">
                            {formatCurrency(ingresso.custo)}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Lucro</p>
                          <p className={`text-lg font-bold ${
                            ingresso.lucro >= 0 ? 'text-blue-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(ingresso.lucro)}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Margem</p>
                          <p className={`text-lg font-bold ${
                            ingresso.margem >= 0 ? 'text-purple-600' : 'text-red-600'
                          }`}>
                            {ingresso.margem.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Resumo Consolidado dos Ingressos */}
                <div className="mt-6 p-4 bg-red-50 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    📊 Resumo Apenas Ingressos
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Total Ingressos</p>
                      <p className="text-lg font-bold text-gray-900">
                        {ingressosFinanceiro.length}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Receita Total</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(ingressosFinanceiro.reduce((sum, i) => sum + i.receita, 0))}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Custo Total</p>
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(ingressosFinanceiro.reduce((sum, i) => sum + i.custo, 0))}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Lucro Total</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(ingressosFinanceiro.reduce((sum, i) => sum + i.lucro, 0))}
                      </p>
                    </div>
                  </div>
                  
                  {/* Estatísticas Adicionais */}
                  <div className="mt-4 pt-4 border-t border-red-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-gray-600">Margem Média</p>
                        <p className="text-sm font-semibold text-purple-600">
                          {ingressosFinanceiro.length > 0 
                            ? (ingressosFinanceiro.reduce((sum, i) => sum + i.margem, 0) / ingressosFinanceiro.length).toFixed(1)
                            : 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Ingressos Pagos</p>
                        <p className="text-sm font-semibold text-green-600">
                          {ingressosFinanceiro.filter(i => i.situacao_financeira === 'pago').length}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Pendentes</p>
                        <p className="text-sm font-semibold text-yellow-600">
                          {ingressosFinanceiro.filter(i => i.situacao_financeira === 'pendente').length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="fluxo-caixa">
          <FluxoCaixaTab fluxoCaixa={fluxoCaixa} />
        </TabsContent>

        <TabsContent value="contas-receber">
          <ContasReceberTab contasReceber={contasReceber} />
        </TabsContent>

        <TabsContent value="contas-pagar">
          <ContasPagarTab contasPagar={contasPagar} />
        </TabsContent>

        <TabsContent value="relatorios">
          <RelatoriosTab 
            resumoGeral={resumoGeral}
            viagensFinanceiro={viagensFinanceiro}
            filtroData={filtroData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}