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
  FileText,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Clock
} from 'lucide-react';
import { ContaPagar } from '@/types/financeiro';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface ContaPagarCardProps {
  conta: ContaPagar;
  onEdit?: (conta: ContaPagar) => void;
  onDelete?: (conta: ContaPagar) => void;
  onView?: (conta: ContaPagar) => void;
  onMarcarPago?: (conta: ContaPagar) => void;
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

const getFrequenciaText = (frequencia?: string) => {
  if (!frequencia) return '';
  
  switch (frequencia) {
    case 'mensal':
      return 'Mensal';
    case 'trimestral':
      return 'Trimestral';
    case 'semestral':
      return 'Semestral';
    case 'anual':
      return 'Anual';
    default:
      return frequencia;
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

const isVenceHoje = (dataVencimento: string) => {
  const hoje = new Date().toISOString().split('T')[0];
  return dataVencimento === hoje;
};

export const ContaPagarCard: React.FC<ContaPagarCardProps> = ({
  conta,
  onEdit,
  onDelete,
  onView,
  onMarcarPago,
  showActions = true
}) => {
  const vencida = isVencida(conta.data_vencimento, conta.status);
  const venceHoje = isVenceHoje(conta.data_vencimento);
  const diasVencimento = diasParaVencimento(conta.data_vencimento);

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 border-0 shadow-md ${
      vencida ? 'border-l-4 border-l-red-500' : 
      venceHoje && conta.status === 'pendente' ? 'border-l-4 border-l-orange-500' :
      diasVencimento <= 7 && conta.status === 'pendente' ? 'border-l-4 border-l-yellow-500' : ''
    }`}>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          {/* Header com valor e status */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg text-gray-900">
                  {conta.descricao}
                </h3>
                {conta.recorrente && (
                  <Badge variant="outline" className="text-xs">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    {getFrequenciaText(conta.frequencia_recorrencia)}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-2xl font-bold text-red-600">
                <DollarSign className="h-5 w-5" />
                {formatCurrency(Number(conta.valor))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={`${getStatusColor(conta.status)} font-medium`}>
                {getStatusText(conta.status)}
              </Badge>
              {vencida && conta.status === 'pendente' && (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Vencida há {Math.abs(diasVencimento)} dias</span>
                </div>
              )}
              {venceHoje && conta.status === 'pendente' && (
                <div className="flex items-center gap-1 text-orange-600 text-xs">
                  <Clock className="h-3 w-3" />
                  <span>Vence hoje</span>
                </div>
              )}
              {!vencida && !venceHoje && diasVencimento <= 7 && conta.status === 'pendente' && (
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
              <span>Vencimento: {formatDate(conta.data_vencimento)}</span>
            </div>

            {conta.data_pagamento && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Pago em: {formatDate(conta.data_pagamento)}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-600">
              <FileText className="h-4 w-4" />
              <span>Categoria: {conta.categoria}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Building className="h-4 w-4" />
              <span>Fornecedor: {conta.fornecedor}</span>
            </div>
          </div>

          {/* Informações de recorrência */}
          {conta.recorrente && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-700">
                <RotateCcw className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Conta recorrente - {getFrequenciaText(conta.frequencia_recorrencia)}
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Uma nova conta será criada automaticamente quando esta for paga
              </p>
            </div>
          )}

          {/* Observações */}
          {conta.observacoes && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                <strong>Observações:</strong> {conta.observacoes}
              </p>
            </div>
          )}

          {/* Ações */}
          {showActions && (
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(conta)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Ver
                </Button>
              )}

              {onMarcarPago && conta.status === 'pendente' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMarcarPago(conta)}
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
                  onClick={() => onEdit(conta)}
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
                  onClick={() => onDelete(conta)}
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
            Criado em {formatDate(conta.created_at)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};