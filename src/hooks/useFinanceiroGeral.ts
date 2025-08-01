import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface ResumoGeral {
  total_receitas: number;
  total_despesas: number;
  lucro_liquido: number;
  margem_lucro: number;
  total_pendencias: number;
  count_pendencias: number;
  crescimento_receitas: number;
  crescimento_despesas: number;
  // Breakdown por categoria
  receitas_viagem: number;
  receitas_passeios: number;
  receitas_extras: number;
  percentual_viagem: number;
  percentual_passeios: number;
  percentual_extras: number;
}

export interface ViagemFinanceiro {
  id: string;
  adversario: string;
  data_jogo: string;
  total_receitas: number;
  total_despesas: number;
  lucro: number;
  margem: number;
  total_passageiros: number;
  pendencias: number;
  // Breakdown por categoria
  receitas_viagem: number;
  receitas_passeios: number;
  receitas_extras: number;
  percentual_viagem: number;
  percentual_passeios: number;
  percentual_extras: number;
}

export interface FluxoCaixaItem {
  data: string;
  descricao: string;
  tipo: 'entrada' | 'saida';
  categoria: string;
  valor: number;
  viagem_id?: string;
  viagem_nome?: string;
}

export interface ContaReceber {
  id: string;
  passageiro_nome: string;
  viagem_nome: string;
  valor_total: number;
  valor_pago: number;
  valor_pendente: number;
  data_vencimento: string;
  dias_atraso: number;
  status: string;
  parcelas_detalhes?: {
    numero: number;
    valor: number;
    data_vencimento: string;
    data_pagamento?: string;
    status: 'pago' | 'pendente' | 'vencido';
    forma_pagamento?: string;
  }[];
}

export interface ContaPagar {
  id: string;
  fornecedor: string;
  descricao: string;
  categoria: string;
  valor: number;
  data_vencimento: string;
  status: string;
  viagem_nome?: string;
}

