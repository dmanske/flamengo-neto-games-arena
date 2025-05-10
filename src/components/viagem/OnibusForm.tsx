
import { useState, useEffect } from 'react';
import { PlusCircle, MinusCircle, Bus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormDescription } from '@/components/ui/form';
import { TipoOnibus, EmpresaOnibus, ViagemOnibus } from '@/types/entities';

// Mapeamento entre tipos de ônibus e empresas
const onibusPorEmpresa: Record<string, string> = {
  "43 Leitos Totais": "Bertoldo",
  "52 Leitos Master": "Majetur",
  "56 Leitos Master": "Sarcella",
};

interface OnibusFormProps {
  onibusArray: ViagemOnibus[];
  onChange: (onibusArray: ViagemOnibus[]) => void;
  viagemId?: string;
  onPrimaryBusChange?: (tipo: TipoOnibus, empresa: EmpresaOnibus) => void;
}

export function OnibusForm({ onibusArray, onChange, viagemId, onPrimaryBusChange }: OnibusFormProps) {
  // Adicionar ônibus inicial se a array estiver vazia
  useEffect(() => {
    if (onibusArray.length === 0) {
      addOnibus();
    }
  }, []);

  const addOnibus = () => {
    const defaultTipo = "43 Leitos Totais" as TipoOnibus;
    const defaultEmpresa = onibusPorEmpresa[defaultTipo] as EmpresaOnibus;
    
    const newOnibus: ViagemOnibus = {
      viagem_id: viagemId || '',
      tipo_onibus: defaultTipo,
      empresa: defaultEmpresa,
      capacidade_onibus: 43,
      numero_identificacao: `Ônibus ${onibusArray.length + 1}`
    };
    
    const newArray = [...onibusArray, newOnibus];
    onChange(newArray);
    
    // Notificar o componente pai sobre o ônibus principal se este for o primeiro
    if (onibusArray.length === 0 && onPrimaryBusChange) {
      onPrimaryBusChange(defaultTipo, defaultEmpresa);
    }
  };

  const removeOnibus = (index: number) => {
    if (onibusArray.length <= 1) return; // Manter pelo menos um ônibus
    
    const newArray = [...onibusArray];
    newArray.splice(index, 1);
    onChange(newArray);
  };

  const updateOnibus = (index: number, field: keyof ViagemOnibus, value: any) => {
    const newArray = [...onibusArray];
    
    if (field === 'tipo_onibus') {
      // Atualizar capacidade e empresa com base no tipo
      const tipoOnibus = value as TipoOnibus;
      let capacidade = 43;
      
      if (tipoOnibus === '52 Leitos Master') capacidade = 52;
      else if (tipoOnibus === '56 Leitos Master') capacidade = 56;
      
      newArray[index] = {
        ...newArray[index],
        tipo_onibus: tipoOnibus,
        empresa: onibusPorEmpresa[tipoOnibus] as EmpresaOnibus,
        capacidade_onibus: capacidade
      };
      
      // Notificar o componente pai sobre a mudança do tipo do ônibus principal (primeiro)
      if (index === 0 && onPrimaryBusChange) {
        onPrimaryBusChange(tipoOnibus, onibusPorEmpresa[tipoOnibus] as EmpresaOnibus);
      }
    } else {
      newArray[index] = {
        ...newArray[index],
        [field]: value
      };
    }
    
    onChange(newArray);
  };

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
                <Label htmlFor={`onibus-id-${index}`}>Identificação</Label>
                <Input
                  id={`onibus-id-${index}`}
                  value={onibus.numero_identificacao || ''}
                  onChange={(e) => updateOnibus(index, 'numero_identificacao', e.target.value)}
                  placeholder="Ex: Ônibus 1"
                />
                <FormDescription>
                  Identificação para este ônibus
                </FormDescription>
              </div>
              
              <div>
                <Label htmlFor={`onibus-tipo-${index}`}>Tipo de Ônibus</Label>
                <Select
                  value={onibus.tipo_onibus}
                  onValueChange={(value) => updateOnibus(index, 'tipo_onibus', value)}
                >
                  <SelectTrigger id={`onibus-tipo-${index}`}>
                    <SelectValue placeholder="Selecione o tipo de ônibus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="43 Leitos Totais">43 Leitos Totais</SelectItem>
                    <SelectItem value="52 Leitos Master">52 Leitos Master</SelectItem>
                    <SelectItem value="56 Leitos Master">56 Leitos Master</SelectItem>
                  </SelectContent>
                </Select>
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
                  Definido automaticamente pelo tipo
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
                  Definido automaticamente pelo tipo
                </FormDescription>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
