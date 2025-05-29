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
import { FileUpload } from "@/components/ui/file-upload";
import { PublicRegistrationFormData } from "./FormSchema";

interface PersonalInfoFieldsProps {
  form: UseFormReturn<PublicRegistrationFormData>;
}

export const PersonalInfoFields = ({ form }: PersonalInfoFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="nome"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Nome Completo *</FormLabel>
            <FormControl>
              <Input 
                placeholder="Digite seu nome completo" 
                {...field} 
                maxLength={100}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cpf"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CPF *</FormLabel>
            <FormControl>
              <Input 
                placeholder="000.000.000-00" 
                {...field}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  const formatted = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                  field.onChange(formatted);
                }}
                maxLength={14}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="data_nascimento"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data de Nascimento</FormLabel>
            <FormControl>
              <Input 
                type="text" 
                placeholder="DD/MM/AAAA"
                {...field}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  let formatted = value;
                  if (value.length >= 2) {
                    formatted = `${value.slice(0, 2)}/${value.slice(2)}`;
                  }
                  if (value.length >= 4) {
                    formatted = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4, 8)}`;
                  }
                  field.onChange(formatted);
                }}
                maxLength={10}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="telefone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone *</FormLabel>
            <FormControl>
              <Input 
                placeholder="(00) 00000-0000" 
                {...field}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  let formatted = value;
                  if (value.length > 2) {
                    formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                  }
                  if (value.length > 7) {
                    formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
                  }
                  field.onChange(formatted);
                }}
                maxLength={15}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email *</FormLabel>
            <FormControl>
              <Input 
                type="email" 
                placeholder="seu@email.com" 
                {...field} 
                maxLength={100}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="foto"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Foto (Opcional)</FormLabel>
            <FormControl>
              <FileUpload
                value={field.value}
                onChange={field.onChange}
                bucketName="client-photos"
                folderPath="uploads"
                maxSizeInMB={5}
                showPreview={true}
                previewClassName="w-32 h-32 object-cover rounded-lg"
                uploadText="Clique ou arraste para enviar sua foto (máx. 5MB)"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
