import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ContaPagarFormBasicoProps {
  onSubmit: (data: any) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

export const ContaPagarFormBasico = ({ onSubmit, onCancel, loading = false }: ContaPagarFormBasicoProps) => {
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
  const [fornecedor, setFornecedor] = useState('');
  const [dataVencimento, setDataVencimento] = useState(new Date().toISOString().split('T')[0]);
  const [recorrente, setRecorrente] = useState(false);
  const [observacoes, setObservacoes] = useState('');

  const categorias = [
    'Aluguel',
    'Energia Elétrica',
    'Água',
    'Internet',
    'Telefone',
    'Seguro',
    'Financiamento',
    'Fornecedores',
    'Serviços',
    'Impostos',
    'Outros'
  ];

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

    if (!fornecedor.trim()) {
      alert('Por favor, preencha o fornecedor');
      return;
    }

    const data = {
      descricao: descricao.trim(),
      valor: parseFloat(valor),
      categoria: categoria.trim(),
      fornecedor: fornecedor.trim(),
      data_vencimento: dataVencimento,
      status: 'pendente',
      recorrente: recorrente,
      observacoes: observacoes.trim()
    };

    try {
      const success = await onSubmit(data);
      if (success) {
        // Limpar formulário
        setDescricao('');
        setValor('');
        setCategoria('');
        setFornecedor('');
        setDataVencimento(new Date().toISOString().split('T')[0]);
        setRecorrente(false);
        setObservacoes('');
      }
    } catch (error) {
      console.error('Erro no formulário:', error);
      alert('Erro ao salvar conta a pagar');
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
            placeholder="Ex: Aluguel do galpão"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Label htmlFor="dataVencimento">Data de Vencimento *</Label>
            <Input
              id="dataVencimento"
              type="date"
              value={dataVencimento}
              onChange={(e) => setDataVencimento(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="categoria">Categoria *</Label>
            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              disabled={loading}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="fornecedor">Fornecedor *</Label>
            <Input
              id="fornecedor"
              value={fornecedor}
              onChange={(e) => setFornecedor(e.target.value)}
              placeholder="Ex: Imobiliária Santos"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="recorrente"
              checked={recorrente}
              onChange={(e) => setRecorrente(e.target.checked)}
              disabled={loading}
              className="rounded"
            />
            <Label htmlFor="recorrente">Conta recorrente (mensal)</Label>
          </div>
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
            className="flex-1 bg-amber-600 hover:bg-amber-700"
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