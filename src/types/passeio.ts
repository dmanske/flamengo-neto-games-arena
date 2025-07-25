// Tipos para o sistema de passeios com valores

export interface Passeio {
  id: string;
  nome: string;
  valor: number;
  categoria: 'pago' | 'gratuito';
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ViagemPasseio {
  id?: string;
  viagem_id: string;
  passeio_id: string;
  valor_cobrado: number;
  created_at?: string;
  // Join com tabela passeios
  passeio?: Passeio;
}

// Tipos para formulários
export interface PasseioFormData {
  passeios_selecionados: string[]; // IDs dos passeios selecionados
  outro_passeio?: string;
}

// Tipos para exibição
export interface ViagemComPasseios {
  id: string;
  adversario: string;
  data_jogo: string;
  // ... outros campos da viagem
  viagem_passeios: ViagemPasseio[];
  total_custos_adicionais: number;
  outro_passeio?: string;
}

// Tipos para hooks
export interface UsePasseiosReturn {
  passeios: Passeio[];
  passeiosPagos: Passeio[];
  passeiosGratuitos: Passeio[];
  loading: boolean;
  error: string | null;
  calcularTotal: (passeioIds: string[]) => number;
  refetch: () => void;
}

// Tipos para componentes
export interface PasseiosSectionProps {
  form: any; // UseFormReturn será tipado quando integrarmos
  disabled?: boolean;
}

export interface PasseioCheckboxProps {
  passeio: Passeio;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}