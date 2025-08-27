import React, { useState, useEffect } from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FiltrosCreditos, StatusCredito } from '@/types/creditos';
import { useClientes } from '@/hooks/useClientes';

interface FiltrosCreditosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filtros: FiltrosCreditos;
  onFiltrosChange: (filtros: FiltrosCreditos) => void;
}

export function FiltrosCreditosModal({
  open,
  onOpenChange,
  filtros,
  onFiltrosChange
}: FiltrosCreditosModalProps) {
  const { clientes, buscarClientes } = useClientes();
  const [filtrosLocais, setFiltrosLocais] = useState<FiltrosCreditos>(filtros);

  // Carregar clientes quando modal abrir
  useEffect(() => {
    if (open) {
      buscarClientes();
    }
  }, [open, buscarClientes]);

  // Sincronizar filtros quando props mudarem
  useEffect(() => {
    setFiltrosLocais(filtros);
  }, [filtros]);

  // Função para aplicar filtros
  const handleAplicarFiltros = () => {
    onFiltrosChange(filtrosLocais);
    onOpenChange(false);
  };

  // Função para limpar filtros
  const handleLimparFiltros = () => {
    const filtrosVazios: FiltrosCreditos = {};
    setFiltrosLocais(filtrosVazios);
    onFiltrosChange(filtrosVazios);
    onOpenChange(false);
  };

  // Função para atualizar filtro local
  const updateFiltro = (key: keyof FiltrosCreditos, value: any) => {
    setFiltrosLocais(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">Filtros Avançados</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Configure filtros detalhados para os créditos
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6">
          {/* Filtros por Cliente */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="cliente">Cliente Específico</Label>
                <Select 
                  value={filtrosLocais.cliente_id || 'todos'} 
                  onValueChange={(value) => updateFiltro('cliente_id', value === 'todos' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os clientes</SelectItem>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id.toString()}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Filtros por Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="status">Status do Crédito</Label>
                <Select 
                  value={filtrosLocais.status || 'todos'} 
                  onValueChange={(value) => updateFiltro('status', value === 'todos' ? undefined : value as StatusCredito)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="disponivel">✅ Disponível</SelectItem>
                    <SelectItem value="parcial">🟡 Parcial</SelectItem>
                    <SelectItem value="utilizado">🔴 Utilizado</SelectItem>
                    <SelectItem value="reembolsado">💸 Reembolsado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Filtros por Data */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Período</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="dataInicio">Data Inicial</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={filtrosLocais.data_inicio || ''}
                    onChange={(e) => updateFiltro('data_inicio', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="dataFim">Data Final</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={filtrosLocais.data_fim || ''}
                    onChange={(e) => updateFiltro('data_fim', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filtros por Valor */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Faixa de Valores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="valorMinimo">Valor Mínimo</Label>
                  <Input
                    id="valorMinimo"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="R$ 0,00"
                    value={filtrosLocais.valor_minimo || ''}
                    onChange={(e) => updateFiltro('valor_minimo', e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </div>

                <div>
                  <Label htmlFor="valorMaximo">Valor Máximo</Label>
                  <Input
                    id="valorMaximo"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="R$ 999.999,99"
                    value={filtrosLocais.valor_maximo || ''}
                    onChange={(e) => updateFiltro('valor_maximo', e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleLimparFiltros}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Limpar Filtros
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAplicarFiltros} className="gap-2">
              <Filter className="h-4 w-4" />
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}