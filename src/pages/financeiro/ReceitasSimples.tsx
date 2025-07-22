import { useState } from 'react';
import { Plus, DollarSign, TrendingUp, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { ReceitaFormBasico } from '@/components/financeiro/receitas/ReceitaFormBasico';
import { useReceitas } from '@/hooks/financeiro/useReceitas';
import { toast } from 'sonner';


export default function ReceitasSimples() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { receitas, loading, createReceita, updateReceita, fetchReceitas } = useReceitas();

  const handleSubmitReceita = async (data: any) => {
    try {
      console.log('Dados da receita a serem enviados:', data);
      const success = await createReceita(data);
      console.log('Resultado da criação:', success);
      if (success) {
        setIsDialogOpen(false);
        // Recarregar a lista para garantir sincronização
        await fetchReceitas();
        toast.success('Receita cadastrada com sucesso!');
      }
      return success;
    } catch (error) {
      console.error('Erro ao cadastrar receita:', error);
      toast.error('Erro ao cadastrar receita');
      return false;
    }
  };

  const handleStatusChange = async (id: string, novoStatus: 'recebido' | 'pendente' | 'cancelado') => {
    try {
      await updateReceita(id, { status: novoStatus });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recebido':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Calcular totais
  const totalReceitas = receitas?.reduce((sum, receita) => sum + receita.valor, 0) || 0;
  const receitasRecebidas = receitas?.filter(r => r.status === 'recebido').reduce((sum, receita) => sum + receita.valor, 0) || 0;
  const receitasPendentes = receitas?.filter(r => r.status === 'pendente').reduce((sum, receita) => sum + receita.valor, 0) || 0;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Tratamento de erro para evitar tela branca
  if (!receitas && !loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <h3 className="text-lg font-medium">Erro ao carregar receitas</h3>
            <p className="text-sm">Verifique se as tabelas do banco foram criadas.</p>
          </div>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receitas</h1>
          <p className="text-gray-600">Gerencie suas receitas e recebimentos</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => {
              console.log('Botão Nova Receita clicado');
              try {
                setIsDialogOpen(true);
                console.log('Dialog aberto com sucesso');
              } catch (error) {
                console.error('Erro ao abrir dialog:', error);
                alert('Erro ao abrir formulário: ' + error);
              }
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Receita
          </Button>
        
        <Button 
          variant="outline" 
          onClick={() => {
            console.log('Recarregando lista de receitas...');
            fetchReceitas();
            toast.success('Lista atualizada!');
          }}
          className="text-blue-600 border-blue-600"
        >
          Atualizar Lista
        </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalReceitas)}
            </div>
            <p className="text-xs text-muted-foreground">
              {receitas?.length || 0} receitas cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recebidas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(receitasRecebidas)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valores já recebidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(receitasPendentes)}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando recebimento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Receitas */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Receitas</CardTitle>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!receitas || receitas.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma receita cadastrada
              </h3>
              <p className="text-gray-600 mb-4">
                Comece cadastrando sua primeira receita
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Receita
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {receitas.map((receita) => (
                <div
                  key={receita.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {receita.descricao}
                      </h3>
                      <Badge className={getStatusColor(receita.status)}>
                        {receita.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Categoria: {receita.categoria}</span>
                      <span>Data: {formatDate(receita.data_recebimento || receita.created_at)}</span>
                      {receita.metodo_pagamento && (
                        <span>Método: {receita.metodo_pagamento}</span>
                      )}
                    </div>
                    
                    {receita.observacoes && (
                      <p className="text-sm text-gray-500 mt-1">
                        {receita.observacoes}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(receita.valor)}
                    </div>
                    
                    <div className="flex gap-2 mt-2">
                      {receita.status === 'pendente' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(receita.id, 'recebido')}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          Marcar como Recebido
                        </Button>
                      )}
                      
                      {receita.status === 'recebido' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(receita.id, 'pendente')}
                          className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                        >
                          Marcar como Pendente
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Simples para Nova Receita */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Cadastrar Nova Receita</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsDialogOpen(false)}
              >
                ✕
              </Button>
            </div>
            <div className="p-4">
              <ReceitaFormBasico
                onSubmit={handleSubmitReceita}
                onCancel={() => {
                  console.log('Cancelando formulário');
                  setIsDialogOpen(false);
                }}
                loading={loading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}