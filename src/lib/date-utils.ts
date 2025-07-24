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