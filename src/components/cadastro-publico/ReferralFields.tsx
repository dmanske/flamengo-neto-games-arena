
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PublicRegistrationFormData } from "./FormSchema";

interface ReferralFieldsProps {
  form: UseFormReturn<PublicRegistrationFormData>;
}

export const ReferralFields = ({ form }: ReferralFieldsProps) => {
  const comoConheceuOptions = [
    { value: "amigo", label: "Indicação de amigo" },
    { value: "redes_sociais", label: "Redes sociais" },
    { value: "google", label: "Google" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "site", label: "Site" },
    { value: "outros", label: "Outros" }
  ];

  const showIndicacaoField = form.watch("como_conheceu") === "amigo";

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="como_conheceu"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Como conheceu o Neto Tours? *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione como nos conheceu" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {comoConheceuOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {showIndicacaoField && (
        <FormField
          control={form.control}
          name="indicacao_nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome de quem indicou</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nome da pessoa que indicou" 
                  {...field} 
                  maxLength={100}
                />
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
            <FormLabel>Observações (Opcional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Alguma observação adicional..." 
                {...field} 
                maxLength={500}
                rows={3}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
