
import { z } from "zod";

export const formSchema = z.object({
  setor_maracana: z.string().min(1, "Selecione um setor"),
  status_pagamento: z.string().min(1, "Selecione um status"),
  forma_pagamento: z.string().optional(),
  valor: z.coerce.number().min(0, "Valor deve ser maior ou igual a zero"),
  desconto: z.coerce.number().min(0, "Desconto deve ser maior ou igual a zero"),
  onibus_id: z.string().min(1, "Selecione um ônibus"),
});

export type FormData = z.infer<typeof formSchema>;
