// @ts-nocheck
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Notification {
  id: string;
  type: 'client' | 'payment' | 'trip' | 'reservation';
  title: string;
  description: string;
  time: string;
  read: boolean;
  data?: any;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Buscar novos clientes (últimas 24h)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: newClients } = await supabase
        .from('clientes')
        .select('nome, created_at')
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      // Buscar pagamentos recentes (últimas 24h)
      const { data: recentPayments } = await supabase
        .from('viagem_passageiros')
        .select(`
          valor,
          created_at,
          clientes!inner(nome),
          viagens!inner(adversario)
        `)
        .eq('status_pagamento', 'Pago')
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      // Buscar novas viagens (últimas 48h)
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      const { data: newTrips } = await supabase
        .from('viagens')
        .select('adversario, data_jogo, created_at')
        .gte('created_at', twoDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(3);

      // Buscar reservas pendentes
      const { data: pendingReservations } = await supabase
        .from('viagem_passageiros')
        .select(`
          created_at,
          clientes!inner(nome),
          viagens!inner(adversario)
        `)
        .eq('status_pagamento', 'Pendente')
        .order('created_at', { ascending: false })
        .limit(5);

      const allNotifications: Notification[] = [];

      // Adicionar notificações de novos clientes
      newClients?.forEach(client => {
        allNotifications.push({
          id: `client-${client.nome}-${client.created_at}`,
          type: 'client',
          title: 'Novo cliente cadastrado',
          description: `${client.nome} foi adicionado ao sistema`,
          time: formatTimeAgo(client.created_at),
          read: false,
          data: client
        });
      });

      // Adicionar notificações de pagamentos
      recentPayments?.forEach(payment => {
        allNotifications.push({
          id: `payment-${payment.clientes.nome}-${payment.created_at}`,
          type: 'payment',
          title: 'Pagamento confirmado',
          description: `${payment.clientes.nome} - R$ ${payment.valor?.toFixed(2)} - ${payment.viagens.adversario}`,
          time: formatTimeAgo(payment.created_at),
          read: false,
          data: payment
        });
      });

      // Adicionar notificações de novas viagens
      newTrips?.forEach(trip => {
        allNotifications.push({
          id: `trip-${trip.adversario}-${trip.created_at}`,
          type: 'trip',
          title: 'Nova viagem cadastrada',
          description: `Flamengo x ${trip.adversario} - ${new Date(trip.data_jogo).toLocaleDateString('pt-BR')}`,
          time: formatTimeAgo(trip.created_at),
          read: false,
          data: trip
        });
      });

      // Adicionar notificações de reservas pendentes
      pendingReservations?.forEach(reservation => {
        allNotifications.push({
          id: `reservation-${reservation.clientes.nome}-${reservation.created_at}`,
          type: 'reservation',
          title: 'Pagamento pendente',
          description: `${reservation.clientes.nome} - ${reservation.viagens.adversario}`,
          time: formatTimeAgo(reservation.created_at),
          read: false,
          data: reservation
        });
      });

      // Ordenar por data mais recente
      allNotifications.sort((a, b) => new Date(b.data?.created_at || 0).getTime() - new Date(a.data?.created_at || 0).getTime());

      setNotifications(allNotifications.slice(0, 10)); // Limitar a 10 notificações
      setUnreadCount(allNotifications.length);
      
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
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
    return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchNotifications();
    
    // Atualizar notificações a cada 5 minutos
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};