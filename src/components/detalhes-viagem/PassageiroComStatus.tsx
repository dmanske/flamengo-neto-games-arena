// Wrapper que calcula o status real do passageiro para filtros
import { usePagamentosSeparados } from "@/hooks/usePagamentosSeparados";
import type { StatusPagamentoAvancado } from "@/types/pagamentos-separados";

interface PassageiroComStatusProps {
  passageiro: any;
  children: (statusCalculado: StatusPagamentoAvancado) => React.ReactNode;
}

export function PassageiroComStatus({ passageiro, children }: PassageiroComStatusProps) {
  const { obterStatusAtual, loading, error } = usePagamentosSeparados(
    passageiro.viagem_passageiro_id || passageiro.id
  );

  // Se carregando ou erro, usar fallback
  let statusCalculado: StatusPagamentoAvancado = 'Pendente';
  
  if (!loading && !error) {
    statusCalculado = obterStatusAtual();
  } else if (passageiro.gratuito === true) {
    statusCalculado = 'Brinde';
  }

  return <>{children(statusCalculado)}</>;
}