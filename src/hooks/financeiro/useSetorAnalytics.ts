import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { extrairDataDoTimestamp } from '@/utils/dateUtils';

// =====================================================
// TIPOS E INTERFACES
// =====================================================

export interface ROISetor {
  setor: string;
  investimento: number;
  retorno: number;
  roi_percentual: number;
  classificacao: 'Excelente' | 'Bom' | 'Regular' | 'Prejuízo';
}

export interface ComparativoJogo {
  metrica: string;
  valor_jogo: number;
  media_historica: number;
  diferenca_percentual: number;
  performance: 'Acima da Média' | 'Abaixo da Média' | 'Na Média';
}

export interface SetorPerformance {
  setor: string;
  quantidade_vendida: number;
  receita_total: number;
  custo_total: number;
  lucro_total: number;
  preco_medio: number;
  margem_percentual: number;
  taxa_ocupacao: number;
  classificacao_performance: string;
  recomendacao: string;
}

export interface TendenciaVendas {
  data: string;
  vendas_acumuladas: number;
  receita_acumulada: number;
  dias_para_jogo: number;
  velocidade_vendas: number;
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export function useSetorAnalytics(jogoKey: string) {
  // Estados
  const [roiPorSetor, setRoiPorSetor] = useState<ROISetor[]>([]);
  const [comparativoHistorico, setComparativoHistorico] = useState<ComparativoJogo[]>([]);
  const [performanceSetores, setPerformanceSetores] = useState<SetorPerformance[]>([]);
  const [tendenciaVendas, setTendenciaVendas] = useState<TendenciaVendas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =====================================================
  // FUNÇÃO PARA CALCULAR ROI POR SETOR
  // =====================================================

  const calcularROIPorSetor = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .rpc('calcular_roi_setor_jogo', { p_jogo_key: jogoKey });

      if (error) throw error;
      setRoiPorSetor(data || []);
    } catch (err) {
      console.error('Erro ao calcular ROI por setor:', err);
      setError('Erro ao calcular ROI por setor');
    }
  }, [jogoKey]);

  // =====================================================
  // FUNÇÃO PARA COMPARAR COM MÉDIA HISTÓRICA
  // =====================================================

  const compararComMediaHistorica = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .rpc('comparar_jogo_com_media', { p_jogo_key: jogoKey });

      if (error) throw error;
      setComparativoHistorico(data || []);
    } catch (err) {
      console.error('Erro ao comparar com média histórica:', err);
      setError('Erro ao comparar com média histórica');
    }
  }, [jogoKey]);

  // =====================================================
  // FUNÇÃO PARA ANALISAR PERFORMANCE DOS SETORES
  // =====================================================

  const analisarPerformanceSetores = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('vw_analytics_setor_jogo')
        .select('*')
        .eq('jogo_key', jogoKey)
        .order('receita_total', { ascending: false });

      if (error) throw error;

      // Processar dados para adicionar classificações e recomendações
      const setoresProcessados: SetorPerformance[] = (data || []).map(setor => {
        const taxaOcupacao = setor.quantidade_total > 0 ? 
          (setor.quantidade_paga / setor.quantidade_total) * 100 : 0;

        let classificacao = 'Regular';
        let recomendacao = 'Manter estratégia atual';

        // Classificar performance baseada na margem
        if (setor.margem_percentual >= 50) {
          classificacao = 'Excelente';
          recomendacao = 'Setor de alta performance - expandir oferta';
        } else if (setor.margem_percentual >= 30) {
          classificacao = 'Muito Bom';
          recomendacao = 'Bom desempenho - otimizar preços';
        } else if (setor.margem_percentual >= 15) {
          classificacao = 'Bom';
          recomendacao = 'Performance adequada - monitorar custos';
        } else if (setor.margem_percentual >= 0) {
          classificacao = 'Regular';
          recomendacao = 'Revisar estratégia de preços e custos';
        } else {
          classificacao = 'Prejuízo';
          recomendacao = 'Atenção: setor com prejuízo - revisar urgente';
        }

        return {
          setor: setor.setor_estadio,
          quantidade_vendida: setor.quantidade_paga,
          receita_total: setor.receita_total,
          custo_total: setor.custo_total,
          lucro_total: setor.lucro_total,
          preco_medio: setor.preco_medio_venda,
          margem_percentual: setor.margem_percentual,
          taxa_ocupacao: taxaOcupacao,
          classificacao_performance: classificacao,
          recomendacao
        };
      });

      setPerformanceSetores(setoresProcessados);
    } catch (err) {
      console.error('Erro ao analisar performance dos setores:', err);
      setError('Erro ao analisar performance dos setores');
    }
  }, [jogoKey]);

  // =====================================================
  // FUNÇÃO PARA ANALISAR TENDÊNCIA DE VENDAS
  // =====================================================

  const analisarTendenciaVendas = useCallback(async () => {
    try {
      // Buscar dados de ingressos com datas de criação
      const partes = jogoKey.split('-');
      const adversario = partes[0];
      const local = partes[partes.length - 1];
      const dataCompleta = partes.slice(1, -1).join('-');
      const jogoData = extrairDataDoTimestamp(dataCompleta);
      
      const { data: ingressos, error } = await supabase
        .from('ingressos')
        .select('created_at, valor_final, situacao_financeira, jogo_data')
        .eq('adversario', adversario)
        .eq('jogo_data', jogoData)
        .eq('local_jogo', local)
        .in('situacao_financeira', ['pago', 'pendente'])
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!ingressos || ingressos.length === 0) {
        setTendenciaVendas([]);
        return;
      }

      // Processar dados para criar tendência
      const dataDoJogo = new Date(ingressos[0].jogo_data);
      const vendasPorDia: { [key: string]: { vendas: number; receita: number } } = {};

      ingressos.forEach(ingresso => {
        const dataVenda = new Date(ingresso.created_at).toISOString().split('T')[0];
        if (!vendasPorDia[dataVenda]) {
          vendasPorDia[dataVenda] = { vendas: 0, receita: 0 };
        }
        vendasPorDia[dataVenda].vendas += 1;
        vendasPorDia[dataVenda].receita += ingresso.valor_final;
      });

      // Criar array de tendência
      const tendencia: TendenciaVendas[] = [];
      let vendasAcumuladas = 0;
      let receitaAcumulada = 0;

      Object.keys(vendasPorDia)
        .sort()
        .forEach((data, index, array) => {
          vendasAcumuladas += vendasPorDia[data].vendas;
          receitaAcumulada += vendasPorDia[data].receita;
          
          const dataAtual = new Date(data);
          const diasParaJogo = Math.ceil((dataDoJogo.getTime() - dataAtual.getTime()) / (1000 * 60 * 60 * 24));
          
          // Calcular velocidade de vendas (vendas por dia nos últimos 7 dias)
          const ultimosSete = array.slice(Math.max(0, index - 6), index + 1);
          const vendasUltimosSete = ultimosSete.reduce((sum, d) => sum + vendasPorDia[d].vendas, 0);
          const velocidadeVendas = vendasUltimosSete / Math.min(7, ultimosSete.length);

          tendencia.push({
            data,
            vendas_acumuladas: vendasAcumuladas,
            receita_acumulada: receitaAcumulada,
            dias_para_jogo: diasParaJogo,
            velocidade_vendas: velocidadeVendas
          });
        });

      setTendenciaVendas(tendencia);
    } catch (err) {
      console.error('Erro ao analisar tendência de vendas:', err);
      setError('Erro ao analisar tendência de vendas');
    }
  }, [jogoKey]);

  // =====================================================
  // FUNÇÃO PARA RECARREGAR TODOS OS DADOS
  // =====================================================

  const recarregarAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        calcularROIPorSetor(),
        compararComMediaHistorica(),
        analisarPerformanceSetores(),
        analisarTendenciaVendas()
      ]);
    } catch (err) {
      console.error('Erro ao recarregar analytics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [calcularROIPorSetor, compararComMediaHistorica, analisarPerformanceSetores, analisarTendenciaVendas]);

  // =====================================================
  // FUNÇÕES UTILITÁRIAS
  // =====================================================

  const obterMelhorSetor = useCallback(() => {
    if (performanceSetores.length === 0) return null;
    return performanceSetores.reduce((melhor, atual) => 
      atual.margem_percentual > melhor.margem_percentual ? atual : melhor
    );
  }, [performanceSetores]);

  const obterPiorSetor = useCallback(() => {
    if (performanceSetores.length === 0) return null;
    return performanceSetores.reduce((pior, atual) => 
      atual.margem_percentual < pior.margem_percentual ? atual : pior
    );
  }, [performanceSetores]);

  const obterSetorMaisVendido = useCallback(() => {
    if (performanceSetores.length === 0) return null;
    return performanceSetores.reduce((maisVendido, atual) => 
      atual.quantidade_vendida > maisVendido.quantidade_vendida ? atual : maisVendido
    );
  }, [performanceSetores]);

  const calcularROIMedio = useCallback(() => {
    if (roiPorSetor.length === 0) return 0;
    const somaROI = roiPorSetor.reduce((sum, setor) => sum + setor.roi_percentual, 0);
    return somaROI / roiPorSetor.length;
  }, [roiPorSetor]);

  // =====================================================
  // EFFECT PARA CARREGAR DADOS INICIAIS
  // =====================================================

  useEffect(() => {
    if (jogoKey) {
      recarregarAnalytics();
    }
  }, [jogoKey, recarregarAnalytics]);

  // =====================================================
  // RETORNO DO HOOK
  // =====================================================

  return {
    // Estados
    roiPorSetor,
    comparativoHistorico,
    performanceSetores,
    tendenciaVendas,
    isLoading,
    error,
    
    // Funções utilitárias
    obterMelhorSetor,
    obterPiorSetor,
    obterSetorMaisVendido,
    calcularROIMedio,
    
    // Função para recarregar
    recarregarAnalytics
  };
}