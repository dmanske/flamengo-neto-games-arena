import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { extrairDataDoTimestamp } from '@/utils/dateUtils';
import { Ingresso } from '@/types/ingressos';

// =====================================================
// TIPOS E INTERFACES
// =====================================================

export interface HistoricoCobranca {
  id: string;
  ingresso_id: string;
  tipo_cobranca: 'whatsapp' | 'email' | 'telefone' | 'presencial' | 'outros';
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

      // Buscar ingressos pendentes
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

      // Processar ingressos para adicionar informações de prioridade
      const ingressosProcessados: IngressoPendente[] = await Promise.all(
        (data || []).map(async (ingresso) => {
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

          // Determinar prioridade
          let prioridade: 'alta' | 'media' | 'baixa' = 'baixa';
          
          if (ingresso.valor_final > 200 && diasEmAtraso > 7) {
            prioridade = 'alta';
          } else if (ingresso.valor_final > 100 || diasEmAtraso > 3) {
            prioridade = 'media';
          }

          return {
            ...ingresso,
            dias_em_atraso: diasEmAtraso,
            total_tentativas_cobranca: totalTentativas,
            ultima_tentativa: ultimaTentativa,
            prioridade
          };
        })
      );

      // Ordenar por prioridade e valor
      ingressosProcessados.sort((a, b) => {
        const prioridadeOrder = { alta: 3, media: 2, baixa: 1 };
        if (prioridadeOrder[a.prioridade] !== prioridadeOrder[b.prioridade]) {
          return prioridadeOrder[b.prioridade] - prioridadeOrder[a.prioridade];
        }
        return b.valor_final - a.valor_final;
      });

      setIngressosPendentes(ingressosProcessados);
    } catch (err) {
      console.error('Erro ao buscar ingressos pendentes:', err);
      setError('Erro ao carregar ingressos pendentes');
    }
  }, [jogoKey]);

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
    tipoCobranca: 'whatsapp' | 'email' | 'telefone' | 'presencial' | 'outros',
    mensagem?: string,
    observacoes?: string
  ) => {
    try {
      const { data, error } = await supabase
        .rpc('registrar_cobranca_ingresso', {
          p_ingresso_id: ingressoId,
          p_tipo_cobranca: tipoCobranca,
          p_mensagem: mensagem,
          p_enviado_por: 'Sistema' // Pode ser dinâmico baseado no usuário logado
        });

      if (error) throw error;

      // Adicionar observações se fornecidas
      if (observacoes && data) {
        await supabase
          .from('historico_cobrancas_ingressos')
          .update({ observacoes })
          .eq('id', data);
      }

      // Recarregar dados
      await Promise.all([
        buscarIngressosPendentes(),
        buscarHistoricoCobrancas()
      ]);

      toast.success('Cobrança registrada com sucesso!');
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