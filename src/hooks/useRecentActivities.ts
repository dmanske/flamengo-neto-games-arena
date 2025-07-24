// @ts-nocheck
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Activity {
  id: string;
  type: 'client' | 'payment' | 'trip' | 'reservation';
  title: string;
  description: string;
  time: string;
  user?: {
    name: string;
    avatar?: string;
    initials: string;
  };
  status?: 'success' | 'pending' | 'failed';
  data?: any;
}

export const useRecentActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      
      // Buscar atividades dos últimos 7 dias
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      // Buscar novos clientes
      const { data: newClients } = await supabase
        .from('clientes')
        .select('nome, created_at, cidade')
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      // Buscar pagamentos recentes
      const { data: recentPayments } = await supabase
        .from('viagem_passageiros')
        .select(`
          valor,
          status_pagamento,
          created_at,
          clientes!inner(nome),
          viagens!inner(adversario)
        `)
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      // Buscar novas viagens
      const { data: newTrips } = await supabase
        .from('viagens')
        .select('adversario, data_jogo, created_at, status_viagem')
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      const allActivities: Activity[] = [];

      // Processar clientes
      newClients?.forEach(client => {
        allActivities.push({
          id: `client-${client.nome}-${client.created_at}`,
          type: 'client',
          title: 'Novo cliente cadastrado',
          description: `${client.nome} de ${client.cidade || 'cidade não informada'}`,
          time: formatTimeAgo(client.created_at),
          user: {
            name: 'Sistema',
            initials: 'SI'
          },
          status: 'success',
          data: client
        });
      });

      // Processar pagamentos
      recentPayments?.forEach(payment => {
        const status = payment.status_pagamento === 'Pago' ? 'success' : 
                     payment.status_pagamento === 'Pendente' ? 'pending' : 'failed';
        
        allActivities.push({
          id: `payment-${payment.clientes.nome}-${payment.created_at}`,
          type: 'payment',
          title: payment.status_pagamento === 'Pago' ? 'Pagamento confirmado' : 'Pagamento pendente',
          description: `${payment.clientes.nome} - R$ ${payment.valor?.toFixed(2)} - ${payment.viagens.adversario}`,
          time: formatTimeAgo(payment.created_at),
          user: {
            name: 'Sistema',
            initials: 'SI'
          },
          status,
          data: payment
        });
      });

      // Processar viagens
      newTrips?.forEach(trip => {
        allActivities.push({
          id: `trip-${trip.adversario}-${trip.created_at}`,
          type: 'trip',
          title: 'Nova viagem cadastrada',
          description: `Flamengo x ${trip.adversario} - ${new Date(trip.data_jogo).toLocaleDateString('pt-BR')}`,
          time: formatTimeAgo(trip.created_at),
          user: {
            name: 'Admin',
            initials: 'AD'
          },
          status: trip.status_viagem === 'Ativa' ? 'success' : 'pending',
          data: trip
        });
      });

      // Ordenar por data mais recente
      allActivities.sort((a, b) => {
        const dateA = new Date(a.data?.created_at || 0);
        const dateB = new Date(b.data?.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      });

      setActivities(allActivities.slice(0, 8)); // Limitar a 8 atividades
      
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''} atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
    
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return {
    activities,
    isLoading,
    refetch: fetchActivities
  };
};