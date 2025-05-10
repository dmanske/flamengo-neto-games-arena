
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [selectedFile, setSelectedFile] = useState<{ index: number, file: File | null }>({ index: -1, file: null });
  
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
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile({
        index,
        file: event.target.files[0]
      });
    }
  };
  
  const handleFileUpload = async () => {
    if (!selectedFile.file || selectedFile.index === -1) return;
    
    setIsLoading(true);
    const { index, file } = selectedFile;
    const busType = busList[index].type;
    
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      // Remove the nested folder structure to avoid bucket errors
      const filePath = `${busType.toLowerCase().replace(/\s+/g, '-')}-${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("onibus")
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("onibus")
        .getPublicUrl(filePath);
      
      if (!publicUrlData) throw new Error("Falha ao obter URL pública");
      
      const imageUrl = publicUrlData.publicUrl;
      
      // Update database
      const company = busList[index].companies[0];
      
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
      
      // Update local state
      const updatedBusList = [...busList];
      updatedBusList[index].imageUrl = imageUrl;
      setBusList(updatedBusList);
      
      toast.success("Imagem salva com sucesso!");
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      toast.error(`Erro ao enviar imagem: ${error.message}`);
    } finally {
      setIsLoading(false);
      setSelectedFile({ index: -1, file: null });
    }
  };
  
  const handleRemoveImage = async (index: number) => {
    const busType = busList[index].type;
    const currentUrl = busList[index].imageUrl;
    
    if (!currentUrl) return;
    
    setIsLoading(true);
    
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from("onibus_images")
        .delete()
        .eq("tipo_onibus", busType);
      
      if (dbError) throw dbError;
      
      // Extract file path from URL
      const urlParts = currentUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      // Delete from storage - simplified path construction
      const { error: storageError } = await supabase.storage
        .from("onibus")
        .remove([fileName]);
      
      if (storageError) {
        console.warn("Erro ao remover arquivo do storage:", storageError);
        // Continue even if storage removal fails
      }
      
      // Update local state
      const updatedBusList = [...busList];
      updatedBusList[index].imageUrl = null;
      setBusList(updatedBusList);
      
      toast.success("Imagem removida com sucesso!");
    } catch (error: any) {
      console.error("Erro ao remover imagem:", error);
      toast.error(`Erro ao remover imagem: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fileInputId = (index: number) => `file-input-${index}`;

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
                    <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                    <span>{company}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Imagem do ônibus:</h3>
                
                <div className="flex flex-col space-y-2">
                  {/* File input hidden but accessible through label */}
                  <input
                    id={fileInputId(index)}
                    type="file"
                    accept="image/jpeg, image/png, image/jpg"
                    onChange={(e) => handleFileSelect(e, index)}
                    className="hidden"
                  />
                  
                  <div className="flex items-center space-x-2">
                    <label 
                      htmlFor={fileInputId(index)} 
                      className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Escolher arquivo
                    </label>
                    
                    {selectedFile.index === index && selectedFile.file && (
                      <Button 
                        onClick={handleFileUpload}
                        disabled={isLoading}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                      >
                        Enviar
                      </Button>
                    )}
                    
                    {bus.imageUrl && (
                      <Button 
                        onClick={() => handleRemoveImage(index)}
                        disabled={isLoading}
                        size="sm"
                        variant="destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {selectedFile.index === index && selectedFile.file && (
                    <p className="text-xs text-gray-500 truncate">
                      {selectedFile.file.name}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Display image preview at the bottom if image was recently selected */}
              {selectedFile.index === index && selectedFile.file && (
                <div className="mt-4 border rounded-md overflow-hidden">
                  <img 
                    src={URL.createObjectURL(selectedFile.file)} 
                    alt="Preview" 
                    className="w-full h-auto"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Onibus;
