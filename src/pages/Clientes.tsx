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
  ChevronRight,
  MessageSquare,
  CreditCard
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

  // Filter clients - usando a mesma lógica da página de detalhes da viagem
  const filteredClientes = clientes.filter(cliente => {
    const searchTermTrimmed = searchTerm.trim();
    
    if (!searchTermTrimmed) return true;
    
    // Suporte para múltiplos termos separados por espaço
    const searchTerms = searchTermTrimmed.toLowerCase().split(' ').filter(term => term.length > 0);
    
    // Dados do cliente
    const nome = cliente.nome || '';
    const telefone = cliente.telefone || '';
    const email = cliente.email || '';
    const cpf = cliente.cpf || '';
    const cidade = cliente.cidade || '';
    const estado = cliente.estado || '';
    
    // Data de nascimento formatada para busca
    const dataNascimento = cliente.data_nascimento || '';
    const dataNascimentoFormatada = dataNascimento ? new Date(dataNascimento).toLocaleDateString('pt-BR') : '';
    
    // Texto completo para busca
    const fullText = [
      nome, telefone, email, cpf, cidade, estado, dataNascimentoFormatada
    ].join(' ').toLowerCase();
    
    // Todos os termos devem estar presentes (busca AND)
    return searchTerms.every(term => fullText.includes(term));
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
              placeholder="Buscar por nome, cidade, telefone, email ou CPF..."
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
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <div className="flex items-center">
                                <Phone className="h-3 w-3 mr-2 text-green-600" />
                                <span>{formatPhone(cliente.telefone)}</span>
                              </div>
                              {/* Botão WhatsApp ao lado do telefone */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-green-50 text-green-600 ml-2"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const telefone = cliente.telefone.replace(/\D/g, '');
                                  const mensagem = `Olá ${cliente.nome.split(' ')[0]}! Aqui é da equipe do Flamengo Viagens. Como posso ajudá-lo?`;
                                  const url = `https://web.whatsapp.com/send?phone=55${telefone}&text=${encodeURIComponent(mensagem)}`;
                                  window.open(url, '_blank');
                                }}
                                title="Enviar WhatsApp"
                              >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                </svg>
                              </Button>
                            </div>
                          )}

                          {cliente.cpf && (
                            <div className="flex items-center text-sm text-gray-600">
                              <CreditCard className="h-3 w-3 mr-2 text-purple-600" />
                              <span>{formatCPF(cliente.cpf)}</span>
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

                      {/* Botões de ação - posicionados absolutamente */}
                      <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1">
                        {/* Dropdown menu */}
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