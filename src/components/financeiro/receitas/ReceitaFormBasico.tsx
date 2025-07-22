import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ReceitaFormBasicoProps {
  onSubmit: (data: any) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

export const ReceitaFormBasico = ({ onSubmit, onCancel, loading = false }: ReceitaFormBasicoProps) => {
  // Verificação de segurança
  if (!onSubmit || !onCancel) {
    return (
      <div className="p-4 text-center text-red-600">
        Erro: Propriedades obrigatórias não fornecidas
      </div>
    );
  }
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!descricao.trim()) {
      alert('Por favor, preencha a descrição');
      return;
    }
    
    if (!valor || parseFloat(valor) <= 0) {
      alert('Por favor, preencha um valor válido');
      return;
    }
    
    if (!categoria.trim()) {
      alert('Por favor, preencha a categoria');
      return;
    }

    const data = {
      descricao: descricao.trim(),
      valor: parseFloat(valor),
      categoria: categoria.trim(),
      data_recebimento: new Date().toISOString().split('T')[0],
      status: 'recebido',
      metodo_pagamento: 'dinheiro',
      observacoes: observacoes.trim()
    };

    try {
      const success = await onSubmit(data);
      if (success) {
        // Limpar formulário
        setDescricao('');
        setValor('');
        setCategoria('');
        setObservacoes('');
      }
    } catch (error) {
      console.error('Erro no formulário:', error);
      alert('Erro ao salvar receita');
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="descricao">Descrição *</Label>
          <Input
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Pagamento da viagem"
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="valor">Valor (R$) *</Label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            min="0"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0.00"
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="categoria">Categoria *</Label>
          <Input
            id="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            placeholder="Ex: Pagamento de Viagem"
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Informações adicionais..."
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="flex gap-2 pt-4">
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