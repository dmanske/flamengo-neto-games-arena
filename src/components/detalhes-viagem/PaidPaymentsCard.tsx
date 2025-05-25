import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaidPaymentsCardProps {
  totalPago: number;
  countPago: number;
  onShowPaidOnly: () => void;
}

export function PaidPaymentsCard({ totalPago, countPago, onShowPaidOnly }: PaidPaymentsCardProps) {
  if (countPago === 0) {
    return null;
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-green-300 via-green-400 to-green-500 border-none shadow-md rounded-xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">Pagamentos Confirmados</h3>
                <Badge variant="outline" className="bg-white/80 text-gray-900 border-white/60">
                  {countPago} {countPago === 1 ? 'passageiro' : 'passageiros'}
                </Badge>
              </div>
              <p className="text-gray-900 text-sm">
                Total pago: R$ {totalPago.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-green-700 border-green-400 shadow-none hover:bg-gray-100 hover:text-green-800"
            onClick={onShowPaidOnly}
          >
            Ver Pagos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 