import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, AlertTriangle, Trash2 } from 'lucide-react';
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
  } | null;
}

interface SupabasePasseioData {
  passeio_id: string;
  passeios: {
    id: string;
    nome: string;
    valor: number;
    categoria: string;
  }[];
}

interface PasseioOrfao {
  id: string;
  passeio_nome: string;
  valor_cobrado: number;
  status: string;
}

export const PasseiosEditSectionSimples: React.FC<PasseiosEditSectionProps> = ({ 
  form, 
  viagemId, 
  passageiroId, 
  onPasseiosChange 
}) => {
  const [passeiosDaViagem, setPasseiosDaViagem] = useState<PasseioDaViagem[]>([]);
  const [passeiosOrfaos, setPasseiosOrfaos] = useState<PasseioOrfao[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvandoAutomaticamente, setSalvandoAutomaticamente] = useState(false);
  const [removendoOrfao, setRemovendoOrfao] = useState<string | null>(null);
  
  const passeiosSelecionados = form.watch('passeios_selecionados') || [];

  // Debug: Log dos props recebidos
  useEffect(() => {
    console.log('🔍 Props recebidos:', { viagemId, passageiroId, passeiosSelecionados });
  }, [viagemId, passageiroId, passeiosSelecionados]);

  // Carregar passeios da viagem e detectar órfãos
  useEffect(() => {
    const fetchPasseiosDaViagem = async () => {
      if (!viagemId) return;

      try {
        setLoading(true);
        
        // Carregar passeios da viagem
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
        
        // Processar dados do Supabase corretamente
        const processedData = (data as SupabasePasseioData[] || []).map(item => ({
          passeio_id: item.passeio_id,
          passeios: Array.isArray(item.passeios) ? item.passeios[0] : item.passeios
        })) as PasseioDaViagem[];
        
        setPasseiosDaViagem(processedData);
        
        // Detectar passeios órfãos se temos passageiroId
        if (passageiroId) {
          await detectarPasseiosOrfaos();
        }
      } catch (err: any) {
        console.error('Erro ao carregar passeios:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPasseiosDaViagem();
  }, [viagemId, passageiroId]);
  
  // Redetectar órfãos quando passeios da viagem mudarem
  useEffect(() => {
    const timer = setTimeout(() => {
      if (passeiosDaViagem.length > 0 && passageiroId) {
        detectarPasseiosOrfaos();
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [passeiosDaViagem]);
  
  // Função para detectar passeios órfãos
  const detectarPasseiosOrfaos = async () => {
    if (!passageiroId || !viagemId) return;
    
    try {
      console.log('🔍 [DEBUG] Iniciando detecção de órfãos para passageiro:', passageiroId);
      
      // Buscar passeios do passageiro
      const { data: passeiosPassageiro, error: errorPassageiro } = await supabase
        .from('passageiro_passeios')
        .select('*')
        .eq('viagem_passageiro_id', passageiroId);
        
      if (errorPassageiro) throw errorPassageiro;
      
      console.log('🔍 [DEBUG] Passeios do passageiro encontrados:', passeiosPassageiro);
      
      // Buscar passeios ativos da viagem
      const { data: passeiosViagem, error: errorViagem } = await supabase
        .from('viagem_passeios')
        .select('passeio_id, passeios!inner(nome)')
        .eq('viagem_id', viagemId);
        
      if (errorViagem) throw errorViagem;
      
      console.log('🔍 [DEBUG] Passeios da viagem encontrados:', passeiosViagem);
      
      // Identificar órfãos
      const nomesPasseiosViagem = new Set(
          (passeiosViagem || []).map((vp: any) => {
            const passeios = vp.passeios;
            return Array.isArray(passeios) ? passeios[0]?.nome : passeios?.nome;
          }).filter(Boolean)
        );
      
      console.log('🔍 [DEBUG] Nomes dos passeios da viagem:', Array.from(nomesPasseiosViagem));
      
      const orfaos = passeiosPassageiro?.filter(
        pp => !nomesPasseiosViagem.has(pp.passeio_nome)
      ) || [];
      
      console.log('🔍 [DEBUG] Órfãos identificados:', orfaos);
      
      setPasseiosOrfaos(orfaos);
      
      if (orfaos.length > 0) {
        console.log('🚨 Passeios órfãos detectados:', orfaos);
      }
    } catch (error) {
      console.error('Erro ao detectar passeios órfãos:', error);
    }
  };
  
  // Função para remover passeio órfão
  const removerPasseioOrfao = async (orfaoId: string) => {
    let remocaoSucesso = false;
    
    try {
      console.log('🗑️ [DEBUG] Iniciando remoção do órfão:', orfaoId);
      setRemovendoOrfao(orfaoId);
      
      // Verificar se o registro existe antes de tentar remover
      const { data: registroExistente, error: erroVerificacao } = await supabase
        .from('passageiro_passeios')
        .select('*')
        .eq('id', orfaoId)
        .single();
      
      if (erroVerificacao) {
        console.error('❌ [DEBUG] Erro ao verificar existência do registro:', erroVerificacao);
        throw new Error(`Registro não encontrado: ${erroVerificacao.message}`);
      }
      
      console.log('🗑️ [DEBUG] Registro antes da remoção:', registroExistente);
      
      const { error } = await supabase
        .from('passageiro_passeios')
        .delete()
        .eq('id', orfaoId);
      
      if (error) {
        console.error('❌ [DEBUG] Erro na remoção:', error);
        throw new Error(`Falha na remoção: ${error.message}`);
      }
      
      console.log('🗑️ [DEBUG] Remoção executada com sucesso');
      remocaoSucesso = true;
      
    } catch (error: any) {
      console.error('❌ [DEBUG] Erro durante remoção:', error);
      toast.error('Erro ao remover passeio órfão');
    } finally {
      // SEMPRE executar redetecção, independente do resultado da remoção
      try {
        console.log('🗑️ [DEBUG] Iniciando redetecção após remoção (finally block)');
        
        // Aguardar um pouco antes de redetectar
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await detectarPasseiosOrfaos();
        
        if (remocaoSucesso) {
          toast.success('Passeio órfão removido com sucesso!');
          onPasseiosChange?.();
        }
        
        console.log('🗑️ [DEBUG] Redetecção concluída com sucesso');
      } catch (redetecaoError) {
        console.error('❌ [DEBUG] Erro na redetecção:', redetecaoError);
        // Não mostrar toast de erro para redetecção, apenas logar
      }
      
      setRemovendoOrfao(null);
    }
  };

  // ✅ CORREÇÃO: Adicionar useEffect para redetectar órfãos quando os passeios da viagem mudam
  useEffect(() => {
    if (passageiroId && passeiosDaViagem.length > 0) {
      detectarPasseiosOrfaos();
    }
  }, [passeiosDaViagem, passageiroId]);
  
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
              {(passeiosDaViagem || []).map((passeioViagem) => {
                const passeio = passeioViagem.passeios;
                if (!passeio) return null;
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
              }).filter(Boolean)}
              
              {/* Seção de Passeios Órfãos */}
              {passeiosOrfaos.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-amber-700">
                      Passeios Órfãos Detectados
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      {passeiosOrfaos.length}
                    </Badge>
                  </div>
                  <p className="text-sm text-amber-600 mb-3">
                    Estes passeios não estão mais disponíveis na viagem, mas ainda estão vinculados ao passageiro:
                  </p>
                  <div className="space-y-2">
                    {passeiosOrfaos.map((orfao) => (
                      <div
                        key={orfao.id}
                        className="p-3 rounded-lg border border-amber-200 bg-amber-50 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-amber-800">
                            {orfao.passeio_nome}
                          </div>
                          <div className="text-sm text-amber-600">
                            Valor cobrado: {formatCurrency(orfao.valor_cobrado)} • Status: {orfao.status}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removerPasseioOrfao(orfao.id)}
                          disabled={removendoOrfao === orfao.id}
                          className="ml-3"
                        >
                          {removendoOrfao === orfao.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
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