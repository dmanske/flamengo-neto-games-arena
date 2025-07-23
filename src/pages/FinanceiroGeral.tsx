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
  RefreshCw
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useFinanceiroGeral } from '@/hooks/useFinanceiroGeral';
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
    setFiltroData(calcularFiltroData());
  }, [periodoView, mesAtual, anoAtual]);

  const {
    resumoGeral,
    fluxoCaixa,
    contasReceber,
    contasPagar,
    viagensFinanceiro,
    isLoading,
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
                      if (mesAtual === 0) {
                        setMesAtual(11);
                        setAnoAtual(anoAtual - 1);
                      } else {
                        setMesAtual(mesAtual - 1);
                      }
                    }}
                  >
                    ← Anterior
                  </Button>
                  
                  {/* Calendário Visual */}
                  <CalendarButton
                    selectedMonth={mesAtual}
                    selectedYear={anoAtual}
                    onMonthChange={(month, year) => {
                      setMesAtual(month);
                      setAnoAtual(year);
                    }}
                  />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (mesAtual === 11) {
                        setMesAtual(0);
                        setAnoAtual(anoAtual + 1);
                      } else {
                        setMesAtual(mesAtual + 1);
                      }
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
                  <div>
                    <p className="text-sm font-medium text-gray-600">Receita Total</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(resumoGeral?.total_receitas || 0)}
                    </p>
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
                  <div>
                    <p className="text-sm font-medium text-gray-600">Despesas Total</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(resumoGeral?.total_despesas || 0)}
                    </p>
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
                      (resumoGeral?.lucro_liquido || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(resumoGeral?.lucro_liquido || 0)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    Margem: {resumoGeral?.margem_lucro || 0}%
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
                        onClick={() => setMesAtual(i)}
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

          {/* Performance por Viagem */}
          <Card>
            <CardHeader>
              <CardTitle>
                Performance por Viagem - {
                  periodoView === 'mensal' 
                    ? new Date(anoAtual, mesAtual).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                    : periodoView === 'anual' 
                    ? `Ano ${anoAtual}`
                    : 'Período selecionado'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {viagensFinanceiro?.map((viagem) => (
                  <div key={viagem.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="font-semibold">{viagem.adversario}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(viagem.data_jogo).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Receitas</p>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(viagem.total_receitas)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Despesas</p>
                        <p className="font-semibold text-red-600">
                          {formatCurrency(viagem.total_despesas)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Lucro</p>
                        <p className={`font-semibold ${
                          viagem.lucro >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(viagem.lucro)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Margem</p>
                        <Badge className={
                          viagem.margem >= 15 ? 'bg-green-100 text-green-800' :
                          viagem.margem >= 10 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {viagem.margem.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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