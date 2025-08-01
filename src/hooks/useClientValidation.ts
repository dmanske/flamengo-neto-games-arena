
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
      console.log('🔍 Iniciando validação de cliente...', { cpf: cpf?.substring(0, 3) + '***' });
      
      const cleanedCPF = cleanCPF(cpf);
      
      console.log('🧹 CPF limpo:', { cleanedCPF: cleanedCPF?.substring(0, 3) + '***' });
      
      // Verificar apenas CPF duplicado (email e telefone podem duplicar)
      if (!cleanedCPF) {
        console.log('✅ CPF vazio, validação aprovada');
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
      
      console.log('📡 Executando query de validação de CPF...');
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
        
        console.log('⚠️ Cliente com CPF duplicado encontrado:', { existingClientName: existingClient.nome });
        
        return {
          isValid: false,
          existingClient,
          message: `Já existe um cliente cadastrado com este CPF: ${existingClient.nome}`
        };
      }
      
      console.log('✅ Validação concluída - CPF não encontrado, pode prosseguir');
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
