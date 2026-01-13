import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, CameraOff, CheckCircle, XCircle, RotateCcw, AlertCircle } from 'lucide-react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [lastScannedToken, setLastScannedToken] = useState<string>('');
  const [scanResult, setScanResult] = useState<ConfirmationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanInterval, setScanInterval] = useState<NodeJS.Timeout | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setScanResult(null);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      setStream(mediaStream);
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        
        const interval = setInterval(scanFrame, 500);
        setScanInterval(interval);
      }

      toast.success('Câmera ativada!', {
        description: '📷 Aponte para o QR code do passageiro',
        duration: 3000,
      });

    } catch (error) {
      console.error('❌ Erro ao acessar câmera:', error);
      setHasPermission(false);
      toast.error('Erro de câmera', {
        description: '📷 Não foi possível acessar a câmera. Verifique as permissões.',
        duration: 5000,
      });
      setIsScanning(false);
    }
  };

  const processQRCode = async (imageData: ImageData): Promise<string | null> => {
    try {
      const { BrowserQRCodeReader } = await import('@zxing/library');
      const codeReader = new BrowserQRCodeReader();
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imageData.width;
      tempCanvas.height = imageData.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) return null;
      
      tempCtx.putImageData(imageData, 0, 0);
      
      const dataUrl = tempCanvas.toDataURL();
      const img = new Image();
      
      return new Promise((resolve) => {
        img.onload = async () => {
          try {
            const result = await codeReader.decodeFromImageElement(img);
            resolve(result.getText());
          } catch {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = dataUrl;
      });
    } catch {
      return null;
    }
  };

  const scanFrame = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    try {
      const qrText = await processQRCode(imageData);
      
      if (qrText && qrText !== lastScannedToken) {
        setLastScannedToken(qrText);
        setIsProcessing(true);
        
        await handleQRCodeDetected(qrText);
      }
    } catch {
      // Ignorar erros de decodificação
    }
  };

  const handleQRCodeDetected = async (qrText: string) => {
    try {
      console.log('📱 QR Code escaneado:', qrText);
      
      const confirmationResult = await qrCodeService.confirmPresence(
        qrText, 
        onibusId ? 'qr_code_responsavel' : 'qr_code',
        onibusId
      );

      setScanResult(confirmationResult);

      if (confirmationResult.success) {
        toast.success('🎉 Presença confirmada!', {
          description: `${confirmationResult.data?.passageiro.nome} foi registrado como presente.`,
          duration: 4000,
        });
        onScanSuccess?.(confirmationResult);
        
        setTimeout(() => {
          setLastScannedToken('');
          setScanResult(null);
          setIsProcessing(false);
        }, 3000);
      } else {
        toast.error('Erro na confirmação', {
          description: confirmationResult.message,
          duration: 5000,
        });
        onScanError?.(confirmationResult.message);
        
        setTimeout(() => {
          setLastScannedToken('');
          setScanResult(null);
          setIsProcessing(false);
        }, 3000);
      }

    } catch (scanError) {
      console.error('❌ Erro ao processar QR code:', scanError);
      toast.error('Erro no processamento', {
        description: '🔧 Não foi possível processar o QR code.',
        duration: 4000,
      });
      onScanError?.('Erro ao processar QR code');
      
      setTimeout(() => {
        setLastScannedToken('');
        setScanResult(null);
        setIsProcessing(false);
      }, 3000);
    }
  };

  const stopScanning = () => {
    if (scanInterval) {
      clearInterval(scanInterval);
      setScanInterval(null);
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
    setScanResult(null);
    setLastScannedToken('');
    setIsProcessing(false);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const resetScanner = () => {
    stopScanning();
    setTimeout(() => {
      startScanning();
    }, 500);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Scanner QR Code
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Aponte a câmera para o QR code do passageiro
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Área do vídeo com design moderno */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800">
          <video
            ref={videoRef}
            className={`w-full h-80 object-cover ${isScanning ? 'block' : 'hidden'}`}
            playsInline
            muted
            autoPlay
          />
          
          {/* Canvas oculto para processamento */}
          <canvas ref={canvasRef} className="hidden" />
          
          {!isScanning && (
            <div className="w-full h-80 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <div className="text-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Camera className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <p className="text-gray-600 font-medium">Câmera desligada</p>
                <p className="text-gray-500 text-sm mt-1">Clique em "Iniciar Scanner" para ativar</p>
              </div>
            </div>
          )}

          {/* Overlay de escaneamento com design moderno */}
          {isScanning && !scanResult && !isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Área de foco do QR Code */}
              <div className="relative">
                <div className="w-64 h-64 border-4 border-white rounded-2xl shadow-2xl bg-white/10 backdrop-blur-sm">
                  {/* Cantos animados */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-2xl animate-pulse"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-2xl animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-2xl animate-pulse"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-2xl animate-pulse"></div>
                  
                  {/* Linha de escaneamento */}
                  <div className="absolute inset-x-4 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
                  
                  {/* Texto de instrução */}
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                    Posicione o QR Code aqui
                  </div>
                </div>
              </div>
              
              {/* Overlay escuro nas bordas */}
              <div className="absolute inset-0 bg-black/40 pointer-events-none">
                <div className="absolute inset-0" style={{
                  background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.7) 70%)'
                }}></div>
              </div>
            </div>
          )}

          {/* Overlay de resultado com animação */}
          {scanResult && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div className="text-center text-white p-6 bg-white/10 rounded-2xl border border-white/20 shadow-2xl">
                {scanResult.success ? (
                  <>
                    <div className="relative mb-4">
                      <CheckCircle className="h-16 w-16 text-green-400 mx-auto animate-bounce" />
                      <div className="absolute inset-0 h-16 w-16 mx-auto rounded-full bg-green-400/20 animate-ping"></div>
                    </div>
                    <p className="font-bold text-lg mb-2">✅ Presença Confirmada!</p>
                    <p className="text-green-300 font-medium">{scanResult.data?.passageiro.nome}</p>
                    <div className="mt-3 px-3 py-1 bg-green-500/20 rounded-full text-xs text-green-300">
                      Confirmação realizada com sucesso
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative mb-4">
                      <XCircle className="h-16 w-16 text-red-400 mx-auto animate-pulse" />
                      <div className="absolute inset-0 h-16 w-16 mx-auto rounded-full bg-red-400/20 animate-ping"></div>
                    </div>
                    <p className="font-bold text-lg mb-2">❌ Erro na Confirmação</p>
                    <p className="text-red-300 text-sm">{scanResult.message}</p>
                    <div className="mt-3 px-3 py-1 bg-red-500/20 rounded-full text-xs text-red-300">
                      Tente novamente
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Indicador de processamento */}
          {isProcessing && !scanResult && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div className="text-center text-white p-6 bg-white/10 rounded-2xl border border-white/20">
                <div className="relative mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white mx-auto"></div>
                  <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-pulse"></div>
                </div>
                <p className="font-medium">🔍 Processando QR Code...</p>
                <div className="mt-2 w-32 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <Badge 
              variant={isScanning ? "default" : "secondary"}
              className={`${isScanning ? 'bg-green-500 hover:bg-green-600' : ''}`}
            >
              {isScanning ? "🔍 Escaneando" : "⏸️ Parado"}
            </Badge>
          </div>
          
          {isProcessing && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              ⚡ Processando...
            </Badge>
          )}
        </div>

        {/* Controles */}
        <div className="flex gap-3">
          {!isScanning ? (
            <Button 
              onClick={startScanning} 
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
            >
              <Camera className="h-4 w-4 mr-2" />
              🚀 Iniciar Scanner
            </Button>
          ) : (
            <>
              <Button 
                onClick={stopScanning} 
                variant="outline" 
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              >
                <CameraOff className="h-4 w-4 mr-2" />
                ⏹️ Parar Scanner
              </Button>
              
              <Button 
                onClick={resetScanner} 
                variant="outline" 
                size="icon"
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                title="Reiniciar Scanner"
              >
                <RotateCcw className="h-4 w-4" />
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
                    Para usar o scanner, permita o acesso à câmera nas configurações do navegador.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instruções */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            💡 Como usar o scanner:
          </h4>
          <div className="text-sm text-blue-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span>Posicione o QR code dentro da área destacada</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span>Mantenha o dispositivo estável e bem iluminado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span>Aguarde a confirmação automática</span>
            </div>
          </div>
          
          <div className="mt-3 p-2 bg-white/50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 font-medium flex items-center gap-1">
              ⚡ <strong>Dica:</strong> O scanner funciona automaticamente - não precisa tirar foto!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
