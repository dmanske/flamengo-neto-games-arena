import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useViagemCompatibility } from '@/hooks/useViagemCompatibility';
import { formatCurrency } from '@/lib/utils';

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
  // Novo campo para descontos
  total_descontos: number;
  // ✨ NOVOS CAMPOS PARA CUSTOS DOS PASSEIOS
  custos_passeios: number;
  despesas_operacionais: number;
  lucro_passeios: number;
  margem_passeios: number;
  // ✨ NOVOS CAMPOS PARA VIAGEM
  lucro_viagem: number;
  margem_viagem: number;
}

export function useViagemFinanceiro(viagemId: string | undefined, customFetchAllData?: () => Promise<void>) {
  const [viagem, setViagem] = useState<any>(null);
  const [receitas, setReceitas] = useState<ViagemReceita[]>([]);
  const [despesas, setDespesas] = useState<ViagemDespesa[]>([]);
  const [passageirosPendentes, setPassageirosPendentes] = useState<PassageiroPendente[]>([]);
  const [todosPassageiros, setTodosPassageiros] = useState<any[]>([]);
  const [historicoCobranca, setHistoricoCobranca] = useState<CobrancaHistorico[]>([]);
  const [capacidadeTotal, setCapacidadeTotal] = useState<number>(0);
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
    passageiros_pago_completo: 0,
    total_descontos: 0
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

  // Buscar ônibus da viagem (mesma forma que useViagemDetails)
  const fetchOnibus = async () => {
    if (!viagemId) return;

    try {
      const { data, error } = await supabase
        .from("viagem_onibus")
        .select("*")
        .eq("viagem_id", viagemId);

      if (error) throw error;

      console.log('🚌 DEBUG - Ônibus encontrados:', data?.length || 0, data);
      
      if (data && data.length > 0) {
        const capacidadeTotalCalculada = data.reduce(
          (total: number, onibus: any) => {
            const capacidade = (onibus.capacidade_onibus || 0) + (onibus.lugares_extras || 0);
            console.log('🚌 Ônibus:', onibus.numero_identificacao, 'Capacidade:', capacidade);
            return total + capacidade;
          },
          0
        );
        
        console.log('🚌 Capacidade total calculada:', capacidadeTotalCalculada);
        setCapacidadeTotal(capacidadeTotalCalculada);
      } else {
        console.log('🚌 Nenhum ônibus encontrado para a viagem');
        setCapacidadeTotal(0);
      }
    } catch (error) {
      console.error('Erro ao buscar ônibus:', error);
      setCapacidadeTotal(0);
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

  // Buscar despesas da viagem (incluindo despesas virtuais dos passeios)
  const fetchDespesas = async () => {
    if (!viagemId) return;

    try {
      // Buscar despesas manuais
      const { data: despesasManuais, error } = await supabase
        .from('viagem_despesas')
        .select('*')
        .eq('viagem_id', viagemId)
        .order('data_despesa', { ascending: false });

      if (error) throw error;

      // ✨ NOVO: Buscar despesas virtuais dos passeios
      try {
        // Buscar vendas de passeios diretamente
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
          .eq('viagem_passageiros.viagem_id', viagemId);

        if (vendasError) throw vendasError;

        // Agrupar por passeio e calcular totais
        const vendasAgrupadas = (vendasData || []).reduce((acc: Record<string, any>, item: any) => {
          const passeioId = item.passeios.id;
          const nome = item.passeios.nome;
          const custoUnitario = item.passeios.custo_operacional || 0;

          if (!acc[passeioId]) {
            acc[passeioId] = {
              passeio_id: passeioId,
              nome: nome,
              quantidade_vendida: 0,
              custo_total: 0
            };
          }

          acc[passeioId].quantidade_vendida += 1;
          acc[passeioId].custo_total += custoUnitario;

          return acc;
        }, {});

        const vendasPasseios = Object.values(vendasAgrupadas);
        
        // Gerar despesas virtuais dos passeios
        const despesasVirtuaisPasseios = vendasPasseios
          .filter(venda => venda.custo_total > 0)
          .map(venda => ({
            id: `virtual-passeio-${venda.passeio_id}`,
            viagem_id: viagemId,
            fornecedor: `Custo: ${venda.nome}`,
            categoria: 'passeios',
            subcategoria: `${venda.quantidade_vendida} vendidos`,
            valor: venda.custo_total,
            forma_pagamento: 'Custo Operacional',
            status: 'calculado',
            data_despesa: new Date().toISOString(),
            observacoes: `Custo automático: ${venda.quantidade_vendida}x R$ ${(venda.custo_total / venda.quantidade_vendida).toFixed(2)}`,
            created_at: new Date().toISOString(),
            isVirtual: true
          }));

        // Combinar despesas manuais + virtuais
        const todasDespesas = [
          ...(despesasManuais || []),
          ...despesasVirtuaisPasseios
        ].sort((a, b) => new Date(b.data_despesa).getTime() - new Date(a.data_despesa).getTime());

        setDespesas(todasDespesas);
      } catch (passeiosError) {
        console.warn('Erro ao buscar custos dos passeios:', passeiosError);
        // Se falhar, usar apenas despesas manuais
        setDespesas(despesasManuais || []);
      }
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
          setor_maracana,
          cidade_embarque,
          onibus_id,
          is_responsavel_onibus,
          status_presenca,
          valor,
          desconto,
          status_pagamento,
          viagem_paga,
          passeios_pagos,
          gratuito,
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
          ),
          viagem_onibus!viagem_passageiros_onibus_id_fkey (
            numero_identificacao,
            empresa
          )
        `)
        .eq('viagem_id', viagemId);

      if (error) throw error;

      const todosFormatados = (data || []).map((item: any) => {
        const valorViagem = (item.valor || 0) - (item.desconto || 0);
        const valorPasseios = (item.passageiro_passeios || [])
          .reduce((sum: number, pp: any) => sum + (pp.valor_cobrado || 0), 0);

        // Calcular status correto
        let statusCalculado = item.status_pagamento;

        // Verificar se é passageiro gratuito
        if (item.gratuito === true) {
          statusCalculado = '🎁 Brinde';
        } else if (valorViagem + valorPasseios === 0) {
          statusCalculado = '🎁 Brinde';
        } else {
          // Calcular pagamentos por categoria
          const historicoPagamentos = item.historico_pagamentos_categorizado || [];
          const pagoViagem = historicoPagamentos
            .filter((h: any) => h.categoria === 'viagem' || h.categoria === 'ambos')
            .reduce((sum: number, h: any) => sum + h.valor_pago, 0);
          const pagoPasseios = historicoPagamentos
            .filter((h: any) => h.categoria === 'passeios' || h.categoria === 'ambos')
            .reduce((sum: number, h: any) => sum + h.valor_pago, 0);

          // Determinar status baseado em pagamentos separados
          const viagemPaga = pagoViagem >= valorViagem - 0.01;
          const passeiosPagos = valorPasseios === 0 || pagoPasseios >= valorPasseios - 0.01;

          if (viagemPaga && passeiosPagos) {
            statusCalculado = 'Pago Completo';
          } else if (viagemPaga && !passeiosPagos) {
            statusCalculado = 'Viagem Paga';
          } else if (!viagemPaga && passeiosPagos) {
            statusCalculado = 'Passeios Pagos';
          } else {
            statusCalculado = 'Pendente';
          }
        }

        return {
          id: item.clientes.id,
          viagem_passageiro_id: item.id,
          nome: item.clientes.nome,
          telefone: item.clientes.telefone,
          setor_maracana: item.setor_maracana || item.clientes.setor_maracana || '-',
          cidade_embarque: item.cidade_embarque || 'Não especificada',
          onibus_id: item.onibus_id,
          onibus_numero: item.viagem_onibus?.numero_identificacao || 'S/N',
          onibus_empresa: item.viagem_onibus?.empresa || 'N/A',
          is_responsavel_onibus: item.is_responsavel_onibus || false,
          status_presenca: item.status_presenca || 'pendente',
          valor: item.valor || 0,
          valor_total: valorViagem + valorPasseios,
          desconto: item.desconto || 0,
          gratuito: item.gratuito || false,
          status_pagamento: item.status_pagamento, // Status da tabela
          status_calculado: statusCalculado, // Status calculado corretamente
          passeios: item.passageiro_passeios || [],
          historico_pagamentos_categorizado: item.historico_pagamentos_categorizado || [],
          // Calcular valores de viagem e passeios
          valor_viagem: valorViagem,
          valor_passeios: valorPasseios
        };
      });

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

        // Calcular pagamentos usando a mesma lógica da função principal
        let pagoViagem = 0;
        let pagoPasseios = 0;

        historicoPagamentos.forEach((h: any) => {
          if (h.categoria === 'viagem') {
            pagoViagem += h.valor_pago;
          } else if (h.categoria === 'passeios') {
            pagoPasseios += h.valor_pago;
          } else if (h.categoria === 'ambos') {
            // CATEGORIA 'AMBOS' = APENAS QUITAÇÃO COMPLETA
            const valorTotalDevido = valorViagem + valorPasseios;

            if (h.valor_pago >= valorTotalDevido) {
              // Pagamento suficiente - quitar completamente
              pagoViagem += valorViagem;
              pagoPasseios += valorPasseios;
            } else {
              // ERRO: Categoria 'ambos' com valor insuficiente não deveria existir
              console.warn(`⚠️ Pagamento 'ambos' com valor insuficiente: R$ ${h.valor_pago} < R$ ${valorTotalDevido}`);
              // Não processar este pagamento (ignorar)
            }
          }
        });

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
            valor_cobrado,
            passeios!inner (
              nome,
              custo_operacional
            )
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
      let totalDescontos = 0;
      
      // ✨ NOVO: Variáveis para custos dos passeios
      let custosPasseios = 0;

      console.log('🔍 DEBUG - Calculando resumo financeiro para viagem:', viagemId);
      console.log('📊 Passageiros encontrados:', passageiros?.length || 0);

      passageiros?.forEach((p: any, index: number) => {
        const valorViagem = (p.valor || 0) - (p.desconto || 0);
        const valorPasseios = (p.passageiro_passeios || [])
          .reduce((sum: number, pp: any) => sum + (pp.valor_cobrado || 0), 0);
        const valorTotal = valorViagem + valorPasseios;
        const desconto = p.desconto || 0;

        // Calcular pagamentos por categoria (novo sistema) - CORRIGIDO
        const historicoPagamentos = p.historico_pagamentos_categorizado || [];

        let pagoViagem = 0;
        let pagoPasseios = 0;

        historicoPagamentos.forEach((h: any) => {
          if (h.categoria === 'viagem') {
            console.log(`💰 Pagamento viagem encontrado: R$ ${h.valor_pago}`);
            pagoViagem += h.valor_pago;
          } else if (h.categoria === 'passeios') {
            console.log(`🎢 Pagamento passeios encontrado: R$ ${h.valor_pago}`);
            pagoPasseios += h.valor_pago;
          } else if (h.categoria === 'ambos') {
            // CATEGORIA 'AMBOS' = APENAS QUITAÇÃO COMPLETA
            // Só deve ser usado quando o valor é suficiente para quitar tudo
            const valorTotalDevido = valorViagem + valorPasseios;

            if (h.valor_pago >= valorTotalDevido) {
              // Pagamento suficiente - quitar completamente
              console.log(`🎯 Pagamento 'ambos' processado: R$ ${h.valor_pago}`);
              pagoViagem += valorViagem;
              pagoPasseios += valorPasseios;
            } else {
              // ERRO: Categoria 'ambos' com valor insuficiente não deveria existir
              console.warn(`⚠️ Pagamento 'ambos' com valor insuficiente: R$ ${h.valor_pago} < R$ ${valorTotalDevido}`);
              // Não processar este pagamento (ignorar)
            }
          }
        });

        console.log(`👤 Passageiro ${index + 1} - Cálculo final:`, {
          nome: p.clientes?.nome || 'Nome não encontrado',
          valorViagem,
          valorPasseios,
          pagoViagem: pagoViagem.toFixed(2),
          pagoPasseios: pagoPasseios.toFixed(2),
          historicoPagamentos: historicoPagamentos.map((h: any) => ({
            categoria: h.categoria,
            valor: h.valor_pago
          }))
        });

        // Fallback para sistema antigo se não houver dados novos
        const valorPagoTotal = pagoViagem + pagoPasseios;

        // Acumular receitas
        receitasViagem += valorViagem;
        receitasPasseios += valorPasseios;
        
        // ✨ NOVO: Calcular custos dos passeios
        const custosPasseiosPassageiro = (p.passageiro_passeios || [])
          .reduce((sum: number, pp: any) => sum + (pp.passeios?.custo_operacional || 0), 0);
        custosPasseios += custosPasseiosPassageiro;

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

        // Somar descontos (apenas de passageiros que não são brindes)
        if (desconto > 0) {
          totalDescontos += desconto;
        }

        console.log(`👤 Passageiro ${index + 1}:`, {
          nome: p.clientes?.nome || 'Nome não encontrado',
          valor_viagem: valorViagem,
          valor_passeios: valorPasseios,
          pago_viagem: pagoViagem.toFixed(2),
          pago_passeios: pagoPasseios.toFixed(2),
          pendente_viagem: pendenteViagem.toFixed(2),
          pendente_passeios: pendentePasseios.toFixed(2),
          historico_pagamentos: historicoPagamentos.map((h: any) => ({
            categoria: h.categoria,
            valor: h.valor_pago
          })),
          status_pagamento: p.status_pagamento
        });
      });

      // Somar outras receitas
      const totalOutrasReceitas = receitas.reduce((sum, r) => sum + r.valor, 0);
      const totalReceitas = receitasViagem + receitasPasseios + totalOutrasReceitas;
      const totalPendencias = pendenciasViagem + pendenciasPasseios;

      // Somar despesas (SEM duplicar custos dos passeios)
      // As despesas já incluem as despesas virtuais dos passeios, então não somar custosPasseios novamente
      const despesasOperacionais = despesas.filter(d => !d.isVirtual).reduce((sum, d) => sum + d.valor, 0);
      const totalDespesas = despesasOperacionais + custosPasseios;

      console.log('🔍 DEBUG - Correção duplicação custos:', {
        despesasOperacionais: despesasOperacionais.toFixed(2),
        custosPasseios: custosPasseios.toFixed(2),
        totalDespesas: totalDespesas.toFixed(2),
        despesasVirtuais: despesas.filter(d => d.isVirtual).length,
        despesasManuais: despesas.filter(d => !d.isVirtual).length
      });

      // Calcular métricas
      const lucroBruto = totalReceitas - totalDespesas;
      const margemLucro = totalReceitas > 0 ? (lucroBruto / totalReceitas) * 100 : 0;
      const taxaInadimplencia = passageiros?.length > 0 ? (countPendencias / passageiros.length) * 100 : 0;
      
      // ✨ NOVO: Métricas específicas dos passeios
      const lucroPasseios = receitasPasseios - custosPasseios;
      const margemPasseios = receitasPasseios > 0 ? (lucroPasseios / receitasPasseios) * 100 : 0;
      
      // ✨ NOVO: Métricas específicas da viagem
      const despesasOperacionaisProporcionais = despesasOperacionais * 0.8; // 80% das despesas para viagem
      const lucroViagem = receitasViagem - despesasOperacionaisProporcionais;
      const margemViagem = receitasViagem > 0 ? (lucroViagem / receitasViagem) * 100 : 0;

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
        passageiros_pago_completo: passageirosPagoCompleto,
        total_descontos: totalDescontos,
        // ✨ NOVOS CAMPOS PARA CUSTOS DOS PASSEIOS
        custos_passeios: custosPasseios,
        despesas_operacionais: despesasOperacionais,
        lucro_passeios: lucroPasseios,
        margem_passeios: margemPasseios,
        // ✨ NOVOS CAMPOS PARA VIAGEM
        lucro_viagem: lucroViagem,
        margem_viagem: margemViagem
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
      await (customFetchAllData || fetchAllData)(); // Usar função customizada se disponível
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
      await (customFetchAllData || fetchAllData)();
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
      await (customFetchAllData || fetchAllData)();
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
      await (customFetchAllData || fetchAllData)(); // Usar função customizada se disponível
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
      await (customFetchAllData || fetchAllData)();
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
      await (customFetchAllData || fetchAllData)();
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
      await (customFetchAllData || fetchAllData)();
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

  // Função pagarTudo removida

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
    if (!viagemId) {
      console.warn('fetchAllData: viagemId não definido');
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all([
        fetchViagem(), // Buscar dados da viagem
        fetchOnibus(), // ✅ NOVO: Buscar ônibus separadamente (mesma forma que DetalhesViagem)
        fetchReceitas(),
        fetchDespesas(),
        fetchPassageirosPendentes(),
        fetchTodosPassageiros(), // Buscar todos os passageiros para relatórios
        fetchHistoricoCobranca()
      ]);
      await calcularResumoFinanceiro();
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [viagemId]);

  useEffect(() => {
    if (viagemId) {
      calcularResumoFinanceiro();
    }
  }, [receitas, despesas, viagemId]);

  return {
    // Dados
    viagem,
    receitas,
    despesas,
    passageirosPendentes,
    todosPassageiros,
    historicoCobranca,
    resumoFinanceiro,
    capacidadeTotal,
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
    // pagarTudo removido
    obterBreakdownPassageiro
  };
}