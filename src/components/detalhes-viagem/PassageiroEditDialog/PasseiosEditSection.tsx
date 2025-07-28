import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, DollarSign, Sparkles, Gift } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
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

export const PasseiosEditSection: React.FC<PasseiosEditSectionProps> = ({ form, viagemId, passageiroId, onPasseiosChange }) => {
  const [passeiosDaViagem, setPasseiosDaViagem] = useState<PasseioDaViagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const passeiosSelecionados = form.watch('passeios_selecionados') || [];
  
  // Calcular total dos passeios selecionados
  const totalPasseios = passeiosSelecionados.reduce((total, passeioId) => {
    const passeio = passeiosDaViagem.find(p => p.passeio_id === passeioId);
    return total + (passeio?.passeios.valor || 0);
  }, 0);

  // Função para salvar passeios automaticamente
  const salvarPasseiosAutomaticamente = async (novosPasseios: string[]) => {
    if (!passageiroId) return;

    try {
      console.log('🔄 Salvando passeios automaticamente...', novosPasseios);
      
      // Primeiro, remover todos os passeios existentes do passageiro
      const { error: deleteError } = await supabase
        .from('passageiro_passeios')
        .delete()
        .eq('viagem_passageiro_id', passageiroId);

      if (deleteError) throw deleteError;

      // Depois, adicionar os novos passeios selecionados
      if (novosPasseios.length > 0) {
        const { data: passeiosData, error: passeiosError } = await supabase
          .from('passeios')
          .select('id, valor')
          .in('id', novosPasseios);

        if (passeiosError) throw passeiosError;

        const passageiroPasseios = passeiosData.map(passeio => ({
          viagem_passageiro_id: passageiroId,
          passeio_id: passeio.id,
          valor_pago: passeio.valor
        }));

        const { error: insertError } = await supabase
          .from('passageiro_passeios')
          .insert(passageiroPasseios);

        if (insertError) throw insertError;
      }

      console.log('✅ Passeios salvos automaticamente!');
    } catch (error) {
      console.error('❌ Erro ao salvar passeios automaticamente:', error);
    }
  };

  // Carregar passeios específicos da viagem
  useEffect(() => {
    const fetchPasseiosDaViagem = async () => {
      if (!viagemId) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
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

        if (fetchError) throw fetchError;

        setPasseiosDaViagem(data || []);
      } catch (err: any) {
        console.error('Erro ao carregar passeios da viagem:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPasseiosDaViagem();
  }, [viagemId]);

  // Separar passeios por categoria
  const passeiosPagos = passeiosDaViagem.filter(p => p.passeios.categoria === 'pago');
  const passeiosGratuitos = passeiosDaViagem.filter(p => p.passeios.categoria === 'gratuito');

  if (loading) {
    return (
      <Card className="border-2 border-dashed border-gray-200">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-sm font-medium text-gray-700">Carregando passeios da viagem...</p>
            <p className="text-xs text-gray-500 mt-1">Buscando opções disponíveis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Erro ao carregar passeios</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (passeiosDaViagem.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-200 bg-gray-50">
        <CardContent className="p-8">
          <div className="text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium text-gray-700">Nenhum passeio disponível</p>
            <p className="text-sm mt-1">Esta viagem não possui passeios configurados</p>
          </div>
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
          <Card className="border-2 border-blue-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Passeios desta Viagem</h3>
                  <p className="text-sm text-gray-600 font-normal">
                    {passeiosDaViagem.length} opção{passeiosDaViagem.length !== 1 ? 'ões' : ''} disponível{passeiosDaViagem.length !== 1 ? 'eis' : ''}
                  </p>
                </div>
              </CardTitle>
              <CardDescription className="text-gray-600">
                ✨ Selecione os passeios que o passageiro deseja participar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Passeios Pagos */}
              {passeiosPagos.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-full">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-emerald-700">Passeios Pagos</h4>
                        <p className="text-xs text-emerald-600">
                          {passeiosPagos.length} opção{passeiosPagos.length !== 1 ? 'ões' : ''} com custo adicional
                        </p>
                      </div>
                    </div>
                    {totalPasseios > 0 && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-3 py-1">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Total: {formatCurrency(totalPasseios)}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {passeiosPagos.map((passeioViagem) => {
                      const passeio = passeioViagem.passeios;
                      const isSelected = field.value?.includes(passeioViagem.passeio_id) || false;
                      
                      const handleToggle = () => {
                        const currentValue = field.value || [];
                        if (isSelected) {
                          field.onChange(currentValue.filter(id => id !== passeioViagem.passeio_id));
                        } else {
                          field.onChange([...currentValue, passeioViagem.passeio_id]);
                        }
                        // Notificar mudança imediatamente
                        onPasseiosChange?.();
                      };
                      
                      return (
                        <div
                          key={passeioViagem.passeio_id}
                          className={`group relative p-4 rounded-xl border-2 transition-all duration-200 ${
                            isSelected 
                              ? 'border-emerald-300 bg-emerald-50 shadow-md' 
                              : 'border-gray-200 hover:border-emerald-200 hover:bg-emerald-25'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <Checkbox
                              id={passeioViagem.passeio_id}
                              checked={isSelected}
                              onCheckedChange={handleToggle}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <Label 
                                  htmlFor={passeioViagem.passeio_id} 
                                  className="cursor-pointer font-semibold text-gray-900 text-base"
                                >
                                  {passeio.nome}
                                </Label>
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="secondary" 
                                    className="bg-emerald-100 text-emerald-700 border-emerald-200 font-semibold"
                                  >
                                    {formatCurrency(passeio.valor)}
                                  </Badge>
                                  {isSelected && (
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Custo adicional • Opcional
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Passeios Gratuitos */}
              {passeiosGratuitos.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Gift className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-700">Passeios Inclusos</h4>
                      <p className="text-xs text-blue-600">
                        {passeiosGratuitos.length} opção{passeiosGratuitos.length !== 1 ? 'ões' : ''} sem custo adicional
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 ml-auto">
                      <Gift className="h-3 w-3 mr-1" />
                      Gratuito
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {passeiosGratuitos.map((passeioViagem) => {
                      const passeio = passeioViagem.passeios;
                      const isSelected = field.value?.includes(passeioViagem.passeio_id) || false;
                      
                      const handleToggle = () => {
                        const currentValue = field.value || [];
                        if (isSelected) {
                          field.onChange(currentValue.filter(id => id !== passeioViagem.passeio_id));
                        } else {
                          field.onChange([...currentValue, passeioViagem.passeio_id]);
                        }
                        // Notificar mudança imediatamente
                        onPasseiosChange?.();
                      };
                      
                      return (
                        <div
                          key={passeioViagem.passeio_id}
                          className={`group relative p-4 rounded-xl border-2 transition-all duration-200 ${
                            isSelected 
                              ? 'border-blue-300 bg-blue-50 shadow-md' 
                              : 'border-gray-200 hover:border-blue-200 hover:bg-blue-25'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <Checkbox
                              id={passeioViagem.passeio_id}
                              checked={isSelected}
                              onCheckedChange={handleToggle}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <Label 
                                  htmlFor={passeioViagem.passeio_id} 
                                  className="cursor-pointer font-semibold text-gray-900 text-base"
                                >
                                  {passeio.nome}
                                </Label>
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="secondary" 
                                    className="bg-blue-100 text-blue-700 border-blue-200 font-semibold"
                                  >
                                    Incluso
                                  </Badge>
                                  {isSelected && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Sem custo adicional • Opcional
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Resumo dos Passeios Selecionados */}
              {field.value && field.value.length > 0 && (
                <div className="border-t-2 border-gray-100 pt-6">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        Resumo da Seleção
                      </h4>
                      <Badge variant="outline" className="bg-white border-gray-300">
                        {field.value.length} selecionado{field.value.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {field.value.map((passeioId) => {
                        const passeioViagem = passeiosDaViagem.find(p => p.passeio_id === passeioId);
                        
                        if (!passeioViagem) return null;
                        
                        const passeio = passeioViagem.passeios;
                        const isPago = passeio.categoria === 'pago';
                        
                        return (
                          <div
                            key={passeioId}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                isPago ? 'bg-emerald-500' : 'bg-blue-500'
                              }`}></div>
                              <span className="font-medium text-gray-900 text-sm">
                                {passeio.nome}
                              </span>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs font-semibold ${
                                isPago 
                                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                                  : 'bg-blue-100 text-blue-700 border-blue-200'
                              }`}
                            >
                              {isPago ? formatCurrency(passeio.valor) : 'Incluso'}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                    
                    {totalPasseios > 0 && (
                      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                            <span className="font-semibold text-emerald-800">
                              Valor Total dos Passeios
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-700">
                              {formatCurrency(totalPasseios)}
                            </p>
                            <p className="text-xs text-emerald-600">
                              Custo adicional
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {totalPasseios === 0 && field.value.length > 0 && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <Gift className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold text-blue-800">
                            Todos os passeios selecionados são gratuitos!
                          </span>
                        </div>
                        <p className="text-sm text-blue-600 mt-1">
                          Sem custo adicional para o passageiro
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};