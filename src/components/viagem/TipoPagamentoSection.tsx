import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import type { TipoPagamento } from '@/types/pagamento-avancado';

interface TipoPagamentoSectionProps {
  tipoPagamento: TipoPagamento;
  onTipoPagamentoChange: (tipo: TipoPagamento) => void;
  exigePagamentoCompleto: boolean;
  onExigePagamentoCompletoChange: (exige: boolean) => void;
  diasAntecedencia: number;
  onDiasAntecedenciaChange: (dias: number) => void;
  permiteViagemComPendencia: boolean;
  onPermiteViagemComPendenciaChange: (permite: boolean) => void;
}

export const TipoPagamentoSection: React.FC<TipoPagamentoSectionProps> = ({
  tipoPagamento,
  onTipoPagamentoChange,
  exigePagamentoCompleto,
  onExigePagamentoCompletoChange,
  diasAntecedencia,
  onDiasAntecedenciaChange,
  permiteViagemComPendencia,
  onPermiteViagemComPendenciaChange
}) => {
  const tiposInfo = {
    livre: {
      icon: DollarSign,
      title: 'Pagamento Livre',
      description: 'Cliente paga valores aleatórios quando quiser',
      color: 'bg-blue-50 border-blue-200',
      badge: 'bg-blue-100 text-blue-700',
      features: [
        'Pagamentos em valores e datas livres',
        'Controle por saldo devedor',
        'Relatório de inadimplência por tempo',
        'Não entra no fluxo de caixa projetado'
      ]
    },
    parcelado_flexivel: {
      icon: Calendar,
      title: 'Parcelamento Flexível',
      description: 'Parcelas sugeridas + aceita pagamentos extras',
      color: 'bg-green-50 border-green-200',
      badge: 'bg-green-100 text-green-700',
      features: [
        'Parcelas sugeridas como guia',
        'Aceita pagamentos fora das parcelas',
        'Recálculo automático de saldos',
        'Parcelas futuras no fluxo de caixa'
      ]
    },
    parcelado_obrigatorio: {
      icon: CreditCard,
      title: 'Parcelamento Obrigatório',
      description: 'Parcelas fixas e obrigatórias',
      color: 'bg-orange-50 border-orange-200',
      badge: 'bg-orange-100 text-orange-700',
      features: [
        'Parcelas fixas (não podem ser alteradas)',
        'Controle rigoroso de vencimentos',
        'Alertas automáticos de atraso',
        'Ideal para empresas estruturadas'
      ]
    }
  };

  const tipoAtual = tiposInfo[tipoPagamento];
  const IconComponent = tipoAtual.icon;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Configuração de Pagamento
        </CardTitle>
        <CardDescription>
          Defina como os pagamentos desta viagem serão controlados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seleção do Tipo */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Tipo de Pagamento</Label>
          <RadioGroup
            value={tipoPagamento}
            onValueChange={(value) => onTipoPagamentoChange(value as TipoPagamento)}
            className="space-y-3"
          >
            {Object.entries(tiposInfo).map(([key, info]) => {
              const Icon = info.icon;
              return (
                <div key={key} className="flex items-start space-x-3">
                  <RadioGroupItem value={key} id={key} className="mt-1" />
                  <div className="flex-1">
                    <Label 
                      htmlFor={key} 
                      className="flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Icon className="h-4 w-4" />
                      {info.title}
                      <Badge variant="secondary" className={info.badge}>
                        {key === 'livre' ? 'Simples' : key === 'parcelado_flexivel' ? 'Híbrido' : 'Estruturado'}
                      </Badge>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {info.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        {/* Detalhes do Tipo Selecionado */}
        <Card className={`${tipoAtual.color} border-2`}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <IconComponent className="h-5 w-5" />
              <h4 className="font-medium">{tipoAtual.title}</h4>
              <Badge className={tipoAtual.badge}>Selecionado</Badge>
            </div>
            <ul className="space-y-1 text-sm">
              {tipoAtual.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Configurações Específicas */}
        <div className="space-y-4 border-t pt-4">
          <Label className="text-base font-medium">Configurações Adicionais</Label>
          
          {/* Exige Pagamento Completo */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">
                Exigir pagamento completo antes da viagem
              </Label>
              <p className="text-xs text-muted-foreground">
                Se ativado, cliente deve estar 100% pago para viajar
              </p>
            </div>
            <Switch
              checked={exigePagamentoCompleto}
              onCheckedChange={onExigePagamentoCompletoChange}
            />
          </div>

          {/* Dias de Antecedência */}
          {exigePagamentoCompleto && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Dias de antecedência para pagamento
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={diasAntecedencia}
                  onChange={(e) => onDiasAntecedenciaChange(parseInt(e.target.value) || 5)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">
                  dias antes da viagem
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Cliente deve estar pago até {diasAntecedencia} dias antes da data do jogo
              </p>
            </div>
          )}

          {/* Permite Viagem com Pendência */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">
                Permitir viagem com pendências
              </Label>
              <p className="text-xs text-muted-foreground">
                Se desativado, bloqueia embarque de clientes com dívidas
              </p>
            </div>
            <Switch
              checked={permiteViagemComPendencia}
              onCheckedChange={onPermiteViagemComPendenciaChange}
            />
          </div>

          {/* Alerta de Configuração */}
          {!permiteViagemComPendencia && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Atenção</p>
                <p className="text-yellow-700">
                  Clientes com pendências serão bloqueados automaticamente. 
                  Certifique-se de ter um processo de cobrança eficiente.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};