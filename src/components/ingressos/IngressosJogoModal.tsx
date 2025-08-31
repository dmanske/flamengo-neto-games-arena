import React, { useState, useMemo } from 'react';
import { X, AlertTriangle, Trash2, ChevronLeft, ChevronRight, Copy, Eye, Edit } from 'lucide-react';
import { formatDateTimeSafe } from '@/lib/date-utils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Ingresso, SituacaoFinanceiraIngresso } from '@/types/ingressos';
import { formatCurrency, formatCPF, formatPhone, formatBirthDate } from '@/utils/formatters';

interface JogoIngresso {
  adversario: string;
  jogo_data: string;
  local_jogo: 'casa' | 'fora';
  logo_adversario?: string;
  logo_flamengo?: string;
  total_ingressos: number;
  receita_total: number;
  lucro_total: number;
  ingressos_pendentes: number;
  ingressos_pagos: number;
}

interface IngressosJogoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jogo: JogoIngresso | null;
  ingressos: Ingresso[];
  onVerDetalhes: (ingresso: Ingresso) => void;
  onEditar: (ingresso: Ingresso) => void;
  onDeletar: (ingresso: Ingresso) => void;
}

export function IngressosJogoModal({
  open,
  onOpenChange,
  jogo,
  ingressos,
  onVerDetalhes,
  onEditar,
  onDeletar
}: IngressosJogoModalProps) {
  const [ingressoParaDeletar, setIngressoParaDeletar] = useState<Ingresso | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  
  const ITENS_POR_PAGINA = 10;
  
  // Ordenação alfabética e paginação
  const ingressosPaginados = useMemo(() => {
    // Primeiro ordenar alfabeticamente por nome do cliente
    const ingressosOrdenados = [...ingressos].sort((a, b) => {
      const nomeA = a.cliente?.nome || '';
      const nomeB = b.cliente?.nome || '';
      return nomeA.localeCompare(nomeB, 'pt-BR');
    });
    
    // Depois aplicar paginação
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    return ingressosOrdenados.slice(inicio, fim);
  }, [ingressos, paginaAtual]);
  
  const totalPaginas = Math.ceil(ingressos.length / ITENS_POR_PAGINA);
  
  // Reset página quando mudar de jogo
  React.useEffect(() => {
    setPaginaAtual(1);
  }, [jogo?.adversario, jogo?.jogo_data]);

  if (!jogo) return null;

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

  const formatDateTime = formatDateTimeSafe;

  // Função para confirmar exclusão
  const handleConfirmarExclusao = (ingresso: Ingresso) => {
    setIngressoParaDeletar(ingresso);
    setConfirmDeleteOpen(true);
  };

  // Função para executar exclusão
  const handleExecutarExclusao = () => {
    if (ingressoParaDeletar) {
      onDeletar(ingressoParaDeletar);
      setIngressoParaDeletar(null);
      setConfirmDeleteOpen(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Logos dos times */}
                <div className="flex items-center gap-3">
                  {jogo.local_jogo === 'fora' ? (
                    <>
                      <img 
                        src={jogo.logo_adversario || `https://via.placeholder.com/40x40/cccccc/666666?text=${jogo.adversario.substring(0, 3).toUpperCase()}`} 
                        alt={jogo.adversario} 
                        className="h-10 w-10 object-contain rounded-full border border-gray-200" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `https://via.placeholder.com/40x40/cccccc/666666?text=${jogo.adversario.substring(0, 3).toUpperCase()}`;
                        }}
                      />
                      <span className="text-lg font-bold text-gray-600">×</span>
                      <img 
                        src={jogo.logo_flamengo || "https://logodetimes.com/times/flamengo/logo-flamengo-256.png"} 
                        alt="Flamengo" 
                        className="h-10 w-10 object-contain rounded-full border border-gray-200" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "https://logodetimes.com/times/flamengo/logo-flamengo-256.png";
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <img 
                        src={jogo.logo_flamengo || "https://logodetimes.com/times/flamengo/logo-flamengo-256.png"} 
                        alt="Flamengo" 
                        className="h-10 w-10 object-contain rounded-full border border-gray-200" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "https://logodetimes.com/times/flamengo/logo-flamengo-256.png";
                        }}
                      />
                      <span className="text-lg font-bold text-gray-600">×</span>
                      <img 
                        src={jogo.logo_adversario || `https://via.placeholder.com/40x40/cccccc/666666?text=${jogo.adversario.substring(0, 3).toUpperCase()}`} 
                        alt={jogo.adversario} 
                        className="h-10 w-10 object-contain rounded-full border border-gray-200" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `https://via.placeholder.com/40x40/cccccc/666666?text=${jogo.adversario.substring(0, 3).toUpperCase()}`;
                        }}
                      />
                    </>
                  )}
                </div>
                
                <div>
                  <DialogTitle className="text-xl">
                    {jogo.local_jogo === 'fora' ? 
                      `${jogo.adversario} × Flamengo` : 
                      `Flamengo × ${jogo.adversario}`
                    }
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(jogo.jogo_data)} • {jogo.local_jogo === 'casa' ? '🏠 Casa' : '✈️ Fora'}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Resumo rápido */}
            <div className="flex gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{jogo.total_ingressos}</div>
                <div className="text-xs text-gray-500">Ingressos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(jogo.receita_total)}</div>
                <div className="text-xs text-gray-500">Receita</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${jogo.lucro_total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(jogo.lucro_total)}
                </div>
                <div className="text-xs text-gray-500">Lucro</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{jogo.ingressos_pendentes}</div>
                <div className="text-xs text-gray-500">Pendentes</div>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            {ingressos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <span className="text-4xl mb-4 block">🎫</span>
                <p>Nenhum ingresso vendido para este jogo</p>
              </div>
            ) : (
              <div className="space-y-4">
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
                              onClick={() => onVerDetalhes(ingresso)}
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditar(ingresso)}
                              title="Editar ingresso"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleConfirmarExclusao(ingresso)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                
                {/* Controles de Paginação */}
                {totalPaginas > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">
                      Mostrando {((paginaAtual - 1) * ITENS_POR_PAGINA) + 1} a {Math.min(paginaAtual * ITENS_POR_PAGINA, ingressos.length)} de {ingressos.length} ingressos
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
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                  Confirmar Exclusão
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-gray-600 mt-1">
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          
          {ingressoParaDeletar && (
            <div className="py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Cliente:</span>
                  <span className="text-sm text-gray-900">{ingressoParaDeletar.cliente?.nome || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Jogo:</span>
                  <span className="text-sm text-gray-900">
                    {jogo.local_jogo === 'fora' ? 
                      `${jogo.adversario} × Flamengo` : 
                      `Flamengo × ${jogo.adversario}`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Setor:</span>
                  <span className="text-sm text-gray-900">{ingressoParaDeletar.setor_estadio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Valor:</span>
                  <span className="text-sm font-semibold text-green-600">
                    {formatCurrency(ingressoParaDeletar.valor_final)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <Badge variant={getStatusBadgeVariant(ingressoParaDeletar.situacao_financeira)} className="text-xs">
                    {getStatusText(ingressoParaDeletar.situacao_financeira)}
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mt-4">
                Tem certeza que deseja deletar este ingresso? Todos os dados e histórico de pagamentos serão perdidos permanentemente.
              </p>
            </div>
          )}

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel 
              onClick={() => {
                setIngressoParaDeletar(null);
                setConfirmDeleteOpen(false);
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExecutarExclusao}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Deletar Ingresso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}