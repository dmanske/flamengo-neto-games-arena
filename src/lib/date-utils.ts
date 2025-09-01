import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Converte uma data string para o formato correto para input datetime-local
 * Evita problemas de fuso horário mantendo a data local
 */
export function formatDateForInput(dateString: string): string {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    // Ajustar para o fuso horário local para evitar mudança de data
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate.toISOString().slice(0, 16);
  } catch (error) {
    console.error("Erro ao formatar data para input:", error);
    return "";
  }
}

/**
 * Converte uma data string para o formato correto para input date
 * Evita problemas de fuso horário mantendo a data local
 */
export function formatDateOnlyForInput(dateString: string): string {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    // Ajustar para o fuso horário local para evitar mudança de data
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate.toISOString().split('T')[0];
  } catch (error) {
    console.error("Erro ao formatar data para input:", error);
    return "";
  }
}

/**
 * Converte uma data do input para ISO string mantendo a data local
 */
export function formatInputDateToISO(inputDate: string): string {
  if (!inputDate) return "";
  
  try {
    // Se a data não tem horário, adicionar meio-dia para evitar problemas de fuso horário
    let dateToConvert = inputDate;
    if (inputDate.length === 10) { // formato YYYY-MM-DD
      dateToConvert = inputDate + 'T12:00:00';
    }
    
    const date = new Date(dateToConvert);
    return date.toISOString();
  } catch (error) {
    console.error("Erro ao converter data do input:", error);
    return "";
  }
}

/**
 * Formata uma data para exibição no formato brasileiro
 */
export function formatDateForDisplay(dateString: string): string {
  if (!dateString) return "Data inválida";
  
  try {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  } catch (error) {
    console.error("Erro ao formatar data para exibição:", error);
    return "Data inválida";
  }
}

/**
 * Formata uma data e hora para exibição no formato brasileiro
 */
export function formatDateTimeForDisplay(dateString: string): string {
  if (!dateString) return "Data inválida";
  
  try {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch (error) {
    console.error("Erro ao formatar data e hora para exibição:", error);
    return "Data inválida";
  }
}

/**
 * Formata uma data para exibição mais amigável (ex: "27 de julho")
 */
export function formatDateFriendly(dateString: string): string {
  if (!dateString) return "Data inválida";
  
  try {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM", { locale: ptBR });
  } catch (error) {
    console.error("Erro ao formatar data amigável:", error);
    return "Data inválida";
  }
}

/**
 * Formata uma data e hora evitando problemas de fuso horário
 * Usa parseISO para parsing correto de strings ISO
 */
export function formatDateTimeSafe(dateString: string): string {
  if (!dateString) return "Data inválida";
  
  try {
    // Se a string tem formato ISO, usar parseISO para evitar problemas de fuso horário
    let date: Date;
    
    if (dateString.includes('T') || dateString.includes('Z')) {
      // Formato ISO completo
      date = parseISO(dateString);
    } else if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Formato YYYY-MM-DD - usar apenas a data sem forçar horário específico
      date = parseISO(dateString + 'T00:00:00');
    } else {
      // Fallback para new Date
      date = new Date(dateString);
    }
    
    // Se a hora for 00:00 (meia-noite), mostrar apenas a data
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    if (hours === 0 && minutes === 0) {
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    }
    
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch (error) {
    console.error("Erro ao formatar data/hora segura:", dateString, error);
    return "Data inválida";
  }
}