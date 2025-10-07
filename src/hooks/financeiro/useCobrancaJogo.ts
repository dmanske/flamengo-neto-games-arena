import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { extrairDataDoTimestamp } from '@/utils/dateUtils';
import { Ingresso } from '@/types/ingressos';
import { enviarMensagemCobranca } from '@/services/whatsappService';

// =====================================================
// TIPOS E INTERFACES
// =====================================================

export interface HistoricoCobranca {
  id: string;
  ingresso_id: string;
  tipo_cobranca: 'whatsapp_manual' | 'whatsapp_api';
  data_envio: string;
  status: 'enviado' | 'visualizado' | 'respondido' | 'pago' | 'ignorado';
  mensagem_enviada?: string;
  resposta_cliente?: string;
  observacoes?: string;
  enviado_por?: string;
  created_at: string;
}

export interface EstatisticaCobranca {
  ingresso_id: string;
  cliente_nome: string;
  adversario: string;
  jogo_data: string;
  situacao_financeira: string;
  valor_final: number;
  total_tentativas: number;
  tentativas_whatsapp: number;
  tentativas_email: number;
  tentativas_telefone: number;
  ultima_cobranca?: string;
  respostas_recebidas: number;
}

export interface IngressoPendente extends Ingresso {
  dias_em_atraso: number;
  total_tentativas_cobranca: number;
  ultima_tentativa?: string;
  prioridade: 'alta' | 'media' | 'baixa';
}

export interface TemplateCobranca {
  tipo: 'whatsapp' | 'email' | 'telefone';
  titulo: string;
  mensagem: string;
  variaveis: string[];
}

// =====================================================
// TEMPLATES DE COBRANÇA
// =====================================================

