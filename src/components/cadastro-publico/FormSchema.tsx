import { z } from "zod";

// Função para validar CPF
function isValidCPF(cpf: string) {
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let rest = 11 - (sum % 11);
  let digit1 = rest > 9 ? 0 : rest;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  rest = 11 - (sum % 11);
  let digit2 = rest > 9 ? 0 : rest;
  
  return digit1 === parseInt(cpf.charAt(9)) && digit2 === parseInt(cpf.charAt(10));
}

// Schema centralizado para cadastro de clientes (público e administrativo)
// Utilize este schema para garantir validação padronizada em todo o sistema
// Mensagens de erro revisadas para clareza
export const formSchema = z.object({
  nome: z.string()
    .min(5, "Informe o nome completo")
    .refine((nome) => {
      const partes = nome.trim().split(" ");
      return partes.length >= 2 && partes.every(p => p.length >= 2);
    }, { message: "Informe nome e sobrenome" }),
  telefone: z.string().min(8, "Telefone obrigatório"),
  email: z.string().email("E-mail obrigatório"),
  data_nascimento: z.string().optional(),
  foto: z.string().nullable().optional(),
  cep: z.string().min(8, "CEP inválido").optional(),
  endereco: z.string().min(3, "Endereço inválido").optional(),
  numero: z.string().min(1, "Número inválido").optional(),
  complemento: z.string().optional(),
  bairro: z.string().min(2, "Bairro inválido").optional(),
  cidade: z.string().min(2, "Cidade inválida").optional(),
  estado: z.string().length(2, "Estado inválido").optional(),
  cpf: z.string()
    .refine((cpf) => {
      if (!cpf) return true; // Permite vazio
      return isValidCPF(cpf);
    }, "CPF inválido")
    .optional(),
  como_conheceu: z.string().optional(),
  indicacao_nome: z.string().optional(),
  observacoes: z.string().optional(),
  fonte_cadastro: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

// Lista de estados brasileiros para o dropdown
export const estadosBrasileiros = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];
