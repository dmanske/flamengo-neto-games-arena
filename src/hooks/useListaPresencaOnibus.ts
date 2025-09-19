import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface PassageiroOnibus {
  id: string;
  viagem_passageiro_id: string;
  nome: string;
  telefone: string;
  cpf: string;
  foto?: string;
  cidade_embarque: string;
  setor_maracana: string;
  status_presenca: 'pendente' | 'presente' | 'ausente';
  status_pagamento: string;
  valor: number;
  desconto: number;
  is_responsavel_onibus: boolean;
  pago_por_credito?: boolean;
  credito_origem_id?: string | null;
  valor_credito_utilizado?: number;
  passeios: Array<{
    passeio_nome: string;
    status: string;
    valor_cobrado?: number;
  }>;
  historico_pagamentos?: Array<{
    id: string;
    categoria: 'viagem' | 'passeios' | 'ambos';
    valor_pago: number;
    forma_pagamento: string;
    data_pagamento: string;
    observacoes?: string;
  }>;
}

export interface OnibusInfo {
  id: string;
  numero_identificacao: string;
  tipo_onibus: string;
  empresa: string;
  capacidade_onibus: number;
}

export interface ViagemInfo {
  id: string;
  adversario: string;
  data_jogo: string;
  status_viagem: string;
  logo_flamengo: string | null;
  logo_adversario: string | null;
}

export interface EstatisticasOnibus {
  total: number;
  presentes: number;
  pendentes: number;
  ausentes: number;
  taxa_presenca: number;
  pagosCompletos: number;
  pendentesFinanceiro: number;
  valorTotalPendente: number;
  brindes: number;
}

