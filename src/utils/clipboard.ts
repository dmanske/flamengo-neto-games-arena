/**
 * Utilitários para operações de clipboard
 */

import { toast } from "sonner";

/**
 * Copia texto para o clipboard
 * @param text - Texto a ser copiado
 * @param successMessage - Mensagem de sucesso personalizada
 */
export const copyToClipboard = async (text: string, successMessage?: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage || `Copiado: ${text}`);
  } catch (error) {
    console.error('Erro ao copiar para clipboard:', error);
    
    // Fallback para navegadores mais antigos
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
      toast.success(successMessage || `Copiado: ${text}`);
    } catch (fallbackError) {
      console.error('Erro no fallback de clipboard:', fallbackError);
      toast.error('Erro ao copiar texto');
    }
  }
};

/**
 * Copia CPF formatado para o clipboard
 * @param cpf - CPF a ser copiado
 */
export const copyCPF = async (cpf: string): Promise<void> => {
  if (!cpf) {
    toast.error('CPF não disponível');
    return;
  }
  
  // Remove formatação para copiar apenas números
  const cpfLimpo = cpf.replace(/\D/g, '');
  await copyToClipboard(cpfLimpo, `CPF copiado: ${cpf}`);
};

/**
 * Copia nome para o clipboard
 * @param nome - Nome a ser copiado
 */
export const copyNome = async (nome: string): Promise<void> => {
  if (!nome) {
    toast.error('Nome não disponível');
    return;
  }
  
  await copyToClipboard(nome, `Nome copiado: ${nome}`);
};

/**
 * Copia data de nascimento para o clipboard
 * @param dataNascimento - Data de nascimento a ser copiada
 */
export const copyDataNascimento = async (dataNascimento: string): Promise<void> => {
  if (!dataNascimento) {
    toast.error('Data de nascimento não disponível');
    return;
  }
  
  await copyToClipboard(dataNascimento, `Data de nascimento copiada: ${dataNascimento}`);
};