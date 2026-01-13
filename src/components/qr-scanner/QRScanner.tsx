import React, { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
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
  const [isScanning, setIsScanning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [lastScannedToken, setLastScannedToken] = useState<string>('');
  const [lastScannedName, setLastScannedName] = useState<string>('');
  const [countdown, setCountdown] = useState(0);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false); // Proteção extra
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPausedRef = useRef(false); // Ref para acesso síncrono

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
      await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      setHasPermission(true);
      setIsScanning(true);
      setScanResult(null);

      // Inicializar leitor de QR code
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      // Iniciar scan com controle local de token
      if (videoRef.current) {
        let localLastToken = '';
        
        codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          async (result) => {
            if (result) {
              const token = result.getText();
              
              // PROTEÇÃO 1: Verificar ref síncrona (mais confiável que state)
              if (isPausedRef.current) {
                console.log('🛑 BLOQUEADO: Scanner pausado (ref), ignorando:', token);
                return;
              }
              
              // PROTEÇÃO 2: Evitar processar o mesmo token múltiplas vezes
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
        description: '📷 Aponte para o QR code do passageiro',
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
    setScanResult(null);
    setErrorMessage('');
    isPausedRef.current = false; // Resetar ref
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  };

  const pauseScanning = (passageiroNome: string, isSuccess: boolean, error?: string) => {
    console.log('⏸️ PAUSANDO SCANNER - Parando completamente');
    
    // PROTEÇÃO: Marcar como pausado IMEDIATAMENTE (ref é síncrona)
    isPausedRef.current = true;
    setIsPaused(true);
    setIsProcessing(false);
    
    // PARAR O SCANNER COMPLETAMENTE - isso impede novos scans
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
      console.log('✅ Scanner parado e resetado');
    }
    setLastScannedName(passageiroNome);
    setScanResult(isSuccess ? 'success' : 'error');
    setErrorMessage(error || '');
    setCountdown(isSuccess ? 2.0 : 3.0); // 2s para sucesso, 3s para erro

    // Iniciar contagem regressiva
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0.1) {
          // Reativar scanner automaticamente
          resumeScanning();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
  };

  const resumeScanning = async () => {
    console.log('▶️ RETOMANDO SCANNER - Reiniciando leitura');
    
    // PRIMEIRO: Parar o countdown imediatamente
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    // SEGUNDO: Limpar estados
    isPausedRef.current = false; // Liberar ref primeiro
    setIsPaused(false);
    setLastScannedToken('');
    setLastScannedName('');
    setCountdown(0);
    setScanResult(null);
    setErrorMessage('');
    setIsProcessing(false);

    // TERCEIRO: Aguardar um tick para garantir que os estados foram atualizados
    await new Promise(resolve => setTimeout(resolve, 50));

    // QUARTO: REINICIAR O SCANNER
    try {
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      if (videoRef.current) {
        let localLastToken = '';
        
        await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          async (result) => {
            if (result) {
              const token = result.getText();
              
              // PROTEÇÃO: Verificar ref síncrona
              if (isPausedRef.current) {
                console.log('🛑 BLOQUEADO: Scanner pausado (ref), ignorando:', token);
                return;
              }
              
              if (token === localLastToken) {
                return;
              }

              localLastToken = token;
              setLastScannedToken(token);
              await handleScan(token);
            }
          }
        );
        console.log('✅ Scanner reiniciado com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro ao reiniciar scanner:', error);
      toast.error('Erro ao reiniciar scanner');
    }
  };

  const handleScan = async (token: string) => {
    // PROTEÇÃO 1: Verificar ref síncrona (mais confiável)
    if (isPausedRef.current) {
      console.log('🛑 BLOQUEADO em handleScan: Scanner pausado (ref)');
      return;
    }
    
    // PROTEÇÃO 2: Verificar state
    if (isPaused) {
      console.log('🛑 BLOQUEADO em handleScan: Scanner pausado (state)');
      return;
    }
    
    // PROTEÇÃO 3: Verificar se já está processando
    if (isProcessing) {
      console.log('🛑 BLOQUEADO em handleScan: Já processando outro QR');
      return;
    }
    
    // Marcar como processando IMEDIATAMENTE
    setIsProcessing(true);
    isPausedRef.current = true; // Bloquear novos scans durante processamento

    try {
      console.log('📱 QR Code detectado:', token);

      const result = await qrCodeService.confirmPresence(
        token, 
        onibusId ? 'qr_code_responsavel' : 'qr_code',
        onibusId
      );

      if (result.success) {
        // Pausar scanner imediatamente com sucesso
        pauseScanning(result.data?.passageiro.nome || 'Passageiro', true);

        toast.success('🎉 Presença confirmada!', {
          description: `${result.data?.passageiro.nome} foi registrado como presente`,
          duration: 4000,
        });

        onScanSuccess?.(result);

      } else {
        // Pausar scanner com erro
        pauseScanning('Erro', false, result.message);
        
        toast.error('❌ Erro na confirmação', {
          description: result.message,
          duration: 5000,
        });

        onScanError?.(result.message);
      }

    } catch (error) {
      console.error('❌ Erro ao processar QR code:', error);
      
      pauseScanning('Erro', false, 'Não foi possível processar o QR code');
      
      toast.error('Erro ao processar', {
        description: 'Não foi possível confirmar a presença',
        duration: 4000,
      });

      onScanError?.('Erro ao processar QR code');
    }
  };

  const resetScanner = () => {
    stopScanning();
    setTimeout(() => {
      startScanning();
    }, 300);
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
        {/* Área do vídeo */}
        <div className="relative overflow-hidden rounded-xl bg-black">
          <video
            ref={videoRef}
            className="w-full h-80 object-cover"
            playsInline
            muted
          />
          
          {/* Overlay quando câmera desligada */}
          {!isScanning && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
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

          {/* Overlay de escaneamento ativo - SEM blur */}
          {isScanning && !isPaused && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Área de foco do QR Code */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-64 h-64 border-4 border-white/80 rounded-2xl">
                    {/* Cantos animados */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-2xl animate-pulse"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-2xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-2xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-2xl animate-pulse"></div>
                    
                    {/* Linha de escaneamento */}
                    <div className="absolute inset-x-4 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
                  </div>
                  
                  {/* Texto de instrução */}
                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-white text-sm font-medium bg-black/60 px-3 py-1 rounded-full whitespace-nowrap">
                    Posicione o QR Code aqui
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Overlay quando PAUSADO - BLOQUEIA completamente */}
          {isScanning && isPaused && (
            <div className={`absolute inset-0 flex items-center justify-center ${
              scanResult === 'success' ? 'bg-green-500/95' : 'bg-red-500/95'
            }`}>
              <div className="text-center text-white p-6">
                {scanResult === 'success' ? (
                  <>
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 animate-bounce" />
                    <p className="text-xl font-bold mb-2">✅ {lastScannedName}</p>
                    <p className="text-lg mb-4">Presença confirmada!</p>
                  </>
                ) : (
                  <>
                    <XCircle className="h-16 w-16 mx-auto mb-4 animate-pulse" />
                    <p className="text-xl font-bold mb-2">❌ Erro na Confirmação</p>
                    <p className="text-sm mb-4 opacity-90">{errorMessage}</p>
                  </>
                )}
                
                <div className="text-5xl font-bold mb-2">{countdown.toFixed(1)}</div>
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
        </div>

        {/* Status */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              isScanning 
                ? isPaused 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500 animate-pulse' 
                : 'bg-gray-400'
            }`}></div>
            <Badge 
              variant={isScanning ? "default" : "secondary"}
              className={`${
                isScanning 
                  ? isPaused 
                    ? 'bg-yellow-500 hover:bg-yellow-600' 
                    : 'bg-green-500 hover:bg-green-600' 
                  : ''
              }`}
            >
              {isScanning 
                ? isPaused 
                  ? "⏸️ Pausado" 
                  : "🔍 Escaneando" 
                : "⏹️ Parado"
              }
            </Badge>
          </div>
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
              {isPaused ? (
                <Button 
                  onClick={resumeScanning}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  ▶️ Próximo ({countdown.toFixed(1)}s)
                </Button>
              ) : (
                <Button 
                  onClick={stopScanning} 
                  variant="outline" 
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <CameraOff className="h-4 w-4 mr-2" />
                  ⏹️ Parar Scanner
                </Button>
              )}
              
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
              ⚡ <strong>Proteção:</strong> O scanner pausa automaticamente após cada leitura!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
