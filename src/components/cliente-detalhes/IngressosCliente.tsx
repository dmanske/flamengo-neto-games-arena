import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Ingresso } from '@/types/ingressos';

interface IngressosClienteProps {
  clienteId: string;
}

export default function IngressosCliente({ clienteId }: IngressosClienteProps) {
  const [ingressos, setIngressos] = useState<Ingresso[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingressoParaDeletar, setIngressoParaDeletar] = useState<Ingresso | null>(null);
  const [modalDeletarAberto, setModalDeletarAberto] = useState(false);
  const [resumo, setResumo] = useState({
    total: 0,
    pagos: 0,
    pendentes: 0,
    cancelados: 0,
    valorTotal: 0,
    valorPago: 0,
    valorPendente: 0
  });

  useEffect(() => {
    if (clienteId) {
      buscarIngressos();
    }
  }, [clienteId]);

  const buscarIngressos = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('ingressos')
        .select(`
          *,
          cliente:clientes(nome, telefone),
          viagem:viagens(adversario, data_jogo)
        `)
        .eq('cliente_id', clienteId)
        .order('jogo_data', { ascending: false });

      if (error) throw error;

      const ingressosData = data || [];
      setIngressos(ingressosData);

      // Calcular resumo
      const resumoCalculado = ingressosData.reduce((acc, ingresso) => {
        acc.total++;
        
        switch (ingresso.situacao_financeira) {
          case 'pago':
            acc.pagos++;
            acc.valorPago += ingresso.valor_final;
            break;
          case 'pendente':
            acc.pendentes++;
            acc.valorPendente += ingresso.valor_final;
            break;
          case 'cancelado':
            acc.cancelados++;
            break;
        }
        
        acc.valorTotal += ingresso.valor_final;
        return acc;
      }, {
        total: 0,
        pagos: 0,
        pendentes: 0,
        cancelados: 0,
        valorTotal: 0,
        valorPago: 0,
        valorPendente: 0
      });

      setResumo(resumoCalculado);
    } catch (error) {
      console.error('Erro ao buscar ingressos:', error);
      toast.error('Erro ao carregar ingressos do cliente');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalDeletar = (ingresso: Ingresso) => {
    setIngressoParaDeletar(ingresso);
    setModalDeletarAberto(true);
  };

  const confirmarDelecao = async () => {
    if (!ingressoParaDeletar) return;

    try {
      const { error } = await supabase
        .from('ingressos')
        .delete()
        .eq('id', ingressoParaDeletar.id);

      if (error) throw error;

      toast.success('Ingresso removido com sucesso!');
      buscarIngressos(); // Recarregar a lista
      setModalDeletarAberto(false);
      setIngressoParaDeletar(null);
    } catch (error) {
      console.error('Erro ao deletar ingresso:', error);
      toast.error('Erro ao remover ingresso');
    }
  };

  const getSituacaoBadge = (situacao: string) => {
    switch (situacao) {
      case 'pago':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Pago</Badge>;
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{situacao}</Badge>;
    }
  };

  const getLocalBadge = (local: string) => {
    return local === 'casa' ? (
      <Badge className="bg-blue-100 text-blue-800">🏠 Casa</Badge>
    ) : (
      <Badge className="bg-purple-100 text-purple-800">✈️ Fora</Badge>
    );
  };

  // Função para agrupar ingressos por mês
  const agruparIngressosPorMes = (ingressos: Ingresso[]) => {
    const grupos = ingressos.reduce((acc, ingresso) => {
      const data = new Date(ingresso.jogo_data);
      const chaveAnoMes = format(data, 'yyyy-MM');
      const nomeAnoMes = format(data, 'MMMM yyyy', { locale: ptBR });
      
      if (!acc[chaveAnoMes]) {
        acc[chaveAnoMes] = {
          nome: nomeAnoMes.charAt(0).toUpperCase() + nomeAnoMes.slice(1),
          ingressos: [],
          resumo: {
            total: 0,
            valorTotal: 0,
            pagos: 0,
            pendentes: 0,
            cancelados: 0
          }
        };
      }
      
      acc[chaveAnoMes].ingressos.push(ingresso);
      acc[chaveAnoMes].resumo.total++;
      acc[chaveAnoMes].resumo.valorTotal += ingresso.valor_final;
      
      switch (ingresso.situacao_financeira) {
        case 'pago':
          acc[chaveAnoMes].resumo.pagos++;
          break;
        case 'pendente':
          acc[chaveAnoMes].resumo.pendentes++;
          break;
        case 'cancelado':
          acc[chaveAnoMes].resumo.cancelados++;
          break;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Ordenar por data (mais recente primeiro)
    return Object.entries(grupos)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([chave, dados]) => ({ chave, ...dados }));
  };

  const ingressosAgrupados = agruparIngressosPorMes(ingressos);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Ingressos</p>
                <p className="text-2xl font-bold text-gray-900">{resumo.total}</p>
              </div>
              <Ticket className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(resumo.valorTotal)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Pago</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(resumo.valorPago)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Pendente</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(resumo.valorPendente)}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Ingressos Organizados por Mês */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Histórico de Ingressos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ingressos.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum ingresso encontrado</h3>
              <p className="text-gray-500 mb-4">Este cliente ainda não possui ingressos cadastrados.</p>
            </div>
          ) : (
            <Accordion type="multiple" defaultValue={[ingressosAgrupados[0]?.chave]} className="w-full">
              {ingressosAgrupados.map((grupo) => (
                <AccordionItem key={grupo.chave} value={grupo.chave}>
                  <AccordionTrigger className="hover:no-underline [&>svg]:hidden">
                    <div className="flex items-center justify-between w-full mr-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-lg">{grupo.nome}</span>
                        <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-gray-500" />
                          <span>{grupo.resumo.total} ingressos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{formatCurrency(grupo.resumo.valorTotal)}</span>
                        </div>
                        <div className="flex gap-1">
                          {grupo.resumo.pagos > 0 && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              {grupo.resumo.pagos} pagos
                            </Badge>
                          )}
                          {grupo.resumo.pendentes > 0 && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                              {grupo.resumo.pendentes} pendentes
                            </Badge>
                          )}
                          {grupo.resumo.cancelados > 0 && (
                            <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                              {grupo.resumo.cancelados} cancelados
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Jogo</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Local</TableHead>
                            <TableHead>Setor</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Situação</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {grupo.ingressos.map((ingresso) => (
                            <TableRow key={ingresso.id}>
                              <TableCell>
                                <div className="font-medium">{ingresso.adversario}</div>
                                {ingresso.viagem && (
                                  <div className="text-sm text-gray-500">
                                    Viagem vinculada
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  {format(new Date(ingresso.jogo_data), 'dd/MM/yyyy', { locale: ptBR })}
                                </div>
                              </TableCell>
                              <TableCell>
                                {getLocalBadge(ingresso.local_jogo)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  {ingresso.setor_estadio}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{formatCurrency(ingresso.valor_final)}</div>
                                {ingresso.lucro > 0 && (
                                  <div className="text-sm text-green-600 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    +{formatCurrency(ingresso.lucro)}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {getSituacaoBadge(ingresso.situacao_financeira)}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => abrirModalDeletar(ingresso)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Remover ingresso"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas Adicionais */}
      {ingressos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{resumo.pagos}</div>
                <div className="text-sm text-gray-600">Ingressos Pagos</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{resumo.pendentes}</div>
                <div className="text-sm text-gray-600">Ingressos Pendentes</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{resumo.cancelados}</div>
                <div className="text-sm text-gray-600">Ingressos Cancelados</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Confirmação para Deletar Ingresso */}
      <AlertDialog open={modalDeletarAberto} onOpenChange={setModalDeletarAberto}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                  Remover Ingresso
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-gray-600 mt-1">
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          
          {ingressoParaDeletar && (
            <div className="py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Jogo:</span>
                  <span className="text-sm text-gray-900 font-medium">{ingressoParaDeletar.adversario}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Data:</span>
                  <span className="text-sm text-gray-900">
                    {format(new Date(ingressoParaDeletar.jogo_data), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Setor:</span>
                  <span className="text-sm text-gray-900">{ingressoParaDeletar.setor_estadio}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Valor:</span>
                  <span className="text-sm font-semibold text-green-600">
                    {formatCurrency(ingressoParaDeletar.valor_final)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  {getSituacaoBadge(ingressoParaDeletar.situacao_financeira)}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mt-4">
                Tem certeza que deseja remover este ingresso? Todos os dados e histórico de pagamentos serão perdidos permanentemente.
              </p>
            </div>
          )}

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel 
              onClick={() => {
                setIngressoParaDeletar(null);
                setModalDeletarAberto(false);
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarDelecao}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remover Ingresso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}