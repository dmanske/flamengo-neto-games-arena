import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Pencil, Trash2, Users, Building2, Bus, Calendar, Image } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Onibus {
  id: string;
  tipo_onibus: string;
  empresa: string;
  capacidade: number;
  numero_identificacao: string | null;
  image_path: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const DetalhesOnibus = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [onibus, setOnibus] = useState<Onibus | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOnibusDetails();
    }
  }, [id]);

  const fetchOnibusDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("onibus")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setOnibus(data);
    } catch (error: any) {
      console.error("Erro ao buscar detalhes do ônibus:", error);
      toast.error("Erro ao carregar detalhes do ônibus");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onibus) return;

    try {
      // Verificar se o ônibus está sendo usado em alguma viagem
      const { data: viagemOnibus, error: viagemCheckError } = await supabase
        .from("viagem_onibus")
        .select("id")
        .eq("tipo_onibus", onibus.tipo_onibus)
        .eq("empresa", onibus.empresa)
        .limit(1);

      if (viagemCheckError) throw viagemCheckError;

      if (viagemOnibus && viagemOnibus.length > 0) {
        toast.error("Este ônibus está associado a viagens e não pode ser excluído");
        setDeleteDialogOpen(false);
        return;
      }

      // Excluir imagens associadas primeiro
      const { error: imgError } = await supabase
        .from("onibus_images")
        .delete()
        .eq("onibus_id", onibus.id);

      if (imgError) {
        console.warn("Erro ao excluir imagens associadas:", imgError);
      }

      // Excluir o ônibus
      const { error } = await supabase
        .from("onibus")
        .delete()
        .eq("id", onibus.id);

      if (error) throw error;

      toast.success("Ônibus removido com sucesso");
      navigate("/dashboard/onibus");
    } catch (error: any) {
      console.error("Erro ao excluir ônibus:", error);
      toast.error(`Erro ao excluir: ${error.message}`);
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
        <div className="container mx-auto py-6">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!onibus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
        <div className="container mx-auto py-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ônibus não encontrado</h2>
            <p className="text-gray-600 mb-6">O ônibus que você está procurando não existe ou foi removido.</p>
            <Button asChild>
              <Link to="/dashboard/onibus">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Catálogo
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="container mx-auto py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/onibus">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{onibus.tipo_onibus}</h1>
              <p className="text-gray-600">{onibus.empresa}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/dashboard/editar-onibus/${onibus.id}`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(true)}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Imagem Principal */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {onibus.image_path ? (
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <img 
                      src={onibus.image_path} 
                      alt={`${onibus.tipo_onibus} - ${onibus.empresa}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 flex flex-col items-center justify-center text-gray-500">
                    <Image className="h-16 w-16 mb-4" />
                    <p>Nenhuma imagem disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Informações */}
          <div className="space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bus className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tipo de Ônibus</label>
                  <p className="text-lg font-semibold">{onibus.tipo_onibus}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Empresa</label>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {onibus.empresa}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Capacidade</label>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {onibus.capacidade} passageiros
                  </p>
                </div>
                
                {onibus.numero_identificacao && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Número de Identificação</label>
                    <Badge variant="outline" className="mt-1">
                      #{onibus.numero_identificacao}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Descrição */}
            {onibus.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Descrição</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{onibus.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Informações do Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Informações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Cadastrado em</label>
                  <p className="text-sm">{formatDate(onibus.created_at)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Última atualização</label>
                  <p className="text-sm">{formatDate(onibus.updated_at)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o ônibus "{onibus.tipo_onibus}" da empresa {onibus.empresa}? 
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default DetalhesOnibus;