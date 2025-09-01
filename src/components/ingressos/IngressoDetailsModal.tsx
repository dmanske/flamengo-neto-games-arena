import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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

import { usePagamentosIngressos } from '@/hooks/usePagamentosIngressos';
import { useIngressos } from '@/hooks/useIngressos';
import { Ingresso } from '@/types/ingressos';

// Componentes
import { IngressoCard } from './IngressoCard';
import { PagamentoIngressoModal } from './PagamentoIngressoModal';

interface IngressoDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingresso: Ingresso | null;
}

export function IngressoDetailsModal({ 
  open, 
  onOpenChange, 
  ingresso 
}: IngressoDetailsModalProps) {
  const { 
    pagamentos, 
    estados, 
    buscarPagamentos, 
    deletarPagamento,
    calcularResumo 
  } = usePagamentosIngressos();
  
  // Adicionar hook para buscar ingressos atualizados
  const { buscarIngressos, ingressos } = useIngressos();

  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);
  const [pagamentoEditando, setPagamentoEditando] = useState<any>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [pagamentoParaDeletar, setPagamentoParaDeletar] = useState<any>(null);

  // Buscar o ingresso atualizado da lista de ingressos
  const ingressoAtualizado = ingresso ? ingressos.find(i => i.id === ingresso.id) || ingresso : null;

  // Carregar dados atualizados quando modal abrir
  useEffect(() => {
    if (open) {
      // Primeiro buscar ingressos atualizados
      buscarIngressos();
    }
  }, [open, buscarIngressos]);

  // Carregar pagamentos quando ingresso mudar
  useEffect(() => {
    if (open && ingressoAtualizado) {
      buscarPagamentos(ingressoAtualizado.id);
    }
  }, [open, ingressoAtualizado, buscarPagamentos]);
  
  // Renderizar apenas quando tiver ingresso
  if (!ingressoAtualizado) {
    return null;
  }
  
  const resumoPagamentos = calcularResumo(ingressoAtualizado.valor_final);

  // Função para deletar pagamento com confirmação
  const handleDeletarPagamento = async (pagamentoId: string) => {
    // Encontrar o pagamento que será deletado
    const pagamento = pagamentos.find(p => p.id === pagamentoId);
    if (!pagamento) return;
    
    // Abrir o AlertDialog para confirmação
    setPagamentoParaDeletar(pagamento);
    setAlertOpen(true);
  };
  
  // Função para confirmar a exclusão
  const confirmarExclusao = async () => {
    if (pagamentoParaDeletar && ingressoAtualizado) {
      const sucesso = await deletarPagamento(pagamentoParaDeletar.id, ingressoAtualizado.id);
      if (sucesso) {
        // Atualizar lista de ingressos para refletir mudanças no status
        await buscarIngressos();
      }
      setPagamentoParaDeletar(null);
      setAlertOpen(false);
    }
  };

  // Função para editar pagamento
  const handleEditarPagamento = (pagamento: any) => {
    setPagamentoEditando(pagamento);
    setModalPagamentoAberto(true);
  };

  // Função para novo pagamento
  const handleNovoPagamento = () => {
    setPagamentoEditando(null);
    setModalPagamentoAberto(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center justify-between">
              <span className="text-xl font-bold">Detalhes do Ingresso</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <IngressoCard
            ingresso={ingressoAtualizado}
            pagamentos={pagamentos}
            resumoPagamentos={resumoPagamentos}
            onEditarPagamento={handleEditarPagamento}
            onDeletarPagamento={handleDeletarPagamento}
            onNovoPagamento={handleNovoPagamento}
            isLoading={estados.carregando}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Pagamento */}
      <PagamentoIngressoModal
        open={modalPagamentoAberto}
        onOpenChange={setModalPagamentoAberto}
        ingresso={ingressoAtualizado}
        pagamento={pagamentoEditando}
        onSuccess={() => {
          setModalPagamentoAberto(false);
          setPagamentoEditando(null);
          // Atualizar pagamentos e lista de ingressos para refletir mudanças
          buscarPagamentos(ingressoAtualizado.id);
          buscarIngressos(); // Atualiza a lista de ingressos para refletir o novo status
        }}
      />
      
      {/* AlertDialog para confirmação de exclusão */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {pagamentoParaDeletar && (
                <>
                  <p>Tem certeza que deseja deletar este pagamento?</p>
                  <p className="mt-2">
                    <strong>Valor:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pagamentoParaDeletar.valor_pago)}<br />
                    <strong>Data:</strong> {new Date(pagamentoParaDeletar.data_pagamento).toLocaleDateString('pt-BR')}<br />
                    <strong>Forma:</strong> {pagamentoParaDeletar.forma_pagamento || 'Não informada'}
                  </p>
                  <p className="mt-2 text-red-500">Esta ação não pode ser desfeita!</p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}