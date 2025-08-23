import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIngressos } from '@/hooks/useIngressos';

interface AdversarioSugestao {
  id: string;
  nome: string;
  logo_url: string;
}

interface AdversarioSearchInputProps {
  value: string;
  onValueChange: (value: string) => void;
  onLogoChange: (logoUrl: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Cache simples para adversários
const adversariosCache = new Map<string, { data: AdversarioSugestao[], timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const MAX_CACHE_SIZE = 50;

export function AdversarioSearchInput({
  value,
  onValueChange,
  onLogoChange,
  placeholder = "Digite o nome do adversário...",
  disabled = false,
  className
}: AdversarioSearchInputProps) {
  const [sugestoes, setSugestoes] = useState<AdversarioSugestao[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Hook para buscar adversários
  const { buscarAdversarios } = useIngressos();

  // Função para limpar cache expirado
  const limparCacheExpirado = () => {
    const agora = Date.now();
    for (const [key, value] of adversariosCache.entries()) {
      if (agora - value.timestamp > CACHE_TTL) {
        adversariosCache.delete(key);
      }
    }
  };

  // Função para buscar com cache
  const buscarComCache = async (termo: string): Promise<AdversarioSugestao[]> => {
    const chaveCache = termo.toLowerCase().trim();
    
    // Limpar cache expirado
    limparCacheExpirado();
    
    // Verificar se existe no cache e não expirou
    const cached = adversariosCache.get(chaveCache);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    
    // Buscar dados
    const resultados = await buscarAdversarios(termo);
    
    // Salvar no cache (limitar tamanho)
    if (adversariosCache.size >= MAX_CACHE_SIZE) {
      // Remover entrada mais antiga
      const primeiraChave = adversariosCache.keys().next().value;
      adversariosCache.delete(primeiraChave);
    }
    
    adversariosCache.set(chaveCache, {
      data: resultados as AdversarioSugestao[],
      timestamp: Date.now()
    });
    
    return resultados as AdversarioSugestao[];
  };

  // Debounce para busca
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.trim().length < 2) {
      setSugestoes([]);
      setShowDropdown(false);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      
      // Cancelar requisição anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      try {
        const resultados = await buscarComCache(value.trim());
        setSugestoes(resultados);
        setShowDropdown(resultados.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Erro ao buscar adversários:', error);
        }
        setSugestoes([]);
        setShowDropdown(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value]);

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || sugestoes.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < sugestoes.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : sugestoes.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < sugestoes.length) {
          handleSelectSugestao(sugestoes[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Selecionar sugestão
  const handleSelectSugestao = (sugestao: AdversarioSugestao) => {
    onValueChange(sugestao.nome);
    onLogoChange(sugestao.logo_url || '');
    setShowDropdown(false);
    setSelectedIndex(-1);
    setSugestoes([]);
  };

  // Limpar campo
  const handleClear = () => {
    onValueChange('');
    onLogoChange('');
    setSugestoes([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-10"
        />

        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          )}
          
          {value && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-100"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Dropdown de sugestões */}
      {showDropdown && sugestoes.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200"
        >
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-600 font-medium">
              {sugestoes.length} adversário{sugestoes.length !== 1 ? 's' : ''} encontrado{sugestoes.length !== 1 ? 's' : ''}
            </p>
          </div>
          {sugestoes.map((sugestao, index) => (
            <div
              key={sugestao.id}
              className={cn(
                "flex items-center gap-3 px-3 py-3 cursor-pointer transition-all duration-150",
                index === selectedIndex 
                  ? "bg-blue-50 border-l-2 border-blue-500 scale-[1.02]" 
                  : "hover:bg-gray-50 hover:scale-[1.01]"
              )}
              onClick={() => handleSelectSugestao(sugestao)}
            >
              {/* Logo do adversário */}
              <div className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                {sugestao.logo_url ? (
                  <img
                    src={sugestao.logo_url}
                    alt={sugestao.nome}
                    className="w-7 h-7 object-contain"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = `https://via.placeholder.com/32x32/cccccc/666666?text=${sugestao.nome.substring(0, 2).toUpperCase()}`;
                    }}
                  />
                ) : (
                  <span className="text-xs text-gray-400 font-medium">
                    {sugestao.nome.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Nome do adversário */}
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900 block">
                  {sugestao.nome}
                </span>
                <span className="text-xs text-gray-500">
                  Clique para selecionar
                </span>
              </div>

              {/* Indicador de seleção */}
              {index === selectedIndex && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 animate-pulse" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Estado vazio quando há busca mas sem resultados */}
      {showDropdown && sugestoes.length === 0 && !isLoading && value.trim().length >= 2 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg animate-in slide-in-from-top-2 duration-200"
        >
          <div className="px-4 py-6 text-center text-sm text-gray-500">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <p className="font-medium text-gray-700 mb-1">Nenhum adversário encontrado</p>
            <p className="text-xs text-gray-500">
              Continue digitando para buscar ou digite manualmente
            </p>
            <div className="mt-3 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-md">
              💡 Você pode digitar o nome completo mesmo sem sugestões
            </div>
          </div>
        </div>
      )}
    </div>
  );
}