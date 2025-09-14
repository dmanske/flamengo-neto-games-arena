
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
      onibus: {
        Row: {
          id: string
          tipo_onibus: string
          empresa: string
          numero_identificacao: string | null
          capacidade: number
          created_at: string
          updated_at: string
          description: string | null
          image_path: string | null
          wifi_ssid: string | null
          wifi_password: string | null
        }
        Insert: {
          id?: string
          tipo_onibus: string
          empresa: string
          numero_identificacao?: string | null
          capacidade: number
          created_at?: string
          updated_at?: string
          description?: string | null
          image_path?: string | null
          wifi_ssid?: string | null
          wifi_password?: string | null
        }
        Update: {
          id?: string
          tipo_onibus?: string
          empresa?: string
          numero_identificacao?: string | null
          capacidade?: number
          created_at?: string
          updated_at?: string
          description?: string | null
          image_path?: string | null
          wifi_ssid?: string | null
          wifi_password?: string | null
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
