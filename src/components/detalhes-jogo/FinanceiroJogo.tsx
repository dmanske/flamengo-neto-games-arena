import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { JogoDetails } from '@/hooks/useJogoDetails';
import { Ingresso } from '@/types/ingressos';
import { formatCurrency } from '@/utils/formatters';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinanceiroJogoProps {
  jogo: JogoDetails;
  ingressos: Ingresso[];
}

interface HistoricoPagamento {
  id: string;
  ingresso_id: string;
  valor_pago: number;
  data_pagamento: string;
  forma_pagamento: string;
  observacoes?: string;
  cliente_nome?: string;
}

export function FinanceiroJogo({ jogo, ingressos }: FinanceiroJogoProps) {
  const [historicoPagamentos, setHistoricoPagamentos] = useState<HistoricoPagamento[]>([]);
  const [loadingPagamentos, setLoadingPagamentos] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);
  
  // Buscar histórico de pagamentos
  const buscarHistoricoPagamentos = async () => {
    if (ingressos.length === 0) return;
    
    setLoadingPagamentos(true);
    try {
      const ingressosIds = ingressos.map(ing => ing.id);
      
      const { data, error } = await supabase
        .from('historico_pagamentos_ingressos')
        .select(`
          *,
          ingresso:ingressos(
            cliente:clientes(nome)
          )
        `)
        .in('ingresso_id', ingressosIds)
        .order('data_pagamento', { ascending: false });

      if (error) {
        console.error('Erro ao buscar histórico de pagamentos:', error);
        return;
      }

      const pagamentosFormatados = (data || []).map(pag => ({
        ...pag,
        cliente_nome: pag.ingresso?.cliente?.nome || 'Cliente não encontrado'
      }));

      setHistoricoPagamentos(pagamentosFormatados);
    } catch (error) {
      console.error('Erro inesperado ao buscar pagamentos:', error);
    } finally {
      setLoadingPagamentos(false);
    }
  };

  // Carregar pagamentos quando ingressos mudarem
  useEffect(() => {
    if (showHistorico) {
      buscarHistoricoPagamentos();
    }
  }, [ingressos, showHistorico]);

  // Calcular estatísticas financeiras detalhadas
  const estatisticas = useMemo(() => {
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
    
    // Análise por setor
    const setores = ingressos.reduce((acc, ing) => {
      const setor = ing.setor_estadio;
      if (!acc[setor]) {
        acc[setor] = {
          quantidade: 0,
          receita: 0,
          lucro: 0,
          precoMedio: 0
        };
      }
      acc[setor].quantidade++;
      acc[setor].receita += ing.valor_final;
      acc[setor].lucro += ing.lucro;
      return acc;
    }, {} as Record<string, any>);
    
    // Calcular preço médio por setor
    Object.keys(setores).forEach(setor => {
      setores[setor].precoMedio = setores[setor].receita / setores[setor].quantidade;
    });
    
    // Análise por forma de pagamento
    const formasPagamento = historicoPagamentos.reduce((acc, pag) => {
      const forma = pag.forma_pagamento;
      if (!acc[forma]) {
        acc[forma] = {
          quantidade: 0,
          valor: 0
        };
      }
      acc[forma].quantidade++;
      acc[forma].valor += pag.valor_pago;
      return acc;
    }, {} as Record<string, any>);

    return {
      totalCusto,
      totalReceita,
      totalLucro,
      margemPercentual,
      receitaPaga,
      receitaPendente,
      receitaCancelada,
      setores: Object.entries(setores).map(([nome, dados]) => ({
        nome,
        ...dados
      })).sort((a, b) => b.receita - a.receita),
      formasPagamento: Object.entries(formasPagamento).map(([forma, dados]) => ({
        forma,
        ...dados
      })).sort((a, b) => b.valor - a.valor)
    };
  }, [jogo, ingressos, historicoPagamentos]);

  return (
    <div className="space-y-6">
      {/* Cards de resumo financeiro detalhado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Receita vs Custo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Receita Total:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(estatisticas.totalReceita)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Custo Total:</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(estatisticas.totalCusto)}
                </span>
              </div>
              <hr />
              <div className="flex justify-between text-sm font-bold">
                <span>Lucro Líquido:</span>
                <span className={estatisticas.totalLucro >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(estatisticas.totalLucro)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold">
                {estatisticas.margemPercentual.toFixed(1)}%
              </div>
              <Progress 
                value={Math.max(0, Math.min(100, estatisticas.margemPercentual))} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {estatisticas.margemPercentual >= 20 
                  ? 'Excelente margem de lucro'
                  : estatisticas.margemPercentual >= 10
                    ? 'Boa margem de lucro'
                    : estatisticas.margemPercentual >= 0
                      ? 'Margem baixa'
                      : 'Operação com prejuízo'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {jogo.total_ingressos > 0 
                  ? formatCurrency(estatisticas.totalReceita / jogo.total_ingressos)
                  : formatCurrency(0)
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Valor médio por ingresso
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise por Status de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle>Análise por Status de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(estatisticas.receitaPaga)}
              </div>
              <div className="text-sm text-green-700">
                Receita Paga ({jogo.ingressos_pagos} ingressos)
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {estatisticas.totalReceita > 0 
                  ? `${((estatisticas.receitaPaga / estatisticas.totalReceita) * 100).toFixed(1)}% do total`
                  : '0% do total'
                }
              </div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(estatisticas.receitaPendente)}
              </div>
              <div className="text-sm text-yellow-700">
                Receita Pendente ({jogo.ingressos_pendentes} ingressos)
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {estatisticas.totalReceita > 0 
                  ? `${((estatisticas.receitaPendente / estatisticas.totalReceita) * 100).toFixed(1)}% do total`
                  : '0% do total'
                }
              </div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(estatisticas.receitaCancelada)}
              </div>
              <div className="text-sm text-red-700">
                Receita Cancelada ({ingressos.filter(ing => ing.situacao_financeira === 'cancelado').length} ingressos)
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Valor perdido por cancelamentos
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análise por Setor */}
      {estatisticas.setores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Análise por Setor do Estádio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {estatisticas.setores.map((setor, index) => (
                <div key={setor.nome} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{setor.nome}</div>
                    <div className="text-sm text-muted-foreground">
                      {setor.quantidade} ingresso{setor.quantidade > 1 ? 's' : ''} • 
                      Preço médio: {formatCurrency(setor.precoMedio)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(setor.receita)}</div>
                    <div className={`text-sm ${setor.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Lucro: {formatCurrency(setor.lucro)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico de Pagamentos */}
      {ingressos.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Histórico de Pagamentos</CardTitle>
              <Button
                variant="outline"
                onClick={() => {
                  setShowHistorico(!showHistorico);
                  if (!showHistorico) {
                    buscarHistoricoPagamentos();
                  }
                }}
                disabled={loadingPagamentos}
              >
                {showHistorico ? 'Ocultar' : 'Ver Histórico'}
              </Button>
            </div>
          </CardHeader>
          
          {showHistorico && (
            <CardContent>
              {loadingPagamentos ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Carregando pagamentos...</p>
                </div>
              ) : historicoPagamentos.length > 0 ? (
                <div className="space-y-4">
                  {/* Resumo por forma de pagamento */}
                  {estatisticas.formasPagamento.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {estatisticas.formasPagamento.map((forma) => (
                        <div key={forma.forma} className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium capitalize">{forma.forma.replace('_', ' ')}</div>
                          <div className="text-lg font-bold">{formatCurrency(forma.valor)}</div>
                          <div className="text-sm text-muted-foreground">
                            {forma.quantidade} pagamento{forma.quantidade > 1 ? 's' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tabela de pagamentos */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Forma</TableHead>
                          <TableHead>Observações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historicoPagamentos.map((pagamento) => (
                          <TableRow key={pagamento.id}>
                            <TableCell>
                              {format(new Date(pagamento.data_pagamento), 'dd/MM/yyyy', { locale: ptBR })}
                            </TableCell>
                            <TableCell>{pagamento.cliente_nome}</TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(pagamento.valor_pago)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {pagamento.forma_pagamento.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {pagamento.observacoes || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">💳</div>
                  <p className="text-muted-foreground">Nenhum pagamento registrado ainda.</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Estado vazio */}
      {ingressos.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium mb-2">Nenhum dado financeiro</h3>
            <p className="text-muted-foreground">
              Cadastre ingressos para ver a análise financeira detalhada do jogo.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}