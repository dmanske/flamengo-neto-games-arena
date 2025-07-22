import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Bus } from "lucide-react";
import { ViagemOnibus } from "@/types/entities";
import { useOnibusData } from "@/hooks/useOnibusData";

interface OnibusFormProps {
  onibusArray: ViagemOnibus[];
  onChange: (onibusArray: ViagemOnibus[]) => void;
  onPrimaryBusChange?: (tipo: string, empresa: string) => void;
}

export const OnibusForm: React.FC<OnibusFormProps> = ({
  onibusArray,
  onChange,
  onPrimaryBusChange,
}) => {
  const { onibusList, loading: loadingOnibus } = useOnibusData();
  const [newOnibus, setNewOnibus] = useState<Partial<ViagemOnibus>>({
    tipo_onibus: "",
    empresa: "",
    capacidade_onibus: 0,
    lugares_extras: 0,
  });

  const handleAddOnibus = () => {
    if (!newOnibus.tipo_onibus || !newOnibus.empresa || !newOnibus.capacidade_onibus) {
      return;
    }

    const onibus: ViagemOnibus = {
      id: `temp-${Date.now()}`,
      tipo_onibus: newOnibus.tipo_onibus,
      empresa: newOnibus.empresa,
      capacidade_onibus: newOnibus.capacidade_onibus,
      lugares_extras: newOnibus.lugares_extras || 0,
      numero_identificacao: `${newOnibus.empresa} - ${newOnibus.tipo_onibus}`,
      viagem_id: "", // Será preenchido ao salvar a viagem
    };

    const newArray = [...onibusArray, onibus];
    console.log('onibusArray atualizado:', newArray);
    onChange(newArray);

    // Notificar sobre o primeiro ônibus (principal)
    if (newArray.length === 1 && onPrimaryBusChange) {
      onPrimaryBusChange(onibus.tipo_onibus, onibus.empresa);
    }

    // Limpar o formulário
    setNewOnibus({
      tipo_onibus: "",
      empresa: "",
      capacidade_onibus: 0,
      lugares_extras: 0,
    });
  };

  const handleRemoveOnibus = (index: number) => {
    const newArray = onibusArray.filter((_, i) => i !== index);
    onChange(newArray);

    // Notificar sobre o novo primeiro ônibus se ainda houver ônibus
    if (newArray.length > 0 && onPrimaryBusChange) {
      onPrimaryBusChange(newArray[0].tipo_onibus, newArray[0].empresa);
    }
  };

  const handleSelectOnibus = (onibusId: string) => {
    const selectedOnibus = onibusList.find(o => o.id === onibusId);
    if (selectedOnibus) {
      setNewOnibus({
        tipo_onibus: selectedOnibus.tipo_onibus,
        empresa: selectedOnibus.empresa,
        capacidade_onibus: selectedOnibus.capacidade,
        lugares_extras: 0,
      });
    }
  };

  const getTotalCapacidade = () => {
    return onibusArray.reduce((total, onibus) => 
      total + onibus.capacidade_onibus + (onibus.lugares_extras || 0), 0
    );
  };

  return (
    <div className="space-y-6">
      {/* Lista de ônibus adicionados */}
      {onibusArray.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Bus className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Ônibus da Viagem ({onibusArray.length})
            </h3>
            <div className="ml-auto text-sm text-gray-600">
              Capacidade Total: {getTotalCapacidade()} passageiros
            </div>
          </div>
          
          {onibusArray.map((onibus, index) => (
            <Card key={onibus.id} className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Empresa</Label>
                        <p className="text-sm text-gray-900">{onibus.empresa}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Tipo</Label>
                        <p className="text-sm text-gray-900">{onibus.tipo_onibus}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Capacidade Base</Label>
                        <p className="text-sm text-gray-900">{onibus.capacidade_onibus} lugares</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Lugares Extras</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={onibus.lugares_extras || 0}
                            onChange={(e) => {
                              const newLugaresExtras = parseInt(e.target.value) || 0;
                              const updatedArray = onibusArray.map((o, i) => 
                                i === index ? { ...o, lugares_extras: newLugaresExtras } : o
                              );
                              onChange(updatedArray);
                            }}
                            className="w-20 h-8 text-sm border-gray-300 focus:border-blue-500"
                          />
                          <span className="text-xs text-gray-500">lugares</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Total</Label>
                        <p className="text-sm font-bold text-blue-600">
                          {onibus.capacidade_onibus + (onibus.lugares_extras || 0)} lugares
                        </p>
                      </div>
                    </div>
                    {index === 0 && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Ônibus Principal
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveOnibus(index)}
                    className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Formulário para adicionar novo ônibus */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            {onibusArray.length === 0 ? "Adicionar Primeiro Ônibus *" : "Adicionar Outro Ônibus"}
          </CardTitle>
          <p className="text-sm text-gray-600">
            {onibusArray.length === 0 
              ? "Adicione pelo menos um ônibus para a viagem" 
              : "Adicione ônibus adicionais se necessário"
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="onibus-select" className="text-gray-700 font-medium">
              Selecionar Ônibus Cadastrado *
            </Label>
            <Select onValueChange={handleSelectOnibus} disabled={loadingOnibus}>
              <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900">
                <SelectValue placeholder={loadingOnibus ? "Carregando..." : "Selecionar ônibus cadastrado"} />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 z-50 text-gray-900">
                {onibusList.map((onibus) => (
                  <SelectItem 
                    key={onibus.id} 
                    value={onibus.id}
                    className="bg-white text-gray-900 hover:bg-blue-50"
                  >
                    {onibus.empresa} - {onibus.tipo_onibus} ({onibus.capacidade} lugares)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              Apenas ônibus pré-cadastrados podem ser selecionados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="empresa" className="text-gray-700 font-medium">Empresa</Label>
              <Input
                id="empresa"
                value={newOnibus.empresa || ""}
                readOnly
                placeholder="Selecione um ônibus acima"
                className="border-gray-300 bg-gray-50 text-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="tipo_onibus" className="text-gray-700 font-medium">Tipo do Ônibus</Label>
              <Input
                id="tipo_onibus"
                value={newOnibus.tipo_onibus || ""}
                readOnly
                placeholder="Selecione um ônibus acima"
                className="border-gray-300 bg-gray-50 text-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="capacidade" className="text-gray-700 font-medium">Capacidade Base</Label>
              <Input
                id="capacidade"
                type="number"
                value={newOnibus.capacidade_onibus || ""}
                readOnly
                placeholder="Selecione um ônibus acima"
                className="border-gray-300 bg-gray-50 text-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="lugares_extras" className="text-gray-700 font-medium">Lugares Extras</Label>
              <Input
                id="lugares_extras"
                type="number"
                min="0"
                value={newOnibus.lugares_extras || ""}
                onChange={(e) => setNewOnibus(prev => ({ 
                  ...prev, 
                  lugares_extras: parseInt(e.target.value) || 0 
                }))}
                placeholder="0"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Assentos extras além da capacidade base
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleAddOnibus}
            disabled={!newOnibus.tipo_onibus || !newOnibus.empresa || !newOnibus.capacidade_onibus}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Ônibus Selecionado
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
