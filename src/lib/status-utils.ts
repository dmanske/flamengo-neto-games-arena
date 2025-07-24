// Utilitários para calcular status inteligente dos passageiros

export interface PassageiroStatus {
  status: 'Brinde' | 'Parcelado' | 'Pendente' | 'Pago';
  cor: string;
  descricao: string;
}

export function calcularStatusInteligente(
  valor: number,
  desconto: number,
  parcelas?: Array<{ data_pagamento?: string | null; valor_parcela: number }>,
  statusOriginal?: string
): PassageiroStatus {
  const valorLiquido = valor - desconto;
  
  // 1. BRINDE - Quando desconto = valor total (cliente não paga nada)
  if (desconto >= valor || valorLiquido <= 0) {
    return {
      status: 'Brinde',
      cor: 'bg-purple-100 text-purple-800',
      descricao: 'Cliente ganhou desconto total'
    };
  }

  // Calcular valor pago (apenas parcelas com data_pagamento)
  const valorPago = parcelas?.reduce((sum, p) => {
    return p.data_pagamento ? sum + p.valor_parcela : sum;
  }, 0) || 0;

  const totalParcelas = parcelas?.length || 0;
  const parcelasComPagamento = parcelas?.filter(p => p.data_pagamento).length || 0;

  // 2. PAGO - Quando está totalmente quitado
  if (valorPago >= valorLiquido - 0.01) { // Margem para centavos
    return {
      status: 'Pago',
      cor: 'bg-green-100 text-green-800',
      descricao: 'Pagamento completo'
    };
  }

  // 3. PARCELADO - Quando tem mais de 1 parcela (independente se foi paga ou não)
  if (totalParcelas > 1) {
    return {
      status: 'Parcelado',
      cor: 'bg-blue-100 text-blue-800',
      descricao: `${parcelasComPagamento}/${totalParcelas} parcelas pagas`
    };
  }

  // 4. PENDENTE - Quando é à vista mas ainda não foi pago
  return {
    status: 'Pendente',
    cor: 'bg-amber-100 text-amber-800',
    descricao: 'Aguardando pagamento à vista'
  };
}

// Função para obter apenas a cor baseada no status
export function getStatusColor(status: string): string {
  const cores = {
    'Brinde': 'bg-purple-100 text-purple-800',
    'Parcelado': 'bg-blue-100 text-blue-800', 
    'Pendente': 'bg-amber-100 text-amber-800',
    'Pago': 'bg-green-100 text-green-800',
    // Fallbacks para status antigos
    'Cancelado': 'bg-red-100 text-red-800'
  };
  
  return cores[status as keyof typeof cores] || cores.Pendente;
}

// Função para converter status do banco para status inteligente
export function converterStatusParaInteligente(
  passageiro: {
    valor: number;
    desconto: number;
    status_pagamento?: string;
    parcelas?: Array<{ data_pagamento?: string | null; valor_parcela: number }>;
  }
): PassageiroStatus {
  return calcularStatusInteligente(
    passageiro.valor,
    passageiro.desconto,
    passageiro.parcelas,
    passageiro.status_pagamento
  );
}