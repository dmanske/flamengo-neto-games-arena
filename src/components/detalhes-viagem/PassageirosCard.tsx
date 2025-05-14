
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
    
    // Include lugares_extras in capacity calculation
    const capacidade = onibusAtual.capacidade_onibus + (onibusAtual.lugares_extras || 0);
    const ocupacao = passageirosAtuais.length;
    
    return `${ocupacao} de ${capacidade} lugares ocupados`;
  };
  
  // Determina se o botão de adicionar passageiro deve estar desabilitado
  const isAddButtonDisabled = () => {
    if (selectedOnibusId === null) return false;
    
    if (!onibusAtual) return true;
    
    // Include lugares_extras in capacity calculation
    const capacidade = onibusAtual.capacidade_onibus + (onibusAtual.lugares_extras || 0);
    return passageirosAtuais.length >= capacidade;
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">
            {getTituloCard()}
            {filterStatus === "pendente" && (
              <span className="ml-2 text-sm text-amber-600 font-normal">(Filtrando por pendentes)</span>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {getCapacidade()}
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setAddPassageiroOpen(true)}
          disabled={isAddButtonDisabled()}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Passageiro
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone, cidade, CPF, setor, forma de pagamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
            {searchTerm && (
              <button 
                className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
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
                onEditPassageiro({ status_pagamento: null } as any); // Hack to trigger filter reset
              }}
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
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <p>Nenhum passageiro encontrado</p>
            {searchTerm && (
              <Button variant="ghost" size="sm" className="mt-2" onClick={handleClearSearch}>
                Limpar busca
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
