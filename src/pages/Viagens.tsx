import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton-loader";
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
} from "@/components/ui/alert-dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Search, Trash2, Pencil, Eye, PlusCircle, List, LayoutGrid, CalendarCheck, History, Archive } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { ViagemCard } from "@/components/viagens/ViagemCard";
import { useMultiplePassageirosCount } from "@/hooks/usePassageirosCount";

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
  capacidade_onibus: number;
}

const Viagens = () => {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [viagemToDelete, setViagemToDelete] = useState<Viagem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [cardDesign, setCardDesign] = useState<'original' | 'premium' | 'clean'>('original');
  const [activeTab, setActiveTab] = useState<'ativas' | 'historico'>('ativas');
  const [periodoFiltro, setPeriodoFiltro] = useState<string>("todos");
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
      toast.error("Erro ao carregar dados das viagens");
    } finally {
      setLoading(false);
    }
  };

  // Buscar contagem de passageiros para cada viagem
  const { passageirosCount } = useMultiplePassageirosCount(
    viagens.map(viagem => viagem.id)
  );

  // Separar viagens ativas e históricas
  const viagensAtivas = viagens.filter(viagem => 
    viagem.status_viagem === 'Aberta' || viagem.status_viagem === 'Fechada'
  );
  
  const viagensHistoricas = viagens.filter(viagem => 
    viagem.status_viagem === 'Concluída'
  );

  // Filtrar viagens históricas por período
  const getViagensPorPeriodo = (viagens: Viagem[]) => {
    if (periodoFiltro === "todos") return viagens;
    
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth();
    
    return viagens.filter(viagem => {
      const dataJogo = new Date(viagem.data_jogo);
      const anoViagem = dataJogo.getFullYear();
      const mesViagem = dataJogo.getMonth();
      
      switch (periodoFiltro) {
        case "mes_atual":
          return anoViagem === anoAtual && mesViagem === mesAtual;
        case "ano_atual":
          return anoViagem === anoAtual;
        case "ano_anterior":
          return anoViagem === anoAtual - 1;
        default:
          return true;
      }
    });
  };

  // Apply filters
  const filterViagens = (viagensList: Viagem[]) => {
    if (!searchTerm) return viagensList;
    
    const term = searchTerm.toLowerCase();
    
    return viagensList.filter((viagem) => 
      viagem.adversario.toLowerCase().includes(term) ||
      viagem.rota.toLowerCase().includes(term) ||
      format(new Date(viagem.data_jogo), 'dd/MM/yyyy', { locale: ptBR }).includes(term)
    );
  };

  const viagensAtivasFiltradas = filterViagens(viagensAtivas);
  const viagensHistoricasFiltradas = filterViagens(getViagensPorPeriodo(viagensHistoricas));

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
      
      setViagens(viagens.filter(v => v.id !== viagemToDelete.id));
      toast.success(`Viagem contra ${viagemToDelete.adversario} removida com sucesso`);
      setViagemToDelete(null);
    } catch (err: any) {
      console.error('Erro ao excluir viagem:', err);
      toast.error(`Erro ao excluir viagem: ${err.message}`);
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

  const renderViagensContent = (viagensList: Viagem[]) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando viagens...</span>
        </div>
      );
    }

    if (viagensList.length === 0) {
      return (
        <div className="py-8 text-center">
          {searchTerm ? (
            <p className="text-gray-500">Nenhuma viagem encontrada com esses critérios de busca.</p>
          ) : (
            <p className="text-gray-500">Nenhuma viagem encontrada.</p>
          )}
        </div>
      );
    }

    if (viewMode === 'table') {
      return (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Adversário</TableHead>
                <TableHead>Rota</TableHead>
                <TableHead>Valor Padrão</TableHead>
                <TableHead>Ocupação</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {viagensList.map((viagem) => (
                <TableRow key={viagem.id}>
                  <TableCell className="font-medium">{formatDate(viagem.data_jogo)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {viagem.logo_adversario && (
                        <div className="w-6 h-6 flex items-center justify-center">
                          <img 
                            src={viagem.logo_adversario} 
                            alt={viagem.adversario} 
                            className="w-full h-full object-contain" 
                          />
                        </div>
                      )}
                      {viagem.adversario}
                    </div>
                  </TableCell>
                  <TableCell>{viagem.rota}</TableCell>
                  <TableCell>{formatValue(viagem.valor_padrao)}</TableCell>
                  <TableCell>
                    {passageirosCount[viagem.id] || 0}/{viagem.capacidade_onibus}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viagem.status_viagem)}`}>
                      {viagem.status_viagem}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/dashboard/viagem/${viagem.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ver detalhes da viagem</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/dashboard/viagem/${viagem.id}/editar`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Editar viagem</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setViagemToDelete(viagem)}
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Excluir viagem</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    // Grid view with different card designs
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {viagensList.map((viagem) => {
          if (cardDesign === 'premium') {
            const { PremiumViagemCard } = require('@/components/viagens/PremiumViagemCard');
            return (
              <PremiumViagemCard 
                key={viagem.id}
                viagem={viagem} 
                passageirosCount={passageirosCount[viagem.id] || 0}
                onDeleteClick={(v) => setViagemToDelete(v)}
              />
            );
          } else if (cardDesign === 'clean') {
            const { CleanViagemCard } = require('@/components/viagens/CleanViagemCard');
            return (
              <CleanViagemCard 
                key={viagem.id}
                viagem={viagem} 
                passageirosCount={passageirosCount[viagem.id] || 0}
                onDeleteClick={(v) => setViagemToDelete(v)}
              />
            );
          } else {
            return (
              <ViagemCard 
                key={viagem.id}
                viagem={viagem} 
                passageirosCount={passageirosCount[viagem.id] || 0}
                onDeleteClick={(v) => setViagemToDelete(v)}
              />
            );
          }
        })}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Viagens</h1>
          <Button 
            onClick={() => navigate("/dashboard/cadastrar-viagem")}
            className="bg-primary hover:bg-primary/90"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Viagem
          </Button>
        </div>

        <Tabs defaultValue="ativas" className="w-full" onValueChange={(value) => setActiveTab(value as 'ativas' | 'historico')}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="ativas" className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              Viagens Ativas
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

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
              
              {activeTab === 'historico' && (
                <Select
                  value={periodoFiltro}
                  onValueChange={setPeriodoFiltro}
                >
                  <SelectTrigger className="w-full md:w-[180px] bg-white">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 z-50">
                    <SelectItem value="todos" className="bg-white text-gray-900 hover:bg-gray-50">Todos os períodos</SelectItem>
                    <SelectItem value="mes_atual" className="bg-white text-gray-900 hover:bg-gray-50">Mês atual</SelectItem>
                    <SelectItem value="ano_atual" className="bg-white text-gray-900 hover:bg-gray-50">Ano atual</SelectItem>
                    <SelectItem value="ano_anterior" className="bg-white text-gray-900 hover:bg-gray-50">Ano anterior</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <div className="flex border rounded-md shadow-sm">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      className="rounded-r-none"
                      onClick={() => setViewMode('table')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Visualização em tabela</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      className="rounded-l-none"
                      onClick={() => setViewMode('grid')}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Visualização em cards</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Card Design Selector - only show in grid mode */}
              {viewMode === 'grid' && (
                <div className="flex border rounded-md shadow-sm">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={cardDesign === 'original' ? 'default' : 'ghost'}
                        className="rounded-r-none rounded-l-md text-xs px-2"
                        onClick={() => setCardDesign('original')}
                      >
                        Original
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Design original</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={cardDesign === 'premium' ? 'default' : 'ghost'}
                        className="rounded-none text-xs px-2"
                        onClick={() => setCardDesign('premium')}
                      >
                        Premium
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Design premium com efeitos glass</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={cardDesign === 'clean' ? 'default' : 'ghost'}
                        className="rounded-l-none rounded-r-md text-xs px-2"
                        onClick={() => setCardDesign('clean')}
                      >
                        Clean
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Design limpo e moderno</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>

          <TabsContent value="ativas">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5" />
                  Viagens Ativas ({viagensAtivasFiltradas.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderViagensContent(viagensAtivasFiltradas)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  Histórico de Viagens ({viagensHistoricasFiltradas.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderViagensContent(viagensHistoricasFiltradas)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AlertDialog para confirmação de exclusão */}
        <AlertDialog open={!!viagemToDelete} onOpenChange={(open) => {
          if (!open) setViagemToDelete(null);
        }}>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a viagem contra {viagemToDelete?.adversario}? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="hover:text-gray-700">Cancelar</AlertDialogCancel>
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
    </TooltipProvider>
  );
};

export default Viagens;
