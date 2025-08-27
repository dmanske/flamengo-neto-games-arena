// Badge para identificar passageiros vindos do sistema de créditos
// Mostra informações sobre como o pagamento foi feito via crédito

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Users, AlertCircle } from 'lucide-react';

export type TipoCreditoBadge = 
  | 'credito_completo'      // 100% pago por crédito
  | 'credito_parcial'       // Crédito + pagamento adicional
  | 'credito_multiplo'      // Múltiplos passageiros no mesmo crédito
  | 'credito_insuficiente'; // Crédito não cobriu tudo

interface CreditoBadgeProps {
  tipo: TipoCreditoBadge;
  valorCredito?: number;
  valorTotal?: number;
  quantidadePassageiros?: number;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
}

const CREDITO_CONFIGS = {
  credito_completo: {
    icon: <CreditCard className="h-3 w-3" />,
    label: 'Crédito',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    tooltip: 'Pago 100% por crédito pré-pago'
  },
  credito_parcial: {
    icon: <CreditCard className="h-3 w-3" />,
    label: 'Crédito +',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    tooltip: 'Pago parcialmente por crédito + pagamento adicional'
  },
  credito_multiplo: {
    icon: <Users className="h-3 w-3" />,
    label: 'Crédito Grupo',
    color: 'bg-green-100 text-green-800 border-green-200',
    tooltip: 'Múltiplos passageiros pagos pelo mesmo crédito'
  },
  credito_insuficiente: {
    icon: <AlertCircle className="h-3 w-3" />,
    label: 'Crédito Parcial',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    tooltip: 'Crédito não foi suficiente - valor pendente'
  }
};

export function CreditoBadge({ 
  tipo, 
  valorCredito, 
  valorTotal, 
  quantidadePassageiros,
  size = 'sm',
  showTooltip = true 
}: CreditoBadgeProps) {
  const config = CREDITO_CONFIGS[tipo];
  
  if (!config) return null;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1'
  };

  // Construir tooltip dinâmico
  let tooltipText = config.tooltip;
  
  if (valorCredito && valorTotal) {
    const percentual = Math.round((valorCredito / valorTotal) * 100);
    tooltipText += ` (${percentual}% do valor total)`;
  }
  
  if (quantidadePassageiros && quantidadePassageiros > 1) {
    tooltipText += ` - ${quantidadePassageiros} passageiros`;
  }

  return (
    <Badge 
      className={`${config.color} ${sizeClasses[size]} font-medium border flex items-center gap-1`}
      title={showTooltip ? tooltipText : undefined}
    >
      {config.icon}
      <span>{config.label}</span>
    </Badge>
  );
}

// Hook para determinar o tipo de badge baseado nos dados do passageiro
export function useCreditoBadgeType(passageiro: any) {
  // Verificação de segurança
  if (!passageiro) {
    return null;
  }

  // Se não foi pago por crédito, não mostra badge
  if (!passageiro.pago_por_credito || !passageiro.credito_origem_id) {
    return null;
  }

  const valorCredito = passageiro.valor_credito_utilizado || 0;
  const valorTotal = (passageiro.valor || 0) - (passageiro.desconto || 0);
  
  // Calcular valor dos passeios se houver
  const valorPasseios = passageiro.passageiro_passeios?.reduce((sum: number, pp: any) => {
    return sum + (pp.valor_cobrado || 0);
  }, 0) || 0;
  
  const valorTotalComPasseios = valorTotal + valorPasseios;
  
  // Determinar tipo do badge
  if (valorCredito >= valorTotalComPasseios) {
    return {
      tipo: 'credito_completo' as TipoCreditoBadge,
      valorCredito,
      valorTotal: valorTotalComPasseios
    };
  } else if (valorCredito > 0 && valorCredito < valorTotalComPasseios) {
    return {
      tipo: 'credito_parcial' as TipoCreditoBadge,
      valorCredito,
      valorTotal: valorTotalComPasseios
    };
  } else {
    return {
      tipo: 'credito_insuficiente' as TipoCreditoBadge,
      valorCredito,
      valorTotal: valorTotalComPasseios
    };
  }
}