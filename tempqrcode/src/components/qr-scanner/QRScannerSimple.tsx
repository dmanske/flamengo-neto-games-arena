import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, CameraOff, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { qrCodeService, type ConfirmationResult } from '@/services/qrCodeService';

interface QRScannerProps {
  viagemId: string;
  onibusId?: string;
  onScanSuccess?: (result: ConfirmationResult) => void;
  onScanError?: (error: string) => void;
}

export const QRScannerSimple: React.FC<QRScannerProps> = ({
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

  // Função para processar QR code usando uma biblioteca mais simples
  const processQRCode = async (imageData: ImageData) => {
    try {
      // Usar a biblioteca @zxing/library de forma mais simples
      const { BrowserQRCodeReader } = await import('@zxing/library');
      const codeReader = new BrowserQRCodeReader();
      
      // Criar canvas temporário para processar a imagem
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imageData.width;
      tempCanvas.height = imageData.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) return null;
      
      tempCtx.putImageData(imageData, 0, 0);
      
      // Tentar decodificar
      const result = await codeReader.decodeFromCanvas(tempCanvas);
      return result.getText();
    } catch (error) {
      // Não é um QR code válido ou erro de decodificação
      return null;
    }
  };

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setScanResult(null);
      
      // Solicitar acesso à câmera
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Tentar usar câmera traseira
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        
        // Iniciar loop de escaneamento
        const interval = setInterval(scanFrame, 500); // Escanear a cada 500ms
        setScanInterval(interval);
      }

    } catch (error) {
      console.error('❌ Erro ao acessar câmera:', error);
      toast.error('Erro ao acessar câmera. Verifique as permissões.');
      setIsScanning(false);
    }
  };

  const scanFrame = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    // Definir tamanho do canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Desenhar frame do vídeo no canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Obter dados da imagem
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    try {
      const qrText = await processQRCode(imageData);
      
      if (qrText && qrText !== lastScannedToken) {
        setLastScannedToken(qrText);
        setIsProcessing(true);
        
        await handleQRCodeDetected(qrText);
      }
    } catch (error) {
      // Ignorar erros de decodificação - é normal quando não há QR code
    }
  };

  const handleQRCodeDetected = async (qrText: string) => {
    try {
      console.log('📱 QR Code escaneado:', qrText);
      
      // Confirmar presença usando o token escaneado
      const confirmationResult = await qrCodeService.confirmPresence(
        qrText, 
        'qr_code_responsavel'
      );

      setScanResult(confirmationResult);

      if (confirmationResult.success) {
        toast.success(`✅ Presença confirmada: ${confirmationResult.data?.passageiro.nome}`);
        onScanSuccess?.(confirmationResult);
        
        // Parar scanning por 3 segundos para mostrar resultado
        setTimeout(() => {
          setLastScannedToken('');
          setScanResult(null);
          setIsProcessing(false);
        }, 3000);
      } else {
        toast.error(confirmationResult.message);
        onScanError?.(confirmationResult.message);
        
        // Resetar mais rápido em caso de erro
        setTimeout(() => {
          setLastScannedToken('');
          setScanResult(null);
          setIsProcessing(false);
        }, 2000);
      }

    } catch (scanError) {
      console.error('❌ Erro ao processar QR code:', scanError);
      toast.error('Erro ao processar QR code');
      onScanError?.('Erro ao processar QR code');
      
      setTimeout(() => {
        setLastScannedToken('');
        setScanResult(null);
        setIsProcessing(false);
      }, 2000);
    }
  };

  const stopScanning = () => {
    // Parar interval de escaneamento
    if (scanInterval) {
      clearInterval(scanInterval);
      setScanInterval(null);
    }

    // Parar stream de vídeo
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    // Limpar vídeo
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
    setScanResult(null);
    setLastScannedToken('');
    setIsProcessing(false);
  };

  const resetScanner = () => {
    stopScanning();
    setTimeout(() => {
      startScanning();
    }, 500);
  };

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

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
        {/* Área do vídeo */}
        <div className="relative">
          <video
            ref={videoRef}
            className={`w-full h-64 bg-black rounded-lg ${isScanning ? 'block' : 'hidden'}`}
            playsInline
            muted
            autoPlay
          />
          
          {/* Canvas oculto para processamento */}
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          
          {!isScanning && (
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Câmera desligada</p>
              </div>
            </div>
          )}

          {/* Overlay de resultado */}
          {scanResult && (
            <div className="absolute inset-0 bg-black bg-opacity-75 rounded-lg flex items-center justify-center">
              <div className="text-center text-white p-4">
                {scanResult.success ? (
                  <>
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                    <p className="font-semibold">Presença Confirmada!</p>
                    <p className="text-sm">{scanResult.data?.passageiro.nome}</p>
                  </>
                ) : (
                  <>
                    <XCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
                    <p className="font-semibold">Erro</p>
                    <p className="text-sm">{scanResult.message}</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Indicador de processamento */}
          {isProcessing && !scanResult && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-sm">Processando...</p>
              </div>
            </div>
          )}

          {/* Overlay de escaneamento */}
          {isScanning && !scanResult && !isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center justify-center gap-2">
          <Badge variant={isScanning ? "default" : "secondary"}>
            {isScanning ? "Escaneando" : "Parado"}
          </Badge>
          
          {isProcessing && (
            <Badge variant="outline">
              Processando...
            </Badge>
          )}
        </div>

        {/* Controles */}
        <div className="flex gap-2">
          {!isScanning ? (
            <Button onClick={startScanning} className="flex-1">
              <Camera className="h-4 w-4 mr-2" />
              Iniciar Scanner
            </Button>
          ) : (
            <>
              <Button onClick={stopScanning} variant="outline" className="flex-1">
                <CameraOff className="h-4 w-4 mr-2" />
                Parar
              </Button>
              
              <Button onClick={resetScanner} variant="outline" size="icon">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Instruções */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Posicione o QR code dentro da área tracejada</p>
          <p>• Mantenha o celular estável</p>
          <p>• Certifique-se de ter boa iluminação</p>
        </div>
      </CardContent>
    </Card>
  );
};