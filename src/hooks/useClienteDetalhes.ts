// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Tipos
export interface ClienteDetalhes {
  cliente: {
    id: number;
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
    data_nascimento: string | null;
    foto?: string;
    cep: string;
    endereco: string;
    numero: string;
    complemento?: string | null;
    bairro: string;
    cidade: string;
    estado: string;
    como_conheceu: string;
    observacoes?: string;
    created_at: string;
  };
  viagens: {
    id: string;
    adversario: string;
    data_jogo: string;
    valor_pago: number;
    valor_original: number;
    desconto: number;
    status: 'confirmado' | 'cancelado' | 'finalizado';
    setor_maracana: string;
    numero_onibus: string;
    avaliacao?: number;
  }[];
  financeiro: {
    resumo: {
      total_gasto: number;
      valor_pendente: number;
      ultima_compra: string;
      ticket_medio: number;
      total_viagens: number;
    };
    status_credito: {
      classificacao: 'bom' | 'atencao' | 'inadimplente';
      score: number;
      motivo?: string;
    };
    parcelas_pendentes: any[];
    historico_pagamentos: any[];
  };
  comunicacao: {
    resumo: {
      ultima_interacao: string;
      preferencia_contato: 'whatsapp' | 'email' | 'telefone';
      total_whatsapp: number;
      total_email: number;
      total_ligacoes: number;
    };
    timeline: any[];
  };
  badges: string[];
}

export const useClienteDetalhes = (clienteId: string) => {
  const [cliente, setCliente] = useState<ClienteDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clienteId) {
      setError('ID do cliente não fornecido');
      setLoading(false);
      return;
    }

    const fetchClienteDetalhes = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Buscar dados básicos do cliente
        const { data: clienteData, error: clienteError } = await supabase
          .from('clientes')
          .select('*')
          .eq('id', clienteId)
          .single();

        if (clienteError) {
          if (clienteError.code === 'PGRST116') {
            throw new Error('Cliente não encontrado');
          }
          throw clienteError;
        }

        if (!clienteData) {
          throw new Error('Cliente não encontrado');
        }

        // 2. Buscar viagens do cliente
        const { data: viagensData, error: viagensError } = await supabase
          .from('viagem_passageiros')
          .select(`
            id,
            valor,
            desconto,
            setor_maracana,
            status_pagamento,
            viagens!viagem_passageiros_viagem_id_fkey (
              id,
              adversario,
              data_jogo,
              status_viagem
            )
          `)
          .eq('cliente_id', clienteId)
          .order('created_at', { ascending: false });

        if (viagensError) {
          console.error('Erro ao buscar viagens:', viagensError);
        }

        // 3. Processar dados das viagens
        const viagens = (viagensData || []).map(vp => {
          // Determinar status baseado na data do jogo e status da viagem
          let status: 'confirmado' | 'cancelado' | 'finalizado' = 'confirmado';
          
          if (vp.viagens?.status_viagem === 'Cancelada') {
            status = 'cancelado';
          } else if (vp.viagens?.data_jogo) {
            const dataJogo = new Date(vp.viagens.data_jogo);
            const hoje = new Date();
            
            if (dataJogo < hoje) {
              status = 'finalizado';
            }
          }

          return {
            id: vp.viagens?.id || '',
            adversario: vp.viagens?.adversario || 'Adversário não informado',
            data_jogo: vp.viagens?.data_jogo || '',
            valor_pago: vp.valor || 0,
            valor_original: vp.valor || 0,
            desconto: vp.desconto || 0,
            status,
            setor_maracana: vp.setor_maracana || '',
            numero_onibus: '', // Campo não existe na tabela
            avaliacao: undefined
          };
        });

        // 4. Calcular dados básicos
        const totalViagens = viagens.length;
        const totalGasto = viagens.reduce((sum, v) => sum + (v.valor_pago - v.desconto), 0);
        const ticketMedio = totalViagens > 0 ? totalGasto / totalViagens : 0;
        
        // Badges básicas para o header
        const badges = [];
        if (totalViagens >= 10) badges.push('VIP');
        if (totalViagens >= 5) badges.push('Fiel');

        // 5. Montar objeto completo
        const clienteCompleto: ClienteDetalhes = {
          cliente: {
            id: clienteData.id,
            nome: clienteData.nome,
            cpf: clienteData.cpf || '',
            telefone: clienteData.telefone || '',
            email: clienteData.email || '',
            data_nascimento: clienteData.data_nascimento,
            foto: clienteData.foto,
            cep: clienteData.cep || '',
            endereco: clienteData.endereco || '',
            numero: clienteData.numero || '',
            complemento: clienteData.complemento || null,
            bairro: clienteData.bairro || '',
            cidade: clienteData.cidade || '',
            estado: clienteData.estado || '',
            como_conheceu: clienteData.como_conheceu || 'Não informado',
            observacoes: clienteData.observacoes,
            created_at: clienteData.created_at,
          },
          viagens,
          financeiro: {
            resumo: {
              total_gasto: totalGasto,
              valor_pendente: 0, // TODO: Calcular baseado em parcelas
              ultima_compra: viagens[0]?.data_jogo || '',
              ticket_medio: ticketMedio,
              total_viagens: totalViagens,
            },
            status_credito: {
              classificacao: totalViagens >= 5 ? 'bom' : totalViagens >= 2 ? 'atencao' : 'inadimplente',
              score: Math.min(100, totalViagens * 20),
            },
            parcelas_pendentes: [],
            historico_pagamentos: [],
          },
          comunicacao: {
            resumo: {
              ultima_interacao: 'Nunca',
              preferencia_contato: 'whatsapp',
              total_whatsapp: 0,
              total_email: 0,
              total_ligacoes: 0,
            },
            timeline: [],
          },
          badges,
        };

        setCliente(clienteCompleto);
      } catch (err: any) {
        console.error('Erro ao buscar detalhes do cliente:', err);
        setError(err.message || 'Erro ao carregar dados do cliente');
      } finally {
        setLoading(false);
      }
    };

    fetchClienteDetalhes();
  }, [clienteId]);

  const refetch = () => {
    if (clienteId) {
      setLoading(true);
      // Re-executar o useEffect
    }
  };

  return { cliente, loading, error, refetch };
};