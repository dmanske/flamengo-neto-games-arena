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
  Receipt, 
  Upload, 
  Save, 
  X,
  Truck,
  Hotel,
  UtensilsCrossed,
  Ticket,
  Users,
  FileText
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ViagemDespesa } from '@/hooks/financeiro/useViagemFinanceiro';
import { toast } from 'sonner';

interface DespesaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viagemId: string;
  onSalvar: (despesa: Omit<ViagemDespesa, 'id' | 'created_at'> | any) => void;
  despesa?: ViagemDespesa | null;
  isEditing?: boolean;
}

// Categorias e subcategorias de despesas
const CATEGORIAS_DESPESAS = {
  transporte: {
    nome: 'Transporte',
    icon: Truck,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    subcategorias: ['combustivel', 'pedagio', 'manutencao', 'estacionamento', 'multas']
  },
  hospedagem: {
    nome: 'Hospedagem',
    icon: Hotel,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    subcategorias: ['hotel', 'pousada', 'airbnb', 'taxa_turismo']
  },
  alimentacao: {
    nome: 'Alimentação',
    icon: UtensilsCrossed,
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    subcategorias: ['cafe_manha', 'almoco', 'jantar', 'lanche', 'bebidas']
  },
  ingressos: {
    nome: 'Ingressos',
    icon: Ticket,
    color: 'bg-green-50 text-green-700 border-green-200',
    subcategorias: ['estadio', 'passeios', 'transporte_publico', 'atrações']
  },
  pessoal: {
    nome: 'Pessoal',
    icon: Users,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    subcategorias: ['motorista', 'guia', 'comissoes', 'ajuda_custo']
  },
  administrativo: {
    nome: 'Administrativo',
    icon: FileText,
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    subcategorias: ['seguro', 'taxas', 'documentos', 'comunicacao']
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

export default function DespesaForm({ open, onOpenChange, viagemId, onSalvar, despesa, isEditing }: DespesaFormProps) {
  const [formData, setFormData] = useState({
    fornecedor: '',
    categoria: '',
    subcategoria: '',
    valor: '',
    forma_pagamento: 'Pix',
    status: 'pago',
    data_despesa: new Date().toISOString().split('T')[0],
    observacoes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [comprovante, setComprovante] = useState<File | null>(null);

  // Preencher formulário quando estiver editando
  React.useEffect(() => {
    if (isEditing && despesa) {
      setFormData({
        fornecedor: despesa.fornecedor || '',
        categoria: despesa.categoria || '',
        subcategoria: despesa.subcategoria || '',
        valor: despesa.valor?.toString() || '',
        forma_pagamento: despesa.forma_pagamento || 'Pix',
        status: despesa.status || 'pago',
        data_despesa: despesa.data_despesa?.split('T')[0] || new Date().toISOString().split('T')[0],
        observacoes: despesa.observacoes || ''
      });
    } else {
      // Reset para valores padrão quando não estiver editando
      setFormData({
        fornecedor: '',
        categoria: '',
        subcategoria: '',
        valor: '',
        forma_pagamento: 'Pix',
        status: 'pago',
        data_despesa: new Date().toISOString().split('T')[0],
        observacoes: ''
      });
    }
    setComprovante(null);
  }, [isEditing, despesa, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fornecedor || !formData.categoria || !formData.valor) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    try {
      const despesa: Omit<ViagemDespesa, 'id' | 'created_at'> = {
        viagem_id: viagemId,
        fornecedor: formData.fornecedor,
        categoria: formData.categoria as any,
        subcategoria: formData.subcategoria || undefined,
        valor: parseFloat(formData.valor),
        forma_pagamento: formData.forma_pagamento,
        status: formData.status as any,
        data_despesa: formData.data_despesa,
        observacoes: formData.observacoes || undefined,
        comprovante_url: undefined // TODO: Implementar upload de arquivo
      };

      onSalvar(despesa);
      
      toast.success('Despesa adicionada com sucesso!');
      
      // Reset form
      setFormData({
        fornecedor: '',
        categoria: '',
        subcategoria: '',
        valor: '',
        forma_pagamento: 'Pix',
        status: 'pago',
        data_despesa: new Date().toISOString().split('T')[0],
        observacoes: ''
      });
      setComprovante(null);
      
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao salvar despesa');
    } finally {
      setIsLoading(false);
    }
  };

  const categoriaInfo = formData.categoria ? CATEGORIAS_DESPESAS[formData.categoria as keyof typeof CATEGORIAS_DESPESAS] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-blue-600" />
            Adicionar Despesa
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fornecedor">Fornecedor *</Label>
                  <Input
                    id="fornecedor"
                    value={formData.fornecedor}
                    onChange={(e) => setFormData(prev => ({ ...prev, fornecedor: e.target.value }))}
                    placeholder="Ex: Posto Shell, Hotel Copacabana"
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
                  <Label htmlFor="data_despesa">Data da Despesa *</Label>
                  <Input
                    id="data_despesa"
                    type="date"
                    value={formData.data_despesa}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_despesa: e.target.value }))}
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {Object.entries(CATEGORIAS_DESPESAS).map(([key, categoria]) => {
                    const Icon = categoria.icon;
                    const isSelected = formData.categoria === key;
                    
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          categoria: key,
                          subcategoria: '' // Reset subcategoria
                        }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isSelected 
                            ? categoria.color + ' border-current' 
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-xs font-medium">{categoria.nome}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {categoriaInfo && (
                <div>
                  <Label>Subcategoria</Label>
                  <Select 
                    value={formData.subcategoria} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, subcategoria: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma subcategoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriaInfo.subcategorias.map(sub => (
                        <SelectItem key={sub} value={sub}>
                          {sub.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
                    <SelectItem value="pago">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">Pago</Badge>
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
                  placeholder="Informações adicionais sobre a despesa..."
                  rows={3}
                />
              </div>

              {/* Upload de Comprovante */}
              <div>
                <Label>Comprovante</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Arraste um arquivo ou clique para selecionar
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, JPG, PNG até 5MB
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setComprovante(e.target.files?.[0] || null)}
                      className="hidden"
                      id="comprovante"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => document.getElementById('comprovante')?.click()}
                    >
                      Selecionar Arquivo
                    </Button>
                  </div>
                  
                  {comprovante && (
                    <div className="mt-3 p-2 bg-blue-50 rounded flex items-center justify-between">
                      <span className="text-sm text-blue-700">{comprovante.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setComprovante(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview do Valor */}
          {formData.valor && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-blue-700">Valor da Despesa:</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(parseFloat(formData.valor) || 0)}
                  </p>
                  {categoriaInfo && (
                    <Badge className={categoriaInfo.color + ' mt-2'}>
                      {categoriaInfo.nome}
                      {formData.subcategoria && ` - ${formData.subcategoria.replace('_', ' ')}`}
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
              disabled={isLoading || !formData.fornecedor || !formData.categoria || !formData.valor}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Despesa
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}