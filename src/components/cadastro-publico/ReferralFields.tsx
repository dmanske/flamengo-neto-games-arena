import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

interface ReferralFieldsProps {
  control: Control<any>;
  watchComoConheceu: string;
}

export function ReferralFields({ control, watchComoConheceu }: ReferralFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="como_conheceu"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Como conheceu a Neto Tours Viagens?*</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Instagram" id="instagram" />
                  <FormLabel htmlFor="instagram" className="font-normal cursor-pointer text-sm md:text-base">Instagram</FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Facebook" id="facebook" />
                  <FormLabel htmlFor="facebook" className="font-normal cursor-pointer text-sm md:text-base">Facebook</FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Google" id="google" />
                  <FormLabel htmlFor="google" className="font-normal cursor-pointer text-sm md:text-base">Google</FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="WhatsApp" id="whatsapp" />
                  <FormLabel htmlFor="whatsapp" className="font-normal cursor-pointer text-sm md:text-base">WhatsApp</FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Indicação" id="indicacao" />
                  <FormLabel htmlFor="indicacao" className="font-normal cursor-pointer text-sm md:text-base">Indicação</FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Outro" id="outro" />
                  <FormLabel htmlFor="outro" className="font-normal cursor-pointer text-sm md:text-base">Outro</FormLabel>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {watchComoConheceu === "Indicação" && (
        <FormField
          control={control}
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

      <FormField
        control={control}
        name="observacoes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Informações adicionais" 
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
