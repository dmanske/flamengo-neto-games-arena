import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  QrCode, 
  MessageCircle, 
  Camera, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Smartphone,
  Phone,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { qrCodeService, type QRCodeData } from '@/services/qrCodeService';
import { enviarQRCodesWhatsApp } from '@/services/whatsappService';
import { supabase } from '@/lib/supabase';
import { QRScanner } from '../qr-scanner/QRScanner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePersonalizacao } from '@/contexts/PersonalizacaoContext';

interface QRCodeSectionProps {
  viagemId: string;
  viagem: any;
  passageiros: any[];
  onUpdatePassageiros: () => void;
}

export const QRCodeSection: React.FC<QRCodeSectionProps> = ({
  viagemId,
  viagem,
  passageiros,
  onUpdatePassageiros
}) => {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [qrStats, setQrStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Hook para obter configurações personalizadas
  const { configuracaoEsportiva } = usePersonalizacao();

  useEffect(() => {
    loadQRStats();
    loadExistingQRCodes();
  }, [viagemId]);

  // Debug: monitorar mudanças nos QR codes
  useEffect(() => {
    console.log('🔍 Estado qrCodes atualizado:', qrCodes.length, 'QR codes');
  }, [qrCodes]);

  const loadQRStats = async () => {
    try {
      const stats = await qrCodeService.getQRCodeStats(viagemId);
      setQrStats(stats);
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
    }
  };

  const loadExistingQRCodes = async () => {
    try {
      console.log('🔄 Carregando QR codes existentes para viagem:', viagemId);
      const existingQRCodes = await qrCodeService.getQRCodesForViagem(viagemId);
      console.log('📋 QR codes carregados:', existingQRCodes.length);
      setQrCodes(existingQRCodes);
    } catch (error) {
      console.error('❌ Erro ao carregar QR codes existentes:', error);
    }
  };

  const handleGenerateQRCodes = async () => {
    try {
      setIsGenerating(true);
      
      console.log('🔄 Gerando QR codes para viagem:', viagemId);
      const generatedQRCodes = await qrCodeService.generateQRCodesForViagem(viagemId);
      
      setQrCodes(generatedQRCodes);
      await loadQRStats();
      await loadExistingQRCodes();
      
      toast.success('QR Codes gerados!', {
        description: `🎉 ${generatedQRCodes.length} códigos únicos foram criados com sucesso para todos os passageiros.`,
        duration: 4000,
      });
      
    } catch (error) {
      console.error('❌ Erro ao gerar QR codes:', error);
      toast.error('Erro na geração', {
        description: '🔧 Não foi possível gerar os QR codes. Verifique sua conexão e tente novamente.',
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (qrCodes.length === 0) {
      toast.error('QR Codes necessários', {
        description: '📱 Você precisa gerar os QR codes primeiro antes de enviá-los via WhatsApp.',
        duration: 4000,
      });
      return;
    }

    try {
      setIsSending(true);
      
      const dadosViagem = {
        adversario: viagem.adversario,
        data_jogo: format(new Date(viagem.data_jogo), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
        local: viagem.local || configuracaoEsportiva?.estadio_principal || 'Estádio'
      };

      // Detectar automaticamente qual API usar
      const apiTipo = await detectarAPIWhatsApp();
      const apiNome = apiTipo === 'z-api' ? 'Z-API' : 
                     apiTipo === 'evolution-api' ? 'Evolution API' : 'Manual';

      console.log(`📱 Enviando QR codes via ${apiNome}...`);
      
      if (apiTipo === 'manual') {
        toast.warning('Nenhuma API configurada', {
          description: 'Configure Z-API ou Evolution API nas configurações para envio automático.',
          duration: 5000,
        });
        return;
      }

      const resultado = await enviarQRCodesWhatsApp(qrCodes, dadosViagem, apiTipo);
      
      toast.success('QR Codes enviados!', {
        description: `📱 ${resultado.resumo.sucessos} de ${resultado.resumo.total} códigos foram enviados com sucesso via ${apiNome}.`,
        duration: 5000,
      });
      
      if (resultado.resumo.erros > 0) {
        toast.warning('Alguns envios falharam', {
          description: `⚠️ ${resultado.resumo.erros} envios não foram concluídos. Verifique os números de telefone.`,
          duration: 6000,
        });
      }
      
    } catch (error) {
      console.error('❌ Erro ao enviar QR codes:', error);
      toast.error('Erro no envio', {
        description: '📱 Não foi possível enviar os QR codes via WhatsApp. Verifique sua conexão e tente novamente.',
        duration: 5000,
      });
    } finally {
      setIsSending(false);
    }
  };

  const downloadAllQRCodes = () => {
    if (qrCodes.length === 0) {
      toast.error('Nenhum QR code disponível', {
        description: '📥 Não há QR codes para baixar. Gere os códigos primeiro.',
        duration: 4000,
      });
      return;
    }

    qrCodes.forEach((qrData, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.download = `qrcode-${qrData.passageiro.nome.replace(/\s+/g, '-')}.png`;
        link.href = qrData.qrCodeBase64;
        link.click();
      }, index * 100); // Delay para evitar bloqueio do browser
    });

    toast.success('Download iniciado!', {
      description: `📥 Baixando ${qrCodes.length} QR codes. Os arquivos serão salvos na sua pasta de downloads.`,
      duration: 4000,
    });
  };

  const handleDeleteAllQRCodes = async () => {
    if (qrCodes.length === 0) {
      toast.error('Nenhum QR code para deletar', {
        description: '🗑️ Não há QR codes para remover.',
        duration: 3000,
      });
      return;
    }

    // Usar toast para confirmação mais elegante
    toast.warning('Confirmar exclusão em massa', {
      description: `Deseja realmente deletar todos os ${qrCodes.length} QR codes? Esta ação não pode ser desfeita.`,
      action: {
        label: 'Deletar Todos',
        onClick: () => executarDeleteAll(),
      },
      duration: 15000,
    });
    return;
  };

  const executarDeleteAll = async () => {

    try {
      setIsGenerating(true);
      
      console.log('🗑️ Deletando QR codes para viagem:', viagemId);
      
      // Deletar todos os tokens da viagem
      const { error } = await supabase
        .from('passageiro_qr_tokens')
        .delete()
        .eq('viagem_id', viagemId);

      if (error) {
        throw new Error(`Erro ao deletar QR codes: ${error.message}`);
      }

      // Limpar estado local
      setQrCodes([]);
      await loadQRStats();
      
      toast.success('QR Codes deletados!', {
        description: `🗑️ Todos os ${qrCodes.length} códigos foram removidos com sucesso.`,
        duration: 4000,
      });
      
    } catch (error) {
      console.error('❌ Erro ao deletar QR codes:', error);
      toast.error('Erro na exclusão', {
        description: '🔧 Não foi possível deletar os QR codes. Tente novamente.',
        duration: 4000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateQRCodes = async () => {
    // Usar toast para confirmação mais elegante
    toast.warning('Confirmar regeneração', {
      description: 'Deseja regenerar todos os QR codes? Os códigos antigos serão invalidados.',
      action: {
        label: 'Regenerar',
        onClick: () => executarRegenerate(),
      },
      duration: 15000,
    });
    return;
  };

  const executarRegenerate = async () => {

    try {
      setIsGenerating(true);
      
      console.log('🔄 Regenerando QR codes para viagem:', viagemId);
      
      // Primeiro deletar os existentes
      await supabase
        .from('passageiro_qr_tokens')
        .delete()
        .eq('viagem_id', viagemId);
      
      // Gerar novos
      const generatedQRCodes = await qrCodeService.generateQRCodesForViagem(viagemId);
      
      setQrCodes(generatedQRCodes);
      await loadQRStats();
      await loadExistingQRCodes();
      
      toast.success('QR Codes regenerados!', {
        description: `🔄 ${generatedQRCodes.length} novos códigos foram criados. Os códigos antigos foram invalidados.`,
        duration: 5000,
      });
      
    } catch (error) {
      console.error('❌ Erro ao regenerar QR codes:', error);
      toast.error('Erro na regeneração', {
        description: '🔧 Não foi possível regenerar os QR codes. Verifique sua conexão e tente novamente.',
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScanSuccess = (result: any) => {
    console.log('✅ QR code escaneado com sucesso:', result);
    onUpdatePassageiros();
    loadQRStats();
  };

  const handleScanError = (error: string) => {
    console.error('❌ Erro no scanner:', error);
  };

  // Função para formatar telefone
  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  // Função para deletar QR code individual
  const handleDeleteSingleQRCode = async (token: string, nomePassageiro: string) => {
    // Usar toast para confirmação mais elegante
    toast.info('Confirmar exclusão', {
      description: `Deseja realmente deletar o QR code de ${nomePassageiro}?`,
      action: {
        label: 'Deletar',
        onClick: () => executarDeleteSingle(token, nomePassageiro),
      },
      duration: 10000,
    });
  };

  const executarDeleteSingle = async (token: string, nomePassageiro: string) => {

    try {
      const { error } = await supabase
        .from('passageiro_qr_tokens')
        .delete()
        .eq('token', token);

      if (error) {
        throw new Error(`Erro ao deletar QR code: ${error.message}`);
      }

      // Atualizar lista local
      setQrCodes(prev => prev.filter(qr => qr.token !== token));
      await loadQRStats();
      
      toast.success('QR Code deletado!', {
        description: `🗑️ O código de ${nomePassageiro} foi removido com sucesso.`,
        duration: 3000,
      });
      
    } catch (error) {
      console.error('❌ Erro ao deletar QR code:', error);
      toast.error('Erro ao deletar', {
        description: '🔧 Não foi possível deletar o QR code. Tente novamente.',
        duration: 4000,
      });
    }
  };

  // Função auxiliar para envio via WhatsApp Web
  const enviarViaWhatsAppWeb = async (qrData: QRCodeData, mensagem: string, phoneNumber: string) => {
    // Tentar usar a API do navegador para compartilhar (se disponível)
    if (navigator.share && navigator.canShare) {
      try {
        // Converter base64 para blob
        const base64Data = qrData.qrCodeBase64.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        const file = new File([blob], `qrcode-${qrData.passageiro.nome.replace(/\s+/g, '-')}.png`, { type: 'image/png' });

        const shareData = {
          title: `QR Code - ${qrData.passageiro.nome}`,
          text: mensagem,
          files: [file]
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          toast.success('Compartilhamento realizado!', {
            description: `📱 QR code compartilhado para ${qrData.passageiro.nome}`,
            duration: 4000,
          });
          return;
        }
      } catch (shareError) {
        console.log('Compartilhamento nativo falhou:', shareError);
      }
    }

    // Fallback: WhatsApp Web + download
    const whatsappUrl = `https://web.whatsapp.com/send?phone=55${phoneNumber}&text=${encodeURIComponent(mensagem)}`;
    
    // Baixar a imagem automaticamente
    const link = document.createElement('a');
    link.download = `qrcode-${qrData.passageiro.nome.replace(/\s+/g, '-')}.png`;
    link.href = qrData.qrCodeBase64;
    link.click();
    
    // Abrir WhatsApp Web
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 500);
    
    toast.info('WhatsApp Web aberto!', {
      description: `📱 Mensagem preparada para ${qrData.passageiro.nome}. A imagem do QR code foi baixada - anexe ela na conversa.`,
      duration: 6000,
    });
  };

  // Função para detectar qual API usar
  const detectarAPIWhatsApp = async (): Promise<'z-api' | 'evolution-api' | 'manual'> => {
    try {
      // Primeiro, verificar se há configuração no banco de dados
      const { data: config, error } = await supabase
        .from('configuracao_whatsapp')
        .select('*')
        .eq('ativo', true)
        .single();

      if (!error && config) {
        console.log('📋 Configuração WhatsApp encontrada no banco:', config.api_tipo);
        return config.api_tipo === 'evolution-api' ? 'evolution-api' : 'z-api';
      }

      // Se não há configuração no banco, verificar variáveis de ambiente Z-API
      const hasZAPIConfig = import.meta.env.VITE_ZAPI_INSTANCE && 
                           import.meta.env.VITE_ZAPI_TOKEN && 
                           import.meta.env.VITE_ZAPI_CLIENT_TOKEN;

      if (hasZAPIConfig) {
        console.log('📋 Configuração Z-API encontrada nas variáveis de ambiente');
        return 'z-api';
      }

      console.log('📋 Nenhuma configuração de API encontrada, usando método manual');
      return 'manual';
    } catch (error) {
      console.error('❌ Erro ao detectar API WhatsApp:', error);
      return 'manual';
    }
  };

  // Função para enviar QR code individual via WhatsApp
  const handleSendSingleWhatsApp = async (qrData: QRCodeData) => {
    try {
      const phoneNumber = qrData.passageiro.telefone.replace(/\D/g, '');
      const dadosViagem = {
        adversario: viagem.adversario,
        data_jogo: format(new Date(viagem.data_jogo), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
        local: viagem.local || configuracaoEsportiva?.estadio_principal || 'Estádio'
      };

      // Detectar automaticamente qual API usar
      const apiTipo = await detectarAPIWhatsApp();

      // Criar mensagem personalizada
      const timePrincipal = configuracaoEsportiva?.time_principal || 'Time Principal';
      const mensagem = `🔥 *${timePrincipal.toUpperCase()} vs ${dadosViagem.adversario.toUpperCase()}*
📅 *Data:* ${dadosViagem.data_jogo}

👋 Olá *${qrData.passageiro.nome}*!

📱 *SEU QR CODE PARA LISTA DE PRESENÇA*

✅ *Como usar:*
1️⃣ Mostre este QR code na tela do seu celular
2️⃣ O responsável irá escanear com o celular dele
3️⃣ Sua presença será confirmada automaticamente

⚠️ *IMPORTANTE:*
• Mantenha a tela ligada e com bom brilho
• Chegue com antecedência ao local de embarque
• Em caso de dúvidas, entre em contato`;

      if (apiTipo !== 'manual') {
        // Tentar envio automático primeiro (com imagem)
        const apiNome = apiTipo === 'z-api' ? 'Z-API' : 'Evolution API';
        toast.info('Enviando QR Code...', {
          description: `📱 Tentando enviar automaticamente via ${apiNome} para ${qrData.passageiro.nome}`,
          duration: 3000,
        });

        try {
          console.log(`🚀 Tentando envio automático via ${apiNome} para:`, qrData.passageiro.nome);
          const resultado = await enviarQRCodesWhatsApp([qrData], dadosViagem, apiTipo);
          
          console.log('📋 Resultado do envio automático:', resultado);
          
          if (resultado.resumo.sucessos > 0) {
            toast.success('✅ QR Code enviado com imagem!', {
              description: `📱 O código foi enviado automaticamente com a imagem para ${qrData.passageiro.nome} via ${apiNome}.`,
              duration: 5000,
            });
            return;
          } else {
            console.log('❌ Envio automático falhou - nenhum sucesso');
            throw new Error('Nenhum envio bem-sucedido');
          }
        } catch (autoError) {
          console.log(`❌ Envio automático via ${apiNome} falhou, tentando manual:`, autoError);
          toast.warning(`Envio via ${apiNome} falhou`, {
            description: 'Abrindo WhatsApp Web para envio manual. A imagem será baixada automaticamente.',
            duration: 4000,
          });
        }
      } else {
        toast.info('Usando método manual', {
          description: 'Nenhuma API configurada. Usando WhatsApp Web + download da imagem.',
          duration: 4000,
        });
      }

      // Método manual: WhatsApp Web + download da imagem
      await enviarViaWhatsAppWeb(qrData, mensagem, phoneNumber);
      
    } catch (error) {
      console.error('❌ Erro ao enviar QR code:', error);
      toast.error('Erro no envio', {
        description: '📱 Não foi possível enviar o QR code via WhatsApp. Tente novamente.',
        duration: 4000,
      });
    }
  };

  // Calcular estatísticas dos QR codes
  const qrCodeStats = {
    total: qrCodes.length,
    confirmados: passageiros.filter(p => p.confirmation_method === 'qr_code' && p.status_presenca === 'presente').length,
    pendentes: qrCodes.length - passageiros.filter(p => p.confirmation_method === 'qr_code' && p.status_presenca === 'presente').length
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Sistema de QR Codes
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Gere QR codes para os passageiros confirmarem presença automaticamente
        </p>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="scanner">Scanner</TabsTrigger>
            <TabsTrigger value="qrcodes">QR Codes</TabsTrigger>
          </TabsList>

          {/* Aba Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="flex items-center p-4">
                  <QrCode className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{qrCodeStats.total}</p>
                    <p className="text-sm text-muted-foreground">QR Codes Gerados</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-4">
                  <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{qrCodeStats.confirmados}</p>
                    <p className="text-sm text-muted-foreground">Confirmados via QR</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-4">
                  <Clock className="h-8 w-8 text-orange-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{qrCodeStats.pendentes}</p>
                    <p className="text-sm text-muted-foreground">Pendentes</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ações Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <Button 
                onClick={handleGenerateQRCodes}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <QrCode className="h-4 w-4" />
                )}
                {isGenerating ? 'Gerando...' : 'Gerar QR Codes'}
              </Button>

              <Button 
                onClick={handleRegenerateQRCodes}
                disabled={qrCodes.length === 0 || isGenerating}
                variant="outline"
                className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Regenerar
              </Button>

              <Button 
                onClick={handleSendWhatsApp}
                disabled={isSending || qrCodes.length === 0}
                variant="default"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                {isSending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
                {isSending ? `Enviando... (${qrCodes.length})` : `Enviar Todos (${qrCodes.length})`}
              </Button>

              <Button 
                onClick={downloadAllQRCodes}
                disabled={qrCodes.length === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Baixar Todos
              </Button>

              <Button 
                onClick={handleDeleteAllQRCodes}
                disabled={qrCodes.length === 0 || isGenerating}
                variant="outline"
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Deletar Todos
              </Button>

              <Button 
                onClick={() => setActiveTab('scanner')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Abrir Scanner
              </Button>
            </div>

            {/* Como Funciona */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Como Funciona
                </h3>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li><strong>Gere QR Codes:</strong> Clique em "Gerar QR Codes" para criar códigos únicos para cada passageiro</li>
                  <li><strong>Envie via WhatsApp:</strong> Os QR codes são enviados automaticamente para os passageiros</li>
                  <li><strong>Cliente mostra QR:</strong> Passageiro abre o link e mostra o QR code na tela</li>
                  <li><strong>Você escaneia:</strong> Use o scanner para ler o QR code e confirmar presença automaticamente</li>
                </ol>
              </CardContent>
            </Card>

            {/* Status da Viagem */}
            {viagem?.status_viagem !== 'Em andamento' && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Atenção:</span>
                  </div>
                  <p className="text-yellow-700 mt-1">
                    Para usar o sistema de QR codes, altere o status da viagem para "Em andamento".
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba Scanner */}
          <TabsContent value="scanner" className="space-y-6">
            <div className="flex justify-center">
              <QRScanner
                viagemId={viagemId}
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
              />
            </div>
          </TabsContent>

          {/* Aba QR Codes */}
          <TabsContent value="qrcodes" className="space-y-6">
            {qrCodes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <QrCode className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum QR Code gerado</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Clique em "Gerar QR Codes" para criar códigos únicos para todos os passageiros
                  </p>
                  <Button onClick={handleGenerateQRCodes} disabled={isGenerating}>
                    {isGenerating ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <QrCode className="h-4 w-4 mr-2" />
                    )}
                    {isGenerating ? 'Gerando...' : 'Gerar QR Codes'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {qrCodes.map((qrData, index) => {
                  const passageiro = passageiros.find(p => p.nome === qrData.passageiro.nome);
                  const isConfirmed = passageiro?.status_presenca === 'presente';
                  const confirmationMethod = passageiro?.confirmation_method;

                  return (
                    <Card key={index} className={isConfirmed ? 'border-green-200 bg-green-50' : ''}>
                      <CardContent className="p-4">
                        <div className="text-center space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg">{qrData.passageiro.nome}</h3>
                            <div className="flex items-center justify-center gap-2 mt-2">
                              <Phone className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-gray-700">
                                {formatPhone(qrData.passageiro.telefone)}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-green-600 hover:bg-green-100 hover:text-green-700"
                                onClick={() => handleSendSingleWhatsApp(qrData)}
                                title="Enviar via WhatsApp"
                              >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                </svg>
                              </Button>
                            </div>
                          </div>
                          
                          <div className="bg-white p-2 rounded border inline-block">
                            <img 
                              src={qrData.qrCodeBase64} 
                              alt={`QR Code - ${qrData.passageiro.nome}`}
                              className="w-32 h-32"
                            />
                          </div>

                          <div className="flex justify-center">
                            {isConfirmed ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {confirmationMethod === 'qr_code' ? 'Confirmado via QR' : 'Confirmado'}
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <Clock className="h-3 w-3 mr-1" />
                                Pendente
                              </Badge>
                            )}
                          </div>

                          <div className="flex gap-2 justify-center flex-wrap">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => {
                                const link = document.createElement('a');
                                link.download = `qrcode-${qrData.passageiro.nome.replace(/\s+/g, '-')}.png`;
                                link.href = qrData.qrCodeBase64;
                                link.click();
                              }}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Baixar
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                              onClick={async () => {
                                const toastId = toast.loading(`Enviando para ${qrData.passageiro.nome}...`);
                                
                                try {
                                  const dadosViagem = {
                                    adversario: viagem.adversario,
                                    data_jogo: format(new Date(viagem.data_jogo), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
                                    local_jogo: viagem.local_jogo || 'A definir',
                                    horario_embarque: viagem.horario_embarque || 'A definir',
                                    local_embarque: viagem.local_embarque || 'A definir'
                                  };
                                  
                                  const resultado = await enviarQRCodesWhatsApp(
                                    [qrData],
                                    dadosViagem,
                                    'evolution-api'
                                  );
                                  
                                  toast.dismiss(toastId);
                                  
                                  if (resultado.resultados[0].status === 'enviado') {
                                    toast.success(`✅ Enviado para ${qrData.passageiro.nome}!`);
                                  } else {
                                    toast.error(`❌ Erro: ${resultado.resultados[0].erro}`);
                                  }
                                } catch (error) {
                                  toast.dismiss(toastId);
                                  toast.error(`Erro ao enviar: ${error}`);
                                }
                              }}
                            >
                              <MessageCircle className="h-3 w-3 mr-1" />
                              Enviar
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleDeleteSingleQRCode(qrData.token, qrData.passageiro.nome)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Deletar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};