export function useFinanceiroGeral(filtroData: { inicio: string; fim: string }) {
  const [resumoGeral, setResumoGeral] = useState<ResumoGeral | null>(null);
  const [fluxoCaixa, setFluxoCaixa] = useState<FluxoCaixaItem[]>([]);
  const [contasReceber, setContasReceber] = useState<ContaReceber[]>([]);
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>([]);
  const [viagensFinanceiro, setViagensFinanceiro] = useState<ViagemFinanceiro[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar resumo geral
  const fetchResumoGeral = async () => {
    try {
      // PRIORIDADE: Buscar dados que JÁ EXISTEM no seu sistema
      
      // Buscar receitas extras (pode estar vazio, sem problema)
      let receitasExtras = 0;
      try {
        const { data: receitasData } = await supabase
          .from('viagem_receitas')
          .select('valor')
          .gte('data_recebimento', filtroData.inicio)
          .lte('data_recebimento', filtroData.fim)
          .eq('status', 'recebido');
        
        receitasExtras = (receitasData || []).reduce((sum, r) => sum + r.valor, 0);
      } catch (error) {
        console.log('Tabela viagem_receitas vazia ou erro:', error);
        receitasExtras = 0;
      }

      // Buscar despesas extras (pode estar vazio, sem problema)
      let despesasExtras = 0;
      try {
        const { data: despesasData } = await supabase
          .from('viagem_despesas')
          .select('valor')
          .gte('data_despesa', filtroData.inicio)
          .lte('data_despesa', filtroData.fim)
          .eq('status', 'pago');
        
        despesasExtras = (despesasData || []).reduce((sum, d) => sum + d.valor, 0);
      } catch (error) {
        console.log('Tabela viagem_despesas vazia ou erro:', error);
        despesasExtras = 0;
      }

      // PRINCIPAL: Buscar receitas de passageiros (dados que JÁ EXISTEM)
      // Primeiro buscar viagens no período
      const { data: viagensNoPeriodo, error: viagensError } = await supabase
        .from('viagens')
        .select('id')
        .gte('data_jogo', filtroData.inicio)
        .lte('data_jogo', filtroData.fim);

      if (viagensError) throw viagensError;

      const viagemIds = (viagensNoPeriodo || []).map(v => v.id);

      if (viagemIds.length === 0) {
        // Não há viagens no período
        setResumoGeral({
          total_receitas: 0,
          total_despesas: 0,
          lucro_liquido: 0,
          margem_lucro: 0,
          total_pendencias: 0,
          count_pendencias: 0,
          crescimento_receitas: 0,
          crescimento_despesas: 0,
          // Breakdown por categoria
          receitas_viagem: 0,
          receitas_passeios: 0,
          receitas_extras: 0,
          percentual_viagem: 0,
          percentual_passeios: 0,
          percentual_extras: 0
        });
        return;
      }

      // Buscar passageiros das viagens no período
      const { data: passageirosData, error: passageirosError } = await supabase
        .from('viagem_passageiros')
        .select(`
          valor,
          desconto,
          passageiro_passeios(valor_cobrado),
          historico_pagamentos_categorizado(categoria, valor_pago, data_pagamento)
        `)
        .in('viagem_id', viagemIds);

      if (passageirosError) {
        console.error('Erro ao buscar passageiros:', passageirosError);
        throw passageirosError;
      }

      // Calcular totais dos dados REAIS que já existem com breakdown
      let totalReceitasPassageiros = 0;
      let receitasViagem = 0;
      let receitasPasseios = 0;
      let totalPendencias = 0;
      let countPendencias = 0;

      (passageirosData || []).forEach((p: any) => {
        const valorViagem = (p.valor || 0) - (p.desconto || 0);
        const valorPasseios = (p.passageiro_passeios || [])
          .reduce((sum: number, pp: any) => sum + (pp.valor_cobrado || 0), 0);
        const valorLiquido = valorViagem + valorPasseios;
        
        // Breakdown por categoria
        receitasViagem += valorViagem;
        receitasPasseios += valorPasseios;
        
        // Calcular valor pago considerando apenas pagamentos NO PERÍODO
        const historicoPagamentos = p.historico_pagamentos_categorizado || [];
        const valorPagoNoPeriodo = historicoPagamentos
          .reduce((sum: number, pagamento: any) => {
            if (!pagamento.data_pagamento) return sum;
            
            const dataPagamento = new Date(pagamento.data_pagamento);
            const dataInicio = new Date(filtroData.inicio);
            const dataFim = new Date(filtroData.fim);
            
            // Só conta se foi pago no período selecionado
            if (dataPagamento >= dataInicio && dataPagamento <= dataFim) {
              return sum + (pagamento.valor_pago || 0);
            }
            return sum;
          }, 0);
        
        // Valor total pago (independente do período) para calcular pendências
        const valorPagoTotal = historicoPagamentos
          .reduce((sum: number, pagamento: any) => 
            pagamento.data_pagamento ? sum + (pagamento.valor_pago || 0) : sum, 0
          );
        
        // Receita total da viagem (sempre conta o valor líquido)
        totalReceitasPassageiros += valorLiquido;
        
        // Pendência baseada no valor total pago (não só do período)
        const pendente = valorLiquido - valorPagoTotal;
        if (pendente > 0.01) {
          totalPendencias += pendente;
          countPendencias++;
        }
      });

      // TOTAL: Dados reais + dados extras (se existirem)
      const totalReceitas = totalReceitasPassageiros + receitasExtras;
      const totalDespesas = despesasExtras; // Por enquanto só despesas extras
      const lucroLiquido = totalReceitas - totalDespesas;
      const margemLucro = totalReceitas > 0 ? (lucroLiquido / totalReceitas) * 100 : 0;

      // Calcular percentuais por categoria
      const percentualViagem = totalReceitas > 0 ? (receitasViagem / totalReceitas) * 100 : 0;
      const percentualPasseios = totalReceitas > 0 ? (receitasPasseios / totalReceitas) * 100 : 0;
      const percentualExtras = totalReceitas > 0 ? (receitasExtras / totalReceitas) * 100 : 0;

      setResumoGeral({
        total_receitas: totalReceitas,
        total_despesas: totalDespesas,
        lucro_liquido: lucroLiquido,
        margem_lucro: margemLucro,
        total_pendencias: totalPendencias,
        count_pendencias: countPendencias,
        crescimento_receitas: 0, // TODO: Calcular vs período anterior
        crescimento_despesas: 0, // TODO: Calcular vs período anterior
        // Breakdown por categoria
        receitas_viagem: receitasViagem,
        receitas_passeios: receitasPasseios,
        receitas_extras: receitasExtras,
        percentual_viagem: percentualViagem,
        percentual_passeios: percentualPasseios,
        percentual_extras: percentualExtras
      });

    } catch (error) {
      console.error('Erro ao buscar resumo geral:', error);
      toast.error('Erro ao carregar resumo financeiro');
    }
  };

  // Buscar performance por viagem
  const fetchViagensFinanceiro = async () => {
    try {
      // Buscar dados das viagens
      const { data: viagensData, error: viagensError } = await supabase
        .from('viagens')
        .select('id, adversario, data_jogo')
        .gte('data_jogo', filtroData.inicio)
        .lte('data_jogo', filtroData.fim)
        .order('data_jogo', { ascending: false });

      if (viagensError) throw viagensError;

      if (!viagensData || viagensData.length === 0) {
        setViagensFinanceiro([]);
        return;
      }

      // Buscar passageiros para todas as viagens
      const viagemIds = viagensData.map(v => v.id);
      const { data: passageirosTodasViagens, error: passageirosError } = await supabase
        .from('viagem_passageiros')
        .select(`
          viagem_id,
          valor,
          desconto,
          passageiro_passeios(valor_cobrado),
          historico_pagamentos_categorizado(categoria, valor_pago, data_pagamento)
        `)
        .in('viagem_id', viagemIds);

      if (passageirosError) throw passageirosError;

      // Buscar receitas extras por viagem (opcional, pode estar vazio)
      let receitasPorViagem: any = {};
      try {
        const { data: receitasExtras } = await supabase
          .from('viagem_receitas')
          .select('viagem_id, valor')
          .eq('status', 'recebido');

        receitasPorViagem = (receitasExtras || []).reduce((acc: any, receita: any) => {
          acc[receita.viagem_id] = (acc[receita.viagem_id] || 0) + receita.valor;
          return acc;
        }, {});
      } catch (error) {
        console.log('Receitas extras não encontradas, usando apenas passageiros');
        receitasPorViagem = {};
      }

      // Buscar despesas por viagem (opcional, pode estar vazio)
      let despesasPorViagem: any = {};
      try {
        const { data: despesasViagem } = await supabase
          .from('viagem_despesas')
          .select('viagem_id, valor')
          .eq('status', 'pago');

        despesasPorViagem = (despesasViagem || []).reduce((acc: any, despesa: any) => {
          acc[despesa.viagem_id] = (acc[despesa.viagem_id] || 0) + despesa.valor;
          return acc;
        }, {});
      } catch (error) {
        console.log('Despesas extras não encontradas, usando valor 0');
        despesasPorViagem = {};
      }

      // Agrupar passageiros por viagem
      const passageirosPorViagem = (passageirosTodasViagens || []).reduce((acc: any, p: any) => {
        if (!acc[p.viagem_id]) acc[p.viagem_id] = [];
        acc[p.viagem_id].push(p);
        return acc;
      }, {});

      const viagensFinanceiroData: ViagemFinanceiro[] = viagensData.map((viagem: any) => {
        const passageirosViagem = passageirosPorViagem[viagem.id] || [];
        
        // Calcular receitas de passageiros com breakdown
        let receitasViagemTotal = 0;
        let receitasPasseiosTotal = 0;
        let pendencias = 0;
        
        passageirosViagem.forEach((p: any) => {
          const valorViagem = (p.valor || 0) - (p.desconto || 0);
          const valorPasseios = (p.passageiro_passeios || [])
            .reduce((sum: number, pp: any) => sum + (pp.valor_cobrado || 0), 0);
          
          // Breakdown por categoria
          receitasViagemTotal += valorViagem;
          receitasPasseiosTotal += valorPasseios;
          
          const historicoPagamentos = p.historico_pagamentos_categorizado || [];
          const valorPago = historicoPagamentos
            .reduce((sum: number, pagamento: any) => pagamento.data_pagamento ? sum + (pagamento.valor_pago || 0) : sum, 0);
          
          const valorLiquido = valorViagem + valorPasseios;
          const pendente = valorLiquido - valorPago;
          if (pendente > 0.01) {
            pendencias += pendente;
          }
        });

        // Somar receitas extras e despesas da viagem (se existirem)
        const receitasExtrasViagem = receitasPorViagem[viagem.id] || 0;
        const despesasViagemExtras = despesasPorViagem[viagem.id] || 0;
        
        // TOTAL: Receitas reais (passageiros) + extras (se houver)
        const receitasPassageiros = receitasViagemTotal + receitasPasseiosTotal;
        const totalReceitas = receitasPassageiros + receitasExtrasViagem;
        const totalDespesas = despesasViagemExtras; // Por enquanto só extras
        const lucro = totalReceitas - totalDespesas;
        const margem = totalReceitas > 0 ? (lucro / totalReceitas) * 100 : 0;

        // Calcular percentuais por categoria
        const percentualViagem = totalReceitas > 0 ? (receitasViagemTotal / totalReceitas) * 100 : 0;
        const percentualPasseios = totalReceitas > 0 ? (receitasPasseiosTotal / totalReceitas) * 100 : 0;
        const percentualExtras = totalReceitas > 0 ? (receitasExtrasViagem / totalReceitas) * 100 : 0;

        return {
          id: viagem.id,
          adversario: viagem.adversario,
          data_jogo: viagem.data_jogo,
          total_receitas: totalReceitas,
          total_despesas: totalDespesas,
          lucro: lucro,
          margem: margem,
          total_passageiros: passageirosViagem.length,
          pendencias: pendencias,
          // Breakdown por categoria
          receitas_viagem: receitasViagemTotal,
          receitas_passeios: receitasPasseiosTotal,
          receitas_extras: receitasExtrasViagem,
          percentual_viagem: percentualViagem,
          percentual_passeios: percentualPasseios,
          percentual_extras: percentualExtras
        };
      });

      setViagensFinanceiro(viagensFinanceiroData);

    } catch (error) {
      console.error('Erro ao buscar viagens financeiro:', error);
      toast.error('Erro ao carregar dados das viagens');
    }
  };

  // Buscar fluxo de caixa
  const fetchFluxoCaixa = async () => {
    try {
      const fluxoItems: FluxoCaixaItem[] = [];

      // Buscar pagamentos de passageiros como entradas
      const { data: pagamentosData, error: pagamentosError } = await supabase
        .from('historico_pagamentos_categorizado')
        .select(`
          valor_pago,
          data_pagamento,
          forma_pagamento,
          categoria,
          viagem_passageiro_id
        `)
        .gte('data_pagamento', filtroData.inicio)
        .lte('data_pagamento', filtroData.fim)
        .order('data_pagamento', { ascending: false });

      if (!pagamentosError && pagamentosData) {
        // Buscar detalhes dos passageiros para os pagamentos
        const passageiroIds = [...new Set(pagamentosData.map(p => p.viagem_passageiro_id))];
        
        if (passageiroIds.length > 0) {
          const { data: passageirosDetalhes } = await supabase
            .from('viagem_passageiros')
            .select('id, viagem_id, cliente_id')
            .in('id', passageiroIds);

          // Buscar detalhes dos clientes e viagens
          const clienteIds = [...new Set((passageirosDetalhes || []).map(p => p.cliente_id))];
          const viagemIds = [...new Set((passageirosDetalhes || []).map(p => p.viagem_id))];

          let clientesMap: any = {};
          let viagensMap: any = {};

          if (clienteIds.length > 0) {
            const { data: clientesData } = await supabase
              .from('clientes')
              .select('id, nome')
              .in('id', clienteIds);
            
            clientesMap = (clientesData || []).reduce((acc: any, c: any) => {
              acc[c.id] = c;
              return acc;
            }, {});
          }

          if (viagemIds.length > 0) {
            const { data: viagensData } = await supabase
              .from('viagens')
              .select('id, adversario')
              .in('id', viagemIds);
            
            viagensMap = (viagensData || []).reduce((acc: any, v: any) => {
              acc[v.id] = v;
              return acc;
            }, {});
          }

          const passageirosMap = (passageirosDetalhes || []).reduce((acc: any, p: any) => {
            acc[p.id] = {
              ...p,
              cliente: clientesMap[p.cliente_id],
              viagem: viagensMap[p.viagem_id]
            };
            return acc;
          }, {});

          pagamentosData.forEach((pagamento: any) => {
            const passageiro = passageirosMap[pagamento.viagem_passageiro_id];
            const categoriaLabel = pagamento.categoria === 'viagem' ? 'Viagem' : 
                                 pagamento.categoria === 'passeios' ? 'Passeios' : 
                                 'Pagamento Completo';
            fluxoItems.push({
              data: pagamento.data_pagamento,
              descricao: `${categoriaLabel} - ${passageiro?.cliente?.nome || 'Passageiro'}`,
              tipo: 'entrada',
              categoria: 'passageiro',
              valor: pagamento.valor_pago,
              viagem_id: passageiro?.viagem_id,
              viagem_nome: passageiro?.viagem?.adversario
            });
          });
        }
      }

      // Buscar receitas extras das viagens (se existirem)
      try {
        const { data: receitasData } = await supabase
          .from('viagem_receitas')
          .select(`
            valor,
            data_recebimento,
            descricao,
            categoria,
            viagem_id,
            viagens(adversario)
          `)
          .gte('data_recebimento', filtroData.inicio)
          .lte('data_recebimento', filtroData.fim)
          .eq('status', 'recebido')
          .order('data_recebimento', { ascending: false });

        if (receitasData) {
          receitasData.forEach((receita: any) => {
            fluxoItems.push({
              data: receita.data_recebimento,
              descricao: receita.descricao,
              tipo: 'entrada',
              categoria: receita.categoria,
              valor: receita.valor,
              viagem_id: receita.viagem_id,
              viagem_nome: receita.viagens?.adversario
            });
          });
        }
      } catch (error) {
        console.log('Receitas extras não encontradas no fluxo de caixa');
      }

      // Buscar despesas das viagens (se existirem)
      try {
        const { data: despesasData } = await supabase
          .from('viagem_despesas')
          .select(`
            valor,
            data_despesa,
            fornecedor,
            categoria,
            viagem_id,
            viagens(adversario)
          `)
          .gte('data_despesa', filtroData.inicio)
          .lte('data_despesa', filtroData.fim)
          .eq('status', 'pago')
          .order('data_despesa', { ascending: false });

        if (despesasData) {
          despesasData.forEach((despesa: any) => {
            fluxoItems.push({
              data: despesa.data_despesa,
              descricao: despesa.fornecedor,
              tipo: 'saida',
              categoria: despesa.categoria,
              valor: despesa.valor,
              viagem_id: despesa.viagem_id,
              viagem_nome: despesa.viagens?.adversario
            });
          });
        }
      } catch (error) {
        console.log('Despesas extras não encontradas no fluxo de caixa');
      }

      // Ordenar por data
      fluxoItems.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      
      setFluxoCaixa(fluxoItems);

    } catch (error) {
      console.error('Erro ao buscar fluxo de caixa:', error);
      toast.error('Erro ao carregar fluxo de caixa');
    }
  };

  // Buscar contas a receber
  const fetchContasReceber = async () => {
    try {
      // Buscar passageiros que têm pendências (independente do período)
      const { data: passageirosData, error } = await supabase
        .from('viagem_passageiros')
        .select(`
          id,
          valor,
          desconto,
          created_at,
          viagem_id,
          cliente_id,
          passageiro_passeios(valor_cobrado),
          historico_pagamentos_categorizado(
            valor_pago, 
            data_pagamento, 
            forma_pagamento,
            categoria
          )
        `)

      if (error) throw error;

      const contasReceberData: ContaReceber[] = [];

      // Buscar detalhes das viagens e clientes para os passageiros
      const viagemIdsUnicos = [...new Set((passageirosData || []).map(p => p.viagem_id))];
      const clienteIdsUnicos = [...new Set((passageirosData || []).map(p => p.cliente_id))];
      
      let viagensDetalhes: any = {};
      let clientesDetalhes: any = {};
      
      if (viagemIdsUnicos.length > 0) {
        const { data: viagensData } = await supabase
          .from('viagens')
          .select('id, adversario, data_jogo')
          .in('id', viagemIdsUnicos);
        
        viagensDetalhes = (viagensData || []).reduce((acc: any, v: any) => {
          acc[v.id] = v;
          return acc;
        }, {});
      }

      if (clienteIdsUnicos.length > 0) {
        const { data: clientesData } = await supabase
          .from('clientes')
          .select('id, nome')
          .in('id', clienteIdsUnicos);
        
        clientesDetalhes = (clientesData || []).reduce((acc: any, c: any) => {
          acc[c.id] = c;
          return acc;
        }, {});
      }

      (passageirosData || []).forEach((passageiro: any) => {
        const valorViagem = (passageiro.valor || 0) - (passageiro.desconto || 0);
        const valorPasseios = (passageiro.passageiro_passeios || [])
          .reduce((sum: number, pp: any) => sum + (pp.valor_cobrado || 0), 0);
        const valorTotal = valorViagem + valorPasseios;
        
        // Calcular valor pago e última data de pagamento
        let valorPago = 0;
        let ultimaDataPagamento = null;
        
        (passageiro.historico_pagamentos_categorizado || []).forEach((pagamento: any) => {
          if (pagamento.data_pagamento) {
            valorPago += pagamento.valor_pago || 0;
            const dataPagamento = new Date(pagamento.data_pagamento);
            if (!ultimaDataPagamento || dataPagamento > ultimaDataPagamento) {
              ultimaDataPagamento = dataPagamento;
            }
          }
        });
        
        const valorPendente = valorTotal - valorPago;

        if (valorPendente > 0.01) {
          const viagem = viagensDetalhes[passageiro.viagem_id];
          const cliente = clientesDetalhes[passageiro.cliente_id];
          
          // Calcular dias de atraso baseado na data do jogo (vencimento)
          const dataVencimento = viagem?.data_jogo ? new Date(viagem.data_jogo) : new Date(passageiro.created_at);
          const diasAtraso = Math.floor(
            (new Date().getTime() - dataVencimento.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Processar detalhes dos pagamentos
          const pagamentosDetalhes = (passageiro.historico_pagamentos_categorizado || []).map((pagamento: any) => {
            return {
              id: pagamento.id,
              valor: pagamento.valor_pago,
              categoria: pagamento.categoria,
              data_pagamento: pagamento.data_pagamento,
              forma_pagamento: pagamento.forma_pagamento,
              status: 'pago' as const
            };
          });

          // Filtrar por período baseado na data de vencimento ou última atividade
          const dataReferencia = ultimaDataPagamento || dataVencimento;
          const dataReferenciaStr = dataReferencia.toISOString().split('T')[0];
          
          // OPÇÃO 1: Mostrar apenas contas do período atual
          // if (dataReferenciaStr >= filtroData.inicio && dataReferenciaStr <= filtroData.fim) {
          
          // OPÇÃO 2: Mostrar TODAS as pendências (recomendado para contas a receber)
          contasReceberData.push({
            id: passageiro.id,
            passageiro_nome: cliente?.nome || 'N/A',
            viagem_nome: viagem ? `Flamengo x ${viagem.adversario}` : 'Viagem',
            valor_total: valorTotal,
            valor_pago: valorPago,
            valor_pendente: valorPendente,
            data_vencimento: viagem?.data_jogo || passageiro.created_at,
            dias_atraso: diasAtraso,
            status: valorPago > 0 ? 'Parcial' : 'Pendente',
            pagamentos_detalhes: pagamentosDetalhes
          });
          // }
        }
      });

      // Ordenar por dias de atraso
      contasReceberData.sort((a, b) => b.dias_atraso - a.dias_atraso);
      
      setContasReceber(contasReceberData);

    } catch (error) {
      console.error('Erro ao buscar contas a receber:', error);
      toast.error('Erro ao carregar contas a receber');
    }
  };

  // Buscar contas a pagar
  const fetchContasPagar = async () => {
    try {
      let contasPagarData: ContaPagar[] = [];
      
      // Tentar buscar despesas extras (pode estar vazio)
      try {
        const { data: despesasData } = await supabase
          .from('viagem_despesas')
          .select(`
            id,
            fornecedor,
            categoria,
            subcategoria,
            valor,
            data_despesa,
            status,
            viagem_id,
            viagens(adversario)
          `)
          .gte('data_despesa', filtroData.inicio)
          .lte('data_despesa', filtroData.fim)
          .order('data_despesa', { ascending: false });

        if (despesasData) {
          contasPagarData = despesasData.map((despesa: any) => ({
            id: despesa.id,
            fornecedor: despesa.fornecedor,
            descricao: despesa.subcategoria || despesa.categoria,
            categoria: despesa.categoria,
            valor: despesa.valor,
            data_vencimento: despesa.data_despesa,
            status: despesa.status,
            viagem_nome: despesa.viagens?.adversario ? `Flamengo x ${despesa.viagens.adversario}` : undefined
          }));
        }
      } catch (error) {
        console.log('Tabela viagem_despesas vazia ou erro:', error);
        contasPagarData = [];
      }

      setContasPagar(contasPagarData);

    } catch (error) {
      console.error('Erro ao buscar contas a pagar:', error);
      // Não mostrar toast de erro se for só porque a tabela está vazia
      if (!error.message?.includes('does not exist')) {
        toast.error('Erro ao carregar contas a pagar');
      }
    }
  };

  // Atualizar todos os dados
  const atualizarDados = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchResumoGeral(),
        fetchViagensFinanceiro(),
        fetchFluxoCaixa(),
        fetchContasReceber(),
        fetchContasPagar()
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados quando o filtro de data mudar
  useEffect(() => {
    atualizarDados();
  }, [filtroData.inicio, filtroData.fim]);

  return {
    resumoGeral,
    fluxoCaixa,
    contasReceber,
    contasPagar,
    viagensFinanceiro,
    isLoading,
    atualizarDados
  };
}