import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PendingPaymentsCardProps {
  totalPendente: number;
  countPendente: number;
  onShowPendingOnly: () => void;
}

export function PendingPaymentsCard({ totalPendente, countPendente, onShowPendingOnly }: PendingPaymentsCardProps) {
  if (countPendente === 0) {
    return null;
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-amber-200 via-orange-300 to-orange-400 border-none shadow-md rounded-xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/30 rounded-full flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">Pagamentos Pendentes</h3>
                <Badge variant="outline" className="bg-white/80 text-gray-900 border-white/60">
                  {countPendente} {countPendente === 1 ? 'passageiro' : 'passageiros'}
                </Badge>
              </div>
              <p className="text-gray-900 text-sm">
                Total pendente: R$ {totalPendente.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-orange-700 border-orange-400 shadow-none hover:bg-gray-100 hover:text-orange-800"
            onClick={onShowPendingOnly}
          >
            Ver Devedores
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
