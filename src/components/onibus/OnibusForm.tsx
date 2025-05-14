
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage, 
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";

export const onibusFormSchema = z.object({
  tipo_onibus: z.string().min(1, "Tipo de ônibus é obrigatório"),
  empresa: z.string().min(1, "Empresa é obrigatória"),
  numero_identificacao: z.string().optional().or(z.literal("")),
  capacidade: z.number().int().min(1, "Capacidade deve ser pelo menos 1").or(
    z.string().regex(/^\d+$/).transform(Number)
  ),
  description: z.string().optional().or(z.literal("")),
  year: z.number().int().min(1980).max(new Date().getFullYear() + 1).optional()
    .or(z.string().regex(/^\d+$/).transform(Number))
    .or(z.literal("").transform(() => null))
});

export type OnibusFormValues = z.infer<typeof onibusFormSchema>;

interface OnibusFormProps {
  defaultValues: OnibusFormValues;
  onSubmit: (data: OnibusFormValues) => void;
  isLoading: boolean;
  imagePath: string | null;
  setImagePath: (path: string | null) => void;
  children: React.ReactNode;
}

export function OnibusForm({
  defaultValues,
  onSubmit,
  isLoading,
  imagePath,
  setImagePath,
  children
}: OnibusFormProps) {
  const form = useForm<OnibusFormValues>({
    resolver: zodResolver(onibusFormSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="tipo_onibus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Ônibus</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de ônibus" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="46 Semi-Leito">46 Semi-Leito</SelectItem>
                  <SelectItem value="50 Convencional">50 Convencional</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="empresa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Viação 1001">Viação 1001</SelectItem>
                  <SelectItem value="Kaissara">Kaissara</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="numero_identificacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Identificação</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Número de identificação do ônibus" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="capacidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacidade</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Capacidade do ônibus"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ano do Ônibus</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Ano do ônibus"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? "" : parseInt(value));
                  }}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Ano de fabricação do veículo
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Informações adicionais sobre o ônibus" 
                  {...field} 
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Imagem do Ônibus</FormLabel>
          <FileUpload 
            value={imagePath}
            onChange={setImagePath}
            bucketName="bus-images"
            folderPath="buses"
            allowedFileTypes={["image/jpeg", "image/png", "image/jpg"]}
            maxSizeInMB={5}
          />
        </div>

        <div className="flex justify-end space-x-2">
          {children}
        </div>
      </form>
    </Form>
  );
}