const TEMPLATES_COBRANCA: TemplateCobranca[] = [
  {
    tipo: 'whatsapp',
    titulo: 'Lembrete Amigável',
    mensagem: `Olá {NOME}! 👋

Tudo bem? Esperamos você no jogo {ADVERSARIO} no dia {DATA}! 🔴⚫

Só lembrando que ainda temos o valor de {VALOR} pendente do seu ingresso.

Pode nos ajudar com o pagamento? 😊

Qualquer dúvida, estamos aqui!`,
    variaveis: ['NOME', 'ADVERSARIO', 'DATA', 'VALOR']
  },
  {
    tipo: 'whatsapp',
    titulo: 'Cobrança Urgente',
    mensagem: `{NOME}, o jogo {ADVERSARIO} está chegando! ⚽

Precisamos regularizar o pagamento de {VALOR} do seu ingresso até amanhã.

Setor: {SETOR}
Data: {DATA}

Por favor, entre em contato conosco hoje mesmo! 🙏`,
    variaveis: ['NOME', 'ADVERSARIO', 'VALOR', 'SETOR', 'DATA']
  },
  {
    tipo: 'email',
    titulo: 'Confirmação de Pagamento Pendente',
    mensagem: `Prezado(a) {NOME},

Esperamos que esteja bem!

Identificamos que o pagamento do seu ingresso para o jogo {ADVERSARIO} vs Flamengo ainda está pendente.

Detalhes do Ingresso:
- Jogo: Flamengo vs {ADVERSARIO}
- Data: {DATA}
- Setor: {SETOR}
- Valor: {VALOR}

Para garantir sua entrada no estádio, solicitamos a regularização do pagamento o quanto antes.

Atenciosamente,
Equipe de Ingressos`,
    variaveis: ['NOME', 'ADVERSARIO', 'DATA', 'SETOR', 'VALOR']
  }
];

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export function useCobrancaJogo(jogoKey: string) {
  // Estados
  const [ingressosPendentes, setIngressosPendentes] = useState<IngressoPendente[]>([]);
  const [historicoCobrancas, setHistoricoCobrancas] = useState<HistoricoCobranca[]>([]);
  const [estatisticasCobranca, setEstatisticasCobranca] = useState<EstatisticaCobranca[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =====================================================
  // FUNÇÕES DE BUSCA DE DADOS
  // =====================================================

  const buscarIngressosPendentes = useCallback(async () => {
    try {
      // Extrair dados do jogo_key - formato: "adversario-YYYY-MM-DDTHH:mm:ss+00:00-local"
      const partes = jogoKey.split('-');
      const adversario = partes[0];
      const local = partes[partes.length - 1]; // último elemento
      const dataCompleta = partes.slice(1, -1).join('-'); // elementos do meio (data completa com timestamp)
      
      // Extrair apenas a data (YYYY-MM-DD) do timestamp
      const jogoData = extrairDataDoTimestamp(dataCompleta);
      
      console.log('🔍 Dados extraídos do jogoKey:', {
        jogoKey,
        adversario,
        dataCompleta,
        jogoData,
        local
      });

      // 🎯 CORREÇÃO: Usar view que calcula valores reais de pendência
      console.log('🔍 Buscando ingressos pendentes para:', { adversario, jogoData, local });
      
      // Primeiro, vamos ver todos os ingressos do adversário para debug
      const { data: todosIngressos } = await supabase
        .from('vw_ingressos_pendentes_real')
        .select('*')
        .ilike('adversario', `%${adversario}%`)
        .eq('local_jogo', local);
      
      console.log('🔍 Todos os ingressos pendentes do adversário:', todosIngressos?.length || 0);
      if (todosIngressos && todosIngressos.length > 0) {
        console.log('📊 Primeiros ingressos encontrados:', todosIngressos.slice(0, 3));
        
        // Se encontrou ingressos do adversário mas não na data exata, usar esses
        if (todosIngressos.length > 0) {
          console.log('✅ Usando ingressos encontrados por adversário e local');
          setIngressosPendentes(todosIngressos.map(ingresso => ({
            ...ingresso,
            valor_final: ingresso.valor_pendente_real,
            cliente: {
              nome: ingresso.cliente_nome,
              telefone: ingresso.cliente_telefone,
              email: ingresso.cliente_email
            }
          })));
          return;
        }
      }
      
      // 🎯 CORREÇÃO: Usar jogo_data_local da view para evitar problemas de fuso horário
      let { data, error } = await supabase
        .from('vw_ingressos_pendentes_real')
        .select('*')
        .eq('adversario', adversario)
        .eq('jogo_data_local', jogoData) // Usar campo local da view
        .eq('local_jogo', local)
        .gt('valor_pendente_real', 0)
        .order('prioridade', { ascending: false })
        .order('valor_pendente_real', { ascending: false });

      // Se ainda não encontrou, tentar busca mais flexível
      if (!data || data.length === 0) {
        console.log('🔄 Tentando busca flexível por adversário e local apenas');
        
        const { data: dataFlexivel, error: errorFlexivel } = await supabase
          .from('vw_ingressos_pendentes_real')
          .select('*')
          .eq('adversario', adversario)
          .eq('local_jogo', local)
          .gt('valor_pendente_real', 0)
          .order('prioridade', { ascending: false })
          .order('valor_pendente_real', { ascending: false });
          
        if (!errorFlexivel && dataFlexivel && dataFlexivel.length > 0) {
          console.log('✅ Encontrado com busca flexível:', dataFlexivel.length);
          data = dataFlexivel;
          error = null;
        }
      }

      if (error) {
        // Se a view não existir, usar método alternativo
        console.warn('❌ View não encontrada, usando método alternativo:', error);
        return await buscarIngressosPendentesAlternativo(adversario, jogoData, local);
      }

      console.log('✅ Dados da view encontrados:', data?.length, 'ingressos');

      // Processar dados da view
      const ingressosProcessados: IngressoPendente[] = (data || []).map(ingresso => {
        console.log('🔍 Processando ingresso:', {
          cliente: ingresso.cliente_nome,
          valor_final_original: ingresso.valor_final,
          valor_pendente_real: ingresso.valor_pendente_real,
          total_pago: ingresso.total_pago
        });
        
        return {
          ...ingresso,
          // Usar valor pendente real em vez do valor_final
          valor_final: ingresso.valor_pendente_real,
          cliente: {
            nome: ingresso.cliente_nome,
            telefone: ingresso.cliente_telefone,
            email: ingresso.cliente_email
          }
        };
      });

      console.log('✅ Ingressos processados:', ingressosProcessados.length);
      setIngressosPendentes(ingressosProcessados);
    } catch (err) {
      console.error('Erro ao buscar ingressos pendentes:', err);
      setError('Erro ao carregar ingressos pendentes');
    }
  }, [jogoKey]);

  // Método alternativo caso a view não exista
  const buscarIngressosPendentesAlternativo = async (adversario: string, jogoData: string, local: string) => {
    console.log('🔄 Usando método alternativo para buscar ingressos pendentes');
    
    const { data, error } = await supabase
      .from('ingressos')
      .select(`
        *,
        cliente:clientes(*)
      `)
      .eq('adversario', adversario)
      .eq('jogo_data', jogoData)
      .eq('local_jogo', local)
      .eq('situacao_financeira', 'pendente')
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    console.log('📊 Ingressos pendentes encontrados (método alternativo):', data?.length);

    // Processar ingressos para calcular valores reais
    const ingressosProcessados: IngressoPendente[] = await Promise.all(
      (data || []).map(async (ingresso) => {
        // Buscar pagamentos para calcular saldo real
        const { data: pagamentos } = await supabase
          .from('historico_pagamentos_ingressos')
          .select('valor_pago')
          .eq('ingresso_id', ingresso.id);

        const totalPago = pagamentos?.reduce((sum, p) => sum + p.valor_pago, 0) || 0;
        const saldoDevedor = Math.max(0, ingresso.valor_final - totalPago);

        console.log('💰 Cálculo de saldo:', {
          cliente: ingresso.cliente?.nome,
          valor_final: ingresso.valor_final,
          total_pago: totalPago,
          saldo_devedor: saldoDevedor,
          pagamentos_count: pagamentos?.length || 0
        });

        // Só incluir se há saldo devedor real
        if (saldoDevedor <= 0) {
          console.log('✅ Ingresso quitado, removendo da lista:', ingresso.cliente?.nome);
          return null;
        }

        // Calcular dias em atraso
        const dataJogo = new Date(ingresso.jogo_data);
        const hoje = new Date();
        const diasParaJogo = Math.ceil((dataJogo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        const diasEmAtraso = Math.max(0, -diasParaJogo);

        // Buscar tentativas de cobrança
        const { data: tentativas } = await supabase
          .from('historico_cobrancas_ingressos')
          .select('*')
          .eq('ingresso_id', ingresso.id)
          .order('data_envio', { ascending: false });

        const totalTentativas = tentativas?.length || 0;
        const ultimaTentativa = tentativas?.[0]?.data_envio;

        // Determinar prioridade baseada no saldo devedor real
        let prioridade: 'alta' | 'media' | 'baixa' = 'baixa';
        
        if (saldoDevedor > 200 && diasEmAtraso > 7) {
          prioridade = 'alta';
        } else if (saldoDevedor > 100 || diasEmAtraso > 3) {
          prioridade = 'media';
        }

        return {
          ...ingresso,
          valor_final: saldoDevedor, // Usar saldo devedor como valor pendente
          dias_em_atraso: diasEmAtraso,
          total_tentativas_cobranca: totalTentativas,
          ultima_tentativa: ultimaTentativa,
          prioridade
        };
      })
    );

    // Filtrar nulls e ordenar
    const ingressosValidos = ingressosProcessados.filter(Boolean) as IngressoPendente[];
    
    ingressosValidos.sort((a, b) => {
      const prioridadeOrder = { alta: 3, media: 2, baixa: 1 };
      if (prioridadeOrder[a.prioridade] !== prioridadeOrder[b.prioridade]) {
        return prioridadeOrder[b.prioridade] - prioridadeOrder[a.prioridade];
      }
      return b.valor_final - a.valor_final;
    });

    setIngressosPendentes(ingressosValidos);
  };

  const buscarHistoricoCobrancas = useCallback(async () => {
    try {
      if (ingressosPendentes.length === 0) return;

      const ingressosIds = ingressosPendentes.map(ing => ing.id);
      
      const { data, error } = await supabase
        .from('historico_cobrancas_ingressos')
        .select('*')
        .in('ingresso_id', ingressosIds)
        .order('data_envio', { ascending: false });

      if (error) throw error;
      setHistoricoCobrancas(data || []);
    } catch (err) {
      console.error('Erro ao buscar histórico de cobranças:', err);
      setError('Erro ao carregar histórico de cobranças');
    }
  }, [ingressosPendentes]);

  const buscarEstatisticasCobranca = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('vw_estatisticas_cobranca_ingresso')
        .select('*')
        .order('valor_final', { ascending: false });

      if (error) throw error;
      
      // Filtrar apenas os ingressos do jogo atual
      const partes = jogoKey.split('-');
      const adversario = partes[0];
      const dataCompleta = partes.slice(1, -1).join('-'); // elementos do meio (data completa com timestamp)
      const jogoData = extrairDataDoTimestamp(dataCompleta);
      

      
      const estatisticasFiltradas = (data || []).filter(stat => 
        stat.adversario === adversario && stat.jogo_data === jogoData
      );
      
      setEstatisticasCobranca(estatisticasFiltradas);
    } catch (err) {
      console.error('Erro ao buscar estatísticas de cobrança:', err);
      setError('Erro ao carregar estatísticas de cobrança');
    }
  }, [jogoKey]);

  // =====================================================
  // FUNÇÕES DE COBRANÇA
  // =====================================================

  const registrarCobranca = useCallback(async (
    ingressoId: string,
    tipoCobranca: 'whatsapp_manual' | 'whatsapp_api',
    mensagem?: string,
    observacoes?: string
  ) => {
    try {
      console.log('🔄 Registrando cobrança:', {
        ingressoId,
        tipoCobranca,
        mensagem: mensagem?.substring(0, 50) + '...',
        observacoes,
        temObservacoes: !!observacoes
      });

      // ✅ NOVA FUNCIONALIDADE: Enviar via WhatsApp API se for o tipo correto
      let statusEnvio = 'enviado';
      let messageId: string | undefined;
      let erroEnvio: string | undefined;

      if (tipoCobranca === 'whatsapp_api' && mensagem) {
        console.log('📱 Enviando mensagem via WhatsApp API...');
        
        // Buscar dados do cliente para envio
        const { data: ingressoData, error: ingressoError } = await supabase
          .from('ingressos')
          .select(`
            *,
            cliente:clientes(nome, telefone)
          `)
          .eq('id', ingressoId)
          .single();

        if (ingressoError || !ingressoData?.cliente?.telefone) {
          console.error('❌ Erro ao buscar dados do cliente:', ingressoError);
          throw new Error('Não foi possível obter dados do cliente para envio');
        }

        // Enviar mensagem via WhatsApp API
        const resultadoEnvio = await enviarMensagemCobranca(
          ingressoData.cliente.telefone,
          mensagem,
          ingressoData.cliente.nome || 'Cliente'
        );

        if (resultadoEnvio.sucesso) {
          console.log('✅ Mensagem enviada via WhatsApp API');
          messageId = resultadoEnvio.messageId;
          statusEnvio = 'enviado';
        } else {
          console.error('❌ Erro no envio via WhatsApp API:', resultadoEnvio.erro);
          statusEnvio = 'erro';
          erroEnvio = resultadoEnvio.erro;
          // Não falhar a operação, apenas registrar o erro
        }
      }

      // Registrar cobrança no banco (sempre, mesmo se envio falhou)
      const { data, error } = await supabase
        .rpc('registrar_cobranca_ingresso', {
          p_ingresso_id: ingressoId,
          p_tipo_cobranca: tipoCobranca,
          p_mensagem: mensagem,
          p_observacoes: observacoes,
          p_enviado_por: 'Sistema'
        });

      if (error) {
        console.error('❌ Erro na função SQL:', error);
        throw error;
      }

      // Se houve erro no envio, atualizar status da cobrança
      if (tipoCobranca === 'whatsapp_api' && statusEnvio === 'erro' && data) {
        await supabase
          .from('historico_cobrancas_ingressos')
          .update({ 
            status: 'erro',
            observacoes: observacoes ? `${observacoes}\n\nErro no envio: ${erroEnvio}` : `Erro no envio: ${erroEnvio}`
          })
          .eq('id', data);
      }

      console.log('✅ Cobrança registrada com ID:', data);

      // Recarregar dados
      await Promise.all([
        buscarIngressosPendentes(),
        buscarHistoricoCobrancas()
      ]);

      // Mensagem de sucesso específica baseada no tipo e resultado
      if (tipoCobranca === 'whatsapp_api') {
        if (statusEnvio === 'enviado') {
          toast.success(`Mensagem enviada via WhatsApp API! ${messageId ? `ID: ${messageId}` : ''}`);
        } else {
          toast.error(`Cobrança registrada, mas erro no envio: ${erroEnvio}`);
        }
      } else {
        toast.success('Cobrança registrada com sucesso!');
      }
      
      return data;
    } catch (err) {
      console.error('Erro ao registrar cobrança:', err);
      toast.error('Erro ao registrar cobrança');
      throw err;
    }
  }, [buscarIngressosPendentes, buscarHistoricoCobrancas]);

  const marcarComoRespondido = useCallback(async (
    cobrancaId: string,
    respostaCliente: string
  ) => {
    try {
      const { error } = await supabase
        .from('historico_cobrancas_ingressos')
        .update({
          status: 'respondido',
          resposta_cliente: respostaCliente
        })
        .eq('id', cobrancaId);

      if (error) throw error;

      await buscarHistoricoCobrancas();
      toast.success('Resposta registrada com sucesso!');
    } catch (err) {
      console.error('Erro ao marcar como respondido:', err);
      toast.error('Erro ao registrar resposta');
      throw err;
    }
  }, [buscarHistoricoCobrancas]);

  const marcarComoPago = useCallback(async (ingressoId: string) => {
    try {
      // Atualizar status do ingresso
      const { error: ingressoError } = await supabase
        .from('ingressos')
        .update({ situacao_financeira: 'pago' })
        .eq('id', ingressoId);

      if (ingressoError) throw ingressoError;

      // Marcar última cobrança como paga
      const { error: cobrancaError } = await supabase
        .from('historico_cobrancas_ingressos')
        .update({ status: 'pago' })
        .eq('ingresso_id', ingressoId)
        .order('data_envio', { ascending: false })
        .limit(1);

      if (cobrancaError) throw cobrancaError;

      // Recarregar dados
      await Promise.all([
        buscarIngressosPendentes(),
        buscarHistoricoCobrancas(),
        buscarEstatisticasCobranca()
      ]);

      toast.success('Ingresso marcado como pago!');
    } catch (err) {
      console.error('Erro ao marcar como pago:', err);
      toast.error('Erro ao marcar como pago');
      throw err;
    }
  }, [buscarIngressosPendentes, buscarHistoricoCobrancas, buscarEstatisticasCobranca]);

  // =====================================================
  // FUNÇÕES UTILITÁRIAS
  // =====================================================

  const gerarMensagemPersonalizada = useCallback((
    template: TemplateCobranca,
    ingresso: IngressoPendente
  ): string => {
    let mensagem = template.mensagem;
    
    // Substituir variáveis
    mensagem = mensagem.replace('{NOME}', ingresso.cliente?.nome || 'Cliente');
    mensagem = mensagem.replace('{ADVERSARIO}', ingresso.adversario);
    mensagem = mensagem.replace('{DATA}', new Date(ingresso.jogo_data).toLocaleDateString('pt-BR'));
    mensagem = mensagem.replace('{VALOR}', `R$ ${ingresso.valor_final.toFixed(2)}`);
    mensagem = mensagem.replace('{SETOR}', ingresso.setor_estadio);
    
    return mensagem;
  }, []);

  const obterTemplatesCobranca = useCallback(() => {
    return TEMPLATES_COBRANCA;
  }, []);

  const calcularEstatisticasGerais = useCallback(() => {
    const totalPendentes = ingressosPendentes.length;
    const valorTotalPendente = ingressosPendentes.reduce((sum, ing) => sum + ing.valor_final, 0);
    const tentativasTotal = ingressosPendentes.reduce((sum, ing) => sum + ing.total_tentativas_cobranca, 0);
    
    const prioridadeAlta = ingressosPendentes.filter(ing => ing.prioridade === 'alta').length;
    const prioridadeMedia = ingressosPendentes.filter(ing => ing.prioridade === 'media').length;
    const prioridadeBaixa = ingressosPendentes.filter(ing => ing.prioridade === 'baixa').length;

    return {
      totalPendentes,
      valorTotalPendente,
      tentativasTotal,
      prioridadeAlta,
      prioridadeMedia,
      prioridadeBaixa,
      ticketMedioPendente: totalPendentes > 0 ? valorTotalPendente / totalPendentes : 0
    };
  }, [ingressosPendentes]);

  // =====================================================
  // FUNÇÃO PARA RECARREGAR TODOS OS DADOS
  // =====================================================

  const recarregarDados = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await buscarIngressosPendentes();
      // Os outros serão carregados em sequência pelos useEffects
    } catch (err) {
      console.error('Erro ao recarregar dados de cobrança:', err);
    } finally {
      setIsLoading(false);
    }
  }, [buscarIngressosPendentes]);

  // =====================================================
  // EFFECTS
  // =====================================================

  useEffect(() => {
    if (jogoKey) {
      recarregarDados();
    }
  }, [jogoKey, recarregarDados]);

  useEffect(() => {
    if (ingressosPendentes.length > 0) {
      buscarHistoricoCobrancas();
      buscarEstatisticasCobranca();
    }
  }, [ingressosPendentes, buscarHistoricoCobrancas, buscarEstatisticasCobranca]);

  // =====================================================
  // RETORNO DO HOOK
  // =====================================================

  return {
    // Estados
    ingressosPendentes,
    historicoCobrancas,
    estatisticasCobranca,
    isLoading,
    error,
    
    // Funções de cobrança
    registrarCobranca,
    marcarComoRespondido,
    marcarComoPago,
    
    // Funções utilitárias
    gerarMensagemPersonalizada,
    obterTemplatesCobranca,
    calcularEstatisticasGerais,
    
    // Função para recarregar
    recarregarDados
  };
}