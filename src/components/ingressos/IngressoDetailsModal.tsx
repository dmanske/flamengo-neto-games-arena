import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { usePagamentosIngressos } from '@/hooks/usePagamentosIngressos';
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

  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);
  const [pagamentoEditando, setPagamentoEditando] = useState<any>(null);

  // Carregar pagamentos quando ingresso mudar
  useEffect(() => {
    if (ingresso && open) {
      buscarPagamentos(ingresso.id);
    }
  }, [ingresso?.id, open, buscarPagamentos]);

  if (!ingresso) return null;

  const resumoPagamentos = calcularResumo(ingresso.valor_final);

  // Função para deletar pagamento com confirmação
  const handleDeletarPagamento = async (pagamentoId: string) => {
    if (window.confirm('Tem certeza que deseja deletar este pagamento?')) {
      await deletarPagamento(pagamentoId, ingresso.id);
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
            ingresso={ingresso}
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
        ingresso={ingresso}
        pagamento={pagamentoEditando}
        onSuccess={() => {
          setModalPagamentoAberto(false);
          setPagamentoEditando(null);
          buscarPagamentos(ingresso.id);
        }}
      />
    </>
  );
}