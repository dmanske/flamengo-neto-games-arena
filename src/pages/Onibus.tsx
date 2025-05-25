
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
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

  const handleEdit = (onibus: any) => {
    navigate(`/dashboard/editar-onibus/${onibus.id}`);
  };

  const handleDeleteOnibus = (onibus: any) => {
    handleDelete(onibus.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
              Catálogo de Ônibus
            </h1>
            <p className="text-gray-600 mt-2">Gerencie todos os modelos de ônibus da sua frota</p>
          </div>
          <Button 
            onClick={() => navigate("/dashboard/cadastrar-onibus")}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-professional hover:shadow-professional-md transition-all duration-300"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Cadastrar Ônibus
          </Button>
        </div>

        <OnibusFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          tipoFilter={filterTipo || "all"}
          setTipoFilter={setFilterTipo}
          empresaFilter={filterEmpresa || "all"}
          setEmpresaFilter={setFilterEmpresa}
          clearFilters={clearFilters}
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
                    onEdit={handleEdit}
                    onDelete={handleDeleteOnibus}
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
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
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
  );
};

export default Onibus;
