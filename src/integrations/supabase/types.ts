export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      viagem_passageiros: {
        Row: {
          cidade_embarque: string
          cliente_id: string
          created_at: string
          desconto: number | null
          forma_pagamento: string
          id: string
          observacoes: string | null
          onibus_id: string | null
          setor_maracana: string
          status_pagamento: string
          valor: number | null
          viagem_id: string
        }
        Insert: {
          cidade_embarque?: string
          cliente_id: string
          created_at?: string
          desconto?: number | null
          forma_pagamento?: string
          id?: string
          observacoes?: string | null
          onibus_id?: string | null
          setor_maracana?: string
          status_pagamento?: string
          valor?: number | null
          viagem_id: string
        }
        Update: {
          cidade_embarque?: string
          cliente_id?: string
          created_at?: string
          desconto?: number | null
          forma_pagamento?: string
          id?: string
          observacoes?: string | null
          onibus_id?: string | null
          setor_maracana?: string
          status_pagamento?: string
          valor?: number | null
          viagem_id?: string
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
      viagem_passageiros_parcelas: {
        Row: {
          created_at: string | null
          data_pagamento: string | null
          forma_pagamento: string
          id: string
          observacoes: string | null
          valor_parcela: number
          viagem_passageiro_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_pagamento?: string | null
          forma_pagamento?: string
          id?: string
          observacoes?: string | null
          valor_parcela: number
          viagem_passageiro_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_pagamento?: string | null
          forma_pagamento?: string
          id?: string
          observacoes?: string | null
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
      viagens: {
        Row: {
          adversario: string
          capacidade_onibus: number
          cidade_embarque: string
          created_at: string
          data_jogo: string
          empresa: string
          id: string
          logo_adversario: string | null
          logo_flamengo: string | null
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
          empresa: string
          id?: string
          logo_adversario?: string | null
          logo_flamengo?: string | null
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
          empresa?: string
          id?: string
          logo_adversario?: string | null
          logo_flamengo?: string | null
          outro_passeio?: string | null
          passeios_pagos?: string[] | null
          setor_padrao?: string | null
          status_viagem?: string
          tipo_onibus?: string
          valor_padrao?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_viagem: {
        Args: { viagem_id: string }
        Returns: undefined
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
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
    },
  },
} as const
