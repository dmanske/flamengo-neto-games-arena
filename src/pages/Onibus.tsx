
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Search, PlusCircle, Trash2, Pencil } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface OnibusImage {
  id: string;
  tipo_onibus: string;
  empresa: string;
  image_url: string | null;
  created_at: string | null;
  onibus_id: string | null;
}

interface Onibus {
  id: string;
  tipo_onibus: string;
  empresa: string;
  numero_identificacao: string | null;
  capacidade: number;
  created_at: string;
  updated_at: string;
}

const Onibus = () => {
  const navigate = useNavigate();
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
      
      // Fetch both onibus records and images
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

      // Log the data for debugging
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
  const onibusDisplayData = onibusList.map(onibus => {
    // Encontrar imagem associada (se existir)
    const image = onibusImages.find(img => img.onibus_id === onibus.id);
    
    return {
      ...onibus,
      image_url: image?.image_url || null,
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Catálogo de Ônibus</h1>
        <Button onClick={() => navigate("/dashboard/cadastrar-onibus")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Cadastrar Ônibus
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Utilize os filtros abaixo para encontrar ônibus específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por tipo, empresa ou identificação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-[200px]">
              <Select
                value={filterEmpresa || "todos"}
                onValueChange={(value) => setFilterEmpresa(value === "todos" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas empresas</SelectItem>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa} value={empresa}>
                      {empresa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-[200px]">
              <Select
                value={filterTipo || "todos"}
                onValueChange={(value) => setFilterTipo(value === "todos" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos tipos</SelectItem>
                  {tipos.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Ônibus</CardTitle>
          <CardDescription>
            Lista de todos os modelos de ônibus cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredOnibus.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum ônibus encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOnibus.map((onibus) => (
                <Card key={onibus.id} className="overflow-hidden">
                  {onibus.image_url && (
                    <AspectRatio ratio={16 / 9}>
                      <img
                        src={onibus.image_url}
                        alt={`${onibus.empresa} ${onibus.tipo_onibus}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/400x225?text=Imagem+indisponível';
                        }}
                      />
                    </AspectRatio>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle>{onibus.tipo_onibus}</CardTitle>
                    <CardDescription>
                      {onibus.empresa}
                      {onibus.numero_identificacao && (
                        <span className="block mt-1">ID: {onibus.numero_identificacao}</span>
                      )}
                      <span className="block mt-1">Capacidade: {onibus.capacidade} lugares</span>
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(onibus.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remover
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/dashboard/onibus/${onibus.id}/editar`)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Onibus;
