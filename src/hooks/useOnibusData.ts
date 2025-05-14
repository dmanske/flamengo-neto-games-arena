
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface OnibusImage {
  id: string;
  tipo_onibus: string;
  empresa: string;
  image_url: string | null;
  created_at: string | null;
  onibus_id: string | null;
}

export interface Onibus {
  id: string;
  tipo_onibus: string;
  empresa: string;
  numero_identificacao: string | null;
  capacidade: number;
  created_at: string;
  updated_at: string;
  image_path: string | null;
  description: string | null;
  year: number | null;
}

export interface OnibusDisplay extends Onibus {
  image_url: string | null;
  image_id: string | null;
}

export function useOnibusData() {
  const [loading, setLoading] = useState(true);
  const [onibusImages, setOnibusImages] = useState<OnibusImage[]>([]);
  const [onibusList, setOnibusList] = useState<Onibus[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEmpresa, setFilterEmpresa] = useState<string | null>(null);
  const [filterTipo, setFilterTipo] = useState<string | null>(null);

  useEffect(() => {
    fetchOnibusData();
  }, []);

  const fetchOnibusData = async () => {
    try {
      setLoading(true);
      
      const { data: onibusData, error: onibusError } = await supabase
        .from("onibus")
        .select("*");
        
      const { data: imagesData, error: imagesError } = await supabase
        .from("onibus_images")
        .select("*");

      if (onibusError) throw onibusError;
      if (imagesError) throw imagesError;
      
      setOnibusList(onibusData || []);
      setOnibusImages(imagesData || []);

      console.log("Ônibus data:", onibusData);
      console.log("Imagens data:", imagesData);
      
    } catch (error: any) {
      console.error("Erro ao buscar dados de ônibus:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos ônibus",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, isImage: boolean = false) => {
    try {
      let success = false;
      
      if (isImage) {
        // Delete just the image
        const { error } = await supabase
          .from("onibus_images")
          .delete()
          .eq("id", id);

        if (error) throw error;
        setOnibusImages(onibusImages.filter(item => item.id !== id));
        success = true;
      } else {
        // Delete the onibus record and its associated images
        const onibusToDelete = onibusList.find(o => o.id === id);
        
        // First delete related images
        const { error: imgError } = await supabase
          .from("onibus_images")
          .delete()
          .eq("onibus_id", id);
          
        if (imgError) {
          console.warn("Erro ao excluir imagens associadas:", imgError);
        }
        
        // Then delete the onibus record
        const { error } = await supabase
          .from("onibus")
          .delete()
          .eq("id", id);

        if (error) throw error;
        
        // Update local state
        setOnibusList(onibusList.filter(item => item.id !== id));
        setOnibusImages(onibusImages.filter(item => item.onibus_id !== id));
        success = true;
      }
      
      if (success) {
        toast({
          title: "Sucesso",
          description: isImage ? "Imagem removida com sucesso" : "Ônibus removido com sucesso",
        });
      }
    } catch (error: any) {
      console.error("Erro ao excluir:", error);
      toast({
        title: "Erro",
        description: `Erro ao excluir: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Preparar dados para exibição combinando ônibus e imagens
  const onibusDisplayData: OnibusDisplay[] = onibusList.map(onibus => {
    // Encontrar imagem associada (se existir)
    const image = onibusImages.find(img => img.onibus_id === onibus.id);
    
    return {
      ...onibus,
      image_url: image?.image_url || onibus.image_path || null,
      image_id: image?.id || null
    };
  });
  
  // Filtrar onibus
  const filteredOnibus = onibusDisplayData.filter((onibus) => {
    const matchesTerm =
      !searchTerm ||
      onibus.tipo_onibus.toLowerCase().includes(searchTerm.toLowerCase()) ||
      onibus.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (onibus.numero_identificacao && onibus.numero_identificacao.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesEmpresa = !filterEmpresa || onibus.empresa === filterEmpresa;
    const matchesTipo = !filterTipo || onibus.tipo_onibus === filterTipo;

    return matchesTerm && matchesEmpresa && matchesTipo;
  });

  // Extrair valores únicos para filtros
  const empresas = [...new Set(onibusList.map((o) => o.empresa))];
  const tipos = [...new Set(onibusList.map((o) => o.tipo_onibus))];

  return {
    loading,
    filteredOnibus,
    searchTerm,
    setSearchTerm,
    filterEmpresa,
    setFilterEmpresa,
    filterTipo,
    setFilterTipo,
    empresas,
    tipos,
    handleDelete,
    fetchOnibusData,
    onibusList
  };
}
