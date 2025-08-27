// Wrapper que calcula o status real do passageiro para filtros
import { usePagamentosSeparados } from "@/hooks/usePagamentosSeparados";
import type { StatusPagamentoAvancado } from "@/types/pagamentos-separados";

interface PassageiroComStatusProps {
  passageiro: any;
  children: (statusCalculado: StatusPagamentoAvancado) => React.ReactNode;
}

export function PassageiroComStatus({ passageiro, children }: PassageiroComStatusProps) {
  // Verificação de segurança
  if (!passageiro) {
    return <>{children('Pendente')}</>;
  }

  const passageiroId = passageiro.viagem_passageiro_id || passageiro.id;
  
  // Verificação adicional para IDs válidos
  if (!passageiroId) {
    console.warn('⚠️ PassageiroComStatus: ID do passageiro não encontrado', passageiro);
    return <>{children('Pendente')}</>;
  }

  const { obterStatusAtual, loading, error } = usePagamentosSeparados(passageiroId);

  // Se carregando ou erro, usar fallback
  let statusCalculado: StatusPagamentoAvancado = 'Pendente';
  
  if (!loading && !error) {
    statusCalculado = obterStatusAtual();
  } else if (passageiro.gratuito === true) {
    statusCalculado = 'Brinde';
  }

  return <>{children(statusCalculado)}</>;
}