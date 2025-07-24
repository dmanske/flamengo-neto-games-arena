import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Loader2, 
  UserPlus, 
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  MoreVertical,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { formatPhone, formatCPF, formatBirthDate, formatarNomeComPreposicoes } from "@/utils/formatters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Cliente {
  id: number;
  nome: string;
  cidade: string;
  estado: string;
  telefone: string;
  email: string;
  cpf: string;
  data_nascimento: string | null;
  created_at: string;
  foto: string | null;
}

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const ITEMS_PER_PAGE = 30;

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        console.log('Buscando clientes...');
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .order('nome', { ascending: true }); // Ordem alfabética
        
        console.log('Resultado:', { data, error });
        
        if (error) {
          throw error;
        }
        
        setClientes(data || []);
      } catch (err: any) {
        console.error('Erro ao buscar clientes:', err);
        setError(err.message || 'Erro ao carregar os clientes');
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  // Filter clients
  const filteredClientes = clientes.filter(cliente => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      cliente.nome.toLowerCase().includes(term) ||
      cliente.cidade.toLowerCase().includes(term) ||
      cliente.telefone.includes(term) ||
      cliente.email.toLowerCase().includes(term)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredClientes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentClientes = filteredClientes.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Handle delete cliente
  const handleDeleteCliente = async () => {
    if (!clienteToDelete) return;
    
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clienteToDelete.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setClientes(clientes.filter(c => c.id !== clienteToDelete.id));
      toast.success(`Cliente ${clienteToDelete.nome} removido com sucesso`);
      setClienteToDelete(null);
    } catch (err: any) {
      console.error('Erro ao excluir cliente:', err);
      toast.error(`Erro ao excluir cliente: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Get time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return diffInHours === 0 ? 'Agora' : `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays}d`;
      } else {
        return format(date, "dd/MM", { locale: ptBR });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando clientes...</p>
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
      {/* Mobile-style Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Clientes</h1>
              <p className="text-sm text-gray-500">
                {filteredClientes.length} contatos
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
              <Link to="/dashboard/cadastrar-cliente">
                <UserPlus className="h-4 w-4 mr-1" />
                Novo
              </Link>
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar contatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 rounded-full focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {filteredClientes.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            {searchTerm ? (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum contato encontrado
                </h3>
                <p className="text-gray-500 mb-4">
                  Tente buscar por outro termo ou adicione um novo cliente.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm("")}
                  className="mr-2"
                >
                  Limpar busca
                </Button>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link to="/dashboard/cadastrar-cliente">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Novo cliente
                  </Link>
                </Button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum cliente ainda
                </h3>
                <p className="text-gray-500 mb-4">
                  Comece adicionando seu primeiro cliente.
                </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link to="/dashboard/cadastrar-cliente">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar cliente
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {currentClientes.map((cliente) => (
                <Card key={cliente.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-200 relative">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="relative">
                        <Avatar className="h-14 w-14">
                          {cliente.foto ? (
                            <AvatarImage 
                              src={cliente.foto} 
                              alt={cliente.nome}
                              className="object-cover"
                            />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                              {cliente.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        {/* Online indicator (fake for demo) */}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      
                      {/* Main Content - Clicável */}
                      <Link to={`/dashboard/clientes/${cliente.id}`} className="flex-1 min-w-0 cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {formatarNomeComPreposicoes(cliente.nome)}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {getTimeAgo(cliente.created_at)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Contact Info */}
                        <div className="space-y-1">
                          {cliente.telefone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-3 w-3 mr-2 text-green-600" />
                              <span>{formatPhone(cliente.telefone)}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-3 w-3 mr-2 text-blue-600" />
                              <span>{cliente.cidade}, {cliente.estado}</span>
                            </div>
                            
                            {cliente.email && (
                              <Badge variant="secondary" className="text-xs">
                                <Mail className="h-3 w-3 mr-1" />
                                Email
                              </Badge>
                            )}
                          </div>
                          
                          {cliente.data_nascimento && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-3 w-3 mr-2" />
                              <span>Nascimento: {formatBirthDate(cliente.data_nascimento)}</span>
                            </div>
                          )}
                        </div>
                      </Link>
                      
                      {/* Dropdown menu - posicionado absolutamente */}
                      <div className="absolute top-2 right-2 z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-gray-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/dashboard/clientes/${cliente.id}/editar`} className="flex items-center">
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => setClienteToDelete(cliente)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 px-4 py-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, filteredClientes.length)} de {filteredClientes.length} clientes
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
                          className={`h-8 w-8 p-0 ${
                            currentPage === pageNumber 
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!clienteToDelete} onOpenChange={() => setClienteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente <strong>{clienteToDelete?.nome}</strong>? 
              Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCliente}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir Cliente'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Clientes;