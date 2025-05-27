export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const numbers = phone.replace(/\D/g, '');
  
  // Format based on length
  if (numbers.length === 11) {
    // Mobile: (XX) XXXXX-XXXX
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (numbers.length === 10) {
    // Landline: (XX) XXXX-XXXX
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

export const formatCPF = (cpf: string): string => {
  if (!cpf) return '';
  
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length === 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  return cpf;
};

export const formatDate = (date: string): string => {
  if (!date) return '';
  
  // Remove all non-numeric characters
  const numbers = date.replace(/\D/g, '');
  
  // Format as DD/MM/AAAA
  if (numbers.length <= 2) {
    return numbers;
  }
  if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  }
  if (numbers.length <= 6) {
    // Para anos de 2 dígitos, mostrar como está
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 6)}`;
  }
  if (numbers.length <= 8) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  }
  
  // Limit to 8 digits (DDMMAAAA)
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
};

export const formatBirthDate = (dateString: string | null): string => {
  if (!dateString) return 'Data não informada';
  
  try {
    // Se a data está no formato YYYY-MM-DD, converter diretamente
    if (dateString.includes('-') && dateString.length === 10) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Caso contrário, tentar converter usando Date
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    
    return 'Data inválida';
  } catch (error) {
    return 'Data inválida';
  }
};

export const cleanPhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

export const cleanCPF = (cpf: string): string => {
  return cpf.replace(/\D/g, '');
};

export const formatarNomeComPreposicoes = (nome: string): string => {
  if (!nome) return '';
  
  const preposicoes = ['de', 'da', 'do', 'das', 'dos', 'e'];
  
  return nome
    .toLowerCase()
    .split(' ')
    .map((palavra, index) => {
      // Se for a primeira palavra ou não for uma preposição, capitaliza
      if (index === 0 || !preposicoes.includes(palavra)) {
        return palavra.charAt(0).toUpperCase() + palavra.slice(1);
      }
      // Se for uma preposição e não for a primeira palavra, mantém minúscula
      return palavra;
    })
    .join(' ');
};
