import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useViagemCompatibility } from '@/hooks/useViagemCompatibility';

export interface ViagemReceita {
  id: string;
  viagem_id: string;
  descricao: string;
  categoria: 'passageiro' | 'patrocinio' | 'vendas' | 'extras';
  valor: number;
  forma_pagamento: string;
  status: 'recebido' | 'pendente' | 'cancelado';
  data_recebimento: string;
  observacoes?: string;
  created_at: string;
}

export interface ViagemDespesa {
  id: string;
  viagem_id: string;
  fornecedor: string;
  categoria: 'transporte' | 'hospedagem' | 'alimentacao' | 'ingressos' | 'pessoal' | 'administrativo';
  subcategoria?: string;
  valor: number;
  forma_pagamento: string;
  status: 'pago' | 'pendente' | 'cancelado';
  data_despesa: string;
  comprovante_url?: string;
  observacoes?: string;
  created_at: string;
}

export interface CobrancaHistorico {
  id: string;
  viagem_passageiro_id: string;
  tipo_contato: 'whatsapp' | 'email' | 'telefone' | 'presencial';
  template_usado?: string;
  mensagem_enviada?: string;
  status_envio: 'enviado' | 'lido' | 'respondido' | 'erro';
  data_tentativa: string;
  proximo_followup?: string;
  observacoes?: string;
  passageiro_nome?: string;
  passageiro_telefone?: string;
}

export interface PassageiroPendente {
  viagem_passageiro_id: string;
  cliente_id: string;
  nome: string;
  telefone: string;
  valor_total: number;
  valor_pago: number;
  valor_pendente: number;
  dias_atraso: number;
  ultimo_contato?: string;
  status_pagamento: string;
  parcelas_pendentes: number;
  total_parcelas: number;
  proxima_parcela?: {
    valor: number;
    data_vencimento: string;
    dias_para_vencer: number;
  };
  // Novos campos para pagamentos separados
  valor_viagem: number;
  valor_passeios: number;
  viagem_paga: boolean;
  passeios_pagos: boolean;
  pago_viagem: number;
  pago_passeios: number;
  pendente_viagem: number;
  pendente_passeios: number;
}

export interface ResumoFinanceiro {
  total_receitas: number;
  total_despesas: number;
  lucro_bruto: number;
  margem_lucro: number;
  total_pendencias: number;
  count_pendencias: number;
  taxa_inadimplencia: number;
  // Breakdown por categoria
  receitas_viagem: number;
  receitas_passeios: number;
  pendencias_viagem: number;
  pendencias_passeios: number;
  passageiros_viagem_paga: number;
  passageiros_passeios_pagos: number;
  passageiros_pago_completo: number;
}

