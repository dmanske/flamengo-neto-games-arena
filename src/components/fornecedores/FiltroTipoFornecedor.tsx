import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TIPOS_FORNECEDOR } from '@/data/fornecedores';
import { TipoFornecedor } from '@/types/fornecedores';
import { Filter, X } from 'lucide-react';

interface FiltroTipoFornecedorProps {
  tipoSelecionado: TipoFornecedor | 'todos';
  onTipoChange: (tipo: TipoFornecedor | 'todos') => void;
  contadores?: Record<TipoFornecedor | 'total', number>;
  className?: string;
}

export const FiltroTipoFornecedor = ({
  tipoSelecionado,
  onTipoChange,
  contadores = {},
  className = ''
}: FiltroTipoFornecedorProps) => {
  const limparFiltro = () => {
    onTipoChange('todos');
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Seletor de tipo */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <Select
          value={tipoSelecionado}
          onValueChange={(value) => onTipoChange(value as TipoFornecedor | 'todos')}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">
              <div className="flex items-center justify-between w-full">
                <span>Todos os tipos</span>
                {contadores.total && (
                  <Badge variant="secondary" className="ml-2">
                    {contadores.total}
                  </Badge>
                )}
              </div>
            </SelectItem>
            {TIPOS_FORNECEDOR.map((tipo) => (
              <SelectItem key={tipo.value} value={tipo.value}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${tipo.color}`} />
                    <span>{tipo.label}</span>
                  </div>
                  {contadores[tipo.value] && (
                    <Badge variant="secondary" className="ml-2">
                      {contadores[tipo.value]}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Botão para limpar filtro */}
      {tipoSelecionado !== 'todos' && (
        <Button
          variant="outline"
          size="sm"
          onClick={limparFiltro}
          className="flex items-center gap-1"
        >
          <X className="h-3 w-3" />
          Limpar
        </Button>
      )}

      {/* Badge do filtro ativo */}
      {tipoSelecionado !== 'todos' && (
        <Badge 
          variant="secondary" 
          className={`${TIPOS_FORNECEDOR.find(t => t.value === tipoSelecionado)?.color} text-white`}
        >
          {TIPOS_FORNECEDOR.find(t => t.value === tipoSelecionado)?.label}
        </Badge>
      )}
    </div>
  );
};