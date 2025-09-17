import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface FornecedorSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
  className?: string;
}

export const FornecedorSearch = ({
  searchTerm,
  onSearchChange,
  placeholder = "Buscar por nome, email, telefone ou contato...",
  className = ''
}: FornecedorSearchProps) => {
  const limparBusca = () => {
    onSearchChange('');
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 pr-10 bg-gray-50 border-gray-200 rounded-full focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="sm"
          onClick={limparBusca}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-200 rounded-full"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};