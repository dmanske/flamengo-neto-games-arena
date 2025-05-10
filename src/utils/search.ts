
export const filterPassageiros = (
  passageiros: any[],
  searchTerm: string
): any[] => {
  if (!searchTerm || searchTerm.trim() === "") {
    return passageiros;
  }

  const lowerCaseSearch = searchTerm.toLowerCase().trim();
  
  return passageiros.filter((passageiro) => 
    passageiro.nome.toLowerCase().includes(lowerCaseSearch) ||
    passageiro.telefone.toLowerCase().includes(lowerCaseSearch) ||
    passageiro.cpf?.toLowerCase().includes(lowerCaseSearch) ||
    passageiro.cidade?.toLowerCase().includes(lowerCaseSearch) ||
    (passageiro.setor_maracana && passageiro.setor_maracana.toLowerCase().includes(lowerCaseSearch)) ||
    (passageiro.forma_pagamento && passageiro.forma_pagamento.toLowerCase().includes(lowerCaseSearch)) ||
    (passageiro.status_pagamento && passageiro.status_pagamento.toLowerCase().includes(lowerCaseSearch))
  );
};
