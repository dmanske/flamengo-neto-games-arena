import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import type { UseFormReturn } from 'react-hook-form';
import type { FormData } from './formSchema';

interface PasseiosEditSectionProps {
  form: UseFormReturn<FormData>;
  viagemId: string;
  passageiroId?: string;
  onPasseiosChange?: () => void;
}

interface PasseioDaViagem {
  passeio_id: string;
  passeios: {
    id: string;
    nome: string;
    valor: number;
    categoria: string;
  };
}

export const PasseiosEditSectionSimples: React.FC<PasseiosEditSectionProps> = ({ 
  form, 
  viagemId, 
  passageiroId, 
  onPasseiosChange 
}) => {
  const [passeiosDaViagem, setPasseiosDaViagem] = useState<PasseioDaViagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvandoAutomaticamente, setSalvandoAutomaticamente] = useState(false);
  
  const passeiosSelecionados = form.watch('passeios_selecionados') || [];

  // Debug: Log dos props recebidos
  useEffect(() => {
    console.log('🔍 Props recebidos:', { viagemId, passageiroId, passeiosSelecionados });
  }, [viagemId, passageiroId, passeiosSelecionados]);

  // Carregar passeios da viagem
  useEffect(() => {
    const fetchPasseiosDaViagem = async () => {
      if (!viagemId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('viagem_passeios')
          .select(`
            passeio_id,
            passeios!inner (
              id,
              nome,
              valor,
              categoria
            )
          `)
          .eq('viagem_id', viagemId);

        if (error) throw error;
        setPasseiosDaViagem(data || []);
      } catch (err: any) {
        console.error('Erro ao carregar passeios:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPasseiosDaViagem();
  }, [viagemId]);

  // Função para salvar automaticamente
  const salvarAutomaticamente = async (novosPasseios: string[]) => {
    if (!passageiroId) {
      console.log('❌ PassageiroId não fornecido');
      return;
    }

    try {
      setSalvandoAutomaticamente(true);
      console.log('🔄 Iniciando salvamento automático...', { passageiroId, novosPasseios });
      
      // Remover passeios existentes
      const { error: deleteError } = await supabase
        .from('passageiro_passeios')
        .delete()
        .eq('viagem_passageiro_id', passageiroId);

      if (deleteError) {
        console.error('❌ Erro ao deletar passeios existentes:', deleteError);
        throw deleteError;
      }

      // Adicionar novos passeios
      if (novosPasseios.length > 0) {
        const { data: passeiosData, error: selectError } = await supabase
          .from('passeios')
          .select('id, nome, valor')
          .in('id', novosPasseios);

        if (selectError) {
          console.error('❌ Erro ao buscar dados dos passeios:', selectError);
          throw selectError;
        }

        if (passeiosData && passeiosData.length > 0) {
          // Verificar se o passageiro é gratuito
          const isPassageiroGratuito = form.getValues('gratuito') || false;
          
          const passageiroPasseios = passeiosData.map(passeio => ({
            viagem_passageiro_id: passageiroId,
            passeio_id: passeio.id,
            passeio_nome: passeio.nome,
            valor_cobrado: isPassageiroGratuito ? 0 : passeio.valor, // Se gratuito, valor = 0
            status: 'confirmado'
          }));

          console.log('📝 Dados para inserir:', passageiroPasseios);

          const { error: insertError } = await supabase
            .from('passageiro_passeios')
            .insert(passageiroPasseios);

          if (insertError) {
            console.error('❌ Erro ao inserir novos passeios:', insertError);
            throw insertError;
          }
        }
      }

      console.log('✅ Passeios salvos com sucesso!');
      
      // Notificar mudança
      onPasseiosChange?.();
      
    } catch (error: any) {
      console.error('❌ Erro completo ao salvar:', error);
      toast.error(`Erro ao salvar passeios: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSalvandoAutomaticamente(false);
    }
  };

  const handleTogglePasseio = async (passeioId: string, isCurrentlySelected: boolean) => {
    const currentValue = form.getValues('passeios_selecionados') || [];
    const newValue = isCurrentlySelected 
      ? currentValue.filter(id => id !== passeioId)
      : [...currentValue, passeioId];
    
    // Atualizar formulário
    form.setValue('passeios_selecionados', newValue);
    
    // Salvar automaticamente
    await salvarAutomaticamente(newValue);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Carregando passeios...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <FormField
      control={form.control}
      name="passeios_selecionados"
      render={({ field }) => (
        <FormItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Passeios da Viagem
                {salvandoAutomaticamente && (
                  <Badge variant="secondary" className="text-xs">
                    Salvando...
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {passeiosDaViagem.map((passeioViagem) => {
                const passeio = passeioViagem.passeios;
                const isSelected = field.value?.includes(passeioViagem.passeio_id) || false;
                
                return (
                  <div
                    key={passeioViagem.passeio_id}
                    className={`p-3 rounded-lg border transition-colors ${
                      isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={passeioViagem.passeio_id}
                        checked={isSelected}
                        onCheckedChange={() => handleTogglePasseio(passeioViagem.passeio_id, isSelected)}
                      />
                      <div className="flex-1">
                        <Label 
                          htmlFor={passeioViagem.passeio_id} 
                          className="cursor-pointer font-medium"
                        >
                          {passeio.nome}
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={passeio.categoria === 'pago' ? 'default' : 'secondary'}>
                            {passeio.categoria === 'pago' ? formatCurrency(passeio.valor) : 'Gratuito'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Resumo */}
              {field.value && field.value.length > 0 && (() => {
                const isPassageiroGratuito = form.watch('gratuito') || false;
                const valorTotal = field.value.reduce((total, passeioId) => {
                  const passeio = passeiosDaViagem.find(p => p.passeio_id === passeioId);
                  return total + (passeio?.passeios.valor || 0);
                }, 0);
                const valorCobrado = isPassageiroGratuito ? 0 : valorTotal;

                return (
                  <div className="border-t pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total dos Passeios:</span>
                      {isPassageiroGratuito ? (
                        <Badge className="bg-blue-100 text-blue-700">
                          🎁 Gratuito
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {formatCurrency(valorCobrado)}
                        </Badge>
                      )}
                    </div>
                    {isPassageiroGratuito && valorTotal > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Valor original: {formatCurrency(valorTotal)} (não cobrado)
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};