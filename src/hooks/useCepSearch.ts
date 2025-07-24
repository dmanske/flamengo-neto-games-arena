import { useState, useCallback, useRef } from 'react';
import { fetchAddressByCEP } from '@/utils/cepUtils';
import { toast } from 'sonner';

export const useCepSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchCep = useCallback(async (cep: string, onSuccess: (data: any) => void) => {
    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Cancelar requisição anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    // Debounce de 500ms
    timeoutRef.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        
        // Criar novo AbortController
        abortControllerRef.current = new AbortController();
        
        const addressData = await fetchAddressByCEP(cleanCep);
        
        // Verificar se a requisição não foi cancelada
        if (!abortControllerRef.current?.signal.aborted && addressData) {
          onSuccess(addressData);
          toast.success("Endereço encontrado automaticamente!");
        }
      } catch (error: any) {
        // Só mostrar erro se não foi cancelamento
        if (error.name !== 'AbortError' && !abortControllerRef.current?.signal.aborted) {
          console.error('Erro ao buscar CEP:', error);
          toast.error("CEP não encontrado. Preencha o endereço manualmente.");
        }
      } finally {
        // Só atualizar loading se não foi cancelado
        if (!abortControllerRef.current?.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 500);
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  }, []);

  return {
    searchCep,
    isLoading,
    cleanup
  };
};