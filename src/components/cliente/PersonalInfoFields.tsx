
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { FileUpload } from "@/components/ui/file-upload";
import { formatCPF } from "@/utils/cepUtils";
import { formatDate } from "@/utils/formatters";

interface PersonalInfoFieldsProps {
  form: UseFormReturn<any>;
  calendarOpen: boolean;
  setCalendarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({
  form,
  calendarOpen,
  setCalendarOpen,
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome*</FormLabel>
            <FormControl>
              <Input placeholder="Nome completo" {...field} />
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
            <FormLabel>Email*</FormLabel>
            <FormControl>
              <Input placeholder="email@exemplo.com" {...field} />
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
            <FormLabel>CPF*</FormLabel>
            <FormControl>
              <Input 
                placeholder="000.000.000-00" 
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
        control={form.control}
        name="data_nascimento"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Data de Nascimento*</FormLabel>
            <div className="flex">
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

      <FormField
        control={form.control}
        name="foto"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Foto (opcional)</FormLabel>
            <FormControl>
              <FileUpload
                value={field.value}
                onChange={field.onChange}
                bucketName="client-photos"
                folderPath="clientes"
                maxSizeInMB={5}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
