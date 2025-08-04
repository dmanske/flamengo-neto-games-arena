import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatIntegrado } from '@/components/chat/ChatIntegrado';

interface WhatsAppButtonProps {
  telefone: string;
  nome: string;
  clienteId?: string;
  clienteFoto?: string;
  mensagemInicial?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
  usarChatIntegrado?: boolean;
  fullWidth?: boolean;
}

export const WhatsAppButton = ({ 
  telefone, 
  nome,
  clienteId,
  clienteFoto,
  mensagemInicial,
  size = 'sm',
  variant = 'default',
  usarChatIntegrado = true,
  fullWidth = false
}: WhatsAppButtonProps) => {
  
  // Se deve usar chat integrado e tem clienteId
  if (usarChatIntegrado && clienteId) {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        <ChatIntegrado
          clienteId={clienteId}
          clienteNome={nome}
          clienteTelefone={telefone}
          clienteFoto={clienteFoto}
          fullWidth={fullWidth}
        />
      </div>
    );
  }

  // Fallback para WhatsApp Web (versão original)
  const abrirWhatsApp = () => {
    // Remove caracteres especiais do telefone
    const telefoneClean = telefone.replace(/\D/g, '');
    
    // Mensagem padrão personalizada
    const mensagem = mensagemInicial || 
      `Olá ${nome}! 👋\n\nAqui é da equipe do Flamengo Viagens.\n\nComo posso te ajudar?`;
    
    // URL do WhatsApp Web
    const url = `https://web.whatsapp.com/send?phone=55${telefoneClean}&text=${encodeURIComponent(mensagem)}`;
    
    // Abre em nova aba
    window.open(url, '_blank');
  };

  return (
    <Button 
      onClick={abrirWhatsApp}
      className={`${variant === 'default' ? 'bg-green-500 hover:bg-green-600 text-white' : ''} ${fullWidth ? 'w-full' : ''} transition-all duration-200 hover:scale-105`}
      size={size}
      variant={variant === 'outline' ? 'outline' : 'default'}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      Chat
    </Button>
  );
};