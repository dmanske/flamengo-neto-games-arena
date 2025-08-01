
import React, { useState } from "react";
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
import { formatCPF, formatDate, formatarNomeComPreposicoes } from "@/utils/formatters";

interface PersonalInfoFieldsProps {
  form: UseFormReturn<any>;
}

export const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({ form }) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <FormLabel>Data de Nascimento *</FormLabel>
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
                      selected={field.value ? (() => {
                        try {
                          return parse(field.value, 'dd/MM/yyyy', new Date());
                        } catch {
                          return undefined;
                        }
                      })() : undefined}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(format(date, 'dd/MM/yyyy', { locale: ptBR }));
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
      </div>

      <FormField
        control={form.control}
        name="foto"
        render={({ field }) => {
          console.log("Valor da foto:", field.value);
          return (
            <FormItem>
              <FormLabel>Foto do Cliente (opcional)</FormLabel>
              <FormControl>
                <FileUpload
                  value={field.value}
                  onChange={field.onChange}
                  bucketName="client-photos"
                  folderPath="clientes"
                  maxSizeInMB={5}
                  showPreview={true}
                  previewClassName="w-32 h-32 object-cover rounded-lg shadow-md"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
};
