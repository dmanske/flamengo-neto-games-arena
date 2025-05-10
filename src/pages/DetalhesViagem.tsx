
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ArrowLeft, CalendarIcon, Bus, MapPin, 
  Users, Pencil, Trash2, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors = {
  "Aberta": "bg-green-100 text-green-800",
  "Em Andamento": "bg-blue-100 text-blue-800",
  "Finalizada": "bg-gray-100 text-gray-800",
};

interface Viagem {
  id: string;
  adversario: string;
  data_jogo: string;
  tipo_onibus: string;
  empresa: string;
  rota: string;
  capacidade_onibus: number;
  status_viagem: string;
  created_at: string;
  logo_adversario: string | null;
  logo_flamengo: string | null;
}

interface Passageiro {
  id: string;
  nome: string;
  telefone: string;
  cidade_embarque: string;
  setor_maracana: string;
  status_pagamento: string;
}

const DetalhesViagem = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [viagem, setViagem] = useState<Viagem | null>(null);
  const [passageiros, setPassageiros] = useState<Passageiro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchViagem = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("viagens")
          .select("*")
          .eq("id", id)
          .single();
        
        if (error) {
          throw error;
        }
        
        setViagem(data);
        
        // Simulated passageiros data - in a real app we would fetch this from a database
        // This is just for demonstration purposes
        setPassageiros([
          {
            id: "1",
            nome: "João Silva",
            telefone: "(21) 99999-9999",
            cidade_embarque: "Rio de Janeiro",
            setor_maracana: "Norte",
            status_pagamento: "Pago"
          },
          {
            id: "2",
            nome: "Maria Santos",
            telefone: "(21) 98888-8888",
            cidade_embarque: "Niterói",
            setor_maracana: "Sul",
            status_pagamento: "Pendente"
          }
        ]);
      } catch (err) {
        console.error("Erro ao buscar detalhes da viagem:", err);
        toast.error("Erro ao carregar detalhes da viagem");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchViagem();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      
      // Call the delete_viagem function we created
      const { error } = await supabase
        .rpc('delete_viagem', { viagem_id: id });
      
      if (error) {
        throw error;
      }
      
      toast.success("Viagem excluída com sucesso!");
      navigate("/viagens");
    } catch (err) {
      console.error("Erro ao excluir viagem:", err);
      toast.error("Erro ao excluir viagem");
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="mb-6">
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (!viagem) {
    return (
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Viagem não encontrada</h1>
        <p>A viagem que você está procurando não existe ou foi removida.</p>
        <Button asChild className="mt-4">
          <Link to="/viagens">Voltar para Viagens</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link to="/viagens">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Detalhes da Caravana</h1>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <Badge className={statusColors[viagem.status_viagem as keyof typeof statusColors] || "bg-gray-100"}>
                {viagem.status_viagem}
              </Badge>
              <CardTitle className="text-2xl mt-2">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-4">
                    <Avatar className="h-12 w-12 border-2 border-white">
                      <AvatarImage 
                        src={viagem.logo_flamengo || "https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png"} 
                        alt="Flamengo" 
                      />
                      <AvatarFallback>FLA</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-12 w-12 border-2 border-white">
                      <AvatarImage 
                        src={viagem.logo_adversario || `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3)}`}
                        alt={viagem.adversario}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3).toUpperCase()}`;
                        }}
                      />
                      <AvatarFallback>{viagem.adversario.substring(0, 3).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                  <span>Flamengo x {viagem.adversario}</span>
                </div>
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to={`/editar-viagem/${viagem.id}`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </Button>
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir esta viagem? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Informações da Viagem</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Data do Jogo:</span>
                  <span>{formatDate(viagem.data_jogo)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Rota:</span>
                  <span>{viagem.rota}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Informações do Ônibus</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Bus className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Tipo:</span>
                  <span>{viagem.tipo_onibus}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium">Empresa:</span>
                  <span>{viagem.empresa}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Capacidade:</span>
                  <span>{viagem.capacidade_onibus} passageiros</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Passageiros</CardTitle>
          <CardDescription>
            {passageiros.length > 0 
              ? `${passageiros.length} passageiros confirmados` 
              : "Nenhum passageiro confirmado"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {passageiros.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Nome</th>
                    <th className="text-left p-2">Telefone</th>
                    <th className="text-left p-2">Cidade</th>
                    <th className="text-left p-2">Setor Maracanã</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-right p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {passageiros.map((passageiro) => (
                    <tr key={passageiro.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{passageiro.nome}</td>
                      <td className="p-2">{passageiro.telefone}</td>
                      <td className="p-2">{passageiro.cidade_embarque}</td>
                      <td className="p-2">{passageiro.setor_maracana}</td>
                      <td className="p-2">
                        <Badge 
                          className={
                            passageiro.status_pagamento === "Pago" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-amber-100 text-amber-800"
                          }
                        >
                          {passageiro.status_pagamento}
                        </Badge>
                      </td>
                      <td className="p-2 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline">
                            Remover
                          </Button>
                          <Button size="sm" variant="outline">
                            Editar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Users className="h-12 w-12 mb-2 text-muted-foreground/50" />
              <p>Nenhum passageiro cadastrado para esta viagem</p>
              <p className="text-sm">Cadastre passageiros para esta viagem</p>
              <Button className="mt-4">Adicionar Passageiro</Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline">Exportar Lista</Button>
        </CardFooter>
      </Card>

      {/* Flamengo Logo Section */}
      <div className="flex justify-center items-center my-8">
        <img 
          src={viagem.logo_flamengo || "https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png"}
          alt="Logo do Flamengo"
          className="h-32 w-auto"
        />
      </div>
    </div>
  );
};

export default DetalhesViagem;
