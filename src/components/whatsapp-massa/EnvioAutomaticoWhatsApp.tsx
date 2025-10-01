import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, XCircle, Zap, Settings } from 'lucide-react';
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

interface EnvioAutomaticoWhatsAppProps {
  passageiros: Passageiro[];
  mensagem: string;
  onRegistrarHistorico: (tipo: string, quantidade: number) => void;
}

interface ResultadoEnvio {
  passageiro: string;
  telefone: string;
  status: 'enviado' | 'erro' | 'pendente';
  erro?: string;
  messageId?: string;
}

export const EnvioAutomaticoWhatsApp: React.FC<EnvioAutomaticoWhatsAppProps> = ({
  passageiros,
  mensagem,
  onRegistrarHistorico
}) => {
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [resultados, setResultados] = useState<ResultadoEnvio[]>([]);
  const [apiSelecionada, setApiSelecionada] = useState<'whatsapp-business' | 'z-api' | 'simulacao'>('simulacao');

  // Função para atualizar progresso durante o envio
  const atualizarProgresso = (index: number, total: number, resultado: ResultadoEnvio) => {
    const novoProgresso = ((index + 1) / total) * 100;
    setProgresso(novoProgresso);
    
    // Atualizar resultados em tempo real
    setResultados(prev => [...prev, resultado]);
  };

  const handleEnviarAutomatico = async () => {
    if (!mensagem.trim()) {
      toast.error('Digite uma mensagem antes de enviar');
      return;
    }

    setEnviando(true);
    setProgresso(0);
    setResultados([]);

    try {
      let tipoEnvio: 'simulacao' | 'z-api';
      
      if (apiSelecionada === 'simulacao') {
        tipoEnvio = 'simulacao';
      } else if (apiSelecionada === 'z-api') {
        tipoEnvio = 'z-api';
      } else {
        toast.error('WhatsApp Business API ainda não implementada. Use Z-API ou Simulação.');
        return;
      }

      // Usar o novo serviço
      const response = await enviarMensagemMassa(passageiros, mensagem, tipoEnvio);

      // Simular progresso em tempo real para melhor UX
      for (let i = 0; i < response.resultados.length; i++) {
        const resultado = response.resultados[i];
        atualizarProgresso(i, response.resultados.length, resultado);
        
        // Delay para mostrar progresso
        if (i < response.resultados.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      toast.success(`✅ Envio concluído! ${response.resumo.sucessos} enviados, ${response.resumo.erros} erros`);
      onRegistrarHistorico('envio_automatico', response.resumo.sucessos);

    } catch (error) {
      console.error('Erro no envio automático:', error);
      toast.error('Erro no envio automático: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setEnviando(false);
    }
  };

  const sucessos = resultados.filter(r => r.status === 'enviado').length;
  const erros = resultados.filter(r => r.status === 'erro').length;

  return (
    <div className="space-y-4">
      {/* Seleção de API */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h5 className="font-medium text-blue-800 mb-3">🤖 Envio Automático via API</h5>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
          <Button
            variant={apiSelecionada === 'simulacao' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setApiSelecionada('simulacao')}
            className="text-xs"
          >
            🎭 Simulação (Teste)
          </Button>
          
          <Button
            variant={apiSelecionada === 'z-api' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setApiSelecionada('z-api')}
            className="text-xs"
          >
            💰 Z-API (R$ 0,05/msg)
          </Button>
          
          <Button
            variant={apiSelecionada === 'whatsapp-business' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setApiSelecionada('whatsapp-business')}
            className="text-xs"
          >
            🏢 WhatsApp Business
          </Button>
        </div>

        {/* Informações da API selecionada */}
        {apiSelecionada === 'simulacao' && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm text-yellow-800">
              <strong>Modo Simulação:</strong> Apenas para teste. Nenhuma mensagem real será enviada.
            </AlertDescription>
          </Alert>
        )}

        {apiSelecionada === 'z-api' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm text-green-800">
              <strong>Z-API:</strong> API brasileira. Custo: ~R$ 0,05 por mensagem. Total estimado: R$ {(passageiros.length * 0.05).toFixed(2)}
            </AlertDescription>
          </Alert>
        )}

        {apiSelecionada === 'whatsapp-business' && (
          <Alert className="border-blue-200 bg-blue-50">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800">
              <strong>WhatsApp Business API:</strong> API oficial do Meta. Custo: ~R$ 0,10-0,50 por mensagem.
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Botão de Envio */}
      <Button 
        onClick={handleEnviarAutomatico}
        disabled={enviando || !mensagem.trim()}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
        size="lg"
      >
        {enviando ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Enviando... {Math.round(progresso)}%
          </>
        ) : (
          <>
            <Zap className="h-4 w-4 mr-2" />
            🚀 Enviar para {passageiros.length} Passageiros Automaticamente
          </>
        )}
      </Button>

      {/* Barra de Progresso */}
      {enviando && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progresso}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Progresso: {Math.round(progresso)}%</span>
            <span>{sucessos} enviados, {erros} erros</span>
          </div>
        </div>
      )}

      {/* Resultados */}
      {resultados.length > 0 && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h6 className="font-medium">Resultados do Envio:</h6>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                ✅ {sucessos} enviados
              </Badge>
              {erros > 0 && (
                <Badge variant="secondary" className="bg-red-100 text-red-700">
                  ❌ {erros} erros
                </Badge>
              )}
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto space-y-1">
            {resultados.map((resultado, index) => (
              <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  {resultado.status === 'enviado' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium">{resultado.passageiro}</span>
                  <span className="text-gray-500">{resultado.telefone}</span>
                </div>
                {resultado.erro && (
                  <span className="text-xs text-red-600">{resultado.erro}</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Instruções */}
      <Alert className="border-blue-200 bg-blue-50">
        <Settings className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-800">
          <strong>Como configurar:</strong> Para usar APIs reais, você precisa configurar as chaves de API no arquivo .env do projeto. 
          A simulação funciona sem configuração adicional.
        </AlertDescription>
      </Alert>
    </div>
  );
};