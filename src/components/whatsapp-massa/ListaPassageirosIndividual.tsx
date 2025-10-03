import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { enviarMensagemMassa } from '@/services/whatsappService';

interface Passageiro {
  id: string;
  nome?: string;
  telefone?: string;
  clientes?: {
    nome?: string;
    telefone?: string;
  };
}

interface ListaPassageirosIndividualProps {
  passageiros: Passageiro[];
  mensagem: string;
  dadosViagem?: {
    adversario?: string;
    dataJogo?: string;
    dataViagem?: string;
    horario?: string;
    localSaida?: string;
    valor?: string;
    onibus?: string;
    prazo?: string;
  };
}

interface StatusEnvio {
  [passageiroId: string]: 'enviando' | 'enviado' | 'erro' | null;
}

export const ListaPassageirosIndividual: React.FC<ListaPassageirosIndividualProps> = ({
  passageiros,
  mensagem,
  dadosViagem
}) => {
  const [statusEnvios, setStatusEnvios] = useState<StatusEnvio>({});

  // Filtrar passageiros com telefone válido
  const passageirosComTelefone = passageiros.filter(passageiro => {
    const telefone = passageiro.telefone || passageiro.clientes?.telefone;
    if (!telefone || telefone.trim() === '') return false;
    
    const telefoneNumeros = telefone.replace(/\D/g, '');
    return telefoneNumeros.length >= 10;
  });

  const enviarParaPassageiro = async (passageiro: Passageiro) => {
    if (!mensagem.trim()) {
      toast.error('Digite uma mensagem antes de enviar');
      return;
    }

    const nome = passageiro.nome || passageiro.clientes?.nome || 'Passageiro';
    
    // Atualizar status para "enviando"
    setStatusEnvios(prev => ({
      ...prev,
      [passageiro.id]: 'enviando'
    }));

    try {
      // Enviar para apenas este passageiro
      const response = await enviarMensagemMassa(
        [passageiro], 
        mensagem, 
        'z-api', // Usar Z-API para envio real
        dadosViagem
      );

      if (response.resumo.sucessos > 0) {
        setStatusEnvios(prev => ({
          ...prev,
          [passageiro.id]: 'enviado'
        }));
        toast.success(`✅ Mensagem enviada para ${nome}!`);
      } else {
        setStatusEnvios(prev => ({
          ...prev,
          [passageiro.id]: 'erro'
        }));
        toast.error(`❌ Erro ao enviar para ${nome}`);
      }
    } catch (error) {
      setStatusEnvios(prev => ({
        ...prev,
        [passageiro.id]: 'erro'
      }));
      toast.error(`❌ Erro ao enviar para ${nome}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const getStatusIcon = (passageiroId: string) => {
    const status = statusEnvios[passageiroId];
    
    switch (status) {
      case 'enviando':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'enviado':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'erro':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Send className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (passageiroId: string) => {
    const status = statusEnvios[passageiroId];
    
    switch (status) {
      case 'enviando':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Enviando...</Badge>;
      case 'enviado':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">✅ Enviado</Badge>;
      case 'erro':
        return <Badge variant="secondary" className="bg-red-100 text-red-700">❌ Erro</Badge>;
      default:
        return null;
    }
  };

  if (passageirosComTelefone.length === 0) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertDescription className="text-sm text-yellow-800">
          Nenhum passageiro com telefone válido encontrado.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h5 className="font-medium text-gray-800">📱 Envio Individual via Z-API</h5>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {passageirosComTelefone.length} passageiros
          </Badge>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {passageirosComTelefone.map((passageiro) => {
            const nome = passageiro.nome || passageiro.clientes?.nome || 'Sem nome';
            const telefone = passageiro.telefone || passageiro.clientes?.telefone || '';
            const status = statusEnvios[passageiro.id];
            const isEnviando = status === 'enviando';
            const jaEnviado = status === 'enviado';

            return (
              <div 
                key={passageiro.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(passageiro.id)}
                  <div>
                    <div className="font-medium text-sm text-gray-800">{nome}</div>
                    <div className="text-xs text-gray-500">{telefone}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(passageiro.id)}
                  
                  <Button
                    size="sm"
                    onClick={() => enviarParaPassageiro(passageiro)}
                    disabled={isEnviando || !mensagem.trim()}
                    className={`text-xs px-3 py-1 ${
                      jaEnviado 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isEnviando ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Enviando...
                      </>
                    ) : jaEnviado ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Reenviar
                      </>
                    ) : (
                      <>
                        <Send className="h-3 w-3 mr-1" />
                        Enviar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-sm text-blue-800">
            <strong>💡 Envio Individual:</strong> Clique "Enviar" ao lado de cada passageiro para enviar a mensagem apenas para ele via Z-API.
            Custo: ~R$ 0,05 por mensagem.
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
};