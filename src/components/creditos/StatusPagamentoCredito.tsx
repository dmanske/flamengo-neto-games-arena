import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';

interface StatusPagamentoCreditoProps {
  valorTotal: number;
  saldoDisponivel: number;
  className?: string;
}

export function StatusPagamentoCredito({ 
  valorTotal, 
  saldoDisponivel, 
  className = "" 
}: StatusPagamentoCreditoProps) {
  const totalPago = valorTotal - saldoDisponivel;
  const percentualPago = valorTotal > 0 ? (totalPago / valorTotal) * 100 : 0;
  
  // Determinar status e cor
  let status = '';
  let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "outline";
  let badgeColor = '';
  
  if (saldoDisponivel <= 0) {
    status = 'Pago Completo';
    badgeVariant = 'default';
    badgeColor = 'bg-green-100 text-green-800 border-green-200';
  } else if (totalPago > 0) {
    status = 'Pagamento Parcial';
    badgeVariant = 'secondary';
    badgeColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
  } else {
    status = 'Não Pago';
    badgeVariant = 'outline';
    badgeColor = 'bg-red-100 text-red-800 border-red-200';
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <Badge variant={badgeVariant} className={badgeColor}>
        {status}
      </Badge>
      
      {totalPago > 0 && (
        <div className="text-xs text-muted-foreground">
          <div>Pago: {formatCurrency(totalPago)}</div>
          {saldoDisponivel > 0 && (
            <div>Restante: {formatCurrency(saldoDisponivel)}</div>
          )}
        </div>
      )}
      
      {/* Barra de progresso mini */}
      {totalPago > 0 && (
        <div className="w-full bg-muted rounded-full h-1">
          <div
            className="bg-primary h-1 rounded-full transition-all"
            style={{ width: `${Math.min(percentualPago, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}