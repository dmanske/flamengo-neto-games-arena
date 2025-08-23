import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { toast } from 'sonner';

interface ReceitaFormSimplesProps {
  onSubmit: (data: any) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

export const ReceitaFormSimples: React.FC<ReceitaFormSimplesProps> = ({
  onSubmit,
  onCancel,
  loading = false
}) => {
  // Verificação de segurança para evitar tela branca
  if (!onSubmit || !onCancel) {
    console.error('ReceitaFormSimples: onSubmit e onCancel são obrigatórios');
    return (
      <div className="p-4 text-center">
        <p className="text-red-600">Erro: Propriedades obrigatórias não fornecidas</p>
      </div>
    );
  }
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    categoria: '',
    data_recebimento: new Date().toISOString().split('T')[0],
    status: 'recebido',
    metodo_pagamento: '',
    observacoes: ''
  });

  const categorias = [
    { nome: 'Pagamento de Viagem', cor: '#10b981' },
    { nome: 'Venda de Produtos', cor: '#3b82f6' },
    { nome: 'Serviços Extras', cor: '#8b5cf6' },
    { nome: 'Patrocínio', cor: '#f59e0b' },
    { nome: 'Outros Recebimentos', cor: '#6b7280' }
  ];

  const metodosPagamento = [
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'pix', label: 'PIX' },
    { value: 'cartao_credito', label: 'Cartão de Crédito' },
    { value: 'cartao_debito', label: 'Cartão de Débito' },
    { value: 'transferencia', label: 'Transferência' },
    { value: 'boleto', label: 'Boleto' },
    { value: 'outros', label: 'Outros' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Iniciando submissão do formulário:', formData);
      
      // Validação básica
      if (!formData.descricao || !formData.valor || !formData.categoria) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      // Validação do valor
      const valorNumerico = parseFloat(formData.valor);
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        toast.error('Valor deve ser um número maior que zero');
        return;
      }

      const data = {
        ...formData,
        valor: valorNumerico
      };

      console.log('Dados processados para envio:', data);
      
      const success = await onSubmit(data);
      console.log('Resultado do onSubmit:', success);
      
      if (success) {
        // Reset form
        setFormData({
          descricao: '',
          valor: '',
          categoria: '',
          data_recebimento: new Date().toISOString().split('T')[0],
          status: 'recebido',
          metodo_pagamento: '',
          observacoes: ''
        });
        // Formulário resetado com sucesso
      }
    } catch (error) {
      console.error('Erro no handleSubmit:', error);
      toast.error('Erro interno no formulário');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              placeholder="Ex: Pagamento viagem São Paulo"
              required
            />
          </div>

          {/* Valor e Data */}
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
              <Label htmlFor="data_recebimento">Data de Recebimento *</Label>
              <Input
                id="data_recebimento"
                type="date"
                value={formData.data_recebimento}
                onChange={(e) => handleInputChange('data_recebimento', e.target.value)}
                required
              />
            </div>
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

          {/* Status e Método de Pagamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => handleInputChange('status', value)} defaultValue="recebido">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recebido">Recebido</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metodo_pagamento">Método de Pagamento</Label>
              <Select onValueChange={(value) => handleInputChange('metodo_pagamento', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao_informado">Não informado</SelectItem>
                  {metodosPagamento.map((metodo) => (
                    <SelectItem key={metodo.value} value={metodo.value}>
                      {metodo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Informações adicionais sobre a receita..."
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
    </div>
  );
};