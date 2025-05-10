import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
      companies: ["Majetur"],
      imageUrl: null
    },
    {
      type: "56 Leitos Master",
      companies: ["Sarcella"],
      imageUrl: null
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if the onibus bucket exists and create if necessary
  const initOrCheckOnibusBucket = async () => {
    try {
      const { error: bucketError } = await supabase.storage.getBucket('onibus');
      if (bucketError && bucketError.message.includes('not found')) {
        console.log('Creating onibus storage bucket...');
        await supabase.storage.createBucket('onibus', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        console.log('Bucket created successfully');
      }
    } catch (error) {
      console.error('Error checking/creating onibus bucket:', error);
    }
  };
  
  // Carregar imagens do banco de dados
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setIsLoading(true);
        
        // First ensure the onibus bucket exists
        await initOrCheckOnibusBucket();
        
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
  
  const handleImageChange = async (imageUrl: string | null, index: number) => {
    const busType = busList[index].type;
    const company = busList[index].companies[0];
    
    try {
      setIsLoading(true);
      
      // Ensure bucket exists before attempting operations
      await initOrCheckOnibusBucket();
      
      if (imageUrl) {
        // Check if record exists
        const { data: existingData } = await supabase
          .from("onibus_images")
          .select("id")
          .eq("tipo_onibus", busType)
          .single();
        
        if (existingData) {
          // Update existing record
          const { error: updateError } = await supabase
            .from("onibus_images")
            .update({
              image_url: imageUrl,
              empresa: company
            })
            .eq("tipo_onibus", busType);
          
          if (updateError) throw updateError;
        } else {
          // Create new record
          const { error: insertError } = await supabase
            .from("onibus_images")
            .insert({
              tipo_onibus: busType,
              empresa: company,
              image_url: imageUrl
            });
          
          if (insertError) throw insertError;
        }
      } else {
        // Delete record if imageUrl is null
        const { error: deleteError } = await supabase
          .from("onibus_images")
          .delete()
          .eq("tipo_onibus", busType);
        
        if (deleteError) throw deleteError;
      }
      
      // Update local state
      const updatedBusList = [...busList];
      updatedBusList[index].imageUrl = imageUrl;
      setBusList(updatedBusList);
      
      toast.success(imageUrl ? "Imagem salva com sucesso!" : "Imagem removida com sucesso!");
    } catch (error: any) {
      console.error("Erro ao atualizar imagem:", error);
      toast.error(`Erro ao atualizar imagem: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold text-secondary mb-6">Ônibus</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {busList.map((bus, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="w-full">
              <AspectRatio ratio={16/9} className="bg-gray-100">
                {bus.imageUrl ? (
                  <img 
                    src={bus.imageUrl} 
                    alt={`Imagem do ônibus ${bus.type}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full">
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    ) : (
                      <div className="text-gray-400 text-center p-4">
                        Clique abaixo para carregar uma imagem
                      </div>
                    )}
                  </div>
                )}
              </AspectRatio>
            </div>
            <CardHeader>
              <CardTitle>{bus.type}</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-sm font-semibold mb-2">Empresas:</h3>
              <div className="space-y-1 mb-6">
                {bus.companies.map((company, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                    <span>{company}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Imagem do ônibus:</h3>
                
                <FileUpload
                  value={bus.imageUrl}
                  onChange={(url) => handleImageChange(url, index)}
                  bucketName="onibus"
                  folderPath=""
                  allowedFileTypes={["image/jpeg", "image/png", "image/jpg"]}
                  maxSizeInMB={5}
                  showPreview={false}
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
