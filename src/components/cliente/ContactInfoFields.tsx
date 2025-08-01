
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { formatPhone } from "@/utils/formatters";

interface ContactInfoFieldsProps {
  form: UseFormReturn<any>;
}

export const ContactInfoFields: React.FC<ContactInfoFieldsProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="telefone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone/WhatsApp *</FormLabel>
            <FormControl>
              <Input 
                placeholder="(11) 99999-9999" 
                {...field} 
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  field.onChange(formatted);
                }}
                maxLength={15}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
