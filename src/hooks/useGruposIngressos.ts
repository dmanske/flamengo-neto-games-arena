import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { GrupoIngressos } from '@/types/grupos-ingressos';
import { CORES_GRUPOS_INGRESSOS } from '@/types/grupos-ingressos';
import type { Ingresso } from '@/types/ingressos';

interface UseGruposIngressos {
  grupos: GrupoIngressos[];
  ingressosSemGrupo: Ingresso[];
  gruposExistentes: Array<{nome: string, cor: string}>;
  adicionarAoGrupo: (ingressoId: string, grupoNome: string, grupoCor: string) => Promise<void>;
  removerDoGrupo: (ingressoId: string) => Promise<void>;
  obterCoresDisponiveis: () => string[];
  agruparIngressos: (ingressos: Ingresso[]) => {
    grupos: GrupoIngressos[];
    semGrupo: Ingresso[];
  };
  loading: boolean;
  error: string | null;
}

export function useGruposIngressos(viagemIngressosId?: string): UseGruposIngressos {
  const [grupos, setGrupos] = useState<GrupoIngressos[]>([]);
  const [ingressosSemGrupo, setIngressosSemGrupo] = useState<Ingresso[]>([]);
  const [gruposExistentes, setGruposExistentes] = useState<Array<{nome: string, cor: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar grupos existentes nos ingressos
  const buscarGruposExistentes = useCallback(async () => {
    try {
      let query = supabase
        .from('ingressos')
        .select('grupo_nome, grupo_cor')
        .not('grupo_nome', 'is', null)
        .not('grupo_cor', 'is', null);

      // Se há uma viagem específica, filtrar por ela
      if (viagemIngressosId) {
        query = query.eq('viagem_ingressos_id', viagemIngressosId);
      }

      const { data, error } = await query;

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
  }, [viagemIngressosId]);

  // Agrupar ingressos por grupo
  const agruparIngressos = useCallback((ingressos: Ingresso[]) => {
    console.log('🔄 useGruposIngressos: Agrupando', ingressos.length, 'ingressos');
    
    // Separar ingressos com e sem grupo
    const comGrupo: Ingresso[] = [];
    const semGrupo: Ingresso[] = [];

    ingressos.forEach(ingresso => {
      const ingressoComGrupo = ingresso as any;
      if (ingressoComGrupo.grupo_nome && ingressoComGrupo.grupo_cor) {
        console.log(`👥 Ingresso ${ingresso.cliente?.nome} → Grupo: ${ingressoComGrupo.grupo_nome}`);
        comGrupo.push(ingresso);
      } else {
        console.log(`👤 Ingresso ${ingresso.cliente?.nome} → Individual`);
        semGrupo.push(ingresso);
      }
    });

    // Ordenar ingressos com grupo: primeiro por nome do grupo, depois por nome do cliente
    comGrupo.sort((a, b) => {
      const grupoA = (a as any).grupo_nome || '';
      const grupoB = (b as any).grupo_nome || '';
      
      if (grupoA === grupoB) {
        const nomeA = a.cliente?.nome || '';
        const nomeB = b.cliente?.nome || '';
        return nomeA.localeCompare(nomeB, 'pt-BR');
      }
      
      return grupoA.localeCompare(grupoB, 'pt-BR');
    });
    
    // Ordenar ingressos sem grupo por nome do cliente
    semGrupo.sort((a, b) => {
      const nomeA = a.cliente?.nome || '';
      const nomeB = b.cliente?.nome || '';
      return nomeA.localeCompare(nomeB, 'pt-BR');
    });

    // Criar mapa de grupos para exibição em cards
    const gruposMap = new Map<string, Ingresso[]>();
    comGrupo.forEach(ingresso => {
      const ingressoComGrupo = ingresso as any;
      const key = `${ingressoComGrupo.grupo_nome}|${ingressoComGrupo.grupo_cor}`;
      if (!gruposMap.has(key)) {
        gruposMap.set(key, []);
      }
      gruposMap.get(key)!.push(ingresso);
    });

    // Converter Map para array de grupos
    const gruposArray: GrupoIngressos[] = Array.from(gruposMap.entries()).map(([key, ingressos]) => {
      const [nome, cor] = key.split('|');
      return {
        nome,
        cor,
        ingressos: ingressos.sort((a, b) => {
          const nomeA = a.cliente?.nome || '';
          const nomeB = b.cliente?.nome || '';
          return nomeA.localeCompare(nomeB, 'pt-BR');
        }),
        total_membros: ingressos.length
      };
    });

    // Ordenar grupos por nome
    gruposArray.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    console.log('✅ useGruposIngressos: Resultado final:', {
      grupos: gruposArray.length,
      individuais: semGrupo.length,
      detalhesGrupos: gruposArray.map(g => `${g.nome} (${g.total_membros})`)
    });

    return {
      grupos: gruposArray,
      semGrupo
    };
  }, []);

  // Adicionar ingresso ao grupo
  const adicionarAoGrupo = useCallback(async (ingressoId: string, grupoNome: string, grupoCor: string) => {
    if (!ingressoId || !grupoNome || !grupoCor) {
      throw new Error('Dados do grupo são obrigatórios');
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('ingressos')
        .update({
          grupo_nome: grupoNome.trim(),
          grupo_cor: grupoCor
        })
        .eq('id', ingressoId);

      if (error) throw error;

      await buscarGruposExistentes();
      toast.success(`Ingresso adicionado ao grupo "${grupoNome}"`);
    } catch (err) {
      console.error('Erro ao adicionar ingresso ao grupo:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar ao grupo';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [buscarGruposExistentes]);

  // Remover ingresso do grupo
  const removerDoGrupo = useCallback(async (ingressoId: string) => {
    if (!ingressoId) {
      throw new Error('ID do ingresso é obrigatório');
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('ingressos')
        .update({
          grupo_nome: null,
          grupo_cor: null
        })
        .eq('id', ingressoId);

      if (error) throw error;

      await buscarGruposExistentes();
      toast.success('Ingresso removido do grupo');
    } catch (err) {
      console.error('Erro ao remover ingresso do grupo:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover do grupo';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [buscarGruposExistentes]);

  // Obter cores disponíveis
  const obterCoresDisponiveis = useCallback(() => {
    const coresUsadas = gruposExistentes.map(g => g.cor);
    return CORES_GRUPOS_INGRESSOS.filter(cor => !coresUsadas.includes(cor));
  }, [gruposExistentes]);

  // Carregar grupos existentes quando o componente monta
  useEffect(() => {
    buscarGruposExistentes();
  }, [buscarGruposExistentes]);

  return {
    grupos,
    ingressosSemGrupo,
    gruposExistentes,
    adicionarAoGrupo,
    removerDoGrupo,
    obterCoresDisponiveis,
    agruparIngressos,
    loading,
    error
  };
}
