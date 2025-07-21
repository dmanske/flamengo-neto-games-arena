import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export interface SearchResult {
  id: string;
  type: 'cliente' | 'viagem' | 'onibus';
  title: string;
  subtitle: string;
  description?: string;
  url: string;
  data?: any;
}

export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const performSearch = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // Buscar clientes
      const { data: clientes } = await supabase
        .from('clientes')
        .select('id, nome, email, telefone, cidade')
        .or(`nome.ilike.%${query}%, email.ilike.%${query}%, telefone.ilike.%${query}%`)
        .limit(5);

      if (clientes) {
        clientes.forEach(cliente => {
          searchResults.push({
            id: `cliente-${cliente.id}`,
            type: 'cliente',
            title: cliente.nome,
            subtitle: cliente.email || cliente.telefone || 'Cliente',
            description: cliente.cidade ? `${cliente.cidade}` : undefined,
            url: `/dashboard/cadastrar-cliente`,
            data: cliente
          });
        });
      }

      // Buscar viagens
      const { data: viagens } = await supabase
        .from('viagens')
        .select('id, adversario, data_jogo, local_jogo, status_viagem')
        .ilike('adversario', `%${query}%`)
        .limit(5);

      if (viagens) {
        viagens.forEach(viagem => {
          const dataJogo = new Date(viagem.data_jogo).toLocaleDateString('pt-BR');
          searchResults.push({
            id: `viagem-${viagem.id}`,
            type: 'viagem',
            title: `Flamengo x ${viagem.adversario}`,
            subtitle: dataJogo,
            description: viagem.local_jogo || 'Local não informado',
            url: `/dashboard/viagens`,
            data: viagem
          });
        });
      }

      // Buscar ônibus (se existir tabela)
      try {
        const { data: onibus } = await supabase
          .from('onibus')
          .select('id, placa, modelo, empresa, capacidade')
          .or(`placa.ilike.%${query}%, modelo.ilike.%${query}%, empresa.ilike.%${query}%`)
          .limit(3);

        if (onibus) {
          onibus.forEach(bus => {
            searchResults.push({
              id: `onibus-${bus.id}`,
              type: 'onibus',
              title: `${bus.modelo} - ${bus.placa}`,
              subtitle: bus.empresa || 'Empresa não informada',
              description: `Capacidade: ${bus.capacidade} passageiros`,
              url: `/dashboard/detalhes-onibus`,
              data: bus
            });
          });
        }
      } catch (error) {
        // Tabela de ônibus pode não existir
        console.log('Tabela de ônibus não encontrada');
      }

      setResults(searchResults);
      setIsOpen(searchResults.length > 0);

    } catch (error) {
      console.error('Erro na busca:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setSearchTerm("");
    setResults([]);
    setIsOpen(false);
    
    // Navegar para rotas que existem no sistema
    if (result.type === 'cliente') {
      // Navegar para a página de clientes ou cadastro com parâmetro
      navigate(`/dashboard/cadastrar-cliente`, { 
        state: { clienteId: result.data.id, clienteData: result.data } 
      });
    } else if (result.type === 'viagem') {
      // Navegar para a página de viagens
      navigate(`/dashboard/viagens`, { 
        state: { viagemId: result.data.id, viagemData: result.data } 
      });
    } else if (result.type === 'onibus') {
      // Navegar para a página de ônibus ou detalhes
      navigate(`/dashboard/detalhes-onibus`, { 
        state: { onibusId: result.data.id, onibusData: result.data } 
      });
    } else {
      // Fallback para dashboard principal
      navigate('/dashboard');
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setResults([]);
    setIsOpen(false);
  };

  // Debounce da busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Navegação por teclado
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && results.length > 0) {
      handleResultClick(results[0]); // Selecionar primeiro resultado
    } else if (e.key === 'Escape') {
      clearSearch();
    }
  };

  // Fechar resultados quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-search-container]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, results]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    isOpen,
    setIsOpen,
    handleResultClick,
    clearSearch,
    performSearch,
    handleKeyDown
  };
};