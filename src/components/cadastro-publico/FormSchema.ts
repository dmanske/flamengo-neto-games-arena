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
  // Dados pessoais - TODOS OBRIGATÓRIOS
  nome: z.string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome muito longo")
    .refine(val => {
      const words = val.trim().split(/\s+/);
      return words.length >= 2;
    }, "Digite nome e sobrenome completo")
    .transform(val => val.trim()),
  
  cpf: z.string()
    .min(1, "CPF é obrigatório")
    .transform(val => val?.replace(/\D/g, '') || "")
    .refine(val => val.length === 11, "CPF deve ter 11 dígitos")
    .refine(val => isValidCPF(val), "CPF inválido"),
  
  data_nascimento: z.string()
    .min(1, "Data de nascimento é obrigatória")
    .refine(val => /^\d{2}\/\d{2}\/\d{4}$/.test(val), "Data deve estar no formato DD/MM/AAAA"),
  
  telefone: z.string()
    .min(1, "Telefone é obrigatório")
    .transform(val => val?.replace(/\D/g, '') || "")
    .refine(val => val.length >= 10, "Telefone deve ter pelo menos 10 dígitos"),
  
  email: z.string()
    .min(1, "Email é obrigatório")
    .email("Email inválido")
    .transform(val => val?.toLowerCase().trim() || ""),

  // Endereço - TODOS OBRIGATÓRIOS
  cep: z.string()
    .min(1, "CEP é obrigatório")
    .transform(val => val?.replace(/\D/g, '') || "")
    .refine(val => val.length === 8, "CEP deve ter 8 dígitos"),
  
  endereco: z.string()
    .min(1, "Endereço é obrigatório")
    .max(200, "Endereço muito longo")
    .transform(val => val?.trim() || ""),
  
  numero: z.string()
    .min(1, "Número é obrigatório")
    .max(10, "Número muito longo")
    .transform(val => val?.trim() || ""),
  
  complemento: z.string()
    .max(100, "Complemento muito longo")
    .optional()
    .transform(val => val?.trim() || null),
  
  bairro: z.string()
    .min(1, "Bairro é obrigatório")
    .max(100, "Bairro muito longo")
    .transform(val => val?.trim() || ""),
  
  cidade: z.string()
    .min(1, "Cidade é obrigatória")
    .max(100, "Cidade muito longa")
    .transform(val => val?.trim() || ""),
  
  estado: z.string()
    .min(1, "Estado é obrigatório")
    .max(2, "Estado deve ter no máximo 2 caracteres")
    .transform(val => val?.toUpperCase().trim() || ""),

  // Como conheceu - OPCIONAL
  como_conheceu: z.string()
    .optional()
    .transform(val => val?.trim() || ""),

  // Campos opcionais
  indicacao_nome: z.string()
    .max(100, "Nome de indicação muito longo")
    .optional()
    .transform(val => val?.trim() || null),
  
  observacoes: z.string()
    .max(1000, "Observações muito longas")
    .optional()
    .transform(val => val?.trim() || null),

  // Campo para foto (opcional)
  foto: z.string()
    .optional()
    .transform(val => val || null)
    .refine(val => !val || val.length === 0 || /^https?:\/\//.test(val), "URL da foto inválida"),

  // Campo para identificar fonte do cadastro
  fonte_cadastro: z.string()
    .default("publico")
    .transform(() => "publico"),
});

export type PublicRegistrationFormData = z.infer<typeof publicRegistrationSchema>;
