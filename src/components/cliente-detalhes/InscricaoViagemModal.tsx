import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CIDADES_EMBARQUE_COMPLETA, isCidadeOutra, isCidadePredefinida } from '@/data/cidades';
import { getSetorOptions } from '@/data/estadios';
import { Input } from '@/components/ui/input';

interface Viagem {
  id: number;
  adversario: string;
  data_jogo: string;
  local_jogo: string;
  valor_padrao: number;
  capacidade_onibus: number;
  status_viagem: string;
  vagas_disponiveis?: number; // Calculado dinamicamente
  tem_passeios?: boolean;
  cliente_ja_inscrito?: boolean; // Se o cliente atual já está inscrito
  // Campos de configuração de pagamento
  tipo_pagamento?: 'livre' | 'parcelado_flexivel' | 'parcelado_obrigatorio';
  exige_pagamento_completo?: boolean;
  dias_antecedencia?: number;
  permite_viagem_com_pendencia?: boolean;
}

interface Passeio {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
  obrigatorio: boolean;
}

interface Cliente {
  id: number;
  nome: string;
}

interface InscricaoViagemModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente;
  onSuccess: () => void;
}

const InscricaoViagemModal: React.FC<InscricaoViagemModalProps> = ({
  isOpen,
  onClose,
  cliente,
  onSuccess
}) => {
  const [step, setStep] = useState<'viagem' | 'configuracoes' | 'passeios' | 'onibus' | 'pagamento' | 'confirmacao'>('viagem');
  const [loading, setLoading] = useState(false);
  const [viagensDisponiveis, setViagensDisponiveis] = useState<Viagem[]>([]);
  const [viagemSelecionada, setViagemSelecionada] = useState<Viagem | null>(null);
  const [passeiosDisponiveis, setPasseiosDisponiveis] = useState<Passeio[]>([]);
  const [passeiosSelecionados, setPasseiosSelecionados] = useState<string[]>([]);
  const [formaPagamento, setFormaPagamento] = useState<'avista' | 'parcelado'>('avista');
  const [numeroParcelas, setNumeroParcelas] = useState<number>(2);
  const [onibusDisponiveis, setOnibusDisponiveis] = useState<any[]>([]);
  const [onibusSelecionado, setOnibusSelecionado] = useState<string>('');
  const [cidadeEmbarque, setCidadeEmbarque] = useState<string>('Blumenau');
  const [cidadeEmbarqueCustom, setCidadeEmbarqueCustom] = useState<string>('');
  const [setorIngresso, setSetorIngresso] = useState<string>('Norte');
  const [carregarPadrao, setCarregarPadrao] = useState<boolean>(false);
  // Removido useToast, usando toast diretamente do sonner

  // Carregar viagens disponíveis
  useEffect(() => {
    if (isOpen) {
      carregarViagensDisponiveis();
    }
  }, [isOpen]);

  const carregarViagensDisponiveis = async () => {
    try {
      setLoading(true);
      
      // Buscar viagens abertas
      const { data: viagensData, error: viagensError } = await supabase
        .from('viagens')
        .select('*')
        .eq('status_viagem', 'Aberta')
        .gte('data_jogo', new Date().toISOString())
        .order('data_jogo', { ascending: true });

      if (viagensError) throw viagensError;

      if (!viagensData || viagensData.length === 0) {
        setViagensDisponiveis([]);
        return;
      }

      // Para cada viagem, calcular vagas disponíveis e verificar se cliente já está inscrito
      const viagensComVagas = await Promise.all(
        viagensData.map(async (viagem) => {
          // Contar passageiros já inscritos
          const { count: passageirosInscritos } = await supabase
            .from('viagem_passageiros')
            .select('*', { count: 'exact', head: true })
            .eq('viagem_id', viagem.id);

          // Verificar se este cliente já está inscrito
          const { data: clienteJaInscrito } = await supabase
            .from('viagem_passageiros')
            .select('id')
            .eq('viagem_id', viagem.id)
            .eq('cliente_id', cliente.id)
            .single();

          const vagasDisponiveis = viagem.capacidade_onibus - (passageirosInscritos || 0);

          return {
            ...viagem,
            vagas_disponiveis: Math.max(0, vagasDisponiveis),
            tem_passeios: false, // Por enquanto, pode ser configurado depois
            cliente_ja_inscrito: !!clienteJaInscrito
          };
        })
      );

      // Filtrar apenas viagens com vagas disponíveis e onde o cliente não está inscrito
      const viagensComVagasDisponiveis = viagensComVagas.filter(v => 
        v.vagas_disponiveis > 0 && !v.cliente_ja_inscrito
      );
      
      setViagensDisponiveis(viagensComVagasDisponiveis);
    } catch (error) {
      console.error('Erro ao carregar viagens:', error);
      toast.error("Não foi possível carregar as viagens disponíveis.");
    } finally {
      setLoading(false);
    }
  };

  const carregarConfiguracoesPadrao = async (viagem: Viagem) => {
    try {
      // Carregar configurações padrão da viagem
      const { data: viagemCompleta, error } = await supabase
        .from('viagens')
        .select(`
          *,
          viagem_passeios (
            passeio_id,
            passeios (
              id,
              nome,
              valor,
              categoria
            )
          )
        `)
        .eq('id', viagem.id)
        .single();

      if (error) throw error;

      if (viagemCompleta) {
        // Configurar cidade de embarque padrão (pode ser configurável por viagem)
        setCidadeEmbarque('Blumenau');
        
        // Configurar setor padrão baseado no local do jogo
        const setoresDisponiveis = getSetorOptions(viagemCompleta.local_jogo || 'Rio de Janeiro');
        setSetorIngresso(setoresDisponiveis[0] || 'Norte');
        
        // Carregar passeios da viagem se existirem
        if (viagemCompleta.viagem_passeios && viagemCompleta.viagem_passeios.length > 0) {
          const passeiosViagem = viagemCompleta.viagem_passeios.map(vp => ({
            id: vp.passeios.id,
            nome: vp.passeios.nome,
            descricao: `Passeio incluído na viagem`,
            valor: vp.passeios.valor || 0,
            obrigatorio: false
          }));
          
          setPasseiosDisponiveis(passeiosViagem);
          
          // Atualizar flag de tem_passeios baseado nos dados reais
          viagemCompleta.tem_passeios = true;
          
          // Se carregar padrão estiver ativo, selecionar todos os passeios
          if (carregarPadrao) {
            setPasseiosSelecionados(passeiosViagem.map(p => p.id));
          }
        } else {
          // Não há passeios cadastrados para esta viagem
          viagemCompleta.tem_passeios = false;
          setPasseiosDisponiveis([]);
          setPasseiosSelecionados([]);
        }
        
        toast.success('Configurações padrão carregadas com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao carregar configurações padrão:', error);
      toast.error('Erro ao carregar configurações padrão da viagem');
    }
  };

  const carregarPasseios = async (_viagemId: number) => {
    try {
      // Aqui você carregaria os passeios da viagem
      // Por enquanto, vou usar dados mock baseados no sistema existente
      const passeiosMock: Passeio[] = [
        {
          id: 'city-tour',
          nome: 'City Tour',
          descricao: 'Passeio pela cidade antes do jogo',
          valor: 50,
          obrigatorio: false
        },
        {
          id: 'almoco',
          nome: 'Almoço',
          descricao: 'Almoço em restaurante local',
          valor: 35,
          obrigatorio: false
        },
        {
          id: 'transfer-hotel',
          nome: 'Transfer Hotel',
          descricao: 'Transfer do hotel para o estádio',
          valor: 25,
          obrigatorio: true
        }
      ];
      
      setPasseiosDisponiveis(passeiosMock);
      
      // Selecionar passeios obrigatórios automaticamente
      const obrigatorios = passeiosMock
        .filter(p => p.obrigatorio)
        .map(p => p.id);
      setPasseiosSelecionados(obrigatorios);
      
    } catch (error) {
      console.error('Erro ao carregar passeios:', error);
    }
  };

  const carregarOnibusDisponiveis = async (viagemId: number) => {
    try {
      // Buscar ônibus da viagem
      const { data: onibusData, error: onibusError } = await supabase
        .from('viagem_onibus')
        .select('*')
        .eq('viagem_id', viagemId);

      if (onibusError) throw onibusError;

      if (!onibusData || onibusData.length === 0) {
        setOnibusDisponiveis([]);
        return;
      }

      // Para cada ônibus, calcular vagas disponíveis
      const onibusComVagas = await Promise.all(
        onibusData.map(async (onibus) => {
          // Contar passageiros já no ônibus
          const { count: passageirosNoOnibus } = await supabase
            .from('viagem_passageiros')
            .select('*', { count: 'exact', head: true })
            .eq('onibus_id', onibus.id);

          const capacidadeTotal = onibus.capacidade_onibus + (onibus.lugares_extras || 0);
          const vagasDisponiveis = capacidadeTotal - (passageirosNoOnibus || 0);

          return {
            ...onibus,
            vagas_disponiveis: Math.max(0, vagasDisponiveis),
            capacidade_total: capacidadeTotal
          };
        })
      );

      // Filtrar apenas ônibus com vagas
      const onibusComVagasDisponiveis = onibusComVagas.filter(o => o.vagas_disponiveis > 0);
      setOnibusDisponiveis(onibusComVagasDisponiveis);

      // Selecionar automaticamente o primeiro ônibus se houver apenas um
      if (onibusComVagasDisponiveis.length === 1) {
        setOnibusSelecionado(onibusComVagasDisponiveis[0].id);
      }

    } catch (error) {
      console.error('Erro ao carregar ônibus:', error);
      toast.error("Erro ao carregar ônibus disponíveis.");
    }
  };

  const calcularValorTotal = () => {
    if (!viagemSelecionada) return 0;
    
    const valorViagem = viagemSelecionada.valor_padrao || 0;
    const valorPasseios = passeiosDisponiveis
      .filter(p => passeiosSelecionados.includes(p.id))
      .reduce((total, p) => total + p.valor, 0);
    
    return valorViagem + valorPasseios;
  };

  const calcularValorParcela = () => {
    const total = calcularValorTotal();
    return total / numeroParcelas;
  };

  const handleSelecionarViagem = (viagem: Viagem) => {
    setViagemSelecionada(viagem);
    
    // Sempre carregar ônibus disponíveis
    carregarOnibusDisponiveis(viagem.id);
    
    // Configurar valores padrão baseados na viagem selecionada
    const setoresDisponiveis = getSetorOptions(viagem.local_jogo || 'Rio de Janeiro');
    setSetorIngresso(setoresDisponiveis[0] || 'Norte');
    
    // Ir para etapa de configurações
    setStep('configuracoes');
  };

  const handleTogglePasseio = (passeioId: string) => {
    const passeio = passeiosDisponiveis.find(p => p.id === passeioId);
    if (passeio?.obrigatorio) return; // Não pode desmarcar obrigatórios
    
    setPasseiosSelecionados(prev => 
      prev.includes(passeioId)
        ? prev.filter(id => id !== passeioId)
        : [...prev, passeioId]
    );
  };

  const handleConfirmarInscricao = async () => {
    if (!viagemSelecionada) return;
    
    try {
      setLoading(true);
      
      // Verificar se o cliente já está inscrito nesta viagem
      const { data: inscricaoExistente, error: verificacaoError } = await supabase
        .from('viagem_passageiros')
        .select('id')
        .eq('viagem_id', viagemSelecionada.id.toString())
        .eq('cliente_id', cliente.id.toString())
        .single();

      if (verificacaoError && verificacaoError.code !== 'PGRST116') {
        throw verificacaoError;
      }

      if (inscricaoExistente) {
        toast.error(`${cliente.nome} já está inscrito nesta viagem.`);
        return;
      }
      
      const valorTotal = calcularValorTotal();
      const valorParcela = formaPagamento === 'parcelado' ? calcularValorParcela() : valorTotal;
      
      // Inserir na tabela viagem_passageiros
      const { data: inscricao, error: inscricaoError } = await supabase
        .from('viagem_passageiros')
        .insert({
          viagem_id: viagemSelecionada.id.toString(),
          cliente_id: cliente.id.toString(),
          onibus_id: onibusSelecionado,
          valor: valorTotal,
          forma_pagamento: formaPagamento === 'avista' ? 'À vista' : 'Parcelado',
          status_pagamento: 'Pendente',
          setor_maracana: setorIngresso,
          cidade_embarque: cidadeEmbarque,
          observacoes: passeiosSelecionados.length > 0 ? 
            `Passeios selecionados: ${passeiosDisponiveis
              .filter(p => passeiosSelecionados.includes(p.id))
              .map(p => p.nome)
              .join(', ')}` : null
        })
        .select()
        .single();

      if (inscricaoError) throw inscricaoError;

      // Criar parcelas baseado na configuração da viagem
      const parcelas = [];
      const tipoPagamento = viagemSelecionada.tipo_pagamento || 'livre';
      
      let totalParcelas = 1;
      let tipoParcelamento = 'avista';
      
      if (tipoPagamento === 'livre') {
        // Pagamento livre: uma única "parcela" com valor total
        totalParcelas = 1;
        tipoParcelamento = 'personalizado';
      } else if (tipoPagamento === 'parcelado_obrigatorio') {
        // Parcelamento obrigatório: parcelas fixas (ex: 3 parcelas)
        totalParcelas = 3; // Pode ser configurável por viagem
        tipoParcelamento = 'parcelado';
      } else if (tipoPagamento === 'parcelado_flexivel') {
        // Parcelamento flexível: respeita escolha do usuário
        totalParcelas = formaPagamento === 'parcelado' ? numeroParcelas : 1;
        tipoParcelamento = formaPagamento === 'parcelado' ? 'parcelado' : 'avista';
      }
      
      const valorPorParcela = valorTotal / totalParcelas;
      
      for (let i = 1; i <= totalParcelas; i++) {
        const dataVencimento = new Date();
        dataVencimento.setMonth(dataVencimento.getMonth() + (i - 1));
        
        parcelas.push({
          viagem_passageiro_id: inscricao.id,
          numero_parcela: i,
          total_parcelas: totalParcelas,
          valor_parcela: valorPorParcela,
          valor_original: valorTotal,
          data_vencimento: dataVencimento.toISOString().split('T')[0],
          status: 'pendente',
          forma_pagamento: tipoPagamento === 'livre' ? 'Livre' : 
                          tipoPagamento === 'parcelado_obrigatorio' ? 'Obrigatório' :
                          formaPagamento === 'avista' ? 'À vista' : 'Parcelado',
          tipo_parcelamento: tipoParcelamento
        });
      }

      const { error: parcelasError } = await supabase
        .from('viagem_passageiros_parcelas')
        .insert(parcelas);

      if (parcelasError) throw parcelasError;

      // Não precisamos atualizar vagas_disponiveis pois é calculado dinamicamente
      // baseado na capacidade_onibus menos os passageiros inscritos

      toast.success(`${cliente.nome} foi inscrito na viagem com sucesso.`);

      onSuccess();
      onClose();
      resetModal();
      
    } catch (error) {
      console.error('Erro ao confirmar inscrição:', error);
      toast.error("Não foi possível confirmar a inscrição. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('viagem');
    setViagemSelecionada(null);
    setPasseiosDisponiveis([]);
    setPasseiosSelecionados([]);
    setFormaPagamento('avista');
    setNumeroParcelas(2);
    setOnibusDisponiveis([]);
    setOnibusSelecionado('');
    setCidadeEmbarque('Blumenau');
    setCidadeEmbarqueCustom('');
    setSetorIngresso('Norte');
    setCarregarPadrao(false);
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Inscrever {cliente.nome} em Viagem</span>
          </DialogTitle>
        </DialogHeader>

        {/* Indicador de Etapas */}
        <div className="flex items-center justify-center space-x-4 py-4">
          {['viagem', 'configuracoes', 'passeios', 'onibus', 'pagamento', 'confirmacao'].map((stepName, index) => {
            const currentIndex = ['viagem', 'configuracoes', 'passeios', 'onibus', 'pagamento', 'confirmacao'].indexOf(step);
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;
            const isDisabled = index > currentIndex;
            
            // Pular etapa de passeios se a viagem não tem passeios
            if (stepName === 'passeios' && viagemSelecionada && !viagemSelecionada.tem_passeios) {
              return null;
            }
            
            return (
              <div key={stepName} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${isActive ? 'bg-blue-600 text-white' : ''}
                  ${isCompleted ? 'bg-green-600 text-white' : ''}
                  ${isDisabled ? 'bg-gray-200 text-gray-400' : ''}
                `}>
                  {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
                {index < 5 && (
                  <div className={`w-12 h-0.5 mx-2 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-6">
          {/* Etapa 1: Seleção de Viagem */}
          {step === 'viagem' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Selecione uma Viagem</h3>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2">Carregando viagens...</span>
                </div>
              ) : viagensDisponiveis.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Nenhuma viagem disponível</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {cliente.nome} já está inscrito em todas as viagens abertas<br />
                    ou não há viagens com vagas disponíveis no momento.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {viagensDisponiveis.map((viagem) => (
                    <Card 
                      key={viagem.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleSelecionarViagem(viagem)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-lg">{viagem.adversario}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {format(new Date(viagem.data_jogo), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {viagem.local_jogo}
                              </div>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {viagem.vagas_disponiveis} vagas
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              R$ {viagem.valor_padrao?.toFixed(2) || '0.00'}
                            </p>
                            <Badge variant="secondary">
                              {viagem.tem_passeios ? 'Com Passeios' : 'Apenas Viagem'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Etapa 2: Configurações da Inscrição */}
          {step === 'configuracoes' && viagemSelecionada && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Configurações da Inscrição</h3>
              
              {/* Resumo da Viagem Selecionada */}
              <Card className="mb-6 bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">{viagemSelecionada.adversario}</h4>
                      <p className="text-sm text-blue-700">
                        {format(new Date(viagemSelecionada.data_jogo), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} - {viagemSelecionada.local_jogo}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-800">
                        R$ {viagemSelecionada.valor_padrao?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Opção para carregar configurações padrão */}
              <Card className="mb-6 bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="carregar-padrao"
                      checked={carregarPadrao}
                      onCheckedChange={(checked) => {
                        setCarregarPadrao(checked as boolean);
                        if (checked) {
                          carregarConfiguracoesPadrao(viagemSelecionada);
                        }
                      }}
                    />
                    <Label htmlFor="carregar-padrao" className="text-sm font-medium">
                      Carregar configurações padrão desta viagem
                    </Label>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 ml-6">
                    Carrega automaticamente cidade de embarque, setor e passeios padrão baseados na viagem selecionada
                  </p>
                </CardContent>
              </Card>

              {/* Configurações Manuais */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-base">Detalhes da Inscrição</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cidade de Embarque */}
                    <div>
                      <Label className="text-sm font-medium">Cidade de Embarque</Label>
                      <div className="space-y-2">
                        <Select
                          value={isCidadePredefinida(cidadeEmbarque) ? cidadeEmbarque : ""}
                          onValueChange={(value) => {
                            if (isCidadeOutra(value)) {
                              setCidadeEmbarqueCustom("");
                              setCidadeEmbarque(""); // Limpar para permitir input manual
                            } else {
                              setCidadeEmbarqueCustom("");
                              setCidadeEmbarque(value);
                            }
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecione a cidade" />
                          </SelectTrigger>
                          <SelectContent>
                            {CIDADES_EMBARQUE_COMPLETA.map((cidade) => (
                              <SelectItem key={cidade} value={cidade}>
                                {cidade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {/* Campo manual quando "Outra" for selecionada ou valor não está na lista predefinida */}
                        {(cidadeEmbarque === "" || !isCidadePredefinida(cidadeEmbarque)) && (
                          <Input
                            placeholder="Digite o nome da cidade"
                            value={cidadeEmbarqueCustom || cidadeEmbarque}
                            onChange={(e) => {
                              const value = e.target.value;
                              setCidadeEmbarqueCustom(value);
                              setCidadeEmbarque(value);
                            }}
                            className="mt-1"
                          />
                        )}
                      </div>
                    </div>

                    {/* Setor do Ingresso */}
                    <div>
                      <Label className="text-sm font-medium">Setor do Ingresso</Label>
                      <Select value={setorIngresso} onValueChange={setSetorIngresso}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione o setor" />
                        </SelectTrigger>
                        <SelectContent>
                          {getSetorOptions(viagemSelecionada.local_jogo || 'Rio de Janeiro').map((setor) => (
                            <SelectItem key={setor} value={setor}>
                              {setor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep('viagem')}>
                  Voltar
                </Button>
                <Button onClick={async () => {
                  // Verificar se a viagem tem passeios cadastrados
                  try {
                    const { data: viagemPasseios, error } = await supabase
                      .from('viagem_passeios')
                      .select('passeio_id')
                      .eq('viagem_id', viagemSelecionada.id);
                    
                    if (error) throw error;
                    
                    const temPasseios = viagemPasseios && viagemPasseios.length > 0;
                    
                    if (temPasseios) {
                      carregarPasseios(viagemSelecionada.id);
                      setStep('passeios');
                    } else {
                      setStep('onibus');
                    }
                  } catch (error) {
                    console.error('Erro ao verificar passeios:', error);
                    // Em caso de erro, pular para ônibus
                    setStep('onibus');
                  }
                }}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 3: Seleção de Passeios */}
          {step === 'passeios' && viagemSelecionada && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Selecione os Passeios</h3>
              
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium">{viagemSelecionada.adversario}</h4>
                <p className="text-sm text-gray-600">
                  {format(new Date(viagemSelecionada.data_jogo), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>

              <div className="space-y-3">
                {passeiosDisponiveis.map((passeio) => (
                  <Card key={passeio.id} className={`
                    cursor-pointer transition-all
                    ${passeiosSelecionados.includes(passeio.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                    ${passeio.obrigatorio ? 'border-orange-300 bg-orange-50' : ''}
                  `}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={passeiosSelecionados.includes(passeio.id)}
                            onChange={() => handleTogglePasseio(passeio.id)}
                            disabled={passeio.obrigatorio}
                            className="h-4 w-4 text-blue-600"
                          />
                          <div>
                            <h5 className="font-medium flex items-center space-x-2">
                              <span>{passeio.nome}</span>
                              {passeio.obrigatorio && (
                                <Badge variant="outline" className="text-orange-600 border-orange-300">
                                  Obrigatório
                                </Badge>
                              )}
                            </h5>
                            <p className="text-sm text-gray-600">{passeio.descricao}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            R$ {passeio.valor.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep('configuracoes')}>
                  Voltar
                </Button>
                <Button onClick={() => setStep('onibus')}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 3: Seleção de Ônibus */}
          {step === 'onibus' && viagemSelecionada && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Selecione o Ônibus</h3>
              
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium">{viagemSelecionada.adversario}</h4>
                <p className="text-sm text-gray-600">
                  {format(new Date(viagemSelecionada.data_jogo), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>

              {onibusDisponiveis.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum ônibus com vagas disponíveis</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {onibusDisponiveis.map((onibus) => (
                    <Card 
                      key={onibus.id} 
                      className={`cursor-pointer transition-all ${
                        onibusSelecionado === onibus.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setOnibusSelecionado(onibus.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="onibus"
                              checked={onibusSelecionado === onibus.id}
                              onChange={() => setOnibusSelecionado(onibus.id)}
                              className="h-4 w-4 text-blue-600"
                            />
                            <div>
                              <h5 className="font-medium">
                                {onibus.tipo_onibus} - {onibus.empresa}
                              </h5>
                              <p className="text-sm text-gray-600">
                                {onibus.numero_identificacao && `Número: ${onibus.numero_identificacao}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              {onibus.vagas_disponiveis} vagas
                            </p>
                            <p className="text-sm text-gray-500">
                              de {onibus.capacidade_total} lugares
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(viagemSelecionada.tem_passeios ? 'passeios' : 'configuracoes')}
                >
                  Voltar
                </Button>
                <Button 
                  onClick={() => setStep('pagamento')}
                  disabled={!onibusSelecionado}
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 3: Forma de Pagamento */}
          {step === 'pagamento' && viagemSelecionada && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Forma de Pagamento</h3>
              
              {/* Resumo */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-base">Resumo da Inscrição</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Detalhes da Viagem */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Detalhes da Viagem</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Adversário:</span>
                          <span className="ml-2 font-medium">{viagemSelecionada.adversario}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Data:</span>
                          <span className="ml-2 font-medium">
                            {format(new Date(viagemSelecionada.data_jogo), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Cidade Embarque:</span>
                          <span className="ml-2 font-medium">{cidadeEmbarque}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Setor:</span>
                          <span className="ml-2 font-medium">{setorIngresso}</span>
                        </div>
                      </div>
                    </div>

                    {/* Valores */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Viagem ({viagemSelecionada.adversario})</span>
                        <span>R$ {viagemSelecionada.valor_padrao?.toFixed(2) || '0.00'}</span>
                      </div>
                      {passeiosDisponiveis
                        .filter(p => passeiosSelecionados.includes(p.id))
                        .map(passeio => (
                          <div key={passeio.id} className="flex justify-between text-sm">
                            <span>{passeio.nome}</span>
                            <span>R$ {passeio.valor.toFixed(2)}</span>
                          </div>
                        ))}
                      <hr className="my-2" />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span className="text-green-600">R$ {calcularValorTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Configuração de Pagamento da Viagem */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-base flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Configuração de Pagamento desta Viagem</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tipo de Pagamento:</span>
                      <Badge variant="outline" className={`
                        ${viagemSelecionada.tipo_pagamento === 'livre' ? 'border-blue-300 text-blue-700 bg-blue-50' : ''}
                        ${viagemSelecionada.tipo_pagamento === 'parcelado_flexivel' ? 'border-green-300 text-green-700 bg-green-50' : ''}
                        ${viagemSelecionada.tipo_pagamento === 'parcelado_obrigatorio' ? 'border-orange-300 text-orange-700 bg-orange-50' : ''}
                      `}>
                        {viagemSelecionada.tipo_pagamento === 'livre' && 'Livre'}
                        {viagemSelecionada.tipo_pagamento === 'parcelado_flexivel' && 'Flexível'}
                        {viagemSelecionada.tipo_pagamento === 'parcelado_obrigatorio' && 'Obrigatório'}
                        {!viagemSelecionada.tipo_pagamento && 'Livre (padrão)'}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {viagemSelecionada.tipo_pagamento === 'livre' && 
                        'Você pode pagar valores aleatórios quando quiser.'
                      }
                      {viagemSelecionada.tipo_pagamento === 'parcelado_flexivel' && 
                        'Parcelas sugeridas, mas aceita pagamentos extras.'
                      }
                      {viagemSelecionada.tipo_pagamento === 'parcelado_obrigatorio' && 
                        'Parcelas fixas e obrigatórias.'
                      }
                      {!viagemSelecionada.tipo_pagamento && 
                        'Pagamento livre - você pode pagar quando quiser.'
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Opções de Pagamento baseadas na configuração */}
              {(() => {
                const tipoPagamento = viagemSelecionada.tipo_pagamento || 'livre';
                
                if (tipoPagamento === 'livre') {
                  return (
                    <Card className="mb-6">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <h4 className="font-medium">Pagamento Livre</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Você será inscrito e poderá pagar quando quiser, nos valores que desejar.
                          </p>
                          <p className="text-lg font-semibold text-green-600 mt-2">
                            Total: R$ {calcularValorTotal().toFixed(2)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
                
                if (tipoPagamento === 'parcelado_obrigatorio') {
                  // Para parcelamento obrigatório, usar configuração fixa (ex: 3 parcelas)
                  const parcelasObrigatorias = 3;
                  const valorParcela = calcularValorTotal() / parcelasObrigatorias;
                  
                  return (
                    <Card className="mb-6">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                          <h4 className="font-medium">Parcelamento Obrigatório</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Esta viagem exige pagamento em parcelas fixas.
                          </p>
                          <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                            <p className="font-semibold text-orange-800">
                              {parcelasObrigatorias}x de R$ {valorParcela.toFixed(2)}
                            </p>
                            <p className="text-sm text-orange-600">
                              Total: R$ {calcularValorTotal().toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
                
                // parcelado_flexivel
                return (
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="pagamento"
                          value="avista"
                          checked={formaPagamento === 'avista'}
                          onChange={() => setFormaPagamento('avista')}
                          className="h-4 w-4"
                        />
                        <span>À Vista - R$ {calcularValorTotal().toFixed(2)}</span>
                      </label>
                    </div>
                    
                    <div>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="pagamento"
                          value="parcelado"
                          checked={formaPagamento === 'parcelado'}
                          onChange={() => setFormaPagamento('parcelado')}
                          className="h-4 w-4"
                        />
                        <span>Parcelado (sugerido)</span>
                      </label>
                      
                      {formaPagamento === 'parcelado' && (
                        <div className="ml-6 mt-2">
                          <select 
                            value={numeroParcelas} 
                            onChange={(e) => setNumeroParcelas(parseInt(e.target.value))}
                            className="border rounded px-3 py-1"
                          >
                            {[2, 3, 4, 5, 6].map(num => (
                              <option key={num} value={num}>
                                {num}x de R$ {calcularValorParcela().toFixed(2)}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">
                            * Você poderá fazer pagamentos extras quando quiser
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-between pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('onibus')}
                >
                  Voltar
                </Button>
                <Button onClick={() => setStep('confirmacao')}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 4: Confirmação */}
          {step === 'confirmacao' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Confirmar Inscrição</h3>
              
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-lg">Cliente</h4>
                      <p className="text-gray-600">{cliente.nome}</p>
                    </div>
                    
                    <hr className="my-4" />
                    
                    <div>
                      <h4 className="font-medium text-lg">Viagem</h4>
                      <p className="text-gray-600">
                        {viagemSelecionada?.adversario} - {' '}
                        {viagemSelecionada && format(new Date(viagemSelecionada.data_jogo), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    
                    <hr className="my-4" />
                    
                    <div>
                      <h4 className="font-medium text-lg">Ônibus</h4>
                      <p className="text-gray-600">
                        {(() => {
                          const onibus = onibusDisponiveis.find(o => o.id === onibusSelecionado);
                          return onibus ? `${onibus.tipo_onibus} - ${onibus.empresa}` : 'Ônibus selecionado';
                        })()}
                      </p>
                    </div>
                    
                    {passeiosSelecionados.length > 0 && (
                      <>
                        <hr className="my-4" />
                        <div>
                          <h4 className="font-medium text-lg">Passeios</h4>
                          <ul className="text-gray-600 space-y-1">
                            {passeiosDisponiveis
                              .filter(p => passeiosSelecionados.includes(p.id))
                              .map(passeio => (
                                <li key={passeio.id}>• {passeio.nome}</li>
                              ))}
                          </ul>
                        </div>
                      </>
                    )}
                    
                    <hr className="my-4" />
                    
                    <div>
                      <h4 className="font-medium text-lg">Pagamento</h4>
                      <p className="text-gray-600">
                        {(() => {
                          const tipoPagamento = viagemSelecionada?.tipo_pagamento || 'livre';
                          
                          if (tipoPagamento === 'livre') {
                            return `Livre - R$ ${calcularValorTotal().toFixed(2)} (pague quando quiser)`;
                          }
                          
                          if (tipoPagamento === 'parcelado_obrigatorio') {
                            const parcelas = 3;
                            const valorParcela = calcularValorTotal() / parcelas;
                            return `${parcelas}x de R$ ${valorParcela.toFixed(2)} (obrigatório) = R$ ${calcularValorTotal().toFixed(2)}`;
                          }
                          
                          // parcelado_flexivel
                          if (formaPagamento === 'avista') {
                            return `À vista - R$ ${calcularValorTotal().toFixed(2)}`;
                          } else {
                            return `${numeroParcelas}x de R$ ${calcularValorParcela().toFixed(2)} (flexível) = R$ ${calcularValorTotal().toFixed(2)}`;
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={() => setStep('pagamento')}>
                  Voltar
                </Button>
                <Button 
                  onClick={handleConfirmarInscricao}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Confirmando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar Inscrição
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InscricaoViagemModal;