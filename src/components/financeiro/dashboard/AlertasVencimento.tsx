import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Calendar, Clock, CheckCircle, Eye } from 'lucide-react';
import { ContaPagar } from '@/types/financeiro';
import { useContasPagar } from '@/hooks/financeiro/useContasPagar';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { toast } from 'sonner';

interface AlertasVencimentoProps {
  className?: string;
  onViewConta?: (conta: ContaPagar) => void;
}

export const AlertasVencimento: React.FC<AlertasVencimentoProps> = ({
  className = "",
  onViewConta
}) => {
  const { getAlertasVencimento, marcarComoPago } = useContasPagar();
  const [alertas, setAlertas] = useState<{
    vencidas: ContaPagar[];
    vencendoHoje: ContaPagar[];
    vencendo7Dias: ContaPagar[];
  }>({
    vencidas: [],
    vencendoHoje: [],
    vencendo7Dias: []
  });
  const [loading, setLoading] = useState(true);

  const carregarAlertas = async () => {
    try {
      setLoading(true);
      const dados = await getAlertasVencimento();
      setAlertas(dados);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAlertas();
  }, []);

  const handleMarcarPago = async (conta: ContaPagar) => {
    const hoje = new Date().toISOString().split('T')[0];
    const sucesso = await marcarComoPago(conta.id, hoje);
    
    if (sucesso) {
      carregarAlertas(); // Recarregar alertas
      toast.success('Conta marcada como paga!');
    }
  };

  const ContaItem: React.FC<{ conta: ContaPagar; tipo: 'vencida' | 'hoje' | 'proxima' }> = ({ conta, tipo }) => {
    const getStatusColor = () => {
      switch (tipo) {
        case 'vencida':
          return 'border-l-red-500 bg-red-50';
        case 'hoje':
          return 'border-l-orange-500 bg-orange-50';
        case 'proxima':
          return 'border-l-yellow-500 bg-yellow-50';
        default:
          return 'border-l-gray-500 bg-gray-50';
      }
    };

    const getIcon = () => {
      switch (tipo) {
        case 'vencida':
          return <AlertTriangle className="h-4 w-4 text-red-600" />;
        case 'hoje':
          return <Clock className="h-4 w-4 text-orange-600" />;
        case 'proxima':
          return <Calendar className="h-4 w-4 text-yellow-600" />;
        default:
          return <Calendar className="h-4 w-4 text-gray-600" />;
      }
    };

    return (
      <div className={`p-3 border-l-4 rounded-r-lg ${getStatusColor()}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {getIcon()}
              <h4 className="font-medium text-sm text-gray-900">
                {conta.descricao}
              </h4>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Fornecedor: {conta.fornecedor}</p>
              <p>Vencimento: {formatDate(conta.data_vencimento)}</p>
              <p className="font-medium text-gray-900">
                Valor: {formatCurrency(Number(conta.valor))}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleMarcarPago(conta)}
              className="text-xs px-2 py-1 h-auto text-green-600 hover:text-green-700 hover:border-green-300"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Pagar
            </Button>
            {onViewConta && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewConta(conta)}
                className="text-xs px-2 py-1 h-auto"
              >
                <Eye className="h-3 w-3 mr-1" />
                Ver
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={`border-0 shadow-lg ${className}`}>
        <CardHeader>
          <CardTitle>Alertas de Vencimento</CardTitle>
          <CardDescription>Carregando alertas...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAlertas = alertas.vencidas.length + alertas.vencendoHoje.length + alertas.vencendo7Dias.length;

  return (
    <Card className={`border-0 shadow-lg ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Alertas de Vencimento
            </CardTitle>
            <CardDescription>
              Contas que precisam de atenção
            </CardDescription>
          </div>
          {totalAlertas > 0 && (
            <Badge variant="destructive" className="bg-red-100 text-red-800">
              {totalAlertas} alertas
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {/* Contas Vencidas */}
          {alertas.vencidas.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Contas Vencidas ({alertas.vencidas.length})
              </h3>
              <div className="space-y-2">
                {alertas.vencidas.slice(0, 3).map(conta => (
                  <ContaItem key={conta.id} conta={conta} tipo="vencida" />
                ))}
                {alertas.vencidas.length > 3 && (
                  <p className="text-xs text-gray-500 text-center py-2">
                    +{alertas.vencidas.length - 3} contas vencidas
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Contas Vencendo Hoje */}
          {alertas.vencendoHoje.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-orange-600 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Vencem Hoje ({alertas.vencendoHoje.length})
              </h3>
              <div className="space-y-2">
                {alertas.vencendoHoje.map(conta => (
                  <ContaItem key={conta.id} conta={conta} tipo="hoje" />
                ))}
              </div>
            </div>
          )}

          {/* Contas Vencendo em 7 Dias */}
          {alertas.vencendo7Dias.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-yellow-600 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Próximos 7 Dias ({alertas.vencendo7Dias.length})
              </h3>
              <div className="space-y-2">
                {alertas.vencendo7Dias.slice(0, 2).map(conta => (
                  <ContaItem key={conta.id} conta={conta} tipo="proxima" />
                ))}
                {alertas.vencendo7Dias.length > 2 && (
                  <p className="text-xs text-gray-500 text-center py-2">
                    +{alertas.vencendo7Dias.length - 2} contas próximas
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Nenhum Alerta */}
          {totalAlertas === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Tudo em dia!</h3>
              <p className="text-sm">
                Não há contas vencidas ou próximas do vencimento
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};