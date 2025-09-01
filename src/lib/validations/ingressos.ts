import { z } from 'zod';
import { LocalJogo, SituacaoFinanceiraIngresso, FormaPagamentoIngresso } from '@/types/ingressos';

// Schema para validação de datas
const dataSchema = z.string().refine((date) => {
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
}, {
  message: "Data inválida"
});

// Schema para validação de valores monetários
const valorMonetarioSchema = z.number()
  .min(0, "Valor deve ser maior ou igual a zero")
  .max(999999.99, "Valor muito alto");

// Schema principal para ingresso
export const ingressoSchema = z.object({
  cliente_id: z.string()
    .min(1, "Cliente é obrigatório")
    .uuid("ID do cliente inválido"),
  
  viagem_id: z.string().uuid("ID da viagem inválido").optional().nullable(),
  viagem_ingressos_id: z.string().uuid("ID da viagem de ingressos inválido").optional().nullable(),
  
  jogo_data: dataSchema.refine((date) => {
    const hoje = new Date();
    const dataJogo = new Date(date);
    // Permite jogos até 30 dias no passado (para correções)
    const limitePasado = new Date();
    limitePasado.setDate(hoje.getDate() - 30);
    
    return dataJogo >= limitePasado;
  }, {
    message: "Data do jogo não pode ser muito antiga"
  }),
  
  adversario: z.string()
    .min(2, "Nome do adversário deve ter pelo menos 2 caracteres")
    .max(100, "Nome do adversário muito longo")
    .trim(),
  
  logo_adversario: z.string()
    .url("URL do logo inválida")
    .optional()
    .nullable()
    .or(z.literal('')),
  
  local_jogo: z.enum(['casa', 'fora'] as const, {
    errorMap: () => ({ message: "Local deve ser 'casa' ou 'fora'" })
  }),
  
  setor_estadio: z.string()
    .min(2, "Setor deve ter pelo menos 2 caracteres")
    .max(100, "Nome do setor muito longo")
    .trim(),
  
  preco_custo: valorMonetarioSchema,
  
  preco_venda: valorMonetarioSchema,
  
  desconto: valorMonetarioSchema,
  

  
  observacoes: z.string()
    .max(1000, "Observações muito longas")
    .optional()
    .nullable()
}).refine((data) => {
  // Validação: preço de venda deve ser maior que desconto
  return data.preco_venda >= data.desconto;
}, {
  message: "Desconto não pode ser maior que o preço de venda",
  path: ["desconto"]
});

// Schema para edição de ingresso (permite campos opcionais)
export const editarIngressoSchema = z.object({
  id: z.string().uuid("ID do ingresso inválido"),
  cliente_id: z.string().uuid("ID do cliente inválido").optional(),
  viagem_id: z.string().uuid("ID da viagem inválido").optional().nullable(),
  viagem_ingressos_id: z.string().uuid("ID da viagem de ingressos inválido").optional().nullable(),
  jogo_data: dataSchema.optional(),
  adversario: z.string().min(2).max(100).trim().optional(),
  logo_adversario: z.string().url("URL do logo inválida").optional().nullable().or(z.literal('')),
  local_jogo: z.enum(['casa', 'fora'] as const).optional(),
  setor_estadio: z.string().min(2).max(100).trim().optional(),
  preco_custo: valorMonetarioSchema.optional(),
  preco_venda: valorMonetarioSchema.optional(),
  desconto: valorMonetarioSchema.optional(),

  observacoes: z.string().max(1000).optional().nullable()
});

// Schema para pagamento de ingresso
export const pagamentoIngressoSchema = z.object({
  ingresso_id: z.string()
    .min(1, "ID do ingresso é obrigatório")
    .uuid("ID do ingresso inválido"),
  
  valor_pago: z.number()
    .min(0.01, "Valor pago deve ser maior que zero")
    .max(999999.99, "Valor muito alto"),
  
  data_pagamento: dataSchema.refine((date) => {
    const hoje = new Date();
    const dataPagamento = new Date(date);
    // Permite pagamentos até 1 ano no passado
    const limitePasado = new Date();
    limitePasado.setFullYear(hoje.getFullYear() - 1);
    
    // Não permite pagamentos no futuro (exceto hoje)
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);
    
    return dataPagamento >= limitePasado && dataPagamento < amanha;
  }, {
    message: "Data de pagamento inválida"
  }),
  
  forma_pagamento: z.enum([
    'dinheiro', 
    'pix', 
    'cartao_credito', 
    'cartao_debito', 
    'transferencia', 
    'boleto',
    'outros'
  ] as const, {
    errorMap: () => ({ message: "Forma de pagamento inválida" })
  }),
  
  observacoes: z.string()
    .max(500, "Observações muito longas")
    .optional()
    .nullable()
});

