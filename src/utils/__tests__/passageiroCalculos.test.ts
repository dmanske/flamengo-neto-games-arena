import { 
  calcularValorTotalPassageiro, 
  calcularValorFinalPassageiro, 
  temPasseiosSelecionados, 
  contarPasseiosAtivos 
} from '../passageiroCalculos';
import { PassageiroDisplay } from '@/hooks/useViagemDetails';

// Mock de passageiro para testes
const createMockPassageiro = (overrides: Partial<PassageiroDisplay> = {}): PassageiroDisplay => ({
  id: '1',
  nome: 'João Silva',
  telefone: '47999999999',
  email: 'joao@email.com',
  cpf: '12345678901',
  cidade: 'Blumenau',
  estado: 'SC',
  endereco: 'Rua das Flores, 123',
  numero: '123',
  bairro: 'Centro',
  cep: '89010000',
  setor_maracana: 'Norte',
  status_pagamento: 'pago',
  forma_pagamento: 'PIX',
  cliente_id: 'cliente-1',
  viagem_passageiro_id: 'vp-1',
  valor: 200,
  desconto: 0,
  viagem_id: 'viagem-1',
  cidade_embarque: 'Blumenau',
  ...overrides
});

describe('Cálculos de Passageiro', () => {
  describe('calcularValorTotalPassageiro', () => {
    test('deve retornar valor base quando não há passeios', () => {
      const passageiro = createMockPassageiro({ valor: 200 });
      expect(calcularValorTotalPassageiro(passageiro)).toBe(200);
    });

    test('deve retornar 0 quando valor é null', () => {
      const passageiro = createMockPassageiro({ valor: null });
      expect(calcularValorTotalPassageiro(passageiro)).toBe(0);
    });

    test('deve retornar valor base mesmo com passeios (sistema atual)', () => {
      const passageiro = createMockPassageiro({ 
        valor: 200,
        passeios: [
          { passeio_nome: 'Cristo Redentor', status: 'confirmado' }
        ]
      });
      expect(calcularValorTotalPassageiro(passageiro)).toBe(200);
    });
  });

  describe('calcularValorFinalPassageiro', () => {
    test('deve aplicar desconto corretamente', () => {
      const passageiro = createMockPassageiro({ 
        valor: 200, 
        desconto: 50 
      });
      expect(calcularValorFinalPassageiro(passageiro)).toBe(150);
    });

    test('deve funcionar sem desconto', () => {
      const passageiro = createMockPassageiro({ 
        valor: 200, 
        desconto: null 
      });
      expect(calcularValorFinalPassageiro(passageiro)).toBe(200);
    });
  });

  describe('temPasseiosSelecionados', () => {
    test('deve retornar true para passeios confirmados no novo sistema', () => {
      const passageiro = createMockPassageiro({
        passeios: [
          { passeio_nome: 'Cristo Redentor', status: 'confirmado' }
        ]
      });
      expect(temPasseiosSelecionados(passageiro)).toBe(true);
    });

    test('deve retornar false para passeios não confirmados', () => {
      const passageiro = createMockPassageiro({
        passeios: [
          { passeio_nome: 'Cristo Redentor', status: 'pendente' }
        ]
      });
      expect(temPasseiosSelecionados(passageiro)).toBe(false);
    });

    test('deve funcionar com sistema antigo - passeio_cristo sim', () => {
      const passageiro = createMockPassageiro({
        passeio_cristo: 'sim'
      });
      expect(temPasseiosSelecionados(passageiro)).toBe(true);
    });

    test('deve funcionar com sistema antigo - passeio_cristo não', () => {
      const passageiro = createMockPassageiro({
        passeio_cristo: 'nao'
      });
      expect(temPasseiosSelecionados(passageiro)).toBe(false);
    });
  });

  describe('contarPasseiosAtivos', () => {
    test('deve contar passeios confirmados e pagos', () => {
      const passageiro = createMockPassageiro({
        passeios: [
          { passeio_nome: 'Cristo Redentor', status: 'confirmado' },
          { passeio_nome: 'Pão de Açúcar', status: 'pago' },
          { passeio_nome: 'Copacabana', status: 'pendente' }
        ]
      });
      expect(contarPasseiosAtivos(passageiro)).toBe(2);
    });

    test('deve retornar 1 para sistema antigo com passeio_cristo sim', () => {
      const passageiro = createMockPassageiro({
        passeio_cristo: 'sim'
      });
      expect(contarPasseiosAtivos(passageiro)).toBe(1);
    });

    test('deve retornar 0 para sistema antigo com passeio_cristo não', () => {
      const passageiro = createMockPassageiro({
        passeio_cristo: 'nao'
      });
      expect(contarPasseiosAtivos(passageiro)).toBe(0);
    });
  });
});