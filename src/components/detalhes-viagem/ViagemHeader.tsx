
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
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
  logo_flamengo: string | null;
  logo_adversario: string | null;
  status_viagem: string;
}

interface ViagemHeaderProps {
  viagem: Viagem;
  onDelete: () => void;
  statusColors: Record<string, string>;
}

export function ViagemHeader({ viagem, onDelete, statusColors }: ViagemHeaderProps) {
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
            <Link to={`/dashboard/viagem/${viagem.id}/editar`}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir esta viagem? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">
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