export const useListaPresencaOnibus = (viagemId: string | undefined, onibusId: string | undefined) => {
  const [viagem, setViagem] = useState<ViagemInfo | null>(null);
  const [onibus, setOnibus] = useState<OnibusInfo | null>(null);
  const [passageiros, setPassageiros] = useState<PassageiroOnibus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atualizandoPresenca, setAtualizandoPresenca] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (viagemId && onibusId) {
      fetchDados();
    }
  }, [viagemId, onibusId]);

  const fetchDados = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validar se os parâmetros existem
      if (!viagemId || !onibusId) {
        throw new Error('Parâmetros de viagem ou ônibus não fornecidos');
      }

      // Validar UUIDs
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(viagemId) || !uuidRegex.test(onibusId)) {
        throw new Error('IDs inválidos fornecidos');
      }

      // Buscar dados da viagem
      const { data: viagemData, error: viagemError } = await supabase
        .from("viagens")
        .select("id, adversario, data_jogo, status_viagem, logo_flamengo, logo_adversario")
        .eq("id", viagemId)
        .single();

      if (viagemError) {
        if (viagemError.code === 'PGRST116') {
          throw new Error('Viagem não encontrada');
        }
        throw new Error(`Erro ao buscar viagem: ${viagemError.message}`);
      }

      // Remover restrição de status - permitir acesso a qualquer viagem

      setViagem(viagemData);

      // Buscar dados do ônibus específico
      const { data: onibusData, error: onibusError } = await supabase
        .from("viagem_onibus")
        .select("id, numero_identificacao, tipo_onibus, empresa, capacidade_onibus")
        .eq("viagem_id", viagemId)
        .eq("id", onibusId)
        .single();

      if (onibusError) {
        if (onibusError.code === 'PGRST116') {
          throw new Error('Ônibus não encontrado nesta viagem');
        }
        throw new Error(`Erro ao buscar ônibus: ${onibusError.message}`);
      }
      setOnibus(onibusData);

      // Buscar passageiros do ônibus específico
      const { data: passageirosData, error: passageirosError } = await supabase
        .from("viagem_passageiros")
        .select(`
          id,
          status_presenca,
          status_pagamento,
          valor,
          desconto,
          cidade_embarque,
          setor_maracana,
          is_responsavel_onibus,
          pago_por_credito,
          credito_origem_id,
          valor_credito_utilizado,
          clientes!viagem_passageiros_cliente_id_fkey (
            id,
            nome,
            telefone,
            cpf,
            foto
          ),
          passageiro_passeios (
            passeio_nome,
            status,
            valor_cobrado
          ),
          historico_pagamentos_categorizado (
            id,
            categoria,
            valor_pago,
            forma_pagamento,
            data_pagamento,
            observacoes
          )
        `)
        .eq("viagem_id", viagemId)
        .eq("onibus_id", onibusId);

      if (passageirosError) throw passageirosError;

      // Formatar dados dos passageiros
      const passageirosFormatados: PassageiroOnibus[] = (passageirosData || []).map((item: any) => ({
        id: item.clientes.id,
        viagem_passageiro_id: item.id,
        nome: item.clientes.nome,
        telefone: item.clientes.telefone,
        cpf: item.clientes.cpf,
        foto: item.clientes.foto,
        cidade_embarque: item.cidade_embarque,
        setor_maracana: item.setor_maracana,
        status_presenca: item.status_presenca || 'pendente',
        status_pagamento: item.status_pagamento || 'Pendente',
        valor: item.valor || 0,
        desconto: item.desconto || 0,
        is_responsavel_onibus: item.is_responsavel_onibus || false,
        pago_por_credito: item.pago_por_credito || false,
        credito_origem_id: item.credito_origem_id,
        valor_credito_utilizado: item.valor_credito_utilizado || 0,
        passeios: item.passageiro_passeios || [],
        historico_pagamentos: item.historico_pagamentos_categorizado || []
      }));

      setPassageiros(passageirosFormatados);

    } catch (error: any) {
      console.error("Erro ao buscar dados:", error);
      setError(error.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const togglePresenca = async (viagemPassageiroId: string, novoStatus: string) => {
    // Validar parâmetros
    if (!viagemPassageiroId || !novoStatus) {
      toast.error("Parâmetros inválidos para atualização de presença");
      return;
    }
    
    // Adicionar ao set de atualizações
    setAtualizandoPresenca(prev => new Set(prev).add(viagemPassageiroId));
    
    try {
      const { error } = await supabase
        .from("viagem_passageiros")
        .update({ status_presenca: novoStatus })
        .eq("id", viagemPassageiroId);

      if (error) {
        console.error("Erro detalhado ao atualizar presença:", error);
        throw new Error(`Erro ao atualizar presença: ${error.message}`);
      }

      // Atualizar estado local
      setPassageiros(prev => 
        prev.map(p => 
          p.viagem_passageiro_id === viagemPassageiroId 
            ? { ...p, status_presenca: novoStatus as 'pendente' | 'presente' | 'ausente' }
            : p
        )
      );

      toast.success(`Presença ${novoStatus === 'presente' ? 'confirmada' : 'removida'}`);
    } catch (error) {
      console.error("Erro ao atualizar presença:", error);
      toast.error("Erro ao atualizar presença");
    } finally {
      // Remover do set de atualizações
      setAtualizandoPresenca(prev => {
        const newSet = new Set(prev);
        newSet.delete(viagemPassageiroId);
        return newSet;
      });
    }
  };

  // Calcular estatísticas do ônibus
  const calcularEstatisticas = (): EstatisticasOnibus => {
    const total = passageiros.length;
    const presentes = passageiros.filter(p => p.status_presenca === 'presente').length;
    const pendentes = passageiros.filter(p => p.status_presenca === 'pendente').length;
    const ausentes = passageiros.filter(p => p.status_presenca === 'ausente').length;
    const taxa_presenca = total > 0 ? Math.round((presentes / total) * 100) : 0;

    // Estatísticas financeiras
    let pagosCompletos = 0;
    let pendentesFinanceiro = 0;
    let valorTotalPendente = 0;
    let brindes = 0;

    passageiros.forEach(p => {
      const valorViagem = (p.valor || 0) - (p.desconto || 0);
      const valorPasseios = (p.passeios || []).reduce((sum, passeio) => sum + (passeio.valor_cobrado || 0), 0);
      const valorTotal = valorViagem + valorPasseios;

      if (valorTotal === 0) {
        brindes++;
        return;
      }

      // Calcular valores pagos usando historico_pagamentos_categorizado
      const historico = p.historico_pagamentos || [];
      
      let pagoViagem = historico
        .filter(h => h.categoria === 'viagem' || h.categoria === 'ambos')
        .reduce((sum, h) => sum + h.valor_pago, 0);
      
      let pagoPasseios = historico
        .filter(h => h.categoria === 'passeios' || h.categoria === 'ambos')
        .reduce((sum, h) => sum + h.valor_pago, 0);

      // Considerar pagamento via crédito
      if (p.pago_por_credito && p.valor_credito_utilizado) {
        const valorCredito = p.valor_credito_utilizado;
        
        if (valorCredito >= valorViagem) {
          pagoViagem = valorViagem;
          const creditoSobrando = valorCredito - valorViagem;
          if (creditoSobrando > 0) {
            pagoPasseios += Math.min(creditoSobrando, valorPasseios);
          }
        } else {
          pagoViagem += valorCredito;
        }
      }

      // Calcular pendências reais
      const pendenteViagem = Math.max(0, valorViagem - pagoViagem);
      const pendentePasseios = Math.max(0, valorPasseios - pagoPasseios);
      const totalPendente = pendenteViagem + pendentePasseios;
      
      if (totalPendente <= 0.01) {
        pagosCompletos++;
      } else {
        pendentesFinanceiro++;
        valorTotalPendente += totalPendente;
      }
    });

    return {
      total,
      presentes,
      pendentes,
      ausentes,
      taxa_presenca,
      pagosCompletos,
      pendentesFinanceiro,
      valorTotalPendente,
      brindes
    };
  };

  const estatisticas = calcularEstatisticas();

  return {
    viagem,
    onibus,
    passageiros,
    estatisticas,
    loading,
    error,
    atualizandoPresenca,
    togglePresenca,
    refetch: fetchDados
  };
};