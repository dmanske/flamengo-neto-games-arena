import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Mail,
  Phone,
  CreditCard,
  FileText,
  UserPlus,
  Edit,
  Settings
} from 'lucide-react';
import InscricaoViagemModal from './InscricaoViagemModal';

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

  const ligar = () => {
    const url = `tel:${cliente.telefone}`;
    window.location.href = url;
  };

  const gerarRelatorio = () => {
    // TODO: Implementar geração de relatório PDF
    alert('Funcionalidade de relatório será implementada em breve!');
  };

  const cobrarPendencias = () => {
    // TODO: Implementar modal de cobrança
    alert('Modal de cobrança será implementado em breve!');
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
          <Button
            onClick={abrirWhatsApp}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={!cliente.telefone}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            WhatsApp
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

          <Button
            onClick={ligar}
            variant="outline"
            className="w-full"
            disabled={!cliente.telefone}
          >
            <Phone className="h-4 w-4 mr-2" />
            Ligar
          </Button>
        </CardContent>
      </Card>

      {/* Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Financeiro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={cobrarPendencias}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Cobrar Pendências
          </Button>

          <Button
            onClick={gerarRelatorio}
            variant="outline"
            className="w-full"
          >
            <FileText className="h-4 w-4 mr-2" />
            Gerar Relatório
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

      {/* Administrativo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Administrativo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            asChild
          >
            <a href={`/dashboard/clientes/${cliente.id}/editar`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Dados
            </a>
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => alert('Configurações avançadas em breve!')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </CardContent>
      </Card>

      {/* Informações Rápidas */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-sm font-medium text-blue-800 mb-1">
              Cliente #{cliente.id}
            </p>
            <p className="text-xs text-blue-600">
              Todas as ações são registradas no histórico
            </p>
          </div>
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