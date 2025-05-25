/**
 * Configurações de timezone para o Brasil
 * 
 * O Brasil utiliza diferentes fusos horários:
 * - UTC-2: Horário de verão (outubro a fevereiro)
 * - UTC-3: Horário padrão (março a setembro)
 * - UTC-4: Acre e oeste do Amazonas
 * - UTC-5: Acre durante horário de verão
 * 
 * Para simplificar, utilizamos UTC-3 como padrão
 */

export const BRAZIL_CONFIG = {
  // Timezone padrão do Brasil (Brasília)
  TIMEZONE_OFFSET: -3,
  
  // Locale brasileiro para formatação
  LOCALE: 'pt-BR',
  
  // Formatos de data comuns
  DATE_FORMATS: {
    DISPLAY: 'dd/MM/yyyy',
    DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
    ISO: 'yyyy-MM-dd',
    ISO_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  },
  
  // Configurações para o banco de dados
  DATABASE: {
    // Sempre salvar datas como YYYY-MM-DD para evitar problemas de timezone
    DATE_FORMAT: 'yyyy-MM-dd',
    // Para timestamps, usar ISO com timezone
    TIMESTAMP_FORMAT: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  },
  
  // Configurações para exibição
  DISPLAY: {
    DATE_FORMAT: 'dd/MM/yyyy',
    DATETIME_FORMAT: 'dd/MM/yyyy HH:mm',
    TIME_FORMAT: 'HH:mm',
  }
};

/**
 * Verifica se estamos no horário de verão brasileiro
 * @param date Data para verificar
 * @returns true se estiver no horário de verão
 */
export const isBrazilianDaylightSaving = (date: Date = new Date()): boolean => {
  const month = date.getMonth() + 1; // getMonth() retorna 0-11
  const day = date.getDate();
  
  // Horário de verão geralmente vai de outubro a fevereiro
  // Simplificação: outubro a fevereiro
  return month >= 10 || month <= 2;
};

/**
 * Obtém o offset atual do Brasil considerando horário de verão
 * @param date Data para verificar
 * @returns Offset em horas
 */
export const getCurrentBrazilOffset = (date: Date = new Date()): number => {
  // Nota: O horário de verão foi abolido no Brasil em 2019
  // Mantemos UTC-3 como padrão
  return BRAZIL_CONFIG.TIMEZONE_OFFSET;
};

export default BRAZIL_CONFIG; 