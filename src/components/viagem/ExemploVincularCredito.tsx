import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { VincularCreditoModal } from '@/components/creditos/VincularCreditoModal';
import { useViagemDetails } from '@/hooks/useViagemDetails';

interface ExemploVincularCreditoProps {
  viagemId: string;
}

export function ExemploVincularCredito({ viagemId }: ExemploVincularCreditoProps) {
  const [modalVincularAberto, setModalVincularAberto] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<any>(null);
  
  // Hook para recarregar dados da viagem
  const { fetchPassageiros } = useViagemDetails(viagemId);

  const handleVincularCredito = (cliente: any) => {
    setClienteSelecionado(cliente);
    setModalVincularAberto(true);
  };

  return (
    <>
      {/* Botão para abrir modal */}
      <Button 
        onClick={() => handleVincularCredito(null)}
        className="flex items-center gap-2"
      >
        <CreditCard className="h-4 w-4" />
        Vincular Crédito
      </Button>

      {/* Modal de vinculação com callback */}
      <VincularCreditoModal
        open={modalVincularAberto}
        onOpenChange={setModalVincularAberto}
        grupoCliente={clienteSelecionado}
        onSuccess={() => {
          // Fechar modal
          setModalVincularAberto(false);
          setClienteSelecionado(null);
        }}
        onViagemUpdated={() => {
          // 🎯 AQUI É A MÁGICA! 
          // Recarrega os passageiros da viagem automaticamente
          fetchPassageiros(viagemId);
        }}
      />
    </>
  );
}