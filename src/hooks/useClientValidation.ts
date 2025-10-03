
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { cleanPhone, cleanCPF } from '@/utils/formatters';

interface ValidationResult {
  isValid: boolean;
  existingClient?: any;
  message?: string;
}

export const useClientValidation = () => {
  const [isValidating, setIsValidating] = useState(false);

  const validateClient = async (
    cpf: string, 
    telefone: string, 
    email: string,
    excludeId?: string
  ): Promise<ValidationResult> => {
    setIsValidating(true);
    
    try {
      const cleanedCPF = cleanCPF(cpf);
      
      // Verificar apenas CPF duplicado (email e telefone podem duplicar)
      if (!cleanedCPF) {
        return { isValid: true };
      }
      
      let query = supabase
        .from('clientes')
        .select('*')
        .eq('cpf', cleanedCPF);
      
      // Exclude current client if editing
      if (excludeId) {
        query = query.neq('id', excludeId);
      }
      
      const { data: existingClients, error } = await query.maybeSingle();
      
      if (error) {
        console.error('❌ Erro ao validar cliente:', error);
        // Log mais detalhado do erro
        console.error('Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return { isValid: true }; // Allow creation if validation fails
      }
      
      if (existingClients) {
        const existingClient = existingClients;
        
        return {
          isValid: false,
          existingClient,
          message: `Já existe um cliente cadastrado com este CPF: ${existingClient.nome}`
        };
      }
      
      return { isValid: true };
    } catch (error) {
      console.error('💥 Erro inesperado ao validar cliente:', error);
      return { isValid: true }; // Allow creation if validation fails
    } finally {
      setIsValidating(false);
    }
  };

  return {
    validateClient,
    isValidating
  };
};
