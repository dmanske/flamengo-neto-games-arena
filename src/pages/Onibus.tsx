
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface BusType {
  type: string;
  companies: string[];
  imageUrl: string | null;
}

const Onibus = () => {
  const [busList, setBusList] = useState<BusType[]>([
    {
      type: "43 Leitos Totais",
      companies: ["Bertoldo"],
      imageUrl: null
    },
    {
      type: "52 Leitos Master",
      companies: ["HG TUR"],
      imageUrl: null
    },
    {
      type: "56 Leitos Master",
      companies: ["Sarcella"],
      imageUrl: null
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Carregar imagens do banco de dados
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from("onibus_images")
          .select("*");
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const updatedBusList = [...busList];
          
          data.forEach((item) => {
            const index = updatedBusList.findIndex(bus => bus.type === item.tipo_onibus);
            if (index !== -1) {
              updatedBusList[index].imageUrl = item.image_url;
            }
          });
          
          setBusList(updatedBusList);
        }
      } catch (error) {
        console.error("Erro ao carregar imagens:", error);
        toast.error("Não foi possível carregar as imagens dos ônibus");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchImages();
  }, []);
  
  const handleImageChange = async (index: number, url: string | null) => {
    try {
      const updatedBusList = [...busList];
      const busType = updatedBusList[index].type;
      const company = updatedBusList[index].companies[0]; // Primeira empresa da lista
      
      // Atualizar estado local
      updatedBusList[index].imageUrl = url;
      setBusList(updatedBusList);
      
      if (url) {
        // Verificar se já existe um registro para este tipo de ônibus
        const { data, error: checkError } = await supabase
          .from("onibus_images")
          .select("id")
          .eq("tipo_onibus", busType)
          .single();
        
        if (checkError && checkError.code !== "PGRST116") {
          throw checkError;
        }
        
        if (data) {
          // Atualizar registro existente
          const { error } = await supabase
            .from("onibus_images")
            .update({
              image_url: url,
              empresa: company
            })
            .eq("tipo_onibus", busType);
          
          if (error) throw error;
        } else {
          // Criar novo registro
          const { error } = await supabase
            .from("onibus_images")
            .insert({
              tipo_onibus: busType,
              empresa: company,
              image_url: url
            });
          
          if (error) throw error;
        }
        
        toast.success("Imagem salva com sucesso!");
      } else {
        // Remover imagem
        const { error } = await supabase
          .from("onibus_images")
          .delete()
          .eq("tipo_onibus", busType);
        
        if (error) throw error;
        
        toast.success("Imagem removida com sucesso!");
      }
    } catch (error: any) {
      console.error("Erro ao salvar imagem:", error);
      toast.error(`Erro ao salvar a imagem: ${error.message}`);
    }
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold text-secondary mb-6">Ônibus</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {busList.map((bus, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {bus.imageUrl ? (
                <img 
                  src={bus.imageUrl} 
                  alt={`Imagem do ônibus ${bus.type}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 text-center p-4">
                  {isLoading ? "Carregando..." : "Clique abaixo para carregar uma imagem"}
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle>{bus.type}</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-sm font-semibold mb-2">Empresas:</h3>
              <div className="space-y-1 mb-6">
                {bus.companies.map((company, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>{company}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Imagem do ônibus:</h3>
                <FileUpload
                  value={bus.imageUrl}
                  onChange={(url) => handleImageChange(index, url)}
                  bucketName="onibus"
                  folderPath={`tipos/${bus.type.toLowerCase().replace(/\s+/g, '-')}`}
                  allowedFileTypes={["image/jpeg", "image/png", "image/jpg"]}
                  maxSizeInMB={5}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Onibus;
