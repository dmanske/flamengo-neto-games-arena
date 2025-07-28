// Badge avançado com os 6 novos status de pagamento
// Task 20.1: Badges de status nos cards

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { STATUS_BADGES, type StatusPagamentoAvancado } from '@/types/pagamentos-separados';

interface StatusBadgeAvancadoProps {
  status: StatusPagamentoAvancado;
  showIcon?: boolean;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadgeAvancado({ 
  status, 
  showIcon = true, 
  showDescription = false,
  size = 'md'
}: StatusBadgeAvancadoProps) {
  const config = STATUS_BADGES[status];
  
  if (!config) {
    // Fallback para status antigos
    const fallbackColor = status === 'Pago' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : status === 'Pendente'
      ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
    
    return (
      <Badge className={fallbackColor}>
        {status}
      </Badge>
    );
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <Badge className={`${config.color} ${sizeClasses[size]} font-medium border`}>
        {showIcon && <span className="mr-1">{config.icon}</span>}
        {config.label}
      </Badge>
      {showDescription && (
        <span className="text-xs text-muted-foreground text-center">
          {config.description}
        </span>
      )}
    </div>
  );
}

// Componente para mostrar breakdown visual
interface BreakdownVisualProps {
  valorViagem: number;
  valorPasseios: number;
  pagoViagem: number;
  pagoPasseios: number;
  compact?: boolean;
}

export function BreakdownVisual({ 
  valorViagem, 
  valorPasseios, 
  pagoViagem, 
  pagoPasseios,
  compact = false 
}: BreakdownVisualProps) {
  const valorTotal = valorViagem + valorPasseios;
  const pagoTotal = pagoViagem + pagoPasseios;
  const pendenteViagem = Math.max(0, valorViagem - pagoViagem);
  const pendentePasseios = Math.max(0, valorPasseios - pagoPasseios);
  const pendenteTotal = pendenteViagem + pendentePasseios;
  
  const percentualPago = valorTotal > 0 ? (pagoTotal / valorTotal) * 100 : 0;

  if (compact) {
    return (
      <div className="flex flex-col gap-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total:</span>
          <span className="font-medium">R$ {valorTotal.toFixed(2)}</span>
        </div>
        {pagoTotal > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Pago:</span>
            <span>R$ {pagoTotal.toFixed(2)}</span>
          </div>
        )}
        {pendenteTotal > 0 && (
          <div className="flex justify-between text-orange-600">
            <span>Pendente:</span>
            <span>R$ {pendenteTotal.toFixed(2)}</span>
          </div>
        )}
        {/* Barra de progresso */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(percentualPago, 100)}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="font-medium">Breakdown Financeiro</span>
        <span className="text-sm text-muted-foreground">
          {percentualPago.toFixed(1)}% pago
        </span>
      </div>
      
      {/* Viagem */}
      {valorViagem > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-blue-700">🚌 Viagem:</span>
          <div className="text-right">
            <div>R$ {valorViagem.toFixed(2)}</div>
            {pagoViagem > 0 && (
              <div className="text-xs text-green-600">
                Pago: R$ {pagoViagem.toFixed(2)}
              </div>
            )}
            {pendenteViagem > 0 && (
              <div className="text-xs text-orange-600">
                Pendente: R$ {pendenteViagem.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Passeios */}
      {valorPasseios > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-purple-700">🗺️ Passeios:</span>
          <div className="text-right">
            <div>R$ {valorPasseios.toFixed(2)}</div>
            {pagoPasseios > 0 && (
              <div className="text-xs text-green-600">
                Pago: R$ {pagoPasseios.toFixed(2)}
              </div>
            )}
            {pendentePasseios > 0 && (
              <div className="text-xs text-orange-600">
                Pendente: R$ {pendentePasseios.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Total */}
      <div className="border-t pt-2 flex justify-between font-medium">
        <span>Total:</span>
        <span>R$ {valorTotal.toFixed(2)}</span>
      </div>
      
      {/* Barra de progresso */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(percentualPago, 100)}%` }}
        />
      </div>
    </div>
  );
}