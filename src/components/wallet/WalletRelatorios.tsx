import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWalletResumo, useWalletTransacoes } from '@/hooks/useWallet';
import { formatCurrency } from '@/utils/formatters';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  FileText,
  Filter,
  Users,
  DollarSign
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WalletRelatoriosProps {
  className?: string;
}

export const WalletRelatorios: React.FC<WalletRelatoriosProps> = ({ className }) => {
  const [periodoSelecionado, setPeriodoSelecionado] = useState<'mes_atual' | 'mes_anterior' | 'ultimos_3_meses' | 'personalizado'>('mes_atual');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Calcular datas baseado no período selecionado
  const getDatasRelatorio = () => {
    const hoje = new Date();
    
    switch (periodoSelecionado) {
      case 'mes_atual':
        return {
          inicio: format(startOfMonth(hoje), 'yyyy-MM-dd'),
          fim: format(endOfMonth(hoje), 'yyyy-MM-dd'),
          nome: format(hoje, 'MMMM yyyy', { locale: ptBR })
        };
      case 'mes_anterior':
        const mesAnterior = subMonths(hoje, 1);
        return {
          inicio: format(startOfMonth(mesAnterior), 'yyyy-MM-dd'),
          fim: format(endOfMonth(mesAnterior), 'yyyy-MM-dd'),
          nome: format(mesAnterior, 'MMMM yyyy', { locale: ptBR })
        };
      case 'ultimos_3_meses':
        return {
          inicio: format(startOfMonth(subMonths(hoje, 2)), 'yyyy-MM-dd'),
          fim: format(endOfMonth(hoje), 'yyyy-MM-dd'),
          nome: 'Últimos 3 meses'
        };
      case 'personalizado':
        return {
          inicio: dataInicio,
          fim: dataFim,
          nome: `${dataInicio} a ${dataFim}`
        };
      default:
        return {
          inicio: format(startOfMonth(hoje), 'yyyy-MM-dd'),
          fim: format(endOfMonth(hoje), 'yyyy-MM-dd'),
          nome: format(hoje, 'MMMM yyyy', { locale: ptBR })
        };
    }
  };

  const { inicio, fim, nome } = getDatasRelatorio();

  // Dados
  const { data: resumoGeral } = useWalletResumo();
  const { data: transacoesPeriodo } = useWalletTransacoes(undefined, {
    data_inicio: inicio,
    data_fim: fim,
  }, 1000); // Limite alto para relatório

  // Calcular métricas do período
  const metricas = React.useMemo(() => {
    if (!transacoesPeriodo) return null;

    const depositos = transacoesPeriodo.filter(t => t.tipo === 'deposito');
    const usos = transacoesPeriodo.filter(t => t.tipo === 'uso');
    
    const totalDepositos = depositos.reduce((sum, t) => sum + t.valor, 0);
    const totalUsos = usos.reduce((sum, t) => sum + t.valor, 0);
    const saldoLiquido = totalDepositos - totalUsos;
    
    const clientesUnicos = new Set(transacoesPeriodo.map(t => t.cliente_id)).size;
    const clientesComDeposito = new Set(depositos.map(t => t.cliente_id)).size;
    const clientesComUso = new Set(usos.map(t => t.cliente_id)).size;

    return {
      totalTransacoes: transacoesPeriodo.length,
      totalDepositos,
      totalUsos,
      saldoLiquido,
      quantidadeDepositos: depositos.length,
      quantidadeUsos: usos.length,
      clientesUnicos,
      clientesComDeposito,
      clientesComUso,
      ticketMedioDeposito: depositos.length > 0 ? totalDepositos / depositos.length : 0,
      ticketMedioUso: usos.length > 0 ? totalUsos / usos.length : 0,
    };
  }, [transacoesPeriodo]);

  const exportarRelatorio = () => {
    if (!transacoesPeriodo || !metricas) return;

    // Preparar dados para exportação
    const dadosExportacao = {
      periodo: nome,
      dataGeracao: format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      resumo: metricas,
      transacoes: transacoesPeriodo.map(t => ({
        data: format(new Date(t.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        cliente: t.cliente?.nome || 'N/A',
        tipo: t.tipo === 'deposito' ? 'Depósito' : 'Uso',
        valor: t.valor,
        descricao: t.descricao || '',
        forma_pagamento: t.forma_pagamento || '',
        referencia: t.referencia_externa || '',
        saldo_anterior: t.saldo_anterior,
        saldo_posterior: t.saldo_posterior,
      }))
    };

    // Simular download (em produção, implementar exportação real)
    console.log('Dados para exportação:', dadosExportacao);
    
    // TODO: Implementar exportação real para Excel/CSV
    alert('Funcionalidade de exportação será implementada em breve!');
  };

  const gerarRelatorioPDF = () => {
    // TODO: Implementar geração de PDF
    alert('Geração de PDF será implementada em breve!');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Relatórios de Carteira
          </h2>
          <p className="text-gray-600">
            Análise detalhada das movimentações financeiras
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={gerarRelatorioPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Gerar PDF
          </Button>
          
          <Button onClick={exportarRelatorio} disabled={!metricas}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filtros de Período */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros do Relatório
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Período
              </label>
              <Select value={periodoSelecionado} onValueChange={(value: any) => setPeriodoSelecionado(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mes_atual">Este Mês</SelectItem>
                  <SelectItem value="mes_anterior">Mês Anterior</SelectItem>
                  <SelectItem value="ultimos_3_meses">Últimos 3 Meses</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {periodoSelecionado === 'personalizado' && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Data Início
                  </label>
                  <Input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Data Fim
                  </label>
                  <Input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
              </>
            )}
            
            <div className="flex items-end">
              <Badge variant="outline" className="text-blue-700 border-blue-300">
                📅 {nome}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      {metricas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Transações</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {metricas.totalTransacoes}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Depositado</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(metricas.totalDepositos)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Usado</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(metricas.totalUsos)}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Saldo Líquido</p>
                  <p className={`text-2xl font-bold ${
                    metricas.saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(metricas.saldoLiquido)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Análise Detalhada */}
      {metricas && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Análise de Depósitos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <TrendingUp className="h-5 w-5" />
                Análise de Depósitos
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantidade de depósitos:</span>
                  <span className="font-semibold">{metricas.quantidadeDepositos}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor total:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(metricas.totalDepositos)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Ticket médio:</span>
                  <span className="font-semibold">
                    {formatCurrency(metricas.ticketMedioDeposito)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Clientes únicos:</span>
                  <span className="font-semibold">{metricas.clientesComDeposito}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Análise de Usos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <TrendingDown className="h-5 w-5" />
                Análise de Usos
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantidade de usos:</span>
                  <span className="font-semibold">{metricas.quantidadeUsos}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor total:</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(metricas.totalUsos)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Ticket médio:</span>
                  <span className="font-semibold">
                    {formatCurrency(metricas.ticketMedioUso)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Clientes únicos:</span>
                  <span className="font-semibold">{metricas.clientesComUso}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resumo Geral do Sistema */}
      {resumoGeral && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Resumo Geral do Sistema
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {resumoGeral.total_clientes_com_saldo}
                </div>
                <div className="text-sm text-blue-700">Clientes com Saldo</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(resumoGeral.valor_total_carteiras)}
                </div>
                <div className="text-sm text-green-700">Total em Carteiras</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {resumoGeral.clientes_saldo_baixo}
                </div>
                <div className="text-sm text-yellow-700">Clientes Saldo Baixo</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WalletRelatorios;