
import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SetorSelectFieldProps {
  control: any;
}

export function SetorSelectField({ control }: SetorSelectFieldProps) {
  return (
    <FormField
      control={control}
      name="setor_maracana"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-gray-700">Setor do Maracanã</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Selecione um setor" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="A definir">A definir</SelectItem>
              <SelectItem value="Norte">Norte</SelectItem>
              <SelectItem value="Sul">Sul</SelectItem>
              <SelectItem value="Leste Inferior">Leste Inferior</SelectItem>
              <SelectItem value="Leste Superior">Leste Superior</SelectItem>
              <SelectItem value="Oeste">Oeste</SelectItem>
              <SelectItem value="Maracanã Mais">Maracanã Mais</SelectItem>
              <SelectItem value="Sem ingresso">Sem ingresso</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
