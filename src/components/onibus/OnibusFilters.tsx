import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Filter, X, Building2, Bus } from "lucide-react";

interface OnibusFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  tipoFilter: string;
  setTipoFilter: (tipo: string) => void;
  empresaFilter: string;
  setEmpresaFilter: (empresa: string) => void;
  clearFilters: () => void;
  empresas?: string[];
  tipos?: string[];
}

export function OnibusFilters({
  searchTerm,
  setSearchTerm,
  tipoFilter,
  setTipoFilter,
  empresaFilter,
  setEmpresaFilter,
  clearFilters,
  empresas = [],
  tipos = []
}: OnibusFiltersProps) {
  const hasActiveFilters = searchTerm.trim() !== "" || (tipoFilter && tipoFilter !== "all") || (empresaFilter && empresaFilter !== "all");

  return (
    <div className="bg-white/90 backdrop-blur-md border-0 rounded-xl p-5 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
            <Filter className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="font-medium text-slate-900">Filtros de Busca</h3>
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <Input
            placeholder="Buscar por tipo, empresa, capacidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-slate-200 bg-white focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-lg"
          />
        </div>

        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="border-slate-200 bg-white focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Bus className="h-4 w-4 text-blue-600" />
              <SelectValue placeholder="Tipo de ônibus" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200 rounded-lg shadow-lg">
            <SelectItem value="all" className="focus:bg-blue-50 focus:text-blue-700">
              Todos os tipos
            </SelectItem>
            {tipos && tipos.length > 0 && tipos.map((tipo) => (
              <SelectItem key={tipo} value={tipo} className="focus:bg-blue-50 focus:text-blue-700">
                {tipo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
          <SelectTrigger className="border-slate-200 bg-white focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-600" />
              <SelectValue placeholder="Empresa" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200 rounded-lg shadow-lg">
            <SelectItem value="all" className="focus:bg-blue-50 focus:text-blue-700">
              Todas as empresas
            </SelectItem>
            {empresas && empresas.length > 0 && empresas.map((empresa) => (
              <SelectItem key={empresa} value={empresa} className="focus:bg-blue-50 focus:text-blue-700">
                {empresa}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}