import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface ContaPagarFormSimplesProps {
  onSubmit: (data: any) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

export const ContaPagarFormSimples: React.FC<ContaPagarFormSimplesProps> = ({
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    data_vencimento: '',
    fornecedor: '',
    categoria: '',
    status: 'pendente',
    recorrente: false,
    frequencia_recorrencia: '',
    observacoes: ''
  });

  const categorias = [
    { nome: 'Aluguel de Ônibus', cor: '#ef4444' },
    { nome: 'Combustível', cor: '#f97316' },
    { nome: 'Alimentação', cor: '#84cc16' },
    { nome: 'Hospedagem', cor: '#06b6d4' },
    { nome: 'Pedágio', cor: '#8b5cf6' },
    { nome: 'Manutenção', cor: '#64748b' },
    { nome: 'Seguro', cor: '#dc2626' },
    { nome: 'Outros Gastos', cor: '#6b7280' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.descricao || !formData.valor || !formData.data_vencimento || !formData.fornecedor || !formData.categoria) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const data = {
      ...formData,
      valor: parseFloat(formData.valor),
      frequencia_recorrencia: formData.recorrente ? formData.frequencia_recorrencia : undefined
    };

    const success = await onSubmit(data);
    if (success) {
      // Reset form
      setFormData({
        descricao: '',
        valor: '',
        data_vencimento: '',
        fornecedor: '',
        categoria: '',
        status: 'pendente',
        recorrente: false,
        frequencia_recorrencia: '',
        observacoes: ''
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Nova Conta a Pagar</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              placeholder="Ex: Aluguel do galpão"
              required
            />
          </div>

          {/* Valor e Fornecedor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor}
                onChange={(e) => handleInputChange('valor', e.target.value)}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor *</Label>
              <Input
                id="fornecedor"
                value={formData.fornecedor}
                onChange={(e) => handleInputChange('fornecedor', e.target.value)}
                placeholder="Nome do fornecedor"
                required
              />
            </div>
          </div>

          {/* Data de Vencimento */}
          <div className="space-y-2">
            <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
            <Input
              id="data_vencimento"
              type="date"
              value={formData.data_vencimento}
              onChange={(e) => handleInputChange('data_vencimento', e.target.value)}
              required
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria *</Label>
            <Select onValueChange={(value) => handleInputChange('categoria', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.nome} value={categoria.nome}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: categoria.cor }}
                      />
                      {categoria.nome}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recorrente */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recorrente"
                checked={formData.recorrente}
                onCheckedChange={(checked) => handleInputChange('recorrente', checked)}
              />
              <Label htmlFor="recorrente">Esta conta é recorrente</Label>
            </div>

            {formData.recorrente && (
              <div className="space-y-2">
                <Label htmlFor="frequencia">Frequência</Label>
                <Select onValueChange={(value) => handleInputChange('frequencia_recorrencia', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                    <SelectItem value="semestral">Semestral</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Informações adicionais..."
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};