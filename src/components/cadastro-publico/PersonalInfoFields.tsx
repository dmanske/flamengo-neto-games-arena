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
import { Label } from "@/components/ui/label";

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
            <FormLabel>Nome Completo*</FormLabel>
            <FormControl>
              <Input placeholder="Nome completo" {...field} />
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
            <FormLabel>Email*</FormLabel>
            <FormControl>
              <Input placeholder="email@exemplo.com" {...field} />
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

      <FormField
        control={control}
        name="cpf"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CPF*</FormLabel>
            <FormControl>
              <Input 
                placeholder="000.000.000-00" 
                {...field}
                onChange={(e) => {
                  const formatted = formatCPF(e.target.value);
                  field.onChange(formatted);
                }}
                maxLength={14}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
            <FormLabel>Data de Nascimento*</FormLabel>
            <div className="flex">
              <FormControl>
                <Input
                  placeholder="DD/MM/AAAA"
                  {...field}
                />
              </FormControl>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="ml-2 px-2"
                    type="button"
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
                    className={cn("p-3 pointer-events-auto")}
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
