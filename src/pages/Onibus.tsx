
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Catálogo de Ônibus</h1>
        <Button onClick={() => navigate("/dashboard/cadastrar-onibus")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Cadastrar Ônibus
        </Button>
      </div>

      <OnibusFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterEmpresa={filterEmpresa}
        setFilterEmpresa={setFilterEmpresa}
        filterTipo={filterTipo}
        setFilterTipo={setFilterTipo}
        empresas={empresas}
        tipos={tipos}
      />

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
                <OnibusCard
                  key={onibus.id}
                  id={onibus.id}
                  tipo_onibus={onibus.tipo_onibus}
                  empresa={onibus.empresa}
                  numero_identificacao={onibus.numero_identificacao}
                  capacidade={onibus.capacidade}
                  description={onibus.description}
                  image_url={onibus.image_url}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este ônibus? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Sim, remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Onibus;
