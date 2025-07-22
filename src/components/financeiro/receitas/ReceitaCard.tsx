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
  User, 
  MapPin,
  FileText,
  CreditCard
} from 'lucide-react';
import { Receita } from '@/types/financeiro';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface ReceitaCardProps {
  receita: Receita;
  onEdit?: (receita: Receita) => void;
  onDelete?: (receita: Receita) => void;
  onView?: (receita: Receita) => void;
  showActions?: boolean;
}

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

const getStatusText = (status: string) => {
  switch (status) {
    case 'recebido':
      return 'Recebido';
    case 'pendente':
      return 'Pendente';
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

export const ReceitaCard: React.FC<ReceitaCardProps> = ({
  receita,
  onEdit,
  onDelete,
  onView,
  showActions = true
}) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          {/* Header com valor e status */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {receita.descricao}
              </h3>
              <div className="flex items-center gap-2 text-2xl font-bold text-green-600">
                <DollarSign className="h-5 w-5" />
                {formatCurrency(Number(receita.valor))}
              </div>
            </div>
            <Badge className={`${getStatusColor(receita.status)} font-medium`}>
              {getStatusText(receita.status)}
            </Badge>
          </div>

          {/* Informações principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Recebido em: {formatDate(receita.data_recebimento)}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <FileText className="h-4 w-4" />
              <span>Categoria: {receita.categoria}</span>
            </div>

            {receita.metodo_pagamento && (
              <div className="flex items-center gap-2 text-gray-600">
                <CreditCard className="h-4 w-4" />
                <span>{getMetodoPagamentoText(receita.metodo_pagamento)}</span>
              </div>
            )}

            {receita.viagem_id && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>Vinculada à viagem</span>
              </div>
            )}

            {receita.cliente_id && (
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <span>Cliente vinculado</span>
              </div>
            )}
          </div>

          {/* Observações */}
          {receita.observacoes && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                <strong>Observações:</strong> {receita.observacoes}
              </p>
            </div>
          )}

          {/* Comprovante */}
          {receita.comprovante_url && (
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
                  onClick={() => onView(receita)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Ver
                </Button>
              )}
              
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(receita)}
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
                  onClick={() => onDelete(receita)}
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
            Criado em {formatDate(receita.created_at)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};