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
  data_nascimento: z.string()
    .min(1, "Data de nascimento obrigatória")
    .refine((date) => {
      if (!date || date.trim() === '') return false;
      
      // Aceita formatos DD/MM/AAAA ou DD/MM/AA (converte anos de 2 dígitos)
      const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;
      const match = date.match(dateRegex);
      
      if (!match) return false;
      
      const day = parseInt(match[1]);
      const month = parseInt(match[2]);
      let year = parseInt(match[3]);
      
      // Converter anos de 2 dígitos para 4 dígitos
      if (year < 100) {
        // Se o ano for menor que 30, assume 20xx, senão 19xx
        year = year < 30 ? 2000 + year : 1900 + year;
      }
      
      // Validações básicas
      if (day < 1 || day > 31) return false;
      if (month < 1 || month > 12) return false;
      if (year < 1900 || year > new Date().getFullYear()) return false;
      
      // Verifica se a data é válida
      const dateObj = new Date(year, month - 1, day);
      return dateObj.getDate() === day && 
             dateObj.getMonth() === month - 1 && 
             dateObj.getFullYear() === year;
    }, "Data de nascimento inválida. Use o formato DD/MM/AAAA"),
  foto: z.string().nullable().optional(),
  cep: z.string().min(8, "CEP obrigatório"),
  endereco: z.string().min(3, "Endereço obrigatório"),
  numero: z.string().min(1, "Número obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(2, "Bairro obrigatório"),
  cidade: z.string().min(2, "Cidade obrigatória"),
  estado: z.string().length(2, "Estado obrigatório"),
  cpf: z.string()
    .min(1, "CPF obrigatório")
    .refine((cpf) => {
      return isValidCPF(cpf);
    }, "CPF inválido"),
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
