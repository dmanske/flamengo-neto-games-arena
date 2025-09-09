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
  receitas_ingressos: number; // ✨ NOVO: receitas de ingressos
  percentual_viagem: number;
  percentual_passeios: number;
  percentual_extras: number;
  percentual_ingressos: number; // ✨ NOVO: percentual de ingressos
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
  receitas_ingressos: number; // ✨ NOVO: receitas de ingressos
  percentual_viagem: number;
  percentual_passeios: number;
  percentual_extras: number;
  percentual_ingressos: number; // ✨ NOVO: percentual de ingressos
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

// ✨ NOVO: Interface para ingressos financeiro
export interface IngressoFinanceiro {
  id: string;
  adversario: string;
  jogo_data: string;
  setor_estadio: string;
  local_jogo: 'casa' | 'fora';
  receita: number;
  custo: number;
  lucro: number;
  margem: number;
  situacao_financeira: 'pendente' | 'pago' | 'cancelado';
  cliente_nome?: string;
}

export function useFinanceiroGeral(filtroData: { inicio: string; fim: string }) {
  const [resumoGeral, setResumoGeral] = useState<ResumoGeral | null>(null);
  const [fluxoCaixa, setFluxoCaixa] = useState<FluxoCaixaItem[]>([]);
  const [contasReceber, setContasReceber] = useState<ContaReceber[]>([]);
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>([]);
  const [viagensFinanceiro, setViagensFinanceiro] = useState<ViagemFinanceiro[]>([]);
  const [ingressosFinanceiro, setIngressosFinanceiro] = useState<IngressoFinanceiro[]>([]); // ✨ NOVO
  const [isLoading, setIsLoading] = useState(true);
  
  // ✨ NOVO: Estados de carregamento granular
  const [loadingResumo, setLoadingResumo] = useState(true);
  const [loadingContas, setLoadingContas] = useState(true);

  // Buscar resumo geral
  const fetchResumoGeral = async () => {
    setLoadingResumo(true);
    console.log('🚀 INICIANDO fetchResumoGeral com filtro:', filtroData);
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

      // PRINCIPAL: Buscar receitas de passageiros (dados que JÁ EXISTEM)
      // Primeiro buscar viagens no período
      const { data: viagensNoPeriodo, error: viagensError } = await supabase
        .from('viagens')
        .select('id, adversario, data_jogo')
        .gte('data_jogo', filtroData.inicio)
        .lte('data_jogo', filtroData.fim);

      if (viagensError) throw viagensError;

      console.log('🔍 DEBUG Viagens no período:', {
        periodo: { inicio: filtroData.inicio, fim: filtroData.fim },
        viagensEncontradas: viagensNoPeriodo?.length || 0,
        viagens: viagensNoPeriodo?.map(v => ({ id: v.id, adversario: v.adversario, data: v.data_jogo }))
      });

      const viagemIds = (viagensNoPeriodo || []).map(v => v.id);

      // ✨ CORREÇÃO SIMPLES: Buscar despesas das viagens no período (igual às receitas)
      let despesasManuais = 0;
      try {
        const { data: despesasData } = await supabase
          .from('viagem_despesas')
          .select('valor')
          .in('viagem_id', viagemIds) // Usar as mesmas viagens filtradas por período
          .eq('status', 'pago');

        console.log('💸 Despesas manuais encontradas:', despesasData?.length || 0);
        console.log('🔍 Viagens IDs para despesas:', viagemIds);
        despesasManuais = (despesasData || []).reduce((sum, d) => sum + d.valor, 0);
        console.log('💸 Total despesas manuais:', despesasManuais);
      } catch (error) {
        console.log('Tabela viagem_despesas vazia ou erro:', error);
        despesasManuais = 0;
      }

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
          receitas_ingressos: 0,
          percentual_viagem: 0,
          percentual_passeios: 0,
          percentual_extras: 0,
          percentual_ingressos: 0
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

      // ✨ NOVO: Buscar receitas e despesas de INGRESSOS no período
      let receitasIngressos = 0;
      let custosIngressos = 0;
      try {
        const { data: ingressosData, error: ingressosError } = await supabase
          .from('ingressos')
          .select('valor_final, preco_custo, situacao_financeira, jogo_data')
          .gte('jogo_data', filtroData.inicio)
          .lte('jogo_data', filtroData.fim);

        if (ingressosError) throw ingressosError;

        if (ingressosData && ingressosData.length > 0) {
          // Somar receitas dos ingressos (só os pagos)
          receitasIngressos = ingressosData
            .filter(i => i.situacao_financeira === 'pago')
            .reduce((sum, i) => sum + (i.valor_final || 0), 0);
          
          // Somar custos dos ingressos (todos, pagos ou não, pois é custo operacional)
          custosIngressos = ingressosData
            .reduce((sum, i) => sum + (i.preco_custo || 0), 0);
          
          console.log('💳 Ingressos encontrados:', ingressosData.length);
          console.log('💰 Receitas ingressos (pagos):', receitasIngressos);
          console.log('💸 Custos ingressos:', custosIngressos);
        }
      } catch (error) {
        console.log('Sistema de ingressos não encontrado ou erro:', error);
        receitasIngressos = 0;
        custosIngressos = 0;
      }

      // ✨ NOVO: Calcular custos operacionais dos passeios (igual ao detalhes de viagem)
      let custosPasseios = 0;
      try {
        // Buscar vendas de passeios para calcular custos
        const { data: vendasData, error: vendasError } = await supabase
          .from('passageiro_passeios')
          .select(`
            passeio_nome,
            valor_cobrado,
            passeios!inner (
              id,
              nome,
              custo_operacional
            ),
            viagem_passageiros!inner (
              viagem_id
            )
          `)
          .in('viagem_passageiros.viagem_id', viagemIds);

        if (vendasError) throw vendasError;

        // Calcular custos totais dos passeios vendidos
        custosPasseios = (vendasData || []).reduce((sum: number, item: any) => {
          return sum + (item.passeios.custo_operacional || 0);
        }, 0);

        console.log('💰 Custos dos passeios calculados:', custosPasseios);
        console.log('📊 Vendas de passeios encontradas:', vendasData?.length || 0);
        console.log('🔍 Viagens IDs usadas:', viagemIds);
        console.log('📅 Período filtro:', { inicio: filtroData.inicio, fim: filtroData.fim });
      } catch (passeiosError) {
        console.warn('Erro ao buscar custos dos passeios:', passeiosError);
        custosPasseios = 0;
      }

      // TOTAL: Dados reais + dados extras + ingressos + custos dos passeios
      const totalReceitas = totalReceitasPassageiros + receitasExtras + receitasIngressos;
      const totalDespesas = despesasManuais + custosPasseios + custosIngressos; // ✨ NOVO: incluir custos dos ingressos
      const lucroLiquido = totalReceitas - totalDespesas;
      const margemLucro = totalReceitas > 0 ? (lucroLiquido / totalReceitas) * 100 : 0;

      console.log('📊 RESUMO FINANCEIRO GERAL:', {
        periodo: `${filtroData.inicio} até ${filtroData.fim}`,
        totalReceitasPassageiros,
        receitasExtras,
        receitasIngressos,
        totalReceitas,
        despesasManuais,
        custosPasseios,
        custosIngressos,
        totalDespesas,
        lucroLiquido,
        viagemIds: viagemIds.length
      });

      // Calcular percentuais por categoria (incluindo ingressos)
      const percentualViagem = totalReceitas > 0 ? (receitasViagem / totalReceitas) * 100 : 0;
      const percentualPasseios = totalReceitas > 0 ? (receitasPasseios / totalReceitas) * 100 : 0;
      const percentualExtras = totalReceitas > 0 ? (receitasExtras / totalReceitas) * 100 : 0;
      const percentualIngressos = totalReceitas > 0 ? (receitasIngressos / totalReceitas) * 100 : 0;

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
        receitas_ingressos: receitasIngressos, // ✨ NOVO
        percentual_viagem: percentualViagem,
        percentual_passeios: percentualPasseios,
        percentual_extras: percentualExtras,
        percentual_ingressos: percentualIngressos // ✨ NOVO
      });

    } catch (error) {
      console.error('Erro ao buscar resumo geral:', error);
      toast.error('Erro ao carregar resumo financeiro');
    } finally {
      setLoadingResumo(false);
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

      // Buscar despesas manuais por viagem (opcional, pode estar vazio)
      let despesasManuaisPorViagem: any = {};
      try {
        const { data: despesasViagem } = await supabase
          .from('viagem_despesas')
          .select('viagem_id, valor')
          .eq('status', 'pago');

        despesasManuaisPorViagem = (despesasViagem || []).reduce((acc: any, despesa: any) => {
          acc[despesa.viagem_id] = (acc[despesa.viagem_id] || 0) + despesa.valor;
          return acc;
        }, {});
      } catch (error) {
        console.log('Despesas manuais não encontradas, usando valor 0');
        despesasManuaisPorViagem = {};
      }

      // ✨ NOVO: Buscar custos dos passeios por viagem
      let custosPasseiosPorViagem: any = {};
      try {
        const { data: vendasData, error: vendasError } = await supabase
          .from('passageiro_passeios')
          .select(`
            passeio_nome,
            valor_cobrado,
            passeios!inner (
              id,
              nome,
              custo_operacional
            ),
            viagem_passageiros!inner (
              viagem_id
            )
          `)
          .in('viagem_passageiros.viagem_id', viagemIds);

        if (vendasError) throw vendasError;

        // Agrupar custos por viagem
        custosPasseiosPorViagem = (vendasData || []).reduce((acc: any, item: any) => {
          const viagemId = item.viagem_passageiros.viagem_id;
          const custo = item.passeios.custo_operacional || 0;
          acc[viagemId] = (acc[viagemId] || 0) + custo;
          return acc;
        }, {});

        console.log('💰 Custos dos passeios por viagem:', custosPasseiosPorViagem);
      } catch (passeiosError) {
        console.warn('Erro ao buscar custos dos passeios por viagem:', passeiosError);
        custosPasseiosPorViagem = {};
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
        const despesasManuaisViagem = despesasManuaisPorViagem[viagem.id] || 0;
        const custosPasseiosViagem = custosPasseiosPorViagem[viagem.id] || 0;
        
        // TOTAL: Receitas reais (passageiros) + extras (se houver)
        const receitasPassageiros = receitasViagemTotal + receitasPasseiosTotal;
        const totalReceitas = receitasPassageiros + receitasExtrasViagem;
        const totalDespesas = despesasManuaisViagem + custosPasseiosViagem; // ✨ CORRIGIDO: incluir custos dos passeios
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
          receitas_ingressos: 0,
          percentual_viagem: percentualViagem,
          percentual_passeios: percentualPasseios,
          percentual_extras: percentualExtras,
          percentual_ingressos: 0
        };
      });

      setViagensFinanceiro(viagensFinanceiroData);

    } catch (error) {
      console.error('Erro ao buscar viagens financeiro:', error);
      toast.error('Erro ao carregar dados das viagens');
    }
  };

  // ✨ NOVO: Buscar performance por ingressos
  const fetchIngressosFinanceiro = async () => {
    try {
      const { data: ingressosData, error: ingressosError } = await supabase
        .from('ingressos')
        .select(`
          id,
          adversario,
          jogo_data,
          setor_estadio,
          local_jogo,
          valor_final,
          preco_custo,
          situacao_financeira,
          cliente_id,
          clientes(nome)
        `)
        .gte('jogo_data', filtroData.inicio)
        .lte('jogo_data', filtroData.fim)
        .order('jogo_data', { ascending: false });

      if (ingressosError) throw ingressosError;

      if (!ingressosData || ingressosData.length === 0) {
        setIngressosFinanceiro([]);
        return;
      }

      // Processar dados dos ingressos
      const ingressosFinanceiroData: IngressoFinanceiro[] = ingressosData.map((ingresso: any) => {
        const receita = ingresso.valor_final || 0;
        const custo = ingresso.preco_custo || 0;
        const lucro = receita - custo;
        const margem = receita > 0 ? (lucro / receita) * 100 : 0;

        return {
          id: ingresso.id,
          adversario: ingresso.adversario,
          jogo_data: ingresso.jogo_data,
          setor_estadio: ingresso.setor_estadio,
          local_jogo: ingresso.local_jogo,
          receita,
          custo,
          lucro,
          margem,
          situacao_financeira: ingresso.situacao_financeira,
          cliente_nome: ingresso.clientes?.nome || 'Cliente não informado'
        };
      });

      console.log('🎫 Ingressos financeiro encontrados:', ingressosFinanceiroData.length);
      setIngressosFinanceiro(ingressosFinanceiroData);

    } catch (error) {
      console.error('Erro ao buscar ingressos financeiro:', error);
      // Não mostrar toast de erro se for só porque a tabela não existe
      if (!error.message?.includes('does not exist')) {
        toast.error('Erro ao carregar dados dos ingressos');
      }
      setIngressosFinanceiro([]);
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

      // Buscar despesas manuais das viagens (CORRIGIDO - filtrar por viagens do período)
      try {
        // Buscar viagens no período para filtrar despesas
        const { data: viagensNoPeriodo, error: viagensError } = await supabase
          .from('viagens')
          .select('id, adversario, data_jogo')
          .gte('data_jogo', filtroData.inicio)
          .lte('data_jogo', filtroData.fim);

        if (viagensError) throw viagensError;

        if (viagensNoPeriodo && viagensNoPeriodo.length > 0) {
          const viagemIds = viagensNoPeriodo.map(v => v.id);

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
            .in('viagem_id', viagemIds)
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
        }
      } catch (error) {
        console.log('Despesas manuais não encontradas no fluxo de caixa');
      }

      // ✨ NOVO: Buscar receitas de ingressos no período
      let receitasIngressos = 0;
      try {
        const { data: ingressosData, error: ingressosError } = await supabase
          .from('ingressos')
          .select('valor_final, situacao_financeira')
          .gte('jogo_data', filtroData.inicio)
          .lte('jogo_data', filtroData.fim)
          .eq('situacao_financeira', 'pago');

        if (ingressosError) throw ingressosError;

        receitasIngressos = (ingressosData || []).reduce((sum, i) => sum + i.valor_final, 0);
        console.log('🎫 Receitas de ingressos encontradas:', ingressosData?.length || 0);
        console.log('🎫 Total receitas ingressos:', receitasIngressos);
      } catch (error) {
        console.log('Tabela ingressos não encontrada ou erro:', error);
        receitasIngressos = 0;
      }

      // ✨ NOVO: Buscar custos dos ingressos como despesas
      let custosIngressos = 0;
      try {
        const { data: custosIngressosData, error: custosIngressosError } = await supabase
          .from('ingressos')
          .select('preco_custo, situacao_financeira')
          .gte('jogo_data', filtroData.inicio)
          .lte('jogo_data', filtroData.fim)
          .eq('situacao_financeira', 'pago');

        if (custosIngressosError) throw custosIngressosError;

        custosIngressos = (custosIngressosData || []).reduce((sum, i) => sum + i.preco_custo, 0);
        console.log('🎫 Custos de ingressos encontrados:', custosIngressosData?.length || 0);
        console.log('🎫 Total custos ingressos:', custosIngressos);
      } catch (error) {
        console.log('Custos de ingressos não encontrados ou erro:', error);
        custosIngressos = 0;
      }

      // ✨ NOVO: Buscar custos dos passeios como saídas virtuais
      try {
        // Buscar viagens no período novamente para este contexto
        const { data: viagensFluxo, error: viagensFluxoError } = await supabase
          .from('viagens')
          .select('id, adversario, data_jogo')
          .gte('data_jogo', filtroData.inicio)
          .lte('data_jogo', filtroData.fim);

        if (viagensFluxoError) throw viagensFluxoError;

        if (viagensFluxo && viagensFluxo.length > 0) {
          const viagemIds = viagensFluxo.map(v => v.id);

          // Buscar vendas de passeios para gerar custos
          const { data: vendasData, error: vendasError } = await supabase
            .from('passageiro_passeios')
            .select(`
              passeio_nome,
              valor_cobrado,
              passeios!inner (
                id,
                nome,
                custo_operacional
              ),
              viagem_passageiros!inner (
                viagem_id,
                viagens!inner (
                  id,
                  adversario,
                  data_jogo
                )
              )
            `)
            .in('viagem_passageiros.viagem_id', viagemIds);

          if (vendasError) throw vendasError;

          // Agrupar por passeio e viagem para gerar custos
          const custosAgrupados = (vendasData || []).reduce((acc: Record<string, any>, item: any) => {
            const viagemId = item.viagem_passageiros.viagem_id;
            const passeioId = item.passeios.id;
            const chave = `${viagemId}-${passeioId}`;
            const custoUnitario = item.passeios.custo_operacional || 0;

            if (!acc[chave]) {
              acc[chave] = {
                viagem_id: viagemId,
                viagem_adversario: item.viagem_passageiros.viagens.adversario,
                viagem_data: item.viagem_passageiros.viagens.data_jogo,
                passeio_nome: item.passeios.nome,
                quantidade_vendida: 0,
                custo_total: 0
              };
            }

            acc[chave].quantidade_vendida += 1;
            acc[chave].custo_total += custoUnitario;

            return acc;
          }, {});

          // Adicionar custos dos passeios ao fluxo de caixa
          Object.values(custosAgrupados)
            .filter((custo: any) => custo.custo_total > 0)
            .forEach((custo: any) => {
              fluxoItems.push({
                data: custo.viagem_data,
                descricao: `Custo: ${custo.passeio_nome} (${custo.quantidade_vendida}x)`,
                tipo: 'saida',
                categoria: 'passeios',
                valor: custo.custo_total,
                viagem_id: custo.viagem_id,
                viagem_nome: custo.viagem_adversario
              });
            });
        }
      } catch (passeiosError) {
        console.warn('Erro ao buscar custos dos passeios para fluxo de caixa:', passeiosError);
      }

      // ✨ NOVO: Buscar ingressos individuais para o fluxo de caixa
      try {
        const { data: ingressosFluxoData, error: ingressosFluxoError } = await supabase
          .from('ingressos')
          .select(`
            id,
            adversario,
            jogo_data,
            setor_estadio,
            valor_final,
            preco_custo,
            situacao_financeira,
            clientes(nome),
            created_at
          `)
          .gte('jogo_data', filtroData.inicio)
          .lte('jogo_data', filtroData.fim)
          .order('jogo_data', { ascending: false });

        if (ingressosFluxoError) throw ingressosFluxoError;

        if (ingressosFluxoData && ingressosFluxoData.length > 0) {
          ingressosFluxoData.forEach((ingresso: any) => {
            // Adicionar receita do ingresso (só se foi pago)
            if (ingresso.situacao_financeira === 'pago') {
              fluxoItems.push({
                data: ingresso.jogo_data,
                descricao: `Ingresso: ${ingresso.clientes?.nome || 'Cliente'} - ${ingresso.adversario} (${ingresso.setor_estadio})`,
                tipo: 'entrada',
                categoria: 'ingressos',
                valor: ingresso.valor_final || 0,
                viagem_id: null,
                viagem_nome: `Flamengo x ${ingresso.adversario}`
              });
            }

            // Adicionar custo do ingresso (sempre, pois é custo operacional)
            if (ingresso.preco_custo > 0) {
              fluxoItems.push({
                data: ingresso.jogo_data,
                descricao: `Custo Ingresso: ${ingresso.adversario} (${ingresso.setor_estadio})`,
                tipo: 'saida',
                categoria: 'ingressos',
                valor: ingresso.preco_custo,
                viagem_id: null,
                viagem_nome: `Flamengo x ${ingresso.adversario}`
              });
            }
          });

          console.log('🎫 Ingressos adicionados ao fluxo de caixa:', ingressosFluxoData.length);
        }
      } catch (ingressosFluxoError) {
        console.warn('Erro ao buscar ingressos para fluxo de caixa:', ingressosFluxoError);
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
            parcelas_detalhes: pagamentosDetalhes
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

  // Buscar contas a pagar (CORRIGIDO - incluindo custos dos passeios)
  const fetchContasPagar = async () => {
    setLoadingContas(true);
    try {
      let contasPagarData: ContaPagar[] = [];
      
      // 1. Buscar despesas manuais das viagens (CORRIGIDO - filtrar por viagens do período)
      try {
        // Primeiro buscar viagens no período
        const { data: viagensNoPeriodo, error: viagensError } = await supabase
          .from('viagens')
          .select('id, adversario, data_jogo')
          .gte('data_jogo', filtroData.inicio)
          .lte('data_jogo', filtroData.fim);

        if (viagensError) throw viagensError;

        if (viagensNoPeriodo && viagensNoPeriodo.length > 0) {
          const viagemIds = viagensNoPeriodo.map(v => v.id);

          // Buscar despesas das viagens no período
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
            .in('viagem_id', viagemIds)
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
        }
      } catch (error) {
        console.log('Tabela viagem_despesas vazia ou erro:', error);
        contasPagarData = [];
      }

      // 2. ✨ NOVO: Buscar custos operacionais dos passeios (reutilizar viagens já buscadas)
      try {
        // Buscar viagens no período para este contexto
        const { data: viagensContas, error: viagensContasError } = await supabase
          .from('viagens')
          .select('id, adversario, data_jogo')
          .gte('data_jogo', filtroData.inicio)
          .lte('data_jogo', filtroData.fim);

        if (viagensContasError) throw viagensContasError;

        if (viagensContas && viagensContas.length > 0) {
          const viagemIds = viagensContas.map(v => v.id);

          // Buscar vendas de passeios para calcular custos
          const { data: vendasData, error: vendasError } = await supabase
            .from('passageiro_passeios')
            .select(`
              passeio_nome,
              valor_cobrado,
              passeios!inner (
                id,
                nome,
                custo_operacional
              ),
              viagem_passageiros!inner (
                viagem_id,
                viagens!inner (
                  id,
                  adversario,
                  data_jogo
                )
              )
            `)
            .in('viagem_passageiros.viagem_id', viagemIds);

          if (vendasError) throw vendasError;

          // Agrupar por passeio e viagem
          const custosAgrupados = (vendasData || []).reduce((acc: Record<string, any>, item: any) => {
            const viagemId = item.viagem_passageiros.viagem_id;
            const passeioId = item.passeios.id;
            const chave = `${viagemId}-${passeioId}`;
            const custoUnitario = item.passeios.custo_operacional || 0;

            if (!acc[chave]) {
              acc[chave] = {
                viagem_id: viagemId,
                viagem_adversario: item.viagem_passageiros.viagens.adversario,
                viagem_data: item.viagem_passageiros.viagens.data_jogo,
                passeio_id: passeioId,
                passeio_nome: item.passeios.nome,
                quantidade_vendida: 0,
                custo_total: 0
              };
            }

            acc[chave].quantidade_vendida += 1;
            acc[chave].custo_total += custoUnitario;

            return acc;
          }, {});

          // Gerar despesas virtuais dos passeios
          const despesasVirtuaisPasseios = Object.values(custosAgrupados)
            .filter((custo: any) => custo.custo_total > 0)
            .map((custo: any) => ({
              id: `virtual-passeio-${custo.viagem_id}-${custo.passeio_id}`,
              fornecedor: `Custo: ${custo.passeio_nome}`,
              descricao: `${custo.quantidade_vendida} vendidos`,
              categoria: 'passeios',
              valor: custo.custo_total,
              data_vencimento: custo.viagem_data,
              status: 'calculado',
              viagem_nome: `Flamengo x ${custo.viagem_adversario}`
            }));

          // Adicionar despesas virtuais às despesas manuais
          contasPagarData = [
            ...contasPagarData,
            ...despesasVirtuaisPasseios
          ].sort((a, b) => new Date(b.data_vencimento).getTime() - new Date(a.data_vencimento).getTime());
        }
      } catch (passeiosError) {
        console.warn('Erro ao buscar custos dos passeios:', passeiosError);
        // Se falhar, continuar apenas com despesas manuais
      }

      // ✨ NOVO: 3. Buscar custos dos ingressos como despesas virtuais
      try {
        const { data: ingressosData, error: ingressosError } = await supabase
          .from('ingressos')
          .select('id, adversario, jogo_data, preco_custo, situacao_financeira')
          .gte('jogo_data', filtroData.inicio)
          .lte('jogo_data', filtroData.fim)
          .eq('situacao_financeira', 'pago')
          .gt('preco_custo', 0);

        if (ingressosError) throw ingressosError;

        // Gerar despesas virtuais dos ingressos
        const despesasVirtuaisIngressos = (ingressosData || []).map((ingresso: any) => ({
          id: `virtual-ingresso-${ingresso.id}`,
          fornecedor: `Custo: Ingresso ${ingresso.adversario}`,
          descricao: `Ingresso vendido`,
          categoria: 'ingressos',
          valor: ingresso.preco_custo,
          data_vencimento: ingresso.jogo_data,
          status: 'calculado',
          viagem_nome: `Flamengo x ${ingresso.adversario}`
        }));

        console.log('🎫 Custos de ingressos encontrados:', despesasVirtuaisIngressos.length);

        // Adicionar despesas virtuais dos ingressos
        contasPagarData = [
          ...contasPagarData,
          ...despesasVirtuaisIngressos
        ].sort((a, b) => new Date(b.data_vencimento).getTime() - new Date(a.data_vencimento).getTime());

      } catch (ingressosError) {
        console.warn('Erro ao buscar custos dos ingressos:', ingressosError);
        // Se falhar, continuar sem custos de ingressos
      }

      setContasPagar(contasPagarData);

    } catch (error) {
      console.error('Erro ao buscar contas a pagar:', error);
      // Não mostrar toast de erro se for só porque a tabela está vazia
      if (!error.message?.includes('does not exist')) {
        toast.error('Erro ao carregar contas a pagar');
      }
    } finally {
      setLoadingContas(false);
    }
  };

  // Atualizar todos os dados (OTIMIZADO - carregamento em etapas)
  const atualizarDados = async () => {
    setIsLoading(true);
    try {
      // ✨ ETAPA 1: Carregar dados críticos primeiro (para cards principais)
      await Promise.all([
        fetchContasPagar(), // Necessário para cálculo rápido das despesas
        fetchResumoGeral()   // Dados principais do dashboard
      ]);
      
      // ✨ ETAPA 2: Carregar dados secundários em paralelo (não bloqueia UI)
      Promise.all([
        fetchViagensFinanceiro(),
        fetchIngressosFinanceiro(), // ✨ NOVO
        fetchFluxoCaixa(),
        fetchContasReceber()
      ]).catch(error => {
        console.warn('Erro ao carregar dados secundários:', error);
      });
      
    } catch (error) {
      console.error('Erro ao carregar dados críticos:', error);
      toast.error('Erro ao carregar dados financeiros');
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
    ingressosFinanceiro, // ✨ NOVO
    isLoading,
    loadingResumo,
    loadingContas,
    atualizarDados
  };
}