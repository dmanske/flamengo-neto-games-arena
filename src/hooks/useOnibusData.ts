
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [onibusToDelete, setOnibusToDelete] = useState<string | null>(null);

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
        description: "Erro ao carregar dados dos ônibus",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!onibusToDelete) return;
    
    try {
      let success = false;
      
      // Verificar se o ônibus está sendo usado em alguma viagem
      // Em vez de procurar por onibus_id, vamos verificar se existe uma viagem 
      // com a mesma combinação de tipo_onibus e empresa
      const onibusParaDeletar = onibusList.find(bus => bus.id === onibusToDelete);
      
      if (!onibusParaDeletar) {
        toast({
          description: "Ônibus não encontrado",
          variant: "destructive",
        });
        setOnibusToDelete(null);
        setDeleteDialogOpen(false);
        return;
      }
      
      const { data: viagemOnibus, error: viagemCheckError } = await supabase
        .from("viagem_onibus")
        .select("id")
        .eq("tipo_onibus", onibusParaDeletar.tipo_onibus)
        .eq("empresa", onibusParaDeletar.empresa)
        .limit(1);
        
      if (viagemCheckError) throw viagemCheckError;
      
      if (viagemOnibus && viagemOnibus.length > 0) {
        toast({
          description: "Este ônibus está associado a viagens e não pode ser excluído",
          variant: "destructive",
        });
        setOnibusToDelete(null);
        setDeleteDialogOpen(false);
        return;
      }
      
      // First delete related images
      const { error: imgError } = await supabase
        .from("onibus_images")
        .delete()
        .eq("onibus_id", onibusToDelete);
        
      if (imgError) {
        console.warn("Erro ao excluir imagens associadas:", imgError);
      }
      
      // Then delete the onibus record
      const { error } = await supabase
        .from("onibus")
        .delete()
        .eq("id", onibusToDelete);

      if (error) throw error;
      
      // Update local state
      setOnibusList(prevState => prevState.filter(item => item.id !== onibusToDelete));
      setOnibusImages(prevState => prevState.filter(item => item.onibus_id !== onibusToDelete));
      success = true;
      
      if (success) {
        toast({
          description: "Ônibus removido com sucesso",
        });
      }
    } catch (error: any) {
      console.error("Erro ao excluir:", error);
      toast({
        description: `Erro ao excluir: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setOnibusToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    setOnibusToDelete(id);
    setDeleteDialogOpen(true);
  };

  const cancelDelete = () => {
    setOnibusToDelete(null);
    setDeleteDialogOpen(false);
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
    onibusList,
    deleteDialogOpen,
    onibusToDelete,
    confirmDelete,
    cancelDelete,
  };
}
