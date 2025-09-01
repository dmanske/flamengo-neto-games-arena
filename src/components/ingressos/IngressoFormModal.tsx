import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Calculator } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { useIngressos } from '@/hooks/useIngressos';
import { useViagens } from '@/hooks/useViagens';
import { usePagamentosIngressos } from '@/hooks/usePagamentosIngressos';

import { ingressoSchema, IngressoFormData } from '@/lib/validations/ingressos';
import { Ingresso, LocalJogo, SituacaoFinanceiraIngresso } from '@/types/ingressos';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { ClienteSearchSelect } from './ClienteSearchSelect';
import { SelectGroup, SelectLabel } from '@/components/ui/select';
import { AdversarioSearchInput } from './AdversarioSearchInput';
import { getSetorOptions } from '@/data/estadios';

interface IngressoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingresso?: Ingresso | null;
  jogoPreSelecionado?: any | null;
  onSuccess: () => void;
}

export function IngressoFormModal({ 
  open, 
  onOpenChange, 
  ingresso, 
  jogoPreSelecionado,
  onSuccess 
}: IngressoFormModalProps) {
  const { criarIngresso, atualizarIngresso, calcularValores, estados, ingressos } = useIngressos();
  const { viagens, buscarViagensAtivas, buscarViagensIngressos } = useViagens();
  const { buscarLogosAdversarios } = useIngressos();
  const { pagamentos, buscarPagamentos, calcularResumo } = usePagamentosIngressos();
  
  const [viagensIngressos, setViagensIngressos] = useState<any[]>([]);
  
  // Usar setores do Maracanã já definidos no sistema
  const setoresMaracana = getSetorOptions("Rio de Janeiro");

  const [localJogo, setLocalJogo] = useState<LocalJogo>('casa');
  const [logosAdversarios, setLogosAdversarios] = useState<Record<string, string>>({});
  const [valoresCalculados, setValoresCalculados] = useState({
    valorFinal: 0,
    lucro: 0,
    margemPercentual: 0
  });
  const [conflitoDuplicacao, setConflitoDuplicacao] = useState<string | null>(null);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [pagamentoInicial, setPagamentoInicial] = useState({
    registrar: false,
    valor: 0,
    forma: 'dinheiro' as const,
    data: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    observacoes: ''
  });

  const form = useForm<IngressoFormData>({
    resolver: zodResolver(ingressoSchema),
    defaultValues: {
      cliente_id: '',
      viagem_id: null,
      viagem_ingressos_id: null,
      jogo_data: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:MM para datetime-local
      adversario: '',
      logo_adversario: '',
      local_jogo: 'casa',
      setor_estadio: '',
      preco_custo: 0,
      preco_venda: 0,
      desconto: 0,

      observacoes: ''
    }
  });

  // Carregar dados quando modal abrir
  useEffect(() => {
    if (open) {
      buscarViagensAtivas();
      
      // Carregar viagens específicas para ingressos
      const carregarViagensIngressos = async () => {
        const viagensIngressosData = await buscarViagensIngressos();
        setViagensIngressos(viagensIngressosData || []);
      };
      carregarViagensIngressos();
      
      // Carregar logos dos adversários
      buscarLogosAdversarios().then(logos => {
        setLogosAdversarios(logos);
      });
      
      if (ingresso) {
        // Modo edição
        form.reset({
          cliente_id: ingresso.cliente_id,
          viagem_id: ingresso.viagem_id,
          viagem_ingressos_id: ingresso.viagem_ingressos_id, // Usar o valor correto do ingresso
          jogo_data: ingresso.jogo_data.slice(0, 16), // YYYY-MM-DDTHH:MM para datetime-local
          adversario: ingresso.adversario,
          logo_adversario: ingresso.logo_adversario || '',
          local_jogo: ingresso.local_jogo,
          setor_estadio: ingresso.setor_estadio,
          preco_custo: ingresso.preco_custo,
          preco_venda: ingresso.preco_venda,
          desconto: ingresso.desconto,

          observacoes: ingresso.observacoes || ''
        });
        setLocalJogo(ingresso.local_jogo);
        
        // Buscar pagamentos para o resumo
        buscarPagamentos(ingresso.id);
      } else {
        // Modo criação
        const dadosIniciais = {
          cliente_id: '',
          viagem_id: null,
          viagem_ingressos_id: null,
          jogo_data: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:MM para datetime-local
          adversario: '',
          logo_adversario: '',
          local_jogo: 'casa' as const,
          setor_estadio: '',
          preco_custo: 0,
          preco_venda: 0,
          desconto: 0,
          observacoes: ''
        };

        // Se há jogo pré-selecionado, preencher os dados
        if (jogoPreSelecionado) {
          // PRESERVAR A HORA ORIGINAL - converter corretamente para datetime-local
          const dataJogo = new Date(jogoPreSelecionado.jogo_data);
          const dataFormatada = new Date(dataJogo.getTime() - (dataJogo.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
          
          dadosIniciais.jogo_data = dataFormatada;
          dadosIniciais.adversario = jogoPreSelecionado.adversario;
          dadosIniciais.logo_adversario = jogoPreSelecionado.logo_adversario || '';
          dadosIniciais.local_jogo = jogoPreSelecionado.local_jogo;
          
          // Vincular à viagem correta se existir
          if (jogoPreSelecionado.viagem_ingressos_id) {
            dadosIniciais.viagem_ingressos_id = jogoPreSelecionado.viagem_ingressos_id;
          }
          
          setLocalJogo(jogoPreSelecionado.local_jogo);
          
          console.log('🎯 Jogo pré-selecionado:', {
            original: jogoPreSelecionado.jogo_data,
            formatado: dataFormatada,
            adversario: jogoPreSelecionado.adversario,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          });
        } else {
          setLocalJogo('casa');
        }

        form.reset(dadosIniciais);
      }
    }
  }, [open, ingresso, form, buscarViagensAtivas]);

  // Calcular valores em tempo real
  useEffect(() => {
    const subscription = form.watch((values) => {
      const precoVenda = Number(values.preco_venda) || 0;
      const desconto = Number(values.desconto) || 0;
      const precoCusto = Number(values.preco_custo) || 0;
      
      const calculados = calcularValores(precoVenda, desconto, precoCusto);
      setValoresCalculados(calculados);
    });

    return () => subscription.unsubscribe();
  }, [form, calcularValores]);

  // Verificar se há viagem selecionada (qualquer tipo)
  const temViagemSelecionada = form.watch('viagem_id') || form.watch('viagem_ingressos_id') || jogoPreSelecionado;
  const camposDevemEstarBloqueados = !!temViagemSelecionada;

  // Verificar duplicação de cliente/viagem em tempo real
  useEffect(() => {
    const subscription = form.watch((values) => {
      const clienteId = values.cliente_id;
      const viagemId = values.viagem_id;
      const viagemIngressosId = values.viagem_ingressos_id;
      
      // Limpar conflito anterior
      setConflitoDuplicacao(null);
      
      // Só verificar se cliente está preenchido e não estamos editando
      if (clienteId && !ingresso) {
        // Verificar duplicação para viagem do sistema
        if (viagemId && viagemId !== 'nenhuma') {
          const ingressoExistente = ingressos.find(ing => 
            ing.cliente_id === clienteId && 
            ing.viagem_id === viagemId
          );
          
          if (ingressoExistente) {
            const viagem = viagens.find(v => v.id === viagemId);
            const nomeViagem = viagem ? `${viagem.adversario} - ${format(new Date(viagem.data_jogo), 'dd/MM/yyyy')}` : 'esta viagem';
            setConflitoDuplicacao(`Este cliente já possui ingresso para ${nomeViagem}`);
          }
        }
        
        // Verificar duplicação para viagem de ingressos
        if (viagemIngressosId && viagemIngressosId !== 'nenhuma') {
          const ingressoExistente = ingressos.find(ing => 
            ing.cliente_id === clienteId && 
            ing.viagem_ingressos_id === viagemIngressosId
          );
          
          if (ingressoExistente) {
            const viagemIngresso = viagensIngressos.find(v => v.id === viagemIngressosId);
            const nomeViagem = viagemIngresso ? `${viagemIngresso.adversario} - ${format(new Date(viagemIngresso.data_jogo), 'dd/MM/yyyy')}` : 'esta viagem';
            setConflitoDuplicacao(`Este cliente já possui ingresso para ${nomeViagem}`);
          }
        }
        
        // Verificar duplicação para jogo pré-selecionado (mesmo adversário, data e local)
        if (jogoPreSelecionado && values.adversario && values.jogo_data && values.local_jogo) {
          const ingressoExistente = ingressos.find(ing => {
            const dataIngresso = new Date(ing.jogo_data).toISOString().split('T')[0];
            const dataFormulario = new Date(values.jogo_data).toISOString().split('T')[0];
            
            return (
              ing.cliente_id === clienteId &&
              ing.adversario.toLowerCase() === values.adversario.toLowerCase() &&
              dataIngresso === dataFormulario &&
              ing.local_jogo === values.local_jogo
            );
          });
          
          if (ingressoExistente) {
            setConflitoDuplicacao(`Este cliente já possui ingresso para este jogo: ${values.adversario} - ${format(new Date(values.jogo_data), 'dd/MM/yyyy')}`);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, ingressos, viagens, viagensIngressos, ingresso, jogoPreSelecionado]);

  // Atualizar local do jogo
  const handleLocalJogoChange = (novoLocal: LocalJogo) => {
    setLocalJogo(novoLocal);
    form.setValue('local_jogo', novoLocal);
    
    // Limpar setor quando mudar o local
    form.setValue('setor_estadio', '');
  };

  // Submeter formulário
  const onSubmit = async (data: IngressoFormData) => {
    
    try {
      // Não incluir campos calculados (valor_final, lucro, margem_percentual são colunas geradas)
      const dadosParaSalvar = data;
      

      
      let sucesso = false;
      
      if (ingresso) {
        // Editar ingresso existente
        sucesso = await atualizarIngresso(ingresso.id, dadosParaSalvar);
      } else {
        // Criar novo ingresso - passar valor calculado como backup
        sucesso = await criarIngresso({
          ...dadosParaSalvar,
          valorFinalCalculado: valoresCalculados.valorFinal
        });
      }

      if (sucesso) {
        // Se é criação e tem pagamento inicial, registrar o pagamento
        if (!ingresso && pagamentoInicial.registrar && pagamentoInicial.valor > 0) {
          try {
            // Buscar o ingresso recém-criado para obter o ID
            // Como não temos o ID retornado, vamos usar o hook de pagamentos
            // Isso será feito após o onSuccess() para garantir que o ingresso foi criado
            console.log('Pagamento inicial será registrado:', pagamentoInicial);
            
            // TODO: Implementar registro do pagamento inicial
            // Isso pode ser feito através de um callback ou estado global
          } catch (error) {
            console.error('Erro ao registrar pagamento inicial:', error);
            // Não bloquear o sucesso da criação do ingresso
          }
        }
        
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao salvar ingresso:', error);
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {ingresso ? 'Editar Ingresso' : 'Novo Ingresso'}
            {jogoPreSelecionado && (
              <span className="text-sm font-normal text-blue-600 ml-2">
                - Para {jogoPreSelecionado.adversario}
              </span>
            )}
          </DialogTitle>
          {camposDevemEstarBloqueados && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mt-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">⚽</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-blue-800 font-semibold mb-1">
                    {jogoPreSelecionado ? (
                      <>
                        {jogoPreSelecionado.local_jogo === 'fora' ? 
                          `${jogoPreSelecionado.adversario} × Flamengo` : 
                          `Flamengo × ${jogoPreSelecionado.adversario}`
                        }
                      </>
                    ) : (
                      'Jogo da Viagem Selecionada'
                    )}
                  </h4>
                  <p className="text-blue-700 text-sm mb-2">
                    📅 {jogoPreSelecionado ? 
                      new Date(jogoPreSelecionado.jogo_data).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 
                      'Data definida pela viagem'
                    }
                  </p>
                  <p className="text-blue-600 text-xs bg-white/50 rounded px-2 py-1 inline-block">
                    💡 Dados do jogo já definidos - preencha apenas cliente e valores
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Coluna 1: Dados do Cliente e Jogo */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dados do Jogo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Cliente */}
                    <FormField
                      control={form.control}
                      name="cliente_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cliente *</FormLabel>
                          <FormControl>
                            <ClienteSearchSelect
                              value={field.value || ""}
                              onValueChange={field.onChange}
                              placeholder="Selecione o cliente"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Só mostrar seleção de viagens se não há jogo pré-selecionado */}
                    {!jogoPreSelecionado && (
                      <>
                        {/* Viagem do Sistema (Opcional) */}
                        <FormField
                          control={form.control}
                          name="viagem_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Viagem do Sistema (Opcional)</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value === 'nenhuma' ? null : value);
                                  
                                  // Limpar a outra viagem se selecionou esta
                                  if (value !== 'nenhuma') {
                                    form.setValue('viagem_ingressos_id', null);
                                  }
                                  
                                  // Preencher automaticamente data e adversário se viagem selecionada
                                  if (value !== 'nenhuma') {
                                    const viagemSelecionada = viagens.find(v => v.id === value);
                                    if (viagemSelecionada) {
                                      // PRESERVAR A HORA ORIGINAL da viagem - converter corretamente
                                      const dataJogo = new Date(viagemSelecionada.data_jogo);
                                      const dataFormatada = new Date(dataJogo.getTime() - (dataJogo.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                                      
                                      form.setValue('jogo_data', dataFormatada);
                                      form.setValue('adversario', viagemSelecionada.adversario);
                                      form.setValue('local_jogo', viagemSelecionada.local_jogo || 'casa');
                                      setLocalJogo(viagemSelecionada.local_jogo || 'casa');
                                      
                                      console.log('🎯 Viagem sistema selecionada:', {
                                        original: viagemSelecionada.data_jogo,
                                        formatado: dataFormatada,
                                        adversario: viagemSelecionada.adversario
                                      });
                                    }
                                  }
                                }} 
                                value={field.value || 'nenhuma'}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma viagem do sistema (opcional)" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="nenhuma">Nenhuma viagem</SelectItem>
                                  
                                  {/* Viagens do Sistema */}
                                  {viagens.length > 0 && (
                                    <SelectGroup>
                                      <SelectLabel>Viagens do Sistema</SelectLabel>
                                      {viagens.map((viagem) => (
                                        <SelectItem key={viagem.id} value={viagem.id}>
                                          {viagem.adversario} - {new Date(viagem.data_jogo).toLocaleDateString('pt-BR')} às {new Date(viagem.data_jogo).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Viagem para Ingressos (Separado) */}
                        <FormField
                          control={form.control}
                          name="viagem_ingressos_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Viagem para Ingressos (Opcional)</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value === 'nenhuma' ? null : value);
                                  
                                  // Limpar a outra viagem se selecionou esta
                                  if (value !== 'nenhuma') {
                                    form.setValue('viagem_id', null);
                                  }
                                  
                                  // Preencher automaticamente data e adversário se viagem selecionada
                                  if (value !== 'nenhuma') {
                                    const viagemSelecionada = viagensIngressos.find(v => v.id === value);
                                    if (viagemSelecionada) {
                                      // PRESERVAR A HORA ORIGINAL da viagem - converter corretamente
                                      const dataJogo = new Date(viagemSelecionada.data_jogo);
                                      const dataFormatada = new Date(dataJogo.getTime() - (dataJogo.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                                      
                                      form.setValue('jogo_data', dataFormatada);
                                      form.setValue('adversario', viagemSelecionada.adversario);
                                      form.setValue('local_jogo', viagemSelecionada.local_jogo || 'casa');
                                      setLocalJogo(viagemSelecionada.local_jogo || 'casa');
                                      
                                      console.log('🎯 Viagem ingressos selecionada:', {
                                        original: viagemSelecionada.data_jogo,
                                        formatado: dataFormatada,
                                        adversario: viagemSelecionada.adversario
                                      });
                                    }
                                  }
                                }} 
                                value={field.value || 'nenhuma'}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma viagem para ingressos (opcional)" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="nenhuma">Nenhuma viagem</SelectItem>
                                  
                                  {/* Viagens para Ingressos */}
                                  {viagensIngressos.length > 0 && (
                                    <SelectGroup>
                                      <SelectLabel>Viagens para Ingressos</SelectLabel>
                                      {viagensIngressos.map((viagem) => (
                                        <SelectItem key={viagem.id} value={viagem.id}>
                                          {viagem.adversario} - {new Date(viagem.data_jogo).toLocaleDateString('pt-BR')} às {new Date(viagem.data_jogo).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {/* Aviso de duplicação */}
                    {conflitoDuplicacao && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-red-600">⚠️</span>
                          <span className="text-red-700 text-sm font-medium">
                            {conflitoDuplicacao}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Só mostrar campos de data/adversário se não há viagem selecionada */}
                    {!camposDevemEstarBloqueados && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Data do Jogo */}
                        <FormField
                          control={form.control}
                          name="jogo_data"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data e Hora do Jogo *</FormLabel>
                              <FormControl>
                                <Input
                                  type="datetime-local"
                                  {...field}
                                  className="w-full"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Adversário */}
                        <FormField
                          control={form.control}
                          name="adversario"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adversário *</FormLabel>
                              <FormControl>
                                <AdversarioSearchInput
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  onLogoChange={(logoUrl) => form.setValue('logo_adversario', logoUrl)}
                                  placeholder="Digite o nome do adversário..."
                                  disabled={estados.salvando}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Mostrar dados do jogo quando há viagem selecionada */}
                    {camposDevemEstarBloqueados && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Dados do Jogo (Definidos pela Viagem)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Adversário:</span>
                            <p className="font-medium">{form.watch('adversario')}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Data e Hora:</span>
                            <p className="font-medium">
                              {form.watch('jogo_data') ? 
                                new Date(form.watch('jogo_data')).toLocaleString('pt-BR') : 
                                'Não definida'
                              }
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Local:</span>
                            <p className="font-medium">
                              {localJogo === 'casa' ? '🏠 Casa (Maracanã)' : '✈️ Fora'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Logo do Adversário - só mostrar se não há viagem selecionada */}
                    {!camposDevemEstarBloqueados && (
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="logo_adversario"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Logo do Adversário (opcional)</FormLabel>
                              <div className="flex gap-3 items-start">
                                {/* Preview do logo */}
                                <div className="w-12 h-12 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
                                  {field.value ? (
                                    <img 
                                      src={field.value} 
                                      alt="Logo do adversário" 
                                      className="w-8 h-8 object-contain" 
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null;
                                        target.src = `https://via.placeholder.com/32x32/cccccc/666666?text=${form.watch('adversario')?.substring(0, 2).toUpperCase() || '?'}`;
                                      }}
                                    />
                                  ) : (
                                    <span className="text-xs text-gray-400 font-medium">
                                      {form.watch('adversario')?.substring(0, 2).toUpperCase() || '?'}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Campo de input */}
                                <div className="flex-1">
                                  <FormControl>
                                    <Input 
                                      placeholder="https://logodetimes.com/..." 
                                      {...field} 
                                      value={field.value || ''}
                                      disabled={estados.salvando}
                                    />
                                  </FormControl>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {field.value ? 
                                      'URL personalizada do logo (editável)' : 
                                      'Será preenchido automaticamente ao selecionar adversário'
                                    }
                                  </p>
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Local do Jogo - só mostrar se não há viagem selecionada */}
                    {!camposDevemEstarBloqueados && (
                      <div className="space-y-2">
                        <FormLabel>Local do Jogo *</FormLabel>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={localJogo === 'casa' ? 'default' : 'outline'}
                            onClick={() => handleLocalJogoChange('casa')}
                            className="flex-1"
                          >
                            🏠 Casa (Maracanã)
                          </Button>
                          <Button
                            type="button"
                            variant={localJogo === 'fora' ? 'default' : 'outline'}
                            onClick={() => handleLocalJogoChange('fora')}
                            className="flex-1"
                          >
                            ✈️ Fora
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Setor */}
                    <FormField
                      control={form.control}
                      name="setor_estadio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Setor *</FormLabel>
                          {localJogo === 'casa' ? (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o setor do Maracanã" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {setoresMaracana.map((setor) => (
                                  <SelectItem key={setor} value={setor}>
                                    {setor}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <FormControl>
                              <Input 
                                placeholder="Digite o setor do estádio visitante" 
                                {...field} 
                              />
                            </FormControl>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Observações - Movido do Pagamento Inicial */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Observações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="observacoes"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Informações adicionais sobre o ingresso..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

              </div>

              {/* Coluna 2: Controle Financeiro */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Controle Financeiro
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Preço de Custo */}
                    <FormField
                      control={form.control}
                      name="preco_custo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço de Custo *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0,00"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Preço de Venda */}
                    <FormField
                      control={form.control}
                      name="preco_venda"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço de Venda *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0,00"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Desconto */}
                    <FormField
                      control={form.control}
                      name="desconto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Desconto</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0,00"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Resumo de Pagamentos - Layout Horizontal Melhorado */}
                    {ingresso && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                        <div className="mb-3">
                          <h4 className="font-semibold flex items-center gap-2 text-blue-800">
                            💳 Resumo de Pagamentos
                          </h4>
                        </div>
                        
                        {(() => {
                          const resumo = calcularResumo(valoresCalculados.valorFinal);
                          const getStatusInfo = (totalPago: number, valorFinal: number) => {
                            if (totalPago === 0) {
                              return { status: 'pendente', cor: 'bg-red-100 text-red-800', emoji: '🔴', texto: 'Pendente' };
                            } else if (totalPago < valorFinal) {
                              return { status: 'parcial', cor: 'bg-yellow-100 text-yellow-800', emoji: '🟡', texto: 'Parcial' };
                            } else {
                              return { status: 'pago', cor: 'bg-green-100 text-green-800', emoji: '🟢', texto: 'Pago' };
                            }
                          };
                          
                          const statusInfo = getStatusInfo(resumo.totalPago, valoresCalculados.valorFinal);
                          
                          return (
                            <>
                              {/* Layout Horizontal Compacto */}
                              <div className="flex items-center justify-between bg-white p-3 rounded-lg mb-3">
                                <div className="flex items-center gap-6">
                                  <div className="text-center">
                                    <p className="text-xs text-gray-500">Total</p>
                                    <p className="font-bold text-sm">{formatCurrency(valoresCalculados.valorFinal)}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs text-gray-500">Pago</p>
                                    <p className="font-bold text-sm text-green-600">{formatCurrency(resumo.totalPago)}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs text-gray-500">Restante</p>
                                    <p className="font-bold text-sm text-red-600">{formatCurrency(resumo.saldoDevedor)}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge className={statusInfo.cor}>
                                    {statusInfo.emoji} {statusInfo.texto}
                                  </Badge>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">Progresso</p>
                                    <p className="font-bold text-sm">{resumo.percentualPago.toFixed(1)}%</p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Barra de Progresso Compacta */}
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300" 
                                  style={{width: `${Math.min(resumo.percentualPago, 100)}%`}}
                                ></div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pagamento Inicial - Só aparece no modo criação */}
                {!ingresso && (
                  <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                        💳 Pagamento Inicial
                        <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                          Opcional
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-lg border border-green-200">
                        <input
                          type="checkbox"
                          id="registrar-pagamento"
                          checked={pagamentoInicial.registrar}
                          onChange={(e) => setPagamentoInicial(prev => ({
                            ...prev,
                            registrar: e.target.checked
                          }))}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <label htmlFor="registrar-pagamento" className="text-sm font-medium text-green-800 cursor-pointer">
                          ✅ Cliente já pagou (registrar pagamento agora)
                        </label>
                      </div>
                      
                      {pagamentoInicial.registrar && (
                        <div className="space-y-4 p-4 bg-white rounded-lg border border-green-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">💰</span>
                            </div>
                            <h4 className="font-semibold text-green-800">Dados do Pagamento</h4>
                          </div>
                          
                          {/* Layout Horizontal - 3 colunas (removido observações) */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-sm font-medium">Valor Pago</label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max={valoresCalculados.valorFinal}
                                value={pagamentoInicial.valor}
                                onChange={(e) => setPagamentoInicial(prev => ({
                                  ...prev,
                                  valor: Number(e.target.value)
                                }))}
                                placeholder="0,00"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Forma</label>
                              <Select 
                                value={pagamentoInicial.forma} 
                                onValueChange={(value: any) => setPagamentoInicial(prev => ({
                                  ...prev,
                                  forma: value
                                }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="dinheiro">💵 Dinheiro</SelectItem>
                                  <SelectItem value="pix">📱 PIX</SelectItem>
                                  <SelectItem value="cartao_credito">💳 Cartão de Crédito</SelectItem>
                                  <SelectItem value="cartao_debito">💳 Cartão de Débito</SelectItem>
                                  <SelectItem value="transferencia">🏦 Transferência</SelectItem>
                                  <SelectItem value="outros">🔄 Outros</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Data</label>
                              <Input
                                type="date"
                                value={pagamentoInicial.data}
                                onChange={(e) => setPagamentoInicial(prev => ({
                                  ...prev,
                                  data: e.target.value
                                }))}
                              />
                            </div>
                          </div>
                          
                          {/* Resumo do Saldo Restante */}
                          {pagamentoInicial.valor > 0 && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                              <div className="flex items-center justify-between">
                                <div className="text-center flex-1">
                                  <p className="text-xs text-gray-600">Valor Total</p>
                                  <p className="font-bold text-gray-800">{formatCurrency(valoresCalculados.valorFinal)}</p>
                                </div>
                                <div className="text-center flex-1">
                                  <p className="text-xs text-gray-600">Valor Pago</p>
                                  <p className="font-bold text-green-600">{formatCurrency(pagamentoInicial.valor)}</p>
                                </div>
                                <div className="text-center flex-1">
                                  <p className="text-xs text-gray-600">Saldo Restante</p>
                                  <p className={`font-bold ${Math.max(0, valoresCalculados.valorFinal - pagamentoInicial.valor) === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(Math.max(0, valoresCalculados.valorFinal - pagamentoInicial.valor))}
                                  </p>
                                </div>
                                <div className="text-center flex-1">
                                  <p className="text-xs text-gray-600">Status</p>
                                  <Badge className={
                                    pagamentoInicial.valor >= valoresCalculados.valorFinal 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }>
                                    {pagamentoInicial.valor >= valoresCalculados.valorFinal ? '🟢 Quitado' : '🟡 Parcial'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Resumo Calculado */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resumo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Valor Final:</span>
                      <span className="font-semibold">
                        {formatCurrency(valoresCalculados.valorFinal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lucro:</span>
                      <span className={`font-semibold ${
                        valoresCalculados.lucro >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(valoresCalculados.lucro)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Margem:</span>
                      <Badge variant={valoresCalculados.margemPercentual >= 0 ? 'default' : 'destructive'}>
                        {valoresCalculados.margemPercentual.toFixed(1)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Botões */}
            {/* Botões - Layout Limpo */}
            <div className="flex justify-end items-center pt-4 border-t bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="px-6"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={estados.salvando || !!conflitoDuplicacao}
                  className="px-6 bg-blue-600 hover:bg-blue-700"
                >
                  {estados.salvando ? 'Salvando...' : (ingresso ? 'Atualizar Ingresso' : 'Cadastrar Ingresso')}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

    {/* Modal de Histórico de Pagamentos */}
    {ingresso && (
      <Dialog open={modalHistoricoAberto} onOpenChange={setModalHistoricoAberto}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>📋 Histórico de Pagamentos</DialogTitle>
              <Button
                onClick={() => {
                  // Criar um novo pagamento simples
                  const valorRestante = valoresCalculados.valorFinal - calcularResumo(valoresCalculados.valorFinal).totalPago;
                  const valorSugerido = Math.max(0, valorRestante);
                  
                  const novoValor = prompt(`💳 Registrar Novo Pagamento\n\nValor restante: ${formatCurrency(valorRestante)}\n\nDigite o valor do pagamento:`, valorSugerido.toString());
                  
                  if (novoValor && !isNaN(Number(novoValor)) && Number(novoValor) > 0) {
                    const observacao = prompt('Observações (opcional):') || '';
                    
                    // Aqui você integraria com o sistema de pagamentos
                    alert(`✅ Pagamento registrado!\n\nValor: ${formatCurrency(Number(novoValor))}\nObservação: ${observacao || 'Nenhuma'}\n\n(Funcionalidade será integrada ao sistema)`);
                    
                    // Recarregar pagamentos
                    if (ingresso) {
                      buscarPagamentos(ingresso.id);
                    }
                  }
                }}
                size="sm"
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                ➕ Novo Pagamento
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Resumo */}
            {(() => {
              const resumo = calcularResumo(valoresCalculados.valorFinal);
              return (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Resumo Geral</h4>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Valor Total</p>
                      <p className="font-bold">{formatCurrency(valoresCalculados.valorFinal)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Pago</p>
                      <p className="font-bold text-green-600">{formatCurrency(resumo.totalPago)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Saldo Devedor</p>
                      <p className="font-bold text-red-600">{formatCurrency(resumo.saldoDevedor)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-bold">
                        {resumo.quitado ? '🟢 Quitado' : 
                         resumo.totalPago > 0 ? '🟡 Parcial' : '🔴 Pendente'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
            
            {/* Lista de Pagamentos */}
            <div>
              <h4 className="font-semibold mb-2">Histórico de Movimentações</h4>
              {pagamentos.length > 0 ? (
                <div className="space-y-2">
                  {pagamentos.map((pagamento) => (
                    <div key={pagamento.id} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {format(new Date(pagamento.data_pagamento), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                        <p className="text-sm text-gray-600">
                          {pagamento.forma_pagamento} {pagamento.observacoes && `- ${pagamento.observacoes}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {formatCurrency(pagamento.valor_pago)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum pagamento registrado ainda</p>
                  <p className="text-sm">Use o botão "Detalhes" na lista de ingressos para registrar pagamentos</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
}