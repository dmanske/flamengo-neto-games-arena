import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

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
  const [filterEmpresa, setFilterEmpresa] = useState<string>("all");
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [onibusToDelete, setOnibusToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

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
      toast.error("Erro ao carregar dados dos ônibus");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!onibusToDelete) return;
    
    try {
      // Verificar se o ônibus está sendo usado em alguma viagem
      const onibusParaDeletar = onibusList.find(bus => bus.id === onibusToDelete);
      
      if (!onibusParaDeletar) {
        toast.error("Ônibus não encontrado");
        setOnibusToDelete(null);
        setDeleteDialogOpen(false);
        return;
      }
      
      // Verificar se existe viagem associada
      const { data: viagemOnibus, error: viagemCheckError } = await supabase
        .from("viagem_onibus")
        .select("id")
        .eq("tipo_onibus", onibusParaDeletar.tipo_onibus)
        .eq("empresa", onibusParaDeletar.empresa)
        .limit(1);
        
      if (viagemCheckError) throw viagemCheckError;
      
      if (viagemOnibus && viagemOnibus.length > 0) {
        toast.error("Este ônibus está associado a viagens e não pode ser excluído");
        setOnibusToDelete(null);
        setDeleteDialogOpen(false);
        return;
      }
      
      // Verificar se existe passageiros associados
      const { data: passageiros, error: passageirosError } = await supabase
        .from("viagem_passageiros")
        .select("id")
        .eq("onibus_id", onibusToDelete)
        .limit(1);
        
      if (passageirosError) throw passageirosError;
      
      if (passageiros && passageiros.length > 0) {
        toast.error("Este ônibus possui passageiros associados e não pode ser excluído");
        setOnibusToDelete(null);
        setDeleteDialogOpen(false);
        return;
      }
      
      // Excluir imagens relacionadas primeiro
      const { error: imgError } = await supabase
        .from("onibus_images")
        .delete()
        .eq("onibus_id", onibusToDelete);
        
      if (imgError) {
        console.warn("Erro ao excluir imagens associadas:", imgError);
      }
      
      // Excluir o registro do ônibus
      const { error: deleteError } = await supabase
        .from("onibus")
        .delete()
        .eq("id", onibusToDelete);

      if (deleteError) throw deleteError;
      
      // Verificar se realmente foi excluído
      const { data: checkData } = await supabase
        .from("onibus")
        .select("id")
        .eq("id", onibusToDelete)
        .single();
        
      if (checkData) {
        throw new Error("Falha na exclusão - registro ainda existe no banco");
      }
      
      toast.success("Ônibus removido com sucesso");
      
      // Recarregar os dados para garantir sincronização
      await fetchOnibusData();
      
    } catch (error: any) {
      console.error("Erro ao excluir:", error);
      toast.error(`Erro ao excluir: ${error.message}`);
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
    // Filtro de busca por termo
    const matchesTerm = !searchTerm || 
      onibus.tipo_onibus.toLowerCase().includes(searchTerm.toLowerCase()) ||
      onibus.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      onibus.capacidade.toString().includes(searchTerm) ||
      (onibus.numero_identificacao && onibus.numero_identificacao.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (onibus.description && onibus.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filtro por empresa
    const matchesEmpresa = !filterEmpresa || filterEmpresa === "all" || onibus.empresa === filterEmpresa;
    
    // Filtro por tipo
    const matchesTipo = !filterTipo || filterTipo === "all" || onibus.tipo_onibus === filterTipo;

    return matchesTerm && matchesEmpresa && matchesTipo;
  });

  // Extrair valores únicos para filtros
  const empresas = [...new Set(onibusList.map((o) => o.empresa))].filter(Boolean);
  const tipos = [...new Set(onibusList.map((o) => o.tipo_onibus))].filter(Boolean);

  // Debug dos filtros
  console.log("Filtros Debug:", {
    searchTerm,
    filterEmpresa,
    filterTipo,
    empresas,
    tipos,
    totalOnibus: onibusList.length,
    filteredCount: filteredOnibus.length
  });

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
