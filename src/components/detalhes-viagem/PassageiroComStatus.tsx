// Wrapper que calcula o status real do passageiro para filtros
import { usePagamentosSeparados } from "@/hooks/usePagamentosSeparados";
import type { StatusPagamentoAvancado } from "@/types/pagamentos-separados";

interface PassageiroComStatusProps {
  passageiro: any;
  children: (statusCalculado: StatusPagamentoAvancado) => React.ReactNode;
}

export function PassageiroComStatus({ passageiro, children }: PassageiroComStatusProps) {
  // ✅ CORREÇÃO: Verificação de segurança mais rigorosa
  if (!passageiro) {
    console.warn('⚠️ PassageiroComStatus: passageiro não fornecido');
    return <>{children('Pendente')}</>;
  }

  const passageiroId = passageiro.viagem_passageiro_id || passageiro.id;
  
  // Verificação adicional para IDs válidos
  if (!passageiroId || passageiroId === 'undefined' || passageiroId === 'null') {
    console.warn('⚠️ PassageiroComStatus: ID do passageiro inválido', { 
      passageiro: passageiro.nome || 'Nome não disponível',
      id: passageiro.id,
      viagem_passageiro_id: passageiro.viagem_passageiro_id,
      passageiroId 
    });
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