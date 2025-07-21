import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Bus, DollarSign, Users, Pencil, Trash2, FileText, Printer, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
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

interface Viagem {
  id: string;
  adversario: string;
  data_jogo: string;
  local_jogo?: string;
  rota: string;
  setor_padrao: string | null;
  valor_padrao: number | null;
  tipo_onibus: string;
  empresa: string;
  capacidade_onibus: number;
  status_viagem: string;
  logo_flamengo: string | null;
  logo_adversario: string | null;
}

interface GlassViagemDetailsLayoutProps {
  viagem: Viagem;
  onDelete: () => void;
  onPrint?: () => void;
  onExportPDF?: () => void;
  onibusList: Array<any>;
  children: React.ReactNode;
}

export function GlassViagemDetailsLayout({ 
  viagem, 
  onDelete, 
  onPrint, 
  onExportPDF, 
  onibusList,
  children 
}: GlassViagemDetailsLayoutProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aberta':
        return 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30 backdrop-blur-md';
      case 'fechada':
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30 backdrop-blur-md';
      case 'concluída':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30 backdrop-blur-md';
      case 'em andamento':
        return 'bg-amber-500/20 text-amber-700 border-amber-500/30 backdrop-blur-md';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30 backdrop-blur-md';
    }
  };

  // Calculate total capacity including extra seats
  const totalCapacity = onibusList.reduce(
    (total, onibus) => total + onibus.capacidade_onibus + (onibus.lugares_extras || 0),
    0
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Glass Header */}
      <div className="relative backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-2xl">
        <div className="container py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" asChild className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm">
              <Link to="/dashboard/viagens" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar às Viagens
              </Link>
            </Button>
          </div>

          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex items-center gap-8">
              {/* Team Logos with Glow Effect */}
              <div className="flex items-center gap-6">
                {/* Mostrar adversário primeiro quando jogo for fora do Rio */}
                {viagem.local_jogo && viagem.local_jogo !== "Rio de Janeiro" ? (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gray-500 rounded-full blur-lg opacity-20 animate-pulse"></div>
                      <Avatar className="h-24 w-24 border-4 border-white/30 shadow-2xl relative backdrop-blur-sm">
                        <AvatarImage 
                          src={viagem.logo_adversario || `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3)}`}
                          alt={viagem.adversario}
                        />
                        <AvatarFallback className="bg-gray-600/80 text-white font-bold text-xl backdrop-blur-sm">
                          {viagem.adversario.substring(0, 3).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="text-4xl font-bold text-white/70">×</div>
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                      <Avatar className="h-24 w-24 border-4 border-white/30 shadow-2xl relative backdrop-blur-sm">
                        <AvatarImage 
                          src={viagem.logo_flamengo || "https://logodetimes.com/wp-content/uploads/flamengo.png"} 
                          alt="Flamengo" 
                        />
                        <AvatarFallback className="bg-red-600/80 text-white font-bold text-xl backdrop-blur-sm">FLA</AvatarFallback>
                      </Avatar>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                      <Avatar className="h-24 w-24 border-4 border-white/30 shadow-2xl relative backdrop-blur-sm">
                        <AvatarImage 
                          src={viagem.logo_flamengo || "https://logodetimes.com/wp-content/uploads/flamengo.png"} 
                          alt="Flamengo" 
                        />
                        <AvatarFallback className="bg-red-600/80 text-white font-bold text-xl backdrop-blur-sm">FLA</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="text-4xl font-bold text-white/70">×</div>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gray-500 rounded-full blur-lg opacity-20 animate-pulse"></div>
                      <Avatar className="h-24 w-24 border-4 border-white/30 shadow-2xl relative backdrop-blur-sm">
                        <AvatarImage 
                          src={viagem.logo_adversario || `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3)}`}
                          alt={viagem.adversario}
                        />
                        <AvatarFallback className="bg-gray-600/80 text-white font-bold text-xl backdrop-blur-sm">
                          {viagem.adversario.substring(0, 3).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </>
                )}
              </div>

              {/* Title and Info */}
              <div>
                <Badge className={`${getStatusColor(viagem.status_viagem)} px-4 py-2 text-sm font-semibold rounded-full border mb-4`}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {viagem.status_viagem}
                </Badge>
                <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
                  {viagem.local_jogo && viagem.local_jogo !== "Rio de Janeiro" ? 
                    `${viagem.adversario} × Flamengo` : 
                    `Flamengo × ${viagem.adversario}`
                  }
                </h1>
                <p className="text-white/80 text-xl font-medium">Caravana Rubro-Negra</p>
              </div>
            </div>

            {/* Glass Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {onPrint && (
                <Button 
                  variant="ghost" 
                  onClick={onPrint} 
                  className="bg-white/10 hover:bg-white/20 border border-white/30 text-white backdrop-blur-md"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
              )}
              
              {onExportPDF && (
                <Button 
                  variant="ghost" 
                  onClick={onExportPDF} 
                  className="bg-white/10 hover:bg-white/20 border border-white/30 text-white backdrop-blur-md"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
              )}

              <Button 
                variant="ghost" 
                asChild 
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white backdrop-blur-md"
              >
                <Link to={`/dashboard/viagem/${viagem.id}/editar`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => setDeleteDialogOpen(true)}
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 text-red-100 backdrop-blur-md"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Info Cards */}
      <div className="container py-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl hover:bg-white/15 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <Calendar className="h-6 w-6 text-blue-300" />
                </div>
                <div>
                  <p className="text-sm text-white/70 font-medium">Data do Jogo</p>
                  <p className="text-lg font-bold text-white">{formatDate(viagem.data_jogo)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl hover:bg-white/15 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <MapPin className="h-6 w-6 text-green-300" />
                </div>
                <div>
                  <p className="text-sm text-white/70 font-medium">Rota</p>
                  <p className="text-lg font-bold text-white">{viagem.rota}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl hover:bg-white/15 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/20 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <DollarSign className="h-6 w-6 text-yellow-300" />
                </div>
                <div>
                  <p className="text-sm text-white/70 font-medium">Valor Padrão</p>
                  <p className="text-lg font-bold text-white">
                    {viagem.valor_padrao ? formatCurrency(viagem.valor_padrao) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl hover:bg-white/15 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-purple-300" />
                </div>
                <div>
                  <p className="text-sm text-white/70 font-medium">Capacidade Total</p>
                  <p className="text-lg font-bold text-white">{totalCapacity} passageiros</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {children}
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-xl border border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta viagem? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 backdrop-blur-sm">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              onDelete();
              setDeleteDialogOpen(false);
            }} className="bg-red-600 hover:bg-red-700 text-white">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
