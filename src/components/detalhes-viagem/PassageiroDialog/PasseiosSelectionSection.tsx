import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MapPin, DollarSign, Gift, Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { usePasseios } from '@/hooks/usePasseios';
import type { FormData } from './formSchema';
import type { UseFormReturn } from 'react-hook-form';

interface PasseiosSelectionSectionProps {
  form: UseFormReturn<FormData>;
  disabled?: boolean;
}

export const PasseiosSelectionSection: React.FC<PasseiosSelectionSectionProps> = ({ 
  form, 
  disabled = false 
}) => {
  const { passeiosPagos, passeiosGratuitos, loading, error, calcularTotal } = usePasseios();
  const [isExpanded, setIsExpanded] = useState(false);

  // Obter passeios selecionados do formulário
  const passeiosSelecionados = form.watch('passeios_selecionados') || [];
  const totalPasseios = calcularTotal(passeiosSelecionados);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Passeios Opcionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
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
            Passeios Opcionais
          </CardTitle>
          <CardDescription>
            Sistema de passeios em configuração.
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
              Passeios Opcionais
            </CardTitle>
            <CardDescription>
              Selecione passeios adicionais para este passageiro
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
        
        {totalPasseios > 0 && (
          <div className="flex items-center gap-2 mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <Calculator className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">
              Valor adicional dos passeios:
            </span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300">
              R$ {totalPasseios.toFixed(2).replace('.', ',')}
            </Badge>
          </div>
        )}
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Passeios Pagos */}
          {passeiosPagos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Passeios Pagos à Parte
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Passeios com custo adicional
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {passeiosPagos.map((passeio) => (
                  <FormField
                    key={passeio.id}
                    control={form.control}
                    name="passeios_selecionados"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(passeio.id) || false}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              const updatedValue = checked
                                ? [...currentValue, passeio.id]
                                : currentValue.filter((id: string) => id !== passeio.id);
                              field.onChange(updatedValue);
                            }}
                            disabled={disabled}
                            className="mt-1"
                          />
                        </FormControl>
                        
                        <div className="flex-1 space-y-1">
                          <FormLabel className="text-sm font-medium cursor-pointer leading-tight">
                            {passeio.nome}
                          </FormLabel>
                          
                          <Badge 
                            variant="secondary" 
                            className="bg-orange-100 text-orange-800 border-orange-300 text-xs"
                          >
                            R$ {passeio.valor.toFixed(2).replace('.', ',')}
                          </Badge>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {passeiosPagos.length > 0 && passeiosGratuitos.length > 0 && <Separator />}

          {/* Passeios Gratuitos */}
          {passeiosGratuitos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Passeios Gratuitos
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Passeios inclusos no pacote (informativo)
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {passeiosGratuitos.map((passeio) => (
                  <FormField
                    key={passeio.id}
                    control={form.control}
                    name="passeios_selecionados"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3 border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(passeio.id) || false}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              const updatedValue = checked
                                ? [...currentValue, passeio.id]
                                : currentValue.filter((id: string) => id !== passeio.id);
                              field.onChange(updatedValue);
                            }}
                            disabled={disabled}
                            className="mt-1"
                          />
                        </FormControl>
                        
                        <div className="flex-1 space-y-1">
                          <FormLabel className="text-sm font-medium cursor-pointer leading-tight">
                            {passeio.nome}
                          </FormLabel>
                          
                          <Badge 
                            variant="secondary" 
                            className="bg-green-100 text-green-800 border-green-300 text-xs"
                          >
                            Incluso
                          </Badge>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};