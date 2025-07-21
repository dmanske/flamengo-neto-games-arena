import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Bus, 
  MapPin, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ViagemPresenca {
  id: string;
  adversario: string;
  data_jogo: string;
  status_viagem: string;
  total_passageiros: number;
  presentes: number;
  pendentes: number;
  ausentes: number;
  percentual_presenca: number;
  onibus_count: number;
}

interface EstatisticasGerais {
  total_viagens_andamento: number;
  total_passageiros: number;
  total_presentes: number;
  total_pendentes: number;
  percentual_geral: number;
  cidade_maior_presenca: string;
  cidade_menor_presenca: string;
}

const DashboardPresenca = () => {
  const [viagens, setViagens] = useState<ViagemPresenca[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasGerais | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDados();
  }, []);

  const fetchDados = async () => {
    try {
      setLoading(true);

      // Buscar viagens em andamento com estatísticas de presença
      const { data: viagensData, error: viagensError } = await supabase
        .from('viagens')
        .select(`
          id,
          adversario,
          data_jogo,
          status_viagem,
          viagem_passageiros (
            status_presenca,
            cidade_embarque
          ),
          viagem_onibus (
            id
          )
        `)
        .eq('status_viagem', 'Em andamento');

      if (viagensError) throw viagensError;

      // Processar dados das viagens
      const viagensProcessadas: ViagemPresenca[] = (viagensData || []).map((viagem: any) => {
        const passageiros = viagem.viagem_passageiros || [];
        const total = passageiros.length;
        const presentes = passageiros.filter((p: any) => p.status_presenca === 'presente').length;
        const pendentes = passageiros.filter((p: any) => p.status_presenca === 'pendente').length;
        const ausentes = passageiros.filter((p: any) => p.status_presenca === 'ausente').length;
        
        return {
          id: viagem.id,
          adversario: viagem.adversario,
          data_jogo: viagem.data_jogo,
          status_viagem: viagem.status_viagem,
          total_passageiros: total,
          presentes,
          pendentes,
          ausentes,
          percentual_presenca: total > 0 ? Math.round((presentes / total) * 100) : 0,
          onibus_count: viagem.viagem_onibus?.length || 0
        };
      });

      setViagens(viagensProcessadas);

      // Calcular estatísticas gerais
      const totalViagens = viagensProcessadas.length;
      const totalPassageiros = viagensProcessadas.reduce((sum, v) => sum + v.total_passageiros, 0);
      const totalPresentes = viagensProcessadas.reduce((sum, v) => sum + v.presentes, 0);
      const totalPendentes = viagensProcessadas.reduce((sum, v) => sum + v.pendentes, 0);

      // Buscar estatísticas por cidade
      const { data: cidadeStats, error: cidadeError } = await supabase
        .from('viagem_passageiros')
        .select('cidade_embarque, status_presenca')
        .in('viagem_id', viagensProcessadas.map(v => v.id));

      if (cidadeError) throw cidadeError;

      // Processar estatísticas por cidade
      const cidadePresenca = (cidadeStats || []).reduce((acc: any, item: any) => {
        const cidade = item.cidade_embarque || 'Não especificada';
        if (!acc[cidade]) {
          acc[cidade] = { total: 0, presentes: 0 };
        }
        acc[cidade].total++;
        if (item.status_presenca === 'presente') {
          acc[cidade].presentes++;
        }
        return acc;
      }, {});

      const cidadesComPercentual = Object.entries(cidadePresenca).map(([cidade, stats]: [string, any]) => ({
        cidade,
        percentual: stats.total > 0 ? (stats.presentes / stats.total) * 100 : 0
      }));

      const cidadeMaiorPresenca = cidadesComPercentual.reduce((max, atual) => 
        atual.percentual > max.percentual ? atual : max, 
        { cidade: 'N/A', percentual: 0 }
      );

      const cidadeMenorPresenca = cidadesComPercentual.reduce((min, atual) => 
        atual.percentual < min.percentual ? atual : min, 
        { cidade: 'N/A', percentual: 100 }
      );

      setEstatisticas({
        total_viagens_andamento: totalViagens,
        total_passageiros: totalPassageiros,
        total_presentes: totalPresentes,
        total_pendentes: totalPendentes,
        percentual_geral: totalPassageiros > 0 ? Math.round((totalPresentes / totalPassageiros) * 100) : 0,
        cidade_maior_presenca: cidadeMaiorPresenca.cidade,
        cidade_menor_presenca: cidadeMenorPresenca.cidade
      });

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error("Erro ao carregar dashboard de presença");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (percentual: number) => {
    if (percentual >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (percentual >= 60) return <Clock className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  const getStatusColor = (percentual: number) => {
    if (percentual >= 80) return "bg-green-100 text-green-700 border-green-300";
    if (percentual >= 60) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-red-100 text-red-700 border-red-300";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard de Presença</h1>
        <p className="text-muted-foreground">Acompanhe a presença dos passageiros em tempo real</p>
      </div>

      {/* Estatísticas Gerais */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <Calendar className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{estatisticas.total_viagens_andamento}</p>
                <p className="text-sm text-muted-foreground">Viagens em Andamento</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <Users className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{estatisticas.total_passageiros}</p>
                <p className="text-sm text-muted-foreground">Total de Passageiros</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <UserCheck className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{estatisticas.total_presentes}</p>
                <p className="text-sm text-muted-foreground">Presentes</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <TrendingUp className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{estatisticas.percentual_geral}%</p>
                <p className="text-sm text-muted-foreground">Taxa de Presença</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights Rápidos */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Melhor Presença por Cidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{estatisticas.cidade_maior_presenca}</p>
              <p className="text-sm text-muted-foreground">Cidade com maior taxa de presença</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Atenção Necessária
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{estatisticas.cidade_menor_presenca}</p>
              <p className="text-sm text-muted-foreground">Cidade com menor taxa de presença</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Viagens em Andamento */}
      <Card>
        <CardHeader>
          <CardTitle>Viagens em Andamento</CardTitle>
        </CardHeader>
        <CardContent>
          {viagens.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma viagem em andamento</h3>
              <p className="text-muted-foreground">
                Não há viagens com status "Em andamento" no momento
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {viagens.map((viagem) => (
                <div key={viagem.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{viagem.adversario}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(viagem.data_jogo), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Bus className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{viagem.onibus_count} ônibus</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{viagem.total_passageiros} passageiros</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(viagem.percentual_presenca)}
                          <span className="font-semibold text-lg">{viagem.percentual_presenca}%</span>
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-green-100 text-green-700">
                            <UserCheck className="h-3 w-3 mr-1" />
                            {viagem.presentes}
                          </Badge>
                          <Badge className="bg-orange-100 text-orange-700">
                            <UserX className="h-3 w-3 mr-1" />
                            {viagem.pendentes}
                          </Badge>
                        </div>
                      </div>

                      <Button asChild>
                        <Link to={`/dashboard/presenca/${viagem.id}`}>
                          Ver Lista
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Barra de progresso */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>Presença</span>
                      <span>{viagem.presentes}/{viagem.total_passageiros}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${viagem.percentual_presenca}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPresenca;