// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface ParcelaPendente {
  id: string;
  numero_parcela: number;
  total_parcelas: number;
  valor_parcela: number;
  data_vencimento: string;
  dias_atraso: number;
  viagem_adversario: string;
  viagem_data: string;
  status: string;
}

export interface HistoricoPagamento {
  id: string;
  data_pagamento: string;
  valor_pago: number;
  forma_pagamento: string;
  numero_parcela: number;
  total_parcelas: number;
  viagem_adversario: string;
  viagem_data: string;
}

export interface FinanceiroCliente {
  resumo: {
    total_gasto: number;
    valor_pendente: number;
    ultima_compra: string;
    ticket_medio: number;
    total_viagens: number;
  };
  status_credito: {
    classificacao: 'bom' | 'atencao' | 'inadimplente';
    score: number;
    motivo?: string;
  };
  parcelas_pendentes: ParcelaPendente[];
  historico_pagamentos: HistoricoPagamento[];
}

export const useClienteFinanceiro = (clienteId: string) => {
  const [financeiro, setFinanceiro] = useState<FinanceiroCliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchFinanceiroCliente = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Buscar todas as participações do cliente em viagens com passeios
      const { data: viagensPassageiro, error: viagensError } = await supabase
        .from('viagem_passageiros')
        .select(`
          id,
          valor,
          desconto,
          created_at,
          gratuito,
          passageiro_passeios(valor_cobrado),
          historico_pagamentos_categorizado(
            id,
            categoria,
            valor_pago,
            data_pagamento,
            forma_pagamento,
            observacoes
          ),
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

      if (!viagensPassageiro || viagensPassageiro.length === 0) {
        // Cliente sem viagens
        setFinanceiro({
          resumo: {
            total_gasto: 0,
            valor_pendente: 0,
            ultima_compra: '',
            ticket_medio: 0,
            total_viagens: 0,
          },
          status_credito: {
            classificacao: 'bom',
            score: 100,
            motivo: 'Cliente novo sem histórico',
          },
          parcelas_pendentes: [],
          historico_pagamentos: [],
        });
        return;
      }

      // 2. Processar dados financeiros com sistema novo
      const hoje = new Date();
      const parcelasPendentes: ParcelaPendente[] = [];
      const historicoPagamentos: HistoricoPagamento[] = [];
      
      let totalGasto = 0;
      let valorPendente = 0;
      let ultimaCompra = '';

      // Processar cada viagem com sistema novo
      viagensPassageiro.forEach(vp => {
        // Calcular valor da viagem
        const valorViagem = (vp.valor || 0) - (vp.desconto || 0);
        
        // Calcular valor dos passeios
        const valorPasseios = (vp.passageiro_passeios || [])
          .reduce((sum: number, pp: any) => sum + (pp.valor_cobrado || 0), 0);
        
        // Se passageiro gratuito, zerar valores
        const valorTotal = vp.gratuito ? 0 : (valorViagem + valorPasseios);
        
        totalGasto += valorTotal;
        
        if (!ultimaCompra || vp.created_at > ultimaCompra) {
          ultimaCompra = vp.created_at;
        }

        // Processar histórico de pagamentos
        const pagamentos = vp.historico_pagamentos_categorizado || [];
        const valorPago = pagamentos.reduce((sum: number, p: any) => 
          p.data_pagamento ? sum + (p.valor_pago || 0) : sum, 0
        );
        
        const pendente = valorTotal - valorPago;
        
        if (pendente > 0.01) {
          // Criar "parcela pendente" baseada na data do jogo
          const dataVencimento = new Date(vp.viagens?.data_jogo || vp.created_at);
          const diasAtraso = Math.floor((hoje.getTime() - dataVencimento.getTime()) / (1000 * 60 * 60 * 24));
          
          valorPendente += pendente;
          
          parcelasPendentes.push({
            id: vp.id,
            numero_parcela: 1,
            total_parcelas: 1,
            valor_parcela: pendente,
            data_vencimento: vp.viagens?.data_jogo || vp.created_at,
            dias_atraso: Math.max(0, diasAtraso),
            viagem_adversario: vp.viagens?.adversario || 'Adversário não informado',
            viagem_data: vp.viagens?.data_jogo || '',
            status: diasAtraso > 0 ? 'atrasado' : 'pendente',
          });
        }

        // Adicionar pagamentos ao histórico
        pagamentos.forEach((pagamento: any) => {
          if (pagamento.data_pagamento) {
            historicoPagamentos.push({
              id: pagamento.id,
              data_pagamento: pagamento.data_pagamento,
              valor_pago: pagamento.valor_pago || 0,
              forma_pagamento: pagamento.forma_pagamento || 'Não informado',
              numero_parcela: 1,
              total_parcelas: 1,
              viagem_adversario: vp.viagens?.adversario || 'Adversário não informado',
              viagem_data: vp.viagens?.data_jogo || '',
            });
          }
        });
      });

      // 3. Calcular score de crédito baseado em dados reais do sistema novo
      const totalViagens = viagensPassageiro.length;
      const ticketMedio = totalViagens > 0 ? totalGasto / totalViagens : 0;
      
      // Algoritmo de score baseado no sistema novo
      let score = 100;
      let classificacao: 'bom' | 'atencao' | 'inadimplente';
      let motivo = '';
      
      const totalPendencias = parcelasPendentes.length;
      const pendenciasAtrasadas = parcelasPendentes.filter(p => p.dias_atraso > 0).length;
      const pendenciasVencidas = parcelasPendentes.filter(p => p.dias_atraso > 0);
      
      // Debug logs
      console.log('🔍 Debug Score de Crédito (Sistema Novo):', {
        totalPendencias,
        pendenciasAtrasadas,
        valorPendente,
        pendenciasVencidas: pendenciasVencidas.length,
        historicoPagamentos: historicoPagamentos.length,
        totalGasto
      });

      // Lógica baseada no sistema novo de pagamentos
      if (pendenciasAtrasadas === 0 && valorPendente <= 0.01) {
        // Cliente em dia - score alto
        score = 100;
        classificacao = 'bom';
        motivo = 'Cliente em dia com todos os pagamentos (viagens + passeios)';
        console.log('✅ Cliente em dia completo');
      } else if (pendenciasAtrasadas === 0 && valorPendente > 0.01) {
        // Tem pendências mas não em atraso - score bom
        score = 85;
        classificacao = 'bom';
        motivo = `Cliente pontual com R$ ${valorPendente.toFixed(2)} pendente`;
        console.log('⏳ Cliente pontual com pendências');
      } else if (pendenciasAtrasadas > 0) {
        // Tem pendências em atraso - calcular baseado na gravidade
        const diasMaximoAtraso = Math.max(...pendenciasVencidas.map(p => p.dias_atraso));
        const percentualAtrasado = totalPendencias > 0 ? (pendenciasAtrasadas / totalPendencias) * 100 : 0;
        
        console.log('🚨 Cliente com atrasos:', { diasMaximoAtraso, percentualAtrasado });
        
        if (diasMaximoAtraso <= 7) {
          // Atraso leve (até 7 dias)
          score = 70 - (percentualAtrasado * 0.2);
          classificacao = 'atencao';
          motivo = `${pendenciasAtrasadas} viagem(ns) com atraso leve (até 7 dias)`;
          console.log('⚠️ Atraso leve');
        } else if (diasMaximoAtraso <= 30) {
          // Atraso moderado (8-30 dias)
          score = 50 - (percentualAtrasado * 0.3);
          classificacao = 'atencao';
          motivo = `${pendenciasAtrasadas} viagem(ns) com atraso moderado (até 30 dias)`;
          console.log('⚠️ Atraso moderado');
        } else {
          // Atraso grave (mais de 30 dias)
          score = 30 - (percentualAtrasado * 0.5);
          classificacao = 'inadimplente';
          motivo = `${pendenciasAtrasadas} viagem(ns) com atraso grave (mais de 30 dias)`;
          console.log('🔴 Atraso grave');
        }
      } else {
        // Cliente novo sem histórico
        score = 80;
        classificacao = 'bom';
        motivo = 'Cliente novo sem histórico de pagamentos';
        console.log('🆕 Cliente novo');
      }
      
      // Ajustar score baseado no histórico positivo
      if (historicoPagamentos.length > 0) {
        const bonusHistorico = Math.min(15, historicoPagamentos.length * 1.5);
        score += bonusHistorico;
      }
      
      // Bonus para clientes com muitas viagens pagas
      if (totalViagens >= 5 && valorPendente <= totalGasto * 0.1) {
        score += 5; // Bonus cliente fiel
      }
      
      // Garantir que o score está entre 0 e 100
      score = Math.round(Math.max(0, Math.min(100, score)));
      
      // Ajustar classificação final baseada no score calculado
      if (score >= 80) {
        classificacao = 'bom';
      } else if (score >= 60) {
        classificacao = 'atencao';
      } else {
        classificacao = 'inadimplente';
      }

      console.log('📊 Score Final (Sistema Novo):', { score, classificacao, motivo });

      // 5. Montar resultado final
      const resultado: FinanceiroCliente = {
        resumo: {
          total_gasto: totalGasto,
          valor_pendente: valorPendente,
          ultima_compra: ultimaCompra ? new Date(ultimaCompra).toLocaleDateString('pt-BR') : '',
          ticket_medio: ticketMedio,
          total_viagens: totalViagens,
        },
        status_credito: {
          classificacao,
          score,
          motivo,
        },
        parcelas_pendentes: parcelasPendentes.sort((a, b) => b.dias_atraso - a.dias_atraso),
        historico_pagamentos: historicoPagamentos.sort((a, b) => 
          new Date(b.data_pagamento).getTime() - new Date(a.data_pagamento).getTime()
        ),
      };

      setFinanceiro(resultado);
    } catch (err: any) {
      console.error('Erro ao buscar dados financeiros do cliente:', err);
      setError(err.message || 'Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clienteId) {
      setError('ID do cliente não fornecido');
      setLoading(false);
      return;
    }

    fetchFinanceiroCliente();
  }, [clienteId, refreshKey]);

  const refetch = () => {
    setRefreshKey(prev => prev + 1);
  };

  return { financeiro, loading, error, refetch };
};