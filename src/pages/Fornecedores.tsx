import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
import { toast } from "sonner";
import { useFornecedores } from "@/hooks/useFornecedores";
import { FornecedorCard } from "@/components/fornecedores/FornecedorCard";
import { FornecedorFilters } from "@/components/fornecedores/FornecedorFilters";
import { Fornecedor, TipoFornecedor } from "@/types/fornecedores";

const Fornecedores = () => {
  const navigate = useNavigate();
  const {
    fornecedores,
    loading,
    error,
    deleteFornecedor,
    filterFornecedores,
    getCountByTipo
  } = useFornecedores();

  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<TipoFornecedor | 'todos'>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [fornecedorToDelete, setFornecedorToDelete] = useState<Fornecedor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  
  const ITEMS_PER_PAGE = 30;

  // Filtrar fornecedores
  const filteredFornecedores = filterFornecedores(searchTerm, tipoFiltro);

  // Paginação
  const totalPages = Math.ceil(filteredFornecedores.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentFornecedores = filteredFornecedores.slice(startIndex, endIndex);

  // Contadores por tipo
  const contadores = getCountByTipo();

  // Reset para primeira página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, tipoFiltro]);

  // Handlers
  const handleEdit = (fornecedor: Fornecedor) => {
    navigate(`/dashboard/fornecedores/${fornecedor.id}/editar`);
  };



  const handleDeleteFornecedor = async () => {
    if (!fornecedorToDelete) return;

    try {
      setIsDeleting(true);
      const success = await deleteFornecedor(fornecedorToDelete.id);
      
      if (success) {
        setFornecedorToDelete(null);
      }
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando fornecedores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro: {error}</p>
          <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Fornecedores
              </h1>
              <p className="text-sm text-gray-500">
                {filteredFornecedores.length} fornecedores
                {totalPages > 1 && (
                  <span className="ml-2">• Página {currentPage} de {totalPages}</span>
                )}
              </p>
            </div>

            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4"
              asChild
            >
              <Link to="/dashboard/fornecedores/cadastrar">
                <UserPlus className="h-4 w-4 mr-1" />
                Novo
              </Link>
            </Button>
          </div>

          {/* Filtros */}
          <FornecedorFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            tipoSelecionado={tipoFiltro}
            onTipoChange={setTipoFiltro}
            contadores={contadores}
            totalFiltrados={filteredFornecedores.length}
            totalGeral={fornecedores.length}
          />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {filteredFornecedores.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            {searchTerm || tipoFiltro !== 'todos' ? (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum fornecedor encontrado
                </h3>
                <p className="text-gray-500 mb-4">
                  Tente ajustar os filtros ou adicione um novo fornecedor.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setTipoFiltro('todos');
                    }}
                  >
                    Limpar filtros
                  </Button>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link to="/dashboard/fornecedores/cadastrar">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Novo fornecedor
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum fornecedor ainda
                </h3>
                <p className="text-gray-500 mb-4">
                  Comece adicionando seu primeiro fornecedor.
                </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link to="/dashboard/fornecedores/cadastrar">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar fornecedor
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Lista de fornecedores */}
            <div className="space-y-3">
              {currentFornecedores.map((fornecedor) => (
                <FornecedorCard
                  key={fornecedor.id}
                  fornecedor={fornecedor}
                  onEdit={handleEdit}
                  onDelete={setFornecedorToDelete}
                />
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 px-4 py-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, filteredFornecedores.length)} de {filteredFornecedores.length} fornecedores
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber: number;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`h-8 w-8 p-0 ${currentPage === pageNumber
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : ""
                            }`}
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!fornecedorToDelete} onOpenChange={() => setFornecedorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o fornecedor <strong>{fornecedorToDelete?.nome}</strong>?
              Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFornecedor}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir Fornecedor'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


    </div>
  );
};

export default Fornecedores;