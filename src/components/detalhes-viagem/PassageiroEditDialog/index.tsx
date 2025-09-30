
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { formSchema, FormData } from "./formSchema";
import { PassageiroEditDialogProps } from "./types";
import { OnibusSelectField } from "./OnibusSelectField";
import { SetorSelectField } from "./SetorSelectField";
// ParcelasEditManager removido - usando apenas sistema avançado
import { PasseiosEditSectionSimples } from "./PasseiosEditSectionSimples";
import { SecaoFinanceiraAvancada } from "./SecaoFinanceiraAvancada";
import { getSetorLabel, getSetorOptions } from "@/data/estadios";
import { CIDADES_EMBARQUE_COMPLETA, isCidadeOutra, isCidadePredefinida } from "@/data/cidades";
import { PassageiroGroupForm } from "../PassageiroGroupForm";

export function PassageiroEditDialog({
  open,
  onOpenChange,
  passageiro,
  viagem,
  onSuccess,
}: PassageiroEditDialogProps) {
  console.log('🔍 PassageiroEditDialog - Props recebidas:', { open, passageiro, viagem });
  
  // ✅ CORREÇÃO: Todos os hooks devem ser chamados SEMPRE, sem condições
  const [isLoading, setIsLoading] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [cidadeEmbarqueCustom, setCidadeEmbarqueCustom] = React.useState("");

  // ✅ CORREÇÃO: Verificação de segurança mais rigorosa para evitar erro React #310
  const isValidPassageiro = React.useMemo(() => {
    if (!passageiro) return false;
    if (!passageiro.viagem_passageiro_id) return false;
    if (typeof passageiro.viagem_passageiro_id !== 'string') return false;
    if (passageiro.viagem_passageiro_id === 'undefined') return false;
    if (passageiro.viagem_passageiro_id === 'null') return false;
    if (passageiro.viagem_passageiro_id.length < 10) return false;
    return true;
  }, [passageiro]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      setor_maracana: "",
      status_pagamento: "",
      forma_pagamento: "",
      valor: 0,
      desconto: 0,
      onibus_id: "",
      cidade_embarque: "Blumenau",
      observacoes: "",
      gratuito: false,
    },
  });

  const statusPagamento = form.watch("status_pagamento");
  const valorTotal = form.watch("valor");
  const desconto = form.watch("desconto");
  const gratuito = form.watch("gratuito");

  // ✅ CORREÇÃO: TODOS os useEffect devem vir ANTES do return condicional
  useEffect(() => {
    const loadPassageiroData = async () => {
      try {
        if (passageiro) {
          
          // Carregar dados básicos
          form.reset({
            setor_maracana: passageiro.setor_maracana || "",
            status_pagamento: passageiro.status_pagamento || "Pendente",
            forma_pagamento: passageiro.forma_pagamento || "",
            valor: passageiro.valor || 0,
            desconto: passageiro.desconto || 0,
            onibus_id: passageiro.onibus_id?.toString() || "",
            cidade_embarque: passageiro.cidade_embarque || "",
            observacoes: passageiro.observacoes || "",
            passeios_selecionados: [],
            gratuito: false, // Valor padrão, será carregado do banco
            grupo_nome: passageiro.grupo_nome || null,
            grupo_cor: passageiro.grupo_cor || null
          });

          // Configurar cidade de embarque customizada se necessário
          if (passageiro.cidade_embarque && isCidadeOutra(passageiro.cidade_embarque)) {
            setCidadeEmbarqueCustom(passageiro.cidade_embarque);
          }

          // Carregar passeios selecionados convertendo nomes para IDs
          if (passageiro.passeios && passageiro.passeios.length > 0) {
            try {
              // 🔍 [DEBUG] Filtrar apenas passeios válidos (não órfãos)
              // Buscar passeios válidos da viagem
              const { data: passeiosViagem, error: viagemError } = await supabase
                .from('viagem_passeios')
                .select('passeio_id')
                .eq('viagem_id', passageiro.viagem_id);

              if (!viagemError && passeiosViagem) {
                const idsPasseiosValidos = passeiosViagem.map(vp => vp.passeio_id);
                
                // Buscar nomes dos passeios válidos
                const { data: passeiosInfo, error: passeiosError } = await supabase
                  .from('passeios')
                  .select('id, nome')
                  .in('id', idsPasseiosValidos);
                
                if (!passeiosError && passeiosInfo) {
                  const nomesPasseiosValidos = passeiosInfo.map(p => p.nome);
                  console.log('🔍 [DEBUG] Passeios válidos da viagem:', nomesPasseiosValidos);
                  
                  // Filtrar apenas passeios que existem na viagem (não órfãos)
                  const passeiosValidosDoPassageiro = passageiro.passeios.filter(p => 
                    nomesPasseiosValidos.includes(p.passeio_nome)
                  );
                  
                  console.log('🔍 [DEBUG] Passeios válidos do passageiro:', passeiosValidosDoPassageiro);
                  
                  if (passeiosValidosDoPassageiro.length > 0) {
                    const nomesPasseios = passeiosValidosDoPassageiro.map(p => p.passeio_nome);
                    
                    const passeiosParaFormulario = passeiosInfo.filter(p => 
                      nomesPasseios.includes(p.nome)
                    );
                    
                    const idsPasseios = passeiosParaFormulario.map(p => p.id);
                    console.log('🔍 [DEBUG] IDs dos passeios carregados no formulário:', idsPasseios);
                    form.setValue('passeios_selecionados', idsPasseios);
                  }
                }
              }
            } catch (error) {
              console.error('Erro ao carregar passeios selecionados:', error);
            }
          }
          
        }
      } catch (error) {
        console.error('❌ Erro no useEffect do PassageiroEditDialog:', error);
      }
    };

    loadPassageiroData();
  }, [passageiro, form]);

  // Lógica de gratuidade - quando marcado como gratuito, zerar valores
  useEffect(() => {
    if (gratuito) {
      console.log('🎁 Passageiro marcado como gratuito - zerando valores');
      // Zerar valor da viagem (mas manter o valor original para referência)
      form.setValue("valor", 0);
      form.setValue("desconto", 0);
      form.setValue("status_pagamento", "Pago"); // Se gratuito, marcar como pago
      // Os passeios serão tratados como gratuitos no salvamento
    } else if (passageiro) {
      // Restaurar valores originais quando desmarcar
      form.setValue("valor", passageiro.valor || 0);
      form.setValue("desconto", passageiro.desconto || 0);
      form.setValue("status_pagamento", passageiro.status_pagamento || "Pendente");
    }
  }, [gratuito, passageiro, form]);

  // ✅ CORREÇÃO: Fechar modal se dados inválidos - APÓS TODOS os hooks
  React.useEffect(() => {
    if (open && !isValidPassageiro) {
      console.warn('PassageiroEditDialog: dados inválidos detectados, fechando modal', passageiro);
      onOpenChange(false);
    }
  }, [open, isValidPassageiro, onOpenChange, passageiro]);
  
  // ✅ CORREÇÃO: Não renderizar se dados inválidos - APÓS TODOS os hooks
  if (!isValidPassageiro) {
    return null;
  }

  const onSubmit = async (values: FormData) => {
    try {
      setIsLoading(true);
      console.log("Salvando passageiro:", values);

      if (!passageiro?.viagem_passageiro_id) return;
      // Se o status for 'Pago', garantir quitação automática
      if (values.status_pagamento === "Pago") {
        // Buscar parcelas atuais do passageiro
        const { data: parcelas, error: parcelasError } = await supabase
          .from("viagem_passageiros_parcelas")
          .select("*")
          .eq("viagem_passageiro_id", passageiro.viagem_passageiro_id);
        if (parcelasError) throw parcelasError;
        const valorPago = (parcelas || []).reduce((sum, p) => sum + (p.valor_parcela || 0), 0);
        const valorLiquido = (values.valor || 0) - (values.desconto || 0);
        const valorFalta = valorLiquido - valorPago;
        if (valorFalta > 0.009) { // margem para centavos
          // Criar parcela faltante
          const { error: parcelaInsertError } = await supabase
            .from("viagem_passageiros_parcelas")
            .insert({
              viagem_passageiro_id: passageiro.viagem_passageiro_id,
              valor_parcela: valorFalta,
              forma_pagamento: "Pix",
              data_pagamento: new Date().toISOString().slice(0, 10),
              observacoes: "Quitação automática ao marcar como Pago"
            });
          if (parcelaInsertError) throw parcelaInsertError;
        }
      }

      // Atualizar passeios do passageiro
      if (values.passeios_selecionados) {
        // Primeiro, remover todos os passeios existentes
        const { error: deleteError } = await supabase
          .from("passageiro_passeios")
          .delete()
          .eq("viagem_passageiro_id", passageiro.viagem_passageiro_id);
        if (deleteError) throw deleteError;

        // Depois, inserir os novos passeios selecionados
        if (values.passeios_selecionados.length > 0) {
          // Buscar os nomes e valores dos passeios pelos IDs
          const { data: passeiosInfo, error: passeiosInfoError } = await supabase
            .from('passeios')
            .select('id, nome, valor')
            .in('id', values.passeios_selecionados);

          if (passeiosInfoError) throw passeiosInfoError;

          const passeiosData = values.passeios_selecionados.map(passeioId => {
            const passeioInfo = passeiosInfo?.find(p => p.id === passeioId);
            return {
              viagem_passageiro_id: passageiro.viagem_passageiro_id,
              passeio_id: passeioId,
              passeio_nome: passeioInfo?.nome || 'Passeio',
              valor_cobrado: values.gratuito ? 0 : (passeioInfo?.valor || 0),
              status: 'confirmado'
            };
          });

          const { error: passeiosError } = await supabase
            .from("passageiro_passeios")
            .insert(passeiosData);
          if (passeiosError) throw passeiosError;
        }
      }

      // Atualizar passageiro normalmente
      const { error } = await supabase
        .from("viagem_passageiros")
        .update({
          setor_maracana: values.setor_maracana,
          status_pagamento: values.gratuito ? "Pago" : values.status_pagamento,
          forma_pagamento: values.forma_pagamento,
          valor: values.gratuito ? 0 : values.valor,
          desconto: values.desconto,
          onibus_id: values.onibus_id,
          cidade_embarque: values.cidade_embarque,
          observacoes: values.observacoes,
          gratuito: values.gratuito,
          grupo_nome: values.grupo_nome || null,
          grupo_cor: values.grupo_cor || null,
        })
        .eq("id", passageiro.viagem_passageiro_id);
      if (error) throw error;

      toast.success("Passageiro atualizado com sucesso!");
      
      // ✅ CORREÇÃO: Aguardar mais tempo para garantir que todas as operações do banco foram concluídas
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // ✅ CORREÇÃO: Forçar atualização dos dados antes de chamar onSuccess
      if (onSuccess) {
        await onSuccess();
      }
      
      // ✅ CORREÇÃO: Aguardar mais um pouco antes de fechar o modal
      await new Promise(resolve => setTimeout(resolve, 300));
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar passageiro:", error);
      toast.error("Erro ao atualizar passageiro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1100px] w-full max-h-[95vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-900">Editar Passageiro</DialogTitle>
          <DialogDescription className="text-gray-600">
            Editando: <span className="font-semibold text-gray-900">{passageiro?.nome}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-6">
              {/* Coluna da Esquerda */}
              <div className="space-y-6">
                {/* Ônibus e Setor */}
                <div className="space-y-4">
                  <OnibusSelectField
                    control={form.control}
                    form={form}
                    viagemId={passageiro?.viagem_id}
                    currentOnibusId={passageiro?.onibus_id}
                    className="bg-white text-gray-900 border-gray-300 focus:ring-blue-200 focus:border-blue-400 hover:bg-blue-50"
                    selectClassName="bg-white text-gray-900 border-gray-300 focus:ring-blue-200 focus:border-blue-400 hover:bg-blue-50"
                    optionClassName="bg-white text-gray-900 hover:bg-blue-50 focus:bg-blue-100"
                  />
                  <FormField
                    control={form.control}
                    name="cidade_embarque"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Cidade de Embarque</FormLabel>
                        <div className="space-y-2">
                          <Select
                            onValueChange={(value) => {
                              if (isCidadeOutra(value)) {
                                setCidadeEmbarqueCustom("");
                                field.onChange(""); // Limpar para permitir input manual
                              } else {
                                setCidadeEmbarqueCustom("");
                                field.onChange(value);
                              }
                            }}
                            value={isCidadePredefinida(field.value) ? field.value : ""}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                                <SelectValue placeholder="Selecione uma cidade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white border-gray-200 z-50 text-gray-900">
                              {CIDADES_EMBARQUE_COMPLETA.map((cidade) => (
                                <SelectItem 
                                  key={cidade} 
                                  value={cidade}
                                  className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                                >
                                  {cidade}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {/* Campo manual quando "Outra" for selecionada ou valor não está na lista predefinida */}
                          {(field.value === "" || !isCidadePredefinida(field.value)) && (
                            <Input
                              placeholder="Digite o nome da cidade"
                              value={cidadeEmbarqueCustom || field.value}
                              onChange={(e) => {
                                const value = e.target.value;
                                setCidadeEmbarqueCustom(value);
                                field.onChange(value);
                              }}
                              className="bg-white text-gray-900 border-gray-300"
                            />
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="setor_maracana"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          {getSetorLabel(viagem?.local_jogo || "Rio de Janeiro", viagem?.nome_estadio)}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                              <SelectValue placeholder="Selecione um setor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white border-gray-200 z-50 text-gray-900">
                            {getSetorOptions(viagem?.local_jogo || "Rio de Janeiro").map((setor) => (
                              <SelectItem key={setor} value={setor}>
                                {setor}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Valores */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="valor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Valor (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="bg-white text-gray-900 border-gray-300"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="desconto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Desconto (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="bg-white text-gray-900 border-gray-300"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Campo de Gratuidade */}
                <FormField
                  control={form.control}
                  name="gratuito"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-gray-700 font-medium">
                          🎁 Passageiro Gratuito
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Marque esta opção se o passageiro não deve ser cobrado. 
                          Passageiros gratuitos não contam nas receitas da viagem.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Observações */}
                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Observações</FormLabel>
                      <Textarea
                        {...field}
                        placeholder="Observações (opcional)"
                        className="bg-white text-gray-900 border-gray-300 min-h-[120px]"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Seção de Passeios */}
                <PasseiosEditSectionSimples
                  form={form} 
                  viagemId={passageiro?.viagem_id || ''} 
                  passageiroId={passageiro?.viagem_passageiro_id?.toString() || ''}
                  onPasseiosChange={() => {
                    console.log('🔄 Passeios alterados, atualizando seção financeira...');
                    setRefreshKey(prev => prev + 1);
                  }}
                />
              </div>

              {/* Coluna da Direita */}
              <div className="space-y-6">
                {/* Campos do sistema antigo removidos - usando apenas Situação Financeira */}

                {/* Seção Financeira Avançada */}
                <SecaoFinanceiraAvancada
                  key={refreshKey}
                  passageiroId={passageiro.viagem_passageiro_id?.toString() || ''}
                  nomePassageiro={passageiro.nome}
                  onPagamentoRealizado={async () => {
                    console.log('💰 Pagamento realizado, atualizando dados...');
                    if (onSuccess) {
                      console.log('🔄 Chamando onSuccess...');
                      await onSuccess();
                      console.log('✅ onSuccess executado');
                    }
                  }}
                />
                
                {/* Sistema de Parcelas Legado removido - usando apenas Situação Financeira Avançada */}
              </div>
              
              {/* Campo de Grupo */}
              <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <PassageiroGroupForm
                  viagemId={viagem?.id || ''}
                  grupoNome={form.watch('grupo_nome') || ''}
                  grupoCor={form.watch('grupo_cor') || ''}
                  onChange={(nome, cor) => {
                    form.setValue('grupo_nome', nome);
                    form.setValue('grupo_cor', cor);
                  }}
                />
              </div>
            </div>

            <DialogFooter className="pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-700"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? "Salvando..." : "Salvar Passageiro"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
