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
        .select('valor_credito, saldo_disponivel, status');

      // Aplicar mesmos filtros
      if (filtros.cliente_id) {
        query = query.eq('cliente_id', filtros.cliente_id);
      }
      if (filtros.status) {
        query = query.eq('status', filtros.status);
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

      // ✅ NOVO: Verificar referências em viagem_passageiros primeiro
      const { data: passageirosVinculados, error: passageirosError } = await supabase
        .from('viagem_passageiros')
        .select(`
          id, 
          cliente_id,
          viagem_id,
          viagens(adversario, data_jogo),
          clientes(nome)
        `)
        .eq('credito_origem_id', id);

      if (passageirosError) {
        console.error('❌ Erro ao verificar passageiros vinculados:', passageirosError);
        throw passageirosError;
      }

      console.log('🔍 [DEBUG] Passageiros vinculados ao crédito:', passageirosVinculados);

      // Se há passageiros vinculados, não permitir exclusão direta
      if (passageirosVinculados && passageirosVinculados.length > 0) {
        const nomes = passageirosVinculados.map(p => p.clientes?.nome || 'Nome não encontrado');
        const viagens = passageirosVinculados.map(p => 
          `${p.viagens?.adversario || 'Viagem'} - ${new Date(p.viagens?.data_jogo || '').toLocaleDateString('pt-BR')}`
        );
        
        toast.error('❌ Não é possível deletar este crédito', {
          description: `Este crédito está sendo usado por ${passageirosVinculados.length} passageiro(s) em viagens. Remova os passageiros das viagens primeiro.`,
          duration: 8000
        });

        // Mostrar detalhes no console para debug
        console.log('🚫 Crédito não pode ser deletado. Passageiros vinculados:', {
          passageiros: nomes,
          viagens: viagens,
          total: passageirosVinculados.length
        });

        return false;
      }

      // Buscar vinculações do crédito para mostrar confirmação (tabela de histórico)
      const { data: vinculacoes, error: vinculacoesError } = await supabase
        .from('credito_viagem_vinculacoes')
        .select('id, passageiro_id, valor_utilizado, viagem_id')
        .eq('credito_id', id);

      if (vinculacoesError) throw vinculacoesError;

      console.log('🔍 [DEBUG] Vinculações históricas encontradas:', vinculacoes);

      if (vinculacoes && vinculacoes.length > 0) {
        // Perguntar se o usuário quer continuar mesmo com histórico
        const confirmar = window.confirm(
          `Este crédito tem histórico de uso em ${vinculacoes.length} vinculação(ões). ` +
          `O histórico será mantido, mas o crédito será removido. ` +
          `Deseja continuar?`
        );

        if (!confirmar) {
          return false;
        }
      }

      // 2. Coletar IDs das viagens afetadas antes de deletar vinculações
      const viagensAfetadas = [...new Set(vinculacoes?.map(v => v.viagem_id) || [])];
      console.log('🔔 [DEBUG] Viagens que serão afetadas pela remoção do crédito:', viagensAfetadas);
      console.log('🔔 [DEBUG] Detalhes das vinculações:', vinculacoes);

      // ✅ NOVO: Abordagem simplificada - apenas deletar o crédito se não há referências ativas
      console.log('🔧 [DEBUG] Tentando deletar crédito diretamente...');
      
      const { error: deleteCreditoError } = await supabase
        .from('cliente_creditos')
        .delete()
        .eq('id', id);

      if (deleteCreditoError) {
        console.error('❌ [DEBUG] Erro ao deletar crédito:', deleteCreditoError);
        
        // Se for erro de foreign key, dar mensagem mais clara
        if (deleteCreditoError.code === '23503') {
          toast.error('❌ Não é possível deletar este crédito', {
            description: 'Este crédito está sendo referenciado por passageiros em viagens. Remova os passageiros das viagens primeiro.',
            duration: 8000
          });
        } else {
          toast.error('Erro ao deletar crédito: ' + deleteCreditoError.message);
        }
        
        return false;
      }

      console.log('✅ [DEBUG] Crédito deletado com sucesso!');
        
        // Disparar eventos para atualizar as telas
        viagensAfetadas.forEach(viagemId => {
          console.log('🔔 Disparando evento viagemPassageiroRemovido para viagem:', viagemId);
          
          const event = new CustomEvent('viagemPassageiroRemovido', {
            detail: { 
              viagemId,
              creditoId: id,
              action: 'credito_deletado',
              timestamp: Date.now()
            }
          });
          window.dispatchEvent(event);

          localStorage.setItem('viagemNeedsReload', JSON.stringify({
            viagemId,
            creditoId: id,
            action: 'credito_deletado',
            timestamp: Date.now()
          }));
        });

        toast.success('Crédito deletado com sucesso!', {
          description: vinculacoes && vinculacoes.length > 0 
            ? `${vinculacoes.length} passageiro(s) removido(s) das viagens correspondentes.`
            : undefined
        });
        
        // Recarregar dados
        await buscarCreditos();
        await buscarResumo();
        
        return true;
    } catch (error: any) {
      console.error('Erro ao deletar crédito:', error);
      setEstados(prev => ({ ...prev, erro: 'Erro ao deletar crédito' }));
      
      // Tratamento específico para erro de foreign key
      if (error.code === '23503') {
        toast.error('❌ Não é possível deletar este crédito', {
          description: 'Este crédito está sendo usado por passageiros em viagens. Remova os passageiros das viagens primeiro.',
          duration: 8000
        });
      } else {
        toast.error('Erro ao deletar crédito: ' + (error.message || 'Erro desconhecido'));
      }
      
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

  // Agrupar créditos por cliente (nova funcionalidade)
  const creditosAgrupadosPorCliente = useCallback(() => {
    const grupos = creditos.reduce((acc, credito) => {
      const clienteId = credito.cliente_id;
      const clienteNome = credito.cliente?.nome || 'Cliente não encontrado';
      
      if (!acc[clienteId]) {
        acc[clienteId] = {
          cliente: credito.cliente,
          creditos: [],
          resumo: {
            total_creditos: 0,
            valor_total: 0,
            valor_disponivel: 0,
            valor_utilizado: 0,
            creditos_por_status: {
              disponivel: 0,
              utilizado: 0,
              parcial: 0,
              reembolsado: 0,
            }
          }
        };
      }
      
      acc[clienteId].creditos.push(credito);
      acc[clienteId].resumo.total_creditos++;
      acc[clienteId].resumo.valor_total += credito.valor_credito;
      acc[clienteId].resumo.valor_disponivel += credito.saldo_disponivel;
      acc[clienteId].resumo.valor_utilizado += (credito.valor_credito - credito.saldo_disponivel);
      acc[clienteId].resumo.creditos_por_status[credito.status]++;
      
      return acc;
    }, {} as Record<string, any>);

    // Converter para array e ordenar por nome do cliente
    return Object.values(grupos).sort((a: any, b: any) => {
      return (a.cliente?.nome || '').localeCompare(b.cliente?.nome || '');
    });
  }, [creditos]);

  // Carregar dados iniciais
  useEffect(() => {
    buscarCreditos();
    buscarResumo();
  }, [buscarCreditos, buscarResumo]);

  // Função para buscar ônibus com vagas disponíveis
  const buscarOnibusComVagas = useCallback(async (viagemId: string) => {
    try {
      // Buscar ônibus da viagem com contagem de passageiros
      const { data: onibusData, error: onibusError } = await supabase
        .from('viagem_onibus')
        .select(`
          id,
          numero_identificacao,
          tipo_onibus,
          empresa,
          capacidade_onibus,
          lugares_extras
        `)
        .eq('viagem_id', viagemId)
        .order('numero_identificacao');

      if (onibusError) throw onibusError;

      if (!onibusData || onibusData.length === 0) {
        return [];
      }

      // Para cada ônibus, contar passageiros alocados
      const onibusComVagas = await Promise.all(
        onibusData.map(async (onibus) => {
          const { data: passageiros, error: passageirosError } = await supabase
            .from('viagem_passageiros')
            .select('id')
            .eq('viagem_id', viagemId)
            .eq('onibus_id', onibus.id);

          if (passageirosError) {
            console.warn('Erro ao contar passageiros do ônibus:', passageirosError);
          }

          const capacidadeTotal = onibus.capacidade_onibus + (onibus.lugares_extras || 0);
          const passageirosAlocados = passageiros?.length || 0;
          const vagasDisponiveis = capacidadeTotal - passageirosAlocados;

          return {
            id: onibus.id,
            nome: onibus.numero_identificacao || `${onibus.tipo_onibus} - ${onibus.empresa}`,
            tipo_onibus: onibus.tipo_onibus,
            empresa: onibus.empresa,
            capacidade_total: capacidadeTotal,
            passageiros_alocados: passageirosAlocados,
            vagas_disponiveis: vagasDisponiveis,
            tem_vagas: vagasDisponiveis > 0
          };
        })
      );

      // Filtrar apenas ônibus com vagas e ordenar por mais vagas
      const onibusDisponiveis = onibusComVagas
        .filter(onibus => onibus.tem_vagas)
        .sort((a, b) => b.vagas_disponiveis - a.vagas_disponiveis);

      return onibusDisponiveis;

    } catch (error) {
      console.error('Erro ao buscar ônibus com vagas:', error);
      return [];
    }
  }, []);

  // Função para vincular crédito com viagem
  const vincularCreditoComViagem = useCallback(async (dados: {
    creditoId: string;
    viagemId: string;
    passageiroId: string;
    valorUtilizado: number;
    tipoPassageiro: 'titular' | 'outro';
    passeiosSelecionados?: string[];
    onibusId?: string; // ✅ NOVO: ID do ônibus selecionado obrigatoriamente
  }): Promise<boolean> => {
    try {
      setEstados(prev => ({ ...prev, salvando: true, erro: null }));

      const { creditoId, viagemId, passageiroId, valorUtilizado, tipoPassageiro, passeiosSelecionados = [], onibusId } = dados;

      // ✅ VALIDAÇÃO: Ônibus deve ser selecionado obrigatoriamente
      if (!onibusId) {
        throw new Error('Seleção de ônibus é obrigatória');
      }

      // 1. Verificar se o crédito tem saldo suficiente
      const { data: creditoAtual, error: errorCredito } = await supabase
        .from('cliente_creditos')
        .select('saldo_disponivel, valor_credito, cliente_id')
        .eq('id', creditoId)
        .single();

      if (errorCredito || !creditoAtual) {
        throw new Error('Crédito não encontrado');
      }

      if (creditoAtual.saldo_disponivel < valorUtilizado) {
        throw new Error('Saldo insuficiente no crédito');
      }

      // 2. Buscar dados da viagem
      const { data: viagem, error: errorViagem } = await supabase
        .from('viagens')
        .select('valor_padrao, adversario')
        .eq('id', viagemId)
        .single();

      if (errorViagem || !viagem) {
        throw new Error('Viagem não encontrada');
      }

      // 3. Verificar se passageiro já está na viagem
      const { data: passageiroExistente } = await supabase
        .from('viagem_passageiros')
        .select('id')
        .eq('viagem_id', viagemId)
        .eq('cliente_id', passageiroId)
        .maybeSingle();

      let passageiroViagemId;

      if (passageiroExistente) {
        // Atualizar passageiro existente
        const novoStatus = valorUtilizado >= viagem.valor_padrao ? 'Pago Completo' : 'Parcial';
        
        const { error: errorUpdate } = await supabase
          .from('viagem_passageiros')
          .update({
            status_pagamento: novoStatus,
            pago_por_credito: true,
            credito_origem_id: creditoId,
            valor_credito_utilizado: valorUtilizado
          })
          .eq('id', passageiroExistente.id);

        if (errorUpdate) throw errorUpdate;
        passageiroViagemId = passageiroExistente.id;
      } else {
        // ❌ REMOVIDO: Alocação automática sem verificar vagas
        // Agora a seleção de ônibus é obrigatória no modal
        // const { data: onibusDisponivel } = await supabase...

        // Criar novo passageiro na viagem
        const novoStatus = valorUtilizado >= viagem.valor_padrao ? 'Pago Completo' : 'Parcial';
        
        const { data: novoPassageiro, error: errorInsert } = await supabase
          .from('viagem_passageiros')
          .insert({
            viagem_id: viagemId,
            cliente_id: passageiroId,              // ← Quem vai viajar (beneficiário)
            status_pagamento: novoStatus,
            pago_por_credito: true,
            credito_origem_id: creditoId,          // ← Referência ao crédito do titular
            valor_credito_utilizado: valorUtilizado,
            onibus_id: onibusId, // ✅ NOVO: Ônibus selecionado obrigatoriamente no modal
            gratuito: false
          })
          .select('id')
          .single();

        if (errorInsert) throw errorInsert;
        passageiroViagemId = novoPassageiro.id;
      }

      // 3.5. Registrar passeios selecionados para o passageiro
      if (passeiosSelecionados.length > 0) {
        // Primeiro, remover passeios existentes do passageiro para esta viagem
        await supabase
          .from('passageiro_passeios')
          .delete()
          .eq('viagem_passageiro_id', passageiroViagemId);

        // Inserir novos passeios
        const passageiroPasseios = passeiosSelecionados.map(passeioId => ({
          viagem_passageiro_id: passageiroViagemId,
          passeio_id: passeioId,
          status: 'confirmado',
          valor_cobrado: 0 // Será calculado baseado no valor do passeio
        }));

        const { error: errorPasseios } = await supabase
          .from('passageiro_passeios')
          .insert(passageiroPasseios);

        if (errorPasseios) {
          console.warn('Erro ao registrar passeios:', errorPasseios);
          // Não falha a operação, apenas registra o aviso
        }
      }

      // 4. Atualizar saldo do crédito
      const novoSaldo = creditoAtual.saldo_disponivel - valorUtilizado;
      let novoStatus = 'disponivel';
      
      if (novoSaldo === 0) {
        novoStatus = 'utilizado';
      } else if (novoSaldo < creditoAtual.valor_credito) {
        novoStatus = 'parcial';
      }

      const { error: errorCreditoUpdate } = await supabase
        .from('cliente_creditos')
        .update({
          saldo_disponivel: novoSaldo,
          status: novoStatus
        })
        .eq('id', creditoId);

      if (errorCreditoUpdate) throw errorCreditoUpdate;

      // 5. Criar registro de vinculação - SEMPRE ao titular do crédito
      const { error: errorVinculacao } = await supabase
        .from('credito_viagem_vinculacoes')
        .insert({
          credito_id: creditoId,
          viagem_id: viagemId,
          passageiro_id: creditoAtual.cliente_id,  // ← SEMPRE o titular do crédito!
          valor_utilizado: valorUtilizado,
          observacoes: `Crédito utilizado para ${tipoPassageiro === 'titular' ? 'titular' : 'beneficiário'} - ${viagem.adversario}`
        });

      if (errorVinculacao) throw errorVinculacao;

      // 6. Criar entrada no histórico
      await supabase
        .from('credito_historico')
        .insert({
          credito_id: creditoId,
          tipo_movimentacao: 'utilizacao',
          valor_anterior: creditoAtual.saldo_disponivel,
          valor_movimentado: valorUtilizado,
          valor_posterior: novoSaldo,
          descricao: `Crédito utilizado na viagem ${viagem.adversario} - Valor: R$ ${valorUtilizado.toFixed(2)}`,
          viagem_id: viagemId
        });

      toast.success('Crédito vinculado com sucesso!');
      
      // Recarregar dados
      await buscarCreditos();
      await buscarResumo();
      
      return true;
    } catch (error) {
      console.error('Erro ao vincular crédito:', error);
      const mensagem = error instanceof Error ? error.message : 'Erro ao vincular crédito';
      setEstados(prev => ({ ...prev, erro: mensagem }));
      toast.error(mensagem);
      return false;
    } finally {
      setEstados(prev => ({ ...prev, salvando: false }));
    }
  }, [buscarCreditos, buscarResumo]);

  // Desvincular passageiro da viagem (desistência)
  const desvincularPassageiroViagem = useCallback(async (viagemPassageiroId: string): Promise<boolean> => {
    try {
      setEstados(prev => ({ ...prev, salvando: true, erro: null }));

      console.log('🔄 [DEBUG] Desvinculando passageiro da viagem:', viagemPassageiroId);

      // Chamar função SQL
      const { data, error } = await supabase
        .rpc('desvincular_passageiro_viagem', { p_viagem_passageiro_id: viagemPassageiroId });

      if (error) {
        console.error('❌ [DEBUG] Erro na função SQL:', error);
        throw error;
      }

      console.log('✅ [DEBUG] Desvinculação realizada com sucesso:', data);

      // Disparar evento para atualizar a tela da viagem
      const viagemId = data.viagem_id; // Assumindo que a função retorna o viagem_id
      if (viagemId) {
        console.log('🔔 Disparando evento viagemPassageiroRemovido para viagem:', viagemId);
        
        const event = new CustomEvent('viagemPassageiroRemovido', {
          detail: { 
            viagemId,
            passageiroId: viagemPassageiroId,
            action: 'passageiro_desvinculado',
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(event);

        localStorage.setItem('viagemNeedsReload', JSON.stringify({
          viagemId,
          passageiroId: viagemPassageiroId,
          action: 'passageiro_desvinculado',
          timestamp: Date.now()
        }));
      }

      toast.success('Passageiro desvinculado com sucesso!', {
        description: `${data.cliente_nome} foi removido da viagem ${data.viagem_nome}. Crédito de R$ ${data.valor_restaurado.toFixed(2)} restaurado.`
      });

      // Recarregar dados dos créditos
      await buscarCreditos();
      await buscarResumo();

      return true;
    } catch (error) {
      console.error('Erro ao desvincular passageiro:', error);
      const mensagem = error instanceof Error ? error.message : 'Erro ao desvincular passageiro';
      setEstados(prev => ({ ...prev, erro: mensagem }));
      toast.error(mensagem);
      return false;
    } finally {
      setEstados(prev => ({ ...prev, salvando: false }));
    }
  }, [buscarCreditos, buscarResumo]);

  return {
    creditos,
    creditosAgrupados,
    creditosAgrupadosPorCliente: creditosAgrupadosPorCliente(),
    resumo,
    estados,
    buscarCreditos,
    buscarResumo,
    criarCredito,
    editarCredito,
    deletarCredito,
    buscarCreditoPorId,
    buscarOnibusComVagas,
    vincularCreditoComViagem,
    desvincularPassageiroViagem,
  };
}