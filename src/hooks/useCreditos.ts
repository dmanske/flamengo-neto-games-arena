import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  Credito, 
  FiltrosCreditos, 
  CreditoFormData, 
  EstadosCreditos,
  ResumoCreditos 
} from '@/types/creditos';
import { agruparCreditosPorMes } from '@/utils/creditoUtils';

export function useCreditos() {
  const [creditos, setCreditos] = useState<Credito[]>([]);
  const [resumo, setResumo] = useState<ResumoCreditos | null>(null);
  const [estados, setEstados] = useState<EstadosCreditos>({
    carregando: false,
    erro: null,
    salvando: false,
    deletando: false,
  });

  // Buscar créditos com filtros
  const buscarCreditos = useCallback(async (filtros: FiltrosCreditos = {}) => {
    try {
      setEstados(prev => ({ ...prev, carregando: true, erro: null }));

      let query = supabase
        .from('cliente_creditos')
        .select(`
          *,
          cliente:clientes(id, nome, telefone, email),
          vinculacoes:credito_viagem_vinculacoes(
            id,
            viagem_id,
            valor_utilizado,
            data_vinculacao,
            viagem:viagens(id, adversario, data_jogo, valor_padrao)
          )
        `)
        .order('data_pagamento', { ascending: false });

      // Aplicar filtros
      if (filtros.cliente_id) {
        query = query.eq('cliente_id', filtros.cliente_id);
      }
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }
      if (filtros.tipo_credito) {
        query = query.eq('tipo_credito', filtros.tipo_credito);
      }
      if (filtros.data_inicio) {
        query = query.gte('data_pagamento', filtros.data_inicio);
      }
      if (filtros.data_fim) {
        query = query.lte('data_pagamento', filtros.data_fim);
      }
      if (filtros.valor_minimo) {
        query = query.gte('valor_credito', filtros.valor_minimo);
      }
      if (filtros.valor_maximo) {
        query = query.lte('valor_credito', filtros.valor_maximo);
      }

      const { data, error } = await query;

      if (error) throw error;

      setCreditos(data || []);
    } catch (error) {
      console.error('Erro ao buscar créditos:', error);
      setEstados(prev => ({ ...prev, erro: 'Erro ao carregar créditos' }));
      toast.error('Erro ao carregar créditos');
    } finally {
      setEstados(prev => ({ ...prev, carregando: false }));
    }
  }, []);

  // Buscar resumo financeiro
  const buscarResumo = useCallback(async (filtros: FiltrosCreditos = {}) => {
    try {
      let query = supabase
        .from('cliente_creditos')
        .select('valor_credito, saldo_disponivel, status, tipo_credito');

      // Aplicar mesmos filtros
      if (filtros.cliente_id) {
        query = query.eq('cliente_id', filtros.cliente_id);
      }
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }
      if (filtros.tipo_credito) {
        query = query.eq('tipo_credito', filtros.tipo_credito);
      }
      if (filtros.data_inicio) {
        query = query.gte('data_pagamento', filtros.data_inicio);
      }
      if (filtros.data_fim) {
        query = query.lte('data_pagamento', filtros.data_fim);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calcular resumo
      const resumoCalculado = (data || []).reduce((acc, credito) => {
        acc.total_creditos++;
        acc.valor_total += credito.valor_credito;
        acc.valor_disponivel += credito.saldo_disponivel;
        acc.valor_utilizado += (credito.valor_credito - credito.saldo_disponivel);
        
        if (credito.status === 'reembolsado') {
          acc.valor_reembolsado += credito.valor_credito;
        }

        // Contar por status
        acc.creditos_por_status[credito.status]++;
        
        // Contar por tipo
        acc.creditos_por_tipo[credito.tipo_credito]++;

        return acc;
      }, {
        total_creditos: 0,
        valor_total: 0,
        valor_disponivel: 0,
        valor_utilizado: 0,
        valor_reembolsado: 0,
        creditos_por_status: {
          disponivel: 0,
          utilizado: 0,
          parcial: 0,
          reembolsado: 0,
        },
        creditos_por_tipo: {
          viagem_completa: 0,
          passeios: 0,
          geral: 0,
        },
      });

      setResumo(resumoCalculado);
    } catch (error) {
      console.error('Erro ao buscar resumo:', error);
    }
  }, []);

  // Criar novo crédito
  const criarCredito = useCallback(async (dados: CreditoFormData): Promise<boolean> => {
    try {
      setEstados(prev => ({ ...prev, salvando: true, erro: null }));

      const { data, error } = await supabase
        .from('cliente_creditos')
        .insert({
          ...dados,
          saldo_disponivel: dados.valor_credito, // Inicialmente, saldo = valor total
          status: 'disponivel',
        })
        .select()
        .single();

      if (error) throw error;

      // Criar entrada no histórico
      await supabase
        .from('credito_historico')
        .insert({
          credito_id: data.id,
          tipo_movimentacao: 'criacao',
          valor_movimentado: dados.valor_credito,
          valor_posterior: dados.valor_credito,
          descricao: `Crédito criado no valor de R$ ${dados.valor_credito.toFixed(2)}`,
        });

      toast.success('Crédito criado com sucesso!');
      
      // Recarregar dados
      await buscarCreditos();
      await buscarResumo();
      
      return true;
    } catch (error) {
      console.error('Erro ao criar crédito:', error);
      setEstados(prev => ({ ...prev, erro: 'Erro ao criar crédito' }));
      toast.error('Erro ao criar crédito');
      return false;
    } finally {
      setEstados(prev => ({ ...prev, salvando: false }));
    }
  }, [buscarCreditos, buscarResumo]);

  // Editar crédito
  const editarCredito = useCallback(async (id: string, dados: Partial<CreditoFormData>): Promise<boolean> => {
    try {
      setEstados(prev => ({ ...prev, salvando: true, erro: null }));

      const { error } = await supabase
        .from('cliente_creditos')
        .update({
          ...dados,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Crédito atualizado com sucesso!');
      
      // Recarregar dados
      await buscarCreditos();
      await buscarResumo();
      
      return true;
    } catch (error) {
      console.error('Erro ao editar crédito:', error);
      setEstados(prev => ({ ...prev, erro: 'Erro ao editar crédito' }));
      toast.error('Erro ao editar crédito');
      return false;
    } finally {
      setEstados(prev => ({ ...prev, salvando: false }));
    }
  }, [buscarCreditos, buscarResumo]);

  // Deletar crédito
  const deletarCredito = useCallback(async (id: string): Promise<boolean> => {
    try {
      setEstados(prev => ({ ...prev, deletando: true, erro: null }));

      // Verificar se crédito tem vinculações
      const { data: vinculacoes } = await supabase
        .from('credito_viagem_vinculacoes')
        .select('id')
        .eq('credito_id', id);

      if (vinculacoes && vinculacoes.length > 0) {
        toast.error('Não é possível deletar crédito que já foi utilizado');
        return false;
      }

      const { error } = await supabase
        .from('cliente_creditos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Crédito deletado com sucesso!');
      
      // Recarregar dados
      await buscarCreditos();
      await buscarResumo();
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar crédito:', error);
      setEstados(prev => ({ ...prev, erro: 'Erro ao deletar crédito' }));
      toast.error('Erro ao deletar crédito');
      return false;
    } finally {
      setEstados(prev => ({ ...prev, deletando: false }));
    }
  }, [buscarCreditos, buscarResumo]);

  // Buscar crédito por ID
  const buscarCreditoPorId = useCallback(async (id: string): Promise<Credito | null> => {
    try {
      const { data, error } = await supabase
        .from('cliente_creditos')
        .select(`
          *,
          cliente:clientes(id, nome, telefone, email),
          vinculacoes:credito_viagem_vinculacoes(
            id,
            viagem_id,
            valor_utilizado,
            data_vinculacao,
            observacoes,
            viagem:viagens(id, adversario, data_jogo, valor_padrao)
          ),
          historico:credito_historico(
            id,
            tipo_movimentacao,
            valor_anterior,
            valor_movimentado,
            valor_posterior,
            descricao,
            created_at,
            viagem:viagens(id, adversario, data_jogo)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao buscar crédito:', error);
      return null;
    }
  }, []);

  // Agrupar créditos por mês
  const creditosAgrupados = agruparCreditosPorMes(creditos);

  // Carregar dados iniciais
  useEffect(() => {
    buscarCreditos();
    buscarResumo();
  }, [buscarCreditos, buscarResumo]);

  return {
    creditos,
    creditosAgrupados,
    resumo,
    estados,
    buscarCreditos,
    buscarResumo,
    criarCredito,
    editarCredito,
    deletarCredito,
    buscarCreditoPorId,
  };
}