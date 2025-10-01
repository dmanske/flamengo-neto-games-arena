import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface Passageiro {
  id: string;
  nome?: string;
  telefone?: string;
  clientes?: {
    nome?: string;
    telefone?: string;
  };
}

interface WhatsAppMassaButtonProps {
  passageiros: Passageiro[];
  onOpenModal: () => void;
  className?: string;
}

export const WhatsAppMassaButton: React.FC<WhatsAppMassaButtonProps> = ({
  passageiros,
  onOpenModal,
  className = ''
}) => {
  // Contar passageiros com telefone válido
  const passageirosComTelefone = passageiros.filter(passageiro => {
    const telefone = passageiro.telefone || passageiro.clientes?.telefone;
    if (!telefone || telefone.trim() === '') return false;
    
    // Validar se telefone tem pelo menos 10 dígitos
    const telefoneNumeros = telefone.replace(/\D/g, '');
    return telefoneNumeros.length >= 10;
  });

  const isDisabled = passageirosComTelefone.length === 0;
  const tooltipText = isDisabled 
    ? 'Nenhum passageiro com telefone cadastrado' 
    : `Enviar WhatsApp para ${passageirosComTelefone.length} passageiro${passageirosComTelefone.length > 1 ? 's' : ''}`;

  return (
    <Button
      onClick={onOpenModal}
      disabled={isDisabled}
      className={`bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
      title={tooltipText}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      WhatsApp em Massa
      {passageirosComTelefone.length > 0 && (
        <span className="ml-1 bg-green-800 text-white px-2 py-0.5 rounded-full text-xs">
          {passageirosComTelefone.length}
        </span>
      )}
    </Button>
  );
};