import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Search, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { formatPhone, formatCPF, formatBirthDate } from "@/utils/formatters";
import { fixExistingDates } from "@/utils/fixDates";

// Type for the cliente object
interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  data_nascimento: string | null;
  endereco: string;
  cidade: string;
  estado: string;
  created_at: string;
  foto: string | null;
}

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState<"nome" | "cidade" | "cpf">("nome");
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPhotos, setShowPhotos] = useState(true);
  const [isFixingDates, setIsFixingDates] = useState(false);

  // Fetch clientes from Supabase
  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome', { ascending: true }); // Changed to order by 'nome' ascending
      
      if (error) {
        throw error;
      }
      
      setClientes(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar clientes:', err);
      setError(err.message || 'Erro ao carregar os clientes');
      toast.error('Erro ao carregar dados de clientes');
    } finally {
      setLoading(false);
    }
  };
  
  // Load clientes on component mount
  useEffect(() => {
    fetchClientes();
  }, []);
  
  // Search functionality
  const filteredClientes = clientes.filter((cliente) => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    
    switch (searchField) {
      case "nome":
        return cliente.nome.toLowerCase().includes(term);
      case "cidade":
        return cliente.cidade.toLowerCase().includes(term);
      case "cpf":
        return cliente.cpf.replace(/[^\d]/g, '').includes(term.replace(/[^\d]/g, ''));
      default:
        return true;
    }
  });

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

  // Handle fix dates
  const handleFixDates = async () => {
    try {
      setIsFixingDates(true);
      const result = await fixExistingDates();
      if (result) {
        const message = `Correção concluída: ${result.corrected} datas corrigidas, ${result.skipped || 0} já estavam corretas`;
        if (result.errors > 0) {
          toast.warning(`${message}, ${result.errors} erros encontrados`);
        } else {
          toast.success(message);
        }
        // Recarregar a lista de clientes
        await fetchClientes();
      }
    } catch (error: any) {
      console.error('Erro ao corrigir datas:', error);
      toast.error('Erro ao corrigir datas: ' + error.message);
    } finally {
      setIsFixingDates(false);
    }
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Clientes Cadastrados</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start">
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={`Buscar por ${searchField === "nome" ? "nome" : searchField === "cidade" ? "cidade" : "CPF"}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={searchField === "nome" ? "default" : "outline"} 
              onClick={() => setSearchField("nome")}
              size="sm"
            >
              Nome
            </Button>
            <Button 
              variant={searchField === "cidade" ? "default" : "outline"} 
              onClick={() => setSearchField("cidade")}
              size="sm"
            >
              Cidade
            </Button>
            <Button 
              variant={searchField === "cpf" ? "default" : "outline"} 
              onClick={() => setSearchField("cpf")}
              size="sm"
            >
              CPF
            </Button>
          </div>
        </div>
        <div className="flex gap-4 items-center w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-photos"
              checked={showPhotos}
              onCheckedChange={setShowPhotos}
            />
            <label htmlFor="show-photos" className="text-sm font-medium cursor-pointer">
              Mostrar fotos
            </label>
          </div>
          <Button 
            onClick={handleFixDates}
            disabled={isFixingDates}
            variant="outline"
            className="w-full md:w-auto"
          >
            {isFixingDates ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Corrigindo...
              </>
            ) : (
              'Corrigir Datas'
            )}
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 w-full md:w-auto"
            asChild
          >
            <Link to="/dashboard/cadastrar-cliente">
              Cadastrar Novo Cliente
            </Link>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="section-title mb-0">Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Carregando clientes...</span>
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-red-500">{error}</p>
              <Button onClick={fetchClientes} className="mt-4">Tentar Novamente</Button>
            </div>
          ) : filteredClientes.length === 0 ? (
            <div className="py-8 text-center">
              {searchTerm ? (
                <p className="text-gray-500">Nenhum cliente encontrado com esses critérios de busca.</p>
              ) : (
                <p className="text-gray-500">Nenhum cliente cadastrado ainda.</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {showPhotos && <TableHead className="text-center">Foto</TableHead>}
                    <TableHead className="text-center">Nome</TableHead>
                    <TableHead className="text-center">Telefone</TableHead>
                    <TableHead className="text-center">Email</TableHead>
                    <TableHead className="text-center">Cidade/Estado</TableHead>
                    <TableHead className="text-center">CPF</TableHead>
                    <TableHead className="text-center">Data Nasc.</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      {showPhotos && (
                        <TableCell className="text-center">
                          <Avatar className="mx-auto h-12 w-12 border-2 border-primary/20">
                            {cliente.foto ? (
                              <AvatarImage 
                                src={cliente.foto} 
                                alt={cliente.nome}
                                className="object-cover"
                              />
                            ) : (
                              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                                {cliente.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </TableCell>
                      )}
                      <TableCell className="font-cinzel font-semibold text-center text-rome-navy">{cliente.nome}</TableCell>
                      <TableCell className="font-cinzel font-semibold text-center text-black whitespace-nowrap">{formatPhone(cliente.telefone)}</TableCell>
                      <TableCell className="font-cinzel font-semibold text-center text-black">{(cliente.email || '').toLowerCase()}</TableCell>
                      <TableCell className="font-cinzel font-semibold text-center text-black">{cliente.cidade}/{cliente.estado}</TableCell>
                      <TableCell className="font-cinzel font-semibold text-center text-black">{formatCPF(cliente.cpf)}</TableCell>
                      <TableCell className="font-cinzel font-semibold text-center text-black">{formatBirthDate(cliente.data_nascimento)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            asChild
                          >
                            <Link to={`/dashboard/clientes/${cliente.id}/editar`}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setClienteToDelete(cliente)}
                                className="text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Excluir</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o cliente {clienteToDelete?.nome}? Esta ação não pode ser desfeita.
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
                                    'Excluir'
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Clientes;
