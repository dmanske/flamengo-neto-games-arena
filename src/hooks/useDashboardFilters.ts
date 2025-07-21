import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface DashboardFilters {
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  adversario?: string;
  cidade?: string;
  statusPagamento?: 'Pago' | 'Pendente' | 'Cancelado';
  statusViagem?: 'Ativa' | 'Cancelada' | 'Finalizada';
}

export const useDashboardFilters = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: 'month'
  });
  
  const [availableAdversarios, setAvailableAdversarios] = useState<string[]>([]);
  const [availableCidades, setAvailableCidades] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Buscar opções disponíveis para os filtros
  const fetchFilterOptions = async () => {
    try {
      // Buscar adversários únicos
      const { data: adversarios } = await supabase
        .from('viagens')
        .select('adversario')
        .not('adversario', 'is', null);
      
      const uniqueAdversarios = [...new Set(adversarios?.map(v => v.adversario) || [])];
      setAvailableAdversarios(uniqueAdversarios);

      // Buscar cidades únicas
      const { data: cidades } = await supabase
        .from('clientes')
        .select('cidade')
        .not('cidade', 'is', null);
      
      const uniqueCidades = [...new Set(cidades?.map(c => c.cidade) || [])];
      setAvailableCidades(uniqueCidades);
      
    } catch (error) {
      console.error('Erro ao buscar opções de filtro:', error);
    }
  };

  // Calcular datas baseadas no range selecionado
  const getDateRange = (range: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    switch (range) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  };

  // Aplicar filtros aos dados
  const applyFilters = async (baseQuery: any, tableName: string) => {
    let query = baseQuery;
    
    // Aplicar filtro de data
    if (filters.dateRange !== 'custom') {
      const { startDate, endDate } = getDateRange(filters.dateRange);
      query = query.gte('created_at', startDate).lte('created_at', endDate);
    } else if (filters.startDate && filters.endDate) {
      query = query.gte('created_at', filters.startDate).lte('created_at', filters.endDate);
    }

    // Aplicar filtros específicos baseados na tabela
    if (tableName === 'viagens') {
      if (filters.adversario) {
        query = query.eq('adversario', filters.adversario);
      }
      if (filters.statusViagem) {
        query = query.eq('status_viagem', filters.statusViagem);
      }
    }

    if (tableName === 'viagem_passageiros') {
      if (filters.statusPagamento) {
        query = query.eq('status_pagamento', filters.statusPagamento);
      }
    }

    if (tableName === 'clientes') {
      if (filters.cidade) {
        query = query.eq('cidade', filters.cidade);
      }
    }

    return query;
  };

  // Buscar dados filtrados
  const getFilteredData = async () => {
    setIsLoading(true);
    try {
      const { startDate, endDate } = filters.dateRange !== 'custom' 
        ? getDateRange(filters.dateRange)
        : { startDate: filters.startDate, endDate: filters.endDate };

      // Buscar clientes filtrados
      let clientesQuery = supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true });
      
      if (startDate && endDate) {
        clientesQuery = clientesQuery.gte('created_at', startDate).lte('created_at', endDate);
      }
      if (filters.cidade) {
        clientesQuery = clientesQuery.eq('cidade', filters.cidade);
      }

      // Buscar viagens filtradas
      let viagensQuery = supabase
        .from('viagens')
        .select('*', { count: 'exact', head: true });
      
      if (startDate && endDate) {
        viagensQuery = viagensQuery.gte('created_at', startDate).lte('created_at', endDate);
      }
      if (filters.adversario) {
        viagensQuery = viagensQuery.eq('adversario', filters.adversario);
      }
      if (filters.statusViagem) {
        viagensQuery = viagensQuery.eq('status_viagem', filters.statusViagem);
      }

      // Buscar receita filtrada
      let receitaQuery = supabase
        .from('viagem_passageiros')
        .select('valor, desconto');
      
      if (startDate && endDate) {
        receitaQuery = receitaQuery.gte('created_at', startDate).lte('created_at', endDate);
      }
      if (filters.statusPagamento) {
        receitaQuery = receitaQuery.eq('status_pagamento', filters.statusPagamento);
      } else {
        receitaQuery = receitaQuery.eq('status_pagamento', 'Pago');
      }

      const [
        { count: clientesCount },
        { count: viagensCount },
        { data: receitaData }
      ] = await Promise.all([
        clientesQuery,
        viagensQuery,
        receitaQuery
      ]);

      const totalReceita = receitaData?.reduce((sum, item) => {
        const valor = item.valor || 0;
        const desconto = item.desconto || 0;
        return sum + (valor - desconto);
      }, 0) || 0;

      return {
        clientesCount: clientesCount || 0,
        viagensCount: viagensCount || 0,
        totalReceita
      };

    } catch (error) {
      console.error('Erro ao buscar dados filtrados:', error);
      return {
        clientesCount: 0,
        viagensCount: 0,
        totalReceita: 0
      };
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilter = (key: keyof DashboardFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: 'month'
    });
  };

  const getFilterSummary = () => {
    const summary: string[] = [];
    
    if (filters.dateRange !== 'month') {
      const labels = {
        today: 'Hoje',
        week: 'Última semana',
        month: 'Último mês',
        quarter: 'Último trimestre',
        year: 'Último ano',
        custom: 'Período personalizado'
      };
      summary.push(labels[filters.dateRange]);
    }
    
    if (filters.adversario) summary.push(`Adversário: ${filters.adversario}`);
    if (filters.cidade) summary.push(`Cidade: ${filters.cidade}`);
    if (filters.statusPagamento) summary.push(`Pagamento: ${filters.statusPagamento}`);
    if (filters.statusViagem) summary.push(`Viagem: ${filters.statusViagem}`);
    
    return summary;
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  return {
    filters,
    availableAdversarios,
    availableCidades,
    isLoading,
    updateFilter,
    resetFilters,
    getFilteredData,
    applyFilters,
    getFilterSummary
  };
};