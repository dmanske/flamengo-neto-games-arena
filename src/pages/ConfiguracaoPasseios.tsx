import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Save, 
  Trash2, 
  Calculator, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { usePasseiosCustos } from '@/hooks/usePasseiosCustos';
import type { PasseioComCalculos, NovoPasseioFormData } from '@/types/passeio';

export default function ConfiguracaoPasseios() {
  const navigate = useNavigate();
  const {
    passeios,
    resumo,
    loading,
    error,
    atualizarCusto,
    atualizarValor,
    adicionarPasseio,
    deletarPasseio,
    salvarTodosCustos
  } = usePasseiosCustos();

  const [activeTab, setActiveTab] = useState('pagos');
  const [isSaving, setIsSaving] = useState(false);

  // Separar passeios por categoria
  const passeiosPagos = passeios.filter(p => p.categoria === 'pago');
  const passeiosGratuitos = passeios.filter(p => p.categoria === 'gratuito');

  const handleSalvarTodos = async () => {
    setIsSaving(true);
    await salvarTodosCustos();
    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-slate-600">Carregando configuração de passeios...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Erro ao Carregar Passeios</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-700 bg-clip-text text-transparent">
              🎢 Configuração de Passeios
            </h1>
            <p className="text-slate-600 mt-2">
              Configure preços de venda, custos operacionais e gerencie todos os passeios disponíveis
            </p>
          </div>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Passeios Pagos</p>
                <p className="text-2xl font-bold text-blue-600">{resumo.total_passeios_pagos}</p>
              </div>
              <Calculator className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Passeios Gratuitos</p>
                <p className="text-2xl font-bold text-green-600">{resumo.total_passeios_gratuitos}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Margem Média</p>
                <p className="text-2xl font-bold text-purple-600">
                  {resumo.margem_media.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertas</p>
                <p className="text-2xl font-bold text-orange-600">{resumo.alertas_count}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {resumo.passeios_com_prejuizo} prejuízo, {resumo.passeios_margem_baixa} margem baixa
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Importantes */}
      {resumo.alertas_count > 0 && (
        <div className="mb-6 space-y-3">
          {resumo.passeios_com_prejuizo > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">
                  {resumo.passeios_com_prejuizo} passeio(s) com prejuízo
                </span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Alguns passeios têm custo maior que o preço de venda. Revise os valores na aba "Passeios Pagos".
              </p>
            </div>
          )}
          
          {resumo.passeios_margem_baixa > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">
                  {resumo.passeios_margem_baixa} passeio(s) com margem baixa
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Alguns passeios têm margem de lucro abaixo de 20%. Considere ajustar preços ou custos.
              </p>
            </div>
          )}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pagos">
            Passeios Pagos ({resumo.total_passeios_pagos})
          </TabsTrigger>
          <TabsTrigger value="gratuitos">
            Passeios Gratuitos ({resumo.total_passeios_gratuitos})
          </TabsTrigger>
          <TabsTrigger value="adicionar">
            Adicionar Novo
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: PASSEIOS PAGOS */}
        <TabsContent value="pagos" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>💰 Passeios Pagos - Configuração de Custos</CardTitle>
                  <CardDescription>
                    Configure os custos operacionais para calcular o lucro real de cada passeio
                  </CardDescription>
                </div>
                <Button 
                  onClick={handleSalvarTodos} 
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar Todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Header da tabela */}
                <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 rounded-lg font-medium text-sm text-gray-700">
                  <div className="col-span-4">Nome do Passeio</div>
                  <div className="col-span-2 text-center">Preço Venda</div>
                  <div className="col-span-2 text-center">Custo Operacional</div>
                  <div className="col-span-2 text-center">Lucro Unitário</div>
                  <div className="col-span-1 text-center">Margem</div>
                  <div className="col-span-1 text-center">Ações</div>
                </div>

                {/* Lista de passeios pagos */}
                {passeiosPagos.map((passeio) => (
                  <PasseioConfigRow
                    key={passeio.id}
                    passeio={passeio}
                    onUpdateCusto={(novoCusto) => atualizarCusto(passeio.id, novoCusto)}
                    onUpdateValor={(novoValor) => atualizarValor(passeio.id, novoValor)}
                    onDelete={() => deletarPasseio(passeio.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 2: PASSEIOS GRATUITOS */}
        <TabsContent value="gratuitos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🎁 Passeios Gratuitos - Apenas Informativo</CardTitle>
              <CardDescription>
                Estes passeios são inclusos no pacote e não geram receita adicional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {passeiosGratuitos.map(passeio => (
                  <div key={passeio.id} className="p-4 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-800">{passeio.nome}</span>
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        Gratuito
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 3: ADICIONAR NOVO PASSEIO */}
        <TabsContent value="adicionar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>➕ Adicionar Novo Passeio</CardTitle>
              <CardDescription>
                Crie novos passeios que não estão na lista padrão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NovoPasseioForm onSave={adicionarPasseio} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componente para cada linha de passeio
interface PasseioConfigRowProps {
  passeio: PasseioComCalculos;
  onUpdateCusto: (novoCusto: number) => void;
  onUpdateValor: (novoValor: number) => void;
  onDelete: () => void;
}

const PasseioConfigRow: React.FC<PasseioConfigRowProps> = ({ 
  passeio, 
  onUpdateCusto, 
  onUpdateValor, 
  onDelete 
}) => {
  const [valores, setValores] = useState({
    valor: passeio.valor,
    custo: passeio.custo_operacional || 0
  });

  const handleUpdateValor = (novoValor: number) => {
    setValores(prev => ({ ...prev, valor: novoValor }));
    onUpdateValor(novoValor);
  };

  const handleUpdateCusto = (novoCusto: number) => {
    setValores(prev => ({ ...prev, custo: novoCusto }));
    onUpdateCusto(novoCusto);
  };

  return (
    <div className={`grid grid-cols-12 gap-4 p-3 border rounded-lg ${
      passeio.status_margem === 'prejuizo' ? 'bg-red-50 border-red-200' : 
      passeio.status_margem === 'baixa' ? 'bg-yellow-50 border-yellow-200' : 
      'bg-white border-gray-200'
    }`}>
      {/* Nome */}
      <div className="col-span-4 flex items-center">
        <span className="font-medium">{passeio.nome}</span>
        {passeio.status_margem === 'prejuizo' && (
          <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
        )}
        {passeio.status_margem === 'baixa' && (
          <AlertTriangle className="h-4 w-4 text-yellow-500 ml-2" />
        )}
      </div>

      {/* Preço de Venda */}
      <div className="col-span-2">
        <Input
          type="number"
          step="0.01"
          value={valores.valor}
          onChange={(e) => handleUpdateValor(parseFloat(e.target.value) || 0)}
          className="text-center"
          placeholder="0,00"
        />
      </div>

      {/* Custo Operacional */}
      <div className="col-span-2">
        <Input
          type="number"
          step="0.01"
          value={valores.custo}
          onChange={(e) => handleUpdateCusto(parseFloat(e.target.value) || 0)}
          className="text-center"
          placeholder="0,00"
        />
      </div>

      {/* Lucro Unitário */}
      <div className="col-span-2 flex items-center justify-center">
        <Badge className={
          passeio.status_margem === 'prejuizo' ? 'bg-red-100 text-red-800' :
          passeio.status_margem === 'baixa' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }>
          R$ {passeio.lucro_unitario.toFixed(2)}
        </Badge>
      </div>

      {/* Margem */}
      <div className="col-span-1 flex items-center justify-center">
        <span className={`font-medium ${
          passeio.status_margem === 'prejuizo' ? 'text-red-600' :
          passeio.status_margem === 'baixa' ? 'text-yellow-600' :
          'text-green-600'
        }`}>
          {passeio.margem_percentual.toFixed(1)}%
        </span>
      </div>

      {/* Ações */}
      <div className="col-span-1 flex items-center justify-center">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (window.confirm(`Tem certeza que deseja excluir o passeio "${passeio.nome}"?`)) {
              onDelete();
            }
          }}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Componente para adicionar novo passeio
interface NovoPasseioFormProps {
  onSave: (dados: NovoPasseioFormData) => Promise<any>;
}

const NovoPasseioForm: React.FC<NovoPasseioFormProps> = ({ onSave }) => {
  const [dados, setDados] = useState<NovoPasseioFormData>({
    nome: '',
    valor: 0,
    custo_operacional: 0,
    categoria: 'pago'
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dados.nome.trim()) {
      toast.error('Nome do passeio é obrigatório');
      return;
    }

    try {
      setIsSaving(true);
      await onSave(dados);
      setDados({ nome: '', valor: 0, custo_operacional: 0, categoria: 'pago' });
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setIsSaving(false);
    }
  };

  const lucroCalculado = dados.valor - dados.custo_operacional;
  const margemCalculada = dados.valor > 0 ? (lucroCalculado / dados.valor) * 100 : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Passeio *
          </label>
          <Input
            value={dados.nome}
            onChange={(e) => setDados(prev => ({ ...prev, nome: e.target.value }))}
            placeholder="Ex: Tour da Tijuca, Bondinho do Pão de Açúcar..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria *
          </label>
          <Select
            value={dados.categoria}
            onValueChange={(value: 'pago' | 'gratuito') => 
              setDados(prev => ({ ...prev, categoria: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="gratuito">Gratuito</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dados.categoria === 'pago' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço de Venda (R$) *
              </label>
              <Input
                type="number"
                step="0.01"
                value={dados.valor}
                onChange={(e) => setDados(prev => ({ 
                  ...prev, 
                  valor: parseFloat(e.target.value) || 0 
                }))}
                placeholder="0,00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custo Operacional (R$)
              </label>
              <Input
                type="number"
                step="0.01"
                value={dados.custo_operacional}
                onChange={(e) => setDados(prev => ({ 
                  ...prev, 
                  custo_operacional: parseFloat(e.target.value) || 0 
                }))}
                placeholder="0,00"
              />
            </div>
          </>
        )}
      </div>

      {dados.categoria === 'pago' && dados.valor > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Preview do Passeio:</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-600">Preço de Venda:</span>
              <p className="font-bold">R$ {dados.valor.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-blue-600">Custo Operacional:</span>
              <p className="font-bold">R$ {dados.custo_operacional.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-blue-600">Lucro Unitário:</span>
              <p className={`font-bold ${lucroCalculado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {lucroCalculado.toFixed(2)} ({margemCalculada.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Adicionar Passeio
        </Button>
      </div>
    </form>
  );
};