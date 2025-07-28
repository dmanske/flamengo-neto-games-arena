// Utilitários para trabalhar com passeios
// Compatibilidade entre estrutura antiga (nome) e nova (ID + valor)

import { supabase } from '@/lib/supabase';

// Cache para valores dos passeios por nome
const passeiosCache = new Map<string, number>();

export async function obterValorPasseioPorNome(nomePasseio: string): Promise<number> {
  // Verificar cache primeiro
  if (passeiosCache.has(nomePasseio)) {
    return passeiosCache.get(nomePasseio) || 0;
  }

  try {
    const { data, error } = await supabase
      .from('passeios')
      .select('valor')
      .eq('nome', nomePasseio)
      .single();

    if (error || !data) {
      console.warn(`Passeio não encontrado: ${nomePasseio}`);
      return 0;
    }

    const valor = data.valor || 0;
    passeiosCache.set(nomePasseio, valor);
    return valor;

  } catch (error) {
    console.error(`Erro ao buscar valor do passeio ${nomePasseio}:`, error);
    return 0;
  }
}

export async function obterValoresPasseiosPorNomes(nomesPasseios: string[]): Promise<Record<string, number>> {
  if (nomesPasseios.length === 0) return {};

  try {
    const { data, error } = await supabase
      .from('passeios')
      .select('nome, valor')
      .in('nome', nomesPasseios);

    if (error || !data) {
      console.warn('Erro ao buscar valores dos passeios:', error);
      return {};
    }

    const valores: Record<string, number> = {};
    data.forEach(passeio => {
      valores[passeio.nome] = passeio.valor || 0;
      passeiosCache.set(passeio.nome, passeio.valor || 0);
    });

    return valores;

  } catch (error) {
    console.error('Erro ao buscar valores dos passeios:', error);
    return {};
  }
}

// Calcular valor total dos passeios de um passageiro
export async function calcularValorTotalPasseios(passageiroPasseios: any[]): Promise<number> {
  if (!passageiroPasseios || passageiroPasseios.length === 0) return 0;

  let total = 0;

  for (const pp of passageiroPasseios) {
    // Se tem valor_cobrado (nova estrutura), usar ele
    if (pp.valor_cobrado !== undefined && pp.valor_cobrado !== null) {
      total += pp.valor_cobrado;
    } else if (pp.passeio_nome) {
      // Senão, buscar valor pelo nome
      const valor = await obterValorPasseioPorNome(pp.passeio_nome);
      total += valor;
    }
  }

  return total;
}

// Limpar cache (útil para testes ou quando os valores dos passeios mudam)
export function limparCachePasseios(): void {
  passeiosCache.clear();
}