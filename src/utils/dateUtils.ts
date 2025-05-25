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
 * @param dateString - Data no formato DD/MM/AAAA ou DD/MM/AA
 * @returns String no formato YYYY-MM-DD ou null se inválida
 */
export const convertBRDateToISO = (dateString: string): string | null => {
  if (!dateString || dateString.trim() === '') return null;
  
  try {
    const dateParts = dateString.split('/');
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]);
      const year = normalizeYear(parseInt(dateParts[2]));
      
      // Validações básicas
      if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) {
        return null;
      }
      
      return createDateString(day, month, year);
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao converter data brasileira:', error);
    return null;
  }
};

/**
 * Converte data do formato YYYY-MM-DD para DD/MM/AAAA
 * @param isoDateString - Data no formato YYYY-MM-DD
 * @returns String no formato DD/MM/AAAA ou 'Data inválida'
 */
export const convertISOToBRDate = (isoDateString: string | null): string => {
  if (!isoDateString) return 'Data não informada';
  
  try {
    // Se já está no formato YYYY-MM-DD
    if (isoDateString.includes('-') && isoDateString.length === 10) {
      const [year, month, day] = isoDateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Tentar converter timestamp
    const date = new Date(isoDateString);
    if (isValid(date)) {
      return format(date, 'dd/MM/yyyy');
    }
    
    return 'Data inválida';
  } catch (error) {
    console.error('Erro ao converter data ISO:', error);
    return 'Data inválida';
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
 * @param dateString - Data no formato DD/MM/AAAA ou DD/MM/AA
 * @returns true se válida, false caso contrário
 */
export const isValidBRDate = (dateString: string): boolean => {
  if (!dateString || dateString.trim() === '') return false;
  
  const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;
  const match = dateString.match(dateRegex);
  
  if (!match) return false;
  
  const day = parseInt(match[1]);
  const month = parseInt(match[2]);
  const year = normalizeYear(parseInt(match[3]));
  
  // Validações básicas
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > new Date().getFullYear()) return false;
  
  // Verifica se a data é válida
  const dateObj = new Date(year, month - 1, day);
  return dateObj.getDate() === day && 
         dateObj.getMonth() === month - 1 && 
         dateObj.getFullYear() === year;
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