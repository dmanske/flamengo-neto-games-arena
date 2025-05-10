
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Plus, Search, Users, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { Cliente } from "@/types/entities";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Clientes = () => {
  // States for filtering and the delete dialog
  const [filterNome, setFilterNome] = useState("");
  const [filterCidade, setFilterCidade] = useState("");
  const [filterDocumento, setFilterDocumento] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Cliente | null>(null);
  
  // States for client data
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Fetch clients from database
  useEffect(() => {
    fetchClientes();
  }, [currentPage, filterNome, filterCidade, filterDocumento]);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query with filters
      let query = supabase
        .from('clientes')
        .select('*', { count: 'exact' });

      // Apply filters if they exist
      if (filterNome) {
        query = query.ilike('nome', `%${filterNome}%`);
      }
      if (filterCidade) {
        query = query.ilike('cidade', `%${filterCidade}%`);
      }
      if (filterDocumento) {
        query = query.ilike('cpf', `%${filterDocumento}%`);
      }

      // Add pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      // Execute query
      const { data, error, count } = await query;

      if (error) throw error;

      setClientes(data || []);
      
      // Update total pages
      if (count !== null) {
        setTotalPages(Math.ceil(count / itemsPerPage));
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Erro ao carregar clientes. Tente novamente.');
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  // Handle client deletion
  const handleDeleteClick = (client: Cliente) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;

    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clientToDelete.id);

      if (error) throw error;

      toast.success('Cliente excluído com sucesso');
      
      // Refetch clients after deletion
      fetchClientes();
    } catch (err) {
      console.error('Error deleting client:', err);
      toast.error('Erro ao excluir cliente');
    } finally {
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Format CPF for display (000.000.000-00)
  const formatCPF = (cpf: string) => {
    // Remove any non-digit character
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Return formatted or original if not matching pattern
    if (cleanCPF.length !== 11) return cpf;
    
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clientes Cadastrados</h1>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link to="/cadastrar-cliente">
            <Plus className="mr-2 h-4 w-4" /> Novo Cliente
          </Link>
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtrar Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Buscar por nome..." 
                className="w-full pl-9" 
                value={filterNome}
                onChange={(e) => setFilterNome(e.target.value)}
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Buscar por cidade..." 
                className="w-full pl-9" 
                value={filterCidade}
                onChange={(e) => setFilterCidade(e.target.value)}
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Buscar por CPF..." 
                className="w-full pl-9" 
                value={filterDocumento}
                onChange={(e) => setFilterDocumento(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Data de Nascimento</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <p className="mt-2 text-sm text-muted-foreground">Carregando clientes...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-red-500">{error}</p>
                        <Button 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => fetchClientes()}
                        >
                          Tentar novamente
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : clientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="h-12 w-12 mb-2 text-muted-foreground/50" />
                        <p className="text-muted-foreground">Nenhum cliente encontrado</p>
                        <p className="text-sm text-muted-foreground">Clique em "Novo Cliente" para cadastrar</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  clientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nome}</TableCell>
                      <TableCell>{cliente.telefone}</TableCell>
                      <TableCell>{cliente.email}</TableCell>
                      <TableCell>{cliente.cidade}/{cliente.estado}</TableCell>
                      <TableCell>{formatCPF(cliente.cpf)}</TableCell>
                      <TableCell>{formatDate(cliente.data_nascimento)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button size="sm" variant="outline">
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-500"
                            onClick={() => handleDeleteClick(cliente)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {!loading && !error && clientes.length > 0 && (
            <div className="flex justify-between items-center p-4 border-t">
              <div>Mostrando {clientes.length} de {totalPages * itemsPerPage} resultados</div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                    // Calculate page number to display, handling when current page is near the end
                    let pageNum = currentPage <= 3 
                      ? index + 1 
                      : currentPage + index - 2;
                    
                    // Adjust for edge cases
                    if (pageNum > totalPages) return null;
                    if (currentPage > 3 && index === 0) pageNum = 1;
                    if (currentPage > 3 && index === 1 && currentPage > 4) 
                      return (
                        <PaginationItem key="ellipsis-start">
                          <span className="px-2">...</span>
                        </PaginationItem>
                      );
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink 
                          isActive={currentPage === pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <span className="px-2">...</span>
                    </PaginationItem>
                  )}
                  
                  {totalPages > 5 && currentPage < totalPages - 1 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente?
              {clientToDelete && (
                <div className="mt-2 font-medium">{clientToDelete.nome}</div>
              )}
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteConfirm}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Clientes;
