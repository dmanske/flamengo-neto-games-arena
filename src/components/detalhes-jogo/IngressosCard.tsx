import React, { useMemo, useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Eye, Edit, Trash2, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { Ingresso, FiltrosIngressos, SituacaoFinanceiraIngresso } from '@/types/ingressos';
import { formatCurrency, formatCPF, formatPhone, formatBirthDate } from '@/utils/formatters';
import { toast } from 'sonner';
import { useCadastroFacial } from '@/hooks/useCadastroFacial';
import { StatusCadastroFacial } from '@/components/ui/StatusCadastroFacial';

interface IngressosCardProps {
  ingressos: Ingresso[];
  busca: string;
  filtros: FiltrosIngressos;
  onBuscaChange: (busca: string) => void;
  onFiltrosChange: (filtros: FiltrosIngressos) => void;
  onVerDetalhes: (ingresso: Ingresso) => void;
  onEditar: (ingresso: Ingresso) => void;
  onDeletar: (ingresso: Ingresso) => void;
  onNovoIngresso: () => void;
}

export function IngressosCard({
  ingressos,
  busca,
  filtros,
  onBuscaChange,
  onFiltrosChange,
  onVerDetalhes,
  onEditar,
  onDeletar,
  onNovoIngresso
}: IngressosCardProps) {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 10;

  // Hook para cadastro facial
  const clienteIds = ingressos.map(i => i.cliente?.id).filter(Boolean) as string[];
  const { 
    cadastroFacialData, 
    loading: loadingCadastroFacial, 
    toggleCadastroFacial 
  } = useCadastroFacial(clienteIds);

  // Filtrar ingressos baseado na busca e filtros
  const ingressosFiltrados = useMemo(() => {
    let resultado = [...ingressos];

    // Aplicar busca
    if (busca.trim()) {
      const termoBusca = busca.toLowerCase().trim();
      resultado = resultado.filter(ingresso => 
        ingresso.cliente?.nome.toLowerCase().includes(termoBusca) ||
        ingresso.cliente?.cpf?.includes(termoBusca) ||
        ingresso.cliente?.telefone?.includes(termoBusca) ||
        ingresso.setor_estadio.toLowerCase().includes(termoBusca)
      );
    }

    // Aplicar filtros
    if (filtros.situacao_financeira) {
      resultado = resultado.filter(ing => ing.situacao_financeira === filtros.situacao_financeira);
    }

    // Ordenar alfabeticamente por nome do cliente
    return resultado.sort((a, b) => {
      const nomeA = a.cliente?.nome || '';
      const nomeB = b.cliente?.nome || '';
      return nomeA.localeCompare(nomeB, 'pt-BR');
    });
  }, [ingressos, busca, filtros]);

  // Paginação
  const ingressosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    return ingressosFiltrados.slice(inicio, fim);
  }, [ingressosFiltrados, paginaAtual]);

  const totalPaginas = Math.ceil(ingressosFiltrados.length / ITENS_POR_PAGINA);

  // Reset página quando filtros mudarem
  React.useEffect(() => {
    setPaginaAtual(1);
  }, [busca, filtros]);

  // Função para copiar campo específico do cliente
  const copiarCampo = (valor: string, nomeCampo: string) => {
    if (!valor) {
      toast.error(`${nomeCampo} não disponível`);
      return;
    }

    navigator.clipboard.writeText(valor).then(() => {
      toast.success(`${nomeCampo} copiado!`);
    }).catch(() => {
      toast.error(`Erro ao copiar ${nomeCampo.toLowerCase()}`);
    });
  };

  // Função para obter cor do badge de status
  const getStatusBadgeVariant = (status: SituacaoFinanceiraIngresso) => {
    switch (status) {
      case 'pago':
        return 'default';
      case 'pendente':
        return 'secondary';
      case 'cancelado':
        return 'destructive';
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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            🎫 Ingressos do Jogo
            <span className="text-sm font-normal text-muted-foreground">
              ({ingressosFiltrados.length} de {ingressos.length})
            </span>
          </CardTitle>
          <Button onClick={onNovoIngresso} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Ingresso
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Barra de busca e filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por cliente, CPF, telefone ou setor..."
                value={busca}
                onChange={(e) => onBuscaChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select
              value={filtros.situacao_financeira || 'todos'}
              onValueChange={(value) => 
                onFiltrosChange({ 
                  ...filtros, 
                  situacao_financeira: value === 'todos' ? undefined : value as any
                })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabela de ingressos */}
        {ingressosFiltrados.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Data Nascimento</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Lucro</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingressosPaginados.map((ingresso) => (
                    <TableRow key={ingresso.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{ingresso.cliente?.nome || 'Cliente não encontrado'}</span>
                          {ingresso.cliente?.nome && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copiarCampo(ingresso.cliente!.nome, 'Nome')}
                              className="h-6 w-6 p-0 hover:bg-blue-100"
                              title="Copiar nome"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono">
                              {ingresso.cliente?.cpf ? formatCPF(ingresso.cliente.cpf) : '-'}
                            </span>
                            {ingresso.cliente?.cpf && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copiarCampo(ingresso.cliente!.cpf!, 'CPF')}
                                className="h-6 w-6 p-0 hover:bg-blue-100"
                                title="Copiar CPF"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          {ingresso.cliente?.id && (
                            <StatusCadastroFacial 
                              clienteId={ingresso.cliente.id}
                              cadastroFacialData={cadastroFacialData}
                              loading={loadingCadastroFacial}
                              onClick={toggleCadastroFacial}
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {formatBirthDate(ingresso.cliente?.data_nascimento)}
                          </span>
                          {ingresso.cliente?.data_nascimento && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copiarCampo(
                                formatBirthDate(ingresso.cliente!.data_nascimento!), 
                                'Data de nascimento'
                              )}
                              className="h-6 w-6 p-0 hover:bg-blue-100"
                              title="Copiar data de nascimento"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {ingresso.cliente?.telefone && (
                            <div className="flex items-center gap-2">
                              <span>📱 {formatPhone(ingresso.cliente.telefone)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copiarCampo(ingresso.cliente!.telefone!, 'Telefone')}
                                className="h-6 w-6 p-0 hover:bg-blue-100"
                                title="Copiar telefone"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          {ingresso.cliente?.email && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 text-xs">✉️ {ingresso.cliente.email}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copiarCampo(ingresso.cliente!.email!, 'Email')}
                                className="h-6 w-6 p-0 hover:bg-blue-100"
                                title="Copiar email"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{ingresso.setor_estadio}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(ingresso.valor_final)}
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${ingresso.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
                            onClick={() => onVerDetalhes(ingresso)}
                            className="h-8 w-8 p-0"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditar(ingresso)}
                            className="h-8 w-8 p-0"
                            title="Editar ingresso"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeletar(ingresso)}
                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                            title="Deletar ingresso"
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

            {/* Controles de Paginação */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  Mostrando {((paginaAtual - 1) * ITENS_POR_PAGINA) + 1} a {Math.min(paginaAtual * ITENS_POR_PAGINA, ingressosFiltrados.length)} de {ingressosFiltrados.length} ingressos
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
                    disabled={paginaAtual === 1}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => {
                      let pagina;
                      if (totalPaginas <= 5) {
                        pagina = i + 1;
                      } else if (paginaAtual <= 3) {
                        pagina = i + 1;
                      } else if (paginaAtual >= totalPaginas - 2) {
                        pagina = totalPaginas - 4 + i;
                      } else {
                        pagina = paginaAtual - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pagina}
                          variant={pagina === paginaAtual ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPaginaAtual(pagina)}
                          className="w-8 h-8 p-0"
                        >
                          {pagina}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaAtual(prev => Math.min(totalPaginas, prev + 1))}
                    disabled={paginaAtual === totalPaginas}
                    className="gap-1"
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-lg font-medium mb-2">
              {ingressos.length === 0 ? 'Nenhum ingresso cadastrado' : 'Nenhum resultado encontrado'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {ingressos.length === 0 
                ? 'Comece cadastrando o primeiro ingresso para este jogo.'
                : 'Tente ajustar os filtros ou termo de busca.'
              }
            </p>
            {ingressos.length === 0 && (
              <Button onClick={onNovoIngresso} className="gap-2">
                <Plus className="h-4 w-4" />
                Cadastrar Primeiro Ingresso
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}