import React, { useState, useMemo } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWalletTransacoesAgrupadas } from '@/hooks/useWallet';
import { WalletHistoricoAgrupadoProps, FILTROS_RAPIDOS_OPTIONS } from '@/types/wallet';
import { formatCurrency } from '@/utils/formatters';
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Filter,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export const WalletHistoricoAgrupado: React.FC<WalletHistoricoAgrupadoProps> = ({
  clienteId,
  filtroRapido = 'tudo',
  showFilters = true,
  showExport = true,
}) => {
  // Estados locais
  const [filtroAtivo, setFiltroAtivo] = useState(filtroRapido);
  const [buscaDescricao, setBuscaDescricao] = useState('');
  const [mesesAbertos, setMesesAbertos] = useState<Set<string>>(new Set(['0'])); // Primeiro mês aberto por padrão

  // Dados
  const { data: transacoesPorMes, isLoading, error } = useWalletTransacoesAgrupadas(
    clienteId,
    filtroAtivo
  );

  // Filtrar por busca de descrição
  const transacoesFiltradas = useMemo(() => {
    if (!transacoesPorMes || !buscaDescricao.trim()) {
      return transacoesPorMes || [];
    }

    return transacoesPorMes.map(mes => ({
      ...mes,
      transacoes: mes.transacoes.filter(t => 
        t.descricao?.toLowerCase().includes(buscaDescricao.toLowerCase()) ||
        t.forma_pagamento?.toLowerCase().includes(buscaDescricao.toLowerCase())
      )
    })).filter(mes => mes.transacoes.length > 0);
  }, [transacoesPorMes, buscaDescricao]);

  // Funções utilitárias
  const toggleMes = (chave: string) => {
    const novoSet = new Set(mesesAbertos);
    if (novoSet.has(chave)) {
      novoSet.delete(chave);
    } else {
      novoSet.add(chave);
    }
    setMesesAbertos(novoSet);
  };

  const abrirTodos = () => {
    const todasChaves = transacoesFiltradas.map((_, index) => index.toString());
    setMesesAbertos(new Set(todasChaves));
  };

  const fecharTodos = () => {
    setMesesAbertos(new Set());
  };

  const exportarDados = () => {
    // TODO: Implementar exportação para Excel/CSV
    console.log('Exportar dados:', transacoesFiltradas);
  };

  const getTransacaoIcon = (tipo: 'deposito' | 'uso') => {
    return tipo === 'deposito' ? '💰' : '🛒';
  };

  const getTransacaoColor = (tipo: 'deposito' | 'uso') => {
    return tipo === 'deposito' ? 'text-green-600' : 'text-red-600';
  };

  const formatarData = (data: string) => {
    return format(new Date(data), 'dd/MM', { locale: ptBR });
  };

  const formatarDataCompleta = (data: string) => {
    return format(new Date(data), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-red-600 mb-2">❌ Erro ao carregar histórico</div>
          <div className="text-sm text-gray-600">{error.message}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Histórico por Mês
        </CardTitle>
        
        {/* Filtros */}
        {showFilters && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {/* Filtros Rápidos */}
              <div className="flex gap-2">
                {FILTROS_RAPIDOS_OPTIONS.map((opcao) => (
                  <Button
                    key={opcao.value}
                    variant={filtroAtivo === opcao.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFiltroAtivo(opcao.value)}
                  >
                    {opcao.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Busca por Descrição */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por descrição ou forma de pagamento..."
                  value={buscaDescricao}
                  onChange={(e) => setBuscaDescricao(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Controles de Expansão */}
              <Button variant="outline" size="sm" onClick={abrirTodos}>
                Abrir Todos
              </Button>
              <Button variant="outline" size="sm" onClick={fecharTodos}>
                Fechar Todos
              </Button>
              
              {/* Exportar */}
              {showExport && (
                <Button variant="outline" size="sm" onClick={exportarDados}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              )}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {transacoesFiltradas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Nenhuma transação encontrada</p>
            <p className="text-sm">
              {buscaDescricao ? 'Tente ajustar os filtros de busca.' : 'Não há transações para o período selecionado.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transacoesFiltradas.map((mes, index) => (
              <Collapsible
                key={mes.chave}
                open={mesesAbertos.has(index.toString())}
                onOpenChange={() => toggleMes(index.toString())}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      {mesesAbertos.has(index.toString()) ? (
                        <ChevronDown className="h-4 w-4 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                      )}
                      
                      <div>
                        <h3 className="font-medium text-gray-900">
                          📅 {mes.nome}
                        </h3>
                        <div className="text-sm text-gray-600">
                          {mes.resumo.quantidade_transacoes} transações
                        </div>
                      </div>
                    </div>

                    {/* Resumo do Mês */}
                    <div className="flex items-center gap-4 text-sm">
                      {mes.resumo.total_depositos > 0 && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">
                            +{formatCurrency(mes.resumo.total_depositos)}
                          </span>
                        </div>
                      )}
                      
                      {mes.resumo.total_usos > 0 && (
                        <div className="flex items-center gap-1">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                          <span className="text-red-600 font-medium">
                            -{formatCurrency(mes.resumo.total_usos)}
                          </span>
                        </div>
                      )}
                      
                      <Badge 
                        variant={mes.resumo.saldo_liquido >= 0 ? 'default' : 'destructive'}
                        className="ml-2"
                      >
                        {mes.resumo.saldo_liquido >= 0 ? '+' : ''}
                        {formatCurrency(mes.resumo.saldo_liquido)}
                      </Badge>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="mt-2 space-y-2">
                    {mes.transacoes.map((transacao) => (
                      <div
                        key={transacao.id}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-lg">
                            {getTransacaoIcon(transacao.tipo)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-gray-600">
                                {formatarData(transacao.created_at)}
                              </span>
                              
                              <span className={cn('font-medium', getTransacaoColor(transacao.tipo))}>
                                {transacao.tipo === 'deposito' ? '+' : '-'}
                                {formatCurrency(transacao.valor)}
                              </span>
                              
                              {transacao.forma_pagamento && (
                                <Badge variant="outline" className="text-xs">
                                  {transacao.forma_pagamento}
                                </Badge>
                              )}
                            </div>
                            
                            {transacao.descricao && (
                              <div className="text-sm text-gray-600">
                                {transacao.descricao}
                              </div>
                            )}
                            
                            {transacao.referencia_externa && (
                              <div className="text-xs text-blue-600 mt-1">
                                Ref: {transacao.referencia_externa}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right text-xs text-gray-500">
                          <div>{formatarDataCompleta(transacao.created_at)}</div>
                          <div>
                            Saldo: {formatCurrency(transacao.saldo_posterior)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletHistoricoAgrupado;