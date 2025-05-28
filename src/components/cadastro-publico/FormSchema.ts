
import { z } from "zod";

// Função para validar CPF
const isValidCPF = (cpf: string) => {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;
  
  return digit1 === parseInt(cleanCPF.charAt(9)) && digit2 === parseInt(cleanCPF.charAt(10));
};

// Função para validar se é maior de idade
const isAdult = (birthDate: string) => {
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= 18;
  }
  return age >= 18;
};

export const publicRegistrationSchema = z.object({
  // Dados pessoais - OBRIGATÓRIOS conforme banco
  nome: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo")
    .transform(val => val.trim()),
  
  cpf: z.string()
    .min(1, "CPF é obrigatório")
    .refine(isValidCPF, "CPF inválido"),
  
  data_nascimento: z.string()
    .min(1, "Data de nascimento é obrigatória")
    .refine(isAdult, "Deve ser maior de idade (18 anos)"),
  
  telefone: z.string()
    .min(10, "Telefone deve ter pelo menos 10 dígitos")
    .max(15, "Telefone muito longo"),
  
  email: z.string()
    .min(1, "Email é obrigatório")
    .email("Email inválido")
    .transform(val => val.toLowerCase().trim()),

  // Endereço - OBRIGATÓRIOS conforme banco
  cep: z.string()
    .min(8, "CEP deve ter 8 dígitos")
    .max(9, "CEP inválido"),
  
  endereco: z.string()
    .min(1, "Endereço é obrigatório")
    .max(200, "Endereço muito longo")
    .transform(val => val.trim()),
  
  numero: z.string()
    .min(1, "Número é obrigatório")
    .max(10, "Número muito longo")
    .transform(val => val.trim()),
  
  complemento: z.string()
    .max(50, "Complemento muito longo")
    .optional()
    .transform(val => val?.trim() || null),
  
  bairro: z.string()
    .min(1, "Bairro é obrigatório")
    .max(100, "Bairro muito longo")
    .transform(val => val.trim()),
  
  cidade: z.string()
    .min(1, "Cidade é obrigatória")
    .max(100, "Cidade muito longa")
    .transform(val => val.trim()),
  
  estado: z.string()
    .min(2, "Estado é obrigatório")
    .max(2, "Estado deve ter 2 caracteres")
    .transform(val => val.toUpperCase().trim()),

  // Como conheceu - OBRIGATÓRIO conforme banco
  como_conheceu: z.string()
    .min(1, "Selecione como conheceu o Neto Tours"),

  // Campos opcionais
  indicacao_nome: z.string()
    .max(100, "Nome de indicação muito longo")
    .optional()
    .transform(val => val?.trim() || null),
  
  observacoes: z.string()
    .max(500, "Observações muito longas")
    .optional()
    .transform(val => val?.trim() || null),

  // Campo para foto (opcional)
  foto: z.string()
    .url("URL da foto inválida")
    .optional()
    .or(z.literal(""))
    .transform(val => val || null),

  // Campo padrão para passeio cristo
  passeio_cristo: z.string()
    .default("sim")
    .transform(() => "sim"),

  // Campo para identificar fonte do cadastro
  fonte_cadastro: z.string()
    .default("publico")
    .transform(() => "publico"),
});

export type PublicRegistrationFormData = z.infer<typeof publicRegistrationSchema>;
