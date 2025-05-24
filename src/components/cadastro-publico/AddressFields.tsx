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
            <FormLabel>CEP*</FormLabel>
            <div className="relative">
              <FormControl>
                <Input 
                  placeholder="00000-000" 
                  {...field} 
                  onChange={(e) => {
                    const formattedCEP = formatCEP(e.target.value);
                    field.onChange(formattedCEP);
                  }}
                  onBlur={() => onCepBlur(field.value)}
                />
              </FormControl>
              {loadingCep && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <FormField
          control={control}
          name="endereco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço*</FormLabel>
              <FormControl>
                <Input placeholder="Rua, Avenida, etc." {...field} />
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
              <FormLabel>Número*</FormLabel>
              <FormControl>
                <Input placeholder="123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <FormField
          control={control}
          name="cidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cidade*</FormLabel>
              <FormControl>
                <Input placeholder="Cidade" {...field} />
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
              <FormLabel>Bairro*</FormLabel>
              <FormControl>
                <Input placeholder="Bairro" {...field} />
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
            <FormLabel>Complemento</FormLabel>
            <FormControl>
              <Input placeholder="Apto, bloco, etc." {...field} />
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
            <FormLabel>Estado*</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {estadosBrasileiros.map((estado) => (
                  <SelectItem key={estado} value={estado}>
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
