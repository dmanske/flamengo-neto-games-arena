import { 
  PASSEIOS_CONFIG, 
  validatePasseios, 
  filterPasseiosValidos, 
  separarPasseios,
  isPasseioValido,
  isPasseioPago,
  isPasseioGratuito 
} from '../passeios';

describe('Passeios Validation', () => {
  describe('validatePasseios', () => {
    test('should return true for valid passeios', () => {
      const validPasseios = ['Cristo Redentor', 'Copacabana'];
      expect(validatePasseios(validPasseios)).toBe(true);
    });

    test('should return false for invalid passeios', () => {
      const invalidPasseios = ['Cristo Redentor', 'Invalid Passeio'];
      expect(validatePasseios(invalidPasseios)).toBe(false);
    });

    test('should return true for empty array', () => {
      expect(validatePasseios([])).toBe(true);
    });

    test('should return false for non-array input', () => {
      expect(validatePasseios('not an array' as any)).toBe(false);
    });
  });

  describe('filterPasseiosValidos', () => {
    test('should filter out invalid passeios', () => {
      const mixedPasseios = ['Cristo Redentor', 'Invalid', 'Copacabana'];
      const result = filterPasseiosValidos(mixedPasseios);
      expect(result).toEqual(['Cristo Redentor', 'Copacabana']);
    });

    test('should return empty array for non-array input', () => {
      expect(filterPasseiosValidos('not an array' as any)).toEqual([]);
    });
  });

  describe('separarPasseios', () => {
    test('should separate passeios into pagos and gratuitos', () => {
      const passeios = ['Cristo Redentor', 'Copacabana', 'Pão de Açúcar', 'Lapa'];
      const result = separarPasseios(passeios);
      
      expect(result.pagos).toContain('Cristo Redentor');
      expect(result.pagos).toContain('Pão de Açúcar');
      expect(result.gratuitos).toContain('Copacabana');
      expect(result.gratuitos).toContain('Lapa');
    });
  });

  describe('individual validation functions', () => {
    test('isPasseioValido should work correctly', () => {
      expect(isPasseioValido('Cristo Redentor')).toBe(true);
      expect(isPasseioValido('Copacabana')).toBe(true);
      expect(isPasseioValido('Invalid')).toBe(false);
    });

    test('isPasseioPago should work correctly', () => {
      expect(isPasseioPago('Cristo Redentor')).toBe(true);
      expect(isPasseioPago('Copacabana')).toBe(false);
    });

    test('isPasseioGratuito should work correctly', () => {
      expect(isPasseioGratuito('Copacabana')).toBe(true);
      expect(isPasseioGratuito('Cristo Redentor')).toBe(false);
    });
  });

  describe('PASSEIOS_CONFIG structure', () => {
    test('should have correct structure for pagos', () => {
      expect(PASSEIOS_CONFIG.pagos.titulo).toBe('Passeios Pagos à Parte');
      expect(PASSEIOS_CONFIG.pagos.lista).toHaveLength(12);
      expect(PASSEIOS_CONFIG.pagos.lista).toContain('Cristo Redentor');
    });

    test('should have correct structure for gratuitos', () => {
      expect(PASSEIOS_CONFIG.gratuitos.titulo).toBe('Passeios Gratuitos');
      expect(PASSEIOS_CONFIG.gratuitos.lista).toHaveLength(12);
      expect(PASSEIOS_CONFIG.gratuitos.lista).toContain('Copacabana');
    });
  });
});