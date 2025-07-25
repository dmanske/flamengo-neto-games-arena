import { 
  isViagemNova, 
  isViagemLegacy, 
  formatarPasseiosParaExibicao,
  calcularValorTotalPasseios,
  getViagemCompatibilityInfo 
} from '../viagemCompatibility';

describe('viagemCompatibility', () => {
  const viagemLegacy = {
    id: '1',
    passeios_pagos: ['Cristo Redentor', 'Pão de Açúcar'],
    outro_passeio: 'Museu do Amanhã',
    created_at: '2024-01-01'
  };

  const viagemNova = {
    id: '2',
    viagem_passeios: [
      {
        id: 'vp1',
        passeio_id: 'p1',
        valor_cobrado: 85.00,
        passeio: { nome: 'Cristo Redentor', valor: 85.00, categoria: 'pago' }
      },
      {
        id: 'vp2', 
        passeio_id: 'p2',
        valor_cobrado: 120.00,
        passeio: { nome: 'Pão de Açúcar', valor: 120.00, categoria: 'pago' }
      }
    ],
    outro_passeio: 'Tour personalizado',
    created_at: '2024-12-01'
  };

  const viagemSemPasseios = {
    id: '3',
    created_at: '2024-12-01'
  };

  describe('isViagemNova', () => {
    it('deve detectar viagem nova corretamente', () => {
      expect(isViagemNova(viagemNova)).toBe(true);
      expect(isViagemNova(viagemLegacy)).toBe(false);
      expect(isViagemNova(viagemSemPasseios)).toBe(false);
    });
  });

  describe('isViagemLegacy', () => {
    it('deve detectar viagem legacy corretamente', () => {
      expect(isViagemLegacy(viagemLegacy)).toBe(true);
      expect(isViagemLegacy(viagemNova)).toBe(false);
      expect(isViagemLegacy(viagemSemPasseios)).toBe(false);
    });
  });

  describe('formatarPasseiosParaExibicao', () => {
    it('deve formatar passeios de viagem nova', () => {
      const result = formatarPasseiosParaExibicao(viagemNova);
      expect(result).toEqual(['Cristo Redentor', 'Pão de Açúcar']);
    });

    it('deve formatar passeios de viagem legacy', () => {
      const result = formatarPasseiosParaExibicao(viagemLegacy);
      expect(result).toEqual(['Cristo Redentor', 'Pão de Açúcar']);
    });

    it('deve retornar array vazio para viagem sem passeios', () => {
      const result = formatarPasseiosParaExibicao(viagemSemPasseios);
      expect(result).toEqual([]);
    });
  });

  describe('calcularValorTotalPasseios', () => {
    it('deve calcular valor total para viagem nova', () => {
      const result = calcularValorTotalPasseios(viagemNova);
      expect(result).toBe(205.00);
    });

    it('deve retornar 0 para viagem legacy', () => {
      const result = calcularValorTotalPasseios(viagemLegacy);
      expect(result).toBe(0);
    });
  });

  describe('getViagemCompatibilityInfo', () => {
    it('deve retornar info completa para viagem nova', () => {
      const result = getViagemCompatibilityInfo(viagemNova);
      expect(result).toEqual({
        isNova: true,
        isLegacy: false,
        sistema: 'novo',
        passeios: ['Cristo Redentor', 'Pão de Açúcar'],
        valorPasseios: 205.00,
        temPasseios: true,
        outroPasseio: 'Tour personalizado'
      });
    });

    it('deve retornar info completa para viagem legacy', () => {
      const result = getViagemCompatibilityInfo(viagemLegacy);
      expect(result).toEqual({
        isNova: false,
        isLegacy: true,
        sistema: 'legacy',
        passeios: ['Cristo Redentor', 'Pão de Açúcar'],
        valorPasseios: 0,
        temPasseios: true,
        outroPasseio: 'Museu do Amanhã'
      });
    });
  });
});