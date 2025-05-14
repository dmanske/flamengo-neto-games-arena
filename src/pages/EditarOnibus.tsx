import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const onibusFormSchema = z.object({
  tipo_onibus: z.string().min(1, "Tipo de ônibus é obrigatório"),
  empresa: z.string().min(1, "Empresa é obrigatória"),
  image_url: z.string().url("URL de imagem inválida").optional().or(z.literal("")),
  numero_identificacao: z.string().optional().or(z.literal("")),
  capacidade: z.number().int().min(1, "Capacidade deve ser pelo menos 1").or(
    z.string().regex(/^\d+$/).transform(Number)
  ),
  description: z.string().optional().or(z.literal("")),
});

type OnibusFormValues = z.infer<typeof onibusFormSchema>;

const EditarOnibus = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<OnibusFormValues>({
    resolver: zodResolver(onibusFormSchema),
    defaultValues: {
      tipo_onibus: "",
      empresa: "",
      image_url: "",
      numero_identificacao: "",
      capacidade: 40,
      description: "",
    },
  });

  useEffect(() => {
    const fetchOnibus = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("onibus")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        
        if (data) {
          // Get related image if exists
          const { data: imageData } = await supabase
            .from("onibus_images")
            .select("image_url")
            .eq("onibus_id", id)
            .single();

          form.reset({
            tipo_onibus: data.tipo_onibus,
            empresa: data.empresa,
            numero_identificacao: data.numero_identificacao || "",
            capacidade: data.capacidade || 0,
            description: data.description || "",
            image_url: imageData?.image_url || data.image_path || "",
          });
        }
      } catch (error: any) {
        console.error("Erro ao buscar ônibus:", error);
        toast({
          description: `Erro ao carregar dados do ônibus: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOnibus();
  }, [id, form]);

  const onSubmit = async (data: OnibusFormValues) => {
    if (!id) return;
    
    try {
      setIsSaving(true);
      
      // Update main onibus record
      const { error: onibusError } = await supabase
        .from("onibus")
        .update({
          tipo_onibus: data.tipo_onibus,
          empresa: data.empresa,
          numero_identificacao: data.numero_identificacao || null,
          capacidade: data.capacidade || 0,
          description: data.description || null,
          image_path: data.image_url || null,
        })
        .eq("id", id);

      if (onibusError) throw onibusError;

      // Check if image record exists
      const { data: existingImage } = await supabase
        .from("onibus_images")
        .select("id")
        .eq("onibus_id", id)
        .single();

      if (existingImage) {
        // Update existing image
        const { error: imageError } = await supabase
          .from("onibus_images")
          .update({
            tipo_onibus: data.tipo_onibus,
            empresa: data.empresa,
            image_url: data.image_url || null
          })
          .eq("id", existingImage.id);

        if (imageError) throw imageError;
      } else if (data.image_url) {
        // Create new image record if there's a URL
        const { error: createImageError } = await supabase
          .from("onibus_images")
          .insert({
            tipo_onibus: data.tipo_onibus,
            empresa: data.empresa,
            image_url: data.image_url,
            onibus_id: id
          });

        if (createImageError) throw createImageError;
      }

      toast({
        description: "Ônibus atualizado com sucesso",
      });

      navigate("/dashboard/onibus");
    } catch (error: any) {
      console.error("Erro ao atualizar ônibus:", error);
      toast({
        description: `Erro ao atualizar ônibus: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados do ônibus...</span>
      </div>
    );
  }

  // Get current form values using watch
  const currentImageUrl = form.watch("image_url");

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost"
          onClick={() => navigate("/dashboard/onibus")}
          className="p-0 h-auto"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Editar Ônibus</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Dados do Ônibus</CardTitle>
          <CardDescription>
            Edite as informações do ônibus
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        value={field.value || 0}
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
                      <Input 
                        placeholder="Informações adicionais sobre o ônibus" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://exemplo.com/imagem.jpg" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {currentImageUrl && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Prévia da imagem:</p>
                  <img 
                    src={currentImageUrl} 
                    alt="Prévia" 
                    className="max-w-full h-auto max-h-48 object-contain border rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://via.placeholder.com/400x225?text=Imagem+indisponível';
                    }}
                  />
                </div>
              )}

              <div className="flex gap-4 justify-end">
                <Button 
                  className="bg-[#e40016] text-white hover:bg-[#c20012]"
                  onClick={() => navigate("/dashboard/onibus")} 
                  type="button"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#e40016] text-white hover:bg-[#c20012]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditarOnibus;
