
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface ReferralFieldsProps {
  form: UseFormReturn<any>;
}

export const ReferralFields: React.FC<ReferralFieldsProps> = ({ form }) => {
  const watchComoConheceu = form.watch("como_conheceu");

  const opcoesComoConheceu = [
    { value: "instagram", label: "Instagram" },
    { value: "facebook", label: "Facebook" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "google", label: "Google / Pesquisa na Internet" },
    { value: "site_neto_turs", label: "Site da Neto Tours Viagens" },
    { value: "indicacao_amigo", label: "Indicação de Amigo/Familiar" },
    { value: "indicacao_cliente", label: "Indicação de Cliente Antigo" },
    { value: "ja_era_cliente", label: "Já era Cliente" },
    { value: "outro", label: "Outro" }
  ];

  return (
    <>
      <FormField
        control={form.control}
        name="como_conheceu"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Como conheceu a Neto Tours Viagens?</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione como conheceu a Neto Tours Viagens" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-60 overflow-y-auto">
                {opcoesComoConheceu.map((opcao) => (
                  <SelectItem key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {(watchComoConheceu === "indicacao_amigo" || watchComoConheceu === "indicacao_cliente") && (
        <FormField
          control={form.control}
          name="indicacao_nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome de quem indicou</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome de quem indicou" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {watchComoConheceu === "outro" && (
        <FormField
          control={form.control}
          name="indicacao_nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especifique como conheceu</FormLabel>
              <FormControl>
                <Input placeholder="Descreva como conheceu a Neto Tours Viagens" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="observacoes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Informações adicionais sobre o cliente"
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
