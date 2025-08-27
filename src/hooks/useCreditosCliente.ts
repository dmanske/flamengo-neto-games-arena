import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Credito } from '@/types/creditos';
import { toast } from 'sonner';

interface ResumoCreditos {
  total_creditos: number;
  valor_total: number;
  valor_disponivel: number;
  valor_utilizado: number;
}

interface HistoricoUso {
  id: string;
  valor_utilizado: number;
  data_vinculacao: string;
  observacoes?: string;
  passageiro_id?: string;
  viagem?: {
    id: string;
    adversario: string;
    data_jogo: string;
    local_jogo?: string;
  };
  credito?: {
    id: string;
    valor_credito: number;
    data_pagamento: string;
  };
  beneficiario?: {
    id: string;
    nome: string;
    telefone?: string;
  };
}

export function useCreditosCliente(clienteId: string) {
  const [creditos, setCreditos] = useState<Credito[]>([]);
  const [resumo, setResumo] = useState<ResumoCreditos>({
    total_creditos: 0,
    valor_total: 0,
    valor_disponivel: 0,
    valor_utilizado: 0
  });
  const [historicoUso, setHistoricoUso] = useState<HistoricoUso[]>([]);
  const [loading, setLoading] = useState(true);

  const buscarCreditos = async () => {
    try {
      const { data: creditosData, error: creditosError } = await supabase
        .from('cliente_creditos')
        .select(`
          *,
          cliente:clientes(
            id,
            nome,
            telefone,
            email
          )
        `)
        .eq('cliente_id', clienteId)
        .order('data_pagamento', { ascending: false });

      if (creditosError) throw creditosError;

      // Calcular resumo
      const totalCreditos = creditosData?.length || 0;
      const valorTotal = creditosData?.reduce((sum, c) => sum + c.valor_credito, 0) || 0;
      const valorDisponivel = creditosData?.reduce((sum, c) => sum + c.saldo_disponivel, 0) || 0;
      const valorUtilizado = valorTotal - valorDisponivel;

      setCreditos(creditosData || []);
      setResumo({
        total_creditos: totalCreditos,
        valor_total: valorTotal,
        valor_disponivel: valorDisponivel,
        valor_utilizado: valorUtilizado
      });

      return creditosData || [];
    } catch (error) {
      console.error('Erro ao buscar créditos:', error);
      toast.error('Erro ao carregar créditos do cliente');
      return [];
    }
  };

  const buscarHistoricoUso = async (creditosIds: string[]) => {
    if (creditosIds.length === 0) {
      setHistoricoUso([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('credito_viagem_vinculacoes')
        .select(`
          id,
          valor_utilizado,
          data_vinculacao,
          observacoes,
          passageiro_id,
          viagem:viagens(
            id,
            adversario,
            data_jogo,
            local_jogo
          ),
          credito:cliente_creditos(
            id,
            valor_credito,
            data_pagamento
          ),
          beneficiario:clientes!passageiro_id(
            id,
            nome,
            telefone
          )
        `)
        .in('credito_id', creditosIds)
        .order('data_vinculacao', { ascending: false });

      if (error) throw error;
      setHistoricoUso(data || []);
    } catch (error) {
      console.error('Erro ao buscar histórico de uso:', error);
    }
  };

  const carregarDados = async () => {
    setLoading(true);
    const creditosData = await buscarCreditos();
    const creditosIds = creditosData.map(c => c.id);
    await buscarHistoricoUso(creditosIds);
    setLoading(false);
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (clienteId) {
      carregarDados();
    }
  }, [clienteId]);

  // Configurar Realtime para créditos
  useEffect(() => {
    if (!clienteId) return;

    const channel = supabase
      .channel(`creditos-cliente-${clienteId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cliente_creditos',
          filter: `cliente_id=eq.${clienteId}`
        },
        (payload) => {
          console.log('Mudança em créditos detectada:', payload);
          carregarDados();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'credito_viagem_vinculacoes'
        },
        (payload) => {
          console.log('Mudança em vinculações detectada:', payload);
          // Recarregar apenas se for relacionado aos créditos deste cliente
          if (creditos.some(c => c.id === payload.new?.credito_id || c.id === payload.old?.credito_id)) {
            carregarDados();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clienteId, creditos]);

  const deletarCredito = async (creditoId: string) => {
    try {
      const { error } = await supabase
        .from('cliente_creditos')
        .delete()
        .eq('id', creditoId);

      if (error) throw error;

      toast.success('Crédito deletado com sucesso!');
      // Os dados serão atualizados automaticamente via Realtime
    } catch (error) {
      console.error('Erro ao deletar crédito:', error);
      toast.error('Erro ao deletar crédito');
      throw error;
    }
  };

  return {
    creditos,
    resumo,
    historicoUso,
    loading,
    deletarCredito,
    refresh: carregarDados
  };
}