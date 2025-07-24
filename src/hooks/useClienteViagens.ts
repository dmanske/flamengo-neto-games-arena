import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface ViagemCliente {
  id: string;
  adversario: string;
  data_jogo: string;
  valor_pago: number;
  valor_original: number;
  desconto: number;
  status: 'confirmado' | 'cancelado' | 'finalizado';
  setor_maracana: string;
  numero_onibus: string;
  status_pagamento: string;
  parcelas_pagas: number;
  total_parcelas: number;
  avaliacao?: number;
}

export interface EstatisticasViagens {
  total_viagens: number;
  total_gasto: number;
  viagem_mais_cara: {
    valor: number;
    adversario: string;
    data: string;
  };
  adversario_favorito: {
    nome: string;
    quantidade: number;
    percentual: number;
  };
  ticket_medio: number;
  economia_total: number;
}

export const useClienteViagens = (clienteId: string) => {
  const [viagens, setViagens] = useState<ViagemCliente[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasViagens | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clienteId) {
      setError('ID do cliente não fornecido');
      setLoading(false);
      return;
    }

    const fetchViagensCliente = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Buscar viagens do cliente com dados completos
        const { data: viagensData, error: viagensError } = await supabase
          .from('viagem_passageiros')
          .select(`
            id,
            valor,
            desconto,
            setor_maracana,
            status_pagamento,
            created_at,
            viagens!viagem_passageiros_viagem_id_fkey (
              id,
              adversario,
              data_jogo,
              status_viagem
            )
          `)
          .eq('cliente_id', clienteId)
          .order('created_at', { ascending: false });

        if (viagensError) {
          throw viagensError;
        }

        if (!viagensData || viagensData.length === 0) {
          setViagens([]);
          setEstatisticas({
            total_viagens: 0,
            total_gasto: 0,
            viagem_mais_cara: { valor: 0, adversario: 'Nenhuma', data: '' },
            adversario_favorito: { nome: 'Nenhum', quantidade: 0, percentual: 0 },
            ticket_medio: 0,
            economia_total: 0,
          });
          return;
        }

        // 2. Buscar parcelas para cada viagem
        const viagemPassageiroIds = viagensData.map(v => v.id);
        const { data: parcelasData, error: parcelasError } = await supabase
          .from('viagem_passageiros_parcelas')
          .select('viagem_passageiro_id, data_pagamento')
          .in('viagem_passageiro_id', viagemPassageiroIds);

        if (parcelasError) {
          console.error('Erro ao buscar parcelas:', parcelasError);
        }

        // 3. Processar dados das viagens
        const viagensProcessadas: ViagemCliente[] = viagensData.map(vp => {
          const parcelas = (parcelasData || []).filter(p => p.viagem_passageiro_id === vp.id);
          const parcelasPagas = parcelas.filter(p => p.data_pagamento).length;
          const totalParcelas = parcelas.length;
          
          // Determinar status baseado na data do jogo e status da viagem
          let status: 'confirmado' | 'cancelado' | 'finalizado' = 'confirmado';
          
          // Verificar status da viagem primeiro
          if (vp.viagens?.status_viagem === 'Cancelada') {
            status = 'cancelado';
          } else if (vp.viagens?.data_jogo) {
            const dataJogo = new Date(vp.viagens.data_jogo);
            const hoje = new Date();
            
            if (dataJogo < hoje) {
              status = 'finalizado';
            }
          }

          return {
            id: vp.viagens?.id || vp.id,
            adversario: vp.viagens?.adversario || 'Adversário não informado',
            data_jogo: vp.viagens?.data_jogo || '',
            valor_pago: vp.valor || 0,
            valor_original: vp.valor || 0,
            desconto: vp.desconto || 0,
            status,
            setor_maracana: vp.setor_maracana || '',
            numero_onibus: '', // Campo não existe na tabela
            status_pagamento: vp.status_pagamento || 'Pendente',
            parcelas_pagas: parcelasPagas,
            total_parcelas: totalParcelas || 1,
            avaliacao: undefined,
          };
        });

        // 4. Calcular estatísticas
        const totalViagens = viagensProcessadas.length;
        const totalGasto = viagensProcessadas.reduce((sum, v) => sum + (v.valor_pago - v.desconto), 0);
        const economiaTotal = viagensProcessadas.reduce((sum, v) => sum + v.desconto, 0);
        
        // Viagem mais cara
        const viagemMaisCara = viagensProcessadas.reduce((max, v) => 
          (v.valor_pago > max.valor_pago) ? v : max, 
          viagensProcessadas[0] || { valor_pago: 0, adversario: 'Nenhuma', data_jogo: '' }
        );

        // Adversário favorito
        const adversarios = viagensProcessadas.reduce((acc, v) => {
          acc[v.adversario] = (acc[v.adversario] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const adversarioFavorito = Object.entries(adversarios)
          .sort(([,a], [,b]) => b - a)[0];

        const estatisticasCalculadas: EstatisticasViagens = {
          total_viagens: totalViagens,
          total_gasto: totalGasto,
          viagem_mais_cara: {
            valor: viagemMaisCara.valor_pago,
            adversario: viagemMaisCara.adversario,
            data: viagemMaisCara.data_jogo,
          },
          adversario_favorito: {
            nome: adversarioFavorito?.[0] || 'Nenhum',
            quantidade: adversarioFavorito?.[1] || 0,
            percentual: adversarioFavorito ? Math.round((adversarioFavorito[1] / totalViagens) * 100) : 0,
          },
          ticket_medio: totalViagens > 0 ? totalGasto / totalViagens : 0,
          economia_total: economiaTotal,
        };

        setViagens(viagensProcessadas);
        setEstatisticas(estatisticasCalculadas);
      } catch (err: any) {
        console.error('Erro ao buscar viagens do cliente:', err);
        setError(err.message || 'Erro ao carregar histórico de viagens');
      } finally {
        setLoading(false);
      }
    };

    fetchViagensCliente();
  }, [clienteId]);

  const refetch = () => {
    if (clienteId) {
      setLoading(true);
      // Re-executar o useEffect
    }
  };

  return { viagens, estatisticas, loading, error, refetch };
};