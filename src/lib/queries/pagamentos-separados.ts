// Queries otimizadas para sistema de pagamentos separados
// Task 19.1: Queries para incluir breakdown viagem vs passeios

import { supabase } from '@/lib/supabase';
import type { 
  ViagemPassageiroComPagamentos,
  HistoricoPagamentoCategorizado,
  BreakdownPagamento,
  calcularBreakdownPagamento
} from '@/types/pagamentos-separados';

// Query para buscar passageiro com breakdown completo
export const buscarPassageiroComBreakdown = async (
  viagemPassageiroId: string
): Promise<ViagemPassageiroComPagamentos | null> => {
  try {
    // 1. Buscar dados básicos do passageiro
    const { data: passageiro, error: passageiroError } = await supabase
      .from('viagem_passageiros')
      .select(`
        id,
        cliente_id,
        viagem_id,
        valor,
        desconto,
        status_pagamento,
        viagem_paga,
        passeios_pagos,
        forma_pagamento,
        observacoes,
        created_at,
        clientes!inner (
          id,
          nome,
          telefone
        )
      `)
      .eq('id', viagemPassageiroId)
      .single();

    if (passageiroError) throw passageiroError;

    // 2. Buscar passeios com valores
    const { data: passeios, error: passeiosError } = await supabase
      .from('passageiro_passeios')
      .select(`
        valor_cobrado,
        passeios!inner (
          nome,
          valor,
          categoria
        )
      `)
      .eq('viagem_passageiro_id', viagemPassageiroId);

    if (passeiosError) throw passeiosError;

    // 3. Buscar histórico de pagamentos
    const { data: historico, error: historicoError } = await supabase
      .from('historico_pagamentos_categorizado')
      .select('*')
      .eq('viagem_passageiro_id', viagemPassageiroId)
      .order('data_pagamento', { ascending: false });

    if (historicoError) throw historicoError;

    // 4. Calcular valor total dos passeios
    const valorTotalPasseios = (passeios || [])
      .reduce((total, pp) => total + (pp.valor_cobrado || 0), 0);

    // 5. Montar objeto completo
    const passageiroCompleto: ViagemPassageiroComPagamentos = {
      ...passageiro,
      historico_pagamentos: historico || [],
      valor_total_passeios: valorTotalPasseios,
      valor_liquido_viagem: (passageiro.valor || 0) - (passageiro.desconto || 0)
    };

    return passageiroCompleto;

  } catch (error) {
    console.error('Erro ao buscar passageiro com breakdown:', error);
    throw error;
  }
};

// Query para buscar múltiplos passageiros com breakdown (para listas)
export const buscarPassageirosComBreakdown = async (
  viagemId: string
): Promise<ViagemPassageiroComPagamentos[]> => {
  try {
    // 1. Buscar todos os passageiros da viagem
    const { data: passageiros, error: passageirosError } = await supabase
      .from('viagem_passageiros')
      .select(`
        id,
        cliente_id,
        viagem_id,
        valor,
        desconto,
        status_pagamento,
        viagem_paga,
        passeios_pagos,
        forma_pagamento,
        created_at,
        clientes!inner (
          id,
          nome,
          telefone
        )
      `)
      .eq('viagem_id', viagemId);

    if (passageirosError) throw passageirosError;

    if (!passageiros || passageiros.length === 0) {
      return [];
    }

    const passageiroIds = passageiros.map(p => p.id);

    // 2. Buscar passeios de todos os passageiros
    const { data: todosPasseios, error: passeiosError } = await supabase
      .from('passageiro_passeios')
      .select(`
        viagem_passageiro_id,
        valor_cobrado,
        passeios!inner (
          nome,
          valor,
          categoria
        )
      `)
      .in('viagem_passageiro_id', passageiroIds);

    if (passeiosError) throw passeiosError;

    // 3. Buscar histórico de pagamentos de todos
    const { data: todoHistorico, error: historicoError } = await supabase
      .from('historico_pagamentos_categorizado')
      .select('*')
      .in('viagem_passageiro_id', passageiroIds)
      .order('data_pagamento', { ascending: false });

    if (historicoError) throw historicoError;

    // 4. Agrupar dados por passageiro
    const passageirosCompletos: ViagemPassageiroComPagamentos[] = passageiros.map(passageiro => {
      // Passeios deste passageiro
      const passeiosPassageiro = (todosPasseios || [])
        .filter(pp => pp.viagem_passageiro_id === passageiro.id);
      
      const valorTotalPasseios = passeiosPassageiro
        .reduce((total, pp) => total + (pp.valor_cobrado || 0), 0);

      // Histórico deste passageiro
      const historicoPassageiro = (todoHistorico || [])
        .filter(h => h.viagem_passageiro_id === passageiro.id);

      return {
        ...passageiro,
        historico_pagamentos: historicoPassageiro,
        valor_total_passeios: valorTotalPasseios,
        valor_liquido_viagem: (passageiro.valor || 0) - (passageiro.desconto || 0)
      };
    });

    return passageirosCompletos;

  } catch (error) {
    console.error('Erro ao buscar passageiros com breakdown:', error);
    throw error;
  }
};

