import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { GrupoPassageiros, CorGrupo } from '@/types/grupos-passageiros';
import { CORES_GRUPOS } from '@/types/grupos-passageiros';
import type { PassageiroDisplay } from '@/hooks/useViagemDetails';
import { validarNomeGrupo, validarCorGrupo, tratarErroSupabase, executarComRetry } from '@/utils/validacoes-grupos';

interface UseGruposPassageiros {
  grupos: GrupoPassageiros[];
  passageirosSemGrupo: PassageiroDisplay[];
  gruposExistentes: Array<{nome: string, cor: string}>;
  criarGrupo: (nome: string, cor: string) => Promise<void>;
  adicionarAoGrupo: (passageiroId: string, grupoNome: string, grupoCor: string) => Promise<void>;
  removerDoGrupo: (passageiroId: string) => Promise<void>;
  obterCoresDisponiveis: () => string[];
  agruparPassageiros: (passageiros: PassageiroDisplay[]) => {
    grupos: GrupoPassageiros[];
    semGrupo: PassageiroDisplay[];
    passageirosOrdenados: PassageiroDisplay[];
  };
  loading: boolean;
  error: string | null;
}

export function useGruposPassageiros(viagemId: string): UseGruposPassageiros {
  const [grupos, setGrupos] = useState<GrupoPassageiros[]>([]);
  const [passageirosSemGrupo, setPassageirosSemGrupo] = useState<PassageiroDisplay[]>([]);
  const [gruposExistentes, setGruposExistentes] = useState<Array<{nome: string, cor: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar grupos existentes na viagem
  const buscarGruposExistentes = useCallback(async () => {
    if (!viagemId) return;

    try {
      const { data, error } = await supabase
        .from('viagem_passageiros')
        .select('grupo_nome, grupo_cor')
        .eq('viagem_id', viagemId)
        .not('grupo_nome', 'is', null)
        .not('grupo_cor', 'is', null);

      if (error) throw error;

      // Remover duplicatas
      const gruposUnicos = data?.reduce((acc, item) => {
        const existe = acc.find(g => g.nome === item.grupo_nome);
        if (!existe && item.grupo_nome && item.grupo_cor) {
          acc.push({
            nome: item.grupo_nome,
            cor: item.grupo_cor
          });
        }
        return acc;
      }, [] as Array<{nome: string, cor: string}>) || [];

      setGruposExistentes(gruposUnicos);
    } catch (err) {
      console.error('Erro ao buscar grupos existentes:', err);
      setError('Erro ao carregar grupos existentes');
    }
  }, [viagemId]);

  // Agrupar passageiros por grupo
  const agruparPassageiros = useCallback((passageiros: PassageiroDisplay[]) => {
    console.log('🔄 useGruposPassageiros: Agrupando', passageiros.length, 'passageiros');
    
    // Separar passageiros com e sem grupo
    const comGrupo: PassageiroDisplay[] = [];
    const semGrupo: PassageiroDisplay[] = [];

    passageiros.forEach(passageiro => {
      if (passageiro.grupo_nome && passageiro.grupo_cor) {
        console.log(`👥 Passageiro ${passageiro.nome} → Grupo: ${passageiro.grupo_nome}`);
        comGrupo.push(passageiro);
      } else {
        console.log(`👤 Passageiro ${passageiro.nome} → Individual`);
        semGrupo.push(passageiro);
      }
    });

    // Ordenar passageiros com grupo: primeiro por nome do grupo, depois por nome do passageiro
    comGrupo.sort((a, b) => {
      const grupoA = a.grupo_nome || '';
      const grupoB = b.grupo_nome || '';
      
      // Se são do mesmo grupo, ordenar por nome do passageiro
      if (grupoA === grupoB) {
        return a.nome.localeCompare(b.nome, 'pt-BR');
      }
      
      // Senão, ordenar por nome do grupo
      return grupoA.localeCompare(grupoB, 'pt-BR');
    });
    
    // Ordenar passageiros sem grupo por nome
    semGrupo.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    // Criar mapa de grupos para exibição em cards
    const gruposMap = new Map<string, PassageiroDisplay[]>();
    comGrupo.forEach(passageiro => {
      const key = `${passageiro.grupo_nome}|${passageiro.grupo_cor}`;
      if (!gruposMap.has(key)) {
        gruposMap.set(key, []);
      }
      gruposMap.get(key)!.push(passageiro);
    });

    // Converter Map para array de grupos
    const gruposArray: GrupoPassageiros[] = Array.from(gruposMap.entries()).map(([key, passageiros]) => {
      const [nome, cor] = key.split('|');
      return {
        nome,
        cor,
        passageiros: passageiros.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
        total_membros: passageiros.length
      };
    });

    // Ordenar grupos por nome
    gruposArray.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    console.log('✅ useGruposPassageiros: Resultado final:', {
      grupos: gruposArray.length,
      individuais: semGrupo.length,
      detalhesGrupos: gruposArray.map(g => `${g.nome} (${g.total_membros})`),
      ordemFinal: `${comGrupo.length} com grupo + ${semGrupo.length} individuais`
    });

    return {
      grupos: gruposArray,
      semGrupo,
      // Retornar também a lista ordenada para uso direto
      passageirosOrdenados: [...comGrupo, ...semGrupo]
    };
  }, []);

  // Criar novo grupo (não usado diretamente, grupos são criados ao adicionar passageiros)
  const criarGrupo = useCallback(async (nome: string, cor: string) => {
    // Esta função é mais conceitual, grupos são criados automaticamente
    // quando um passageiro é adicionado com grupo_nome e grupo_cor
    console.log(`Grupo conceitual criado: ${nome} com cor ${cor}`);
  }, []);

  // Adicionar passageiro ao grupo
  const adicionarAoGrupo = useCallback(async (passageiroId: string, grupoNome: string, grupoCor: string) => {
    if (!passageiroId || !grupoNome || !grupoCor) {
      throw new Error('Dados do grupo são obrigatórios');
    }

    // Validar dados do grupo
    const nomesExistentes = gruposExistentes.map(g => g.nome);
    const coresUsadas = gruposExistentes.map(g => g.cor);

    const validacaoNome = validarNomeGrupo(grupoNome, nomesExistentes);
    if (!validacaoNome.valido) {
      toast.error(validacaoNome.erro);
      throw new Error(validacaoNome.erro);
    }

    const validacaoCor = validarCorGrupo(grupoCor, coresUsadas);
    if (!validacaoCor.valido) {
      toast.error(validacaoCor.erro);
      throw new Error(validacaoCor.erro);
    }

    // Mostrar aviso se a cor já está sendo usada
    if (validacaoCor.aviso) {
      toast.warning(validacaoCor.aviso);
    }

    setLoading(true);
    setError(null);

    try {
      await executarComRetry(async () => {
        const { error } = await supabase
          .from('viagem_passageiros')
          .update({
            grupo_nome: grupoNome.trim(),
            grupo_cor: grupoCor
          })
          .eq('id', passageiroId);

        if (error) throw error;
      });

      // Atualizar lista de grupos existentes
      await buscarGruposExistentes();
      
      toast.success(`Passageiro adicionado ao grupo "${grupoNome}"`);
    } catch (err) {
      console.error('Erro ao adicionar passageiro ao grupo:', err);
      const errorMessage = tratarErroSupabase(err);
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [buscarGruposExistentes, gruposExistentes]);

  // Remover passageiro do grupo
  const removerDoGrupo = useCallback(async (passageiroId: string) => {
    if (!passageiroId) {
      throw new Error('ID do passageiro é obrigatório');
    }

    setLoading(true);
    setError(null);

    try {
      await executarComRetry(async () => {
        const { error } = await supabase
          .from('viagem_passageiros')
          .update({
            grupo_nome: null,
            grupo_cor: null
          })
          .eq('id', passageiroId);

        if (error) throw error;
      });

      // Atualizar lista de grupos existentes
      await buscarGruposExistentes();
      
      toast.success('Passageiro removido do grupo');
    } catch (err) {
      console.error('Erro ao remover passageiro do grupo:', err);
      const errorMessage = tratarErroSupabase(err);
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [buscarGruposExistentes]);

  // Obter cores disponíveis (não usadas pelos grupos existentes)
  const obterCoresDisponiveis = useCallback(() => {
    const coresUsadas = gruposExistentes.map(g => g.cor);
    return CORES_GRUPOS.filter(cor => !coresUsadas.includes(cor));
  }, [gruposExistentes]);

  // Carregar grupos existentes quando o componente monta
  useEffect(() => {
    if (viagemId) {
      buscarGruposExistentes();
    }
  }, [viagemId, buscarGruposExistentes]);

  return {
    grupos,
    passageirosSemGrupo,
    gruposExistentes,
    criarGrupo,
    adicionarAoGrupo,
    removerDoGrupo,
    obterCoresDisponiveis,
    agruparPassageiros,
    loading,
    error
  };
}