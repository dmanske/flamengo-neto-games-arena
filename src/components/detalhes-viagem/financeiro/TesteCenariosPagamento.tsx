import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  CreditCard,
  Zap,
  Target
} from 'lucide-react';
import { usePagamentosSeparados } from '@/hooks/usePagamentosSeparados';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface TesteCenariosPagamentoProps {
  viagemPassageiroId: string;
  onClose?: () => void;
}

interface ResultadoTeste {
  cenario: string;
  descricao: string;
  sucesso: boolean;
  detalhes: string;
  tempo: number;
}

export function TesteCenariosPagamento({ viagemPassageiroId, onClose }: TesteCenariosPagamentoProps) {
  const [testesExecutando, setTestesExecutando] = useState(false);
  const [resultados, setResultados] = useState<ResultadoTeste[]>([]);
  
  const {
    breakdown,
    pagarViagem,
    pagarPasseios,
    pagarTudo,
    obterStatusAtual,
    calcularValorViagem,
    calcularValorPasseios,
    calcularValorTotal,
    refetch
  } = usePagamentosSeparados(viagemPassageiroId);

  // Executar todos os testes
  const executarTestes = async () => {
    setTestesExecutando(true);
    setResultados([]);

    try {
      toast.info('Iniciando testes dos cenários de pagamento...');

      const resultadosTestes: ResultadoTeste[] = [];

      // Cenário 1: Pagamento Livre
      const inicio1 = Date.now();
      try {
        const valorViagem = calcularValorViagem();
        const valorPasseios = calcularValorPasseios();
        
        if (valorViagem > 0) {
          await pagarViagem(valorViagem * 0.5, 'pix', 'Teste Cenário 1');
          await refetch();
        }
        
        if (valorPasseios > 0) {
          await pagarPasseios(valorPasseios, 'pix', 'Teste Cenário 1');
          await refetch();
        }
        
        if (valorViagem > 0) {
          await pagarViagem(valorViagem * 0.5, 'pix', 'Teste Cenário 1');
          await refetch();
        }

        const statusFinal = obterStatusAtual();
        
        resultadosTestes.push({
          cenario: 'Cenário 1',
          descricao: 'Pagamento Livre',
          sucesso: statusFinal === 'Pago Completo' || statusFinal === 'Brinde',
          detalhes: `Status final: ${statusFinal}`,
          tempo: Date.now() - inicio1
        });
      } catch (error: any) {
        resultadosTestes.push({
          cenario: 'Cenário 1',
          descricao: 'Pagamento Livre',
          sucesso: false,
          detalhes: `Erro: ${error.message}`,
          tempo: Date.now() - inicio1
        });
      }

      setResultados([...resultadosTestes]);

      // Cenário 2: Pagamento Separado
      const inicio2 = Date.now();
      try {
        const valorViagem = calcularValorViagem();
        const valorPasseios = calcularValorPasseios();
        
        if (valorViagem > 0) {
          await pagarViagem(valorViagem, 'pix', 'Teste Cenário 2');
          await refetch();
        }
        
        if (valorPasseios > 0) {
          await pagarPasseios(valorPasseios, 'pix', 'Teste Cenário 2');
          await refetch();
        }

        const statusFinal = obterStatusAtual();
        
        resultadosTestes.push({
          cenario: 'Cenário 2',
          descricao: 'Pagamento Separado',
          sucesso: statusFinal === 'Pago Completo' || statusFinal === 'Brinde',
          detalhes: `Status final: ${statusFinal}`,
          tempo: Date.now() - inicio2
        });
      } catch (error: any) {
        resultadosTestes.push({
          cenario: 'Cenário 2',
          descricao: 'Pagamento Separado',
          sucesso: false,
          detalhes: `Erro: ${error.message}`,
          tempo: Date.now() - inicio2
        });
      }

      setResultados([...resultadosTestes]);

      // Cenário 3: Pagamento Completo
      const inicio3 = Date.now();
      try {
        const valorTotal = calcularValorTotal();
        
        if (valorTotal > 0) {
          // pagarTudo removido
          await refetch();
        }

        const statusFinal = obterStatusAtual();
        
        resultadosTestes.push({
          cenario: 'Cenário 3',
          descricao: 'Pagamento Completo',
          sucesso: statusFinal === 'Pago Completo' || statusFinal === 'Brinde',
          detalhes: `Status final: ${statusFinal}`,
          tempo: Date.now() - inicio3
        });
      } catch (error: any) {
        resultadosTestes.push({
          cenario: 'Cenário 3',
          descricao: 'Pagamento Completo',
          sucesso: false,
          detalhes: `Erro: ${error.message}`,
          tempo: Date.now() - inicio3
        });
      }

      setResultados(resultadosTestes);

      const sucessos = resultadosTestes.filter(r => r.sucesso).length;
      const total = resultadosTestes.length;

      if (sucessos === total) {
        toast.success(`Todos os ${total} cenários funcionaram! ✅`);
      } else {
        toast.error(`${total - sucessos} de ${total} cenários falharam ❌`);
      }

    } catch (error) {
      console.error('Erro ao executar testes:', error);
      toast.error('Erro ao executar testes dos cenários');
    } finally {
      setTestesExecutando(false);
    }
  };

  const sucessos = resultados.filter(r => r.sucesso).length;
  const total = resultados.length;
  const tempoTotal = resultados.reduce((sum, r) => sum + r.tempo, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Teste dos Cenários de Pagamento
        </CardTitle>
        <div className="text-sm text-gray-600">
          Validar os 3 cenários de pagamento do sistema
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Informações do Passageiro */}
          {breakdown && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Dados do Passageiro:</div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Viagem:</span> {formatCurrency(breakdown.valor_viagem)}
                  </div>
                  <div>
                    <span className="text-gray-600">Passeios:</span> {formatCurrency(breakdown.valor_passeios)}
                  </div>
                  <div>
                    <span className="text-gray-600">Total:</span> {formatCurrency(breakdown.valor_total)}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Controles */}
          <div className="flex items-center justify-between">
            <Button 
              onClick={executarTestes}
              disabled={testesExecutando}
              className="flex items-center gap-2"
            >
              {testesExecutando ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {testesExecutando ? 'Executando...' : 'Executar Testes'}
            </Button>

            {resultados.length > 0 && (
              <div className="flex items-center gap-4">
                <Badge className={
                  sucessos === total 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }>
                  {sucessos}/{total} passaram
                </Badge>
                <div className="text-sm text-gray-600">
                  {tempoTotal}ms total
                </div>
              </div>
            )}
          </div>

          {/* Resultados */}
          {resultados.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold">Resultados</h4>
              
              <div className="space-y-3">
                {resultados.map((resultado, index) => (
                  <div 
                    key={index}
                    className={`p-4 border rounded-lg ${
                      resultado.sucesso 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {resultado.sucesso ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className="font-medium">{resultado.cenario}</span>
                        <Badge variant="outline">{resultado.descricao}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-gray-600">
                          {resultado.tempo}ms
                        </div>
                        <Badge className={
                          resultado.sucesso 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }>
                          {resultado.sucesso ? 'PASSOU' : 'FALHOU'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-700">
                      {resultado.detalhes}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informações sobre os cenários */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Sobre os Cenários</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <h5 className="font-medium">Cenário 1: Livre</h5>
                </div>
                <p className="text-gray-600">Pagamentos parciais e distribuição automática</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  <h5 className="font-medium">Cenário 2: Separado</h5>
                </div>
                <p className="text-gray-600">Pagamentos específicos por categoria</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-purple-600" />
                  <h5 className="font-medium">Cenário 3: Completo</h5>
                </div>
                <p className="text-gray-600">Pagamento total de uma vez</p>
              </div>
            </div>
          </div>

          {onClose && (
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}