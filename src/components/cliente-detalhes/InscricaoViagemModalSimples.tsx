import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Cliente {
  id: number;
  nome: string;
}

interface InscricaoViagemModalSimplesProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente;
  onSuccess: () => void;
}

const InscricaoViagemModalSimples: React.FC<InscricaoViagemModalSimplesProps> = ({
  isOpen,
  onClose,
  cliente,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirmar = async () => {
    setLoading(true);
    
    // Simular operação
    setTimeout(() => {
      toast.success(`${cliente.nome} foi inscrito na viagem com sucesso!`);
      setLoading(false);
      onSuccess();
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Inscrever {cliente.nome} em Viagem</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-600">
            Esta é uma versão simplificada do modal de inscrição em viagem.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Cliente: {cliente.nome} (ID: {cliente.id})
          </p>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar} disabled={loading}>
            {loading ? 'Confirmando...' : 'Confirmar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InscricaoViagemModalSimples;