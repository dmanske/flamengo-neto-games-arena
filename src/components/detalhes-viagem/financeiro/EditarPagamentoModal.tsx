import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Edit3, 
  Save, 
  X, 
  Calendar,
  DollarSign,
  CreditCard,
  MessageSquare,
  Tag
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { HistoricoPagamentoCategorizado, CategoriaPagamento } from '@/types/pagamentos-separados';

interface EditarPagamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  pagamento: HistoricoPagamentoCategorizado | null;
  onSalvar: (pagamentoId: string, dadosAtualizados: Partial<HistoricoPagamentoCategorizado>) => Promise<boolean>;
}

export function EditarPagamentoModal({
  isOpen,
  onClose,
  pagamento,
  onSalvar
}: EditarPagamentoModalProps) {
  const [formData, setFormData] = useState({
    valor_pago: '',
    data_pagamento: '',
    categoria: '' as CategoriaPagamento,
    forma_pagamento: '',
    observacoes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preencher formulário quando pagamento mudar
  useEffect(() => {
    if (pagamento) {
      // Converter data para formato local sem problemas de fuso horário
      let dataFormatada = '';
      if (pagamento.data_pagamento) {
        const data = new Date(pagamento.data_pagamento);
        // Usar getFullYear, getMonth, getDate para evitar problemas de fuso horário
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        dataFormatada = `${ano}-${mes}-${dia}`;
      }

      setFormData({
        valor_pago: pagamento.valor_pago?.toString() || '',
        data_pagamento: dataFormatada,
        categoria: pagamento.categoria || 'ambos',
        forma_pagamento: pagamento.forma_pagamento || 'pix',
        observacoes: pagamento.observacoes || ''
      });
      setErrors({});
    }
  }, [pagamento]);

  // Validar formulário
  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};

    if (!formData.valor_pago || parseFloat(formData.valor_pago) <= 0) {
      novosErros.valor_pago = 'Valor deve ser maior que zero';
    }

    if (!formData.data_pagamento) {
      novosErros.data_pagamento = 'Data é obrigatória';
    }

    if (!formData.categoria) {
      novosErros.categoria = 'Categoria é obrigatória';
    }

    if (!formData.forma_pagamento) {
      novosErros.forma_pagamento = 'Forma de pagamento é obrigatória';
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Salvar alterações
  const handleSalvar = async () => {
    if (!pagamento || !validarFormulario()) return;

    setIsLoading(true);
    try {
      // Criar data local sem problemas de fuso horário
      const [ano, mes, dia] = formData.data_pagamento.split('-').map(Number);
      const dataLocal = new Date(ano, mes - 1, dia, 12, 0, 0); // Meio-dia para evitar problemas de fuso

      const dadosAtualizados: Partial<HistoricoPagamentoCategorizado> = {
        valor_pago: parseFloat(formData.valor_pago),
        data_pagamento: dataLocal.toISOString(),
        categoria: formData.categoria,
        forma_pagamento: formData.forma_pagamento,
        observacoes: formData.observacoes || null
      };

      const sucesso = await onSalvar(pagamento.id, dadosAtualizados);
      
      if (sucesso) {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Resetar formulário ao fechar
  const handleClose = () => {
    setFormData({
      valor_pago: '',
      data_pagamento: '',
      categoria: 'ambos',
      forma_pagamento: 'pix',
      observacoes: ''
    });
    setErrors({});
    onClose();
  };

  if (!pagamento) return null;

  const getCategoriaLabel = (categoria: CategoriaPagamento) => {
    switch (categoria) {
      case 'viagem': return 'Viagem';
      case 'passeios': return 'Passeios';
      case 'ambos': return 'Viagem + Passeios';
      default: return categoria;
    }
  };

  const getCategoriaColor = (categoria: CategoriaPagamento) => {
    switch (categoria) {
      case 'viagem': return 'bg-blue-100 text-blue-800';
      case 'passeios': return 'bg-green-100 text-green-800';
      case 'ambos': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-md" 
        style={{ zIndex: 9999 }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Editar Pagamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do pagamento original */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Pagamento Original</span>
              <Badge className={getCategoriaColor(pagamento.categoria)}>
                {getCategoriaLabel(pagamento.categoria)}
              </Badge>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(pagamento.valor_pago)}
            </div>
            <div className="text-sm text-gray-600">
              {new Date(pagamento.data_pagamento).toLocaleDateString('pt-BR')}
            </div>
          </div>

          {/* Formulário de edição */}
          <div className="space-y-4">
            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="valor" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Valor
              </Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.valor_pago}
                onChange={(e) => setFormData(prev => ({ ...prev, valor_pago: e.target.value }))}
                className={errors.valor_pago ? 'border-red-500' : ''}
              />
              {errors.valor_pago && (
                <p className="text-sm text-red-600">{errors.valor_pago}</p>
              )}
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label htmlFor="data" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data do Pagamento
              </Label>
              <Input
                id="data"
                type="date"
                value={formData.data_pagamento}
                onChange={(e) => setFormData(prev => ({ ...prev, data_pagamento: e.target.value }))}
                className={errors.data_pagamento ? 'border-red-500' : ''}
              />
              {errors.data_pagamento && (
                <p className="text-sm text-red-600">{errors.data_pagamento}</p>
              )}
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Categoria
              </Label>
              <Select
                value={formData.categoria}
                onValueChange={(value: CategoriaPagamento) => 
                  setFormData(prev => ({ ...prev, categoria: value }))
                }
              >
                <SelectTrigger className={errors.categoria ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viagem">🚌 Viagem</SelectItem>
                  <SelectItem value="passeios">🎯 Passeios</SelectItem>
                  <SelectItem value="ambos">🎫 Viagem + Passeios</SelectItem>
                </SelectContent>
              </Select>
              {errors.categoria && (
                <p className="text-sm text-red-600">{errors.categoria}</p>
              )}
            </div>

            {/* Forma de Pagamento */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Forma de Pagamento
              </Label>
              <Select
                value={formData.forma_pagamento}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, forma_pagamento: value }))
                }
              >
                <SelectTrigger className={errors.forma_pagamento ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione a forma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                  <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                </SelectContent>
              </Select>
              {errors.forma_pagamento && (
                <p className="text-sm text-red-600">{errors.forma_pagamento}</p>
              )}
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Observações (opcional)
              </Label>
              <Textarea
                id="observacoes"
                placeholder="Observações sobre o pagamento..."
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSalvar}
              disabled={isLoading}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}