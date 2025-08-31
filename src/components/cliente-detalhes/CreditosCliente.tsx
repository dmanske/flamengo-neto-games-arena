import { useState } from 'react';
import { Plus, CreditCard, History, Eye, Edit, Trash2, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/utils/formatters';
import { 
  getStatusCreditoBadgeColor, 
  getStatusCreditoText, 
  formatarDataCredito 
} from '@/utils/creditoUtils';
import { Credito } from '@/types/creditos';
import { useCreditosCliente } from '@/hooks/useCreditosCliente';

// Modais
import { CreditoDetailsModal } from '@/components/creditos/CreditoDetailsModal';
import { VincularCreditoModal } from '@/components/creditos/VincularCreditoModal';

interface CreditosClienteProps {
  clienteId: string;
  cliente?: {
    id: number;
    nome: string;
    telefone: string;
    email: string;
  };
}

export default function CreditosCliente({ clienteId, cliente }: CreditosClienteProps) {
  const { creditos, resumo, historicoUso, loading, deletarCredito, refresh } = useCreditosCliente(clienteId);

  const deletarHistoricoUso = async (historicoId: string) => {
    if (!confirm('Tem certeza que deseja deletar este histórico de uso de crédito?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('credito_vinculacoes')
        .delete()
        .eq('id', historicoId);

      if (error) throw error;

      toast.success('Histórico de uso deletado com sucesso!');
      refresh();
    } catch (error) {
      console.error('Erro ao deletar histórico:', error);
      toast.error('Erro ao deletar histórico de uso');
    }
  };

  // Estados dos modais
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [modalVincularAberto, setModalVincularAberto] = useState(false);
  const [creditoSelecionado, setCreditoSelecionado] = useState<Credito | null>(null);
  const [grupoCliente, setGrupoCliente] = useState<any>(null);



  // Função removida - não permitir criar novos créditos na página de cliente

  const handleEditarCredito = (credito: Credito) => {
    setCreditoSelecionado(credito);
    setModalFormAberto(true);
  };

  const handleDeletarCredito = async (credito: Credito) => {
    if (!confirm(`Tem certeza que deseja deletar o crédito de ${formatCurrency(credito.valor_credito)}?`)) {
      return;
    }

    await deletarCredito(credito.id);
  };

  const handleVerDetalhes = () => {
    // Montar estrutura similar ao que é usado na página de créditos
    const grupoClienteData = {
      cliente: creditos[0]?.cliente,
      creditos: creditos,
      resumo: resumo
    };
    
    setGrupoCliente(grupoClienteData);
    setModalDetalhesAberto(true);
  };

  const handleUsarEmViagem = () => {
    const grupoClienteData = {
      cliente: creditos[0]?.cliente,
      creditos: creditos,
      resumo: resumo
    };
    
    setGrupoCliente(grupoClienteData);
    setModalVincularAberto(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo dos Créditos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Créditos</p>
                <p className="text-2xl font-bold text-blue-600">{resumo.total_creditos}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(resumo.valor_total)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Disponível</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(resumo.valor_disponivel)}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">💰</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utilizado</p>
                <p className="text-2xl font-bold text-gray-600">{formatCurrency(resumo.valor_utilizado)}</p>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-bold">📊</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações de Consulta */}
      {resumo.total_creditos > 0 && (
        <div className="flex gap-2">
          <Button onClick={handleVerDetalhes} variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Ver Detalhes
          </Button>
          
          {resumo.valor_disponivel > 0 && (
            <Button onClick={handleUsarEmViagem} variant="outline" className="gap-2 text-blue-600 border-blue-600 hover:bg-blue-50">
              <CreditCard className="h-4 w-4" />
              Usar em Viagem
            </Button>
          )}
        </div>
      )}

      {/* Lista de Créditos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Créditos do Cliente ({creditos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {creditos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nenhum crédito encontrado</p>
              <p className="text-sm">Este cliente ainda não possui créditos de viagem.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor Original</TableHead>
                  <TableHead>Saldo Disponível</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Forma Pagamento</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creditos.map((credito) => (
                  <TableRow key={credito.id}>
                    <TableCell>
                      {formatarDataCredito(credito.data_pagamento)}
                    </TableCell>
                    <TableCell>{formatCurrency(credito.valor_credito)}</TableCell>
                    <TableCell>
                      <span className={credito.saldo_disponivel > 0 ? 'text-green-600 font-medium' : 'text-gray-500'}>
                        {formatCurrency(credito.saldo_disponivel)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={getStatusCreditoBadgeColor(credito.status)}
                      >
                        {getStatusCreditoText(credito.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{credito.forma_pagamento || '-'}</TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 max-w-xs truncate" title={credito.observacoes}>
                        {credito.observacoes || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditarCredito(credito)}
                          title="Editar crédito"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletarCredito(credito)}
                          className="text-red-600 hover:text-red-700"
                          title="Deletar crédito"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Uso dos Créditos */}
      {historicoUso.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Uso ({historicoUso.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {historicoUso.map((uso) => (
                <div key={uso.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">
                            {uso.viagem?.adversario || 'Viagem não encontrada'}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {new Date(uso.viagem?.data_jogo || uso.data_vinculacao).toLocaleDateString('pt-BR')}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-4">
                            <span>💰 Valor usado: <strong className="text-green-600">{formatCurrency(uso.valor_utilizado)}</strong></span>
                            <span>📅 Data do uso: {new Date(uso.data_vinculacao).toLocaleDateString('pt-BR')}</span>
                          </div>
                          {uso.viagem?.local_jogo && (
                            <div className="flex items-center gap-1">
                              <span>📍 {uso.viagem.local_jogo}</span>
                            </div>
                          )}
                          {/* Mostrar beneficiário se for diferente do titular */}
                          {uso.beneficiario && uso.beneficiario.id !== clienteId && (
                            <div className="flex items-center gap-1 text-sm text-blue-600">
                              <span>👤</span>
                              <span>Beneficiário: <strong>{uso.beneficiario.nome}</strong></span>
                              {uso.beneficiario.telefone && (
                                <span className="text-gray-500">• {uso.beneficiario.telefone}</span>
                              )}
                            </div>
                          )}
                          {uso.observacoes && (
                            <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
                              {uso.observacoes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(uso.valor_utilizado)}
                      </div>
                      <div className="text-xs text-gray-500">
                        de {formatCurrency(uso.credito?.valor_credito || 0)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletarHistoricoUso(uso.id)}
                        className="text-red-600 hover:text-red-700 mt-2"
                        title="Deletar histórico de uso"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Resumo do histórico */}
              <div className="border-t pt-4 mt-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">📊 Resumo do Histórico</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {historicoUso.length}
                      </div>
                      <div className="text-blue-700">Viagens</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(historicoUso.reduce((total, uso) => total + uso.valor_utilizado, 0))}
                      </div>
                      <div className="text-green-700">Total Usado</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-600">
                        {formatCurrency(resumo.valor_disponivel)}
                      </div>
                      <div className="text-gray-700">Ainda Disponível</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modais */}
      <CreditoDetailsModal
        open={modalDetalhesAberto}
        onOpenChange={setModalDetalhesAberto}
        grupoCliente={grupoCliente}
        onNovoCredito={() => {
          // Função desabilitada - não permitir criar novos créditos
          toast.info('Criação de novos créditos não disponível nesta tela');
        }}
        onUsarEmViagem={(grupo) => {
          setGrupoCliente(grupo);
          setModalDetalhesAberto(false);
          setModalVincularAberto(true);
        }}
        onEditar={handleEditarCredito}
        onDeletar={handleDeletarCredito}
        onRefresh={refresh}
      />

      <VincularCreditoModal
        open={modalVincularAberto}
        onOpenChange={setModalVincularAberto}
        grupoCliente={grupoCliente}
        onSuccess={() => {
          refresh();
        }}
        onViagemUpdated={() => {
          // Callback para recarregar dados após vinculação
          console.log('Viagem atualizada após vinculação de crédito');
          refresh();
        }}
      />
    </div>
  );
}