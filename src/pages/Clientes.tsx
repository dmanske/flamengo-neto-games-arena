
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Plus, Search, Edit, Eye, Trash2 } from "lucide-react";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Cliente } from "@/types/entities";
import { toast } from "sonner";

const Clientes = () => {
  // States for filtering, pagination, and the delete dialog
  const [filterNome, setFilterNome] = useState("");
  const [filterCidade, setFilterCidade] = useState("");
  const [filterDocumento, setFilterDocumento] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Cliente | null>(null);

  // Mock data for clients
  const mockClientes: Cliente[] = [
    {
      id: "1",
      nome: "João da Silva",
      endereco: "Rua das Flores",
      numero: "123",
      bairro: "Centro",
      telefone: "(21) 98765-4321",
      cep: "20000-000",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      cpf: "123.456.789-00",
      data_nascimento: new Date("1990-05-15"),
      email: "joao@email.com",
      como_conheceu: "Instagram"
    },
    {
      id: "2",
      nome: "Maria Oliveira",
      endereco: "Av. Principal",
      numero: "456",
      bairro: "Copacabana",
      telefone: "(21) 91234-5678",
      cep: "22000-000",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      cpf: "987.654.321-00",
      data_nascimento: new Date("1985-10-20"),
      email: "maria@email.com",
      como_conheceu: "Indicação",
      indicacao_nome: "Pedro Sousa"
    },
    {
      id: "3",
      nome: "Pedro Santos",
      endereco: "Rua dos Coqueiros",
      numero: "789",
      bairro: "Ipanema",
      telefone: "(21) 99876-5432",
      cep: "23000-000",
      cidade: "Niterói",
      estado: "RJ",
      cpf: "456.789.123-00",
      data_nascimento: new Date("1978-03-25"),
      email: "pedro@email.com",
      como_conheceu: "Google"
    },
    {
      id: "4",
      nome: "Ana Pereira",
      endereco: "Rua Sete",
      numero: "321",
      bairro: "Tijuca",
      telefone: "(21) 96543-2109",
      cep: "24000-000",
      cidade: "São Gonçalo",
      estado: "RJ",
      cpf: "321.654.987-00",
      data_nascimento: new Date("1992-12-10"),
      email: "ana@email.com",
      como_conheceu: "Facebook"
    },
    {
      id: "5",
      nome: "Carlos Ferreira",
      endereco: "Av. Brasil",
      numero: "654",
      bairro: "Méier",
      telefone: "(21) 95432-1098",
      cep: "25000-000",
      cidade: "Duque de Caxias",
      estado: "RJ",
      cpf: "789.123.456-00",
      data_nascimento: new Date("1980-07-05"),
      email: "carlos@email.com",
      como_conheceu: "Outro",
      observacoes: "Conheceu através de um panfleto"
    },
  ];

  // Filter clients based on the filter inputs
  const filteredClientes = mockClientes.filter(cliente => {
    const nomeMatch = cliente.nome.toLowerCase().includes(filterNome.toLowerCase());
    const cidadeMatch = cliente.cidade.toLowerCase().includes(filterCidade.toLowerCase());
    const documentoMatch = cliente.cpf.toLowerCase().includes(filterDocumento.toLowerCase());
    return nomeMatch && cidadeMatch && documentoMatch;
  });

  // Handle delete confirmation
  const handleDeleteClick = (cliente: Cliente) => {
    setClientToDelete(cliente);
    setDeleteDialogOpen(true);
  };

  // Handle actual delete action
  const handleDeleteConfirm = () => {
    if (clientToDelete) {
      // In a real app, this would call an API to delete the client
      console.log(`Deleting client: ${clientToDelete.id}`);
      toast.success(`Cliente ${clientToDelete.nome} excluído com sucesso!`);
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Lista de Clientes</h1>
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
                {filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>{cliente.nome}</TableCell>
                    <TableCell>{cliente.telefone}</TableCell>
                    <TableCell>{cliente.email}</TableCell>
                    <TableCell>{cliente.cidade}</TableCell>
                    <TableCell>{cliente.cpf}</TableCell>
                    <TableCell>
                      {format(cliente.data_nascimento, 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/visualizar-cliente/${cliente.id}`}>
                            <Eye className="h-4 w-4 mr-1" /> 
                            Visualizar
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/editar-cliente/${cliente.id}`}>
                            <Edit className="h-4 w-4 mr-1" /> 
                            Editar
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500 border-red-500 hover:bg-red-50"
                          onClick={() => handleDeleteClick(cliente)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> 
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredClientes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                      Nenhum cliente encontrado com os filtros aplicados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-between items-center p-4 border-t">
            <div>Mostrando {filteredClientes.length} de {mockClientes.length} resultados</div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
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
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
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
