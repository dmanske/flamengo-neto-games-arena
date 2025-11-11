import React, { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { qrCodeService, type ConfirmationResult } from '@/services/qrCodeService';

interface QRScannerProps {
  viagemId: string;
  onibusId?: string;
  onScanSuccess?: (result: ConfirmationResult) => void;
  onScanError?: (error: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  viagemId,
  onibusId,
  onScanSuccess,
  onScanError
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [lastScannedToken, setLastScannedToken] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      // Solicitar permissão da câmera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      setHasPermission(true);
      setIsScanning(true);

      // Inicializar leitor de QR code
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      // Iniciar scan
      if (videoRef.current) {
        codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          async (result, error) => {
            if (result) {
              const token = result.getText();
              
              // Evitar processar o mesmo token múltiplas vezes
              if (token === lastScannedToken) {
                return;
              }

              setLastScannedToken(token);
              await handleScan(token);
            }
          }
        );
      }

      toast.success('Câmera ativada!', {
        description: 'Aponte para o QR code do passageiro',
        duration: 3000,
      });

    } catch (error) {
      console.error('❌ Erro ao acessar câmera:', error);
      setHasPermission(false);
      
      toast.error('Erro ao acessar câmera', {
        description: 'Verifique as permissões do navegador',
        duration: 5000,
      });
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    setIsScanning(false);
    setLastScannedToken('');
  };

  const handleScan = async (token: string) => {
    try {
      console.log('📱 QR Code detectado:', token);

      // Confirmar presença
      const result = await qrCodeService.confirmPresence(token, 'qr_code');

      if (result.success) {
        // Sucesso
        toast.success('✅ Presença confirmada!', {
          description: `${result.data?.passageiro.nome} foi registrado como presente`,
          duration: 5000,
        });

        // Callback de sucesso
        if (onScanSuccess) {
          onScanSuccess(result);
        }

        // Limpar último token após 3 segundos para permitir próximo scan
        setTimeout(() => {
          setLastScannedToken('');
        }, 3000);

      } else {
        // Erro
        toast.error('❌ Erro na confirmação', {
          description: result.message,
          duration: 5000,
        });

        if (onScanError) {
          onScanError(result.message);
        }

        // Limpar último token após 3 segundos para permitir retry
        setTimeout(() => {
          setLastScannedToken('');
        }, 3000);
      }

    } catch (error) {
      console.error('❌ Erro ao processar QR code:', error);
      
      toast.error('Erro ao processar', {
        description: 'Não foi possível confirmar a presença',
        duration: 4000,
      });

      if (onScanError) {
        onScanError('Erro ao processar QR code');
      }

      setTimeout(() => {
        setLastScannedToken('');
      }, 3000);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          
          {/* Título */}
          <div className="text-center">
            <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
              <Camera className="h-5 w-5" />
              Scanner de QR Code
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isScanning ? 'Aponte a câmera para o QR code' : 'Clique para ativar a câmera'}
            </p>
          </div>

          {/* Vídeo da câmera */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white">
                  <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Câmera desativada</p>
                </div>
              </div>
            )}

            {/* Overlay de scan */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 border-4 border-green-500/30 rounded-lg">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-green-500 rounded-lg"></div>
                </div>
              </div>
            )}
          </div>

          {/* Botões de controle */}
          <div className="flex gap-3">
            {!isScanning ? (
              <Button 
                onClick={startScanning}
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-2" />
                Ativar Câmera
              </Button>
            ) : (
              <Button 
                onClick={stopScanning}
                variant="destructive"
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Parar Scanner
              </Button>
            )}
          </div>

          {/* Mensagem de permissão negada */}
          {hasPermission === false && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-red-800 mb-1">
                      Permissão de câmera negada
                    </p>
                    <p className="text-red-700">
                      Para usar o scanner, você precisa permitir o acesso à câmera nas configurações do navegador.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instruções */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-800 mb-2">Como usar:</p>
                  <ol className="text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Clique em "Ativar Câmera"</li>
                    <li>Permita o acesso à câmera quando solicitado</li>
                    <li>Aponte para o QR code do passageiro</li>
                    <li>A presença será confirmada automaticamente</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </CardContent>
    </Card>
  );
};
