import { z } from "zod";

export const formSchema = z.object({
  cliente_id: z.array(z.string()).min(1, "Selecione pelo menos um cliente"),
  setor_maracana: z.string().min(1, "Selecione um setor"),
  onibus_id: z.string().min(1, "Selecione um ônibus"),
  valor: z.number().min(0, "O valor deve ser maior ou igual a zero"),
  desconto: z.number().min(0, "O desconto deve ser maior ou igual a zero"),
  status_pagamento: z.string().min(1, "Selecione um status de pagamento"),
  forma_pagamento: z.string().min(1, "Selecione uma forma de pagamento"),
  cidade_embarque: z.string().min(1, "Selecione uma cidade de embarque"),
  passeios_selecionados: z.array(z.string()).default([]),
  gratuito: z.boolean().default(false),
  grupo_nome: z.string().nullable().optional(),
  grupo_cor: z.string().nullable().optional(),
});

export type FormData = z.infer<typeof formSchema>;
