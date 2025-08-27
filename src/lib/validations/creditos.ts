import { z } from 'zod';

// Schema para cadastro de novo crédito
export const creditoSchema = z.object({
  cliente_id: z.string().min(1, 'Cliente é obrigatório'),
  valor_credito: z
    .number()
    .min(0.01, 'Valor deve ser maior que zero')
    .max(999999.99, 'Valor muito alto'),
  data_pagamento: z.string().min(1, 'Data de pagamento é obrigatória'),
  forma_pagamento: z.string().optional(),
  observacoes: z.string().max(500, 'Observações muito longas').optional(),
});

// Schema para edição de crédito existente
export const editarCreditoSchema = creditoSchema.partial().extend({
  id: z.string().min(1, 'ID é obrigatório'),
});

// Schema para vinculação de crédito com viagem
export const vincularCreditoSchema = z.object({
  credito_id: z.string().min(1, 'Crédito é obrigatório'),
  viagem_id: z.string().min(1, 'Viagem é obrigatória'),
  valor_utilizado: z
    .number()
    .min(0.01, 'Valor deve ser maior que zero')
    .max(999999.99, 'Valor muito alto'),
  observacoes: z.string().max(500, 'Observações muito longas').optional(),
});

// Schema para reembolso de crédito
export const reembolsoCreditoSchema = z.object({
  credito_id: z.string().min(1, 'Crédito é obrigatório'),
  valor_reembolso: z
    .number()
    .min(0.01, 'Valor deve ser maior que zero')
    .max(999999.99, 'Valor muito alto'),
  motivo: z.string().min(1, 'Motivo é obrigatório').max(200, 'Motivo muito longo'),
  observacoes: z.string().max(500, 'Observações muito longas').optional(),
});

// Schema para filtros de créditos
export const filtrosCreditosSchema = z.object({
  cliente_id: z.string().optional(),
  status: z.enum(['disponivel', 'utilizado', 'parcial', 'reembolsado']).optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  valor_minimo: z.number().min(0).optional(),
  valor_maximo: z.number().min(0).optional(),
});

// Schema para cálculo de crédito vs viagem
export const calculoCreditoSchema = z.object({
  credito_id: z.string().min(1, 'Crédito é obrigatório'),
  viagem_id: z.string().min(1, 'Viagem é obrigatória'),
  valor_viagem: z.number().min(0.01, 'Valor da viagem deve ser maior que zero'),
  credito_disponivel: z.number().min(0, 'Crédito disponível não pode ser negativo'),
});

// Tipos derivados dos schemas
export type CreditoFormData = z.infer<typeof creditoSchema>;
export type EditarCreditoFormData = z.infer<typeof editarCreditoSchema>;
export type VincularCreditoFormData = z.infer<typeof vincularCreditoSchema>;
export type ReembolsoCreditoFormData = z.infer<typeof reembolsoCreditoSchema>;
export type FiltrosCreditosFormData = z.infer<typeof filtrosCreditosSchema>;
export type CalculoCreditoFormData = z.infer<typeof calculoCreditoSchema>;

// Validações customizadas
export const validarDataPagamento = (data: string): boolean => {
  const hoje = new Date();
  const dataPagamento = new Date(data);
  
  // Não pode ser mais de 1 ano no futuro
  const umAnoFuturo = new Date();
  umAnoFuturo.setFullYear(hoje.getFullYear() + 1);
  
  return dataPagamento <= umAnoFuturo;
};

export const validarValorCredito = (valor: number, saldoDisponivel?: number): boolean => {
  if (valor <= 0) return false;
  if (saldoDisponivel !== undefined && valor > saldoDisponivel) return false;
  return true;
};

export const validarTipoCreditoCompativel = (
  tipoCredito: string,
  tipoUso: string
): boolean => {
  // Crédito geral pode ser usado para qualquer coisa
  if (tipoCredito === 'geral') return true;
  
  // Crédito específico deve ser usado apenas para o tipo correspondente
  return tipoCredito === tipoUso;
};

// Mensagens de erro customizadas
export const MENSAGENS_ERRO_CREDITO = {
  CLIENTE_OBRIGATORIO: 'Selecione um cliente',
  VALOR_INVALIDO: 'Valor deve ser maior que zero',
  VALOR_MUITO_ALTO: 'Valor não pode exceder R$ 999.999,99',
  DATA_OBRIGATORIA: 'Data de pagamento é obrigatória',
  DATA_FUTURA_INVALIDA: 'Data não pode ser mais de 1 ano no futuro',
  TIPO_OBRIGATORIO: 'Selecione o tipo de crédito',
  OBSERVACOES_LONGAS: 'Observações não podem exceder 500 caracteres',
  CREDITO_INSUFICIENTE: 'Saldo do crédito insuficiente',
  VIAGEM_OBRIGATORIA: 'Selecione uma viagem',
  MOTIVO_OBRIGATORIO: 'Informe o motivo do reembolso',
  TIPO_INCOMPATIVEL: 'Tipo de crédito incompatível com o uso',
} as const;