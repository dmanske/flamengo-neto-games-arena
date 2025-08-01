
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
import { getSetorLabel, getSetorOptions } from "@/data/estadios";

interface SetorSelectFieldProps {
  control: any;
  viagem?: {
    local_jogo?: string;
    nome_estadio?: string;
  };
}

export function SetorSelectField({ control, viagem }: SetorSelectFieldProps) {
  return (
    <FormField
      control={control}
      name="setor_maracana"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-gray-700">
            {getSetorLabel(viagem?.local_jogo || "Rio de Janeiro", viagem?.nome_estadio)}
          </FormLabel>
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
              {getSetorOptions(viagem?.local_jogo || "Rio de Janeiro").map((setor) => (
                <SelectItem key={setor} value={setor}>
                  {setor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
