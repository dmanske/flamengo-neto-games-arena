
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
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

const CadastrarOnibus = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<OnibusFormValues>({
    resolver: zodResolver(onibusFormSchema),
    defaultValues: {
      tipo_onibus: "",
      empresa: "",
      image_url: "",
    },
  });

  const onSubmit = async (data: OnibusFormValues) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.from("onibus_images").insert({
        tipo_onibus: data.tipo_onibus,
        empresa: data.empresa,
        image_url: data.image_url || null,
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Ônibus cadastrado com sucesso",
      });

      navigate("/dashboard/onibus");
    } catch (error: any) {
      console.error("Erro ao cadastrar ônibus:", error);
      toast({
        title: "Erro",
        description: `Erro ao cadastrar ônibus: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold">Cadastrar Ônibus</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Dados do Ônibus</CardTitle>
          <CardDescription>
            Cadastre um novo modelo de ônibus no sistema
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : "Cadastrar Ônibus"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CadastrarOnibus;
