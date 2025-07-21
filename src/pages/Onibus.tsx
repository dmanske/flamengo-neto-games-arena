
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlusCircle, Bus, BarChart3, TrendingUp, Users } from "lucide-react";
import { OnibusFilters } from "@/components/onibus/OnibusFilters";
import { OnibusCard } from "@/components/onibus/OnibusCard";
import { useOnibusData } from "@/hooks/useOnibusData";
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
import { TooltipProvider } from "@/components/ui/tooltip";

const Onibus = () => {
  const navigate = useNavigate();
  const {
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
    confirmDelete,
    cancelDelete,
    deleteDialogOpen
  } = useOnibusData();

  const clearFilters = () => {
    setSearchTerm("");
    setFilterEmpresa("all");
    setFilterTipo("all");
  };

  const handleDeleteOnibus = (onibus: any) => {
    handleDelete(onibus.id);
  };

  // Calcular estatísticas
  const totalOnibus = filteredOnibus.length;
  const totalCapacidade = filteredOnibus.reduce((sum, onibus) => sum + onibus.capacidade, 0);
  const empresasUnicas = new Set(filteredOnibus.map(onibus => onibus.empresa)).size;
  const tiposUnicos = new Set(filteredOnibus.map(onibus => onibus.tipo_onibus)).size;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="container mx-auto py-8 space-y-8">
          {/* Header Modernizado */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <Bus className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-700 bg-clip-text text-transparent">
                    Dashboard de Ônibus
                  </h1>
                  <p className="text-slate-600 text-lg">Gerencie sua frota de forma inteligente</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => navigate("/dashboard/cadastrar-onibus")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-medium"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Novo Ônibus
            </Button>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total de Ônibus</p>
                    <p className="text-3xl font-bold text-slate-900">{totalOnibus}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <Bus className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Capacidade Total</p>
                    <p className="text-3xl font-bold text-slate-900">{totalCapacidade}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Empresas</p>
                    <p className="text-3xl font-bold text-slate-900">{empresasUnicas}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Tipos</p>
                    <p className="text-3xl font-bold text-slate-900">{tiposUnicos}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <OnibusFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            tipoFilter={filterTipo || "all"}
            setTipoFilter={setFilterTipo}
            empresaFilter={filterEmpresa || "all"}
            setEmpresaFilter={setFilterEmpresa}
            clearFilters={clearFilters}
            empresas={empresas}
            tipos={tipos}
          />

          <Card className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-professional">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-gray-50">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white">
                  <PlusCircle className="h-5 w-5" />
                </div>
                Catálogo de Ônibus
              </CardTitle>
              <CardDescription className="text-gray-600">
                Lista de todos os modelos de ônibus cadastrados em sua frota
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                  <p className="text-gray-600 text-lg">Carregando ônibus...</p>
                </div>
              ) : filteredOnibus.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <PlusCircle className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum ônibus encontrado</h3>
                  <p className="text-gray-600 mb-6">
                    Não há ônibus cadastrados com os filtros selecionados.
                  </p>
                  <Button 
                    onClick={() => navigate("/dashboard/cadastrar-onibus")}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Cadastrar Primeiro Ônibus
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOnibus.map((onibus) => (
                    <OnibusCard
                      key={onibus.id}
                      onibus={onibus}
                      onDeleteClick={handleDeleteOnibus}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <AlertDialog open={deleteDialogOpen} onOpenChange={cancelDelete}>
            <AlertDialogContent className="bg-white border-gray-200">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-900">Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600">
                  Tem certeza que deseja remover este ônibus? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel 
                  onClick={cancelDelete}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-700"
                >
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={confirmDelete} 
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Sim, remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Onibus;
