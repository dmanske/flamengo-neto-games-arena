import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { supabase } from '@/lib/supabase';
import { QRScanner } from '../qr-scanner/QRScanner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const [activeTab, setActiveTab] = useState('overview');
  const [onibusList, setOnibusList] = useState<any[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);

  useEffect(() => {
    loadExistingQRCodes();
    loadOnibus();
  }, [viagemId]);

  const loadOnibus = async () => {
    try {
      const { data, error } = await supabase
        .from('viagem_onibus')
        .select('*')
        .eq('viagem_id', viagemId)
        .order('numero_identificacao');

      if (!error && data) {
        setOnibusList(data);
      }
    } catch (error) {
      console.error('Erro ao carregar ônibus:', error);
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
      await loadExistingQRCodes();
      
      toast.success('QR Codes gerados!', {
        description: `🎉 ${generatedQRCodes.length} códigos únicos foram criados com sucesso.`,
        duration: 4000,
      });
      
    } catch (error) {
      console.error('❌ Erro ao gerar QR codes:', error);
      toast.error('Erro na geração', {
        description: '🔧 Não foi possível gerar os QR codes. Verifique sua conexão.',
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (qrCodes.length === 0) {
      toast.error('QR Codes necessários', {
        description: '📱 Você precisa gerar os QR codes primeiro.',
        duration: 4000,
      });
      return;
    }

    setShowSendDialog(true);
  };

  const confirmSendWhatsApp = async () => {
    try {
      setIsSending(true);
      setShowSendDialog(false);
      
      const dadosViagem = {
        adversario: viagem.adversario,
        data_jogo: format(new Date(viagem.data_jogo), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
        local: viagem.local || 'Estádio'
      };

      // Z-API já está configurada no whatsappService.ts
      console.log('📱 Usando Z-API configurada no sistema');

      let sucessos = 0;
      let erros = 0;

      for (const qrData of qrCodes) {
        try {
          await enviarQRCodeViaZAPI(qrData, dadosViagem);
          sucessos++;
        } catch (error) {
          console.error(`Erro ao enviar para ${qrData.passageiro.nome}:`, error);
          erros++;
        }
      }
      
      toast.success('QR Codes enviados!', {
        description: `📱 ${sucessos} de ${qrCodes.length} códigos foram enviados via Z-API.`,
        duration: 5000,
      });
      
      if (erros > 0) {
        toast.warning('Alguns envios falharam', {
          description: `⚠️ ${erros} envios não foram concluídos.`,
          duration: 6000,
        });
      }
      
    } catch (error) {
      console.error('❌ Erro ao enviar QR codes:', error);
      toast.error('Erro no envio', {
        description: '📱 Não foi possível enviar os QR codes via WhatsApp.',
        duration: 5000,
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatCPF = (cpf: string) => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    }
    return cpf;
  };

  const enviarQRCodeViaZAPI = async (qrData: QRCodeData, dadosViagem: any) => {
    // Buscar CPF do passageiro
    const passageiro = passageiros.find(p => p.nome === qrData.passageiro.nome);
    const cpf = passageiro?.cpf ? formatCPF(passageiro.cpf) : '';
    
    const legenda = `📅 *Data:* ${dadosViagem.data_jogo}
👋Olá *${qrData.passageiro.nome}*!
📄 CPF: ${cpf}

📱 *SEU QR CODE PARA PROCEDIMENTOS DE EMBARQUE*

✅ *Como usar:*
1️⃣ Mostre este QR code na tela do seu celular
2️⃣ O responsável irá escanear com a câmera
3️⃣ Sua presença será confirmada automaticamente

⚠️ *IMPORTANTE:*
• Mantenha a tela ligada e com bom brilho
• Chegue com antecedência ao local de embarque
• Em caso de dúvidas, entre em contato

*Neto Tours Viagens*
_Realizando sonhos, criando histórias_`;

    // Usar o serviço de WhatsApp para enviar imagem
    const { enviarImagemComLegenda } = await import('@/services/whatsappService');
    
    const resultado = await enviarImagemComLegenda(
      qrData.passageiro.telefone,
      qrData.qrCodeBase64,
      legenda,
      qrData.passageiro.nome
    );

    if (!resultado.sucesso) {
      throw new Error(resultado.erro || 'Erro ao enviar QR code via Z-API');
    }

    // Aguardar 2 segundos entre envios (mesmo delay do serviço original)
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const downloadAllQRCodes = () => {
    if (qrCodes.length === 0) {
      toast.error('Nenhum QR code disponível', {
        description: '📥 Não há QR codes para baixar.',
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
      }, index * 100);
    });

    toast.success('Download iniciado!', {
      description: `📥 Baixando ${qrCodes.length} QR codes.`,
      duration: 4000,
    });
  };

  const handleDeleteAllQRCodes = async () => {
    if (qrCodes.length === 0) {
      toast.error('Nenhum QR code para deletar');
      return;
    }

    setShowDeleteDialog(true);
  };

  const confirmDeleteAllQRCodes = async () => {
    try {
      setIsGenerating(true);
      setShowDeleteDialog(false);
      
      const { error } = await supabase
        .from('passageiro_qr_tokens')
        .delete()
        .eq('viagem_id', viagemId);

      if (error) throw error;

      setQrCodes([]);
      
      toast.success('QR Codes deletados!', {
        description: `🗑️ Todos os códigos foram removidos.`,
        duration: 4000,
      });
      
    } catch (error) {
      console.error('❌ Erro ao deletar QR codes:', error);
      toast.error('Erro na exclusão');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateQRCodes = async () => {
    setShowRegenerateDialog(true);
  };

  const confirmRegenerateQRCodes = async () => {
    try {
      setIsGenerating(true);
      setShowRegenerateDialog(false);
      
      await supabase
        .from('passageiro_qr_tokens')
        .delete()
        .eq('viagem_id', viagemId);
      
      const generatedQRCodes = await qrCodeService.generateQRCodesForViagem(viagemId);
      
      setQrCodes(generatedQRCodes);
      await loadExistingQRCodes();
      
      toast.success('QR Codes regenerados!', {
        description: `🔄 ${generatedQRCodes.length} novos códigos foram criados.`,
        duration: 5000,
      });
      
    } catch (error) {
      console.error('❌ Erro ao regenerar QR codes:', error);
      toast.error('Erro na regeneração');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScanSuccess = (result: any) => {
    console.log('✅ QR code escaneado com sucesso:', result);
    onUpdatePassageiros();
    loadExistingQRCodes();
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const handleSendSingleWhatsApp = async (qrData: QRCodeData) => {
    try {
      const dadosViagem = {
        adversario: viagem.adversario,
        data_jogo: format(new Date(viagem.data_jogo), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
        local: viagem.local || 'Estádio'
      };

      await enviarQRCodeViaZAPI(qrData, dadosViagem);
      
      toast.success('✅ QR Code enviado!', {
        description: `📱 Enviado para ${qrData.passageiro.nome}`,
        duration: 4000,
      });
      
    } catch (error) {
      console.error('❌ Erro ao enviar QR code:', error);
      toast.error('Erro no envio');
    }
  };

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
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
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
                {isSending ? 'Enviando...' : `Enviar (${qrCodes.length})`}
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
                className="flex items-center gap-2 text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Deletar Todos
              </Button>
            </div>

            {/* Links Públicos por Ônibus */}
            {onibusList && onibusList.length > 0 && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Links de Scanner por Ônibus (Sem Login)
                  </h3>
                  <div className="space-y-3">
                    {onibusList.map((onibus: any) => (
                      <div key={onibus.id} className="bg-white p-3 rounded border border-green-300">
                        <p className="text-sm font-medium text-green-800 mb-2">
                          🚌 {onibus.numero_identificacao} - {onibus.tipo_onibus}
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={`${window.location.origin}/scanner-publico/${viagemId}/${onibus.id}`}
                            className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-green-300 rounded"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/scanner-publico/${viagemId}/${onibus.id}`);
                              toast.success(`Link do ${onibus.numero_identificacao} copiado!`);
                            }}
                          >
                            Copiar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/scanner-publico/${viagemId}/${onibus.id}`, '_blank')}
                          >
                            Abrir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-green-700 mt-3">
                    💡 Cada link abre uma página com scanner + lista de passageiros do ônibus específico. Compartilhe com os responsáveis!
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Como Funciona */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Como Funciona
                </h3>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li><strong>Gere QR Codes:</strong> Cria códigos únicos para cada passageiro</li>
                  <li><strong>Envie via WhatsApp:</strong> Os QR codes são enviados automaticamente</li>
                  <li><strong>Cliente mostra QR:</strong> Passageiro abre o link e mostra na tela</li>
                  <li><strong>Você escaneia:</strong> Use o scanner para confirmar presença</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Scanner */}
          <TabsContent value="scanner" className="space-y-6">
            <div className="flex justify-center">
              <QRScanner
                viagemId={viagemId}
                onScanSuccess={handleScanSuccess}
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
                    Clique em "Gerar QR Codes" para criar códigos únicos
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
                                className="h-6 w-6 p-0 text-green-600"
                                onClick={() => handleSendSingleWhatsApp(qrData)}
                                title="Enviar via WhatsApp"
                              >
                                <MessageCircle className="h-4 w-4" />
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
                                Confirmado
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <Clock className="h-3 w-3 mr-1" />
                                Pendente
                              </Badge>
                            )}
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

      {/* Dialog de Confirmação - Deletar Todos */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Deletar todos os QR Codes?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Você está prestes a deletar <strong>{qrCodes.length} QR codes</strong>.
              </p>
              <p className="text-red-600 font-medium">
                ⚠️ Esta ação não pode ser desfeita!
              </p>
              <p>
                Os passageiros não poderão mais usar os QR codes enviados anteriormente.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAllQRCodes}
              className="bg-red-600 hover:bg-red-700"
            >
              Sim, deletar todos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Confirmação - Regenerar */}
      <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              Regenerar todos os QR Codes?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Você está prestes a regenerar <strong>{qrCodes.length} QR codes</strong>.
              </p>
              <p className="text-orange-600 font-medium">
                ⚠️ Os códigos antigos serão invalidados!
              </p>
              <p>
                Novos QR codes serão criados e você precisará enviá-los novamente aos passageiros.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRegenerateQRCodes}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Sim, regenerar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Confirmação - Enviar WhatsApp */}
      <AlertDialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Enviar QR Codes via WhatsApp?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Você está prestes a enviar <strong>{qrCodes.length} QR codes</strong> via WhatsApp.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 my-2">
                <p className="text-green-800 text-sm">
                  📱 <strong>O que será enviado:</strong>
                </p>
                <ul className="text-green-700 text-sm mt-2 space-y-1 list-disc list-inside">
                  <li>Imagem do QR code personalizado</li>
                  <li>Instruções de uso</li>
                  <li>Informações da viagem</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                ⏱️ O envio pode levar alguns minutos (2 segundos entre cada mensagem).
              </p>
              <p className="text-orange-600 font-medium text-sm">
                💰 Cada mensagem consumirá créditos da Z-API
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSendWhatsApp}
              className="bg-green-600 hover:bg-green-700"
            >
              Sim, enviar para {qrCodes.length} passageiros
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
