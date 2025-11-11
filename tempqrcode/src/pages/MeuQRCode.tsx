import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Share2, QrCode, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { qrCodeService, type TokenValidationResult } from '@/services/qrCodeService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MeuQRCode = () => {
  const { token } = useParams<{ token: string }>();
  const [tokenInfo, setTokenInfo] = useState<TokenValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeImage, setQrCodeImage] = useState<string>('');

  useEffect(() => {
    if (token) {
      loadTokenInfo();
    }
  }, [token]);

  const loadTokenInfo = async () => {
    if (!token) return;

    try {
      setLoading(true);
      
      // Validar token e buscar informações
      const result = await qrCodeService.validateToken(token);
      setTokenInfo(result);

      if (result.valid && result.data) {
        // Gerar QR code para exibição
        const QRCode = (await import('qrcode')).default;
        const qrDataUrl = await QRCode.toDataURL(token, {
          width: 300,
          margin: 3,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });
        setQrCodeImage(qrDataUrl);
      }

    } catch (error) {
      console.error('❌ Erro ao carregar informações do token:', error);
      toast.error('Erro ao carregar QR code');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeImage || !tokenInfo?.data) return;

    const link = document.createElement('a');
    link.download = `qrcode-${tokenInfo.data.passageiro.nome.replace(/\s+/g, '-')}.png`;
    link.href = qrCodeImage;
    link.click();
    
    toast.success('QR Code baixado!');
  };

  const shareQRCode = async () => {
    if (!qrCodeImage || !tokenInfo?.data) return;

    try {
      // Converter base64 para blob
      const response = await fetch(qrCodeImage);
      const blob = await response.blob();
      const file = new File([blob], 'meu-qrcode.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Meu QR Code - Lista de Presença',
          text: `QR Code para ${tokenInfo.data.viagem.adversario}`,
          files: [file]
        });
        toast.success('QR Code compartilhado!');
      } else {
        // Fallback: copiar para clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copiado para área de transferência!');
      }
    } catch (error) {
      console.error('❌ Erro ao compartilhar:', error);
      toast.error('Erro ao compartilhar QR code');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenInfo || !tokenInfo.valid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">QR Code Inválido</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {tokenInfo?.message || 'Este QR code não é válido ou expirou.'}
            </p>
            
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link to="/dashboard/viagens">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Viagens
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data } = tokenInfo;
  const isPresent = data.passageiro.status_presenca === 'presente';

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/dashboard/viagens">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold">Meu QR Code</h1>
        </div>

        {/* Status da Presença */}
        {isPresent && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Presença Confirmada!</p>
                <p className="text-sm text-green-600">Sua presença já foi registrada</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações da Viagem */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {data.viagem.logo_flamengo ? (
                  <img 
                    src={data.viagem.logo_flamengo} 
                    alt="Flamengo" 
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="bg-red-600 w-10 h-10 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">FLA</span>
                  </div>
                )}
                
                <div>
                  <h2 className="font-bold">vs {data.viagem.adversario}</h2>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(data.viagem.data_jogo), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
              
              {data.viagem.logo_adversario && (
                <img 
                  src={data.viagem.logo_adversario} 
                  alt={data.viagem.adversario} 
                  className="w-10 h-10 rounded-full"
                />
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Dados do Passageiro */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Seus Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold">{data.passageiro.nome}</p>
              <p className="text-sm text-muted-foreground">{data.passageiro.telefone}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Cidade</p>
                <p className="font-medium">{data.passageiro.cidade_embarque}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Setor</p>
                <p className="font-medium">{data.passageiro.setor_maracana}</p>
              </div>
            </div>

            {data.onibus && (
              <div>
                <p className="text-muted-foreground text-sm">Ônibus</p>
                <p className="font-medium">
                  {data.onibus.numero_identificacao} - {data.onibus.tipo_onibus}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Seu QR Code
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Mostre este código para o responsável escanear
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {qrCodeImage && (
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <img 
                    src={qrCodeImage} 
                    alt="QR Code" 
                    className="w-64 h-64"
                  />
                </div>
              </div>
            )}

            {/* Status do Token */}
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Válido até {format(new Date(data.token_info.expires_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>

            {/* Ações */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={downloadQRCode}>
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
              
              <Button variant="outline" onClick={shareQRCode}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Como usar:</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Mostre este QR code na tela do seu celular</li>
              <li>O responsável irá escanear com o celular dele</li>
              <li>Sua presença será confirmada automaticamente</li>
              <li>Você receberá uma confirmação visual</li>
            </ol>
          </CardContent>
        </Card>

        {/* Informações Técnicas */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <QrCode className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-blue-800 mb-1">Dica:</p>
                <p className="text-blue-700">
                  Mantenha a tela do celular ligada e com bom brilho para facilitar a leitura do QR code.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MeuQRCode;