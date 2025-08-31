import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Mail,
  UserPlus
} from 'lucide-react';
import InscricaoViagemModal from './InscricaoViagemModal';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';

interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  email: string;
}

interface AcoesRapidasProps {
  cliente: Cliente;
}

const AcoesRapidas: React.FC<AcoesRapidasProps> = ({ cliente }) => {
  const [inscricaoModalOpen, setInscricaoModalOpen] = useState(false);

  const abrirWhatsApp = () => {
    const telefone = cliente.telefone.replace(/\D/g, '');
    const mensagem = `Olá ${cliente.nome.split(' ')[0]}! Como posso ajudá-lo?`;
    const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const abrirEmail = () => {
    const assunto = `Contato - ${cliente.nome}`;
    const url = `mailto:${cliente.email}?subject=${encodeURIComponent(assunto)}`;
    window.location.href = url;
  };




  const inscreverViagem = () => {
    setInscricaoModalOpen(true);
  };

  const handleInscricaoSuccess = () => {
    // Aqui você pode adicionar lógica para atualizar a lista de viagens do cliente
    // Por exemplo, recarregar os dados ou mostrar uma notificação
    console.log('Inscrição realizada com sucesso!');
  };

  return (
    <div className="space-y-4">
      {/* Comunicação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comunicação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Chat Integrado - Funcionalidade Futura */}
          <div className="space-y-2">
            <WhatsAppButton 
              telefone={cliente.telefone}
              nome={cliente.nome}
              clienteId={cliente.id.toString()}
              size="md"
              variant="default"
              fullWidth={true}
            />
            <p className="text-xs text-gray-500 text-center">
              💡 Chat integrado - Para implementar no futuro
            </p>
          </div>

          {/* WhatsApp Web - Funcional */}
          <Button
            onClick={abrirWhatsApp}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={!cliente.telefone}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            WhatsApp Web
          </Button>

          <Button
            onClick={abrirEmail}
            variant="outline"
            className="w-full"
            disabled={!cliente.email}
          >
            <Mail className="h-4 w-4 mr-2" />
            Enviar E-mail
          </Button>
        </CardContent>
      </Card>



      {/* Viagens */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Viagens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={inscreverViagem}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Inscrever em Viagem
          </Button>
        </CardContent>
      </Card>





      {/* Modal de Inscrição em Viagem */}
      <InscricaoViagemModal
        isOpen={inscricaoModalOpen}
        onClose={() => setInscricaoModalOpen(false)}
        cliente={cliente}
        onSuccess={handleInscricaoSuccess}
      />
    </div>
  );
};

export default AcoesRapidas;