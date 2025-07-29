// Componente de histórico inline para economizar espaço
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// Removido ConfirmDialog - usando confirmação inline
import { 
  History, 
  ChevronDown, 
  ChevronUp, 
  DollarSign,
  Calendar,
  CreditCard,
  Edit3
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { HistoricoPagamentoCategorizado } from '@/types/pagamentos-separados';
import { EditarPagamentoModal } from './financeiro/EditarPagamentoModal';

interface HistoricoInlineProps {
  historicoPagamentos: HistoricoPagamentoCategorizado[];
  onVerCompleto: () => void;
  onDeletarPagamento?: (pagamentoId: string) => Promise<boolean>;
  onEditarPagamento?: (pagamentoId: string, dadosAtualizados: Partial<HistoricoPagamentoCategorizado>) => Promise<boolean>;
}

export const HistoricoInline: React.FC<HistoricoInlineProps> = ({
  historicoPagamentos,
  onVerCompleto,
  onDeletarPagamento,
  onEditarPagamento
}) => {
  const [expandido, setExpandido] = useState(false);
  const [pagamentoParaDeletar, setPagamentoParaDeletar] = useState<any>(null);
  const [pagamentoParaEditar, setPagamentoParaEditar] = useState<HistoricoPagamentoCategorizado | null>(null);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  
  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'viagem':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'passeios':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ambos':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    switch (categoria) {
      case 'viagem': return 'Viagem';
      case 'passeios': return 'Passeios';
      case 'ambos': return 'Completo';
      default: return categoria;
    }
  };

  if (historicoPagamentos.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <History className="h-4 w-4" />
            Histórico de Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-4 text-muted-foreground text-sm">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum pagamento registrado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pagamentosOrdenados = historicoPagamentos
    .sort((a, b) => new Date(b.data_pagamento).getTime() - new Date(a.data_pagamento).getTime());
  
  const pagamentosVisiveis = expandido ? pagamentosOrdenados : pagamentosOrdenados.slice(0, 3);
  const totalPagamentos = historicoPagamentos.length;
  const valorTotal = historicoPagamentos.reduce((sum, p) => sum + p.valor_pago, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <History className="h-4 w-4" />
            Histórico de Pagamentos
            <Badge variant="secondary" className="text-xs">
              {totalPagamentos}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Total: R$ {valorTotal.toFixed(2)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔍 [BOTÃO] Ver Completo clicado');
                onVerCompleto();
              }}
              className="text-xs h-6 px-2"
            >
              Ver Completo
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {pagamentosVisiveis.map((pagamento, index) => (
            <div
              key={pagamento.id || index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-center gap-2 flex-1">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-3 w-3 text-blue-600" />
                </div>
                <Badge className={getCategoriaColor(pagamento.categoria)} variant="outline">
                  {getCategoriaLabel(pagamento.categoria)}
                </Badge>
                <span className="text-sm font-medium text-green-600">
                  R$ {pagamento.valor_pago.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(pagamento.data_pagamento), "dd/MM/yyyy", {
                      locale: ptBR
                    })}
                  </div>
                  {pagamento.forma_pagamento && (
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      {pagamento.forma_pagamento.toUpperCase()}
                    </div>
                  )}
                </div>
                
                {/* Botões de Ação */}
                <div className="flex items-center gap-1">
                  {pagamentoParaDeletar?.id === pagamento.id ? (
                    // Mostrar confirmação inline
                    <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded px-2 py-1">
                      <span className="text-xs text-red-700 font-medium">Deletar?</span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (onDeletarPagamento) {
                            await onDeletarPagamento(pagamento.id);
                            setPagamentoParaDeletar(null);
                          }
                        }}
                        className="h-5 px-1 text-xs"
                      >
                        Sim
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPagamentoParaDeletar(null);
                        }}
                        className="h-5 px-1 text-xs"
                      >
                        Não
                      </Button>
                    </div>
                  ) : (
                    // Botões normais
                    <>
                      {/* Botão Editar */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          if (!pagamento.id) {
                            console.error('❌ ID do pagamento não encontrado');
                            return;
                          }

                          setPagamentoParaEditar(pagamento);
                          setModalEditarAberto(true);
                        }}
                        className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Editar pagamento"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>

                      {/* Botão Deletar */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          if (!pagamento.id) {
                            console.error('❌ ID do pagamento não encontrado');
                            return;
                          }

                          setPagamentoParaDeletar(pagamento);
                        }}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Deletar pagamento"
                      >
                        🗑️
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {totalPagamentos > 3 && (
          <div className="mt-3 pt-2 border-t">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setExpandido(!expandido);
              }}
              className="w-full text-xs h-6"
            >
              {expandido ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Mostrar Menos
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Mostrar Mais ({totalPagamentos - 3})
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>

      {/* Modal de Edição */}
      <EditarPagamentoModal
        isOpen={modalEditarAberto}
        onClose={() => {
          setModalEditarAberto(false);
          setPagamentoParaEditar(null);
        }}
        pagamento={pagamentoParaEditar}
        onSalvar={async (pagamentoId, dadosAtualizados) => {
          if (onEditarPagamento) {
            const sucesso = await onEditarPagamento(pagamentoId, dadosAtualizados);
            if (sucesso) {
              setModalEditarAberto(false);
              setPagamentoParaEditar(null);
            }
            return sucesso;
          }
          return false;
        }}
      />
    </Card>
  );
};