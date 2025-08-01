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
import { formatCPF, formatPhone, formatDate, formatarNomeComPreposicoes } from "@/utils/formatters";

interface PersonalInfoFieldsProps {
  form: UseFormReturn<PublicRegistrationFormData>;
}

export const PersonalInfoFields = ({ form }: PersonalInfoFieldsProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Completo *</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ex: João da Silva Santos" 
                {...field}
                onChange={(e) => {
                  const formatted = formatarNomeComPreposicoes(e.target.value);
                  field.onChange(formatted);
                }}
                maxLength={100}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    const formatted = formatCPF(e.target.value);
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
              <FormLabel>Data de Nascimento *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="DD/MM/AAAA"
                  {...field}
                  onChange={(e) => {
                    const formatted = formatDate(e.target.value);
                    field.onChange(formatted);
                  }}
                  maxLength={10}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail *</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="exemplo@email.com" 
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value.toLowerCase());
                  }}
                  maxLength={100}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="foto"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Foto do Cliente (opcional)</FormLabel>
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
