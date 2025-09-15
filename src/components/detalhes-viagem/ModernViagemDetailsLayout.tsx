import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Bus, DollarSign, Users, Pencil, Trash2, FileText, Printer, Filter, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

import { formatCurrency } from "@/lib/utils";
import { PasseiosExibicaoHibrida } from "@/components/viagem/PasseiosExibicaoHibrida";
import { toast } from "sonner";
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
  passeios_pagos?: string[];
  created_at: string;

  // Novos campos do sistema avançado de pagamento
  tipo_pagamento?: 'livre' | 'parcelado_flexivel' | 'parcelado_obrigatorio';
  exige_pagamento_completo?: boolean;
  dias_antecedencia?: number;
  permite_viagem_com_pendencia?: boolean;
  // Passeios relacionados
  viagem_passeios?: Array<{
    passeio_id: string;
    passeios: {
      nome: string;
      valor: number;
      categoria: string;
    };
  }>;
}

interface ModernViagemDetailsLayoutProps {
  viagem: Viagem;
  onDelete: () => void;
  onPrint?: () => void;
  onExportPDF?: () => void;
  onOpenFilters?: () => void;
  onVincularCredito?: () => void;
  onibusList: Array<any>;
  passageiros?: Array<any>;
  children: React.ReactNode;
}

