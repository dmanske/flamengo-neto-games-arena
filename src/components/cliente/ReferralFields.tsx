
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface ReferralFieldsProps {
  form: UseFormReturn<any>;
}

export const ReferralFields: React.FC<ReferralFieldsProps> = ({ form }) => {
  const watchComoConheceu = form.watch("como_conheceu");

  return (
    <>
      <FormField
        control={form.control}
        name="observacoes"
        render={({ field }) => (
          <FormItem className="mb-2">
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Informações adicionais" 
                className="min-h-[80px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="como_conheceu"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Como conheceu a Neto Tours?*</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Instagram" id="instagram" />
                  <FormLabel htmlFor="instagram" className="font-normal cursor-pointer">Instagram</FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Facebook" id="facebook" />
                  <FormLabel htmlFor="facebook" className="font-normal cursor-pointer">Facebook</FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Google" id="google" />
                  <FormLabel htmlFor="google" className="font-normal cursor-pointer">Google</FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Indicação" id="indicacao" />
                  <FormLabel htmlFor="indicacao" className="font-normal cursor-pointer">Indicação</FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Outro" id="outro" />
                  <FormLabel htmlFor="outro" className="font-normal cursor-pointer">Outro</FormLabel>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {watchComoConheceu === "Indicação" && (
        <FormField
          control={form.control}
          name="indicacao_nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quem indicou?*</FormLabel>
              <FormControl>
                <Input placeholder="Nome de quem indicou" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};
