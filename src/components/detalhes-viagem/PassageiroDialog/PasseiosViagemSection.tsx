import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Sparkles, Gift, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import type { UseFormReturn } from 'react-hook-form';
import type { FormData } from './formSchema';

interface PasseiosViagemSectionProps {
  form: UseFormReturn<FormData>;
  viagemId: string;
  disabled?: boolean;
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

export const PasseiosViagemSection: React.FC<PasseiosViagemSectionProps> = ({ 
  form, 
  viagemId,
  disabled = false 
}) => {
  const [passeiosDaViagem, setPasseiosDaViagem] = useState<PasseioDaViagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  
  const passeiosSelecionados = form.watch('passeios_selecionados') || [];
  
  // Calcular total dos passeios selecionados
  const totalPasseios = passeiosSelecionados.reduce((total, passeioId) => {
    const passeio = passeiosDaViagem.find(p => p.passeio_id === passeioId);
    return total + (passeio?.passeios.valor || 0);
  }, 0);

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
      <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-blue-600 mb-4"></div>
            <p className="text-base font-medium text-blue-700">Carregando passeios disponíveis...</p>
            <p className="text-sm text-blue-600 mt-1">Buscando opções desta viagem</p>
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
          <Card className="border-2 border-purple-100 shadow-xl bg-gradient-to-br from-white to-purple-50/30">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b-2 border-purple-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Star className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      Passeios Opcionais
                      <Badge variant="outline" className="bg-white border-purple-200 text-purple-700">
                        {passeiosDaViagem.length} disponível{passeiosDaViagem.length !== 1 ? 'eis' : ''}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-purple-700 font-medium">
                      ✨ Escolha os passeios que o passageiro deseja participar
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {totalPasseios > 0 && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-4 py-2 text-base font-bold">
                      <Sparkles className="h-4 w-4 mr-2" />
                      {formatCurrency(totalPasseios)}
                    </Badge>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-purple-600 hover:bg-purple-100"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {isExpanded && (
              <CardContent className="p-6 space-y-6">
                {/* Passeios Pagos */}
                {passeiosPagos.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-full">
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-700 text-lg">Passeios com Custo Adicional</h4>
                        <p className="text-sm text-emerald-600">
                          {passeiosPagos.length} opção{passeiosPagos.length !== 1 ? 'ões' : ''} premium disponível{passeiosPagos.length !== 1 ? 'eis' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {passeiosPagos.map((passeioViagem) => {
                        const passeio = passeioViagem.passeios;
                        const isSelected = field.value?.includes(passeioViagem.passeio_id) || false;
                        
                        const handleToggle = () => {
                          if (disabled) return;
                          const currentValue = field.value || [];
                          if (isSelected) {
                            field.onChange(currentValue.filter(id => id !== passeioViagem.passeio_id));
                          } else {
                            field.onChange([...currentValue, passeioViagem.passeio_id]);
                          }
                        };
                        
                        return (
                          <div
                            key={passeioViagem.passeio_id}
                            className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                              isSelected 
                                ? 'border-emerald-300 bg-emerald-50 shadow-lg scale-[1.02]' 
                                : 'border-gray-200 hover:border-emerald-200 hover:bg-emerald-25 hover:shadow-md'
                            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <div className="flex items-start space-x-4">
                              <Checkbox
                                id={passeioViagem.passeio_id}
                                checked={isSelected}
                                onCheckedChange={handleToggle}
                                disabled={disabled}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <Label 
                                    htmlFor={passeioViagem.passeio_id} 
                                    className={`font-bold text-gray-900 text-base leading-tight ${
                                      disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                                    }`}
                                  >
                                    {passeio.nome}
                                  </Label>
                                  {isSelected && (
                                    <div className="flex items-center gap-1 ml-2">
                                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                      <span className="text-xs font-medium text-emerald-600">Selecionado</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-sm text-gray-600">
                                    Custo adicional • Opcional
                                  </p>
                                  <Badge 
                                    className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold text-base px-3 py-1"
                                  >
                                    {formatCurrency(passeio.valor)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Separador se houver ambos os tipos */}
                {passeiosPagos.length > 0 && passeiosGratuitos.length > 0 && (
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-4 text-gray-500 font-medium">e também</span>
                    </div>
                  </div>
                )}

                {/* Passeios Gratuitos */}
                {passeiosGratuitos.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Gift className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-700 text-lg">Passeios Inclusos</h4>
                        <p className="text-sm text-blue-600">
                          {passeiosGratuitos.length} opção{passeiosGratuitos.length !== 1 ? 'ões' : ''} sem custo adicional
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {passeiosGratuitos.map((passeioViagem) => {
                        const passeio = passeioViagem.passeios;
                        const isSelected = field.value?.includes(passeioViagem.passeio_id) || false;
                        
                        const handleToggle = () => {
                          if (disabled) return;
                          const currentValue = field.value || [];
                          if (isSelected) {
                            field.onChange(currentValue.filter(id => id !== passeioViagem.passeio_id));
                          } else {
                            field.onChange([...currentValue, passeioViagem.passeio_id]);
                          }
                        };
                        
                        return (
                          <div
                            key={passeioViagem.passeio_id}
                            className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                              isSelected 
                                ? 'border-blue-300 bg-blue-50 shadow-lg scale-[1.02]' 
                                : 'border-gray-200 hover:border-blue-200 hover:bg-blue-25 hover:shadow-md'
                            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <div className="flex items-start space-x-4">
                              <Checkbox
                                id={passeioViagem.passeio_id}
                                checked={isSelected}
                                onCheckedChange={handleToggle}
                                disabled={disabled}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <Label 
                                    htmlFor={passeioViagem.passeio_id} 
                                    className={`font-bold text-gray-900 text-base leading-tight ${
                                      disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                                    }`}
                                  >
                                    {passeio.nome}
                                  </Label>
                                  {isSelected && (
                                    <div className="flex items-center gap-1 ml-2">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                      <span className="text-xs font-medium text-blue-600">Selecionado</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-sm text-gray-600">
                                    Sem custo adicional • Opcional
                                  </p>
                                  <Badge 
                                    className="bg-blue-100 text-blue-700 border-blue-200 font-bold text-base px-3 py-1"
                                  >
                                    <Gift className="h-3 w-3 mr-1" />
                                    Incluso
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Resumo da Seleção */}
                {field.value && field.value.length > 0 && (
                  <div className="border-t-2 border-purple-100 pt-6">
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-purple-800 flex items-center gap-2 text-lg">
                          <Sparkles className="h-5 w-5 text-purple-600" />
                          Resumo da Seleção
                        </h4>
                        <Badge variant="outline" className="bg-white border-purple-300 text-purple-700 px-3 py-1">
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
                              className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-100 shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full ${
                                  isPago ? 'bg-emerald-500' : 'bg-blue-500'
                                }`}></div>
                                <span className="font-semibold text-gray-900">
                                  {passeio.nome}
                                </span>
                              </div>
                              <Badge 
                                className={`font-bold ${
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
                      
                      {totalPasseios > 0 ? (
                        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <DollarSign className="h-6 w-6 text-emerald-600" />
                              <span className="font-bold text-emerald-800 text-lg">
                                Valor Total dos Passeios
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold text-emerald-700">
                                {formatCurrency(totalPasseios)}
                              </p>
                              <p className="text-sm text-emerald-600">
                                Custo adicional
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                          <div className="flex items-center gap-3">
                            <Gift className="h-6 w-6 text-blue-600" />
                            <div>
                              <span className="font-bold text-blue-800 text-lg block">
                                Todos os passeios selecionados são gratuitos!
                              </span>
                              <p className="text-sm text-blue-600 mt-1">
                                Sem custo adicional para o passageiro
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};