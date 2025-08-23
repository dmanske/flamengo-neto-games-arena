import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Filter, Download, AlertTriangle, Calendar, Clock, CheckCircle, Trash2, RotateCcw } from "lucide-react";
import { ContaPagarCard } from "@/components/financeiro/contas-pagar/ContaPagarCard";
import { ContaPagarFormSimples } from "@/components/financeiro/contas-pagar/ContaPagarFormSimples";
import { useContasPagar } from "@/hooks/financeiro/useContasPagar";
import { ContaPagar, FiltroFinanceiro } from "@/types/financeiro";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/formatters";

interface Categoria {
  nome: string;
  cor: string;
}

const ContasPagar = () => {
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
    deleteContaPagar,
    fetchContasPagar,
    marcarComoPago,
    getContasRecorrentes
  } = useContasPagar();

  const [showForm, setShowForm] = useState(false);
  const [editingConta, setEditingConta] = useState<ContaPagar | undefined>();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contaToDelete, setContaToDelete] = useState<ContaPagar | null>(null);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [contaToPay, setContaToPay] = useState<ContaPagar | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showRecorrentes, setShowRecorrentes] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [contasRecorrentes, setContasRecorrentes] = useState<ContaPagar[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Carregar categorias
  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        const { data } = await supabase
          .from('categorias_financeiras')
          .select('nome, cor')
          .eq('tipo', 'despesa')
          .eq('ativa', true)
          .order('nome');

        if (data) setCategorias(data);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };

    carregarCategorias();
  }, []);

  // Carregar contas recorrentes
  useEffect(() => {
    const carregarRecorrentes = async () => {
      const contas = await getContasRecorrentes();
      setContasRecorrentes(contas);
    };

    carregarRecorrentes();
  }, [getContasRecorrentes]);

  // Aplicar filtros
  useEffect(() => {
    const filtros: FiltroFinanceiro = {};
    
    if (selectedCategoria) filtros.categoria = selectedCategoria;
    if (selectedStatus) filtros.status = selectedStatus;

    fetchContasPagar(filtros);
  }, [selectedCategoria, selectedStatus, fetchContasPagar]);

  // Filtrar contas por termo de busca
  const contasFiltradas = contasPagar.filter(conta =>
    conta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conta.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conta.fornecedor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateConta = async (data: any) => {
    const success = await createContaPagar(data);
    if (success) {
      setShowForm(false);
      setEditingConta(undefined);
      // Recarregar contas recorrentes se necessário
      if (data.recorrente) {
        const contas = await getContasRecorrentes();
        setContasRecorrentes(contas);
      }
    }
    return success;
  };

  const handleUpdateConta = async (data: any) => {
    if (!editingConta) return false;
    
    const success = await updateContaPagar(editingConta.id, data);
    if (success) {
      setShowForm(false);
      setEditingConta(undefined);
      // Recarregar contas recorrentes se necessário
      if (data.recorrente || editingConta.recorrente) {
        const contas = await getContasRecorrentes();
        setContasRecorrentes(contas);
      }
    }
    return success;
  };

  const handleEdit = (conta: ContaPagar) => {
    setEditingConta(conta);
    setShowForm(true);
  };

  const handleDelete = (conta: ContaPagar) => {
    setContaToDelete(conta);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!contaToDelete) return;
    
    const success = await deleteContaPagar(contaToDelete.id);
    if (success) {
      setShowDeleteDialog(false);
      setContaToDelete(null);
      // Recarregar contas recorrentes se necessário
      if (contaToDelete.recorrente) {
        const contas = await getContasRecorrentes();
        setContasRecorrentes(contas);
      }
    }
  };

  const handleMarcarPago = (conta: ContaPagar) => {
    setContaToPay(conta);
    setShowPayDialog(true);
  };

  const confirmPagamento = async () => {
    if (!contaToPay) return;
    
    const hoje = new Date().toISOString().split('T')[0];
    const success = await marcarComoPago(contaToPay.id, hoje);
    
    if (success) {
      setShowPayDialog(false);
      setContaToPay(null);
      // Recarregar contas recorrentes se a conta era recorrente
      if (contaToPay.recorrente) {
        const contas = await getContasRecorrentes();
        setContasRecorrentes(contas);
      }
    }
  };

  const handleView = (conta: ContaPagar) => {
    // Implementar visualização detalhada se necessário
    console.log('Visualizar conta:', conta);
  };

  const clearFilters = () => {
    setSelectedCategoria("");
    setSelectedStatus("");
    setSearchTerm("");
  };

  const exportData = () => {
    // Implementar exportação
    toast.info('Funcionalidade de exportação será implementada em breve');
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
              onClick={() => setShowRecorrentes(!showRecorrentes)}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {showRecorrentes ? 'Ocultar' : 'Ver'} Recorrentes
            </Button>
            <Button
              variant="outline"
              onClick={exportData}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar
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

        {/* Contas Recorrentes */}
        {showRecorrentes && contasRecorrentes.length > 0 && (
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-blue-600" />
                Contas Recorrentes ({contasRecorrentes.length})
              </CardTitle>
              <CardDescription>
                Contas que se repetem automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contasRecorrentes.slice(0, 6).map((conta) => (
                  <div key={conta.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm text-blue-900">{conta.descricao}</h4>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {conta.frequencia_recorrencia}
                      </span>
                    </div>
                    <p className="text-xs text-blue-700">
                      {conta.fornecedor} • {formatCurrency(Number(conta.valor))}
                    </p>
                  </div>
                ))}
              </div>
              {contasRecorrentes.length > 6 && (
                <p className="text-sm text-gray-500 text-center mt-4">
                  +{contasRecorrentes.length - 6} contas recorrentes
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtros</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Busca */}
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

              {/* Filtros Avançados */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Categoria
                    </label>
                    <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as categorias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas as categorias</SelectItem>
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

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Status
                    </label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os status</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="vencido">Vencido</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="w-full"
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Contas */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-0 shadow-lg animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : contasFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contasFiltradas.map((conta) => (
              <ContaPagarCard
                key={conta.id}
                conta={conta}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onMarcarPago={handleMarcarPago}
              />
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <div className="bg-slate-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {searchTerm || selectedCategoria || selectedStatus 
                  ? 'Nenhuma conta encontrada' 
                  : 'Nenhuma conta pendente'
                }
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                {searchTerm || selectedCategoria || selectedStatus
                  ? 'Tente ajustar os filtros para encontrar contas'
                  : 'Todas as contas estão em dia ou não há contas cadastradas'
                }
              </p>
              {!searchTerm && !selectedCategoria && !selectedStatus && (
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Conta
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dialog do Formulário */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingConta ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}
              </DialogTitle>
            </DialogHeader>
            <ContaPagarFormSimples
              onSubmit={handleCreateConta}
              onCancel={() => {
                setShowForm(false);
                setEditingConta(undefined);
              }}
              loading={loading}
            />
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Pagamento */}
        <AlertDialog open={showPayDialog} onOpenChange={setShowPayDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Confirmar Pagamento
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja marcar a conta "{contaToPay?.descricao}" como paga?
                <br />
                <strong>Valor: {contaToPay && formatCurrency(Number(contaToPay.valor))}</strong>
                {contaToPay?.recorrente && (
                  <>
                    <br />
                    <span className="text-blue-600">
                      ⚠️ Esta é uma conta recorrente. Uma nova conta será criada automaticamente.
                    </span>
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmPagamento}
                className="bg-green-600 hover:bg-green-700"
              >
                Marcar como Pago
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Confirmar Exclusão
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a conta "{contaToDelete?.descricao}"?
                <br />
                <strong>Esta ação não pode ser desfeita.</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ContasPagar;