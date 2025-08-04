
export interface AddressData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export const formatCEP = (cep: string): string => {
  // Remove any non-digit characters
  const cepClean = cep.replace(/\D/g, '');
  
  // Format as 00000-000
  if (cepClean.length <= 5) {
    return cepClean;
  }
  return `${cepClean.slice(0, 5)}-${cepClean.slice(5, 8)}`;
};

export const formatCPF = (cpf: string): string => {
  // Remove any non-digit characters
  const cpfClean = cpf.replace(/\D/g, '');
  
  // Format as 000.000.000-00
  if (cpfClean.length <= 3) {
    return cpfClean;
  }
  if (cpfClean.length <= 6) {
    return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3)}`;
  }
  if (cpfClean.length <= 9) {
    return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3, 6)}.${cpfClean.slice(6)}`;
  }
  return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3, 6)}.${cpfClean.slice(6, 9)}-${cpfClean.slice(9, 11)}`;
};

export const formatTelefone = (telefone: string): string => {
  // Remove any non-digit characters
  const telClean = telefone.replace(/\D/g, '');
  
  // Format as (00) 0 0000-0000
  if (telClean.length <= 2) {
    return telClean;
  }
  if (telClean.length <= 3) {
    return `(${telClean.slice(0, 2)}) ${telClean.slice(2)}`;
  }
  if (telClean.length <= 7) {
    return `(${telClean.slice(0, 2)}) ${telClean.slice(2, 3)} ${telClean.slice(3)}`;
  }
  if (telClean.length <= 11) {
    return `(${telClean.slice(0, 2)}) ${telClean.slice(2, 3)} ${telClean.slice(3, 7)}-${telClean.slice(7)}`;
  }
  return `(${telClean.slice(0, 2)}) ${telClean.slice(2, 3)} ${telClean.slice(3, 7)}-${telClean.slice(7, 11)}`;
};

// Função para capitalizar primeira letra de cada palavra
export const capitalizeWords = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Função para formatar endereço completo
export const formatFullAddress = (endereco: {
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}): string => {
  const parts = [];
  
  if (endereco.rua) {
    let enderecoFormatado = capitalizeWords(endereco.rua);
    if (endereco.numero) {
      enderecoFormatado += `, ${endereco.numero}`;
    }
    if (endereco.complemento) {
      enderecoFormatado += `, ${capitalizeWords(endereco.complemento)}`;
    }
    parts.push(enderecoFormatado);
  }
  
  if (endereco.bairro) {
    parts.push(capitalizeWords(endereco.bairro));
  }
  
  if (endereco.cidade && endereco.estado) {
    parts.push(`${capitalizeWords(endereco.cidade)} - ${endereco.estado.toUpperCase()}`);
  }
  
  if (endereco.cep) {
    parts.push(`CEP: ${formatCEP(endereco.cep)}`);
  }
  
  return parts.join(' • ');
};

// Função para formatar endereço em linhas separadas
export const formatAddressLines = (endereco: {
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}) => {
  const lines = [];
  
  // Linha 1: Rua, número e complemento
  if (endereco.rua) {
    let linha1 = capitalizeWords(endereco.rua);
    if (endereco.numero) {
      linha1 += `, ${endereco.numero}`;
    }
    if (endereco.complemento) {
      linha1 += ` - ${capitalizeWords(endereco.complemento)}`;
    }
    lines.push(linha1);
  }
  
  // Linha 2: Bairro
  if (endereco.bairro) {
    lines.push(capitalizeWords(endereco.bairro));
  }
  
  // Linha 3: Cidade - Estado
  if (endereco.cidade && endereco.estado) {
    lines.push(`${capitalizeWords(endereco.cidade)} - ${endereco.estado.toUpperCase()}`);
  }
  
  // Linha 4: CEP
  if (endereco.cep) {
    lines.push(`CEP: ${formatCEP(endereco.cep)}`);
  }
  
  return lines;
};

export const fetchAddressByCEP = async (cep: string): Promise<AddressData | null> => {
  try {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos');
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }
    
    return data;
  } catch (error: any) {
    console.error('Erro ao buscar endereço:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Timeout na busca do CEP');
    }
    
    throw error;
  }
};
