import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, AlertTriangle, Calendar, Clock } from "lucide-react";
import { ContaPagarFormBasico } from "@/components/financeiro/contas-pagar/ContaPagarFormBasico";
import { useContasPagar } from "@/hooks/financeiro/useContasPagar";
import { formatCurrency } from "@/utils/formatters";
import { toast } from "sonner";

const ContasPagarSimples = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { 
    contasPagar, 
    loading, 
    totalContasPagar,
    contasVencidas,
    contasVencendoHoje,
    contasVencendo7Dias,
    contasVencendo30Dias,
    createContaPagar,
    updateContaPagar,
    fetchContasPagar
  } = useContasPagar();

  const handleCreateConta = async (data: any) => {
    try {
      console.log('Dados da conta a serem enviados:', data);
      const success = await createContaPagar(data);
      console.log('Resultado da criação:', success);
      if (success) {
        setShowForm(false);
        // Recarregar a lista para garantir sincronização
        await fetchContasPagar();
        toast.success('Conta a pagar cadastrada com sucesso!');
      }
      return success;
    } catch (error) {
      console.error('Erro ao cadastrar conta a pagar:', error);
      toast.error('Erro ao cadastrar conta a pagar');
      return false;
    }
  };

  const exportData = () => {
    toast.info('Funcionalidade de exportação será implementada em breve');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-blue-100 text-blue-800';
      case 'vencido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container py-6 px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-700 bg-clip-text text-transparent">
              Contas a Pagar
            </h1>
            <p className="text-slate-600 mt-2">
              Gerencie seus compromissos financeiros
            </p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-slate-500">
                Total pendente: {formatCurrency(totalContasPagar)}
              </span>
              <span className="text-sm text-slate-500">
                {contasPagar.length} contas
              </span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={exportData}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                console.log('Recarregando lista de contas a pagar...');
                fetchContasPagar();
                toast.success('Lista atualizada!');
              }}
              className="text-blue-600 border-blue-600"
            >
              Atualizar Lista
            </Button>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </div>
        </div>

        {/* Resumo de Alertas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Vencidas</p>
                  <p className="text-2xl font-bold text-red-600">{contasVencidas}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Vencem Hoje</p>
                  <p className="text-2xl font-bold text-orange-600">{contasVencendoHoje}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Próximos 7 dias</p>
                  <p className="text-2xl font-bold text-yellow-600">{contasVencendo7Dias}</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Próximos 30 dias</p>
                  <p className="text-2xl font-bold text-blue-600">{contasVencendo30Dias}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Busca */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por descrição, categoria ou fornecedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Contas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contasPagar
            .filter(conta => 
              conta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
              conta.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
              conta.fornecedor.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((conta) => (
              <Card key={conta.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 mb-1">{conta.descricao}</h3>
                      <p className="text-sm text-slate-600">{conta.fornecedor}</p>
                      {conta.recorrente && (
                        <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded mt-1">
                          Recorrente
                        </span>
                      )}
                    </div>
                    <div className="bg-amber-100 rounded-full p-2">
                      <Calendar className="h-4 w-4 text-amber-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Valor:</span>
                      <span className="font-bold text-amber-600">{formatCurrency(conta.valor)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Vencimento:</span>
                      <span className="text-sm">{new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Status:</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(conta.status)}`}>
                        {conta.status === 'pendente' ? 'Pendente' : 
                         conta.status === 'pago' ? 'Pago' : 'Vencido'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Categoria:</span>
                      <span className="text-sm">{conta.categoria}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Editar
                    </Button>
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                      Pagar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Estado vazio */}
        {contasPagar.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <div className="bg-slate-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhuma conta pendente</h3>
              <p className="text-sm text-slate-600 mb-6">
                Execute as migrações do banco de dados e comece cadastrando suas contas
              </p>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Primeira Conta
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Modal Simples para Nova Conta a Pagar */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Nova Conta a Pagar</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowForm(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="p-4">
                <ContaPagarFormBasico
                  onSubmit={handleCreateConta}
                  onCancel={() => {
                    console.log('Cancelando formulário');
                    setShowForm(false);
                  }}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContasPagarSimples;