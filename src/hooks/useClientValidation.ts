
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
      const cleanedPhone = cleanPhone(telefone);
      
      // Check for existing client by CPF, phone or email
      let query = supabase
        .from('clientes')
        .select('*')
        .or(`cpf.eq.${cleanedCPF},telefone.eq.${cleanedPhone},email.eq.${email.toLowerCase()}`);
      
      // Exclude current client if editing
      if (excludeId) {
        query = query.neq('id', excludeId);
      }
      
      const { data: existingClients, error } = await query;
      
      if (error) {
        console.error('Erro ao validar cliente:', error);
        return { isValid: true }; // Allow creation if validation fails
      }
      
      if (existingClients && existingClients.length > 0) {
        const existingClient = existingClients[0];
        let conflictType = '';
        
        if (cleanCPF(existingClient.cpf) === cleanedCPF) {
          conflictType = 'CPF';
        } else if (cleanPhone(existingClient.telefone) === cleanedPhone) {
          conflictType = 'telefone';
        } else if (existingClient.email.toLowerCase() === email.toLowerCase()) {
          conflictType = 'email';
        }
        
        return {
          isValid: false,
          existingClient,
          message: `Já existe um cliente cadastrado com este ${conflictType}: ${existingClient.nome}`
        };
      }
      
      return { isValid: true };
    } catch (error) {
      console.error('Erro ao validar cliente:', error);
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
