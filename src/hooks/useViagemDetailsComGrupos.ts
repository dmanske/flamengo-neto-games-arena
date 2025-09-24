// Versão do useViagemDetails que inclui suporte a grupos
// Use este hook APENAS DEPOIS de executar o SQL no banco de dados

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { matchesAllTerms, createSearchableText, normalizeText } from "@/lib/search-utils";

// Importar tipos do hook original
export type { 
  Viagem, 
  Cliente, 
  PassageiroDisplay, 
  Onibus 
} from "@/hooks/useViagemDetails";

// Estender PassageiroDisplay com campos de grupo
declare module '@/hooks/useViagemDetails' {
  interface PassageiroDisplay {
    grupo_nome?: string | null;
    grupo_cor?: string | null;
  }
}

export function useViagemDetailsComGrupos(viagemId: string | undefined) {
  // Importar tudo do hook original
  const originalHook = require('@/hooks/useViagemDetails').useViagemDetails(viagemId);

  // Função personalizada para buscar passageiros COM grupos
  const fetchPassageirosComGrupos = async (viagemId: string) => {
    if (!viagemId || viagemId === "undefined") {
      console.warn("ID da viagem inválido:", viagemId);
      return;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(viagemId)) {
      console.warn("ID da viagem não é um UUID válido:", viagemId);
      return;
    }

    try {
      console.log('🚀 DEBUG: Buscando passageiros COM grupos para viagem:', viagemId);

      const { data, error } = await supabase
        .from("viagem_passageiros")
        .select(`
          id,
          viagem_id,
          cliente_id,
          setor_maracana,
          status_pagamento,
          forma_pagamento,
          valor,
          desconto,
          created_at,
          onibus_id,
          cidade_embarque,
          observacoes,
          is_responsavel_onibus,
          pago_por_credito,
          credito_origem_id,
          valor_credito_utilizado,
          grupo_nome,
          grupo_cor,
          clientes!viagem_passageiros_cliente_id_fkey (
            id,
            nome,
            telefone,
            email,
            cpf,
            cidade,
            estado,
            endereco,
            numero,
            bairro,
            cep,
            complemento,
            data_nascimento,
            passeio_cristo,
            foto
          ),
          viagem_passageiros_parcelas (
            id,
            valor_parcela,
            forma_pagamento,
            data_pagamento,
            observacoes
          ),
          passageiro_passeios (
            passeio_nome,
            status,
            valor_cobrado,
            passeio:passeios!passeio_id (
              nome,
              valor,
              categoria
            )
          ),
          credito_origem:cliente_creditos!credito_origem_id (
            id,
            valor_credito,
            data_pagamento,
            cliente:clientes!cliente_id (
              nome
            )
          )
        `)
        .eq("viagem_id", viagemId);

      if (error) throw error;

      console.log('✅ DEBUG: Passageiros com grupos carregados:', data?.length || 0);

      // Processar dados incluindo campos de grupo
      const formattedPassageiros = (data || []).map((item: any) => {
        const passeios = item.passageiro_passeios || [];
        const passeioNames = passeios.map((p: any) => p.passeio_nome).filter(Boolean);

        const searchFields = [
          item.clientes.nome,
          item.clientes.telefone,
          item.clientes.email,
          item.clientes.cpf,
          item.clientes.cidade,
          item.setor_maracana,
          item.cidade_embarque,
          item.observacoes,
          item.status_pagamento,
          item.forma_pagamento,
          item.grupo_nome, // Incluir grupo na busca
          ...passeioNames
        ];

        const searchableText = createSearchableText(searchFields);

        return {
          id: item.clientes.id,
          nome: item.clientes.nome,
          telefone: item.clientes.telefone,
          email: item.clientes.email,
          cpf: item.clientes.cpf,
          cidade: item.clientes.cidade,
          estado: item.clientes.estado,
          endereco: item.clientes.endereco,
          numero: item.clientes.numero,
          bairro: item.clientes.bairro,
          cep: item.clientes.cep,
          complemento: item.clientes.complemento,
          data_nascimento: item.clientes.data_nascimento,
          setor_maracana: item.setor_maracana,
          status_pagamento: item.status_pagamento,
          forma_pagamento: item.forma_pagamento || "Pix",
          cliente_id: item.cliente_id,
          viagem_passageiro_id: item.id,
          valor: item.valor || 0,
          desconto: item.desconto || 0,
          onibus_id: item.onibus_id,
          viagem_id: item.viagem_id,
          passeio_cristo: item.clientes.passeio_cristo,
          foto: item.clientes.foto || null,
          cidade_embarque: item.cidade_embarque,
          observacoes: item.observacoes,
          is_responsavel_onibus: item.is_responsavel_onibus || false,
          pago_por_credito: item.pago_por_credito || false,
          credito_origem_id: item.credito_origem_id,
          valor_credito_utilizado: item.valor_credito_utilizado || 0,
          credito_origem: item.credito_origem,
          // Campos de grupo vindos do banco
          grupo_nome: item.grupo_nome || null,
          grupo_cor: item.grupo_cor || null,
          passeios: passeios,
          // Campos para busca otimizada
          searchableText,
          normalizedSearchText: normalizeText(searchableText),
          passeioNames,
          hasPasseios: passeios.length > 0
        };
      });

      // Ordenar por nome
      const sortedPassageiros = formattedPassageiros.sort((a, b) =>
        a.nome.localeCompare(b.nome, 'pt-BR')
      );

      return sortedPassageiros;

    } catch (err) {
      console.error("❌ Erro ao buscar passageiros com grupos:", err);
      toast.error("Erro ao carregar passageiros");
      throw err;
    }
  };

  return {
    ...originalHook,
    fetchPassageirosComGrupos
  };
}