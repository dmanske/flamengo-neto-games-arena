import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { 
  Passeio, 
  PasseioComCalculos, 
  ResumoFinanceiroPasseios, 
  NovoPasseioFormData,
  PasseioVendaInfo 
} from '@/types/passeio';

export const usePasseiosCustos = () => {
  const [passeios, setPasseios] = useState<PasseioComCalculos[]>([]);
  const [resumo, setResumo] = useState<ResumoFinanceiroPasseios>({
    total_passeios_pagos: 0,
    total_passeios_gratuitos: 0,
    margem_media: 0,
    alertas_count: 0,
    passeios_com_prejuizo: 0,
    passeios_margem_baixa: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para calcular métricas de um passeio
  const calcularMetricas = (passeio: Passeio): PasseioComCalculos => {
    const lucro_unitario = passeio.valor - (passeio.custo_operacional || 0);
    const margem_percentual = passeio.valor > 0 ? (lucro_unitario / passeio.valor) * 100 : 0;
    
    let status_margem: 'prejuizo' | 'baixa' | 'boa' = 'boa';
    if (lucro_unitario < 0) {
      status_margem = 'prejuizo';
    } else if (margem_percentual < 20) {
      status_margem = 'baixa';
    }

    return {
      ...passeio,
      lucro_unitario,
      margem_percentual,
      status_margem
    };
  };

  // Buscar todos os passeios com cálculos
  const fetchPasseios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('passeios')
        .select('*')
        .eq('ativo', true)
        .order('categoria', { ascending: true })
        .order('nome', { ascending: true });

      if (fetchError) throw fetchError;

      // Calcular métricas para cada passeio
      const passeiosComCalculos = (data || []).map(calcularMetricas);
      setPasseios(passeiosComCalculos);

      // Calcular resumo
      const passeiosPagos = passeiosComCalculos.filter(p => p.categoria === 'pago');
      const passeiosGratuitos = passeiosComCalculos.filter(p => p.categoria === 'gratuito');
      
      const margemMedia = passeiosPagos.length > 0 
        ? passeiosPagos.reduce((sum, p) => sum + p.margem_percentual, 0) / passeiosPagos.length 
        : 0;

      const passeiosComPrejuizo = passeiosPagos.filter(p => p.status_margem === 'prejuizo').length;
      const passeiosMargemBaixa = passeiosPagos.filter(p => p.status_margem === 'baixa').length;

      setResumo({
        total_passeios_pagos: passeiosPagos.length,
        total_passeios_gratuitos: passeiosGratuitos.length,
        margem_media: margemMedia,
        alertas_count: passeiosComPrejuizo + passeiosMargemBaixa,
        passeios_com_prejuizo: passeiosComPrejuizo,
        passeios_margem_baixa: passeiosMargemBaixa
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar passeios';
      console.error('Erro no usePasseiosCustos:', err);
      setError(errorMessage);
      toast.error('Erro ao carregar configuração de passeios');
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar custo de um passeio
  const atualizarCusto = async (passeioId: string, novoCusto: number) => {
    try {
      const { error } = await supabase
        .from('passeios')
        .update({ custo_operacional: novoCusto })
        .eq('id', passeioId);

      if (error) throw error;

      // Atualizar estado local
      setPasseios(prev => prev.map(p => 
        p.id === passeioId 
          ? calcularMetricas({ ...p, custo_operacional: novoCusto })
          : p
      ));

      toast.success('Custo atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar custo:', error);
      toast.error('Erro ao atualizar custo do passeio');
    }
  };

  // Atualizar valor de venda de um passeio
  const atualizarValor = async (passeioId: string, novoValor: number) => {
    try {
      const { error } = await supabase
        .from('passeios')
        .update({ valor: novoValor })
        .eq('id', passeioId);

      if (error) throw error;

      // Atualizar estado local
      setPasseios(prev => prev.map(p => 
        p.id === passeioId 
          ? calcularMetricas({ ...p, valor: novoValor })
          : p
      ));

      toast.success('Valor atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar valor:', error);
      toast.error('Erro ao atualizar valor do passeio');
    }
  };

  // Adicionar novo passeio
  const adicionarPasseio = async (dadosPasseio: NovoPasseioFormData) => {
    try {
      const { data, error } = await supabase
        .from('passeios')
        .insert({
          nome: dadosPasseio.nome,
          valor: dadosPasseio.valor,
          custo_operacional: dadosPasseio.custo_operacional,
          categoria: dadosPasseio.categoria,
          ativo: true
        })
        .select()
        .single();

      if (error) throw error;

      // Adicionar ao estado local
      const novoPasseioComCalculos = calcularMetricas(data);
      setPasseios(prev => [...prev, novoPasseioComCalculos]);

      toast.success('Passeio adicionado com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao adicionar passeio:', error);
      toast.error('Erro ao adicionar novo passeio');
      throw error;
    }
  };

  // Deletar passeio (apenas personalizados)
  const deletarPasseio = async (passeioId: string) => {
    try {
      const { error } = await supabase
        .from('passeios')
        .delete()
        .eq('id', passeioId);

      if (error) throw error;

      // Remover do estado local
      setPasseios(prev => prev.filter(p => p.id !== passeioId));

      toast.success('Passeio removido com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar passeio:', error);
      toast.error('Erro ao remover passeio');
    }
  };

  // Salvar todos os custos de uma vez
  const salvarTodosCustos = async () => {
    try {
      const updates = passeios
        .filter(p => p.categoria === 'pago')
        .map(p => ({
          id: p.id,
          custo_operacional: p.custo_operacional
        }));

      for (const update of updates) {
        const { error } = await supabase
          .from('passeios')
          .update({ custo_operacional: update.custo_operacional })
          .eq('id', update.id);

        if (error) throw error;
      }

      toast.success('Todos os custos foram salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar custos:', error);
      toast.error('Erro ao salvar configurações');
    }
  };

  // Buscar informações de vendas de passeios por viagem
  const buscarVendasPorViagem = async (viagemId: string): Promise<PasseioVendaInfo[]> => {
    try {
      const { data, error } = await supabase
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

      if (error) throw error;

      // Agrupar por passeio e calcular totais
      const vendasAgrupadas = (data || []).reduce((acc: Record<string, any>, item: any) => {
        const passeioId = item.passeios.id;
        const nome = item.passeios.nome;
        const custoUnitario = item.passeios.custo_operacional || 0;
        const receitaUnitaria = item.valor_cobrado || 0;

        if (!acc[passeioId]) {
          acc[passeioId] = {
            passeio_id: passeioId,
            nome: nome,
            quantidade_vendida: 0,
            receita_total: 0,
            custo_total: 0,
            lucro_total: 0,
            margem_percentual: 0
          };
        }

        acc[passeioId].quantidade_vendida += 1;
        acc[passeioId].receita_total += receitaUnitaria;
        acc[passeioId].custo_total += custoUnitario;

        return acc;
      }, {});

      // Calcular lucros e margens
      const resultado = Object.values(vendasAgrupadas).map((venda: any) => {
        venda.lucro_total = venda.receita_total - venda.custo_total;
        venda.margem_percentual = venda.receita_total > 0 
          ? (venda.lucro_total / venda.receita_total) * 100 
          : 0;
        return venda;
      });

      return resultado as PasseioVendaInfo[];
    } catch (error) {
      console.error('Erro ao buscar vendas por viagem:', error);
      return [];
    }
  };

  // ✨ NOVA FUNÇÃO: Gerar despesas virtuais dos passeios para exibição
  const gerarDespesasVirtuaisPasseios = async (viagemId: string) => {
    try {
      const vendasPasseios = await buscarVendasPorViagem(viagemId);
      
      // Converter vendas em formato de despesas para exibição
      const despesasVirtuais = vendasPasseios
        .filter(venda => venda.custo_total > 0) // Só mostrar se houver custo
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
          isVirtual: true // Flag para identificar despesas virtuais
        }));

      return despesasVirtuais;
    } catch (error) {
      console.error('Erro ao gerar despesas virtuais:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchPasseios();
  }, [fetchPasseios]);

  return {
    // Estados
    passeios,
    resumo,
    loading,
    error,
    
    // Funções
    fetchPasseios,
    atualizarCusto,
    atualizarValor,
    adicionarPasseio,
    deletarPasseio,
    salvarTodosCustos,
    buscarVendasPorViagem,
    gerarDespesasVirtuaisPasseios,
    
    // Utilitários
    calcularMetricas
  };
};