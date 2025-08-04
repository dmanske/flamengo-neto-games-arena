import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, X, Phone, Video } from 'lucide-react';
import { formatPhone } from '@/utils/formatters';

interface Mensagem {
  id: string;
  conteudo: string;
  tipo: 'enviada' | 'recebida';
  timestamp: Date;
}

interface ChatIntegradoProps {
  clienteId: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteFoto?: string;
  fullWidth?: boolean;
}

export const ChatIntegrado = ({ 
  clienteId, 
  clienteNome, 
  clienteTelefone, 
  clienteFoto,
  fullWidth = false
}: ChatIntegradoProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automático para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  // Inicializar chat com mensagem de boas-vindas e verificar status
  useEffect(() => {
    if (isOpen && mensagens.length === 0) {
      const inicializarChat = async () => {
        // Verificar status da Evolution API
        try {
          const { verificarStatusEvolution } = await import('@/lib/chat-apis');
          const status = await verificarStatusEvolution();
          
          let mensagemStatus = '';
          if (status.conectado) {
            mensagemStatus = '\n\n✅ WhatsApp conectado - mensagens serão enviadas automaticamente!';
          } else {
            mensagemStatus = '\n\n⚠️ WhatsApp não conectado - mensagens abrirão WhatsApp Web.';
          }
          
          setMensagens([
            {
              id: '1',
              conteudo: `Olá ${clienteNome}! 👋\n\nAqui é da equipe do Flamengo Viagens.\n\nComo posso te ajudar hoje?${mensagemStatus}`,
              tipo: 'recebida',
              timestamp: new Date()
            }
          ]);
        } catch (error) {
          // Fallback se não conseguir verificar status
          setMensagens([
            {
              id: '1',
              conteudo: `Olá ${clienteNome}! 👋\n\nAqui é da equipe do Flamengo Viagens.\n\nComo posso te ajudar hoje?`,
              tipo: 'recebida',
              timestamp: new Date()
            }
          ]);
        }
      };
      
      inicializarChat();
    }
  }, [isOpen, clienteNome]);

  const enviarMensagem = async () => {
    if (!novaMensagem.trim()) return;

    const mensagem: Mensagem = {
      id: Date.now().toString(),
      conteudo: novaMensagem,
      tipo: 'enviada',
      timestamp: new Date()
    };

    // Adicionar mensagem localmente
    setMensagens(prev => [...prev, mensagem]);
    const mensagemTexto = novaMensagem;
    setNovaMensagem('');

    try {
      // Importar funções de API
      const { enviarMensagem, verificarConfiguracao } = await import('@/lib/chat-apis');
      const config = verificarConfiguracao();
      
      if (config.evolution) {
        // Usar Evolution API (melhor opção)
        await enviarMensagem('evolution', clienteTelefone, mensagemTexto);
        
        // Mensagem de confirmação
        setTimeout(() => {
          const confirmacao: Mensagem = {
            id: (Date.now() + 1).toString(),
            conteudo: `✅ Mensagem enviada via WhatsApp! 🚀`,
            tipo: 'recebida',
            timestamp: new Date()
          };
          setMensagens(prev => [...prev, confirmacao]);
        }, 1000);
        
      } else {
        // Fallback para WhatsApp Web
        const telefoneClean = clienteTelefone.replace(/\D/g, '');
        const urlWhatsApp = `https://web.whatsapp.com/send?phone=55${telefoneClean}&text=${encodeURIComponent(mensagemTexto)}`;
        
        const resposta = confirm(
          `Evolution API não configurada.\n\n` +
          `Mensagem: "${mensagemTexto}"\n\n` +
          `Clique OK para abrir WhatsApp Web, ou Cancelar para simular.`
        );

        if (resposta) {
          window.open(urlWhatsApp, '_blank');
          
          setTimeout(() => {
            const confirmacao: Mensagem = {
              id: (Date.now() + 1).toString(),
              conteudo: `✅ WhatsApp Web aberto! Envie a mensagem manualmente.`,
              tipo: 'recebida',
              timestamp: new Date()
            };
            setMensagens(prev => [...prev, confirmacao]);
          }, 1000);
        } else {
          setTimeout(() => {
            const simulacao: Mensagem = {
              id: (Date.now() + 1).toString(),
              conteudo: `🤖 Simulação: Mensagem recebida! Configure Evolution API para envio automático.`,
              tipo: 'recebida',
              timestamp: new Date()
            };
            setMensagens(prev => [...prev, simulacao]);
          }, 1500);
        }
      }
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Mensagem de erro
      const erro: Mensagem = {
        id: (Date.now() + 2).toString(),
        conteudo: `❌ Erro ao enviar mensagem. Tente novamente.`,
        tipo: 'recebida',
        timestamp: new Date()
      };
      setMensagens(prev => [...prev, erro]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  return (
    <div className="relative">
      {/* Botão para abrir chat */}
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-green-500 hover:bg-green-600 text-white ${fullWidth ? 'w-full' : ''}`}
        size="sm"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Chat
      </Button>

      {/* Modal do Chat */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md h-[500px] flex flex-col shadow-2xl">
            {/* Header do Chat */}
            <CardHeader className="bg-green-500 text-white rounded-t-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white">
                    {clienteFoto ? (
                      <AvatarImage src={clienteFoto} alt={clienteNome} />
                    ) : (
                      <AvatarFallback className="bg-green-600 text-white">
                        {clienteNome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{clienteNome}</h3>
                    <p className="text-sm opacity-90">{formatPhone(clienteTelefone)}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-green-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Área das Mensagens */}
            <CardContent className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-4">
                {mensagens.map((mensagem) => (
                  <div
                    key={mensagem.id}
                    className={`flex ${mensagem.tipo === 'enviada' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        mensagem.tipo === 'enviada'
                          ? 'bg-green-500 text-white'
                          : 'bg-white text-gray-800 border'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{mensagem.conteudo}</p>
                      <p className={`text-xs mt-1 ${
                        mensagem.tipo === 'enviada' ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        {mensagem.timestamp.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            {/* Input para nova mensagem */}
            <div className="p-4 border-t bg-white rounded-b-lg">
              <div className="flex gap-2 mb-2">
                <Input
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="flex-1"
                />
                <Button 
                  onClick={enviarMensagem}
                  disabled={!novaMensagem.trim()}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {/* Botão de teste */}
              <div className="flex justify-center">
                <Button 
                  onClick={async () => {
                    const { testarEvolutionAPI, enviarMensagemTeste } = await import('@/utils/testar-evolution');
                    
                    // Testar conexão
                    const teste = await testarEvolutionAPI();
                    
                    if (teste.success) {
                      // Enviar mensagem de teste
                      const resultado = await enviarMensagemTeste(clienteTelefone);
                      
                      if (resultado.success) {
                        const sucesso: any = {
                          id: Date.now().toString(),
                          conteudo: `🎉 Teste realizado com sucesso!\n\nMensagem enviada para ${clienteTelefone}`,
                          tipo: 'recebida',
                          timestamp: new Date()
                        };
                        setMensagens(prev => [...prev, sucesso]);
                      } else {
                        const erro: any = {
                          id: Date.now().toString(),
                          conteudo: `❌ Erro no teste: ${resultado.error}`,
                          tipo: 'recebida',
                          timestamp: new Date()
                        };
                        setMensagens(prev => [...prev, erro]);
                      }
                    } else {
                      const erro: any = {
                        id: Date.now().toString(),
                        conteudo: `❌ Evolution API não conectada: ${teste.error}`,
                        tipo: 'recebida',
                        timestamp: new Date()
                      };
                      setMensagens(prev => [...prev, erro]);
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  🧪 Testar Evolution API
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};