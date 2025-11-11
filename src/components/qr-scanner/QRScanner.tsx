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
  const [isPaused, setIsPaused] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [lastScannedToken, setLastScannedToken] = useState<string>('');
  const [lastScannedName, setLastScannedName] = useState<string>('');
  const [countdown, setCountdown] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      stopScanning();
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
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

      // Iniciar scan com controle local de token
      if (videoRef.current) {
        let localLastToken = '';
        
        codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          async (result, error) => {
            if (result) {
              const token = result.getText();
              
              // Evitar processar o mesmo token múltiplas vezes
              if (token === localLastToken) {
                return;
              }

              localLastToken = token;
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
    setIsPaused(false);
    setLastScannedToken('');
    setLastScannedName('');
    setCountdown(0);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  };

  const pauseScanning = (passageiroNome: string) => {
    console.log('⏸️ PAUSANDO SCANNER - Parando completamente');
    
    // PARAR O SCANNER COMPLETAMENTE
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
      console.log('✅ Scanner parado e resetado');
    }

    setIsPaused(true);
    setLastScannedName(passageiroNome);
    setCountdown(3);

    // Iniciar contagem regressiva
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Reativar scanner automaticamente
          resumeScanning();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resumeScanning = async () => {
    console.log('▶️ RETOMANDO SCANNER - Reiniciando leitura');
    
    // PRIMEIRO: Parar o countdown imediatamente
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    // SEGUNDO: Limpar estados
    setIsPaused(false);
    setLastScannedToken('');
    setLastScannedName('');
    setCountdown(0);

    // TERCEIRO: Aguardar um tick para garantir que os estados foram atualizados
    await new Promise(resolve => setTimeout(resolve, 50));

    // QUARTO: REINICIAR O SCANNER
    try {
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      if (videoRef.current) {
        // Usar uma variável local para controlar o último token escaneado
        let localLastToken = '';
        
        await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          async (result, error) => {
            if (result) {
              const token = result.getText();
              
              // Evitar processar o mesmo token múltiplas vezes
              if (token === localLastToken) {
                console.log('⏭️ Token duplicado ignorado:', token);
                return;
              }

              console.log('🆕 Novo token detectado:', token);
              localLastToken = token;
              setLastScannedToken(token);
              await handleScan(token);
            }
          }
        );
        console.log('✅ Scanner reiniciado com sucesso');
        
        toast.success('Scanner reativado!', {
          description: 'Pronto para escanear próximo QR code',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('❌ Erro ao reiniciar scanner:', error);
      toast.error('Erro ao reiniciar scanner');
    }
  };

  const handleScan = async (token: string) => {
    // Se está pausado, não processar
    if (isPaused) {
      return;
    }

    try {
      console.log('📱 QR Code detectado:', token);

      // Confirmar presença
      const result = await qrCodeService.confirmPresence(token, 'qr_code');

      if (result.success) {
        // Pausar scanner imediatamente
        pauseScanning(result.data?.passageiro.nome || 'Passageiro');

        // Sucesso
        toast.success('✅ Presença confirmada!', {
          description: `${result.data?.passageiro.nome} foi registrado como presente`,
          duration: 5000,
        });

        // Callback de sucesso
        if (onScanSuccess) {
          onScanSuccess(result);
        }

      } else {
        // Erro - pausar por 3 segundos
        setLastScannedToken(token);
        
        toast.error('❌ Erro na confirmação', {
          description: result.message,
          duration: 5000,
        });

        if (onScanError) {
          onScanError(result.message);
        }

        // Limpar após 3 segundos para permitir retry
        setTimeout(() => {
          setLastScannedToken('');
        }, 3000);
      }

    } catch (error) {
      console.error('❌ Erro ao processar QR code:', error);
      
      setLastScannedToken(token);
      
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

            {/* Overlay quando pausado */}
            {isScanning && isPaused && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-500/95 backdrop-blur-sm">
                <div className="text-center text-white p-6">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 animate-bounce" />
                  <p className="text-xl font-bold mb-2">✅ {lastScannedName}</p>
                  <p className="text-lg mb-4">Presença confirmada!</p>
                  <div className="text-5xl font-bold mb-2">{countdown}</div>
                  <p className="text-sm mb-4">⏸️ Scanner pausado</p>
                  <p className="text-xs mb-4 opacity-80">Reativando automaticamente...</p>
                  <Button
                    onClick={resumeScanning}
                    variant="secondary"
                    size="lg"
                    className="mt-2"
                  >
                    ▶️ Escanear Próximo Agora
                  </Button>
                </div>
              </div>
            )}

            {/* Overlay de scan ativo */}
            {isScanning && !isPaused && (
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
              <>
                {isPaused && (
                  <Button 
                    onClick={resumeScanning}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Pronto para Próximo ({countdown}s)
                  </Button>
                )}
                <Button 
                  onClick={stopScanning}
                  variant="destructive"
                  className={isPaused ? '' : 'flex-1'}
                >
                  <X className="h-4 w-4 mr-2" />
                  Parar Scanner
                </Button>
              </>
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
                    <li>Após confirmar, o scanner pausa por 3 segundos</li>
                    <li>Clique em "Pronto para Próximo" ou aguarde reativar</li>
                  </ol>
                  <p className="text-blue-600 font-medium mt-2">
                    💡 O scanner pausa automaticamente após cada leitura para evitar duplicatas!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </CardContent>
    </Card>
  );
};
