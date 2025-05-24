import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Control } from "react-hook-form";
import { formatCEP } from "@/utils/cepUtils";

interface AddressFieldsProps {
  control: Control<any>;
  loadingCep: boolean;
  onCepBlur: (cep: string) => void;
  estadosBrasileiros: string[];
}

export function AddressFields({ control, loadingCep, onCepBlur, estadosBrasileiros }: AddressFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="cep"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">CEP<span className="text-red-600">*</span></FormLabel>
            <div className="relative">
              <FormControl>
                <Input 
                  placeholder="00000-000" 
                  className="h-12 px-4 rounded-xl border-2 focus:border-red-500 focus:ring-red-500"
                  {...field} 
                  onChange={(e) => {
                    const formattedCEP = formatCEP(e.target.value);
                    field.onChange(formattedCEP);
                  }}
                  onBlur={() => onCepBlur(field.value)}
                />
              </FormControl>
              {loadingCep && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="endereco"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Endereço<span className="text-red-600">*</span></FormLabel>
              <FormControl>
                <Input 
                  placeholder="Rua, Avenida, etc." 
                  className="h-12 px-4 rounded-xl border-2 focus:border-red-500 focus:ring-red-500"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="numero"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Número<span className="text-red-600">*</span></FormLabel>
              <FormControl>
                <Input 
                  placeholder="123" 
                  className="h-12 px-4 rounded-xl border-2 focus:border-red-500 focus:ring-red-500"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="cidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Cidade<span className="text-red-600">*</span></FormLabel>
              <FormControl>
                <Input 
                  placeholder="Cidade" 
                  className="h-12 px-4 rounded-xl border-2 focus:border-red-500 focus:ring-red-500"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="bairro"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Bairro<span className="text-red-600">*</span></FormLabel>
              <FormControl>
                <Input 
                  placeholder="Bairro" 
                  className="h-12 px-4 rounded-xl border-2 focus:border-red-500 focus:ring-red-500"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="complemento"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">Complemento</FormLabel>
            <FormControl>
              <Input 
                placeholder="Apto, bloco, etc." 
                className="h-12 px-4 rounded-xl border-2 focus:border-red-500 focus:ring-red-500"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="estado"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">Estado<span className="text-red-600">*</span></FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="h-12 px-4 rounded-xl border-2 focus:border-red-500 focus:ring-red-500">
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="rounded-xl">
                {estadosBrasileiros.map((estado) => (
                  <SelectItem key={estado} value={estado} className="cursor-pointer hover:bg-red-50">
                    {estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
