
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
    <Card className="mb-6 border-amber-200 cursor-pointer" onClick={onShowPendingOnly}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Pagamentos Pendentes</h3>
                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                  {countPendente} {countPendente === 1 ? 'passageiro' : 'passageiros'}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Total pendente: R$ {totalPendente.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Ver Devedores
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
