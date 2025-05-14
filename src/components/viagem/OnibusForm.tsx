
import { useState, useEffect } from 'react';
import { PlusCircle, MinusCircle, Bus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormDescription } from '@/components/ui/form';
import { TipoOnibus, EmpresaOnibus, ViagemOnibus } from '@/types/entities';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface OnibusFormProps {
  onibusArray: ViagemOnibus[];
  onChange: (onibusArray: ViagemOnibus[]) => void;
  viagemId?: string;
  onPrimaryBusChange?: (tipo: TipoOnibus, empresa: EmpresaOnibus) => void;
}

interface RegisteredBus {
  id: string;
  tipo_onibus: string;
  empresa: string;
  capacidade: number;
  numero_identificacao: string | null;
}

export function OnibusForm({ onibusArray, onChange, viagemId, onPrimaryBusChange }: OnibusFormProps) {
  const [registeredBuses, setRegisteredBuses] = useState<RegisteredBus[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch registered buses
  useEffect(() => {
    const fetchBuses = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("onibus")
          .select("id, tipo_onibus, empresa, capacidade, numero_identificacao");
          
        if (error) {
          console.error("Erro ao carregar ônibus:", error);
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível carregar a lista de ônibus cadastrados",
          });
          return;
        }
        
        setRegisteredBuses(data || []);
      } catch (err) {
        console.error("Erro ao buscar ônibus:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBuses();
  }, []);

  // Adicionar ônibus inicial se a array estiver vazia
  useEffect(() => {
    if (onibusArray.length === 0 && registeredBuses.length > 0) {
      addOnibus();
    }
  }, [registeredBuses]);

  const addOnibus = () => {
    if (registeredBuses.length === 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não há ônibus cadastrados. Cadastre pelo menos um ônibus primeiro."
      });
      return;
    }
    
    const defaultBus = registeredBuses[0];
    
    const newOnibus: ViagemOnibus = {
      viagem_id: viagemId || '',
      tipo_onibus: defaultBus.tipo_onibus,
      empresa: defaultBus.empresa,
      capacidade_onibus: defaultBus.capacidade,
      lugares_extras: 0,
      numero_identificacao: defaultBus.numero_identificacao || `Ônibus ${onibusArray.length + 1}`
    };
    
    const newArray = [...onibusArray, newOnibus];
    onChange(newArray);
    
    // Notificar o componente pai sobre o ônibus principal se este for o primeiro
    if (onibusArray.length === 0 && onPrimaryBusChange) {
      onPrimaryBusChange(defaultBus.tipo_onibus, defaultBus.empresa);
    }
  };

  const removeOnibus = (index: number) => {
    if (onibusArray.length <= 1) return; // Manter pelo menos um ônibus
    
    const newArray = [...onibusArray];
    newArray.splice(index, 1);
    onChange(newArray);
  };

  const updateOnibus = (index: number, busId: string) => {
    const selectedBus = registeredBuses.find(bus => bus.id === busId);
    if (!selectedBus) return;
    
    const newArray = [...onibusArray];
    newArray[index] = {
      ...newArray[index],
      tipo_onibus: selectedBus.tipo_onibus,
      empresa: selectedBus.empresa,
      capacidade_onibus: selectedBus.capacidade,
      numero_identificacao: selectedBus.numero_identificacao || `Ônibus ${index + 1}`,
      lugares_extras: newArray[index].lugares_extras || 0
    };
    
    // Notificar o componente pai sobre a mudança do tipo do ônibus principal (primeiro)
    if (index === 0 && onPrimaryBusChange) {
      onPrimaryBusChange(selectedBus.tipo_onibus, selectedBus.empresa);
    }
    
    onChange(newArray);
  };

  // Update lugares_extras for a specific bus
  const updateLugaresExtras = (index: number, lugares: number) => {
    const newArray = [...onibusArray];
    newArray[index].lugares_extras = lugares;
    onChange(newArray);
  };

  // Se estiver carregando, mostrar indicador de carregamento
  if (isLoading) {
    return <div className="flex justify-center py-4">Carregando ônibus...</div>;
  }

  // Se não houver ônibus cadastrados, mostrar mensagem
  if (registeredBuses.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Ônibus da Viagem</h3>
        <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-md">
          <p className="text-yellow-800">
            Não há ônibus cadastrados no sistema. 
            Por favor, <a href="/dashboard/cadastrar-onibus" className="underline font-medium">cadastre pelo menos um ônibus</a> antes de criar uma viagem.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Ônibus da Viagem</h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={addOnibus}
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" /> 
          Adicionar Ônibus
        </Button>
      </div>
      
      {onibusArray.map((onibus, index) => (
        <Card key={index} className="relative">
          <CardContent className="pt-6">
            <div className="absolute top-2 right-2 flex gap-1">
              {onibusArray.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeOnibus(index)}
                  className="h-8 w-8 p-0 text-destructive"
                >
                  <MinusCircle className="h-4 w-4" />
                  <span className="sr-only">Remover</span>
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`onibus-select-${index}`}>Selecionar Ônibus</Label>
                <Select
                  onValueChange={(value) => updateOnibus(index, value)}
                  value={registeredBuses.find(bus => 
                    bus.tipo_onibus === onibus.tipo_onibus && 
                    bus.empresa === onibus.empresa
                  )?.id || ""}
                >
                  <SelectTrigger id={`onibus-select-${index}`}>
                    <SelectValue placeholder="Selecione um ônibus cadastrado" />
                  </SelectTrigger>
                  <SelectContent>
                    {registeredBuses.map((bus) => (
                      <SelectItem key={bus.id} value={bus.id}>
                        {bus.tipo_onibus} - {bus.empresa} ({bus.capacidade} lugares)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Selecione um ônibus cadastrado
                </FormDescription>
              </div>
              
              <div>
                <Label htmlFor={`onibus-id-${index}`}>Identificação</Label>
                <Input
                  id={`onibus-id-${index}`}
                  value={onibus.numero_identificacao || ''}
                  onChange={(e) => {
                    const newArray = [...onibusArray];
                    newArray[index].numero_identificacao = e.target.value;
                    onChange(newArray);
                  }}
                  placeholder="Ex: Ônibus 1"
                />
                <FormDescription>
                  Identificação para este ônibus
                </FormDescription>
              </div>
              
              <div>
                <Label htmlFor={`onibus-tipo-${index}`}>Tipo de Ônibus</Label>
                <Input
                  id={`onibus-tipo-${index}`}
                  value={onibus.tipo_onibus}
                  readOnly
                  className="bg-gray-100"
                />
                <FormDescription>
                  Definido pelo ônibus selecionado
                </FormDescription>
              </div>
              
              <div>
                <Label htmlFor={`onibus-capacidade-${index}`}>Capacidade</Label>
                <Input
                  id={`onibus-capacidade-${index}`}
                  type="number"
                  value={onibus.capacidade_onibus}
                  readOnly
                  className="bg-gray-100"
                />
                <FormDescription>
                  Definida pelo tipo de ônibus selecionado
                </FormDescription>
              </div>
              
              {/* Novo campo para lugares extras */}
              <div>
                <Label htmlFor={`onibus-lugares-extras-${index}`} className="flex items-center">
                  Lugares Extras
                  <span className="ml-2 inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                    Novo
                  </span>
                </Label>
                <Input
                  id={`onibus-lugares-extras-${index}`}
                  type="number"
                  min="0"
                  value={onibus.lugares_extras || 0}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    updateLugaresExtras(index, isNaN(value) ? 0 : value);
                  }}
                  placeholder="0"
                />
                <FormDescription>
                  Lugares extras além da capacidade padrão do ônibus (opcional)
                </FormDescription>
              </div>
              
              <div>
                <Label htmlFor={`onibus-empresa-${index}`}>Empresa</Label>
                <Input
                  id={`onibus-empresa-${index}`}
                  value={onibus.empresa}
                  readOnly
                  className="bg-gray-100"
                />
                <FormDescription>
                  Definida pelo ônibus selecionado
                </FormDescription>
              </div>
              
              {/* Display total capacity (standard + extra seats) */}
              <div>
                <Label>Capacidade Total</Label>
                <div className="px-4 py-2 border border-gray-200 rounded bg-gray-50 text-gray-800">
                  {onibus.capacidade_onibus + (onibus.lugares_extras || 0)} lugares
                </div>
                <FormDescription>
                  Capacidade padrão + lugares extras
                </FormDescription>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
