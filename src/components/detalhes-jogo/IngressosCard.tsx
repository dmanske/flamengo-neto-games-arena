import React, { useMemo } from 'react';
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
import { Search, Plus, Eye, Edit, Trash2, Copy } from 'lucide-react';
import { Ingresso, FiltrosIngressos, SituacaoFinanceiraIngresso } from '@/types/ingressos';
import { formatCurrency, formatCPF, formatPhone, formatBirthDate } from '@/utils/formatters';
import { toast } from 'sonner';
import { useCadastroFacial } from '@/hooks/useCadastroFacial';
import { StatusCadastroFacial } from '@/components/ui/StatusCadastroFacial';
import { useGruposIngressos } from '@/hooks/useGruposIngressos';
import { GrupoIngressosCard } from './GrupoIngressos';

interface IngressosCardProps {
  ingressos: Ingresso[];
  busca: string;
  filtros: FiltrosIngressos;
  viagemIngressosId?: string;
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
  viagemIngressosId,
  onBuscaChange,
  onFiltrosChange,
  onVerDetalhes,
  onEditar,
  onDeletar,
  onNovoIngresso
}: IngressosCardProps) {
  // Hook para agrupamento de ingressos
  const { agruparIngressos } = useGruposIngressos(viagemIngressosId);

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

    return resultado;
  }, [ingressos, busca, filtros]);

  // Agrupar ingressos filtrados
  const { grupos, semGrupo } = useMemo(() => {
    return agruparIngressos(ingressosFiltrados);
  }, [ingressosFiltrados, agruparIngressos]);

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

        {/* Lista de ingressos com agrupamento */}
        {ingressosFiltrados.length > 0 ? (
          <div className="space-y-6">
            {/* Renderizar Grupos */}
            {grupos.map((grupo) => (
              <GrupoIngressosCard
                key={`${grupo.nome}-${grupo.cor}`}
                grupo={grupo}
                onVerDetalhes={onVerDetalhes}
                onEditar={onEditar}
                onDeletar={onDeletar}
              />
            ))}

            {/* Renderizar Ingressos Individuais (sem grupo) */}
            {semGrupo.length > 0 && (
              <div className="rounded-lg border overflow-hidden">
                {/* Cabeçalho para ingressos sem grupo */}
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    Ingressos Individuais
                    <Badge variant="secondary" className="text-xs">
                      {semGrupo.length} {semGrupo.length === 1 ? 'ingresso' : 'ingressos'}
                    </Badge>
                  </h3>
                </div>

                {/* Tabela para ingressos sem grupo */}
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
                      {semGrupo.map((ingresso) => (
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