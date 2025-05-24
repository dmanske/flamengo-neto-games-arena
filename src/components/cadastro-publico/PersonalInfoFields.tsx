import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Control } from "react-hook-form";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { ptBR } from "date-fns/locale";
import { formatTelefone, formatCPF } from "@/utils/cepUtils";
import { FileUpload } from "@/components/ui/file-upload";

interface PersonalInfoFieldsProps {
  control: Control<any>;
  calendarOpen: boolean;
  setCalendarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function PersonalInfoFields({ control, calendarOpen, setCalendarOpen }: PersonalInfoFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">Nome Completo<span className="text-red-600">*</span></FormLabel>
            <FormControl>
              <Input 
                placeholder="Digite seu nome completo" 
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
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">E-mail<span className="text-red-600">*</span></FormLabel>
            <FormControl>
              <Input 
                placeholder="email@exemplo.com" 
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
        name="telefone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">Telefone (WhatsApp)<span className="text-red-600">*</span></FormLabel>
            <FormControl>
              <Input 
                placeholder="(00) 0 0000-0000" 
                className="h-12 px-4 rounded-xl border-2 focus:border-red-500 focus:ring-red-500"
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

      <FormField
        control={control}
        name="cpf"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">CPF<span className="text-red-600">*</span></FormLabel>
            <FormControl>
              <Input 
                placeholder="000.000.000-00" 
                className="h-12 px-4 rounded-xl border-2 focus:border-red-500 focus:ring-red-500"
                {...field} 
                onChange={(e) => {
                  field.onChange(formatCPF(e.target.value));
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="data_nascimento"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="text-sm font-medium text-gray-700">Data de Nascimento<span className="text-red-600">*</span></FormLabel>
            <div className="flex">
              <FormControl>
                <Input
                  placeholder="DD/MM/AAAA"
                  className="h-12 px-4 rounded-xl border-2 focus:border-red-500 focus:ring-red-500"
                  {...field}
                />
              </FormControl>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="ml-2 h-12 w-12 rounded-xl border-2 hover:border-red-500 hover:bg-red-50"
                    type="button"
                  >
                    <CalendarIcon className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-xl shadow-lg" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? parse(field.value, 'dd/MM/yyyy', new Date()) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        field.onChange(format(date, 'dd/MM/yyyy'));
                        setCalendarOpen(false);
                      }
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    locale={ptBR}
                    initialFocus
                    className={cn("p-3 rounded-xl")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
