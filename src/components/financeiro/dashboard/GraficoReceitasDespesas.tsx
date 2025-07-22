import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/utils/formatters';

interface DadosGrafico {
  mes: string;
  receitas: number;
  despesas: number;
  lucro: number;
}

interface GraficoReceitasDespesasProps {
  className?: string;
}

export const GraficoReceitasDespesas: React.FC<GraficoReceitasDespesasProps> = ({
  className = ""
}) => {
  const [dados, setDados] = useState<DadosGrafico[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('6'); // 6 meses por padrão

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const mesesAtras = parseInt(periodo);
      const dataInicio = new Date();
      dataInicio.setMonth(dataInicio.getMonth() - mesesAtras);
      dataInicio.setDate(1); // Primeiro dia do mês
      
      const dataFim = new Date();
      dataFim.setMonth(dataFim.getMonth() + 1);
      dataFim.setDate(0); // Último dia do mês atual

      // Buscar receitas por mês
      const { data: receitas, error: receitasError } = await supabase
        .from('receitas')
        .select('valor, data_recebimento')
        .gte('data_recebimento', dataInicio.toISOString().split('T')[0])
        .lte('data_recebimento', dataFim.toISOString().split('T')[0])
        .eq('status', 'recebido');

      if (receitasError) throw receitasError;

      // Buscar despesas por mês
      const { data: despesas, error: despesasError } = await supabase
        .from('despesas')
        .select('valor, data_vencimento')
        .gte('data_vencimento', dataInicio.toISOString().split('T')[0])
        .lte('data_vencimento', dataFim.toISOString().split('T')[0])
        .eq('status', 'pago');

      if (despesasError) throw despesasError;

      // Processar dados por mês
      const dadosPorMes: { [key: string]: DadosGrafico } = {};
      
      // Inicializar meses
      for (let i = 0; i < mesesAtras; i++) {
        const data = new Date();
        data.setMonth(data.getMonth() - i);
        const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        const mesNome = data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        
        dadosPorMes[chave] = {
          mes: mesNome,
          receitas: 0,
          despesas: 0,
          lucro: 0
        };
      }

      // Processar receitas
      receitas?.forEach(receita => {
        const data = new Date(receita.data_recebimento);
        const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        if (dadosPorMes[chave]) {
          dadosPorMes[chave].receitas += Number(receita.valor);
        }
      });

      // Processar despesas
      despesas?.forEach(despesa => {
        const data = new Date(despesa.data_vencimento);
        const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        if (dadosPorMes[chave]) {
          dadosPorMes[chave].despesas += Number(despesa.valor);
        }
      });

      // Calcular lucro e ordenar
      const dadosOrdenados = Object.values(dadosPorMes)
        .map(item => ({
          ...item,
          lucro: item.receitas - item.despesas
        }))
        .reverse(); // Mais recente primeiro

      setDados(dadosOrdenados);

    } catch (error) {
      console.error('Erro ao carregar dados do gráfico:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [periodo]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className={`border-0 shadow-lg ${className}`}>
        <CardHeader>
          <CardTitle>Receitas vs Despesas</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-0 shadow-lg ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Receitas vs Despesas</CardTitle>
            <CardDescription>
              Comparativo mensal de entradas e saídas
            </CardDescription>
          </div>
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 meses</SelectItem>
              <SelectItem value="6">6 meses</SelectItem>
              <SelectItem value="12">12 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dados} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="mes" 
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="receitas" 
                name="Receitas" 
                fill="#10b981" 
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="despesas" 
                name="Despesas" 
                fill="#ef4444" 
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="lucro" 
                name="Lucro" 
                fill="#3b82f6" 
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};