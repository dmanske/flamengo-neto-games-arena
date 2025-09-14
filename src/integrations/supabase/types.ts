export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      adversarios: {
        Row: {
          id: string
          logo_url: string
          nome: string
        }
        Insert: {
          id?: string
          logo_url: string
          nome: string
        }
        Update: {
          id?: string
          logo_url?: string
          nome?: string
        }
        Relationships: []
      }
      categorias_financeiras: {
        Row: {
          ativa: boolean | null
          cor: string | null
          created_at: string | null
          icone: string | null
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          ativa?: boolean | null
          cor?: string | null
          created_at?: string | null
          icone?: string | null
          id?: string
          nome: string
          tipo: string
        }
        Update: {
          ativa?: boolean | null
          cor?: string | null
          created_at?: string | null
          icone?: string | null
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          bairro: string
          cep: string
          cidade: string
          como_conheceu: string
          complemento: string | null
          cpf: string
          created_at: string
          data_nascimento: string
          email: string
          endereco: string
          estado: string
          fonte_cadastro: string | null
          foto: string | null
          id: string
          indicacao_nome: string | null
          nome: string
          numero: string
          observacoes: string | null
          passeio_cristo: string
          telefone: string
        }
        Insert: {
          bairro: string
          cep: string
          cidade: string
          como_conheceu: string
          complemento?: string | null
          cpf: string
          created_at?: string
          data_nascimento: string
          email: string
          endereco: string
          estado: string
          fonte_cadastro?: string | null
          foto?: string | null
          id?: string
          indicacao_nome?: string | null
          nome: string
          numero: string
          observacoes?: string | null
          passeio_cristo?: string
          telefone: string
        }
        Update: {
          bairro?: string
          cep?: string
          cidade?: string
          como_conheceu?: string
          complemento?: string | null
          cpf?: string
          created_at?: string
          data_nascimento?: string
          email?: string
          endereco?: string
          estado?: string
          fonte_cadastro?: string | null
          foto?: string | null
          id?: string
          indicacao_nome?: string | null
          nome?: string
          numero?: string
          observacoes?: string | null
          passeio_cristo?: string
          telefone?: string
        }
        Relationships: []
      }
      contas_pagar: {
        Row: {
          categoria: string
          created_at: string | null
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          fornecedor: string
          frequencia_recorrencia: string | null
          id: string
          observacoes: string | null
          recorrente: boolean | null
          status: string | null
          updated_at: string | null
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          fornecedor: string
          frequencia_recorrencia?: string | null
          id?: string
          observacoes?: string | null
          recorrente?: boolean | null
          status?: string | null
          updated_at?: string | null
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          fornecedor?: string
          frequencia_recorrencia?: string | null
          id?: string
          observacoes?: string | null
          recorrente?: boolean | null
          status?: string | null
          updated_at?: string | null
          valor?: number
        }
        Relationships: []
      }
      despesas: {
        Row: {
          categoria: string
          comprovante_url: string | null
          created_at: string | null
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          fornecedor: string | null
          id: string
          metodo_pagamento: string | null
          observacoes: string | null
          status: string | null
          updated_at: string | null
          valor: number
          viagem_id: string | null
        }
        Insert: {
          categoria: string
          comprovante_url?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          fornecedor?: string | null
          id?: string
          metodo_pagamento?: string | null
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
          valor: number
          viagem_id?: string | null
        }
        Update: {
          categoria?: string
          comprovante_url?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          fornecedor?: string | null
          id?: string
          metodo_pagamento?: string | null
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
          valor?: number
          viagem_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "despesas_viagem_id_fkey"
            columns: ["viagem_id"]
            isOneToOne: false
            referencedRelation: "viagens"
            referencedColumns: ["id"]
          },
        ]
      }
      empresa_config: {
        Row: {
          ativo: boolean | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          created_at: string | null
          descricao: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          facebook: string | null
          id: string
          instagram: string | null
          logo_bucket_path: string | null
          logo_url: string | null
          nome: string
          nome_fantasia: string | null
          site: string | null
          telefone: string | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          ativo?: boolean | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          descricao?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          logo_bucket_path?: string | null
          logo_url?: string | null
          nome: string
          nome_fantasia?: string | null
          site?: string | null
          telefone?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          ativo?: boolean | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          descricao?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          logo_bucket_path?: string | null
          logo_url?: string | null
          nome?: string
          nome_fantasia?: string | null
          site?: string | null
          telefone?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      game_buses: {
        Row: {
          capacity: number | null
          created_at: string
          game_id: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          game_id: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          game_id?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_buses_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string
          date: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lista_presenca: {
        Row: {
          created_at: string | null
          horario_chegada: string | null
          id: string
          observacoes: string | null
          passageiro_id: string
          presente: boolean | null
          registrado_por: string | null
          updated_at: string | null
          viagem_id: string
        }
        Insert: {
          created_at?: string | null
          horario_chegada?: string | null
          id?: string
          observacoes?: string | null
          passageiro_id: string
          presente?: boolean | null
          registrado_por?: string | null
          updated_at?: string | null
          viagem_id: string
        }
        Update: {
          created_at?: string | null
          horario_chegada?: string | null
          id?: string
          observacoes?: string | null
          passageiro_id?: string
          presente?: boolean | null
          registrado_por?: string | null
          updated_at?: string | null
          viagem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lista_presenca_passageiro_id_fkey"
            columns: ["passageiro_id"]
            isOneToOne: false
            referencedRelation: "viagem_passageiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_presenca_viagem_id_fkey"
            columns: ["viagem_id"]
            isOneToOne: false
            referencedRelation: "viagens"
            referencedColumns: ["id"]
          },
        ]
      }
      onibus: {
        Row: {
          capacidade: number
          created_at: string
          description: string | null
          empresa: string
          id: string
          image_path: string | null
          numero_identificacao: string | null
          tipo_onibus: string
          updated_at: string
          wifi_ssid: string | null
          wifi_password: string | null
        }
        Insert: {
          capacidade: number
          created_at?: string
          description?: string | null
          empresa: string
          id?: string
          image_path?: string | null
          numero_identificacao?: string | null
          tipo_onibus: string
          updated_at?: string
          wifi_ssid?: string | null
          wifi_password?: string | null
        }
        Update: {
          capacidade?: number
          created_at?: string
          description?: string | null
          empresa?: string
          id?: string
          image_path?: string | null
          numero_identificacao?: string | null
          tipo_onibus?: string
          updated_at?: string
          wifi_ssid?: string | null
          wifi_password?: string | null
        }
        Relationships: []
      }
      onibus_images: {
        Row: {
          created_at: string | null
          empresa: string
          id: string
          image_url: string | null
          onibus_id: string | null
          tipo_onibus: string
        }
        Insert: {
          created_at?: string | null
          empresa: string
          id?: string
          image_url?: string | null
          onibus_id?: string | null
          tipo_onibus: string
        }
        Update: {
          created_at?: string | null
          empresa?: string
          id?: string
          image_url?: string | null
          onibus_id?: string | null
          tipo_onibus?: string
        }
        Relationships: [
          {
            foreignKeyName: "onibus_images_onibus_id_fkey"
            columns: ["onibus_id"]
            isOneToOne: false
            referencedRelation: "onibus"
            referencedColumns: ["id"]
          },
        ]
      }
      parcela_alertas: {
        Row: {
          canal: string | null
          created_at: string | null
          data_envio: string | null
          id: string
          mensagem_enviada: string | null
          parcela_id: string
          resposta_recebida: string | null
          status_envio: string | null
          template_usado: string | null
          tentativas: number | null
          tipo_alerta: string
        }
        Insert: {
          canal?: string | null
          created_at?: string | null
          data_envio?: string | null
          id?: string
          mensagem_enviada?: string | null
          parcela_id: string
          resposta_recebida?: string | null
          status_envio?: string | null
          template_usado?: string | null
          tentativas?: number | null
          tipo_alerta: string
        }
        Update: {
          canal?: string | null
          created_at?: string | null
          data_envio?: string | null
          id?: string
          mensagem_enviada?: string | null
          parcela_id?: string
          resposta_recebida?: string | null
          status_envio?: string | null
          template_usado?: string | null
          tentativas?: number | null
          tipo_alerta?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_alertas_parcela"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "viagem_passageiros_parcelas"
            referencedColumns: ["id"]
          },
        ]
      }
      parcela_historico: {
        Row: {
          acao: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          observacoes: string | null
          parcela_id: string
          user_agent: string | null
          usuario_id: string | null
          valor_anterior: Json | null
          valor_novo: Json | null
        }
        Insert: {
          acao: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          observacoes?: string | null
          parcela_id: string
          user_agent?: string | null
          usuario_id?: string | null
          valor_anterior?: Json | null
          valor_novo?: Json | null
        }
        Update: {
          acao?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          observacoes?: string | null
          parcela_id?: string
          user_agent?: string | null
          usuario_id?: string | null
          valor_anterior?: Json | null
          valor_novo?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_historico_parcela"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "viagem_passageiros_parcelas"
            referencedColumns: ["id"]
          },
        ]
      }
      passageiro_passeios: {
        Row: {
          created_at: string
          id: string
          passeio_nome: string
          status: string
          updated_at: string
          viagem_passageiro_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          passeio_nome: string
          status?: string
          updated_at?: string
          viagem_passageiro_id: string
        }
        Update: {
          created_at?: string
          id?: string
          passeio_nome?: string
          status?: string
          updated_at?: string
          viagem_passageiro_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "passageiro_passeios_viagem_passageiro_id_fkey"
            columns: ["viagem_passageiro_id"]
            isOneToOne: false
            referencedRelation: "viagem_passageiros"
            referencedColumns: ["id"]
          },
        ]
      }
      passengers: {
        Row: {
          boarding_city: string
          bus_id: string | null
          created_at: string
          game_id: string
          id: string
          name: string
          status: Database["public"]["Enums"]["passenger_status"]
          updated_at: string
        }
        Insert: {
          boarding_city: string
          bus_id?: string | null
          created_at?: string
          game_id: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["passenger_status"]
          updated_at?: string
        }
        Update: {
          boarding_city?: string
          bus_id?: string | null
          created_at?: string
          game_id?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["passenger_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "passengers_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "game_buses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passengers_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          cliente_id: string | null
          created_at: string
          currency: string
          customer_email: string | null
          id: string
          payment_method: string | null
          session_id: string | null
          status: string
          updated_at: string
          viagem_id: string | null
        }
        Insert: {
          amount: number
          cliente_id?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          id?: string
          payment_method?: string | null
          session_id?: string | null
          status?: string
          updated_at?: string
          viagem_id?: string | null
        }
        Update: {
          amount?: number
          cliente_id?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          id?: string
          payment_method?: string | null
          session_id?: string | null
          status?: string
          updated_at?: string
          viagem_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_viagem_id_fkey"
            columns: ["viagem_id"]
            isOneToOne: false
            referencedRelation: "viagens"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          nome: string | null
          perfil: string | null
          telefone: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          nome?: string | null
          perfil?: string | null
          telefone?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string | null
          perfil?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      projecoes_fluxo_caixa: {
        Row: {
          created_at: string | null
          despesas_projetadas: number | null
          despesas_realizadas: number | null
          id: string
          mes_ano: string
          receitas_projetadas: number | null
          receitas_realizadas: number | null
          saldo_projetado: number | null
          saldo_realizado: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          despesas_projetadas?: number | null
          despesas_realizadas?: number | null
          id?: string
          mes_ano: string
          receitas_projetadas?: number | null
          receitas_realizadas?: number | null
          saldo_projetado?: number | null
          saldo_realizado?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          despesas_projetadas?: number | null
          despesas_realizadas?: number | null
          id?: string
          mes_ano?: string
          receitas_projetadas?: number | null
          receitas_realizadas?: number | null
          saldo_projetado?: number | null
          saldo_realizado?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      receitas: {
        Row: {
          categoria: string
          cliente_id: string | null
          comprovante_url: string | null
          created_at: string | null
          data_recebimento: string
          descricao: string
          id: string
          metodo_pagamento: string | null
          observacoes: string | null
          status: string | null
          updated_at: string | null
          valor: number
          viagem_id: string | null
        }
        Insert: {
          categoria: string
          cliente_id?: string | null
          comprovante_url?: string | null
          created_at?: string | null
          data_recebimento: string
          descricao: string
          id?: string
          metodo_pagamento?: string | null
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
          valor: number
          viagem_id?: string | null
        }
        Update: {
          categoria?: string
          cliente_id?: string | null
          comprovante_url?: string | null
          created_at?: string | null
          data_recebimento?: string
          descricao?: string
          id?: string
          metodo_pagamento?: string | null
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
          valor?: number
          viagem_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receitas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receitas_viagem_id_fkey"
            columns: ["viagem_id"]
            isOneToOne: false
            referencedRelation: "viagens"
            referencedColumns: ["id"]
          },
        ]
      }
      sistema_parametros: {
        Row: {
          chave: string
          created_at: string
          descricao: string | null
          id: string
          updated_at: string
          valor: string | null
        }
        Insert: {
          chave: string
          created_at?: string
          descricao?: string | null
          id?: string
          updated_at?: string
          valor?: string | null
        }
        Update: {
          chave?: string
          created_at?: string
          descricao?: string | null
          id?: string
          updated_at?: string
          valor?: string | null
        }
        Relationships: []
      }
      stripe_customers: {
        Row: {
          cliente_id: string | null
          created_at: string
          id: string
          stripe_customer_id: string
          updated_at: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          id?: string
          stripe_customer_id: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          id?: string
          stripe_customer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_customers_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      system_config: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          email: string
          id: string
          nome: string
          role: string
          updated_at: string | null
          user_id: string
          viagem_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          nome: string
          role?: string
          updated_at?: string | null
          user_id: string
          viagem_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          role?: string
          updated_at?: string | null
          user_id?: string
          viagem_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_viagem_id_fkey"
            columns: ["viagem_id"]
            isOneToOne: false
            referencedRelation: "viagens"
            referencedColumns: ["id"]
          },
        ]
      }
      viagem_cobranca_historico: {
        Row: {
          created_at: string | null
          data_tentativa: string | null
          id: string
          mensagem_enviada: string | null
          observacoes: string | null
          proximo_followup: string | null
          status_envio: string | null
          template_usado: string | null
          tipo_contato: string
          viagem_passageiro_id: string
        }
        Insert: {
          created_at?: string | null
          data_tentativa?: string | null
          id?: string
          mensagem_enviada?: string | null
          observacoes?: string | null
          proximo_followup?: string | null
          status_envio?: string | null
          template_usado?: string | null
          tipo_contato: string
          viagem_passageiro_id: string
        }
        Update: {
          created_at?: string | null
          data_tentativa?: string | null
          id?: string
          mensagem_enviada?: string | null
          observacoes?: string | null
          proximo_followup?: string | null
          status_envio?: string | null
          template_usado?: string | null
          tipo_contato?: string
          viagem_passageiro_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "viagem_cobranca_historico_viagem_passageiro_id_fkey"
            columns: ["viagem_passageiro_id"]
            isOneToOne: false
            referencedRelation: "viagem_passageiros"
            referencedColumns: ["id"]
          },
        ]
      }
      viagem_despesas: {
        Row: {
          categoria: string
          comprovante_url: string | null
          created_at: string | null
          data_despesa: string
          forma_pagamento: string | null
          fornecedor: string
          id: string
          observacoes: string | null
          status: string | null
          subcategoria: string | null
          updated_at: string | null
          valor: number
          viagem_id: string
        }
        Insert: {
          categoria: string
          comprovante_url?: string | null
          created_at?: string | null
          data_despesa: string
          forma_pagamento?: string | null
          fornecedor: string
          id?: string
          observacoes?: string | null
          status?: string | null
          subcategoria?: string | null
          updated_at?: string | null
          valor: number
          viagem_id: string
        }
        Update: {
          categoria?: string
          comprovante_url?: string | null
          created_at?: string | null
          data_despesa?: string
          forma_pagamento?: string | null
          fornecedor?: string
          id?: string
          observacoes?: string | null
          status?: string | null
          subcategoria?: string | null
          updated_at?: string | null
          valor?: number
          viagem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "viagem_despesas_viagem_id_fkey"
            columns: ["viagem_id"]
            isOneToOne: false
            referencedRelation: "viagens"
            referencedColumns: ["id"]
          },
        ]
      }
      viagem_onibus: {
        Row: {
          capacidade_onibus: number
          created_at: string
          empresa: string
          id: string
          lugares_extras: number
          numero_identificacao: string | null
          tipo_onibus: string
          viagem_id: string
        }
        Insert: {
          capacidade_onibus: number
          created_at?: string
          empresa: string
          id?: string
          lugares_extras?: number
          numero_identificacao?: string | null
          tipo_onibus: string
          viagem_id: string
        }
        Update: {
          capacidade_onibus?: number
          created_at?: string
          empresa?: string
          id?: string
          lugares_extras?: number
          numero_identificacao?: string | null
          tipo_onibus?: string
          viagem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_viagem_onibus_viagem_id"
            columns: ["viagem_id"]
            isOneToOne: false
            referencedRelation: "viagens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viagem_onibus_viagem_id_fkey"
            columns: ["viagem_id"]
            isOneToOne: false
            referencedRelation: "viagens"
            referencedColumns: ["id"]
          },
        ]
      }
      viagem_orcamento: {
        Row: {
          categoria: string
          created_at: string | null
          descricao: string
          id: string
          observacoes: string | null
          subcategoria: string | null
          updated_at: string | null
          valor_orcado: number
          valor_realizado: number | null
          viagem_id: string
        }
        Insert: {
          categoria: string
          created_at?: string | null
          descricao: string
          id?: string
          observacoes?: string | null
          subcategoria?: string | null
          updated_at?: string | null
          valor_orcado: number
          valor_realizado?: number | null
          viagem_id: string
        }
        Update: {
          categoria?: string
          created_at?: string | null
          descricao?: string
          id?: string
          observacoes?: string | null
          subcategoria?: string | null
          updated_at?: string | null
          valor_orcado?: number
          valor_realizado?: number | null
          viagem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "viagem_orcamento_viagem_id_fkey"
            columns: ["viagem_id"]
            isOneToOne: false
            referencedRelation: "viagens"
            referencedColumns: ["id"]
          },
        ]
      }
      viagem_parcelamento_config: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          desconto_avista_percent: number | null
          id: string
          intervalo_minimo_dias: number | null
          max_parcelas: number | null
          prazo_limite_dias: number | null
          updated_at: string | null
          viagem_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          desconto_avista_percent?: number | null
          id?: string
          intervalo_minimo_dias?: number | null
          max_parcelas?: number | null
          prazo_limite_dias?: number | null
          updated_at?: string | null
          viagem_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          desconto_avista_percent?: number | null
          id?: string
          intervalo_minimo_dias?: number | null
          max_parcelas?: number | null
          prazo_limite_dias?: number | null
          updated_at?: string | null
          viagem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_parcelamento_config_viagem"
            columns: ["viagem_id"]
            isOneToOne: true
            referencedRelation: "viagens"
            referencedColumns: ["id"]
          },
        ]
      }
      viagem_passageiros: {
        Row: {
          cidade_embarque: string
          cliente_id: string
          created_at: string
          desconto: number | null
          forma_pagamento: string
          id: string
          is_responsavel_onibus: boolean | null
          observacoes: string | null
          onibus_id: string | null
          passeios_pagos: boolean | null
          setor_maracana: string
          status_pagamento: string
          status_presenca: string | null
          valor: number | null
          viagem_id: string
          viagem_paga: boolean | null
        }
        Insert: {
          cidade_embarque?: string
          cliente_id: string
          created_at?: string
          desconto?: number | null
          forma_pagamento?: string
          id?: string
          is_responsavel_onibus?: boolean | null
          observacoes?: string | null
          onibus_id?: string | null
          passeios_pagos?: boolean | null
          setor_maracana?: string
          status_pagamento?: string
          status_presenca?: string | null
          valor?: number | null
          viagem_id: string
          viagem_paga?: boolean | null
        }
        Update: {
          cidade_embarque?: string
          cliente_id?: string
          created_at?: string
          desconto?: number | null
          forma_pagamento?: string
          id?: string
          is_responsavel_onibus?: boolean | null
          observacoes?: string | null
          onibus_id?: string | null
          passeios_pagos?: boolean | null
          setor_maracana?: string
          status_pagamento?: string
          status_presenca?: string | null
          valor?: number | null
          viagem_id?: string
          viagem_paga?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_viagem_passageiros_cliente_id"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_viagem_passageiros_onibus_id"
            columns: ["onibus_id"]
            isOneToOne: false
            referencedRelation: "viagem_onibus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_viagem_passageiros_viagem_id"
            columns: ["viagem_id"]
            isOneToOne: false
            referencedRelation: "viagens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viagem_passageiros_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viagem_passageiros_onibus_id_fkey"
            columns: ["onibus_id"]
            isOneToOne: false
            referencedRelation: "viagem_onibus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viagem_passageiros_viagem_id_fkey"
            columns: ["viagem_id"]
            isOneToOne: false
            referencedRelation: "viagens"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_pagamentos_categorizado: {
        Row: {
          categoria: string
          created_at: string
          data_pagamento: string
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          updated_at: string
          valor_pago: number
          viagem_passageiro_id: string
        }
        Insert: {
          categoria: string
          created_at?: string
          data_pagamento?: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          updated_at?: string
          valor_pago: number
          viagem_passageiro_id: string
        }
        Update: {
          categoria?: string
          created_at?: string
          data_pagamento?: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          updated_at?: string
          valor_pago?: number
          viagem_passageiro_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_pagamentos_categorizado_viagem_passageiro_id_fkey"
            columns: ["viagem_passageiro_id"]
            isOneToOne: false
            referencedRelation: "viagem_passageiros"
            referencedColumns: ["id"]
          },
        ]
      }
      viagem_passageiros_parcelas: {
        Row: {
          created_at: string | null
          data_pagamento: string | null
          data_vencimento: string
          desconto_aplicado: number | null
          forma_pagamento: string
          id: string
          numero_parcela: number
          observacoes: string | null
          status: string | null
          tipo_parcelamento: string | null
          total_parcelas: number
          updated_at: string | null
          valor_original: number | null
          valor_parcela: number
          viagem_passageiro_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          desconto_aplicado?: number | null
          forma_pagamento?: string
          id?: string
          numero_parcela?: number
          observacoes?: string | null
          status?: string | null
          tipo_parcelamento?: string | null
          total_parcelas?: number
          updated_at?: string | null
          valor_original?: number | null
          valor_parcela: number
          viagem_passageiro_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          desconto_aplicado?: number | null
          forma_pagamento?: string
          id?: string
          numero_parcela?: number
          observacoes?: string | null
          status?: string | null
          tipo_parcelamento?: string | null
          total_parcelas?: number
          updated_at?: string | null
          valor_original?: number | null
          valor_parcela?: number
          viagem_passageiro_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "viagem_passageiros_parcelas_viagem_passageiro_id_fkey"
            columns: ["viagem_passageiro_id"]
            isOneToOne: false
            referencedRelation: "viagem_passageiros"
            referencedColumns: ["id"]
          },
        ]
      }
      viagem_receitas: {
        Row: {
          categoria: string
          created_at: string | null
          data_recebimento: string
          descricao: string
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          status: string | null
          updated_at: string | null
          valor: number
          viagem_id: string
        }
        Insert: {
          categoria: string
          created_at?: string | null
          data_recebimento: string
          descricao: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
          valor: number
          viagem_id: string
        }
        Update: {
          categoria?: string
          created_at?: string | null
          data_recebimento?: string
          descricao?: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
          valor?: number
          viagem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "viagem_receitas_viagem_id_fkey"
            columns: ["viagem_id"]
            isOneToOne: false
            referencedRelation: "viagens"
            referencedColumns: ["id"]
          },
        ]
      }
      viagens: {
        Row: {
          adversario: string
          capacidade_onibus: number
          cidade_embarque: string
          created_at: string
          data_jogo: string
          data_saida: string | null
          empresa: string
          id: string
          local_jogo: string
          logo_adversario: string | null
          logo_flamengo: string | null
          nome_estadio: string | null
          outro_passeio: string | null
          passeios_pagos: string[] | null
          setor_padrao: string | null
          status_viagem: string
          tipo_onibus: string
          valor_padrao: number | null
        }
        Insert: {
          adversario: string
          capacidade_onibus: number
          cidade_embarque?: string
          created_at?: string
          data_jogo: string
          data_saida?: string | null
          empresa: string
          id?: string
          local_jogo?: string
          logo_adversario?: string | null
          logo_flamengo?: string | null
          nome_estadio?: string | null
          outro_passeio?: string | null
          passeios_pagos?: string[] | null
          setor_padrao?: string | null
          status_viagem?: string
          tipo_onibus: string
          valor_padrao?: number | null
        }
        Update: {
          adversario?: string
          capacidade_onibus?: number
          cidade_embarque?: string
          created_at?: string
          data_jogo?: string
          data_saida?: string | null
          empresa?: string
          id?: string
          local_jogo?: string
          logo_adversario?: string | null
          logo_flamengo?: string | null
          nome_estadio?: string | null
          outro_passeio?: string | null
          passeios_pagos?: string[] | null
          setor_padrao?: string | null
          status_viagem?: string
          tipo_onibus?: string
          valor_padrao?: number | null
        }
        Relationships: []
      }
      passeios: {
        Row: {
          id: string
          nome: string
          valor: number
          categoria: string
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          valor: number
          categoria: string
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          valor?: number
          categoria?: string
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      viagem_passeios: {
        Row: {
          id: string
          viagem_id: string
          passeio_id: string
          valor_cobrado: number
          created_at: string
        }
        Insert: {
          id?: string
          viagem_id: string
          passeio_id: string
          valor_cobrado: number
          created_at?: string
        }
        Update: {
          id?: string
          viagem_id?: string
          passeio_id?: string
          valor_cobrado?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "viagem_passeios_viagem_id_fkey"
            columns: ["viagem_id"]
            isOneToOne: false
            referencedRelation: "viagens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viagem_passeios_passeio_id_fkey"
            columns: ["passeio_id"]
            isOneToOne: false
            referencedRelation: "passeios"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      v_lista_presenca_completa: {
        Row: {
          adversario: string | null
          cidade_embarque: string | null
          created_at: string | null
          data_jogo: string | null
          horario_chegada: string | null
          id: string | null
          observacoes: string | null
          passageiro_email: string | null
          passageiro_id: string | null
          passageiro_nome: string | null
          passageiro_telefone: string | null
          presente: boolean | null
          registrado_por: string | null
          registrado_por_nome: string | null
          setor_maracana: string | null
          tipo_onibus: string | null
          updated_at: string | null
          viagem_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lista_presenca_passageiro_id_fkey"
            columns: ["passageiro_id"]
            isOneToOne: false
            referencedRelation: "viagem_passageiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_presenca_viagem_id_fkey"
            columns: ["viagem_id"]
            isOneToOne: false
            referencedRelation: "viagens"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      criar_usuario_presenca: {
        Args: {
          user_uuid: string
          user_email: string
          user_nome: string
          viagem_uuid?: string
        }
        Returns: string
      }
      current_timestamp_br: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      delete_viagem: {
        Args: { viagem_id: string }
        Returns: undefined
      }
      inicializar_lista_presenca: {
        Args: { viagem_uuid: string }
        Returns: number
      }
      marcar_presenca: {
        Args: {
          viagem_uuid: string
          passageiro_uuid: string
          esta_presente: boolean
          observacao?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      fonte_conhecimento:
        | "Instagram"
        | "Indicação"
        | "Facebook"
        | "Google"
        | "WhatsApp"
        | "Outro"
      passenger_status: "pending" | "confirmed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      fonte_conhecimento: [
        "Instagram",
        "Indicação",
        "Facebook",
        "Google",
        "WhatsApp",
        "Outro",
      ],
      passenger_status: ["pending", "confirmed"],
    },
  },
} as const
