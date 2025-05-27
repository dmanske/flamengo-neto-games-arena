
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Package, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Pedido {
  id: string;
  session_id: string;
  amount: number;
  currency: string;
  status: string;
  customer_email: string;
  created_at: string;
  viagem?: {
    adversario: string;
    data_jogo: string;
    rota: string;
  };
}

interface HistoricoPedidosProps {
  customerEmail?: string;
}

export const HistoricoPedidos = ({ customerEmail }: HistoricoPedidosProps) => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customerEmail) {
      fetchPedidos();
    }
  }, [customerEmail]);

  const fetchPedidos = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          viagens (
            adversario,
            data_jogo,
            rota
          )
        `)
        .eq('customer_email', customerEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar pedidos:', error);
      toast.error('Erro ao carregar histórico de pedidos');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'complete':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
      case 'canceled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'complete':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      case 'failed':
        return 'Falhou';
      case 'canceled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        <p className="text-red-200 mt-4">Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Meus Pedidos</h2>
      
      {pedidos.length === 0 ? (
        <Card className="bg-white/10 backdrop-blur-md border-red-500/30">
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-red-200">
              Você ainda não fez nenhuma compra conosco.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pedidos.map((pedido) => (
            <Card key={pedido.id} className="bg-white/10 backdrop-blur-md border-red-500/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">
                    Pedido #{pedido.session_id.slice(-8).toUpperCase()}
                  </CardTitle>
                  <Badge className={`${getStatusColor(pedido.status)} text-white`}>
                    {getStatusText(pedido.status)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {pedido.viagem && (
                  <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">
                      Flamengo x {pedido.viagem.adversario}
                    </h4>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-red-200">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(pedido.viagem.data_jogo)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-red-200">
                        <MapPin className="h-4 w-4" />
                        <span>{pedido.viagem.rota}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-red-200">
                  <span>Data do Pedido:</span>
                  <span>{formatDate(pedido.created_at)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-red-200">Total:</span>
                  <span className="text-2xl font-bold text-white">
                    {formatCurrency(pedido.amount)}
                  </span>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </Button>
                  
                  {pedido.status.toLowerCase() === 'paid' && (
                    <Button 
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Baixar Comprovante
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
