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
  // Dados pessoais - APENAS NOME OBRIGATÓRIO
  nome: z.string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome muito longo")
    .refine(val => {
      const words = val.trim().split(/\s+/);
      return words.length >= 2;
    }, "Digite nome e sobrenome")
    .transform(val => val.trim()),
  
  cpf: z.string()
    .optional()
    .transform(val => val?.trim() || ""),
  
  data_nascimento: z.string()
    .optional()
    .transform(val => val?.trim() || ""),
  
  telefone: z.string()
    .transform(val => val?.replace(/\D/g, '') || "") // remove tudo que não for número
    .optional(),
  
  email: z.string()
    .email("Email inválido")
    .optional()
    .or(z.literal(""))
    .transform(val => val?.toLowerCase().trim() || ""),

  // Endereço - TODOS OPCIONAIS
  cep: z.string()
    .max(9, "CEP inválido")
    .optional()
    .transform(val => val?.trim() || ""),
  
  endereco: z.string()
    .max(200, "Endereço muito longo")
    .optional()
    .transform(val => val?.trim() || ""),
  
  numero: z.string()
    .max(10, "Número muito longo")
    .optional()
    .transform(val => val?.trim() || ""),
  
  complemento: z.string()
    .max(50, "Complemento muito longo")
    .optional()
    .transform(val => val?.trim() || null),
  
  bairro: z.string()
    .max(100, "Bairro muito longo")
    .optional()
    .transform(val => val?.trim() || ""),
  
  cidade: z.string()
    .max(100, "Cidade muito longa")
    .optional()
    .transform(val => val?.trim() || ""),
  
  estado: z.string()
    .max(2, "Estado deve ter no máximo 2 caracteres")
    .optional()
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
