import React from 'react';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';
import { usePasseios } from '@/hooks/usePasseios';
import type { PasseiosSectionProps } from '@/types/passeio';

export const PasseiosPagosSection: React.FC<PasseiosSectionProps> = ({ form, disabled = false }) => {
  const { passeiosPagos, loading } = usePasseios();

  if (loading || passeiosPagos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Passeios Pagos à Parte
        </h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Passeios com custo adicional que podem ser incluídos na viagem
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
  );
};