
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clientes: {
        Row: {
          id: string
          nome: string
          endereco: string
          numero: string
          complemento: string | null
          bairro: string
          telefone: string
          cep: string
          cidade: string
          estado: string
          cpf: string
          data_nascimento: string
          email: string
          como_conheceu: string
          indicacao_nome: string | null
          observacoes: string | null
          created_at: string
          foto: string | null
        }
        Insert: {
          id?: string
          nome: string
          endereco: string
          numero: string
          complemento?: string | null
          bairro: string
          telefone: string
          cep: string
          cidade: string
          estado: string
          cpf: string
          data_nascimento: string
          email: string
          como_conheceu: string
          indicacao_nome?: string | null
          observacoes?: string | null
          created_at?: string
          foto?: string | null
        }
        Update: {
          id?: string
          nome?: string
          endereco?: string
          numero?: string
          complemento?: string | null
          bairro?: string
          telefone?: string
          cep?: string
          cidade?: string
          estado?: string
          cpf?: string
          data_nascimento?: string
          email?: string
          como_conheceu?: string
          indicacao_nome?: string | null
          observacoes?: string | null
          created_at?: string
          foto?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
