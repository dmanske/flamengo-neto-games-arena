import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { testarConfiguracaoZAPI } from '@/services/whatsappService';

export const TesteZAPI: React.FC = () => {
  const [testando, setTestando] = useState(false);
  const [resultado, setResultado] = useState<any>(null);

  const testarConfiguracao = async () => {
    setTestando(true);
    setResultado(null);

    try {
      const resultado = await testarConfiguracaoZAPI();
      
      if (resultado.sucesso) {
        setResultado({ sucesso: true, data: 'Configuração OK' });
        toast.success('✅ Configuração OK! Z-API está funcionando');
      } else {
        setResultado({ sucesso: false, erro: resultado.erro });
        toast.error('❌ Erro na configuração');
      }

    } catch (error) {
      setResultado({ sucesso: false, erro: error instanceof Error ? error.message : 'Erro desconhecido' });
      toast.error('❌ Erro ao testar configuração');
    } finally {
      setTestando(false);
    }
  };

  return (
    <Card className="p-4 mb-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="font-medium">🧪 Teste de Configuração Z-API</h5>
          <Button
            onClick={testarConfiguracao}
            disabled={testando}
            size="sm"
            variant="outline"
          >
            {testando ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                Testando...
              </>
            ) : (
              <>
                <Settings className="h-3 w-3 mr-2" />
                Testar Configuração
              </>
            )}
          </Button>
        </div>

        {resultado && (
          <Alert className={resultado.sucesso ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {resultado.sucesso ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={`text-sm ${resultado.sucesso ? 'text-green-800' : 'text-red-800'}`}>
              {resultado.sucesso ? (
                <div>
                  <strong>✅ Configuração funcionando!</strong>
                  <br />
                  API respondeu corretamente. Você pode usar o envio automático.
                </div>
              ) : (
                <div>
                  <strong>❌ Erro na configuração:</strong>
                  <br />
                  {resultado.erro}
                  <br />
                  <small>Verifique as variáveis ZAPI_INSTANCE e ZAPI_TOKEN no arquivo .env</small>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <strong>💡 Dica:</strong> Este teste usa simulação (não gasta créditos). 
          Se der OK, você pode usar Z-API real para envio automático.
        </div>
      </div>
    </Card>
  );
};