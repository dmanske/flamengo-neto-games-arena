import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface Parcela {
  id: number;
  numero_parcela: number;
  total_parcelas: number;
  valor_parcela: number;
  data_vencimento: string;
  dias_atraso: number;
  viagem_adversario: string;
  viagem_data: string;
}

interface LembreteWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: {
    nome: string;
    telefone: string;
  };
  parcela: Parcela;
}

const LembreteWhatsAppModal: React.FC<LembreteWhatsAppModalProps> = ({
  isOpen,
  onClose,
  cliente,
  parcela
}) => {
  const [mensagem, setMensagem] = useState(() => {
    const nomeCliente = cliente.nome.split(' ')[0];
    const valorFormatado = formatCurrency(parcela.valor_parcela);
    const dataVencimento = new Date(parcela.data_vencimento).toLocaleDateString('pt-BR');
    const adversario = parcela.viagem_adversario;
    
    if (parcela.dias_atraso > 0) {
      return `Olá ${nomeCliente}! 👋

Esperamos que esteja tudo bem! 

Notamos que a parcela ${parcela.numero_parcela}/${parcela.total_parcelas} da viagem para o jogo contra o ${adversario} está em atraso há ${parcela.dias_atraso} dias.

💰 Valor: ${valorFormatado}
📅 Vencimento: ${dataVencimento}

Para regularizar sua situação e garantir sua vaga nas próximas viagens, entre em contato conosco o quanto antes.

Estamos aqui para ajudar! 🔴⚫`;
    } else {
      return `Olá ${nomeCliente}! 👋

Esperamos que esteja tudo bem!

Este é um lembrete amigável sobre a parcela ${parcela.numero_parcela}/${parcela.total_parcelas} da viagem para o jogo contra o ${adversario}.

💰 Valor: ${valorFormatado}
📅 Vencimento: ${dataVencimento}

Para manter tudo em dia e garantir sua vaga nas próximas viagens, não esqueça de efetuar o pagamento.

Qualquer dúvida, estamos aqui para ajudar! 🔴⚫`;
    }
  });

  const enviarWhatsApp = () => {
    const telefone = cliente.telefone.replace(/\D/g, '');
    const mensagemEncoded = encodeURIComponent(mensagem);
    const url = `https://wa.me/55${telefone}?text=${mensagemEncoded}`;
    
    window.open(url, '_blank');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Enviar Lembrete via WhatsApp
          </DialogTitle>
          <DialogDescription>
            Enviando lembrete para <strong>{cliente.nome}</strong> sobre a parcela {parcela.numero_parcela}/{parcela.total_parcelas}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações da Parcela */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Detalhes da Parcela</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Jogo:</span>
                <span className="ml-2 font-medium">{parcela.viagem_adversario}</span>
              </div>
              <div>
                <span className="text-gray-600">Valor:</span>
                <span className="ml-2 font-medium">{formatCurrency(parcela.valor_parcela)}</span>
              </div>
              <div>
                <span className="text-gray-600">Vencimento:</span>
                <span className="ml-2 font-medium">
                  {new Date(parcela.data_vencimento).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className={`ml-2 font-medium ${
                  parcela.dias_atraso > 0 ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {parcela.dias_atraso > 0 
                    ? `${parcela.dias_atraso} dias de atraso` 
                    : 'Pendente'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Editor de Mensagem */}
          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea
              id="mensagem"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={12}
              className="resize-none"
              placeholder="Digite sua mensagem..."
            />
            <p className="text-xs text-gray-500">
              Você pode editar a mensagem antes de enviar
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={enviarWhatsApp}
            className="bg-green-600 hover:bg-green-700"
            disabled={!mensagem.trim()}
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LembreteWhatsAppModal;