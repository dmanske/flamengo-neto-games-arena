import { z } from "zod";

export const formSchema = z.object({
  setor_maracana: z.string().min(1, "Selecione um setor"),
  status_pagamento: z.string().min(1, "Selecione um status de pagamento"),
  forma_pagamento: z.string().min(1, "Selecione uma forma de pagamento"),
  valor: z.number().min(0, "O valor deve ser maior ou igual a zero"),
  desconto: z.number().min(0, "O desconto deve ser maior ou igual a zero"),
  onibus_id: z.string().min(1, "Selecione um ônibus"),
  cidade_embarque: z.string().min(1, "Selecione uma cidade de embarque"),
  observacoes: z.string().optional(),
  passeios: z.array(z.object({
    nome: z.string(),
    status: z.string()
  })).optional()
});

export type FormData = z.infer<typeof formSchema>;
