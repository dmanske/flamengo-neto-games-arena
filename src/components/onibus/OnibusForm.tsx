
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
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Wifi, Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export const onibusFormSchema = z.object({
  tipo_onibus: z.string().min(1, "Tipo de ônibus é obrigatório"),
  empresa: z.string().min(1, "Empresa é obrigatória"),
  numero_identificacao: z.string().optional().or(z.literal("")),
  capacidade: z.number().int().min(1, "Capacidade deve ser pelo menos 1").or(
    z.string().regex(/^\d+$/).transform(Number)
  ),
  description: z.string().optional().or(z.literal("")),
  wifi_ssid: z.string().optional().or(z.literal("")),
  wifi_password: z.string().optional().or(z.literal(""))
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
              <FormControl>
                <Input placeholder="Ex: Semi-Leito, Convencional" {...field} />
              </FormControl>
              <FormDescription>
                Digite o tipo ou modelo do ônibus
              </FormDescription>
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
              <FormControl>
                <Input placeholder="Ex: Viação 1001, Kaissara" {...field} />
              </FormControl>
              <FormDescription>
                Digite o nome da empresa locadora
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="numero_identificacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Identificação (Opcional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Número de identificação do ônibus (opcional)" 
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

        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Wifi className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Configurações de WiFi</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="wifi_ssid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Rede (SSID)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da rede WiFi" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nome da rede WiFi disponível no ônibus
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="wifi_password"
              render={({ field }) => {
                const [showPassword, setShowPassword] = React.useState(false);
                
                return (
                  <FormItem>
                    <FormLabel>Senha do WiFi</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Senha da rede WiFi" 
                            {...field} 
                          />
                          {field.value && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                        {field.value && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              navigator.clipboard.writeText(field.value);
                              toast.success("Senha copiada!");
                            }}
                            title="Copiar senha"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                  </FormControl>
                  <FormDescription>
                    Senha para conectar na rede WiFi
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <FormLabel>Imagem do Ônibus</FormLabel>
          <FileUpload 
            value={imagePath}
            onChange={setImagePath}
            bucketName="bus-images"
            folderPath="buses"
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
