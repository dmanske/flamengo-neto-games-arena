
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
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { TipoOnibus, EmpresaOnibus } from "@/types/entities";

const onibusFormSchema = z.object({
  tipo_onibus: z.string().min(1, "Tipo de ônibus é obrigatório"),
  empresa: z.string().min(1, "Empresa é obrigatória"),
  image_url: z.string().url("URL de imagem inválida").optional().or(z.literal("")),
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
    },
  });

  useEffect(() => {
    const fetchOnibus = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("onibus_images")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        
        if (data) {
          form.reset({
            tipo_onibus: data.tipo_onibus,
            empresa: data.empresa,
            image_url: data.image_url || "",
          });
        }
      } catch (error: any) {
        console.error("Erro ao buscar ônibus:", error);
        toast({
          title: "Erro",
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
      
      const { error } = await supabase
        .from("onibus_images")
        .update({
          tipo_onibus: data.tipo_onibus,
          empresa: data.empresa,
          image_url: data.image_url || null,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Ônibus atualizado com sucesso",
      });

      navigate("/dashboard/onibus");
    } catch (error: any) {
      console.error("Erro ao atualizar ônibus:", error);
      toast({
        title: "Erro",
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de ônibus" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="43 Leitos Totais">43 Leitos Totais</SelectItem>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a empresa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Bertoldo">Bertoldo</SelectItem>
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
                  variant="outline" 
                  onClick={() => navigate("/dashboard/onibus")} 
                  type="button"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={isSaving}
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
