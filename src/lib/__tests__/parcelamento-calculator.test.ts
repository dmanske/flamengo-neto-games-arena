// @ts-nocheck
/**
 * Testes para o Sistema de Parcelamento Inteligente
 */

import { 
  ParcelamentoCalculator, 
  ParcelamentoError, 
  ERROR_CODES,
  viagemPermiteParcelamento,
  formatarOpcaoParcelamento,
  calcularUrgenciaParcela,
  agruparParcelasPorUrgencia
} from '../parcelamento-calculator';

// Helper para criar datas relativas
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

describe('ParcelamentoCalculator', () => {
  let calculator: ParcelamentoCalculator;
  const hoje = new Date();

  beforeEach(() => {
    calculator = new ParcelamentoCalculator();
  });

  describe('Validações Básicas', () => {
    it('deve rejeitar data de viagem inválida', () => {
      expect(() => {
        calculator.calcularOpcoes(new Date('invalid'), 800);
      }).toThrow(ParcelamentoError);
    });

    it('deve rejeitar valor total inválido', () => {
      const dataViagem = addDays(hoje, 60);
      
      expect(() => {
        calculator.calcularOpcoes(dataViagem, 0);
      }).toThrow(ParcelamentoError);
      
      expect(() => {
        calculator.calcularOpcoes(dataViagem, -100);
      }).toThrow(ParcelamentoError);
    });

    it('deve rejeitar data de viagem no passado', () => {
      const dataPassado = addDays(hoje, -10);
      
      expect(() => {
        calculator.calcularOpcoes(dataPassado, 800);
      }).toThrow(ParcelamentoError);
    });
  });

  describe('Cálculo de Opções - Viagem Próxima', () => {
    it('deve oferecer apenas à vista para viagem em 10 dias', () => {
      const dataViagem = addDays(hoje, 10);
      const opcoes = calculator.calcularOpcoes(dataViagem, 800);
      
      expect(opcoes).toHaveLength(1);
      expect(opcoes[0].tipo).toBe('avista');
      expect(opcoes[0].parcelas).toBe(1);
      expect(opcoes[0].valorTotal).toBe(800);
    });

    it('deve oferecer apenas à vista para viagem em 5 dias (limite)', () => {
      const dataViagem = addDays(hoje, 5);
      const opcoes = calculator.calcularOpcoes(dataViagem, 800);
      
      expect(opcoes).toHaveLength(1);
      expect(opcoes[0].tipo).toBe('avista');
    });
  });

  describe('Cálculo de Opções - Viagem Distante', () => {
    it('deve oferecer múltiplas opções para viagem em 60 dias', () => {
      const dataViagem = addDays(hoje, 60);
      const opcoes = calculator.calcularOpcoes(dataViagem, 800);
      
      expect(opcoes.length).toBeGreaterThan(1);
      
      // Deve ter opção à vista
      const avista = opcoes.find(o => o.tipo === 'avista');
      expect(avista).toBeDefined();
      
      // Deve ter opções parceladas
      const parceladas = opcoes.filter(o => o.tipo === 'parcelado');
      expect(parceladas.length).toBeGreaterThan(0);
      
      // Deve ter 2x e 3x pelo menos
      expect(parceladas.some(o => o.parcelas === 2)).toBe(true);
      expect(parceladas.some(o => o.parcelas === 3)).toBe(true);
    });

    it('deve calcular valores corretos para 2x', () => {
      const dataViagem = addDays(hoje, 60);
      const opcoes = calculator.calcularOpcoes(dataViagem, 800);
      
      const opcao2x = opcoes.find(o => o.parcelas === 2);
      expect(opcao2x).toBeDefined();
      expect(opcao2x!.valorParcela).toBe(400);
      expect(opcao2x!.valorTotal).toBe(800);
      expect(opcao2x!.datas).toHaveLength(2);
    });

    it('deve calcular valores corretos para 3x', () => {
      const dataViagem = addDays(hoje, 60);
      const opcoes = calculator.calcularOpcoes(dataViagem, 800);
      
      const opcao3x = opcoes.find(o => o.parcelas === 3);
      expect(opcao3x).toBeDefined();
      expect(opcao3x!.valorParcela).toBe(266.67);
      expect(opcao3x!.valorTotal).toBe(800);
      expect(opcao3x!.datas).toHaveLength(3);
    });
  });

  describe('Desconto à Vista', () => {
    it('deve aplicar desconto à vista quando configurado', () => {
      const dataViagem = addDays(hoje, 60);
      const opcoes = calculator.calcularOpcoes(dataViagem, 800, { descontoAvistaPercent: 5 });
      
      const avista = opcoes.find(o => o.tipo === 'avista');
      expect(avista).toBeDefined();
      expect(avista!.valorOriginal).toBe(800);
      expect(avista!.desconto).toBe(40); // 5% de 800
      expect(avista!.valorTotal).toBe(760);
      expect(avista!.descricao).toContain('5% desconto');
    });

    it('não deve aplicar desconto quando não configurado', () => {
      const dataViagem = addDays(hoje, 60);
      const opcoes = calculator.calcularOpcoes(dataViagem, 800);
      
      const avista = opcoes.find(o => o.tipo === 'avista');
      expect(avista!.desconto).toBe(0);
      expect(avista!.valorTotal).toBe(800);
    });
  });

  describe('Validação de Prazo Limite', () => {
    it('deve respeitar prazo de 5 dias antes da viagem', () => {
      const dataViagem = addDays(hoje, 30);
      const opcoes = calculator.calcularOpcoes(dataViagem, 800);
      
      opcoes.forEach(opcao => {
        opcao.datas.forEach(data => {
          const prazoLimite = addDays(dataViagem, -5);
          expect(data.getTime()).toBeLessThanOrEqual(prazoLimite.getTime());
        });
      });
    });

    it('deve validar data de vencimento individual', () => {
      const dataViagem = addDays(hoje, 30);
      const dataValida = addDays(dataViagem, -10); // 10 dias antes
      const dataInvalida = addDays(dataViagem, -3); // 3 dias antes (inválida)
      
      expect(calculator.validarDataVencimento(dataValida, dataViagem)).toBe(true);
      expect(calculator.validarDataVencimento(dataInvalida, dataViagem)).toBe(false);
    });
  });

  describe('Criação de Parcelas', () => {
    it('deve criar parcelas corretamente para pagamento à vista', () => {
      const dataViagem = addDays(hoje, 60);
      const opcoes = calculator.calcularOpcoes(dataViagem, 800);
      const opcaoAvista = opcoes.find(o => o.tipo === 'avista')!;
      
      const parcelas = calculator.criarParcelas(opcaoAvista, 'passageiro-123');
      
      expect(parcelas).toHaveLength(1);
      expect(parcelas[0].numero).toBe(1);
      expect(parcelas[0].totalParcelas).toBe(1);
      expect(parcelas[0].valor).toBe(800);
      expect(parcelas[0].status).toBe('pendente');
      expect(parcelas[0].tipoParcelamento).toBe('avista');
    });

    it('deve criar parcelas corretamente para parcelamento', () => {
      const dataViagem = addDays(hoje, 60);
      const opcoes = calculator.calcularOpcoes(dataViagem, 800);
      const opcao2x = opcoes.find(o => o.parcelas === 2)!;
      
      const parcelas = calculator.criarParcelas(opcao2x, 'passageiro-123');
      
      expect(parcelas).toHaveLength(2);
      
      expect(parcelas[0].numero).toBe(1);
      expect(parcelas[0].totalParcelas).toBe(2);
      expect(parcelas[0].valor).toBe(400);
      expect(parcelas[0].tipoParcelamento).toBe('parcelado');
      
      expect(parcelas[1].numero).toBe(2);
      expect(parcelas[1].totalParcelas).toBe(2);
      expect(parcelas[1].valor).toBe(400);
    });
  });

  describe('Edição de Parcelas', () => {
    it('deve permitir editar datas de parcelas válidas', () => {
      const dataViagem = addDays(hoje, 60);
      const opcoes = calculator.calcularOpcoes(dataViagem, 800);
      const opcao2x = opcoes.find(o => o.parcelas === 2)!;
      const parcelas = calculator.criarParcelas(opcao2x, 'passageiro-123');
      
      const novasDatas = [
        addDays(hoje, 5),
        addDays(hoje, 25)
      ];
      
      const parcelasEditadas = calculator.recalcularParcelas(parcelas, novasDatas, dataViagem);
      
      expect(parcelasEditadas[0].dataVencimento).toEqual(novasDatas[0]);
      expect(parcelasEditadas[1].dataVencimento).toEqual(novasDatas[1]);
      expect(parcelasEditadas[0].tipoParcelamento).toBe('personalizado');
    });

    it('deve rejeitar edição com data que ultrapassa prazo limite', () => {
      const dataViagem = addDays(hoje, 30);
      const opcoes = calculator.calcularOpcoes(dataViagem, 800);
      const opcao2x = opcoes.find(o => o.parcelas === 2)!;
      const parcelas = calculator.criarParcelas(opcao2x, 'passageiro-123');
      
      const novasDatasInvalidas = [
        addDays(hoje, 5),
        addDays(dataViagem, -3) // 3 dias antes da viagem (inválido)
      ];
      
      expect(() => {
        calculator.recalcularParcelas(parcelas, novasDatasInvalidas, dataViagem);
      }).toThrow(ParcelamentoError);
    });

    it('deve rejeitar edição de parcela já paga', () => {
      const parcela = {
        numero: 1,
        totalParcelas: 2,
        valor: 400,
        dataVencimento: addDays(hoje, 10),
        status: 'pago' as const,
        tipoParcelamento: 'parcelado' as const,
        descontoAplicado: 0,
        valorOriginal: 800,
        descricao: 'Parcela 1 de 2'
      };
      
      expect(() => {
        calculator.validarEdicaoParcela(parcela);
      }).toThrow(ParcelamentoError);
    });
  });
});

