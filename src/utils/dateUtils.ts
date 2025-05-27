import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BRAZIL_CONFIG, getCurrentBrazilOffset } from '@/config/timezone';

/**
 * Converte uma data para UTC considerando o fuso horário do Brasil
 * @param date - Data a ser convertida
 * @returns Data em UTC
 */
export const toUTC = (date: Date): Date => {
  const utcDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
  return utcDate;
};

/**
 * Converte uma data UTC para o horário local do Brasil
 * @param utcDate - Data em UTC
 * @returns Data no horário do Brasil
 */
export const fromUTC = (utcDate: Date): Date => {
  const offset = getCurrentBrazilOffset(utcDate);
  const brazilDate = new Date(utcDate.getTime() - (offset * 60 * 60 * 1000));
  return brazilDate;
};

/**
 * Cria uma data no formato YYYY-MM-DD para armazenamento no banco
 * Evita problemas de timezone ao salvar apenas a data sem horário
 * @param day - Dia (1-31)
 * @param month - Mês (1-12)
 * @param year - Ano
 * @returns String no formato YYYY-MM-DD
 */
export const createDateString = (day: number, month: number, year: number): string => {
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
};

/**
 * Normaliza anos de 2 dígitos para 4 dígitos
 * @param year - Ano (pode ser 2 ou 4 dígitos)
 * @returns Ano com 4 dígitos
 */
export const normalizeYear = (year: number): number => {
  if (year < 100) {
    // Se o ano for menor que 30, assume 20xx, senão 19xx
    return year < 30 ? 2000 + year : 1900 + year;
  }
  return year;
};

/**
 * Converte data do formato DD/MM/AAAA ou DD/MM/AA para YYYY-MM-DD
 * @param dateStr - Data no formato DD/MM/AAAA ou DD/MM/AA
 * @returns String no formato YYYY-MM-DD ou null se inválida
 */
export const convertBRDateToISO = (dateStr: string): string | null => {
  try {
    const [day, month, year] = dateStr.split('/').map(Number);
    
    // Validar se os números são válidos
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return null;
    }
    
    // Validar se a data é válida
    const date = new Date(year, month - 1, day);
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      return null;
    }
    
    // Formatar para ISO
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  } catch (error) {
    return null;
  }
};

/**
 * Converte data do formato YYYY-MM-DD para DD/MM/AAAA
 * @param isoDate - Data no formato YYYY-MM-DD
 * @returns String no formato DD/MM/AAAA ou 'Data inválida'
 */
export const convertISOToBRDate = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    return '';
  }
};

/**
 * Cria uma data com horário fixo (meio-dia) para evitar problemas de timezone
 * @param date - Data base
 * @returns Nova data com horário 12:00:00
 */
export const createSafeDate = (date: Date): Date => {
  const safeDate = new Date(date);
  safeDate.setHours(12, 0, 0, 0);
  return safeDate;
};

/**
 * Converte uma data para ISO string com timezone seguro
 * @param date - Data a ser convertida
 * @returns String ISO com timezone
 */
export const toSafeISOString = (date: Date): string => {
  const safeDate = createSafeDate(date);
  return safeDate.toISOString();
};

/**
 * Formata uma data para exibição no padrão brasileiro
 * @param dateString - Data em string (ISO ou timestamp)
 * @param includeTime - Se deve incluir horário
 * @returns Data formatada em português
 */
export const formatBrazilianDate = (dateString: string | null, includeTime: boolean = false): string => {
  if (!dateString) return 'Data não informada';
  
  try {
    let date: Date;
    
    // Se é uma string ISO
    if (typeof dateString === 'string' && dateString.includes('T')) {
      date = parseISO(dateString);
    } else {
      date = new Date(dateString);
    }
    
    if (!isValid(date)) {
      return 'Data inválida';
    }
    
    const formatString = includeTime ? BRAZIL_CONFIG.DISPLAY.DATETIME_FORMAT : BRAZIL_CONFIG.DISPLAY.DATE_FORMAT;
    return format(date, formatString, { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data brasileira:', error);
    return 'Data inválida';
  }
};

/**
 * Valida se uma data está no formato DD/MM/AAAA ou DD/MM/AA e é válida
 * @param dateStr - Data no formato DD/MM/AAAA ou DD/MM/AA
 * @returns true se válida, false caso contrário
 */
export const isValidBRDate = (dateStr: string): boolean => {
  try {
    const [day, month, year] = dateStr.split('/').map(Number);
    
    // Validar se os números são válidos
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return false;
    }
    
    // Validar se a data é válida
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && 
           date.getMonth() === month - 1 && 
           date.getFullYear() === year;
  } catch (error) {
    return false;
  }
};

/**
 * Obtém a data atual no formato brasileiro
 * @returns Data atual no formato DD/MM/AAAA
 */
export const getCurrentBRDate = (): string => {
  return format(new Date(), BRAZIL_CONFIG.DISPLAY.DATE_FORMAT, { locale: ptBR });
};

/**
 * Obtém a data e hora atual no formato brasileiro
 * @returns Data e hora atual no formato DD/MM/AAAA HH:mm
 */
export const getCurrentBRDateTime = (): string => {
  return format(new Date(), BRAZIL_CONFIG.DISPLAY.DATETIME_FORMAT, { locale: ptBR });
}; 