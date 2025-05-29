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
import { fetchAddressByCEP } from "@/utils/cepUtils";
import { PublicRegistrationFormData } from "./FormSchema";

interface AddressFieldsProps {
  form: UseFormReturn<PublicRegistrationFormData>;
}

export const AddressFields = ({ form }: AddressFieldsProps) => {
  const handleCEPChange = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    
    if (cleanCEP.length === 8) {
      try {
        const endereco = await fetchAddressByCEP(cleanCEP);
        if (endereco) {
          form.setValue('endereco', endereco.logradouro);
          form.setValue('bairro', endereco.bairro);
          form.setValue('cidade', endereco.localidade);
          form.setValue('estado', endereco.uf);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="cep"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CEP *</FormLabel>
            <FormControl>
              <Input 
                placeholder="00000-000" 
                {...field}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  const formatted = value.replace(/(\d{5})(\d{3})/, '$1-$2');
                  field.onChange(formatted);
                  handleCEPChange(formatted);
                }}
                maxLength={9}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="endereco"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Endereço *</FormLabel>
            <FormControl>
              <Input 
                placeholder="Rua, avenida..." 
                {...field} 
                maxLength={200}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="numero"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número *</FormLabel>
            <FormControl>
              <Input 
                placeholder="123" 
                {...field} 
                maxLength={10}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="complemento"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Complemento</FormLabel>
            <FormControl>
              <Input 
                placeholder="Apto, casa..." 
                {...field} 
                maxLength={50}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bairro"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bairro *</FormLabel>
            <FormControl>
              <Input 
                placeholder="Nome do bairro" 
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
        name="cidade"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cidade *</FormLabel>
            <FormControl>
              <Input 
                placeholder="Nome da cidade" 
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
        name="estado"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Estado *</FormLabel>
            <FormControl>
              <Input 
                placeholder="UF" 
                {...field}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  field.onChange(value);
                }}
                maxLength={2}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
