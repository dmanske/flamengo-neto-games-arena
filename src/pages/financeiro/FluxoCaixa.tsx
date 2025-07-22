import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Settings, BarChart3, LineChart } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useIndicadoresFinanceiros } from "@/hooks/financeiro/useIndicadoresFinanceiros";
import { useReceitas } from "@/hooks/financeiro/useReceitas";
import { useDespesas } from "@/hooks/financeiro/useDespesas";
import { useContasPagar } from "@/hooks/financeiro/useContasPagar";
import { toast } from "sonner";

const FluxoCaixa = () => {
  const { indicadores, loading, fetchIndicadores, getIndicadoresPorPeriodo } = useIndicadoresFinanceiros();
  const { receitas } = useReceitas();
  const { despesas } = useDespesas();
  const { contasPagar } = useContasPagar();
  
  const [showProjecaoForm, setShowProjecaoForm] = useState(false);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mes_atual');
  const [dadosGrafico, setDadosGrafico] = useState<any[]>([]);
  const [projecaoConfig, setProjecaoConfig] = useState({
    crescimento_receita: 5,
    crescimento_despesa: 3,
    meses_projecao: 6
  });

  // Calcular dados reais do fluxo de caixa
  const calcularFluxoReal = () => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    const receitasMes = receitas?.filter(r => {
      const dataReceita = new Date(r.data_recebimento);
      return dataReceita >= inicioMes && dataReceita <= fimMes && r.status === 'recebido';
    }) || [];
    
    const despesasMes = despesas?.filter(d => {
      const dataDespesa = new Date(d.data_vencimento);
      return dataDespesa >= inicioMes && dataDespesa <= fimMes && d.status === 'pago';
    }) || [];
    
    const contasMes = contasPagar?.filter(c => {
      const dataConta = new Date(c.data_vencimento);
      return dataConta >= inicioMes && dataConta <= fimMes && c.status === 'pago';
    }) || [];
    
    const entradas = receitasMes.reduce((sum, r) => sum + r.valor, 0);
    const saidasDespesas = despesasMes.reduce((sum, d) => sum + d.valor, 0);
    const saidasContas = contasMes.reduce((sum, c) => sum + c.valor, 0);
    const totalSaidas = saidasDespesas + saidasContas;
    
    return {
      entradas,
      saidas: totalSaidas,
      saldoAtual: entradas - totalSaidas,
      projecao: calcularProjecao(entradas, totalSaidas)
    };
  };

  const calcularProjecao = (entradas: number, saidas: number) => {
    const crescimentoReceita = projecaoConfig.crescimento_receita / 100;
    const crescimentoDespesa = projecaoConfig.crescimento_despesa / 100;
    
    const entradasProjetadas = entradas * (1 + crescimentoReceita);
    const saidasProjetadas = saidas * (1 + crescimentoDespesa);
    
    return entradasProjetadas - saidasProjetadas;
  };

  // Gerar dados para gráfico dos últimos 6 meses
  const gerarDadosGrafico = async () => {
    const dados = [];
    const hoje = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const inicioMes = mes.toISOString().split('T')[0];
      const fimMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const indicadoresMes = await getIndicadoresPorPeriodo(inicioMes, fimMes);
      
      dados.push({
        mes: mes.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        entradas: indicadoresMes.receita_total,
        saidas: indicadoresMes.despesa_total,
        saldo: indicadoresMes.lucro_liquido
      });
    }
    
    setDadosGrafico(dados);
  };

  const fluxoData = calcularFluxoReal();

  useEffect(() => {
    gerarDadosGrafico();
  }, [receitas, despesas, contasPagar]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="container py-6 px-4 sm:px-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="h-80 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container py-6 px-4 sm:px-6">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-700 bg-clip-text text-transparent">
              Fluxo de Caixa
            </h1>
            <p className="text-slate-600 mt-2">
              Análise financeira com dados reais e projeções inteligentes
            </p>
          </div>
          
          <div className="flex gap-2">
            <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mes_atual">Mês Atual</SelectItem>
                <SelectItem value="trimestre">Trimestre</SelectItem>
                <SelectItem value="semestre">Semestre</SelectItem>
                <SelectItem value="ano">Ano</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline"
              onClick={() => {
                fetchIndicadores();
                gerarDadosGrafico();
                toast.success('Dados atualizados!');
              }}
            >
              Atualizar
            </Button>
          </div>
        </div>

        {/* Resumo do Mês Atual */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Entradas</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(fluxoData.entradas)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Saídas</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(fluxoData.saidas)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Saldo Atual</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(fluxoData.saldoAtual)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Projeção</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(fluxoData.projecao)}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos de Fluxo de Caixa */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Fluxo de Caixa - Últimos 6 Meses
              </CardTitle>
              <CardDescription>
                Entradas vs Saídas mensais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dadosGrafico.length > 0 ? (
                  dadosGrafico.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.mes}</div>
                        <div className="flex gap-4 text-xs text-slate-600 mt-1">
                          <span className="text-green-600">↗ {formatCurrency(item.entradas)}</span>
                          <span className="text-red-600">↘ {formatCurrency(item.saidas)}</span>
                        </div>
                      </div>
                      <div className={`font-bold ${item.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(item.saldo)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>Carregando dados históricos...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Resumo por Categoria
              </CardTitle>
              <CardDescription>
                Principais categorias de entrada e saída
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-600 mb-2">Principais Receitas</h4>
                  {receitas && receitas.length > 0 ? (
                    receitas.slice(0, 3).map((receita, index) => (
                      <div key={index} className="flex justify-between text-sm py-1">
                        <span className="text-slate-600">{receita.categoria}</span>
                        <span className="font-medium text-green-600">{formatCurrency(receita.valor)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">Nenhuma receita cadastrada</p>
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium text-red-600 mb-2">Principais Despesas</h4>
                  {despesas && despesas.length > 0 ? (
                    despesas.slice(0, 3).map((despesa, index) => (
                      <div key={index} className="flex justify-between text-sm py-1">
                        <span className="text-slate-600">{despesa.categoria}</span>
                        <span className="font-medium text-red-600">{formatCurrency(despesa.valor)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">Nenhuma despesa cadastrada</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projeções Futuras */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Projeções dos Próximos Meses</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowProjecaoForm(!showProjecaoForm)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            </CardTitle>
            <CardDescription>
              Estimativas baseadas no histórico e parâmetros configurados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showProjecaoForm ? (
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium">Configurar Projeções</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="crescimento_receita">Crescimento Receita (%)</Label>
                    <Input
                      id="crescimento_receita"
                      type="number"
                      value={projecaoConfig.crescimento_receita}
                      onChange={(e) => setProjecaoConfig(prev => ({
                        ...prev,
                        crescimento_receita: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="crescimento_despesa">Crescimento Despesa (%)</Label>
                    <Input
                      id="crescimento_despesa"
                      type="number"
                      value={projecaoConfig.crescimento_despesa}
                      onChange={(e) => setProjecaoConfig(prev => ({
                        ...prev,
                        crescimento_despesa: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="meses_projecao">Meses para Projetar</Label>
                    <Select 
                      value={projecaoConfig.meses_projecao.toString()}
                      onValueChange={(value) => setProjecaoConfig(prev => ({
                        ...prev,
                        meses_projecao: parseInt(value)
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 meses</SelectItem>
                        <SelectItem value="6">6 meses</SelectItem>
                        <SelectItem value="12">12 meses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setShowProjecaoForm(false);
                      toast.success('Configurações salvas!');
                    }}
                    size="sm"
                  >
                    Salvar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowProjecaoForm(false)}
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(fluxoData.entradas * (1 + projecaoConfig.crescimento_receita / 100))}
                    </div>
                    <div className="text-sm text-green-700">Receitas Projetadas</div>
                    <div className="text-xs text-slate-500">
                      +{projecaoConfig.crescimento_receita}% vs atual
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(fluxoData.saidas * (1 + projecaoConfig.crescimento_despesa / 100))}
                    </div>
                    <div className="text-sm text-red-700">Despesas Projetadas</div>
                    <div className="text-xs text-slate-500">
                      +{projecaoConfig.crescimento_despesa}% vs atual
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className={`text-2xl font-bold ${fluxoData.projecao >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatCurrency(fluxoData.projecao)}
                    </div>
                    <div className="text-sm text-blue-700">Saldo Projetado</div>
                    <div className="text-xs text-slate-500">
                      Próximo mês
                    </div>
                  </div>
                </div>
                
                <div className="text-center text-slate-500 text-sm">
                  <p>
                    💡 <strong>O que são projeções?</strong> São estimativas de receitas e despesas futuras 
                    baseadas no seu histórico atual e parâmetros de crescimento que você define.
                  </p>
                  <p className="mt-2">
                    Use para planejar investimentos, controlar gastos e tomar decisões financeiras.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FluxoCaixa;