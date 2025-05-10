
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Plus, User, MapPin, Trash2 } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { toast } from "sonner";

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

const statusColors = {
  "Aberta": "bg-green-100 text-green-800",
  "Em Andamento": "bg-blue-100 text-blue-800",
  "Finalizada": "bg-gray-100 text-gray-800",
};

// Função para obter o logo do time
const getLogoTime = (time: string): string => {
  // Se o time estiver no nosso mapa de logos conhecidos, retorne o logo
  if (logosTimesConhecidos[time]) {
    return logosTimesConhecidos[time];
  }
  
  // Para times desconhecidos, tentamos escapar o nome para uso em uma URL
  const nomeTimeEscapado = encodeURIComponent(time);
  
  // Usamos uma estratégia de fallback para buscar logos:
  // 1. Tentamos uma imagem genérica baseada no nome do time
  return `https://www.thesportsdb.com/images/media/team/badge/small/${nomeTimeEscapado.toLowerCase().replace(/\s/g, '')}.png`;
};

const Viagens = () => {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [passageirosCount, setPassageirosCount] = useState<Record<string, number>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedViagemId, setSelectedViagemId] = useState<string | null>(null);

  useEffect(() => {
    const fetchViagens = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("viagens")
          .select("*")
          .order("data_jogo", { ascending: true });
        
        if (error) {
          throw error;
        }
        
        setViagens(data || []);
        
        // Fetch passenger counts for each trip
        if (data?.length) {
          const passageirosData: Record<string, number> = {};
          
          // In a real implementation, this would fetch actual passenger counts
          // For now, we'll simulate random counts
          data.forEach(viagem => {
            // This is a placeholder. In a real implementation, you would query the 
            // database for the actual count of passengers for each trip
            passageirosData[viagem.id] = Math.floor(Math.random() * viagem.capacidade_onibus);
          });
          
          setPassageirosCount(passageirosData);
        }
      } catch (err) {
        console.error("Erro ao buscar viagens:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchViagens();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };
  
  const handleDelete = async () => {
    if (!selectedViagemId) return;
    
    try {
      setIsLoading(true);
      
      // Call the delete_viagem function we created
      const { error } = await supabase
        .rpc('delete_viagem', { viagem_id: selectedViagemId });
      
      if (error) {
        throw error;
      }
      
      // Update the list by removing the deleted trip
      setViagens(viagens.filter(v => v.id !== selectedViagemId));
      toast.success("Viagem excluída com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir viagem:", err);
      toast.error("Erro ao excluir viagem");
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setSelectedViagemId(null);
    }
  };

  const openDeleteDialog = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedViagemId(id);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Viagens</h1>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link to="/cadastrar-viagem">
            <Plus className="mr-2 h-4 w-4" /> Nova Viagem
          </Link>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <p className="text-muted-foreground">Carregando viagens...</p>
        </div>
      ) : viagens.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-12 w-12 mb-3 text-muted-foreground/50" />
            <p className="text-lg font-medium">Nenhuma viagem cadastrada</p>
            <p className="text-muted-foreground mt-1">
              Clique em "Nova Viagem" para cadastrar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {viagens.map((viagem) => (
            <Card key={viagem.id} className="h-full transition-transform hover:-translate-y-1">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge className={statusColors[viagem.status_viagem as keyof typeof statusColors] || "bg-gray-100"}>
                    {viagem.status_viagem}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive/80"
                    onClick={(e) => openDeleteDialog(e, viagem.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-xl mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-4">
                      <Avatar className="h-10 w-10 border-2 border-white">
                        <AvatarImage 
                          src={viagem.logo_flamengo || "https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png"} 
                          alt="Flamengo" 
                        />
                        <AvatarFallback>FLA</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-10 w-10 border-2 border-white">
                        <AvatarImage 
                          src={viagem.logo_adversario || `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3)}`} 
                          alt={viagem.adversario}
                          onError={(e) => {
                            // Se a imagem falhar, use um fallback
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; // Previne loops infinitos
                            target.src = `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3).toUpperCase()}`;
                          }}
                        />
                        <AvatarFallback>{viagem.adversario.substring(0, 3).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </div>
                    <span>Flamengo x {viagem.adversario}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(viagem.data_jogo)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{viagem.rota}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ônibus: {viagem.tipo_onibus} ({viagem.empresa})</p>
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Passageiros confirmados</span>
                          <span>{passageirosCount[viagem.id] || 0} de {viagem.capacidade_onibus}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, ((passageirosCount[viagem.id] || 0) / viagem.capacidade_onibus) * 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="secondary" className="w-full" asChild>
                  <Link to={`/viagem/${viagem.id}`}>Ver Detalhes</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Flamengo Logo Section */}
      <div className="flex justify-center items-center my-8">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png"
          alt="Logo do Flamengo"
          className="h-40 w-auto"
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
  );
};

export default Viagens;
