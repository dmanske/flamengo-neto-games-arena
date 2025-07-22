import { useState } from 'react';
import { Plus, DollarSign, TrendingDown, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DespesaFormBasico } from '@/components/financeiro/despesas/DespesaFormBasico';
import { useDespesas } from '@/hooks/financeiro/useDespesas';
import { toast } from 'sonner';

export default function DespesasSimples() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { despesas, loading: despesasLoading, createDespesa, updateDespesa, fetchDespesas } = useDespesas();

  const handleSubmitDespesa = async (data: any) => {
    try {
      console.log('Dados da despesa a serem enviados:', data);
      const success = await createDespesa(data);
      console.log('Resultado da criação:', success);
      if (success) {
        setIsDialogOpen(false);
        // Recarregar a lista para garantir sincronização
        await fetchDespesas();
        toast.success('Despesa cadastrada com sucesso!');
      }
      return success;
    } catch (error) {
      console.error('Erro ao cadastrar despesa:', error);
      toast.error('Erro ao cadastrar despesa');
      return false;
    }
  };

  const handleStatusChange = async (id: string, novoStatus: 'pendente' | 'pago' | 'vencido' | 'cancelado') => {
    try {
      await updateDespesa(id, { status: novoStatus });
      toast.success('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'vencido':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelado':
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
  const totalDespesas = despesas?.reduce((sum, despesa) => sum + despesa.valor, 0) || 0;
  const despesasPagas = despesas?.filter(d => d.status === 'pago').reduce((sum, despesa) => sum + despesa.valor, 0) || 0;
  const despesasPendentes = despesas?.filter(d => d.status === 'pendente').reduce((sum, despesa) => sum + despesa.valor, 0) || 0;

  if (despesasLoading) {
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
  if (!despesas && !despesasLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <h3 className="text-lg font-medium">Erro ao carregar despesas</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">Despesas</h1>
          <p className="text-gray-600">Gerencie suas despesas e pagamentos</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => {
              console.log('Botão Nova Despesa clicado');
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Despesa
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => {
              console.log('Recarregando lista de despesas...');
              fetchDespesas();
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
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalDespesas)}
            </div>
            <p className="text-xs text-muted-foreground">
              {despesas?.length || 0} despesas cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagas</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(despesasPagas)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valores já pagos
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
              {formatCurrency(despesasPendentes)}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando pagamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Despesas */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Despesas</CardTitle>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!despesas || despesas.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma despesa cadastrada
              </h3>
              <p className="text-gray-600 mb-4">
                Comece cadastrando sua primeira despesa
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Despesa
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {despesas.map((despesa) => (
                <div
                  key={despesa.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {despesa.descricao}
                      </h3>
                      <Badge className={getStatusColor(despesa.status)}>
                        {despesa.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Categoria: {despesa.categoria}</span>
                      <span>Vencimento: {formatDate(despesa.data_vencimento)}</span>
                    </div>
                    
                    {despesa.observacoes && (
                      <p className="text-sm text-gray-500 mt-1">
                        {despesa.observacoes}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold text-red-600">
                      {formatCurrency(despesa.valor)}
                    </div>
                    
                    <div className="flex gap-2 mt-2">
                      {despesa.status === 'pendente' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(despesa.id, 'pago')}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          Marcar como Pago
                        </Button>
                      )}
                      
                      {despesa.status === 'pago' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(despesa.id, 'pendente')}
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

      {/* Modal Simples para Nova Despesa */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Cadastrar Nova Despesa</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsDialogOpen(false)}
              >
                ✕
              </Button>
            </div>
            <div className="p-4">
              <DespesaFormBasico
                onSubmit={handleSubmitDespesa}
                onCancel={() => {
                  console.log('Cancelando formulário');
                  setIsDialogOpen(false);
                }}
                loading={despesasLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}