import { PassageiroDisplay } from "@/hooks/useViagemDetails";

/**
 * Calcula o valor total de um passageiro (valor base + valor dos passeios)
 */
export function calcularValorTotalPassageiro(passageiro: PassageiroDisplay): number {
  const valorBase = passageiro.valor || 0;
  
  // Se não tem passeios ou sistema antigo, retorna apenas o valor base
  if (!passageiro.passeios || passageiro.passeios.length === 0) {
    return valorBase;
  }

  // Para o novo sistema, assumimos que o valor já inclui os passeios
  // Esta função pode ser expandida no futuro quando tivermos valores específicos por passeio
  return valorBase;
}

/**
 * Calcula o valor total com desconto aplicado
 */
export function calcularValorFinalPassageiro(passageiro: PassageiroDisplay): number {
  const valorTotal = calcularValorTotalPassageiro(passageiro);
  const desconto = passageiro.desconto || 0;
  return valorTotal - desconto;
}

/**
 * Verifica se o passageiro tem passeios selecionados
 */
export function temPasseiosSelecionados(passageiro: PassageiroDisplay): boolean {
  if (passageiro.passeios && passageiro.passeios.length > 0) {
    return passageiro.passeios.some(p => p.status === 'confirmado' || p.status === 'pago');
  }
  
  // Sistema antigo - verificar passeio_cristo
  return passageiro.passeio_cristo === 'sim';
}

/**
 * Conta quantos passeios ativos o passageiro tem
 */
export function contarPasseiosAtivos(passageiro: PassageiroDisplay): number {
  if (passageiro.passeios && passageiro.passeios.length > 0) {
    return passageiro.passeios.filter(p => p.status === 'confirmado' || p.status === 'pago').length;
  }
  
  // Sistema antigo
  return passageiro.passeio_cristo === 'sim' ? 1 : 0;
}