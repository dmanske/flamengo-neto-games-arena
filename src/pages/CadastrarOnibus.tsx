
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { OnibusForm, OnibusFormValues } from "@/components/onibus/OnibusForm";

const CadastrarOnibus = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePath, setImagePath] = useState<string | null>(null);

  const defaultValues: OnibusFormValues = {
    tipo_onibus: "",
    empresa: "",
    numero_identificacao: "",
    capacidade: 40,
    description: ""
  };

  const onSubmit = async (data: OnibusFormValues) => {
    try {
      setIsLoading(true);
      
      // Create the main onibus record
      const { data: onibusData, error: onibusError } = await supabase
        .from("onibus")
        .insert({
          tipo_onibus: data.tipo_onibus,
          empresa: data.empresa,
          numero_identificacao: data.numero_identificacao || null,
          capacidade: data.capacidade,
          description: data.description || null,
          image_path: imagePath
        })
        .select("id")
        .single();

      if (onibusError) throw onibusError;
      
      // Create the image record linked to the onibus if an image was uploaded
      if (imagePath) {
        const { error: imageError } = await supabase.from("onibus_images").insert({
          tipo_onibus: data.tipo_onibus,
          empresa: data.empresa,
          image_url: imagePath,
          onibus_id: onibusData.id
        });
        
        if (imageError) {
          console.error("Erro ao salvar imagem:", imageError);
          // Continue even if image fails, but notify user
          toast.error("Ônibus cadastrado, mas houve um erro ao salvar a imagem");
        }
      }

      toast("Ônibus cadastrado com sucesso");

      navigate("/dashboard/onibus");
    } catch (error: any) {
      console.error("Erro ao cadastrar ônibus:", error);
      toast.error(`Erro ao cadastrar ônibus: ${error.message}`);
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
          <OnibusForm
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            isLoading={isLoading}
            imagePath={imagePath}
            setImagePath={setImagePath}
          >
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
          </OnibusForm>
        </CardContent>
      </Card>
    </div>
  );
};

export default CadastrarOnibus;
