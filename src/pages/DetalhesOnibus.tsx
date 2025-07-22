import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Users,
  Building2,
  Bus,
  Calendar,
  Image,
  MapPin,
  Clock,
  Info,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState("detalhes");

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <Skeleton className="h-[180px] w-full rounded-xl" />
              <Skeleton className="h-[180px] w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!onibus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-center items-center h-[60vh]">
            <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg max-w-md">
              <div className="bg-red-50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ônibus não encontrado</h2>
              <p className="text-gray-600 mb-8">O ônibus que você está procurando não existe ou foi removido.</p>
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Link to="/dashboard/onibus">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Voltar ao Catálogo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header com Breadcrumb e Ações */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
              <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
              <span>/</span>
              <Link to="/dashboard/onibus" className="hover:text-blue-600 transition-colors">Ônibus</Link>
              <span>/</span>
              <span className="text-slate-900 font-medium">Detalhes</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-md">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-700 bg-clip-text text-transparent">
                  {onibus.tipo_onibus}
                </h1>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  <p className="text-slate-600">{onibus.empresa}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              asChild
              className="border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700"
            >
              <Link to="/dashboard/onibus">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>

            <Button
              variant="outline"
              asChild
              className="border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-700"
            >
              <Link to={`/dashboard/editar-onibus/${onibus.id}`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>

            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              className="border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>

        {/* Conteúdo Principal com Tabs */}
        <Tabs defaultValue="detalhes" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 max-w-md mb-8">
            <TabsTrigger value="detalhes" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Info className="h-4 w-4 mr-2" />
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="especificacoes" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Especificações
            </TabsTrigger>
            <TabsTrigger value="historico" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Clock className="h-4 w-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Tab de Detalhes */}
          <TabsContent value="detalhes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Imagem Principal */}
              <div className="lg:col-span-8">
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Image className="h-5 w-5 text-blue-600" />
                      Visualização do Veículo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {onibus.image_path ? (
                      <div className="aspect-video bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
                        <img
                          src={onibus.image_path}
                          alt={`${onibus.tipo_onibus} - ${onibus.empresa}`}
                          className="w-full h-full object-contain rounded-lg shadow-sm"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center text-slate-400 p-8">
                        <div className="p-6 bg-white/80 backdrop-blur-sm rounded-full shadow-md mb-4">
                          <Image className="h-16 w-16" />
                        </div>
                        <p className="text-lg font-medium">Nenhuma imagem disponível</p>
                        <p className="text-sm mt-2">Adicione uma imagem ao editar este ônibus</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Informações Principais */}
              <div className="lg:col-span-4 space-y-6">
                {/* Card de Informações Básicas */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 pb-6">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Bus className="h-5 w-5" />
                      Informações Básicas
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      Detalhes principais do veículo
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-md">
                            <Bus className="h-5 w-5 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-600">Tipo</span>
                        </div>
                        <span className="font-semibold text-slate-900">{onibus.tipo_onibus}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 rounded-md">
                            <Building2 className="h-5 w-5 text-indigo-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-600">Empresa</span>
                        </div>
                        <span className="font-semibold text-slate-900">{onibus.empresa}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-md">
                            <Users className="h-5 w-5 text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-600">Capacidade</span>
                        </div>
                        <span className="font-semibold text-slate-900">{onibus.capacidade} passageiros</span>
                      </div>

                      {onibus.numero_identificacao && (
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-md">
                              <Info className="h-5 w-5 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-600">ID</span>
                          </div>
                          <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0">
                            #{onibus.numero_identificacao}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Card de Status do Sistema */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-slate-800 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-slate-600" />
                      Status do Sistema
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span>Cadastrado em</span>
                        </div>
                        <span className="text-sm font-medium">{formatDate(onibus.created_at)}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          <span>Última atualização</span>
                        </div>
                        <span className="text-sm font-medium">{formatDate(onibus.updated_at)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Descrição */}
            {onibus.description && (
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-slate-800 flex items-center gap-2">
                    <Info className="h-5 w-5 text-slate-600" />
                    Descrição do Veículo
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-slate-700 leading-relaxed">{onibus.description}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab de Especificações */}
          <TabsContent value="especificacoes">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-100">
                <CardTitle className="text-slate-800">Especificações Técnicas</CardTitle>
                <CardDescription>Detalhes técnicos do veículo</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Tipo de Ônibus</h3>
                      <p className="font-semibold text-slate-900">{onibus.tipo_onibus}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Empresa</h3>
                      <p className="font-semibold text-slate-900">{onibus.empresa}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Capacidade</h3>
                      <p className="font-semibold text-slate-900">{onibus.capacidade} passageiros</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {onibus.numero_identificacao && (
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h3 className="text-sm font-medium text-slate-500 mb-1">Número de Identificação</h3>
                        <Badge variant="outline" className="mt-1 font-semibold">
                          #{onibus.numero_identificacao}
                        </Badge>
                      </div>
                    )}

                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-medium text-slate-500 mb-1">ID do Sistema</h3>
                      <p className="font-mono text-xs bg-slate-100 p-1 rounded inline-block">{onibus.id}</p>
                    </div>
                  </div>
                </div>

                {onibus.description && (
                  <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Descrição Completa</h3>
                    <p className="text-slate-700">{onibus.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Histórico */}
          <TabsContent value="historico">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-100">
                <CardTitle className="text-slate-800">Histórico do Veículo</CardTitle>
                <CardDescription>Registro de atividades e atualizações</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-green-100 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">Veículo Cadastrado</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        O veículo foi adicionado ao sistema
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-xs text-slate-500">{formatDate(onibus.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {onibus.created_at !== onibus.updated_at && (
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 p-2 bg-blue-100 rounded-full">
                        <Pencil className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">Informações Atualizadas</h3>
                        <p className="text-sm text-slate-600 mt-1">
                          Os dados do veículo foram atualizados
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-xs text-slate-500">{formatDate(onibus.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-white border-0 shadow-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Confirmar exclusão
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                Tem certeza que deseja excluir o ônibus <span className="font-semibold text-slate-900">"{onibus.tipo_onibus}"</span> da empresa <span className="font-semibold text-slate-900">{onibus.empresa}</span>?
                <br />Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-slate-200 text-slate-700 hover:bg-slate-50">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0"
              >
                <Trash2 className="h-4 w-4 mr-2" />
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