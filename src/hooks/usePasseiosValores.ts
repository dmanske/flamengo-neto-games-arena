// Hook unificado para buscar valores dos passeios
// Evita conflitos e centraliza a lógica

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface PasseioComValor {
  id: string;
  passeio_nome: string;
  valor_cobrado: number;
  valor_real: number; // Valor final calculado
}

interface UsePasseiosValoresReturn {
  passeiosComValores: PasseioComValor[];
  valorTotal: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePasseiosValores = (
  passageiroPasseios: any[] | undefined,
  isGratuito: boolean = false
): UsePasseiosValoresReturn => {
  const [passeiosComValores, setPasseiosComValores] = useState<PasseioComValor[]>([]);
  const [valorTotal, setValorTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calcularValores = useCallback(async () => {
    if (!passageiroPasseios || passageiroPasseios.length === 0) {
      setPasseiosComValores([]);
      setValorTotal(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Separar passeios com e sem valor_cobrado
      const passeiosComValor: PasseioComValor[] = [];
      const passeiosSemValor: any[] = [];

      passageiroPasseios.forEach(pp => {
        if (pp.valor_cobrado && pp.valor_cobrado > 0) {
          passeiosComValor.push({
            id: pp.id,
            passeio_nome: pp.passeio_nome,
            valor_cobrado: pp.valor_cobrado,
            valor_real: pp.valor_cobrado
          });
        } else {
          passeiosSemValor.push(pp);
        }
      });

      // Buscar valores dos passeios sem valor_cobrado (uma única consulta)
      if (passeiosSemValor.length > 0) {
        const nomesPasseios = passeiosSemValor.map(pp => pp.passeio_nome).filter(Boolean);
        
        if (nomesPasseios.length > 0) {
          const { data: passeiosInfo, error: passeiosError } = await supabase
            .from('passeios')
            .select('nome, valor')
            .in('nome', nomesPasseios);

          if (passeiosError) throw passeiosError;

          // Mapear valores encontrados
          const valoresPorNome = new Map<string, number>();
          passeiosInfo?.forEach(p => {
            valoresPorNome.set(p.nome, p.valor || 0);
          });

          // Adicionar passeios sem valor com valores da tabela
          passeiosSemValor.forEach(pp => {
            const valorTabela = valoresPorNome.get(pp.passeio_nome) || 0;
            passeiosComValor.push({
              id: pp.id,
              passeio_nome: pp.passeio_nome,
              valor_cobrado: pp.valor_cobrado || 0,
              valor_real: valorTabela
            });
          });
        }
      }

      // Calcular total (se gratuito, valor = 0)
      const total = isGratuito ? 0 : passeiosComValor.reduce((sum, p) => sum + p.valor_real, 0);

      // Se gratuito, atualizar valores para 0
      if (isGratuito) {
        passeiosComValor.forEach(p => {
          p.valor_real = 0;
        });
      }

      setPasseiosComValores(passeiosComValor);
      setValorTotal(total);

    } catch (err: any) {
      console.error('Erro ao calcular valores dos passeios:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [passageiroPasseios, isGratuito]);

  const refetch = useCallback(async () => {
    await calcularValores();
  }, [calcularValores]);

  useEffect(() => {
    calcularValores();
  }, [calcularValores]);

  return {
    passeiosComValores,
    valorTotal,
    loading,
    error,
    refetch
  };
};