export function ModernViagemDetailsLayout({ 
  viagem, 
  onDelete, 
  onPrint, 
  onExportPDF, 
  onOpenFilters,
  onVincularCredito,
  onibusList,
  passageiros = [],
  children 
}: ModernViagemDetailsLayoutProps) {
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
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'fechada':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'concluída':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'em andamento':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Calculate total capacity including extra seats
  const totalCapacity = onibusList.reduce(
    (total, onibus) => total + onibus.capacidade_onibus + (onibus.lugares_extras || 0),
    0
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Header */}
      <div className="bg-white shadow-xl border-b border-gray-100">
        <div className="container py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-gray-700 hover:bg-gray-100">
              <Link to="/dashboard/viagens" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar às Viagens
              </Link>
            </Button>
          </div>

          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Team Logos */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Mostrar adversário primeiro quando jogo for fora do Rio */}
                {viagem.local_jogo && viagem.local_jogo !== "Rio de Janeiro" ? (
                  <>
                    <div className="relative">
                      <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-white shadow-lg">
                        <AvatarImage 
                          src={viagem.logo_adversario || `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3)}`}
                          alt={viagem.adversario}
                        />
                        <AvatarFallback className="bg-gray-600 text-white font-bold text-sm sm:text-lg">
                          {viagem.adversario.substring(0, 3).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-400">×</div>
                    <div className="relative">
                      <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-white shadow-lg">
                        <AvatarImage 
                          src={viagem.logo_flamengo || "https://logodetimes.com/wp-content/uploads/flamengo.png"} 
                          alt="Flamengo" 
                        />
                        <AvatarFallback className="bg-red-600 text-white font-bold text-sm sm:text-lg">FLA</AvatarFallback>
                      </Avatar>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-white shadow-lg">
                        <AvatarImage 
                          src={viagem.logo_flamengo || "https://logodetimes.com/wp-content/uploads/flamengo.png"} 
                          alt="Flamengo" 
                        />
                        <AvatarFallback className="bg-red-600 text-white font-bold text-sm sm:text-lg">FLA</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-400">×</div>
                    <div className="relative">
                      <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-white shadow-lg">
                        <AvatarImage 
                          src={viagem.logo_adversario || `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3)}`}
                          alt={viagem.adversario}
                        />
                        <AvatarFallback className="bg-gray-600 text-white font-bold text-sm sm:text-lg">
                          {viagem.adversario.substring(0, 3).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </>
                )}
              </div>

              {/* Title and Info */}
              <div>
                <Badge className={`${getStatusColor(viagem.status_viagem)} px-3 py-1 text-sm font-medium rounded-full border mb-3`}>
                  {viagem.status_viagem}
                </Badge>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {viagem.local_jogo && viagem.local_jogo !== "Rio de Janeiro" ? 
                    `${viagem.adversario} × Flamengo` : 
                    `Flamengo × ${viagem.adversario}`
                  }
                </h1>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Caravana Rubro-Negra</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {onOpenFilters && (
                <Button variant="outline" onClick={onOpenFilters} className="bg-white hover:bg-purple-50 border-purple-200 text-purple-700">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros do Relatório
                </Button>
              )}

              <Button 
                variant="outline" 
                onClick={async () => {
                  try {
                    const url = `${window.location.origin}/viagem/${viagem.id}/meu-onibus`;
                    
                    // Abrir em nova aba automaticamente
                    window.open(url, '_blank');
                    
                    // Também copiar para clipboard
                    await navigator.clipboard.writeText(url);
                    toast.success("🚌 Página aberta e link copiado!", {
                      description: "Nova aba aberta + link copiado para compartilhar com passageiros.",
                      duration: 4000,
                    });
                  } catch (error) {
                    // Fallback se clipboard não funcionar, mas ainda abre a aba
                    const url = `${window.location.origin}/viagem/${viagem.id}/meu-onibus`;
                    window.open(url, '_blank');
                    toast.info("🔗 Página aberta!", {
                      description: `Nova aba aberta. Copie manualmente: ${url}`,
                      duration: 6000,
                    });
                  }
                }}
                className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
                title="Abrir página Meu Ônibus em nova aba e copiar link"
              >
                <Bus className="h-4 w-4 mr-2" />
                Meu Ônibus
              </Button>


              
              {onExportPDF && (
                <Button 
                  variant="outline" 
                  onClick={onExportPDF} 
                  className="bg-white hover:bg-green-50 border-green-200 text-green-700"
                  title="Salvar como arquivo PDF no computador"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
              )}

              {onVincularCredito && (
                <Button 
                  variant="outline" 
                  onClick={onVincularCredito}
                  className="bg-white hover:bg-green-50 border-green-200 text-green-700"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Vincular Crédito
                </Button>
              )}

              <Button variant="outline" asChild className="bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-700">
                <Link to={`/dashboard/viagem/${viagem.id}/editar`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setDeleteDialogOpen(true)}
                className="bg-white hover:bg-red-50 border-red-200 text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="container py-6">

        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Data do Jogo</p>
                  <p className="text-lg font-bold text-gray-900">{formatDate(viagem.data_jogo)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-2">Passeios da Viagem</p>
                  <PasseiosExibicaoHibrida 
                    viagem={viagem} 
                    formato="lista"
                    className="text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Valor Padrão</p>
                  <p className="text-lg font-bold text-gray-900">
                    {viagem.valor_padrao ? formatCurrency(viagem.valor_padrao) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Capacidade Total</p>
                  <p className="text-lg font-bold text-gray-900">{totalCapacity} passageiros</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Tipo de Pagamento */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${
                  viagem.tipo_pagamento === 'livre' 
                    ? 'bg-blue-100' 
                    : viagem.tipo_pagamento === 'parcelado_flexivel'
                    ? 'bg-green-100'
                    : 'bg-amber-100'
                }`}>
                  <DollarSign className={`h-6 w-6 ${
                    viagem.tipo_pagamento === 'livre' 
                      ? 'text-blue-600' 
                      : viagem.tipo_pagamento === 'parcelado_flexivel'
                      ? 'text-green-600'
                      : 'text-amber-600'
                  }`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Tipo de Pagamento</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-gray-900">
                      {viagem.tipo_pagamento === 'livre' && 'Livre'}
                      {viagem.tipo_pagamento === 'parcelado_flexivel' && 'Flexível'}
                      {viagem.tipo_pagamento === 'parcelado_obrigatorio' && 'Obrigatório'}
                      {!viagem.tipo_pagamento && 'Livre'}
                    </p>
                    {viagem.exige_pagamento_completo && (
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                        Obrigatório
                      </Badge>
                    )}
                  </div>
                  {viagem.exige_pagamento_completo && viagem.dias_antecedencia && (
                    <p className="text-xs text-gray-500 mt-1">
                      Pagar até {viagem.dias_antecedencia} dias antes
                    </p>
                  )}
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
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta viagem? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              onDelete();
              setDeleteDialogOpen(false);
            }} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
