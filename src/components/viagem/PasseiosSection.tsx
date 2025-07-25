import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { PasseiosPagosSection } from './PasseiosPagosSection';
import { PasseiosGratuitosSection } from './PasseiosGratuitosSection';
import { usePasseios } from '@/hooks/usePasseios';
import type { PasseiosSectionProps } from '@/types/passeio';

export const PasseiosSection: React.FC<PasseiosSectionProps> = ({ form, disabled = false }) => {
  const { loading, error, calcularTotal } = usePasseios();
  const [isExpanded, setIsExpanded] = useState(false);

  // Obter passeios selecionados do formulário
  const passeiosSelecionados = form.watch('passeios_selecionados') || [];
  const totalCustos = calcularTotal(passeiosSelecionados);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Passeios Inclusos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <MapPin className="h-5 w-5" />
            Passeios Inclusos
          </CardTitle>
          <CardDescription>
            Sistema de passeios em configuração. Use o campo "Outros Passeios" abaixo.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Passeios Inclusos
            </CardTitle>
            <CardDescription>
              Selecione os passeios disponíveis para esta viagem
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Recolher
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Expandir
              </>
            )}
          </Button>
        </div>
        
        {totalCustos > 0 && (
          <div className="flex items-center gap-2 mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <Calculator className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">
              Total de custos adicionais:
            </span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300">
              R$ {totalCustos.toFixed(2).replace('.', ',')}
            </Badge>
          </div>
        )}
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          <PasseiosPagosSection form={form} disabled={disabled} />
          
          <Separator />
          
          <PasseiosGratuitosSection form={form} disabled={disabled} />
        </CardContent>
      )}
    </Card>
  );
};