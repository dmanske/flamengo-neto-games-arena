
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
  TableRow 
} from "@/components/ui/table";
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Search, Trash2, Pencil, Eye, PlusCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Link, useNavigate } from "react-router-dom";

interface Viagem {
  id: string;
  data_jogo: string;
  adversario: string;
  rota: string;
  valor_padrao: number | null;
  empresa: string;
  tipo_onibus: string;
  status_viagem: string;
  logo_flamengo: string | null;
  logo_adversario: string | null;
}

const Viagens = () => {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [viagemToDelete, setViagemToDelete] = useState<Viagem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  // Fetch viagens
  useEffect(() => {
    fetchViagens();
  }, []);

  const fetchViagens = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('viagens')
        .select('*')
        .order('data_jogo', { ascending: false });

      if (filterStatus) {
        query = query.eq('status_viagem', filterStatus);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setViagens(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar viagens:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados das viagens",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const filteredViagens = viagens.filter((viagem) => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    
    return (
      viagem.adversario.toLowerCase().includes(term) ||
      viagem.rota.toLowerCase().includes(term) ||
      format(new Date(viagem.data_jogo), 'dd/MM/yyyy', { locale: ptBR }).includes(term)
    );
  });

  // Delete viagem
  const handleDeleteViagem = async () => {
    if (!viagemToDelete) return;
    
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('viagens')
        .delete()
        .eq('id', viagemToDelete.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setViagens(viagens.filter(v => v.id !== viagemToDelete.id));
      toast({
        title: "Sucesso",
        description: `Viagem contra ${viagemToDelete.adversario} removida com sucesso`,
      });
      setViagemToDelete(null);
    } catch (err: any) {
      console.error('Erro ao excluir viagem:', err);
      toast({
        title: "Erro",
        description: `Erro ao excluir viagem: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Format value
  const formatValue = (value: number | null) => {
    if (value === null) return 'N/A';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aberta':
        return 'text-green-700 bg-green-100';
      case 'fechada':
        return 'text-red-700 bg-red-100';
      case 'concluída':
        return 'text-blue-700 bg-blue-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Viagens Cadastradas</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start">
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar viagem..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={filterStatus || "todos"}
            onValueChange={(value) => setFilterStatus(value === "todos" ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="Aberta">Aberta</SelectItem>
              <SelectItem value="Fechada">Fechada</SelectItem>
              <SelectItem value="Concluída">Concluída</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={() => navigate("/dashboard/cadastrar-viagem")}
          className="bg-primary hover:bg-primary/90 w-full md:w-auto"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Viagem
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Lista de Viagens</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Carregando viagens...</span>
            </div>
          ) : filteredViagens.length === 0 ? (
            <div className="py-8 text-center">
              {searchTerm || filterStatus ? (
                <p className="text-gray-500">Nenhuma viagem encontrada com esses critérios de busca.</p>
              ) : (
                <p className="text-gray-500">Nenhuma viagem cadastrada ainda.</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Adversário</TableHead>
                    <TableHead>Rota</TableHead>
                    <TableHead>Valor Padrão</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredViagens.map((viagem) => (
                    <TableRow key={viagem.id}>
                      <TableCell className="font-medium">{formatDate(viagem.data_jogo)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {viagem.logo_adversario && (
                            <img 
                              src={viagem.logo_adversario} 
                              alt={viagem.adversario} 
                              className="h-6 w-6 object-contain" 
                            />
                          )}
                          {viagem.adversario}
                        </div>
                      </TableCell>
                      <TableCell>{viagem.rota}</TableCell>
                      <TableCell>{formatValue(viagem.valor_padrao)}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viagem.status_viagem)}`}>
                          {viagem.status_viagem}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            asChild
                          >
                            <Link to={`/dashboard/viagem/${viagem.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Ver</span>
                            </Link>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            asChild
                          >
                            <Link to={`/dashboard/viagem/${viagem.id}/editar`}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setViagemToDelete(viagem)}
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
                                  Tem certeza que deseja excluir a viagem contra {viagemToDelete?.adversario}? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={handleDeleteViagem}
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

export default Viagens;
