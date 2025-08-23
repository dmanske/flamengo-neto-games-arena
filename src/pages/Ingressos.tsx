import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, Calendar, ChevronDown, Ticket, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIngressos } from '@/hooks/useIngressos';
import { usePagamentosIngressos } from '@/hooks/usePagamentosIngressos';
import { Ingresso, FiltrosIngressos, SituacaoFinanceiraIngresso } from '@/types/ingressos';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FiltrosIngressosModal } from '@/components/ingressos/FiltrosIngressosModal';
import { IngressoDetailsModal } from '@/components/ingressos/IngressoDetailsModal';
import { IngressoFormModal } from '@/components/ingressos/IngressoFormModal';

// Componentes que serão criados posteriormente
// import { IngressoFormModal } from '@/components/ingressos/IngressoFormModal';
// import { IngressoDetailsModal } from '@/components/ingressos/IngressoDetailsModal';
// import { FiltrosIngressosModal } from '@/components/ingressos/FiltrosIngressosModal';

export default function Ingressos() {
  const { 
    ingressos, 
    resumoFinanceiro, 
    estados, 
    buscarIngressos,
    buscarResumoFinanceiro,
    deletarIngresso 
  } = useIngressos();

  const [filtros, setFiltros] = useState<FiltrosIngressos>({});
  const [busca, setBusca] = useState('');
  const [ingressoSelecionado, setIngressoSelecionado] = useState<Ingresso | null>(null);
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [modalFiltrosAberto, setModalFiltrosAberto] = useState(false);

  // Filtrar ingressos baseado na busca
  const ingressosFiltrados = ingressos.filter(ingresso => {
    if (!busca) return true;
    
    const termoBusca = busca.toLowerCase();
    return (
      ingresso.adversario.toLowerCase().includes(termoBusca) ||
      ingresso.cliente?.nome.toLowerCase().includes(termoBusca) ||
      ingresso.setor_estadio.toLowerCase().includes(termoBusca)
    );
  });

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
            lucroTotal: 0,
            pagos: 0,
            pendentes: 0,
            cancelados: 0
          }
        };
      }
      
      acc[chaveAnoMes].ingressos.push(ingresso);
      acc[chaveAnoMes].resumo.total++;
      acc[chaveAnoMes].resumo.valorTotal += ingresso.valor_final;
      acc[chaveAnoMes].resumo.lucroTotal += ingresso.lucro;
      
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

  const ingressosAgrupados = agruparIngressosPorMes(ingressosFiltrados);

  // Função para obter cor do badge de status
  const getStatusBadgeVariant = (status: SituacaoFinanceiraIngresso) => {
    switch (status) {
      case 'pago':
        return 'default'; // Verde
      case 'pendente':
        return 'secondary'; // Amarelo
      case 'cancelado':
        return 'destructive'; // Vermelho
      default:
        return 'outline';
    }
  };

  // Função para obter texto do status
  const getStatusText = (status: SituacaoFinanceiraIngresso) => {
    switch (status) {
      case 'pago':
        return '✅ Pago';
      case 'pendente':
        return '⏳ Pendente';
      case 'cancelado':
        return '❌ Cancelado';
      default:
        return status;
    }
  };

  // Função para deletar ingresso com confirmação
  const handleDeletar = async (ingresso: Ingresso) => {
    if (window.confirm(`Tem certeza que deseja deletar o ingresso de ${ingresso.cliente?.nome} para o jogo contra ${ingresso.adversario}?`)) {
      await deletarIngresso(ingresso.id);
    }
  };

  // Função para abrir modal de detalhes
  const handleVerDetalhes = (ingresso: Ingresso) => {
    setIngressoSelecionado(ingresso);
    setModalDetalhesAberto(true);
  };

  // Função para abrir modal de edição
  const handleEditar = (ingresso: Ingresso) => {
    setIngressoSelecionado(ingresso);
    setModalFormAberto(true);
  };

  // Aplicar filtros quando mudarem
  useEffect(() => {
    buscarIngressos(filtros);
    buscarResumoFinanceiro(filtros);
  }, [filtros, buscarIngressos, buscarResumoFinanceiro]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Ingressos</h1>
          <p className="text-muted-foreground">
            Controle de vendas de ingressos separados das viagens
          </p>
        </div>
        <Button onClick={() => setModalFormAberto(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Ingresso
        </Button>
      </div>

      {/* Cards de Resumo */}
      {resumoFinanceiro && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Ingressos</CardTitle>
              <span className="text-2xl">🎫</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumoFinanceiro.total_ingressos}</div>
              <p className="text-xs text-muted-foreground">
                {resumoFinanceiro.ingressos_pagos} pagos • {resumoFinanceiro.ingressos_pendentes} pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <span className="text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(resumoFinanceiro.total_receita)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(resumoFinanceiro.valor_recebido)} recebido
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
              <span className="text-2xl">📈</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(resumoFinanceiro.total_lucro)}</div>
              <p className="text-xs text-muted-foreground">
                Margem: {resumoFinanceiro.margem_media.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendências</CardTitle>
              <span className="text-2xl">⏳</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(resumoFinanceiro.valor_pendente)}</div>
              <p className="text-xs text-muted-foreground">
                {resumoFinanceiro.ingressos_pendentes} ingressos pendentes
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por adversário, cliente ou setor..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select
            value={filtros.situacao_financeira || 'todos'}
            onValueChange={(value) => 
              setFiltros(prev => ({ 
                ...prev, 
                situacao_financeira: value === 'todos' ? undefined : value as any
              }))
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pago">✅ Pago</SelectItem>
              <SelectItem value="pendente">⏳ Pendente</SelectItem>
              <SelectItem value="cancelado">❌ Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => setModalFiltrosAberto(true)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>

          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Ingressos Organizados por Mês */}
      <Card>
        <CardHeader>
          <CardTitle>
            Ingressos Cadastrados ({ingressosFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {estados.carregando ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : ingressosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <span className="text-4xl mb-4 block">🎫</span>
              <p>Nenhum ingresso encontrado</p>
              <p className="text-sm">Cadastre o primeiro ingresso clicando em "Novo Ingresso"</p>
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
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-medium">
                            +{formatCurrency(grupo.resumo.lucroTotal)}
                          </span>
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
                            <TableHead>Data</TableHead>
                            <TableHead>Adversário</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Local</TableHead>
                            <TableHead>Setor</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Lucro</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {grupo.ingressos.map((ingresso) => (
                            <TableRow key={ingresso.id}>
                              <TableCell>
                                {format(new Date(ingresso.jogo_data), 'dd/MM/yyyy', { locale: ptBR })}
                              </TableCell>
                              <TableCell className="font-medium">
                                {ingresso.adversario}
                              </TableCell>
                              <TableCell>
                                {ingresso.cliente?.nome || 'Cliente não encontrado'}
                              </TableCell>
                              <TableCell>
                                <Badge variant={ingresso.local_jogo === 'casa' ? 'default' : 'secondary'}>
                                  {ingresso.local_jogo === 'casa' ? '🏠 Casa' : '✈️ Fora'}
                                </Badge>
                              </TableCell>
                              <TableCell>{ingresso.setor_estadio}</TableCell>
                              <TableCell>{formatCurrency(ingresso.valor_final)}</TableCell>
                              <TableCell>
                                <span className={ingresso.lucro >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {formatCurrency(ingresso.lucro)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(ingresso.situacao_financeira)}>
                                  {getStatusText(ingresso.situacao_financeira)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleVerDetalhes(ingresso)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditar(ingresso)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeletar(ingresso)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
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

      {/* Modais */}
      <IngressoFormModal
        open={modalFormAberto}
        onOpenChange={setModalFormAberto}
        ingresso={ingressoSelecionado}
        onSuccess={() => {
          setModalFormAberto(false);
          setIngressoSelecionado(null);
        }}
      />

      <IngressoDetailsModal
        open={modalDetalhesAberto}
        onOpenChange={setModalDetalhesAberto}
        ingresso={ingressoSelecionado}
      />

      <FiltrosIngressosModal
        open={modalFiltrosAberto}
        onOpenChange={setModalFiltrosAberto}
        filtros={filtros}
        onFiltrosChange={setFiltros}
      />
    </div>
  );
}