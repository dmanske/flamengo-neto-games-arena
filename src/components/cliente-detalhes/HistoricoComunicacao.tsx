import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock,
  Send,
  CheckCircle,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { useClienteComunicacao } from '@/hooks/useClienteComunicacao';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HistoricoComunicacaoProps {
  clienteId: string;
}

const HistoricoComunicacao: React.FC<HistoricoComunicacaoProps> = ({ clienteId }) => {
  const { comunicacao, loading, error } = useClienteComunicacao(clienteId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !comunicacao) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600">Erro ao carregar histórico de comunicação</p>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }
  const getPreferenciaIcon = (preferencia: string) => {
    switch (preferencia) {
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'email':
        return <Mail className="h-4 w-4 text-blue-600" />;
      case 'telefone':
        return <Phone className="h-4 w-4 text-purple-600" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'lido':
        return <Eye className="h-3 w-3 text-blue-600" />;
      case 'respondido':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'erro':
        return <AlertTriangle className="h-3 w-3 text-red-600" />;
      default:
        return <Send className="h-3 w-3 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'lido':
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Lido</Badge>;
      case 'respondido':
        return <Badge className="bg-green-100 text-green-800 text-xs">Respondido</Badge>;
      case 'erro':
        return <Badge className="bg-red-100 text-red-800 text-xs">Erro</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 text-xs">Enviado</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumo de Comunicação */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {comunicacao.resumo.total_whatsapp}
            </div>
            <div className="text-sm text-gray-500">WhatsApp</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              {comunicacao.resumo.total_email}
            </div>
            <div className="text-sm text-gray-500">E-mails</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Phone className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {comunicacao.resumo.total_ligacoes}
            </div>
            <div className="text-sm text-gray-500">Ligações</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">Última Interação</div>
            <div className="text-sm text-gray-500">{comunicacao.resumo.ultima_interacao}</div>
          </CardContent>
        </Card>
      </div>

      {/* Preferência de Contato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getPreferenciaIcon(comunicacao.resumo.preferencia_contato)}
            <span>Preferência de Contato</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium capitalize">
                {comunicacao.resumo.preferencia_contato}
              </p>
              <p className="text-sm text-gray-500">
                Canal preferido baseado no histórico de interações
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Send className="h-4 w-4 mr-2" />
              Nova Mensagem
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline de Comunicação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-600" />
            <span>Timeline de Comunicação</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {comunicacao.timeline.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">Nenhuma comunicação registrada</p>
              <p className="text-sm text-gray-500">
                As interações com este cliente aparecerão aqui quando houver cobranças ou comunicações
              </p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                <Send className="h-4 w-4 mr-2" />
                Primeira Mensagem
              </Button>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {comunicacao.timeline.map((interacao) => (
                <div key={interacao.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0 mt-1">
                    {getPreferenciaIcon(interacao.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium capitalize">{interacao.tipo}</p>
                        {getStatusBadge(interacao.status || 'enviado')}
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(interacao.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-2">{interacao.conteudo}</p>
                    
                    {interacao.viagem_adversario && (
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Viagem: Flamengo x {interacao.viagem_adversario}
                        {interacao.viagem_data && (
                          <span className="ml-2">
                            • {format(new Date(interacao.viagem_data), 'dd/MM/yyyy')}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {interacao.template_usado && (
                      <div className="text-xs text-blue-600 mt-1">
                        Template: {interacao.template_usado}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0">
                    {getStatusIcon(interacao.status || 'enviado')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoricoComunicacao;