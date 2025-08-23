import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  Ingresso, 
  IngressoFormData, 
  FiltrosIngressos, 
  OrdenacaoIngressos,
  ResumoFinanceiroIngressos,
  EstadosIngressos,
  ErrosIngressos
} from '@/types/ingressos';

export function useIngressos() {
  const [ingressos, setIngressos] = useState<Ingresso[]>([]);
  const [resumoFinanceiro, setResumoFinanceiro] = useState<ResumoFinanceiroIngressos | null>(null);
  const [estados, setEstados] = useState<EstadosIngressos>({
    carregando: false,
    salvando: false,
    deletando: false,
    carregandoPagamentos: false,
    salvandoPagamento: false,
    deletandoPagamento: false
  });
  const [erros, setErros] = useState<ErrosIngressos>({});

  // Função para buscar ingressos
  const buscarIngressos = useCallback(async (
    filtros?: FiltrosIngressos,
    ordenacao?: OrdenacaoIngressos,
    limite?: number,
    offset?: number
  ) => {
    setEstados(prev => ({ ...prev, carregando: true }));
    setErros({});

    try {
      let query = supabase
        .from('ingressos')
        .select(`
          *,
          cliente:clientes(id, nome, telefone, email),
          viagem:viagens(id, adversario, data_jogo)
        `);

      // Aplicar filtros
      if (filtros) {
        if (filtros.cliente_id) {
          query = query.eq('cliente_id', filtros.cliente_id);
        }
        if (filtros.situacao_financeira) {
          query = query.eq('situacao_financeira', filtros.situacao_financeira);
        }
        if (filtros.local_jogo) {
          query = query.eq('local_jogo', filtros.local_jogo);
        }
        if (filtros.data_inicio) {
          query = query.gte('jogo_data', filtros.data_inicio);
        }
        if (filtros.data_fim) {
          query = query.lte('jogo_data', filtros.data_fim);
        }
        if (filtros.adversario) {
          query = query.ilike('adversario', `%${filtros.adversario}%`);
        }
        if (filtros.setor_estadio) {
          query = query.ilike('setor_estadio', `%${filtros.setor_estadio}%`);
        }
      }

      // Aplicar ordenação
      if (ordenacao) {
        const { campo, direcao } = ordenacao;
        if (campo === 'cliente_nome') {
          // Para ordenar por nome do cliente, precisamos fazer join
          query = query.order('cliente.nome', { ascending: direcao === 'asc' });
        } else {
          query = query.order(campo, { ascending: direcao === 'asc' });
        }
      } else {
        // Ordenação padrão: mais recentes primeiro
        query = query.order('jogo_data', { ascending: false });
      }

      // Aplicar paginação
      if (limite) {
        query = query.limit(limite);
      }
      if (offset) {
        query = query.range(offset, offset + (limite || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar ingressos:', error);
        setErros({ geral: 'Erro ao carregar ingressos' });
        toast.error('Erro ao carregar ingressos');
        return;
      }

      setIngressos(data || []);
    } catch (error) {
      console.error('Erro inesperado ao buscar ingressos:', error);
      setErros({ geral: 'Erro inesperado ao carregar ingressos' });
      toast.error('Erro inesperado ao carregar ingressos');
    } finally {
      setEstados(prev => ({ ...prev, carregando: false }));
    }
  }, []);

  // Função para buscar resumo financeiro
  const buscarResumoFinanceiro = useCallback(async (filtros?: FiltrosIngressos) => {
    try {
      let query = supabase.from('ingressos').select('*');

      // Aplicar os mesmos filtros da busca principal
      if (filtros) {
        if (filtros.cliente_id) query = query.eq('cliente_id', filtros.cliente_id);
        if (filtros.situacao_financeira) query = query.eq('situacao_financeira', filtros.situacao_financeira);
        if (filtros.local_jogo) query = query.eq('local_jogo', filtros.local_jogo);
        if (filtros.data_inicio) query = query.gte('jogo_data', filtros.data_inicio);
        if (filtros.data_fim) query = query.lte('jogo_data', filtros.data_fim);
        if (filtros.adversario) query = query.ilike('adversario', `%${filtros.adversario}%`);
        if (filtros.setor_estadio) query = query.ilike('setor_estadio', `%${filtros.setor_estadio}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar resumo financeiro:', error);
        return;
      }

      if (data) {
        const resumo: ResumoFinanceiroIngressos = {
          total_ingressos: data.length,
          total_receita: data.reduce((sum, ing) => sum + ing.valor_final, 0),
          total_custo: data.reduce((sum, ing) => sum + ing.preco_custo, 0),
          total_lucro: data.reduce((sum, ing) => sum + ing.lucro, 0),
          margem_media: data.length > 0 
            ? data.reduce((sum, ing) => sum + ing.margem_percentual, 0) / data.length 
            : 0,
          ingressos_pendentes: data.filter(ing => ing.situacao_financeira === 'pendente').length,
          ingressos_pagos: data.filter(ing => ing.situacao_financeira === 'pago').length,
          ingressos_cancelados: data.filter(ing => ing.situacao_financeira === 'cancelado').length,
          valor_pendente: data
            .filter(ing => ing.situacao_financeira === 'pendente')
            .reduce((sum, ing) => sum + ing.valor_final, 0),
          valor_recebido: data
            .filter(ing => ing.situacao_financeira === 'pago')
            .reduce((sum, ing) => sum + ing.valor_final, 0)
        };

        setResumoFinanceiro(resumo);
      }
    } catch (error) {
      console.error('Erro ao calcular resumo financeiro:', error);
    }
  }, []);

  // Função para criar ingresso
  const criarIngresso = useCallback(async (dados: IngressoFormData): Promise<boolean> => {
    setEstados(prev => ({ ...prev, salvando: true }));
    setErros({});

    try {
      const { data, error } = await supabase
        .from('ingressos')
        .insert([dados])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar ingresso:', error);
        setErros({ geral: 'Erro ao salvar ingresso' });
        toast.error('Erro ao salvar ingresso');
        return false;
      }

      toast.success('Ingresso cadastrado com sucesso!');
      
      // Recarregar lista
      await buscarIngressos();
      await buscarResumoFinanceiro();
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao criar ingresso:', error);
      setErros({ geral: 'Erro inesperado ao salvar ingresso' });
      toast.error('Erro inesperado ao salvar ingresso');
      return false;
    } finally {
      setEstados(prev => ({ ...prev, salvando: false }));
    }
  }, [buscarIngressos, buscarResumoFinanceiro]);

  // Função para atualizar ingresso
  const atualizarIngresso = useCallback(async (id: string, dados: Partial<IngressoFormData>): Promise<boolean> => {
    setEstados(prev => ({ ...prev, salvando: true }));
    setErros({});

    try {
      const { error } = await supabase
        .from('ingressos')
        .update(dados)
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar ingresso:', error);
        setErros({ geral: 'Erro ao atualizar ingresso' });
        toast.error('Erro ao atualizar ingresso');
        return false;
      }

      toast.success('Ingresso atualizado com sucesso!');
      
      // Recarregar lista
      await buscarIngressos();
      await buscarResumoFinanceiro();
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao atualizar ingresso:', error);
      setErros({ geral: 'Erro inesperado ao atualizar ingresso' });
      toast.error('Erro inesperado ao atualizar ingresso');
      return false;
    } finally {
      setEstados(prev => ({ ...prev, salvando: false }));
    }
  }, [buscarIngressos, buscarResumoFinanceiro]);

  // Função para deletar ingresso
  const deletarIngresso = useCallback(async (id: string): Promise<boolean> => {
    setEstados(prev => ({ ...prev, deletando: true }));
    setErros({});

    try {
      const { error } = await supabase
        .from('ingressos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar ingresso:', error);
        setErros({ geral: 'Erro ao deletar ingresso' });
        toast.error('Erro ao deletar ingresso');
        return false;
      }

      toast.success('Ingresso deletado com sucesso!');
      
      // Recarregar lista
      await buscarIngressos();
      await buscarResumoFinanceiro();
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao deletar ingresso:', error);
      setErros({ geral: 'Erro inesperado ao deletar ingresso' });
      toast.error('Erro inesperado ao deletar ingresso');
      return false;
    } finally {
      setEstados(prev => ({ ...prev, deletando: false }));
    }
  }, [buscarIngressos, buscarResumoFinanceiro]);

  // Função para buscar ingresso por ID
  const buscarIngressoPorId = useCallback(async (id: string): Promise<Ingresso | null> => {
    try {
      const { data, error } = await supabase
        .from('ingressos')
        .select(`
          *,
          cliente:clientes(id, nome, telefone, email),
          viagem:viagens(id, destino, data_ida)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar ingresso:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar ingresso:', error);
      return null;
    }
  }, []);

  // Função para calcular valores em tempo real
  const calcularValores = useCallback((precoVenda: number, desconto: number, precoCusto: number) => {
    const valorFinal = Math.max(0, precoVenda - desconto);
    const lucro = valorFinal - precoCusto;
    const margemPercentual = valorFinal > 0 ? (lucro / valorFinal) * 100 : 0;

    return {
      valorFinal,
      lucro,
      margemPercentual: Math.round(margemPercentual * 100) / 100 // 2 casas decimais
    };
  }, []);

  // Carregar ingressos na inicialização
  useEffect(() => {
    buscarIngressos();
    buscarResumoFinanceiro();
  }, [buscarIngressos, buscarResumoFinanceiro]);

  return {
    // Estados
    ingressos,
    resumoFinanceiro,
    estados,
    erros,

    // Funções principais
    buscarIngressos,
    buscarResumoFinanceiro,
    criarIngresso,
    atualizarIngresso,
    deletarIngresso,
    buscarIngressoPorId,

    // Utilitários
    calcularValores,

    // Funções de limpeza
    limparErros: () => setErros({}),
    limparIngressos: () => setIngressos([])
  };
}