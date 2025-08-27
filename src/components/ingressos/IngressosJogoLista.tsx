import React, { useState } from 'react';
import { Eye, Edit, Trash2, Copy, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface IngressosJogoListaProps {
  jogo: JogoIngresso;
  ingressos: Ingresso[];
  onVerDetalhes: (ingresso: Ingresso) => void;
  onEditar: (ingresso: Ingresso) => void;
  onDeletar: (ingresso: Ingresso) => void;
}

export function IngressosJogoLista({
  jogo,
  ingressos,
  onVerDetalhes,
  onEditar,
  onDeletar
}: IngressosJogoListaProps) {
  const [ingressoParaDeletar, setIngressoParaDeletar] = useState<Ingresso | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

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
      <Card className="mt-4 border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-3">
              <span>📋 Lista de Ingressos</span>
              <Badge variant="outline" className="bg-white">
                {ingressos.length} ingresso{ingressos.length !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
            
            {/* Resumo rápido */}
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-green-600">{formatCurrency(jogo.receita_total)}</div>
                <div className="text-xs text-gray-500">Receita</div>
              </div>
              <div className="text-center">
                <div className={`font-bold ${jogo.lucro_total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(jogo.lucro_total)}
                </div>
                <div className="text-xs text-gray-500">Lucro</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-600">{jogo.ingressos_pendentes}</div>
                <div className="text-xs text-gray-500">Pendentes</div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {ingressos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <span className="text-4xl mb-4 block">🎫</span>
              <p>Nenhum ingresso vendido para este jogo</p>
            </div>
          ) : (
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
                  {ingressos.map((ingresso) => (
                    <TableRow key={ingresso.id} className="hover:bg-white/50">
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
            </div>
          )}
        </CardContent>
      </Card>

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