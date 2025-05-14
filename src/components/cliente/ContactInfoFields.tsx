
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { formatTelefone } from "@/utils/cepUtils";

interface ContactInfoFieldsProps {
  form: UseFormReturn<any>;
}

export const ContactInfoFields: React.FC<ContactInfoFieldsProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="telefone"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Telefone (WhatsApp)*</FormLabel>
          <FormControl>
            <Input 
              placeholder="(00) 0 0000-0000" 
              {...field} 
              onChange={(e) => {
                field.onChange(formatTelefone(e.target.value));
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
