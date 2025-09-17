import { z } from 'zod';
import { TipoFornecedor } from '@/types/fornecedores';

// Schema para validação de fornecedor
export const fornecedorSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  
  tipo_fornecedor: z.enum(['ingressos', 'transporte', 'hospedagem', 'alimentacao', 'eventos'], {
    required_error: 'Tipo de fornecedor é obrigatório',
  }),
  
  email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  
  telefone: z
    .string()
    .regex(/^(\(\d{2}\)\s?)?\d{4,5}-?\d{4}$/, 'Formato de telefone inválido')
    .optional()
    .or(z.literal('')),
  
  whatsapp: z
    .string()
    .regex(/^(\(\d{2}\)\s?)?\d{4,5}-?\d{4}$/, 'Formato de WhatsApp inválido')
    .optional()
    .or(z.literal('')),
  
  endereco: z
    .string()
    .max(500, 'Endereço deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  
  cnpj: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'Formato de CNPJ inválido (XX.XXX.XXX/XXXX-XX)')
    .optional()
    .or(z.literal('')),
  
  contato_principal: z
    .string()
    .max(255, 'Nome do contato deve ter no máximo 255 caracteres')
    .optional()
    .or(z.literal('')),
  
  observacoes: z
    .string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional()
    .or(z.literal('')),
  
  mensagem_padrao: z
    .string()
    .max(2000, 'Mensagem padrão deve ter no máximo 2000 caracteres')
    .optional()
    .or(z.literal(''))
});

// Schema para validação de template de mensagem
export const messageTemplateSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  
  tipo_fornecedor: z.enum(['ingressos', 'transporte', 'hospedagem', 'alimentacao', 'eventos'], {
    required_error: 'Tipo de fornecedor é obrigatório',
  }),
  
  assunto: z
    .string()
    .min(1, 'Assunto é obrigatório')
    .max(255, 'Assunto deve ter no máximo 255 caracteres'),
  
  corpo_mensagem: z
    .string()
    .min(10, 'Corpo da mensagem deve ter pelo menos 10 caracteres')
    .max(5000, 'Corpo da mensagem deve ter no máximo 5000 caracteres')
});

// Tipos inferidos dos schemas
export type FornecedorFormValues = z.infer<typeof fornecedorSchema>;
export type MessageTemplateFormValues = z.infer<typeof messageTemplateSchema>;

// Função para validar CNPJ
export const validarCNPJ = (cnpj: string): boolean => {
  // Remove formatação
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  
  if (cleanCNPJ.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;
  
  // Validação dos dígitos verificadores
  let soma = 0;
  let peso = 2;
  
  // Primeiro dígito verificador
  for (let i = 11; i >= 0; i--) {
    soma += parseInt(cleanCNPJ[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  
  const resto1 = soma % 11;
  const dv1 = resto1 < 2 ? 0 : 11 - resto1;
  
  if (parseInt(cleanCNPJ[12]) !== dv1) return false;
  
  // Segundo dígito verificador
  soma = 0;
  peso = 2;
  
  for (let i = 12; i >= 0; i--) {
    soma += parseInt(cleanCNPJ[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  
  const resto2 = soma % 11;
  const dv2 = resto2 < 2 ? 0 : 11 - resto2;
  
  return parseInt(cleanCNPJ[13]) === dv2;
};

// Função para formatar CNPJ
export const formatarCNPJ = (cnpj: string): string => {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  
  if (cleanCNPJ.length <= 14) {
    return cleanCNPJ.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
  }
  
  return cnpj;
};