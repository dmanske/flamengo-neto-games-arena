import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Ingresso } from '@/types/ingressos';

// Interface para detalhes do jogo
export interface JogoDetails {
  adversario: string;
  jogo_data: string;
  local_jogo: 'casa' | 'fora';
  logo_adversario?: string;
  logo_flamengo?: string;
  total_ingressos: number;
  receita_total: number;
  lucro_total: number;
  ingressos_pendentes: number;
  ingressos_pagos: number;
  viagem_ingressos_id?: string;
}

export function useJogoDetails() {
  const { jogoKey } = useParams<{ jogoKey: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [jogo, setJogo] = useState<JogoDetails | null>(null);
  const [ingressos, setIngressos] = useState<Ingresso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para decodificar a jogoKey da URL
  const decodificarJogoKey = useCallback((key: string) => {
    try {
      // Formato esperado: adversario-YYYY-MM-DD-local
      const partes = key.split('-');
      
      if (partes.length < 5) {
        throw new Error('Formato de chave inválido');
      }

      // Reconstruir adversário (pode ter hífens no nome)
      const local = partes[partes.length - 1]; // último elemento
      const ano = partes[partes.length - 4];
      const mes = partes[partes.length - 3];
      const dia = partes[partes.length - 2];
      
      // Adversário é tudo antes da data
      const adversario = partes.slice(0, partes.length - 4).join('-');
      
      const data = `${ano}-${mes}-${dia}`;

      return {
        adversario,
        data,
        local: local as 'casa' | 'fora'
      };
    } catch (error) {
      console.error('Erro ao decodificar jogoKey:', error);
      return null;
    }
  }, []);

  // Função para buscar dados do jogo
  const buscarDadosJogo = useCallback(async () => {
    if (!jogoKey) {
      setError('Chave do jogo não fornecida');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verificar se temos dados passados via state da navegação
      const stateData = location.state as any;
      if (stateData?.jogoData && stateData?.ingressosDoJogo) {
        
        const jogoFromState = stateData.jogoData;
        const ingressosFromState = stateData.ingressosDoJogo;
        
        // Criar objeto do jogo a partir dos dados do state
        const jogoCompleto: JogoDetails = {
          adversario: jogoFromState.adversario,
          jogo_data: jogoFromState.jogo_data,
          local_jogo: jogoFromState.local_jogo,
          logo_adversario: jogoFromState.logo_adversario || null,
          logo_flamengo: jogoFromState.logo_flamengo || "https://logodetimes.com/times/flamengo/logo-flamengo-256.png",
          total_ingressos: jogoFromState.total_ingressos || 0,
          receita_total: jogoFromState.receita_total || 0,
          lucro_total: jogoFromState.lucro_total || 0,
          ingressos_pendentes: jogoFromState.ingressos_pendentes || 0,
          ingressos_pagos: jogoFromState.ingressos_pagos || 0,
          viagem_ingressos_id: jogoFromState.viagem_ingressos_id || null,
        };

        setJogo(jogoCompleto);
        setIngressos(ingressosFromState);
        setLoading(false);
        return;
      }
      const dadosJogo = decodificarJogoKey(jogoKey);
      
      if (!dadosJogo) {
        setError('Formato de URL inválido');
        setLoading(false);
        return;
      }

      const { adversario, data, local } = dadosJogo;


      // Buscar ingressos do jogo - abordagem mais robusta
      // Primeiro buscar todos os ingressos do dia e local
      const { data: todosIngressos, error: ingressosError } = await supabase
        .from('ingressos')
        .select(`
          *,
          cliente:clientes(id, nome, telefone, email, cpf, data_nascimento, foto),
          viagem:viagens(id, adversario, data_jogo)
        `)
        .eq('local_jogo', local)
        .gte('jogo_data', data)
        .lt('jogo_data', `${data}T23:59:59`)
        .order('created_at', { ascending: false });

      if (ingressosError) {
        console.error('Erro ao buscar ingressos:', ingressosError);
        setError('Erro ao carregar dados do jogo');
        setLoading(false);
        return;
      }

      // Filtrar ingressos pelo adversário (comparação mais flexível)
      const ingressosData = todosIngressos?.filter(ingresso => {
        const adversarioIngresso = ingresso.adversario.toLowerCase().replace(/\s+/g, '-');
        const adversarioBusca = adversario.toLowerCase();
        return adversarioIngresso === adversarioBusca || 
               ingresso.adversario.toLowerCase().includes(adversarioBusca.replace(/-/g, ' '));
      }) || [];



      // Se não há ingressos, verificar se existe viagem de ingressos
      if (!ingressosData || ingressosData.length === 0) {
        // Buscar todas as viagens do dia e local
        const { data: todasViagens, error: viagemError } = await supabase
          .from('viagens_ingressos')
          .select('*')
          .eq('local_jogo', local)
          .gte('data_jogo', data)
          .lt('data_jogo', `${data}T23:59:59`);

        if (viagemError && viagemError.code !== 'PGRST116') {
          console.error('Erro ao buscar viagem de ingressos:', viagemError);
          setError('Erro ao carregar dados do jogo');
          setLoading(false);
          return;
        }

        // Filtrar viagem pelo adversário
        const viagemIngressos = todasViagens?.find(viagem => {
          const adversarioViagem = viagem.adversario.toLowerCase().replace(/\s+/g, '-');
          const adversarioBusca = adversario.toLowerCase();
          return adversarioViagem === adversarioBusca || 
                 viagem.adversario.toLowerCase().includes(adversarioBusca.replace(/-/g, ' '));
        });



        if (!viagemIngressos) {
          setError('Jogo não encontrado');
          setLoading(false);
          return;
        }

        // Buscar logo do adversário
        const { data: adversarioData } = await supabase
          .from('adversarios')
          .select('logo_url')
          .eq('nome', adversario)
          .single();

        // Criar objeto do jogo sem ingressos
        const jogoSemIngressos: JogoDetails = {
          adversario: viagemIngressos.adversario,
          jogo_data: viagemIngressos.data_jogo,
          local_jogo: viagemIngressos.local_jogo,
          logo_adversario: viagemIngressos.logo_adversario || adversarioData?.logo_url || null,
          logo_flamengo: viagemIngressos.logo_flamengo || "https://logodetimes.com/times/flamengo/logo-flamengo-256.png",
          total_ingressos: 0,
          receita_total: 0,
          lucro_total: 0,
          ingressos_pendentes: 0,
          ingressos_pagos: 0,
          viagem_ingressos_id: viagemIngressos.id,
        };

        setJogo(jogoSemIngressos);
        setIngressos([]);
        setLoading(false);
        return;
      }

      // Calcular estatísticas do jogo
      const totalIngressos = ingressosData.length;
      const receitaTotal = ingressosData.reduce((sum, ing) => sum + (ing.valor_final || 0), 0);
      const lucroTotal = ingressosData.reduce((sum, ing) => sum + (ing.lucro || 0), 0);
      const ingressosPagos = ingressosData.filter(ing => ing.situacao_financeira === 'pago').length;
      const ingressosPendentes = ingressosData.filter(ing => ing.situacao_financeira === 'pendente').length;

      // Buscar logo do adversário se não estiver nos ingressos
      let logoAdversario = null;
      const primeiroIngresso = ingressosData[0];
      
      if (primeiroIngresso?.viagem_ingressos_id) {
        // Buscar da viagem de ingressos
        const { data: viagemIngressos } = await supabase
          .from('viagens_ingressos')
          .select('logo_adversario')
          .eq('id', primeiroIngresso.viagem_ingressos_id)
          .single();
        
        logoAdversario = viagemIngressos?.logo_adversario;
      }

      if (!logoAdversario) {
        // Buscar da tabela adversários
        const { data: adversarioData } = await supabase
          .from('adversarios')
          .select('logo_url')
          .eq('nome', adversario)
          .single();
        
        logoAdversario = adversarioData?.logo_url;
      }

      // Criar objeto do jogo
      const jogoCompleto: JogoDetails = {
        adversario,
        jogo_data: data,
        local_jogo: local,
        logo_adversario: logoAdversario || null,
        logo_flamengo: "https://logodetimes.com/times/flamengo/logo-flamengo-256.png",
        total_ingressos: totalIngressos,
        receita_total: receitaTotal,
        lucro_total: lucroTotal,
        ingressos_pendentes: ingressosPendentes,
        ingressos_pagos: ingressosPagos,
        viagem_ingressos_id: primeiroIngresso?.viagem_ingressos_id || null,
      };

      setJogo(jogoCompleto);
      setIngressos(ingressosData);
      setLoading(false);

    } catch (error) {
      console.error('Erro inesperado ao buscar dados do jogo:', error);
      setError('Erro inesperado ao carregar dados');
      setLoading(false);
    }
  }, [jogoKey, decodificarJogoKey]);

  // Função para recarregar dados
  const recarregarDados = useCallback(() => {
    buscarDadosJogo();
  }, [buscarDadosJogo]);

  // Função para navegar de volta
  const voltarParaIngressos = useCallback(() => {
    navigate('/dashboard/ingressos');
  }, [navigate]);

  // Função para gerar jogoKey a partir dos dados
  const gerarJogoKey = useCallback((adversario: string, data: string, local: 'casa' | 'fora') => {
    const adversarioLimpo = adversario.toLowerCase().replace(/\s+/g, '-');
    const dataFormatada = new Date(data).toISOString().split('T')[0];
    return `${adversarioLimpo}-${dataFormatada}-${local}`;
  }, []);

  // Carregar dados quando o componente montar ou jogoKey mudar
  useEffect(() => {
    buscarDadosJogo();
  }, [buscarDadosJogo]);

  // Redirecionar se houver erro crítico
  useEffect(() => {
    if (error === 'Jogo não encontrado' || error === 'Formato de URL inválido') {
      toast.error(error);
      setTimeout(() => {
        navigate('/dashboard/ingressos');
      }, 2000);
    }
  }, [error, navigate]);

  return {
    jogo,
    ingressos,
    loading,
    error,
    recarregarDados,
    voltarParaIngressos,
    gerarJogoKey,
  };
}