
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ArrowLeft, CalendarIcon, Bus, MapPin, 
  Users, Pencil, Trash2, PlusCircle, Search, X, CreditCard
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PassageiroDialog } from "@/components/detalhes-viagem/PassageiroDialog";
import { PassageiroEditDialog } from "@/components/detalhes-viagem/PassageiroEditDialog";
import { PassageiroDeleteDialog } from "@/components/detalhes-viagem/PassageiroDeleteDialog";
import { FinancialSummary } from "@/components/detalhes-viagem/FinancialSummary";

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
  valor_padrao: number | null;
  setor_padrao: string | null;
}

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
  cpf: string;
  email: string;
}

interface ViagemPassageiro {
  id: string;
  viagem_id: string;
  cliente_id: string;
  setor_maracana: string;
  status_pagamento: string;
  created_at: string;
  valor: number | null;
  cliente?: Cliente;
}

interface PassageiroDisplay {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
  setor_maracana: string;
  status_pagamento: string;
  cpf: string;
  cliente_id: string;
  viagem_passageiro_id: string;
  valor: number | null;
}

const DetalhesViagem = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [viagem, setViagem] = useState<Viagem | null>(null);
  const [passageiros, setPassageiros] = useState<PassageiroDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addPassageiroOpen, setAddPassageiroOpen] = useState(false);
  const [editPassageiroOpen, setEditPassageiroOpen] = useState(false);
  const [deletePassageiroOpen, setDeletePassageiroOpen] = useState(false);
  const [selectedPassageiro, setSelectedPassageiro] = useState<PassageiroDisplay | null>(null);
  
  // Financeiro
  const [totalArrecadado, setTotalArrecadado] = useState<number>(0);
  const [totalPago, setTotalPago] = useState<number>(0);
  const [totalPendente, setTotalPendente] = useState<number>(0);

  useEffect(() => {
    const fetchViagem = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Carregar dados da viagem
        const { data: viagemData, error: viagemError } = await supabase
          .from("viagens")
          .select("*")
          .eq("id", id)
          .single();
        
        if (viagemError) throw viagemError;
        setViagem(viagemData);
        
        // Carregar passageiros da viagem
        await fetchPassageiros(id);
        
      } catch (err) {
        console.error("Erro ao buscar detalhes da viagem:", err);
        toast.error("Erro ao carregar detalhes da viagem");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchViagem();
  }, [id]);

  const fetchPassageiros = async (viagemId: string) => {
    try {
      // Buscar passageiros da viagem com dados do cliente
      const { data, error } = await supabase
        .from("viagem_passageiros")
        .select(`
          id,
          viagem_id,
          cliente_id,
          setor_maracana,
          status_pagamento,
          valor,
          created_at,
          clientes:cliente_id (id, nome, telefone, cidade, cpf)
        `)
        .eq("viagem_id", viagemId);
      
      if (error) throw error;
      
      // Formatar os dados para exibição
      const formattedPassageiros: PassageiroDisplay[] = (data || []).map((item: any) => ({
        id: item.clientes.id,
        nome: item.clientes.nome,
        telefone: item.clientes.telefone,
        cidade: item.clientes.cidade,
        cpf: item.clientes.cpf,
        setor_maracana: item.setor_maracana,
        status_pagamento: item.status_pagamento,
        cliente_id: item.cliente_id,
        viagem_passageiro_id: item.id,
        valor: item.valor || 0,
      }));
      
      setPassageiros(formattedPassageiros);
      
      // Calcular resumo financeiro
      let arrecadado = 0;
      let pago = 0;
      let pendente = 0;
      
      formattedPassageiros.forEach(passageiro => {
        const valor = passageiro.valor || 0;
        arrecadado += valor;
        
        if (passageiro.status_pagamento === "Pago") {
          pago += valor;
        } else {
          pendente += valor;
        }
      });
      
      setTotalArrecadado(arrecadado);
      setTotalPago(pago);
      setTotalPendente(pendente);
      
    } catch (err) {
      console.error("Erro ao buscar passageiros:", err);
      toast.error("Erro ao carregar passageiros");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      
      // Chamar a função delete_viagem que criamos
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

  const openEditPassageiroDialog = (passageiro: PassageiroDisplay) => {
    setSelectedPassageiro(passageiro);
    setEditPassageiroOpen(true);
  };

  const openDeletePassageiroDialog = (passageiro: PassageiroDisplay) => {
    setSelectedPassageiro(passageiro);
    setDeletePassageiroOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  // Formatar valor para exibição em reais
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular percentual de pagamentos
  const calcularPercentualPagamento = () => {
    if (totalArrecadado === 0) return 0;
    return Math.round((totalPago / totalArrecadado) * 100);
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
                        src={viagem.logo_flamengo || "https://logodetimes.com/wp-content/uploads/flamengo.png"} 
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
                {viagem.setor_padrao && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Setor Padrão:</span>
                    <span>{viagem.setor_padrao}</span>
                  </div>
                )}
                {viagem.valor_padrao !== null && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Valor Padrão:</span>
                    <span>{formatCurrency(viagem.valor_padrao)}</span>
                  </div>
                )}
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

      {passageiros.length > 0 && (
        <div className="mb-6">
          <FinancialSummary
            totalArrecadado={totalArrecadado}
            totalPago={totalPago}
            totalPendente={totalPendente}
            percentualPagamento={calcularPercentualPagamento()}
            totalPassageiros={passageiros.length}
          />
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Lista de Passageiros</CardTitle>
            <CardDescription>
              {passageiros.length > 0 
                ? `${passageiros.length}/${viagem.capacidade_onibus} passageiros confirmados` 
                : "Nenhum passageiro confirmado"}
            </CardDescription>
          </div>
          <Button onClick={() => setAddPassageiroOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar Passageiro
          </Button>
        </CardHeader>
        <CardContent>
          {passageiros.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Setor Maracanã</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {passageiros.map((passageiro) => (
                    <TableRow key={passageiro.viagem_passageiro_id}>
                      <TableCell>{passageiro.nome}</TableCell>
                      <TableCell>{passageiro.telefone}</TableCell>
                      <TableCell>{passageiro.cidade}</TableCell>
                      <TableCell>{passageiro.cpf}</TableCell>
                      <TableCell>{passageiro.setor_maracana}</TableCell>
                      <TableCell>{formatCurrency(passageiro.valor)}</TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            passageiro.status_pagamento === "Pago" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-amber-100 text-amber-800"
                          }
                        >
                          {passageiro.status_pagamento}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => openEditPassageiroDialog(passageiro)}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-destructive" 
                            onClick={() => openDeletePassageiroDialog(passageiro)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remover
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Users className="h-12 w-12 mb-2 text-muted-foreground/50" />
              <p>Nenhum passageiro cadastrado para esta viagem</p>
              <p className="text-sm">Cadastre passageiros para esta viagem</p>
              <Button className="mt-4" onClick={() => setAddPassageiroOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar Passageiro
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {passageiros.length > 0 && (
              `Ocupação: ${passageiros.length} de ${viagem.capacidade_onibus} lugares (${Math.round(passageiros.length / viagem.capacidade_onibus * 100)}%)`
            )}
          </div>
          <Button variant="outline">Exportar Lista</Button>
        </CardFooter>
      </Card>

      {/* Modais para gerenciar passageiros */}
      <PassageiroDialog 
        open={addPassageiroOpen} 
        onOpenChange={setAddPassageiroOpen} 
        viagemId={id || ""} 
        onSuccess={() => id && fetchPassageiros(id)}
        valorPadrao={viagem.valor_padrao}
        setorPadrao={viagem.setor_padrao}
      />
      
      <PassageiroEditDialog
        open={editPassageiroOpen}
        onOpenChange={setEditPassageiroOpen}
        passageiro={selectedPassageiro}
        onSuccess={() => id && fetchPassageiros(id)}
      />

      <PassageiroDeleteDialog
        open={deletePassageiroOpen}
        onOpenChange={setDeletePassageiroOpen}
        passageiro={selectedPassageiro}
        onSuccess={() => id && fetchPassageiros(id)}
      />
    </div>
  );
};

export default DetalhesViagem;
