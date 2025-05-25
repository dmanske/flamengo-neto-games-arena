
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

interface OnibusFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  tipoFilter: string;
  setTipoFilter: (tipo: string) => void;
  empresaFilter: string;
  setEmpresaFilter: (empresa: string) => void;
  clearFilters: () => void;
}

export function OnibusFilters({
  searchTerm,
  setSearchTerm,
  tipoFilter,
  setTipoFilter,
  empresaFilter,
  setEmpresaFilter,
  clearFilters
}: OnibusFiltersProps) {
  const hasActiveFilters = searchTerm || tipoFilter !== "all" || empresaFilter !== "all";

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-professional">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-blue-600" />
        <h3 className="font-medium text-gray-900">Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-auto text-gray-600 hover:text-red-600 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar ônibus..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
            <SelectValue placeholder="Tipo de ônibus" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="Leito">Leito</SelectItem>
            <SelectItem value="Semi-Leito">Semi-Leito</SelectItem>
            <SelectItem value="Executivo">Executivo</SelectItem>
            <SelectItem value="Convencional">Convencional</SelectItem>
          </SelectContent>
        </Select>

        <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
            <SelectValue placeholder="Empresa" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all">Todas as empresas</SelectItem>
            <SelectItem value="Viação 1001">Viação 1001</SelectItem>
            <SelectItem value="Kaissara">Kaissara</SelectItem>
            <SelectItem value="Cometa">Cometa</SelectItem>
            <SelectItem value="Penha">Penha</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