export function useViagemFinanceiro(viagemId: string | undefined) {
  const [viagem, setViagem] = useState<any>(null);
  const [receitas, setReceitas] = useState<ViagemReceita[]>([]);
  const [despesas, setDespesas] = useState<ViagemDespesa[]>([]);
  const [passageirosPendentes, setPassageirosPendentes] = useState<PassageiroPendente[]>([]);
  const [todosPassageiros, setTodosPassageiros] = useState<any[]>([]);
  const [historicoCobranca, setHistoricoCobranca] = useState<CobrancaHistorico[]>([]);
  const [resumoFinanceiro, setResumoFinanceiro] = useState<ResumoFinanceiro>({
    total_receitas: 0,
    total_despesas: 0,
    lucro_bruto: 0,
    margem_lucro: 0,
    total_pendencias: 0,
    count_pendencias: 0,
    taxa_inadimplencia: 0,
    receitas_viagem: 0,
    receitas_passeios: 0,
    pendencias_viagem: 0,
    pendencias_passeios: 0,
    passageiros_viagem_paga: 0,
    passageiros_passeios_pagos: 0,
    passageiros_pago_completo: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Hook para compatibilidade com sistema de passeios
  const { 
    sistema, 
    valorPasseios, 
    temPasseios, 
    shouldUseNewSystem 
  } = useViagemCompatibility(viagem);

  // Buscar dados da viagem (necessário para compatibilidade de passeios)
  const fetchViagem = async () => {
    if (!viagemId) return;

    try {
      const { data, error } = await supabase
        .from('viagens')
        .select(`
          *,
          viagem_passeios (
            passeio_id,
            passeios (
              nome,
              valor,
              categoria
            )
          )
        `)
        .eq('id', viagemId)
        .single();

      if (error) throw error;
      setViagem(data);
    } catch (error) {
      console.error('Erro ao buscar dados da viagem:', error);
    }
  };

  // Buscar receitas da viagem
  const fetchReceitas = async () => {
    if (!viagemId) return;

    try {
      const { data, error } = await supabase
        .from('viagem_receitas')
        .select('*')
        .eq('viagem_id', viagemId)
        .order('data_recebimento', { ascending: false });

      if (error) throw error;
      setReceitas(data || []);
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      toast.error('Erro ao carregar receitas da viagem');
    }
  };

  // Buscar despesas da viagem
  const fetchDespesas = async () => {
    if (!viagemId) return;

    try {
      const { data, error } = await supabase
        .from('viagem_despesas')
        .select('*')
        .eq('viagem_id', viagemId)
        .order('data_despesa', { ascending: false });

      if (error) throw error;
      setDespesas(data || []);
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      toast.error('Erro ao carregar despesas da viagem');
    }
  };

  // Buscar todos os passageiros (para relatórios)
  const fetchTodosPassageiros = async () => {
    if (!viagemId) return;

    try {
      const { data, error } = await supabase
        .from('viagem_passageiros')
        .select(`
          id,
          cliente_id,
          valor,
          desconto,
          status_pagamento,
          viagem_paga,
          passeios_pagos,
          created_at,
          clientes!viagem_passageiros_cliente_id_fkey (
            nome,
            telefone
          ),
          passageiro_passeios (
            passeio_nome,
            status,
            valor_cobrado
          ),
          historico_pagamentos_categorizado (
            categoria,
            valor_pago,
            data_pagamento
          )
        `)
        .eq('viagem_id', viagemId);

      if (error) throw error;

      const todosFormatados = (data || []).map((item: any) => ({
        id: item.clientes.id,
        viagem_passageiro_id: item.id,
        nome: item.clientes.nome,
        telefone: item.clientes.telefone,
        setor_maracana: item.setor_maracana || '-',
        valor: item.valor || 0,
        valor_total: item.valor || 0,
        desconto: item.desconto || 0,
        status_pagamento: item.status_pagamento,
        passeios: item.passageiro_passeios || [],
        // Calcular valores de viagem e passeios
        valor_viagem: (item.valor || 0) - (item.desconto || 0),
        valor_passeios: (item.passageiro_passeios || [])
          .reduce((sum: number, pp: any) => sum + (pp.valor_cobrado || 0), 0)
      }));

      setTodosPassageiros(todosFormatados);
    } catch (error) {
      console.error('Erro ao buscar todos os passageiros:', error);
    }
  };

  // Buscar passageiros com pendências (com suporte a pagamentos separados)
  const fetchPassageirosPendentes = async () => {
    if (!viagemId) return;

    try {
      const { data, error } = await supabase
        .from('viagem_passageiros')
        .select(`
          id,
          cliente_id,
          valor,
          desconto,
          status_pagamento,
          viagem_paga,
          passeios_pagos,
          created_at,
          clientes!viagem_passageiros_cliente_id_fkey (
            nome,
            telefone
          ),
          passageiro_passeios (
            valor_cobrado,
            passeios!inner (
              nome,
              valor
            )
          ),
          historico_pagamentos_categorizado (
            categoria,
            valor_pago,
            data_pagamento
          ),
          viagem_passageiros_parcelas (
            id,
            valor_parcela,
            data_vencimento,
            data_pagamento,
            total_parcelas
          )
        `)
        .eq('viagem_id', viagemId);

      if (error) throw error;

      const pendentes: PassageiroPendente[] = [];

      data?.forEach((passageiro: any) => {
        const valorViagem = (passageiro.valor || 0) - (passageiro.desconto || 0);
        const valorPasseios = (passageiro.passageiro_passeios || [])
          .reduce((sum: number, pp: any) => sum + (pp.valor_cobrado || 0), 0);
        const valorTotal = valorViagem + valorPasseios;

        // Calcular pagamentos por categoria (novo sistema)
        const historicoPagamentos = passageiro.historico_pagamentos_categorizado || [];
        const pagoViagem = historicoPagamentos
          .filter((h: any) => h.categoria === 'viagem' || h.categoria === 'ambos')
          .reduce((sum: number, h: any) => sum + h.valor_pago, 0);
        const pagoPasseios = historicoPagamentos
          .filter((h: any) => h.categoria === 'passeios' || h.categoria === 'ambos')
          .reduce((sum: number, h: any) => sum + h.valor_pago, 0);

        // SISTEMA UNIFICADO - Apenas sistema novo
        const valorPago = pagoViagem + pagoPasseios;
        const pendenteViagem = Math.max(0, valorViagem - pagoViagem);
        const pendentePasseios = Math.max(0, valorPasseios - pagoPasseios);
        const valorPendente = pendenteViagem + pendentePasseios;

        if (valorPendente > 0.01) { // Margem para centavos
          const diasAtraso = Math.floor(
            (new Date().getTime() - new Date(passageiro.created_at).getTime()) / (1000 * 60 * 60 * 24)
          );

          // Calcular informações das parcelas (compatibilidade)
          const parcelas = passageiro.viagem_passageiros_parcelas || [];
          const parcelasPendentes = parcelas.filter((p: any) => !p.data_pagamento);
          const totalParcelas = parcelas.length > 0 ? parcelas[0].total_parcelas || parcelas.length : 0;

          // Encontrar próxima parcela a vencer
          let proximaParcela = undefined;
          if (parcelasPendentes.length > 0) {
            const parcelasOrdenadas = parcelasPendentes
              .sort((a: any, b: any) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime());

            const proxima = parcelasOrdenadas[0];
            const hoje = new Date();
            const dataVencimento = new Date(proxima.data_vencimento);
            const diasParaVencer = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

            proximaParcela = {
              valor: proxima.valor_parcela,
              data_vencimento: proxima.data_vencimento,
              dias_para_vencer: diasParaVencer
            };
          }

          pendentes.push({
            viagem_passageiro_id: passageiro.id,
            cliente_id: passageiro.cliente_id,
            nome: passageiro.clientes.nome,
            telefone: passageiro.clientes.telefone,
            valor_total: valorTotal,
            valor_pago: valorPago,
            valor_pendente: valorPendente,
            dias_atraso: diasAtraso,
            status_pagamento: passageiro.status_pagamento,
            parcelas_pendentes: parcelasPendentes.length,
            total_parcelas: totalParcelas,
            proxima_parcela: proximaParcela,
            // Novos campos para pagamentos separados
            valor_viagem: valorViagem,
            valor_passeios: valorPasseios,
            viagem_paga: passageiro.viagem_paga || false,
            passeios_pagos: passageiro.passeios_pagos || false,
            pago_viagem: pagoViagem,
            pago_passeios: pagoPasseios,
            pendente_viagem: pendenteViagem,
            pendente_passeios: pendentePasseios
          });
        }
      });

      // Ordenar por dias de atraso (mais urgente primeiro)
      pendentes.sort((a, b) => b.dias_atraso - a.dias_atraso);
      setPassageirosPendentes(pendentes);
    } catch (error) {
      console.error('Erro ao buscar pendências:', error);
      toast.error('Erro ao carregar pendências');
    }
  };

  // Buscar histórico de cobrança
  const fetchHistoricoCobranca = async () => {
    if (!viagemId) return;

    try {
      const { data, error } = await supabase
        .from('viagem_cobranca_historico')
        .select(`
          *,
          viagem_passageiros!viagem_cobranca_historico_viagem_passageiro_id_fkey (
            clientes!viagem_passageiros_cliente_id_fkey (
              nome,
              telefone
            )
          )
        `)
        .order('data_tentativa', { ascending: false })
        .limit(50);

      if (error) throw error;

      const historico: CobrancaHistorico[] = (data || []).map((item: any) => ({
        ...item,
        passageiro_nome: item.viagem_passageiros?.clientes?.nome,
        passageiro_telefone: item.viagem_passageiros?.clientes?.telefone
      }));

      setHistoricoCobranca(historico);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      toast.error('Erro ao carregar histórico de cobrança');
    }
  };

  // Calcular resumo financeiro (com suporte a pagamentos separados)
  const calcularResumoFinanceiro = async () => {
    if (!viagemId) return;

    try {
      // Buscar receitas de passageiros com dados de pagamentos separados
      const { data: passageiros, error: passageirosError } = await supabase
        .from('viagem_passageiros')
        .select(`
          valor,
          desconto,
          viagem_paga,
          passeios_pagos,
          status_pagamento,

          passageiro_passeios (
            valor_cobrado
          ),
          historico_pagamentos_categorizado (
            categoria,
            valor_pago
          )
        `)
        .eq('viagem_id', viagemId);

      if (passageirosError) throw passageirosError;

      let receitasViagem = 0;
      let receitasPasseios = 0;
      let pendenciasViagem = 0;
      let pendenciasPasseios = 0;
      let countPendencias = 0;
      let passageirosViagemPaga = 0;
      let passageirosPasseiosPagos = 0;
      let passageirosPagoCompleto = 0;

      console.log('🔍 DEBUG - Calculando resumo financeiro para viagem:', viagemId);
      console.log('📊 Passageiros encontrados:', passageiros?.length || 0);

      passageiros?.forEach((p: any, index: number) => {
        const valorViagem = (p.valor || 0) - (p.desconto || 0);
        const valorPasseios = (p.passageiro_passeios || [])
          .reduce((sum: number, pp: any) => sum + (pp.valor_cobrado || 0), 0);
        const valorTotal = valorViagem + valorPasseios;

        // Calcular pagamentos por categoria (novo sistema)
        const historicoPagamentos = p.historico_pagamentos_categorizado || [];
        const pagoViagem = historicoPagamentos
          .filter((h: any) => h.categoria === 'viagem' || h.categoria === 'ambos')
          .reduce((sum: number, h: any) => sum + h.valor_pago, 0);
        const pagoPasseios = historicoPagamentos
          .filter((h: any) => h.categoria === 'passeios' || h.categoria === 'ambos')
          .reduce((sum: number, h: any) => sum + h.valor_pago, 0);

        // Fallback para sistema antigo se não houver dados novos
        const valorPagoTotal = pagoViagem + pagoPasseios;

        // Acumular receitas
        receitasViagem += valorViagem;
        receitasPasseios += valorPasseios;

        // Calcular pendências
        const pendenteViagem = Math.max(0, valorViagem - pagoViagem);
        const pendentePasseios = Math.max(0, valorPasseios - pagoPasseios);
        const pendenciaTotal = pendenteViagem + pendentePasseios;

        if (pendenciaTotal > 0.01) {
          pendenciasViagem += pendenteViagem;
          pendenciasPasseios += pendentePasseios;
          countPendencias++;
        }

        // Contar status
        if (p.viagem_paga) passageirosViagemPaga++;
        if (p.passeios_pagos || valorPasseios === 0) passageirosPasseiosPagos++;
        if ((p.viagem_paga && p.passeios_pagos) || (p.viagem_paga && valorPasseios === 0)) {
          passageirosPagoCompleto++;
        }

        console.log(`👤 Passageiro ${index + 1}:`, {
          valor_viagem: valorViagem,
          valor_passeios: valorPasseios,
          pago_viagem: pagoViagem,
          pago_passeios: pagoPasseios,
          pendente_viagem: pendenteViagem,
          pendente_passeios: pendentePasseios
        });
      });

      // Somar outras receitas
      const totalOutrasReceitas = receitas.reduce((sum, r) => sum + r.valor, 0);
      const totalReceitas = receitasViagem + receitasPasseios + totalOutrasReceitas;
      const totalPendencias = pendenciasViagem + pendenciasPasseios;

      // Somar despesas
      const totalDespesas = despesas.reduce((sum, d) => sum + d.valor, 0);

      // Calcular métricas
      const lucroBruto = totalReceitas - totalDespesas;
      const margemLucro = totalReceitas > 0 ? (lucroBruto / totalReceitas) * 100 : 0;
      const taxaInadimplencia = passageiros?.length > 0 ? (countPendencias / passageiros.length) * 100 : 0;

      setResumoFinanceiro({
        total_receitas: totalReceitas,
        total_despesas: totalDespesas,
        lucro_bruto: lucroBruto,
        margem_lucro: margemLucro,
        total_pendencias: totalPendencias,
        count_pendencias: countPendencias,
        taxa_inadimplencia: taxaInadimplencia,
        receitas_viagem: receitasViagem,
        receitas_passeios: receitasPasseios,
        pendencias_viagem: pendenciasViagem,
        pendencias_passeios: pendenciasPasseios,
        passageiros_viagem_paga: passageirosViagemPaga,
        passageiros_passeios_pagos: passageirosPasseiosPagos,
        passageiros_pago_completo: passageirosPagoCompleto
      });
    } catch (error) {
      console.error('Erro ao calcular resumo:', error);
    }
  };

  // Registrar tentativa de cobrança
  const registrarCobranca = async (
    viagemPassageiroId: string,
    tipoContato: 'whatsapp' | 'email' | 'telefone' | 'presencial',
    templateUsado?: string,
    mensagem?: string,
    observacoes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('viagem_cobranca_historico')
        .insert({
          viagem_passageiro_id: viagemPassageiroId,
          tipo_contato: tipoContato,
          template_usado: templateUsado,
          mensagem_enviada: mensagem,
          status_envio: 'enviado',
          observacoes: observacoes
        });

      if (error) throw error;

      toast.success('Cobrança registrada com sucesso!');
      await fetchHistoricoCobranca();
    } catch (error) {
      console.error('Erro ao registrar cobrança:', error);
      toast.error('Erro ao registrar cobrança');
    }
  };

  // Adicionar receita
  const adicionarReceita = async (receita: Omit<ViagemReceita, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('viagem_receitas')
        .insert(receita);

      if (error) throw error;

      toast.success('Receita adicionada com sucesso!');
      await fetchAllData(); // Recarregar todos os dados
    } catch (error) {
      console.error('Erro ao adicionar receita:', error);
      toast.error('Erro ao adicionar receita');
    }
  };

  // Editar receita
  const editarReceita = async (id: string, receita: Partial<Omit<ViagemReceita, 'id' | 'created_at'>>) => {
    try {
      const { error } = await supabase
        .from('viagem_receitas')
        .update(receita)
        .eq('id', id);

      if (error) throw error;

      toast.success('Receita atualizada com sucesso!');
      await fetchAllData();
    } catch (error) {
      console.error('Erro ao editar receita:', error);
      toast.error('Erro ao editar receita');
    }
  };

  // Excluir receita
  const excluirReceita = async (id: string) => {
    try {
      const { error } = await supabase
        .from('viagem_receitas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Receita excluída com sucesso!');
      await fetchAllData();
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      toast.error('Erro ao excluir receita');
    }
  };

  // Adicionar despesa
  const adicionarDespesa = async (despesa: Omit<ViagemDespesa, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('viagem_despesas')
        .insert(despesa);

      if (error) throw error;

      toast.success('Despesa adicionada com sucesso!');
      await fetchAllData(); // Recarregar todos os dados
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
      toast.error('Erro ao adicionar despesa');
    }
  };

  // Editar despesa
  const editarDespesa = async (id: string, despesa: Partial<Omit<ViagemDespesa, 'id' | 'created_at'>>) => {
    try {
      const { error } = await supabase
        .from('viagem_despesas')
        .update(despesa)
        .eq('id', id);

      if (error) throw error;

      toast.success('Despesa atualizada com sucesso!');
      await fetchAllData();
    } catch (error) {
      console.error('Erro ao editar despesa:', error);
      toast.error('Erro ao editar despesa');
    }
  };

  // Excluir despesa
  const excluirDespesa = async (id: string) => {
    try {
      const { error } = await supabase
        .from('viagem_despesas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Despesa excluída com sucesso!');
      await fetchAllData();
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      toast.error('Erro ao excluir despesa');
    }
  };

  // Atualizar status de pagamento do passageiro
  const atualizarStatusPagamento = async (
    viagemPassageiroId: string,
    novoStatus: 'pago' | 'pendente' | 'cancelado'
  ) => {
    try {
      const { error } = await supabase
        .from('viagem_passageiros')
        .update({ status_pagamento: novoStatus })
        .eq('id', viagemPassageiroId);

      if (error) throw error;

      toast.success('Status de pagamento atualizado com sucesso!');
      await fetchPassageirosPendentes();
      await calcularResumoFinanceiro();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status de pagamento');
    }
  };

  // Registrar pagamento de parcela
  const registrarPagamento = async (
    viagemPassageiroId: string,
    valorPagamento: number,
    formaPagamento: string,
    dataPagamento: string = new Date().toISOString(),
    observacoes?: string
  ) => {
    try {
      // Usar sistema unificado - categoria "ambos" para compatibilidade
      const { error } = await supabase
        .from('historico_pagamentos_categorizado')
        .insert({
          viagem_passageiro_id: viagemPassageiroId,
          categoria: 'ambos',
          valor_pago: valorPagamento,
          forma_pagamento: formaPagamento,
          data_pagamento: dataPagamento,
          observacoes: observacoes
        });

      if (error) throw error;

      // Verificar se o passageiro está totalmente pago
      await verificarStatusPagamento(viagemPassageiroId);

      toast.success('Pagamento registrado com sucesso!');
      await fetchPassageirosPendentes();
      await calcularResumoFinanceiro();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      toast.error('Erro ao registrar pagamento');
    }
  };

  // Verificar e atualizar status de pagamento automaticamente
  const verificarStatusPagamento = async (viagemPassageiroId: string) => {
    try {
      // Buscar dados do passageiro com sistema unificado
      const { data: passageiro, error: passageiroError } = await supabase
        .from('viagem_passageiros')
        .select(`
          valor,
          desconto,
          passageiro_passeios (valor_cobrado),
          historico_pagamentos_categorizado (categoria, valor_pago)
        `)
        .eq('id', viagemPassageiroId)
        .single();

      if (passageiroError) throw passageiroError;

      const valorViagem = (passageiro.valor || 0) - (passageiro.desconto || 0);
      const valorPasseios = (passageiro.passageiro_passeios || [])
        .reduce((sum: number, pp: any) => sum + (pp.valor_cobrado || 0), 0);

      // Calcular pagamentos por categoria
      const historicoPagamentos = passageiro.historico_pagamentos_categorizado || [];
      const pagoViagem = historicoPagamentos
        .filter((h: any) => h.categoria === 'viagem' || h.categoria === 'ambos')
        .reduce((sum: number, h: any) => sum + h.valor_pago, 0);
      const pagoPasseios = historicoPagamentos
        .filter((h: any) => h.categoria === 'passeios' || h.categoria === 'ambos')
        .reduce((sum: number, h: any) => sum + h.valor_pago, 0);

      const valorPago = pagoViagem + pagoPasseios;

      // Determinar status avançado baseado em pagamentos separados
      const viagemPaga = pagoViagem >= valorViagem - 0.01;
      const passeiosPagos = valorPasseios === 0 || pagoPasseios >= valorPasseios - 0.01;

      let novoStatus: string;
      let viagemPagaFlag = false;
      let passeiosPagosFlag = false;

      if (viagemPaga && passeiosPagos) {
        novoStatus = 'Pago Completo';
        viagemPagaFlag = true;
        passeiosPagosFlag = true;
      } else if (viagemPaga && !passeiosPagos) {
        novoStatus = 'Viagem Paga';
        viagemPagaFlag = true;
        passeiosPagosFlag = false;
      } else if (!viagemPaga && passeiosPagos) {
        novoStatus = 'Passeios Pagos';
        viagemPagaFlag = false;
        passeiosPagosFlag = true;
      } else {
        novoStatus = 'Pendente';
        viagemPagaFlag = false;
        passeiosPagosFlag = false;
      }

      // Atualizar status e flags
      const { error: updateError } = await supabase
        .from('viagem_passageiros')
        .update({
          status_pagamento: novoStatus,
          viagem_paga: viagemPagaFlag,
          passeios_pagos: passeiosPagosFlag
        })
        .eq('id', viagemPassageiroId);

      if (updateError) throw updateError;

    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  // Marcar passageiro como pago
  const marcarComoPago = async (viagemPassageiroId: string) => {
    try {
      // Buscar valor pendente com sistema unificado
      const { data: passageiro, error: passageiroError } = await supabase
        .from('viagem_passageiros')
        .select(`
          valor,
          desconto,
          passageiro_passeios (valor_cobrado),
          historico_pagamentos_categorizado (categoria, valor_pago)
        `)
        .eq('id', viagemPassageiroId)
        .single();

      if (passageiroError) throw passageiroError;

      const valorViagem = (passageiro.valor || 0) - (passageiro.desconto || 0);
      const valorPasseios = (passageiro.passageiro_passeios || [])
        .reduce((sum: number, pp: any) => sum + (pp.valor_cobrado || 0), 0);
      const valorTotal = valorViagem + valorPasseios;

      // Calcular pagamentos por categoria
      const historicoPagamentos = passageiro.historico_pagamentos_categorizado || [];
      const pagoViagem = historicoPagamentos
        .filter((h: any) => h.categoria === 'viagem' || h.categoria === 'ambos')
        .reduce((sum: number, h: any) => sum + h.valor_pago, 0);
      const pagoPasseios = historicoPagamentos
        .filter((h: any) => h.categoria === 'passeios' || h.categoria === 'ambos')
        .reduce((sum: number, h: any) => sum + h.valor_pago, 0);

      const valorPago = pagoViagem + pagoPasseios;
      const valorPendente = valorTotal - valorPago;

      if (valorPendente > 0.01) {
        // Registrar pagamento do valor pendente como "ambos" (viagem + passeios)
        const { error } = await supabase
          .from('historico_pagamentos_categorizado')
          .insert({
            viagem_passageiro_id: viagemPassageiroId,
            categoria: 'ambos',
            valor_pago: valorPendente,
            forma_pagamento: 'dinheiro',
            observacoes: 'Pagamento marcado como pago manualmente',
            data_pagamento: new Date().toISOString()
          });

        if (error) throw error;
      }

      // Atualizar status automaticamente
      await verificarStatusPagamento(viagemPassageiroId);
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      toast.error('Erro ao marcar como pago');
    }
  };

  // Cancelar pagamento do passageiro
  const cancelarPagamento = async (viagemPassageiroId: string, motivo?: string) => {
    try {
      await atualizarStatusPagamento(viagemPassageiroId, 'cancelado');

      if (motivo) {
        // Registrar no histórico de cobrança
        await registrarCobranca(
          viagemPassageiroId,
          'presencial',
          undefined,
          undefined,
          `Pagamento cancelado: ${motivo}`
        );
      }

      toast.success('Pagamento cancelado com sucesso!');
    } catch (error) {
      console.error('Erro ao cancelar pagamento:', error);
      toast.error('Erro ao cancelar pagamento');
    }
  };

  // NOVAS FUNÇÕES PARA PAGAMENTOS SEPARADOS

  // Registrar pagamento específico por categoria
  const registrarPagamentoSeparado = async (
    viagemPassageiroId: string,
    categoria: 'viagem' | 'passeios' | 'ambos',
    valor: number,
    formaPagamento: string = 'pix',
    observacoes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('historico_pagamentos_categorizado')
        .insert({
          viagem_passageiro_id: viagemPassageiroId,
          categoria: categoria,
          valor_pago: valor,
          forma_pagamento: formaPagamento,
          observacoes: observacoes,
          data_pagamento: new Date().toISOString()
        });

      if (error) throw error;

      toast.success(`Pagamento de ${categoria} registrado com sucesso!`);
      await fetchAllData();
      return true;

    } catch (error: any) {
      console.error('Erro ao registrar pagamento separado:', error);
      toast.error('Erro ao registrar pagamento');
      return false;
    }
  };

  // Pagar apenas viagem
  const pagarViagem = async (
    viagemPassageiroId: string,
    valor: number,
    formaPagamento: string = 'pix',
    observacoes?: string
  ) => {
    return registrarPagamentoSeparado(viagemPassageiroId, 'viagem', valor, formaPagamento, observacoes);
  };

  // Pagar apenas passeios
  const pagarPasseios = async (
    viagemPassageiroId: string,
    valor: number,
    formaPagamento: string = 'pix',
    observacoes?: string
  ) => {
    return registrarPagamentoSeparado(viagemPassageiroId, 'passeios', valor, formaPagamento, observacoes);
  };

  // Pagar tudo (viagem + passeios)
  const pagarTudo = async (
    viagemPassageiroId: string,
    valor: number,
    formaPagamento: string = 'pix',
    observacoes?: string
  ) => {
    return registrarPagamentoSeparado(viagemPassageiroId, 'ambos', valor, formaPagamento, observacoes);
  };

  // Obter breakdown de pagamento de um passageiro específico
  const obterBreakdownPassageiro = async (viagemPassageiroId: string) => {
    try {
      const { data: passageiro, error } = await supabase
        .from('viagem_passageiros')
        .select(`
          valor,
          desconto,
          viagem_paga,
          passeios_pagos,
          passageiro_passeios (
            valor_cobrado
          ),
          historico_pagamentos_categorizado (
            categoria,
            valor_pago
          )
        `)
        .eq('id', viagemPassageiroId)
        .single();

      if (error) throw error;

      const valorViagem = (passageiro.valor || 0) - (passageiro.desconto || 0);
      const valorPasseios = (passageiro.passageiro_passeios || [])
        .reduce((sum: number, pp: any) => sum + (pp.valor_cobrado || 0), 0);

      const historico = passageiro.historico_pagamentos_categorizado || [];
      const pagoViagem = historico
        .filter((h: any) => h.categoria === 'viagem' || h.categoria === 'ambos')
        .reduce((sum: number, h: any) => sum + h.valor_pago, 0);
      const pagoPasseios = historico
        .filter((h: any) => h.categoria === 'passeios' || h.categoria === 'ambos')
        .reduce((sum: number, h: any) => sum + h.valor_pago, 0);

      return {
        valor_viagem: valorViagem,
        valor_passeios: valorPasseios,
        valor_total: valorViagem + valorPasseios,
        pago_viagem: pagoViagem,
        pago_passeios: pagoPasseios,
        pago_total: pagoViagem + pagoPasseios,
        pendente_viagem: Math.max(0, valorViagem - pagoViagem),
        pendente_passeios: Math.max(0, valorPasseios - pagoPasseios),
        pendente_total: Math.max(0, (valorViagem + valorPasseios) - (pagoViagem + pagoPasseios)),
        viagem_paga: passageiro.viagem_paga || false,
        passeios_pagos: passageiro.passeios_pagos || false
      };

    } catch (error) {
      console.error('Erro ao obter breakdown:', error);
      return null;
    }
  };

  // Carregar todos os dados
  const fetchAllData = async () => {
    if (!viagemId) return;

    setIsLoading(true);
    try {
      await Promise.all([
        fetchViagem(), // Adicionar busca da viagem
        fetchReceitas(),
        fetchDespesas(),
        fetchPassageirosPendentes(),
        fetchTodosPassageiros(), // Buscar todos os passageiros para relatórios
        fetchHistoricoCobranca()
      ]);
      await calcularResumoFinanceiro();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [viagemId]);

  useEffect(() => {
    calcularResumoFinanceiro();
  }, [receitas, despesas]);

  return {
    // Dados
    viagem,
    receitas,
    despesas,
    passageirosPendentes,
    todosPassageiros,
    historicoCobranca,
    resumoFinanceiro,
    isLoading,

    // Compatibilidade de Passeios
    sistema,
    valorPasseios,
    temPasseios,
    shouldUseNewSystem,

    // Ações
    fetchAllData,
    registrarCobranca,
    adicionarReceita,
    editarReceita,
    excluirReceita,
    adicionarDespesa,
    editarDespesa,
    excluirDespesa,
    fetchReceitas,
    fetchDespesas,
    fetchPassageirosPendentes,
    fetchHistoricoCobranca,

    // Gerenciamento de Status dos Passageiros (sistema antigo)
    atualizarStatusPagamento,
    registrarPagamento,
    verificarStatusPagamento,
    marcarComoPago,
    cancelarPagamento,

    // NOVAS FUNÇÕES - Pagamentos Separados
    registrarPagamentoSeparado,
    pagarViagem,
    pagarPasseios,
    pagarTudo,
    obterBreakdownPassageiro
  };
}