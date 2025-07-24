// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, DollarSign, TrendingDown, FileText } from 'lucide-react';
import { Receita, Despesa } from '@/types/financeiro';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ReceitaForm } from '@/components/financeiro/receitas/ReceitaForm';
import { DespesaForm } from '@/components/financeiro/despesas/DespesaForm';
import { useReceitas } from '@/hooks/financeiro/useReceitas';
import { useDespesas } from '@/hooks/financeiro/useDespesas';
import { toast } from 'sonner';

interface ViagemFinancialDetailsProps {
  viagemId: string;
  viagemNome: string;
}

export const ViagemFinancialDetails: React.FC<ViagemFinancialDetailsProps> = ({
  viagemId,
  viagemNome
}) => {
  const [activeTab, setActiveTab] = useState('receitas');
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [addReceitaOpen, setAddReceitaOpen] = useState(false);
  const [addDespesaOpen, setAddDespesaOpen] = useState(false);
  const [editItem, setEditItem] = useState<Receita | Despesa | null>(null);
  
  const { addReceita, updateReceita } = useReceitas();
  const { addDespesa, updateDespesa } = useDespesas();

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      // Buscar receitas da viagem
      const { data: receitasData, error: receitasError } = await supabase
        .from('receitas')
        .select('*')
        .eq('viagem_id', viagemId)
        .order('data_recebimento', { ascending: false });

      if (receitasError) throw receitasError;
      setReceitas(receitasData || []);

      // Buscar despesas da viagem
      const { data: despesasData, error: despesasError } = await supabase
        .from('despesas')
        .select('*')
        .eq('viagem_id', viagemId)
        .order('data_vencimento', { ascending: false });

      if (despesasError) throw despesasError;
      setDespesas(despesasData || []);

    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viagemId) {
      fetchFinancialData();
    }
  }, [viagemId]);

  const handleAddReceita = async (data: any) => {
    try {
      // Garantir que a viagem_id esteja definida
      const receitaData = {
        ...data,
        viagem_id: viagemId
      };
      
      const success = await addReceita(receitaData);
      if (success) {
        toast.success('Receita adicionada com sucesso!');
        fetchFinancialData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao adicionar receita:', error);
      toast.error('Erro ao adicionar receita');
      return false;
    }
  };

  const handleUpdateReceita = async (data: any) => {
    if (!editItem || !('descricao' in editItem)) return false;
    
    try {
      const receitaData = {
        ...data,
        id: editItem.id,
        viagem_id: viagemId
      };
      
      const success = await updateReceita(receitaData);
      if (success) {
        toast.success('Receita atualizada com sucesso!');
        fetchFinancialData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      toast.error('Erro ao atualizar receita');
      return false;
    }
  };

  const handleAddDespesa = async (data: any) => {
    try {
      // Garantir que a viagem_id esteja definida
      const despesaData = {
        ...data,
        viagem_id: viagemId
      };
      
      const success = await addDespesa(despesaData);
      if (success) {
        toast.success('Despesa adicionada com sucesso!');
        fetchFinancialData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
      toast.error('Erro ao adicionar despesa');
      return false;
    }
  };

  const handleUpdateDespesa = async (data: any) => {
    if (!editItem || !('descricao' in editItem)) return false;
    
    try {
      const despesaData = {
        ...data,
        id: editItem.id,
        viagem_id: viagemId
      };
      
      const success = await updateDespesa(despesaData);
      if (success) {
        toast.success('Despesa atualizada com sucesso!');
        fetchFinancialData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
      toast.error('Erro ao atualizar despesa');
      return false;
    }
  };

  const handleEditReceita = (receita: Receita) => {
    setEditItem(receita);
    setAddReceitaOpen(true);
  };

  const handleEditDespesa = (despesa: Despesa) => {
    setEditItem(despesa);
    setAddDespesaOpen(true);
  };

  const handleAddReceitaClick = () => {
    setEditItem(null);
    setAddReceitaOpen(true);
  };

  const handleAddDespesaClick = () => {
    setEditItem(null);
    setAddDespesaOpen(true);
  };

  const totalReceitas = receitas.reduce((sum, r) => sum + Number(r.valor), 0);
  const totalDespesas = despesas.reduce((sum, d) => sum + Number(d.valor), 0);
  const lucro = totalReceitas - totalDespesas;

  const ReceitaItem = ({ receita }: { receita: Receita }) => (
    <div className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900">{receita.descricao}</h4>
          <p className="text-sm text-gray-600">
            {formatDate(receita.data_recebimento)} • {receita.categoria}
          </p>
          {receita.cliente_id && (
            <p className="text-xs text-gray-500 mt-1">
              Cliente ID: {receita.cliente_id}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-bold text-green-600">{formatCurrency(Number(receita.valor))}</p>
          <p className="text-xs text-gray-500 mt-1">
            {receita.status === 'recebido' ? 'Recebido' : 
             receita.status === 'pendente' ? 'Pendente' : 'Cancelado'}
          </p>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleEditReceita(receita)}
          className="text-xs"
        >
          Editar
        </Button>
      </div>
    </div>
  );

  const DespesaItem = ({ despesa }: { despesa: Despesa }) => (
    <div className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900">{despesa.descricao}</h4>
          <p className="text-sm text-gray-600">
            {formatDate(despesa.data_vencimento)} • {despesa.categoria}
          </p>
          {despesa.fornecedor && (
            <p className="text-xs text-gray-500 mt-1">
              Fornecedor: {despesa.fornecedor}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-bold text-red-600">{formatCurrency(Number(despesa.valor))}</p>
          <p className="text-xs text-gray-500 mt-1">
            {despesa.status === 'pago' ? 'Pago' : 
             despesa.status === 'pendente' ? 'Pendente' : 
             despesa.status === 'vencido' ? 'Vencido' : 'Cancelado'}
          </p>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleEditDespesa(despesa)}
          className="text-xs"
        >
          Editar
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">
              Financeiro da Viagem
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddReceitaClick}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Receita</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddDespesaClick}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Despesa</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-gray-900">Total Receitas</h3>
              </div>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalReceitas)}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <h3 className="font-medium text-gray-900">Total Despesas</h3>
              </div>
              <p className="text-xl font-bold text-red-600">{formatCurrency(totalDespesas)}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Lucro</h3>
              </div>
              <p className={`text-xl font-bold ${lucro >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(lucro)}
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="receitas">
                Receitas ({receitas.length})
              </TabsTrigger>
              <TabsTrigger value="despesas">
                Despesas ({despesas.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="receitas">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : receitas.length > 0 ? (
                <div className="space-y-3">
                  {receitas.map(receita => (
                    <ReceitaItem key={receita.id} receita={receita} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma receita registrada para esta viagem</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddReceitaClick}
                    className="mt-2"
                  >
                    Adicionar Receita
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="despesas">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : despesas.length > 0 ? (
                <div className="space-y-3">
                  {despesas.map(despesa => (
                    <DespesaItem key={despesa.id} despesa={despesa} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma despesa registrada para esta viagem</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddDespesaClick}
                    className="mt-2"
                  >
                    Adicionar Despesa
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog para adicionar/editar receita */}
      <Dialog open={addReceitaOpen} onOpenChange={setAddReceitaOpen}>
        <DialogContent className="max-w-2xl">
          <ReceitaForm
            receita={editItem as Receita | undefined}
            onSubmit={editItem ? handleUpdateReceita : handleAddReceita}
            onCancel={() => setAddReceitaOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para adicionar/editar despesa */}
      <Dialog open={addDespesaOpen} onOpenChange={setAddDespesaOpen}>
        <DialogContent className="max-w-2xl">
          <DespesaForm
            despesa={editItem as Despesa | undefined}
            onSubmit={editItem ? handleUpdateDespesa : handleAddDespesa}
            onCancel={() => setAddDespesaOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};