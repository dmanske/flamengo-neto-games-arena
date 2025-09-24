import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { OnibusDisponivel } from '@/types/grupos-passageiros';
import type { Onibus } from '@/hooks/useViagemDetails';
import { validarTrocaOnibus, tratarErroSupabase, executarComRetry, MENSAGENS_ERRO } from '@/utils/validacoes-grupos';

interface UseTrocaOnibus {
  trocarPassageiro: (passageiroId: string, onibusDestinoId: string | null) => Promise<void>;
  trocarGrupoInteiro: (grupoNome: string, viagemId: string, onibusDestinoId: string | null) => Promise<void>;
  verificarCapacidade: (onibusId: string) => number;
  obterOnibusDisponiveis: (onibusList: Onibus[], passageirosCount: Record<string, number>) => OnibusDisponivel[];
  loading: boolean;
  error: string | null;
}

export function useTrocaOnibus(): UseTrocaOnibus {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trocar passageiro entre ônibus
  const trocarPassageiro = useCallback(async (passageiroId: string, onibusDestinoId: string | null) => {
    if (!passageiroId) {
      throw new Error('ID do passageiro é obrigatório');
    }

    setLoading(true);
    setError(null);

    try {
      await executarComRetry(async () => {
        // Buscar dados atuais do passageiro
        const { data: passageiroAtual, error: errorPassageiro } = await supabase
          .from('viagem_passageiros')
          .select('onibus_id, grupo_nome')
          .eq('id', passageiroId)
          .single();

        if (errorPassageiro) throw errorPassageiro;

        // Validar se a troca é necessária
        if (passageiroAtual?.onibus_id === onibusDestinoId) {
          toast.info('Passageiro já está neste ônibus');
          return;
        }

        // Se está movendo para um ônibus específico, validar capacidade
        if (onibusDestinoId) {
          const { data: onibusDestino, error: errorOnibus } = await supabase
            .from('viagem_onibus')
            .select('capacidade_onibus, lugares_extras')
            .eq('id', onibusDestinoId)
            .single();

          if (errorOnibus) throw errorOnibus;

          // Contar passageiros atuais no ônibus de destino
          const { count: passageirosAtuais, error: errorCount } = await supabase
            .from('viagem_passageiros')
            .select('*', { count: 'exact', head: true })
            .eq('onibus_id', onibusDestinoId);

          if (errorCount) throw errorCount;

          const capacidadeTotal = onibusDestino.capacidade_onibus + (onibusDestino.lugares_extras || 0);
          const ocupacaoAtual = passageirosAtuais || 0;

          // Usar validação centralizada
          const validacao = validarTrocaOnibus(
            capacidadeTotal,
            ocupacaoAtual,
            passageiroAtual?.onibus_id,
            onibusDestinoId
          );

          if (!validacao.valido) {
            throw new Error(validacao.erro);
          }

          // Mostrar aviso se houver
          if (validacao.aviso) {
            toast.warning(validacao.aviso);
          }
        }

        // Realizar a troca
        const { error: errorUpdate } = await supabase
          .from('viagem_passageiros')
          .update({ onibus_id: onibusDestinoId })
          .eq('id', passageiroId);

        if (errorUpdate) throw errorUpdate;

        // Mensagem de sucesso
        const nomeGrupo = passageiroAtual?.grupo_nome;
        const mensagem = onibusDestinoId 
          ? `Passageiro${nomeGrupo ? ` do grupo "${nomeGrupo}"` : ''} transferido com sucesso`
          : `Passageiro${nomeGrupo ? ` do grupo "${nomeGrupo}"` : ''} removido do ônibus`;
        
        toast.success(mensagem);

        // Disparar evento customizado para atualizar a interface
        window.dispatchEvent(new CustomEvent('passageiroTrocado', {
          detail: { passageiroId, onibusDestinoId }
        }));
      });

    } catch (err: any) {
      console.error('Erro ao trocar passageiro:', err);
      const errorMessage = tratarErroSupabase(err);
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar capacidade disponível de um ônibus
  const verificarCapacidade = useCallback((onibusId: string) => {
    // Esta função será implementada quando necessário
    // Por enquanto retorna 0 como placeholder
    return 0;
  }, []);

  // Obter lista de ônibus disponíveis com informações de capacidade
  const obterOnibusDisponiveis = useCallback((
    onibusList: Onibus[], 
    passageirosCount: Record<string, number>
  ): OnibusDisponivel[] => {
    return onibusList.map(onibus => {
      const ocupacao = passageirosCount[onibus.id] || 0;
      const capacidadeTotal = onibus.capacidade_onibus + (onibus.lugares_extras || 0);
      const disponivel = capacidadeTotal - ocupacao;
      const lotado = disponivel <= 0;

      return {
        id: onibus.id,
        nome: onibus.numero_identificacao || `${onibus.tipo_onibus} - ${onibus.empresa}`,
        capacidade: capacidadeTotal,
        ocupacao,
        disponivel,
        lotado
      };
    });
  }, []);

  // Trocar grupo inteiro entre ônibus
  const trocarGrupoInteiro = useCallback(async (grupoNome: string, viagemId: string, onibusDestinoId: string | null) => {
    if (!grupoNome || !viagemId) {
      throw new Error('Nome do grupo e ID da viagem são obrigatórios');
    }

    setLoading(true);
    setError(null);

    try {
      await executarComRetry(async () => {
        // Buscar todos os passageiros do grupo
        const { data: passageirosGrupo, error: errorBusca } = await supabase
          .from('viagem_passageiros')
          .select('id, onibus_id')
          .eq('viagem_id', viagemId)
          .eq('grupo_nome', grupoNome);

        if (errorBusca) throw errorBusca;

        if (!passageirosGrupo || passageirosGrupo.length === 0) {
          throw new Error('Nenhum passageiro encontrado no grupo');
        }

        // Se está movendo para um ônibus específico, verificar capacidade
        if (onibusDestinoId) {
          const { data: onibusDestino, error: errorOnibus } = await supabase
            .from('viagem_onibus')
            .select('capacidade_onibus, lugares_extras')
            .eq('id', onibusDestinoId)
            .single();

          if (errorOnibus) throw errorOnibus;

          // Contar passageiros atuais no ônibus de destino
          const { count: passageirosAtuais, error: errorCount } = await supabase
            .from('viagem_passageiros')
            .select('*', { count: 'exact', head: true })
            .eq('onibus_id', onibusDestinoId);

          if (errorCount) throw errorCount;

          const capacidadeTotal = onibusDestino.capacidade_onibus + (onibusDestino.lugares_extras || 0);
          const ocupacaoAtual = passageirosAtuais || 0;
          const vagasNecessarias = passageirosGrupo.length;

          // Verificar se há capacidade para todo o grupo
          if (ocupacaoAtual + vagasNecessarias > capacidadeTotal) {
            throw new Error(`Não há capacidade suficiente no ônibus de destino. Necessário: ${vagasNecessarias} vagas, disponível: ${capacidadeTotal - ocupacaoAtual}`);
          }
        }

        // Atualizar todos os passageiros do grupo
        const { error: errorUpdate } = await supabase
          .from('viagem_passageiros')
          .update({ onibus_id: onibusDestinoId })
          .eq('viagem_id', viagemId)
          .eq('grupo_nome', grupoNome);

        if (errorUpdate) throw errorUpdate;

        // Mensagem de sucesso
        const mensagem = onibusDestinoId 
          ? `Grupo "${grupoNome}" (${passageirosGrupo.length} passageiros) transferido com sucesso`
          : `Grupo "${grupoNome}" (${passageirosGrupo.length} passageiros) removido do ônibus`;
        
        toast.success(mensagem);

        // Disparar evento customizado para atualizar a interface
        window.dispatchEvent(new CustomEvent('grupoTrocado', {
          detail: { grupoNome, onibusDestinoId, totalPassageiros: passageirosGrupo.length }
        }));
      });

    } catch (err: any) {
      console.error('Erro ao trocar grupo:', err);
      const errorMessage = tratarErroSupabase(err);
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    trocarPassageiro,
    trocarGrupoInteiro,
    verificarCapacidade,
    obterOnibusDisponiveis,
    loading,
    error
  };
}