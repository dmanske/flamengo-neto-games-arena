
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, FileText, Printer, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardTitle } from "@/components/ui/card";
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
  local_jogo?: string;
  logo_flamengo: string | null;
  logo_adversario: string | null;
  status_viagem: string;
}

interface ViagemHeaderProps {
  viagem: Viagem;
  onDelete: () => void;
  statusColors: Record<string, string>;
  onPrint?: () => void;
  onExportPDF?: () => void;
}

export function ViagemHeader({ viagem, onDelete, statusColors, onPrint, onExportPDF }: ViagemHeaderProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <div className="mb-6">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link to="/dashboard/viagens">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Detalhes da Caravana</h1>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <Badge className={statusColors[viagem.status_viagem] || "bg-gray-100"}>
            {viagem.status_viagem}
          </Badge>
          <div className="flex items-center gap-6 mt-2">
            {/* Seção dos Logos */}
            <div className="flex items-center gap-3">
              {/* Mostrar adversário primeiro quando jogo for fora do Rio */}
              {viagem.local_jogo && viagem.local_jogo !== "Rio de Janeiro" ? (
                <>
                  {/* Time Adversário (Casa) */}
                  <div className="flex flex-col items-center gap-1">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-md hover:scale-105 transition-transform duration-200">
                      <AvatarImage 
                        src={viagem.logo_adversario || `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3)}`}
                        alt={viagem.adversario}
                        className="object-contain p-1"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3).toUpperCase()}`;
                        }}
                      />
                      <AvatarFallback className="bg-gray-100 text-gray-800 font-bold text-xs">
                        {viagem.adversario.substring(0, 3).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-gray-600 text-center max-w-[60px] truncate">
                      {viagem.adversario}
                    </span>
                  </div>
                  
                  {/* Indicador VS */}
                  <div className="flex flex-col items-center px-2">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                      VS
                    </div>
                    <span className="text-xs text-gray-500 mt-1">FORA</span>
                  </div>
                  
                  {/* Flamengo (Visitante) */}
                  <div className="flex flex-col items-center gap-1">
                    <Avatar className="h-12 w-12 border-2 border-red-500 shadow-md hover:scale-105 transition-transform duration-200 ring-1 ring-red-200">
                      <AvatarImage 
                        src={viagem.logo_flamengo || "https://logodetimes.com/wp-content/uploads/flamengo.png"} 
                        alt="Flamengo"
                        className="object-contain p-1"
                      />
                      <AvatarFallback className="bg-red-600 text-white font-bold text-xs">FLA</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-red-600 text-center">
                      Flamengo
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {/* Flamengo (Casa) */}
                  <div className="flex flex-col items-center gap-1">
                    <Avatar className="h-12 w-12 border-2 border-red-500 shadow-md hover:scale-105 transition-transform duration-200 ring-1 ring-red-200">
                      <AvatarImage 
                        src={viagem.logo_flamengo || "https://logodetimes.com/wp-content/uploads/flamengo.png"} 
                        alt="Flamengo"
                        className="object-contain p-1"
                      />
                      <AvatarFallback className="bg-red-600 text-white font-bold text-xs">FLA</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-red-600 text-center">
                      Flamengo
                    </span>
                  </div>
                  
                  {/* Indicador VS */}
                  <div className="flex flex-col items-center px-2">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                      VS
                    </div>
                    <span className="text-xs text-gray-500 mt-1">CASA</span>
                  </div>
                  
                  {/* Time Adversário (Visitante) */}
                  <div className="flex flex-col items-center gap-1">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-md hover:scale-105 transition-transform duration-200">
                      <AvatarImage 
                        src={viagem.logo_adversario || `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3)}`}
                        alt={viagem.adversario}
                        className="object-contain p-1"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3).toUpperCase()}`;
                        }}
                      />
                      <AvatarFallback className="bg-gray-100 text-gray-800 font-bold text-xs">
                        {viagem.adversario.substring(0, 3).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-gray-600 text-center max-w-[60px] truncate">
                      {viagem.adversario}
                    </span>
                  </div>
                </>
              )}
            </div>
            
            {/* Título do Jogo */}
            <CardTitle className="text-2xl">
              {viagem.local_jogo && viagem.local_jogo !== "Rio de Janeiro" ? 
                `${viagem.adversario} x Flamengo` : 
                `Flamengo x ${viagem.adversario}`
              }
            </CardTitle>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Botão de Lista de Presença - só aparece quando a viagem está em andamento */}
          {viagem.status_viagem === "Em andamento" && (
            <Button variant="outline" asChild className="text-amber-600 border-amber-600 hover:bg-amber-50">
              <Link to={`/dashboard/presenca/${viagem.id}`}>
                <Users className="h-4 w-4 mr-2" />
                Lista de Presença
              </Link>
            </Button>
          )}
          
          {/* Botões de Relatório */}
          {onPrint && (
            <Button variant="outline" onClick={onPrint} className="text-blue-600 border-blue-600 hover:bg-blue-50">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          )}
          
          {onExportPDF && (
            <Button variant="outline" onClick={onExportPDF} className="text-green-600 border-green-600 hover:bg-green-50">
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          )}

          <Button variant="outline" asChild>
            <Link to={`/dashboard/viagem/${viagem.id}/editar`}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
          
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
      </div>
    </div>
  );
}
