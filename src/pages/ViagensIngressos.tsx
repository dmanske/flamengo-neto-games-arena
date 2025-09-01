import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit, Eye, Loader2, Calendar, MapPin } from 'lucide-react';

interface ViagemIngressos {
  id: string;
  adversario: string;
  data_jogo: string;
  local_jogo: 'casa' | 'fora';
  logo_adversario?: string;
  logo_flamengo?: string;
  valor_padrao: number;
  status: string;
  created_at: string;
}

export default function ViagensIngressos() {
  const navigate = useNavigate();
  const [viagens, setViagens] = useState<ViagemIngressos[]>([]);
  const [loading, setLoading] = useState(true);
  const [viagemToDelete, setViagemToDelete] = useState<ViagemIngressos | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Buscar viagens de ingressos
  const buscarViagens = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('viagens_ingressos')
        .select('*')
        .order('data_jogo', { ascending: true });

      if (error) {
        console.error('Erro ao buscar viagens de ingressos:', error);
        toast.error('Erro ao carregar viagens de ingressos');
        return;
      }

      setViagens(data || []);
    } catch (error) {
      console.error('Erro inesperado ao buscar viagens de ingressos:', error);
      toast.error('Erro inesperado ao carregar viagens de ingressos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar viagens quando o componente montar
  useEffect(() => {
    buscarViagens();
  }, [buscarViagens]);

  // Função para deletar viagem
  const handleDeleteViagem = async (viagemId: string, viagemNome: string) => {
    try {
      setIsDeleting(true);

      console.log(`Iniciando exclusão da viagem de ingressos: ${viagemId} - ${viagemNome}`);

      const { error } = await supabase
        .from('viagens_ingressos')
        .delete()
        .eq('id', viagemId);

      if (error) {
        throw error;
      }

      console.log(`Viagem de ingressos excluída com sucesso: ${viagemId}`);

      toast.success(`Viagem de ingressos "${viagemNome}" removida com sucesso`);
      setViagemToDelete(null);
      
      // Recarregar a lista
      await buscarViagens();
    } catch (err: any) {
      console.error('Erro ao excluir viagem de ingressos:', err);
      toast.error(`Erro ao excluir viagem de ingressos: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Formatar valor
  const formatValue = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativa':
        return 'text-green-700 bg-green-100';
      case 'finalizada':
        return 'text-blue-700 bg-blue-100';
      case 'cancelada':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando viagens de ingressos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Viagens para Ingressos</h1>
          <p className="text-gray-600">Gerencie as viagens específicas para venda de ingressos</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate('/dashboard/cadastrar-viagem-ingressos')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Viagem
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/ingressos')}
          >
            Voltar
          </Button>
        </div>
      </div>

      {/* Lista de Viagens */}
      {viagens.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mb-4">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma viagem para ingressos encontrada
            </h3>
            <p className="text-gray-600 mb-4">
              Crie sua primeira viagem para começar a vender ingressos
            </p>
            <Button
              onClick={() => navigate('/dashboard/cadastrar-viagem-ingressos')}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Criar Primeira Viagem
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {viagens.map((viagem) => (
            <Card key={viagem.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <img 
                        src={viagem.logo_flamengo || "https://logodetimes.com/times/flamengo/logo-flamengo-256.png"} 
                        alt="Flamengo" 
                        className="w-6 h-6 object-contain"
                      />
                      <span className="text-sm font-medium">X</span>
                      <img 
                        src={viagem.logo_adversario || "https://via.placeholder.com/24x24?text=?"} 
                        alt={viagem.adversario} 
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                  </CardTitle>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viagem.status)}`}>
                    {viagem.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{formatDate(viagem.data_jogo)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{viagem.local_jogo === 'casa' ? 'Casa' : 'Fora'}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Valor Padrão:</span> {formatValue(viagem.valor_padrao)}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Abrir modal de novo ingresso com viagem pré-selecionada
                      navigate('/dashboard/ingressos', { 
                        state: { 
                          openNewIngresso: true, 
                          viagemIngressosId: viagem.id 
                        } 
                      });
                    }}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Novo Ingresso
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/dashboard/ingressos?viagem=${viagem.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/dashboard/cadastrar-viagem-ingressos?edit=${viagem.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViagemToDelete(viagem)}
                    className="text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {viagemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirmar Exclusão</h3>
                <p className="text-sm text-gray-600">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Tem certeza que deseja excluir a viagem de ingressos <strong>"{viagemToDelete.adversario}"</strong>?
            </p>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setViagemToDelete(null)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteViagem(viagemToDelete.id, viagemToDelete.adversario)}
                disabled={isDeleting}
                className="gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
