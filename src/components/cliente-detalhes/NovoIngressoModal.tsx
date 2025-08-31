import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Ticket, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/formatters';
import { useSetoresMaracana } from '@/hooks/useSetoresMaracana';

interface NovoIngressoModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: {
    id: number;
    nome: string;
  };
  onSuccess?: () => void;
}

const NovoIngressoModal: React.FC<NovoIngressoModalProps> = ({
  isOpen,
  onClose,
  cliente,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [dataJogo, setDataJogo] = useState<Date>();
  const [formData, setFormData] = useState({
    adversario: '',
    local_jogo: 'casa' as 'casa' | 'fora',
    setor_estadio: '',
    valor_compra: '',
    valor_venda: '',
    situacao_financeira: 'pendente' as 'pago' | 'pendente' | 'cancelado',
    forma_pagamento: '',
    observacoes: ''
  });

  const { setores, loading: setoresLoading } = useSetoresMaracana();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dataJogo) {
      toast.error('Selecione a data do jogo');
      return;
    }

    if (!formData.adversario.trim()) {
      toast.error('Informe o adversário');
      return;
    }

    if (!formData.setor_estadio) {
      toast.error('Selecione o setor do estádio');
      return;
    }

    if (!formData.valor_compra || parseFloat(formData.valor_compra) <= 0) {
      toast.error('Informe um valor de compra válido');
      return;
    }

    if (!formData.valor_venda || parseFloat(formData.valor_venda) <= 0) {
      toast.error('Informe um valor de venda válido');
      return;
    }

    try {
      setLoading(true);

      const valorCompra = parseFloat(formData.valor_compra);
      const valorVenda = parseFloat(formData.valor_venda);
      const lucro = valorVenda - valorCompra;

      const ingressoData = {
        cliente_id: cliente.id,
        adversario: formData.adversario.trim(),
        jogo_data: dataJogo.toISOString(),
        local_jogo: formData.local_jogo,
        setor_estadio: formData.setor_estadio,
        valor_compra: valorCompra,
        valor_final: valorVenda,
        lucro: lucro,
        situacao_financeira: formData.situacao_financeira,
        forma_pagamento: formData.forma_pagamento.trim() || null,
        observacoes: formData.observacoes.trim() || null,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('ingressos')
        .insert([ingressoData]);

      if (error) throw error;

      toast.success('Ingresso cadastrado com sucesso!');
      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        adversario: '',
        local_jogo: 'casa',
        setor_estadio: '',
        valor_compra: '',
        valor_venda: '',
        situacao_financeira: 'pendente',
        forma_pagamento: '',
        observacoes: ''
      });
      setDataJogo(undefined);

    } catch (error) {
      console.error('Erro ao cadastrar ingresso:', error);
      toast.error('Erro ao cadastrar ingresso');
    } finally {
      setLoading(false);
    }
  };

  const calcularLucro = () => {
    const compra = parseFloat(formData.valor_compra) || 0;
    const venda = parseFloat(formData.valor_venda) || 0;
    return venda - compra;
  };

  const lucro = calcularLucro();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-blue-600" />
            Novo Ingresso
          </DialogTitle>
          <DialogDescription>
            Cadastrando ingresso para <strong>{cliente.nome}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações do Jogo */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Informações do Jogo</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adversario">Adversário *</Label>
                <Input
                  id="adversario"
                  value={formData.adversario}
                  onChange={(e) => setFormData(prev => ({ ...prev, adversario: e.target.value }))}
                  placeholder="Ex: Botafogo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Data do Jogo *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataJogo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataJogo ? format(dataJogo, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dataJogo}
                      onSelect={setDataJogo}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="local_jogo">Local do Jogo</Label>
                <Select
                  value={formData.local_jogo}
                  onValueChange={(value: 'casa' | 'fora') => 
                    setFormData(prev => ({ ...prev, local_jogo: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casa">🏠 Casa</SelectItem>
                    <SelectItem value="fora">✈️ Fora</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="setor_estadio">Setor do Estádio *</Label>
                <Select
                  value={formData.setor_estadio}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, setor_estadio: value }))
                  }
                  disabled={setoresLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {setores.map((setor) => (
                      <SelectItem key={setor.id} value={setor.nome}>
                        {setor.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Informações Financeiras */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Informações Financeiras</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor_compra">Valor de Compra *</Label>
                <Input
                  id="valor_compra"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor_compra}
                  onChange={(e) => setFormData(prev => ({ ...prev, valor_compra: e.target.value }))}
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor_venda">Valor de Venda *</Label>
                <Input
                  id="valor_venda"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor_venda}
                  onChange={(e) => setFormData(prev => ({ ...prev, valor_venda: e.target.value }))}
                  placeholder="0,00"
                  required
                />
              </div>
            </div>

            {/* Mostrar lucro calculado */}
            {formData.valor_compra && formData.valor_venda && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lucro calculado:</span>
                  <Badge className={lucro >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {formatCurrency(lucro)}
                  </Badge>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="situacao_financeira">Situação Financeira</Label>
                <Select
                  value={formData.situacao_financeira}
                  onValueChange={(value: 'pago' | 'pendente' | 'cancelado') => 
                    setFormData(prev => ({ ...prev, situacao_financeira: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
                <Input
                  id="forma_pagamento"
                  value={formData.forma_pagamento}
                  onChange={(e) => setFormData(prev => ({ ...prev, forma_pagamento: e.target.value }))}
                  placeholder="Ex: PIX, Cartão, Dinheiro"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações adicionais sobre o ingresso..."
              rows={3}
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <>Cadastrando...</>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Cadastrar Ingresso
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NovoIngressoModal;