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
          foto: string | null
          id: string
          indicacao_nome: string | null
          nome: string
          numero: string
          observacoes: string | null
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
          foto?: string | null
          id?: string
          indicacao_nome?: string | null
          nome: string
          numero: string
          observacoes?: string | null
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
          foto?: string | null
          id?: string
          indicacao_nome?: string | null
          nome?: string
          numero?: string
          observacoes?: string | null
          telefone?: string
        }
        Relationships: []
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
      viagem_onibus: {
        Row: {
          capacidade_onibus: number
          created_at: string
          empresa: string
          id: string
          numero_identificacao: string | null
          tipo_onibus: string
          viagem_id: string
        }
        Insert: {
          capacidade_onibus: number
          created_at?: string
          empresa: string
          id?: string
          numero_identificacao?: string | null
          tipo_onibus: string
          viagem_id: string
        }
        Update: {
          capacidade_onibus?: number
          created_at?: string
          empresa?: string
          id?: string
          numero_identificacao?: string | null
          tipo_onibus?: string
          viagem_id?: string
        }
        Relationships: [
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
          cliente_id: string
          created_at: string
          desconto: number | null
          forma_pagamento: string
          id: string
          onibus_id: string | null
          setor_maracana: string
          status_pagamento: string
          valor: number | null
          viagem_id: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          desconto?: number | null
          forma_pagamento?: string
          id?: string
          onibus_id?: string | null
          setor_maracana?: string
          status_pagamento?: string
          valor?: number | null
          viagem_id: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          desconto?: number | null
          forma_pagamento?: string
          id?: string
          onibus_id?: string | null
          setor_maracana?: string
          status_pagamento?: string
          valor?: number | null
          viagem_id?: string
        }
        Relationships: [
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
      viagens: {
        Row: {
          adversario: string
          capacidade_onibus: number
          created_at: string
          data_jogo: string
          empresa: string
          id: string
          logo_adversario: string | null
          logo_flamengo: string | null
          rota: string
          setor_padrao: string | null
          status_viagem: string
          tipo_onibus: string
          valor_padrao: number | null
        }
        Insert: {
          adversario: string
          capacidade_onibus: number
          created_at?: string
          data_jogo: string
          empresa: string
          id?: string
          logo_adversario?: string | null
          logo_flamengo?: string | null
          rota: string
          setor_padrao?: string | null
          status_viagem?: string
          tipo_onibus: string
          valor_padrao?: number | null
        }
        Update: {
          adversario?: string
          capacidade_onibus?: number
          created_at?: string
          data_jogo?: string
          empresa?: string
          id?: string
          logo_adversario?: string | null
          logo_flamengo?: string | null
          rota?: string
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
