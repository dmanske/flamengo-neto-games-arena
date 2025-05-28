
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
      console.log('🔍 Iniciando validação de cliente...', { cpf: cpf?.substring(0, 3) + '***', telefone: telefone?.substring(0, 3) + '***', email });
      
      const cleanedCPF = cleanCPF(cpf);
      const cleanedPhone = cleanPhone(telefone);
      
      console.log('🧹 Dados limpos:', { cleanedCPF: cleanedCPF?.substring(0, 3) + '***', cleanedPhone: cleanedPhone?.substring(0, 3) + '***' });
      
      // Check for existing client by CPF, phone or email
      let query = supabase
        .from('clientes')
        .select('*')
        .or(`cpf.eq.${cleanedCPF},telefone.eq.${cleanedPhone},email.eq.${email.toLowerCase()}`);
      
      // Exclude current client if editing
      if (excludeId) {
        query = query.neq('id', excludeId);
      }
      
      console.log('📡 Executando query de validação...');
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
      
      console.log('✅ Query executada com sucesso, clientes encontrados:', existingClients ? 1 : 0);
      
      if (existingClients) {
        const existingClient = existingClients;
        let conflictType = '';
        
        if (cleanCPF(existingClient.cpf) === cleanedCPF) {
          conflictType = 'CPF';
        } else if (cleanPhone(existingClient.telefone) === cleanedPhone) {
          conflictType = 'telefone';
        } else if (existingClient.email.toLowerCase() === email.toLowerCase()) {
          conflictType = 'email';
        }
        
        console.log('⚠️ Cliente duplicado encontrado:', { conflictType, existingClientName: existingClient.nome });
        
        return {
          isValid: false,
          existingClient,
          message: `Já existe um cliente cadastrado com este ${conflictType}: ${existingClient.nome}`
        };
      }
      
      console.log('✅ Validação concluída - cliente não encontrado, pode prosseguir');
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
