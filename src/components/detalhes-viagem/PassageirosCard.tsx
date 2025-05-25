
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle, XCircle } from 'lucide-react';
import { PassageiroDisplay, Onibus } from '@/hooks/useViagemDetails';
import { PassageirosList } from './PassageirosList';

interface PassageirosCardProps {
  passageirosAtuais: PassageiroDisplay[];
  passageiros: PassageiroDisplay[];
  onibusAtual: Onibus | null;
  selectedOnibusId: string | null;
  totalPassageirosNaoAlocados: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setAddPassageiroOpen: (open: boolean) => void;
  onEditPassageiro: (passageiro: PassageiroDisplay) => void;
  onDeletePassageiro: (passageiro: PassageiroDisplay) => void;
  filterStatus?: string | null;
}

export function PassageirosCard({ 
  passageirosAtuais, 
  passageiros, 
  onibusAtual, 
  selectedOnibusId, 
  totalPassageirosNaoAlocados,
  searchTerm,
  setSearchTerm,
  setAddPassageiroOpen,
  onEditPassageiro,
  onDeletePassageiro,
  filterStatus
}: PassageirosCardProps) {
  const getTituloCard = () => {
    if (selectedOnibusId === null) {
      return "Passageiros não Alocados";
    }
    return `Passageiros do ${onibusAtual?.numero_identificacao || onibusAtual?.tipo_onibus}`;
  };

  const getCapacidade = () => {
    if (selectedOnibusId === null) {
      return null;
    }
    
    if (!onibusAtual) return null;
    
    const capacidade = onibusAtual.capacidade_onibus + (onibusAtual.lugares_extras || 0);
    const ocupacao = passageirosAtuais.length;
    
    return `${ocupacao} de ${capacidade} lugares ocupados`;
  };
  
  const isAddButtonDisabled = () => {
    if (selectedOnibusId === null) return false;
    
    if (!onibusAtual) return true;
    
    const capacidade = onibusAtual.capacidade_onibus + (onibusAtual.lugares_extras || 0);
    return passageirosAtuais.length >= capacidade;
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <Card className="mb-6 bg-white/95 backdrop-blur-sm border-gray-200 shadow-professional">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl">
        <div>
          <CardTitle className="text-lg font-semibold">
            {getTituloCard()}
            {filterStatus === "pendente" && (
              <span className="ml-2 text-sm text-blue-200 font-normal">(Filtrando por pendentes)</span>
            )}
          </CardTitle>
          <p className="text-sm text-blue-100 mt-1">
            {getCapacidade()}
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setAddPassageiroOpen(true)}
          disabled={isAddButtonDisabled()}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Passageiro
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, telefone, cidade, CPF, setor, forma de pagamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            {searchTerm && (
              <button 
                className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                onClick={handleClearSearch}
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
          {filterStatus === "pendente" && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSearchTerm('');
                onEditPassageiro({ status_pagamento: null } as any);
              }}
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-1" /> Limpar filtro
            </Button>
          )}
        </div>
        
        <PassageirosList 
          passageiros={passageirosAtuais} 
          onEdit={onEditPassageiro}
          onDelete={onDeletePassageiro}
        />
        
        {passageirosAtuais.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
            <p className="font-medium">Nenhum passageiro encontrado</p>
            {searchTerm && (
              <Button variant="ghost" size="sm" className="mt-2 text-blue-600 hover:text-blue-700" onClick={handleClearSearch}>
                Limpar busca
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
