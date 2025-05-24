import { z } from "zod";

export const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  cep: z.string().min(9, { message: "CEP é obrigatório e deve estar no formato 00000-000" }),
  endereco: z.string().min(5, { message: "Endereço é obrigatório" }),
  numero: z.string().min(1, { message: "Número é obrigatório" }),
  complemento: z.string().optional(),
  bairro: z.string().min(1, { message: "Bairro é obrigatório" }),
  telefone: z
    .string()
    .min(14, { message: "O telefone deve estar completo" })
    .regex(/^\(\d{2}\) \d \d{4}-\d{4}$/, { message: "Formato de telefone inválido" }),
  cidade: z.string().min(2, { message: "Cidade é obrigatória" }),
  estado: z.string().min(2, { message: "Estado é obrigatório" }),
  cpf: z
    .string()
    .min(14, { message: "CPF deve estar completo" })
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: "Formato de CPF inválido" }),
  data_nascimento: z.string().refine((val) => {
    try {
      const date = new Date(val.split('/').reverse().join('-'));
      return !isNaN(date.getTime());
    } catch {
      return false;
    }
  }, { message: "Data inválida. Use o formato DD/MM/AAAA" }),
  email: z.string().email({ message: "Email inválido" }),
  como_conheceu: z.enum(["Instagram", "Indicação", "Facebook", "Google", "Outro", "WhatsApp"], {
    message: "Por favor selecione como conheceu a FlaViagens"
  }),
  indicacao_nome: z.string().optional(),
  observacoes: z.string().optional(),
  fonte_cadastro: z.string().optional(),
  foto: z.string().nullable().optional(),
  passeio_cristo: z.enum(["sim", "nao"], {
    message: "Por favor selecione se deseja fazer o passeio no Cristo Redentor"
  }),
});

export type FormValues = z.infer<typeof formSchema>;

// Lista de estados brasileiros para o dropdown
export const estadosBrasileiros = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];
