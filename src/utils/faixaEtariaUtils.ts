export interface FaixaEtaria {
  id: string;
  nome: string;
  emoji: string;
  idadeMin: number;
  idadeMax: number;
  cor: string;
}

export const FAIXAS_ETARIAS: FaixaEtaria[] = [
  {
    id: 'bebe',
    nome: 'Bebês',
    emoji: '👶',
    idadeMin: 0,
    idadeMax: 5,
    cor: 'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200'
  },
  {
    id: 'crianca',
    nome: 'Crianças',
    emoji: '🧒',
    idadeMin: 6,
    idadeMax: 12,
    cor: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
  },
  {
    id: 'estudante',
    nome: 'Estudantes',
    emoji: '🎓',
    idadeMin: 13,
    idadeMax: 17,
    cor: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
  },
  {
    id: 'adulto',
    nome: 'Adultos',
    emoji: '👨‍💼',
    idadeMin: 18,
    idadeMax: 59,
    cor: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200'
  },
  {
    id: 'idoso',
    nome: 'Idosos',
    emoji: '👴',
    idadeMin: 60,
    idadeMax: 120,
    cor: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200'
  }
];

export function calcularIdade(dataNascimento: string | Date): number {
  if (!dataNascimento) return 0;
  
  try {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    
    // Verificar se a data é válida
    if (isNaN(nascimento.getTime())) {
      return 0;
    }
    
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();
    
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return Math.max(0, idade);
  } catch (error) {
    console.error('Erro ao calcular idade:', error);
    return 0;
  }
}

export function obterFaixaEtaria(dataNascimento: string | Date): FaixaEtaria | null {
  const idade = calcularIdade(dataNascimento);
  
  return FAIXAS_ETARIAS.find(faixa => 
    idade >= faixa.idadeMin && idade <= faixa.idadeMax
  ) || null;
}

export function contarPorFaixaEtaria(passageiros: any[]): Record<string, number> {
  const contadores: Record<string, number> = {};
  
  // Inicializar contadores
  FAIXAS_ETARIAS.forEach(faixa => {
    contadores[faixa.id] = 0;
  });
  
  // Contar passageiros por faixa
  passageiros.forEach((passageiro) => {
    const dataNascimento = passageiro.clientes?.data_nascimento || passageiro.data_nascimento;
    if (dataNascimento) {
      const faixa = obterFaixaEtaria(dataNascimento);
      if (faixa) {
        contadores[faixa.id]++;
      }
    }
  });
  
  return contadores;
}