// Query para estatísticas financeiras da viagem
export const buscarEstatisticasFinanceirasViagem = async (viagemId: string) => {
  try {
    const passageiros = await buscarPassageirosComBreakdown(viagemId);
    
    let totalViagem = 0;
    let totalPasseios = 0;
    let totalGeral = 0;
    let pagoViagem = 0;
    let pagoPasseios = 0;
    let pagoGeral = 0;
    let pendenteViagem = 0;
    let pendentePasseios = 0;
    let pendenteGeral = 0;

    const statusCount = {
      'Pago Completo': 0,
      'Viagem Paga': 0,
      'Passeios Pagos': 0,
      'Pendente': 0,
      'Brinde': 0,
      'Cancelado': 0
    };

    passageiros.forEach(passageiro => {
      const breakdown = calcularBreakdownPagamento(passageiro);
      
      totalViagem += breakdown.valor_viagem;
      totalPasseios += breakdown.valor_passeios;
      totalGeral += breakdown.valor_total;
      pagoViagem += breakdown.pago_viagem;
      pagoPasseios += breakdown.pago_passeios;
      pagoGeral += breakdown.pago_total;
      pendenteViagem += breakdown.pendente_viagem;
      pendentePasseios += breakdown.pendente_passeios;
      pendenteGeral += breakdown.pendente_total;

      // Contar status
      const status = passageiro.status_pagamento as keyof typeof statusCount;
      if (statusCount.hasOwnProperty(status)) {
        statusCount[status]++;
      }
    });

    return {
      total_passageiros: passageiros.length,
      valores: {
        total_viagem: totalViagem,
        total_passeios: totalPasseios,
        total_geral: totalGeral,
        pago_viagem: pagoViagem,
        pago_passeios: pagoPasseios,
        pago_geral: pagoGeral,
        pendente_viagem: pendenteViagem,
        pendente_passeios: pendentePasseios,
        pendente_geral: pendenteGeral,
        percentual_pago: totalGeral > 0 ? (pagoGeral / totalGeral) * 100 : 0
      },
      status_count: statusCount,
      passageiros_detalhados: passageiros
    };

  } catch (error) {
    console.error('Erro ao buscar estatísticas financeiras:', error);
    throw error;
  }
};

// Query para relatório de pagamentos por período
export const buscarRelatoriosPagamentosPeriodo = async (
  dataInicio: string,
  dataFim: string,
  categoria?: 'viagem' | 'passeios' | 'ambos'
) => {
  try {
    let query = supabase
      .from('historico_pagamentos_categorizado')
      .select(`
        *,
        viagem_passageiros!inner (
          id,
          valor,
          desconto,
          clientes!inner (
            nome
          ),
          viagens!inner (
            adversario,
            data_jogo
          )
        )
      `)
      .gte('data_pagamento', dataInicio)
      .lte('data_pagamento', dataFim)
      .order('data_pagamento', { ascending: false });

    if (categoria) {
      query = query.eq('categoria', categoria);
    }

    const { data: pagamentos, error } = await query;

    if (error) throw error;

    // Agrupar por categoria
    const resumoPorCategoria = {
      viagem: { total: 0, quantidade: 0 },
      passeios: { total: 0, quantidade: 0 },
      ambos: { total: 0, quantidade: 0 }
    };

    (pagamentos || []).forEach(pagamento => {
      const cat = pagamento.categoria as keyof typeof resumoPorCategoria;
      resumoPorCategoria[cat].total += pagamento.valor_pago;
      resumoPorCategoria[cat].quantidade += 1;
    });

    return {
      pagamentos: pagamentos || [],
      resumo_por_categoria: resumoPorCategoria,
      total_geral: Object.values(resumoPorCategoria).reduce((sum, cat) => sum + cat.total, 0),
      quantidade_total: Object.values(resumoPorCategoria).reduce((sum, cat) => sum + cat.quantidade, 0)
    };

  } catch (error) {
    console.error('Erro ao buscar relatório de pagamentos:', error);
    throw error;
  }
};