// Schema para edição de pagamento
export const editarPagamentoIngressoSchema = z.object({
  id: z.string().uuid("ID do pagamento inválido"),
  ingresso_id: z.string().uuid("ID do ingresso inválido").optional(),
  valor_pago: z.number().min(0.01).max(999999.99).optional(),
  data_pagamento: dataSchema.optional(),
  forma_pagamento: z.enum([
    'dinheiro', 
    'pix', 
    'cartao_credito', 
    'cartao_debito', 
    'transferencia', 
    'boleto',
    'outros'
  ] as const).optional(),
  observacoes: z.string().max(500).optional().nullable()
});

// Schema para filtros de busca
export const filtrosIngressosSchema = z.object({
  cliente_id: z.string().optional(),
  situacao_financeira: z.union([
    z.enum(['pendente', 'pago', 'cancelado']),
    z.literal('')
  ]).optional(),
  local_jogo: z.union([
    z.enum(['casa', 'fora']),
    z.literal('')
  ]).optional(),
  data_inicio: z.union([dataSchema, z.literal('')]).optional(),
  data_fim: z.union([dataSchema, z.literal('')]).optional(),
  adversario: z.string().optional(),
  setor_estadio: z.string().optional()
}).refine((data) => {
  // Se ambas as datas estão presentes e não são vazias, data_inicio deve ser <= data_fim
  if (data.data_inicio && data.data_fim && data.data_inicio !== '' && data.data_fim !== '') {
    return new Date(data.data_inicio) <= new Date(data.data_fim);
  }
  return true;
}, {
  message: "Data inicial deve ser anterior ou igual à data final",
  path: ["data_fim"]
});

// Schema para ordenação
export const ordenacaoIngressosSchema = z.object({
  campo: z.enum([
    'jogo_data',
    'adversario', 
    'cliente_nome',
    'valor_final',
    'lucro',
    'situacao_financeira',
    'created_at'
  ]),
  direcao: z.enum(['asc', 'desc'])
});

// Schema para setor do Maracanã
export const setorMaracanaSchema = z.object({
  nome: z.string()
    .min(2, "Nome do setor deve ter pelo menos 2 caracteres")
    .max(100, "Nome do setor muito longo")
    .trim(),
  descricao: z.string()
    .max(200, "Descrição muito longa")
    .optional()
    .nullable(),
  ativo: z.boolean().default(true)
});

// Tipos inferidos dos schemas
export type IngressoFormData = z.infer<typeof ingressoSchema>;
export type EditarIngressoFormData = z.infer<typeof editarIngressoSchema>;
export type PagamentoIngressoFormData = z.infer<typeof pagamentoIngressoSchema>;
export type EditarPagamentoIngressoFormData = z.infer<typeof editarPagamentoIngressoSchema>;
export type FiltrosIngressosFormData = z.infer<typeof filtrosIngressosSchema>;
export type OrdenacaoIngressosFormData = z.infer<typeof ordenacaoIngressosSchema>;
export type SetorMaracanaFormData = z.infer<typeof setorMaracanaSchema>;

// Validações customizadas
export const validarValorFinal = (precoVenda: number, desconto: number): boolean => {
  return (precoVenda - desconto) >= 0;
};

export const validarLucro = (precoVenda: number, desconto: number, precoCusto: number): boolean => {
  const valorFinal = precoVenda - desconto;
  return valorFinal >= precoCusto; // Permite lucro zero ou negativo, mas alerta
};

export const validarMargemMinima = (precoVenda: number, desconto: number, precoCusto: number, margemMinima: number = 0): boolean => {
  const valorFinal = precoVenda - desconto;
  if (valorFinal <= 0) return false;
  
  const lucro = valorFinal - precoCusto;
  const margem = (lucro / valorFinal) * 100;
  
  return margem >= margemMinima;
};

// Mensagens de erro personalizadas
export const mensagensErro = {
  cliente_obrigatorio: "Selecione um cliente",
  data_invalida: "Data do jogo inválida",
  adversario_obrigatorio: "Nome do adversário é obrigatório",
  setor_obrigatorio: "Setor do estádio é obrigatório",
  preco_custo_invalido: "Preço de custo deve ser um valor válido",
  preco_venda_invalido: "Preço de venda deve ser um valor válido",
  desconto_maior_que_venda: "Desconto não pode ser maior que o preço de venda",
  valor_pagamento_invalido: "Valor do pagamento deve ser maior que zero",
  data_pagamento_futura: "Data de pagamento não pode ser no futuro",
  forma_pagamento_obrigatoria: "Selecione uma forma de pagamento"
} as const;