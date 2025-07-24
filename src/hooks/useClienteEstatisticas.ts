import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface EstatisticasCliente {
  cliente_desde: string;
  tempo_relacionamento: {
    anos: number;
    meses: number;
    dias: number;
  };
  frequencia_viagens: {
    por_ano: number;
    por_mes: number;
  };
  sazonalidade: {
    mes_favorito: string;
    distribuicao_mensal: { mes: string; quantidade: number; percentual: number }[];
  };
  adversario_favorito: {
    nome: string;
    quantidade: number;
    percentual: number;
  };
  formas_pagamento: {
    pix: number;
    cartao: number;
    dinheiro: number;
    outros: number;
  };
  score_fidelidade: number;
  badges: string[];
  padroes_comportamento: {
    pontualidade_media: number;
    ticket_medio_evolucao: 'crescente' | 'estavel' | 'decrescente';
    frequencia_tendencia: 'aumentando' | 'estavel' | 'diminuindo';
  };
}

export const useClienteEstatisticas = (clienteId: string) => {
  const [estatisticas, setEstatisticas] = useState<EstatisticasCliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clienteId) {
      setError('ID do cliente não fornecido');
      setLoading(false);
      return;
    }

    const fetchEstatisticasCliente = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Buscar dados básicos do cliente
        const { data: clienteData, error: clienteError } = await supabase
          .from('clientes')
          .select('created_at')
          .eq('id', clienteId)
          .single();

        if (clienteError) throw clienteError;

        // 2. Buscar participações do cliente em viagens
        const { data: viagensPassageiroData, error: viagensPassageiroError } = await supabase
          .from('viagem_passageiros')
          .select(`
            id,
            viagem_id,
            valor,
            desconto,
            forma_pagamento,
            created_at
          `)
          .eq('cliente_id', clienteId)
          .order('created_at', { ascending: true });

        if (viagensPassageiroError) throw viagensPassageiroError;

        if (!viagensPassageiroData || viagensPassageiroData.length === 0) {
          // Cliente sem viagens
          const clienteDesde = new Date(clienteData.created_at);
          setEstatisticas({
            cliente_desde: clienteDesde.toLocaleDateString('pt-BR', { 
              month: 'short', 
              year: 'numeric' 
            }),
            tempo_relacionamento: {
              anos: 0,
              meses: 0,
              dias: Math.floor((new Date().getTime() - clienteDesde.getTime()) / (1000 * 60 * 60 * 24))
            },
            frequencia_viagens: { por_ano: 0, por_mes: 0 },
            sazonalidade: { mes_favorito: 'Nenhum', distribuicao_mensal: [] },
            adversario_favorito: { nome: 'Nenhum', quantidade: 0, percentual: 0 },
            formas_pagamento: { pix: 0, cartao: 0, dinheiro: 0, outros: 0 },
            score_fidelidade: 50,
            badges: ['Novo Cliente'],
            padroes_comportamento: {
              pontualidade_media: 100,
              ticket_medio_evolucao: 'estavel',
              frequencia_tendencia: 'estavel'
            }
          });
          return;
        }

        // 3. Buscar dados das viagens
        const viagemIds = viagensPassageiroData.map(vp => vp.viagem_id);
        const { data: viagensData, error: viagensError } = await supabase
          .from('viagens')
          .select(`
            id,
            adversario,
            data_jogo,
            status_viagem
          `)
          .in('id', viagemIds)
          .not('data_jogo', 'is', null);

        if (viagensError) throw viagensError;

        // 4. Combinar dados de viagem_passageiros com viagens
        const viagensCompletas = viagensPassageiroData
          .map(vp => {
            const viagem = viagensData?.find(v => v.id === vp.viagem_id);
            return viagem ? { ...vp, viagens: viagem } : null;
          })
          .filter(Boolean);

        // 5. Calcular tempo de relacionamento
        const primeiraViagem = new Date(viagensCompletas[0].created_at);
        const hoje = new Date();
        const diffTime = hoje.getTime() - primeiraViagem.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const anos = Math.floor(diffDays / 365);
        const mesesRestantes = Math.floor((diffDays % 365) / 30);
        const meses = anos * 12 + mesesRestantes;

        // 6. Calcular frequência
        const totalViagens = viagensCompletas.length;
        
        // Para clientes muito novos (menos de 30 dias), usar projeção mais conservadora
        let frequenciaPorAno, frequenciaPorMes;
        
        if (diffDays < 30) {
          frequenciaPorMes = Math.round(totalViagens / Math.max(1, diffDays / 30));
          frequenciaPorAno = Math.min(frequenciaPorMes * 12, totalViagens * 6); // Limitar projeção
        } else {
          frequenciaPorAno = anos > 0 ? Math.round(totalViagens / anos) : Math.round((totalViagens / diffDays) * 365);
          frequenciaPorMes = meses > 0 ? Math.round(totalViagens / meses) : Math.round((totalViagens / diffDays) * 30);
        }

        // 7. Análise de sazonalidade
        const viagensPorMes = viagensCompletas.reduce((acc, viagem) => {
          if (viagem.viagens?.data_jogo) {
            const mes = new Date(viagem.viagens.data_jogo).getMonth();
            const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            const nomeMes = nomesMeses[mes];
            acc[nomeMes] = (acc[nomeMes] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        const distribuicaoMensal = Object.entries(viagensPorMes)
          .map(([mes, quantidade]) => ({
            mes,
            quantidade,
            percentual: Math.round((quantidade / totalViagens) * 100)
          }))
          .sort((a, b) => b.quantidade - a.quantidade);

        const mesFavorito = distribuicaoMensal[0]?.mes || 'Nenhum';

        // 8. Adversário favorito
        const adversarios = viagensCompletas.reduce((acc, viagem) => {
          if (viagem.viagens?.adversario) {
            acc[viagem.viagens.adversario] = (acc[viagem.viagens.adversario] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        const adversarioFavorito = Object.entries(adversarios)
          .sort(([,a], [,b]) => b - a)[0];

        // 9. Formas de pagamento
        const formasPagamento = viagensCompletas.reduce((acc, viagem) => {
          const forma = viagem.forma_pagamento?.toLowerCase() || 'outros';
          if (forma.includes('pix')) {
            acc.pix++;
          } else if (forma.includes('cartao') || forma.includes('cartão')) {
            acc.cartao++;
          } else if (forma.includes('dinheiro')) {
            acc.dinheiro++;
          } else {
            acc.outros++;
          }
          return acc;
        }, { pix: 0, cartao: 0, dinheiro: 0, outros: 0 });

        // Converter para percentuais
        const totalFormas = Object.values(formasPagamento).reduce((sum, val) => sum + val, 0);
        const formasPagamentoPercentual = {
          pix: totalFormas > 0 ? Math.round((formasPagamento.pix / totalFormas) * 100) : 0,
          cartao: totalFormas > 0 ? Math.round((formasPagamento.cartao / totalFormas) * 100) : 0,
          dinheiro: totalFormas > 0 ? Math.round((formasPagamento.dinheiro / totalFormas) * 100) : 0,
          outros: totalFormas > 0 ? Math.round((formasPagamento.outros / totalFormas) * 100) : 0,
        };

        // 10. Score de fidelidade
        let scoreFidelidade = 50; // Base
        scoreFidelidade += Math.min(30, totalViagens * 5); // +5 por viagem, máximo 30
        scoreFidelidade += Math.min(20, anos * 10); // +10 por ano, máximo 20
        scoreFidelidade = Math.min(100, scoreFidelidade);

        // 11. Badges
        const badges = [];
        if (totalViagens >= 10) badges.push('VIP');
        if (totalViagens >= 5) badges.push('Fiel');
        if (anos >= 1) badges.push('Veterano');
        if (scoreFidelidade >= 90) badges.push('Embaixador');
        if (formasPagamentoPercentual.pix >= 80) badges.push('Digital');
        if (badges.length === 0) badges.push('Novo Cliente');

        // 12. Padrões de comportamento
        const ticketMedioEvolucao = (() => {
          if (viagensCompletas.length < 3) return 'estavel';
          const primeiraMetade = viagensCompletas.slice(0, Math.floor(viagensCompletas.length / 2));
          const segundaMetade = viagensCompletas.slice(Math.floor(viagensCompletas.length / 2));
          
          const ticketPrimeira = primeiraMetade.reduce((sum, v) => sum + (v.valor || 0), 0) / primeiraMetade.length;
          const ticketSegunda = segundaMetade.reduce((sum, v) => sum + (v.valor || 0), 0) / segundaMetade.length;
          
          if (ticketSegunda > ticketPrimeira * 1.1) return 'crescente';
          if (ticketSegunda < ticketPrimeira * 0.9) return 'decrescente';
          return 'estavel';
        })();

        // 13. Montar resultado final
        const resultado: EstatisticasCliente = {
          cliente_desde: primeiraViagem.toLocaleDateString('pt-BR', { 
            month: 'short', 
            year: 'numeric' 
          }),
          tempo_relacionamento: {
            anos,
            meses: mesesRestantes,
            dias: diffDays
          },
          frequencia_viagens: {
            por_ano: frequenciaPorAno,
            por_mes: frequenciaPorMes
          },
          sazonalidade: {
            mes_favorito: mesFavorito,
            distribuicao_mensal: distribuicaoMensal
          },
          adversario_favorito: {
            nome: adversarioFavorito?.[0] || 'Nenhum',
            quantidade: adversarioFavorito?.[1] || 0,
            percentual: adversarioFavorito ? Math.round((adversarioFavorito[1] / totalViagens) * 100) : 0
          },
          formas_pagamento: formasPagamentoPercentual,
          score_fidelidade: scoreFidelidade,
          badges,
          padroes_comportamento: {
            pontualidade_media: 85, // TODO: Calcular baseado em atrasos reais
            ticket_medio_evolucao: ticketMedioEvolucao,
            frequencia_tendencia: totalViagens >= 5 ? 'aumentando' : 'estavel'
          }
        };

        setEstatisticas(resultado);
      } catch (err: any) {
        console.error('Erro ao buscar estatísticas do cliente:', err);
        setError(err.message || 'Erro ao carregar estatísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchEstatisticasCliente();

    // Listener para refresh manual
    const handleRefresh = () => fetchEstatisticasCliente();
    window.addEventListener('refetch-estatisticas', handleRefresh);

    return () => {
      window.removeEventListener('refetch-estatisticas', handleRefresh);
    };
  }, [clienteId]);

  const refetch = async () => {
    if (clienteId) {
      setLoading(true);
      setError(null);
      // Força a re-execução do useEffect
      const event = new CustomEvent('refetch-estatisticas');
      window.dispatchEvent(event);
    }
  };

  return { estatisticas, loading, error, refetch };
};