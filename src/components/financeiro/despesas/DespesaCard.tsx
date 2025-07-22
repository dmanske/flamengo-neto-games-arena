import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  DollarSign, 
  Building,
  MapPin,
  FileText,
  CreditCard,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Despesa } from '@/types/financeiro';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface DespesaCardProps {
  despesa: Despesa;
  onEdit?: (despesa: Despesa) => void;
  onDelete?: (despesa: Despesa) => void;
  onView?: (despesa: Despesa) => void;
  onMarcarPago?: (despesa: Despesa) => void;
  showActions?: boolean;
}

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

const getStatusText = (status: string) => {
  switch (status) {
    case 'pago':
      return 'Pago';
    case 'pendente':
      return 'Pendente';
    case 'vencido':
      return 'Vencido';
    case 'cancelado':
      return 'Cancelado';
    default:
      return status;
  }
};

const getMetodoPagamentoText = (metodo?: string) => {
  if (!metodo) return 'Não informado';
  
  switch (metodo) {
    case 'dinheiro':
      return 'Dinheiro';
    case 'pix':
      return 'PIX';
    case 'cartao_credito':
      return 'Cartão de Crédito';
    case 'cartao_debito':
      return 'Cartão de Débito';
    case 'transferencia':
      return 'Transferência';
    case 'boleto':
      return 'Boleto';
    case 'outros':
      return 'Outros';
    default:
      return metodo;
  }
};

const isVencida = (dataVencimento: string, status: string) => {
  if (status === 'pago') return false;
  const hoje = new Date().toISOString().split('T')[0];
  return dataVencimento < hoje;
};

const diasParaVencimento = (dataVencimento: string) => {
  const hoje = new Date();
  const vencimento = new Date(dataVencimento);
  const diffTime = vencimento.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const DespesaCard: React.FC<DespesaCardProps> = ({
  despesa,
  onEdit,
  onDelete,
  onView,
  onMarcarPago,
  showActions = true
}) => {
  const vencida = isVencida(despesa.data_vencimento, despesa.status);
  const diasVencimento = diasParaVencimento(despesa.data_vencimento);

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 border-0 shadow-md ${
      vencida ? 'border-l-4 border-l-red-500' : 
      diasVencimento <= 7 && despesa.status === 'pendente' ? 'border-l-4 border-l-yellow-500' : ''
    }`}>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          {/* Header com valor e status */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {despesa.descricao}
              </h3>
              <div className="flex items-center gap-2 text-2xl font-bold text-red-600">
                <DollarSign className="h-5 w-5" />
                {formatCurrency(Number(despesa.valor))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={`${getStatusColor(despesa.status)} font-medium`}>
                {getStatusText(despesa.status)}
              </Badge>
              {vencida && despesa.status === 'pendente' && (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Vencida</span>
                </div>
              )}
              {!vencida && diasVencimento <= 7 && despesa.status === 'pendente' && (
                <div className="flex items-center gap-1 text-yellow-600 text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Vence em {diasVencimento} dias</span>
                </div>
              )}
            </div>
          </div>

          {/* Informações principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Vencimento: {formatDate(despesa.data_vencimento)}</span>
            </div>

            {despesa.data_pagamento && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Pago em: {formatDate(despesa.data_pagamento)}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-600">
              <FileText className="h-4 w-4" />
              <span>Categoria: {despesa.categoria}</span>
            </div>

            {despesa.fornecedor && (
              <div className="flex items-center gap-2 text-gray-600">
                <Building className="h-4 w-4" />
                <span>Fornecedor: {despesa.fornecedor}</span>
              </div>
            )}

            {despesa.metodo_pagamento && (
              <div className="flex items-center gap-2 text-gray-600">
                <CreditCard className="h-4 w-4" />
                <span>{getMetodoPagamentoText(despesa.metodo_pagamento)}</span>
              </div>
            )}

            {despesa.viagem_id && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>Vinculada à viagem</span>
              </div>
            )}
          </div>

          {/* Observações */}
          {despesa.observacoes && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                <strong>Observações:</strong> {despesa.observacoes}
              </p>
            </div>
          )}

          {/* Comprovante */}
          {despesa.comprovante_url && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <FileText className="h-4 w-4" />
              <span>Comprovante anexado</span>
            </div>
          )}

          {/* Ações */}
          {showActions && (
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(despesa)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Ver
                </Button>
              )}

              {onMarcarPago && despesa.status === 'pendente' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMarcarPago(despesa)}
                  className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:border-green-300"
                >
                  <CheckCircle className="h-4 w-4" />
                  Marcar como Pago
                </Button>
              )}
              
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(despesa)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              )}
              
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(despesa)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              )}
            </div>
          )}

          {/* Footer com data de criação */}
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
            Criado em {formatDate(despesa.created_at)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};