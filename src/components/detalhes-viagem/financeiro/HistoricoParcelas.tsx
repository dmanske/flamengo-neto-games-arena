import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar,
  CreditCard,
  DollarSign,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Eye
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Parcela {
  id: string;
  numero_parcela: number;
  total_parcelas: number;
  valor_parcela: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'pendente' | 'pago' | 'cancelado';
  forma_pagamento?: string;
  observacoes?: string;
  tipo_parcelamento: string;
}

interface HistoricoParcelasProps {
  viagemPassageiroId: string;
  passageiroNome: string;
  onParcelaAtualizada?: () => void;
}

export function HistoricoParcelas({ 
  viagemPassageiroId, 
  passageiroNome,
  onParcelaAtualizada 
}: HistoricoParcelasProps) {
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [parcelaEditando, setParcelaEditando] = useState<Parcela | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Estados do formulário
  const [formData, setFormData] = useState({
    valor_parcela: 0,
    data_pagamento: '',
    forma_pagamento: '',
    observacoes: ''
  });

  // Carregar parcelas
  const carregarParcelas = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('viagem_passageiros_parcelas')
        .select('*')
        .eq('viagem_passageiro_id', viagemPassageiroId)
        .order('numero_parcela');

      if (error) throw error;
      setParcelas(data || []);
    } catch (error) {
      console.error('Erro ao carregar parcelas:', error);
      toast.error('Erro ao carregar histórico de parcelas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarParcelas();
  }, [viagemPassageiroId]);

  // Abrir modal de edição
  const abrirEdicao = (parcela: Parcela) => {
    setParcelaEditando(parcela);
    setFormData({
      valor_parcela: parcela.valor_parcela,
      data_pagamento: parcela.data_pagamento || '',
      forma_pagamento: parcela.forma_pagamento || '',
      observacoes: parcela.observacoes || ''
    });
    setShowEditModal(true);
  };

  // Marcar como pago
  const marcarComoPago = async (parcela: Parcela) => {
    try {
      const { error } = await supabase
        .from('viagem_passageiros_parcelas')
        .update({
          status: 'pago',
          data_pagamento: new Date().toISOString().split('T')[0],
          forma_pagamento: 'pix' // Padrão
        })
        .eq('id', parcela.id);

      if (error) throw error;

      toast.success('Parcela marcada como paga!');
      await carregarParcelas();
      onParcelaAtualizada?.();
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      toast.error('Erro ao atualizar parcela');
    }
  };

  // Salvar edição
  const salvarEdicao = async () => {
    if (!parcelaEditando) return;

    try {
      const updateData: any = {
        valor_parcela: formData.valor_parcela,
        forma_pagamento: formData.forma_pagamento || null,
        observacoes: formData.observacoes || null
      };

      // Se tem data de pagamento, marcar como pago
      if (formData.data_pagamento) {
        updateData.data_pagamento = formData.data_pagamento;
        updateData.status = 'pago';
      } else {
        updateData.data_pagamento = null;
        updateData.status = 'pendente';
      }

      const { error } = await supabase
        .from('viagem_passageiros_parcelas')
        .update(updateData)
        .eq('id', parcelaEditando.id);

      if (error) throw error;

      toast.success('Parcela atualizada com sucesso!');
      setShowEditModal(false);
      setParcelaEditando(null);
      await carregarParcelas();
      onParcelaAtualizada?.();
    } catch (error) {
      console.error('Erro ao salvar parcela:', error);
      toast.error('Erro ao salvar alterações');
    }
  };

  // Adicionar nova parcela
  const adicionarParcela = async () => {
    try {
      const proximoNumero = Math.max(...parcelas.map(p => p.numero_parcela), 0) + 1;
      
      const { error } = await supabase
        .from('viagem_passageiros_parcelas')
        .insert({
          viagem_passageiro_id: viagemPassageiroId,
          numero_parcela: proximoNumero,
          total_parcelas: proximoNumero,
          valor_parcela: formData.valor_parcela,
          data_vencimento: new Date().toISOString().split('T')[0],
          status: 'pendente',
          tipo_parcelamento: 'adicional',
          forma_pagamento: null,
          observacoes: formData.observacoes || null
        });

      if (error) throw error;

      toast.success('Nova parcela adicionada!');
      setShowAddModal(false);
      setFormData({
        valor_parcela: 0,
        data_pagamento: '',
        forma_pagamento: '',
        observacoes: ''
      });
      await carregarParcelas();
      onParcelaAtualizada?.();
    } catch (error) {
      console.error('Erro ao adicionar parcela:', error);
      toast.error('Erro ao adicionar parcela');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pendente':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelado':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando parcelas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPago = parcelas
    .filter(p => p.status === 'pago')
    .reduce((sum, p) => sum + p.valor_parcela, 0);
  
  const totalPendente = parcelas
    .filter(p => p.status === 'pendente')
    .reduce((sum, p) => sum + p.valor_parcela, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Histórico de Parcelas - {passageiroNome}
            </span>
            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Parcela
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Pago</span>
              </div>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(totalPago)}
              </p>
            </div>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Pendente</span>
              </div>
              <p className="text-lg font-bold text-yellow-600">
                {formatCurrency(totalPendente)}
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total</span>
              </div>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(totalPago + totalPendente)}
              </p>
            </div>
          </div>

          {/* Lista de Parcelas */}
          <div className="space-y-3">
            {parcelas.length > 0 ? (
              parcelas.map((parcela) => (
                <div 
                  key={parcela.id}
                  className={`p-4 border rounded-lg ${getStatusColor(parcela.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(parcela.status)}
                        <div>
                          <h4 className="font-medium">
                            Parcela {parcela.numero_parcela}/{parcela.total_parcelas}
                          </h4>
                          <p className="text-sm opacity-75">
                            Vencimento: {new Date(parcela.data_vencimento).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="opacity-75">Valor:</span>
                          <p className="font-semibold">{formatCurrency(parcela.valor_parcela)}</p>
                        </div>
                        <div>
                          <span className="opacity-75">Status:</span>
                          <Badge className={`text-xs ${getStatusColor(parcela.status)}`}>
                            {parcela.status}
                          </Badge>
                        </div>
                        <div>
                          <span className="opacity-75">Forma Pagamento:</span>
                          <p className="font-medium">
                            {parcela.forma_pagamento || 'Não definida'}
                          </p>
                        </div>
                        <div>
                          <span className="opacity-75">Data Pagamento:</span>
                          <p className="font-medium">
                            {parcela.data_pagamento ? 
                              new Date(parcela.data_pagamento).toLocaleDateString('pt-BR') : 
                              'Não pago'
                            }
                          </p>
                        </div>
                      </div>

                      {parcela.observacoes && (
                        <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-sm">
                          <span className="opacity-75">Obs:</span> {parcela.observacoes}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => abrirEdicao(parcela)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      
                      {parcela.status === 'pendente' && (
                        <Button
                          size="sm"
                          onClick={() => marcarComoPago(parcela)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Pagar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Nenhuma parcela encontrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Editar Parcela {parcelaEditando?.numero_parcela}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="valor">Valor da Parcela</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={formData.valor_parcela}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  valor_parcela: parseFloat(e.target.value) || 0 
                }))}
              />
            </div>

            <div>
              <Label htmlFor="data_pagamento">Data do Pagamento</Label>
              <Input
                id="data_pagamento"
                type="date"
                value={formData.data_pagamento}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  data_pagamento: e.target.value 
                }))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Deixe vazio se ainda não foi pago
              </p>
            </div>

            <div>
              <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
              <Select 
                value={formData.forma_pagamento} 
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  forma_pagamento: value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                  <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  observacoes: e.target.value 
                }))}
                placeholder="Observações sobre o pagamento..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                Cancelar
              </Button>
              <Button onClick={salvarEdicao}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Nova Parcela */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Parcela</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="novo_valor">Valor da Parcela</Label>
              <Input
                id="novo_valor"
                type="number"
                step="0.01"
                value={formData.valor_parcela || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  valor_parcela: parseFloat(e.target.value) || 0 
                }))}
                placeholder="Digite o valor"
              />
            </div>

            <div>
              <Label htmlFor="nova_observacao">Observações</Label>
              <Textarea
                id="nova_observacao"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  observacoes: e.target.value 
                }))}
                placeholder="Motivo da parcela adicional..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={adicionarParcela}
                disabled={formData.valor_parcela <= 0}
              >
                Adicionar Parcela
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}