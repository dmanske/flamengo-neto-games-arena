// @ts-nocheck
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Save, 
  Users,
  Handshake,
  ShoppingBag,
  Star
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ViagemReceita } from '@/hooks/financeiro/useViagemFinanceiro';
import { toast } from 'sonner';

interface ReceitaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viagemId: string;
  onSalvar: (receita: Omit<ViagemReceita, 'id' | 'created_at'> | any) => void;
  receita?: ViagemReceita | null;
  isEditing?: boolean;
}

// Categorias de receita
const CATEGORIAS_RECEITA = {
  passageiro: {
    nome: 'Passageiro',
    icon: Users,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    descricao: 'Pagamentos de passagens'
  },
  patrocinio: {
    nome: 'Patrocínio',
    icon: Handshake,
    color: 'bg-green-50 text-green-700 border-green-200',
    descricao: 'Empresas parceiras e apoiadores'
  },
  vendas: {
    nome: 'Vendas',
    icon: ShoppingBag,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    descricao: 'Produtos da loja, camisetas'
  },
  extras: {
    nome: 'Extras',
    icon: Star,
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    descricao: 'Passeios adicionais, upgrades'
  }
};

const FORMAS_PAGAMENTO = [
  'Pix',
  'Cartão de Débito',
  'Cartão de Crédito',
  'Dinheiro',
  'Transferência',
  'Boleto'
];

export default function ReceitaForm({ open, onOpenChange, viagemId, onSalvar, receita, isEditing }: ReceitaFormProps) {
  const [formData, setFormData] = useState({
    descricao: '',
    categoria: 'passageiro',
    valor: '',
    forma_pagamento: 'Pix',
    status: 'recebido',
    data_recebimento: new Date().toISOString().split('T')[0],
    observacoes: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Preencher formulário quando estiver editando
  React.useEffect(() => {
    if (isEditing && receita) {
      setFormData({
        descricao: receita.descricao || '',
        categoria: receita.categoria || 'passageiro',
        valor: receita.valor?.toString() || '',
        forma_pagamento: receita.forma_pagamento || 'Pix',
        status: receita.status || 'recebido',
        data_recebimento: receita.data_recebimento?.split('T')[0] || new Date().toISOString().split('T')[0],
        observacoes: receita.observacoes || ''
      });
    } else {
      // Reset para valores padrão quando não estiver editando
      setFormData({
        descricao: '',
        categoria: 'passageiro',
        valor: '',
        forma_pagamento: 'Pix',
        status: 'recebido',
        data_recebimento: new Date().toISOString().split('T')[0],
        observacoes: ''
      });
    }
  }, [isEditing, receita, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao || !formData.categoria || !formData.valor) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && receita) {
        // Editar receita existente
        const receitaAtualizada = {
          descricao: formData.descricao,
          categoria: formData.categoria as any,
          valor: parseFloat(formData.valor),
          forma_pagamento: formData.forma_pagamento,
          status: formData.status as any,
          data_recebimento: formData.data_recebimento,
          observacoes: formData.observacoes || undefined
        };

        await onSalvar(receita.id, receitaAtualizada);
        toast.success('Receita atualizada com sucesso!');
      } else {
        // Criar nova receita
        const novaReceita: Omit<ViagemReceita, 'id' | 'created_at'> = {
          viagem_id: viagemId,
          descricao: formData.descricao,
          categoria: formData.categoria as any,
          valor: parseFloat(formData.valor),
          forma_pagamento: formData.forma_pagamento,
          status: formData.status as any,
          data_recebimento: formData.data_recebimento,
          observacoes: formData.observacoes || undefined
        };

        await onSalvar(novaReceita);
        toast.success('Receita adicionada com sucesso!');
      }
      
      onOpenChange(false);
    } catch (error) {
      toast.error(isEditing ? 'Erro ao atualizar receita' : 'Erro ao salvar receita');
    } finally {
      setIsLoading(false);
    }
  };

  const categoriaInfo = CATEGORIAS_RECEITA[formData.categoria as keyof typeof CATEGORIAS_RECEITA];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            {isEditing ? 'Editar Receita' : 'Adicionar Receita'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Ex: João Silva, Patrocínio XYZ"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="valor">Valor (R$) *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_recebimento">Data do Recebimento *</Label>
                  <Input
                    id="data_recebimento"
                    type="date"
                    value={formData.data_recebimento}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_recebimento: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
                  <Select 
                    value={formData.forma_pagamento} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, forma_pagamento: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAS_PAGAMENTO.map(forma => (
                        <SelectItem key={forma} value={forma}>
                          {forma}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categorização */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Categoria *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {Object.entries(CATEGORIAS_RECEITA).map(([key, categoria]) => {
                    const Icon = categoria.icon;
                    const isSelected = formData.categoria === key;
                    
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, categoria: key }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isSelected 
                            ? categoria.color + ' border-current' 
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-xs font-medium">{categoria.nome}</div>
                        <div className="text-xs opacity-75 mt-1">{categoria.descricao}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status e Observações */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recebido">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">Recebido</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="pendente">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="cancelado">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Informações adicionais sobre a receita..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview do Valor */}
          {formData.valor && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-green-700">Valor da Receita:</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(parseFloat(formData.valor) || 0)}
                  </p>
                  {categoriaInfo && (
                    <Badge className={categoriaInfo.color + ' mt-2'}>
                      {categoriaInfo.nome}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              disabled={isLoading || !formData.descricao || !formData.categoria || !formData.valor}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Atualizar Receita' : 'Salvar Receita'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}