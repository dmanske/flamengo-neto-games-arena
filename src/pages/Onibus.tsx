
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
import { TipoOnibus, EmpresaOnibus } from "@/types/entities";

interface OnibusImage {
  id: string;
  tipo_onibus: string;
  empresa: string;
  image_url: string | null;
  created_at: string | null;
}

const Onibus = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [onibusImages, setOnibusImages] = useState<OnibusImage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEmpresa, setFilterEmpresa] = useState<string | null>(null);
  const [filterTipo, setFilterTipo] = useState<string | null>(null);

  useEffect(() => {
    fetchOnibusImages();
  }, []);

  const fetchOnibusImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("onibus_images")
        .select("*");

      if (error) throw error;
      setOnibusImages(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar imagens de ônibus:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados das imagens de ônibus",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("onibus_images")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      // Update local state
      setOnibusImages(onibusImages.filter(item => item.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Imagem removida com sucesso",
      });
    } catch (error: any) {
      console.error("Erro ao excluir imagem:", error);
      toast({
        title: "Erro",
        description: `Erro ao excluir imagem: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Filtrar onibus
  const filteredOnibus = onibusImages.filter((onibus) => {
    const matchesTerm =
      !searchTerm ||
      onibus.tipo_onibus.toLowerCase().includes(searchTerm.toLowerCase()) ||
      onibus.empresa.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEmpresa = !filterEmpresa || onibus.empresa === filterEmpresa;
    const matchesTipo = !filterTipo || onibus.tipo_onibus === filterTipo;

    return matchesTerm && matchesEmpresa && matchesTipo;
  });

  // Extrair valores únicos para filtros
  const empresas = [...new Set(onibusImages.map((o) => o.empresa))];
  const tipos = [...new Set(onibusImages.map((o) => o.tipo_onibus))];

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
                  placeholder="Buscar por tipo ou empresa..."
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
                      />
                    </AspectRatio>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle>{onibus.tipo_onibus}</CardTitle>
                    <CardDescription>{onibus.empresa}</CardDescription>
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