describe('Funções Utilitárias', () => {
  const hoje = new Date();

  describe('viagemPermiteParcelamento', () => {
    it('deve retornar true para viagem distante', () => {
      const dataViagem = addDays(hoje, 60);
      expect(viagemPermiteParcelamento(dataViagem)).toBe(true);
    });

    it('deve retornar false para viagem próxima', () => {
      const dataViagem = addDays(hoje, 10);
      expect(viagemPermiteParcelamento(dataViagem)).toBe(false);
    });
  });

  describe('formatarOpcaoParcelamento', () => {
    it('deve formatar opção à vista sem desconto', () => {
      const opcao = {
        tipo: 'avista' as const,
        parcelas: 1,
        valorParcela: 800,
        valorTotal: 800,
        valorOriginal: 800,
        desconto: 0,
        datas: [hoje],
        descricao: 'À vista - R$ 800.00',
        valida: true
      };
      
      const formatado = formatarOpcaoParcelamento(opcao);
      expect(formatado).toBe('À vista: R$ 800.00');
    });

    it('deve formatar opção à vista com desconto', () => {
      const opcao = {
        tipo: 'avista' as const,
        parcelas: 1,
        valorParcela: 760,
        valorTotal: 760,
        valorOriginal: 800,
        desconto: 40,
        datas: [hoje],
        descricao: 'À vista - R$ 760.00 (5% desconto)',
        valida: true
      };
      
      const formatado = formatarOpcaoParcelamento(opcao);
      expect(formatado).toBe('À vista: R$ 760.00 (desconto de R$ 40.00)');
    });

    it('deve formatar opção parcelada', () => {
      const opcao = {
        tipo: 'parcelado' as const,
        parcelas: 2,
        valorParcela: 400,
        valorTotal: 800,
        valorOriginal: 800,
        desconto: 0,
        datas: [hoje, addDays(hoje, 15)],
        descricao: '2x de R$ 400.00 sem juros',
        valida: true
      };
      
      const formatado = formatarOpcaoParcelamento(opcao);
      expect(formatado).toBe('2x: R$ 400.00 (total: R$ 800.00)');
    });
  });

  describe('calcularUrgenciaParcela', () => {
    it('deve retornar normal para parcela paga', () => {
      const parcela = {
        numero: 1,
        totalParcelas: 1,
        valor: 800,
        dataVencimento: addDays(hoje, -5),
        status: 'pago' as const,
        tipoParcelamento: 'avista' as const,
        descontoAplicado: 0,
        valorOriginal: 800,
        descricao: 'Pagamento à vista'
      };
      
      expect(calcularUrgenciaParcela(parcela)).toBe('normal');
    });

    it('deve retornar atrasado para parcela vencida', () => {
      const parcela = {
        numero: 1,
        totalParcelas: 1,
        valor: 800,
        dataVencimento: addDays(hoje, -5),
        status: 'vencido' as const,
        tipoParcelamento: 'avista' as const,
        descontoAplicado: 0,
        valorOriginal: 800,
        descricao: 'Pagamento à vista'
      };
      
      expect(calcularUrgenciaParcela(parcela)).toBe('atrasado');
    });

    it('deve retornar vence_hoje para parcela que vence hoje', () => {
      const parcela = {
        numero: 1,
        totalParcelas: 1,
        valor: 800,
        dataVencimento: hoje,
        status: 'pendente' as const,
        tipoParcelamento: 'avista' as const,
        descontoAplicado: 0,
        valorOriginal: 800,
        descricao: 'Pagamento à vista'
      };
      
      expect(calcularUrgenciaParcela(parcela)).toBe('vence_hoje');
    });

    it('deve retornar vence_em_breve para parcela que vence em 3 dias', () => {
      const parcela = {
        numero: 1,
        totalParcelas: 1,
        valor: 800,
        dataVencimento: addDays(hoje, 3),
        status: 'pendente' as const,
        tipoParcelamento: 'avista' as const,
        descontoAplicado: 0,
        valorOriginal: 800,
        descricao: 'Pagamento à vista'
      };
      
      expect(calcularUrgenciaParcela(parcela)).toBe('vence_em_breve');
    });
  });

  describe('agruparParcelasPorUrgencia', () => {
    it('deve agrupar parcelas corretamente por urgência', () => {
      const parcelas = [
        {
          numero: 1, totalParcelas: 1, valor: 800,
          dataVencimento: addDays(hoje, -5), status: 'vencido' as const,
          tipoParcelamento: 'avista' as const, descontoAplicado: 0,
          valorOriginal: 800, descricao: 'Atrasada'
        },
        {
          numero: 1, totalParcelas: 1, valor: 800,
          dataVencimento: hoje, status: 'pendente' as const,
          tipoParcelamento: 'avista' as const, descontoAplicado: 0,
          valorOriginal: 800, descricao: 'Vence hoje'
        },
        {
          numero: 1, totalParcelas: 1, valor: 800,
          dataVencimento: addDays(hoje, 3), status: 'pendente' as const,
          tipoParcelamento: 'avista' as const, descontoAplicado: 0,
          valorOriginal: 800, descricao: 'Vence em breve'
        },
        {
          numero: 1, totalParcelas: 1, valor: 800,
          dataVencimento: addDays(hoje, 10), status: 'pendente' as const,
          tipoParcelamento: 'avista' as const, descontoAplicado: 0,
          valorOriginal: 800, descricao: 'Normal'
        }
      ];
      
      const grupos = agruparParcelasPorUrgencia(parcelas);
      
      expect(grupos.atrasado).toHaveLength(1);
      expect(grupos.vence_hoje).toHaveLength(1);
      expect(grupos.vence_em_breve).toHaveLength(1);
      expect(grupos.normal).toHaveLength(1);
    });
  });
});