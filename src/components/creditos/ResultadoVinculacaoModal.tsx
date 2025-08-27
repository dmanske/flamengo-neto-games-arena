import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';

interface ResultadoVinculacao {
  creditoUtilizado: number;
  valorViagem: number;
  valorPasseios?: number;
  sobra: number;
  falta: number;
  statusResultado: 'completo' | 'sobra' | 'falta';
  passageiro: string;
  viagem: string;
  novoSaldoCredito: number;
  passeiosSelecionados?: number;
  // Novos campos para maior clareza
  titularCredito?: string;
  beneficiario?: string;
  tipoPassageiro?: 'titular' | 'outro';
  viagemId?: string; // Adicionado para armazenar o ID da viagem
}

interface ResultadoVinculacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resultado: ResultadoVinculacao | null;
}

export function ResultadoVinculacaoModal({
  open,
  onOpenChange,
  resultado
}: ResultadoVinculacaoModalProps) {
  if (!resultado) return null;

  const getStatusIcon = () => {
    switch (resultado.statusResultado) {
      case 'completo':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'sobra':
        return <Info className="h-8 w-8 text-blue-600" />;
      case 'falta':
        return <AlertCircle className="h-8 w-8 text-orange-600" />;
      default:
        return <CheckCircle className="h-8 w-8 text-green-600" />;
    }
  };

  const getStatusColor = () => {
    switch (resultado.statusResultado) {
      case 'completo':
        return 'bg-green-50 border-green-200';
      case 'sobra':
        return 'bg-blue-50 border-blue-200';
      case 'falta':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  const getStatusMessage = () => {
    switch (resultado.statusResultado) {
      case 'completo':
        return {
          title: '✅ Pagamento Completo',
          message: 'O crédito cobriu exatamente o valor da viagem!'
        };
      case 'sobra':
        return {
          title: '💰 Crédito Utilizado com Sobra',
          message: `Sobrou ${formatCurrency(resultado.sobra)} no seu crédito`
        };
      case 'falta':
        return {
          title: '⚠️ Pagamento Parcial',
          message: `Ainda falta ${formatCurrency(resultado.falta)} para completar o pagamento`
        };
      default:
        return {
          title: '✅ Crédito Vinculado',
          message: 'Operação realizada com sucesso!'
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <DialogTitle className="text-lg">Resultado da Vinculação</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Crédito vinculado com sucesso
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Principal */}
          <Card className={`border-2 ${getStatusColor()}`}>
            <CardContent className="pt-4">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">{statusInfo.title}</h3>
                <p className="text-sm text-gray-600">{statusInfo.message}</p>
              </div>
            </CardContent>
          </Card>

          {/* Informações Essenciais */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">📋 Resumo da Operação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Titular:</span>
                  <div className="font-medium">{resultado.titularCredito || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-600">Beneficiário:</span>
                  <div className="font-medium">{resultado.beneficiario || resultado.passageiro}</div>
                </div>
                <div>
                  <span className="text-gray-600">Viagem:</span>
                  <div className="font-medium">{resultado.viagem}</div>
                </div>
                <div>
                  <span className="text-gray-600">Valor:</span>
                  <div className="font-medium text-blue-600">{formatCurrency(resultado.creditoUtilizado)}</div>
                </div>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Novo Saldo:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(resultado.novoSaldoCredito)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ✅ NOVO: Informações sobre como acessar depois */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <h4 className="font-medium text-blue-800 mb-3">💡 Como identificar depois?</h4>
              <div className="text-sm text-blue-700 space-y-2">
                <p>• <strong>Lista de Passageiros:</strong> Badge 💳 "Crédito" aparecerá junto ao status</p>
                <p>• <strong>Lista de Ônibus:</strong> Badge será exibido na busca do passageiro</p>
                <p>• <strong>Detalhes da Viagem:</strong> Botão 🔗 "Desvincular" para remover se necessário</p>
              </div>
            </CardContent>
          </Card>

          {/* Ações - SEMPRE VISÍVEIS */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="pt-4">
              <h4 className="font-medium text-gray-800 mb-3">🎯 O que fazer agora?</h4>
              <div className="flex flex-col gap-2">
                <Button 
                  variant="default" 
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    if (resultado.viagemId) {
                      window.open(`/dashboard/viagem/${resultado.viagemId}`, '_blank');
                    }
                  }}
                >
                  🚌 Ver Viagem e Passageiros
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  onClick={() => onOpenChange(false)}
                >
                  ✅ Fechar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Aviso sobre pagamento faltante */}
          {resultado.statusResultado === 'falta' && (
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="pt-4">
                <h4 className="font-medium text-orange-800 mb-2">⚠️ Ainda falta pagar</h4>
                <p className="text-sm text-orange-700 mb-3">
                  Falta <strong>{formatCurrency(resultado.falta)}</strong> para completar o pagamento.
                </p>
                <p className="text-xs text-orange-600">
                  💡 <strong>Dica:</strong> Vá para a viagem e registre o pagamento adicional na aba de passageiros.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Botão de Fechar */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}