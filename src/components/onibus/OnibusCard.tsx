import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface OnibusCardProps {
  id: string;
  tipo_onibus: string;
  empresa: string;
  numero_identificacao?: string | null;
  capacidade: number;
  year?: number | null;
  description?: string | null;
  image_url?: string | null;
  onDelete: (id: string) => void;
}

export function OnibusCard({
  id,
  tipo_onibus,
  empresa,
  numero_identificacao,
  capacidade,
  description,
  image_url,
  onDelete
}: OnibusCardProps) {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEdit = () => {
    navigate(`/dashboard/editar-onibus/${id}`);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    onDelete(id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="aspect-video overflow-hidden bg-muted">
          {image_url ? (
            <img
              src={image_url}
              alt={`Imagem do ${tipo_onibus}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "/placeholder.svg";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400">Sem imagem</span>
            </div>
          )}
        </div>
        <CardHeader>
          <CardTitle className="truncate">{tipo_onibus}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-cinzel font-medium">Empresa:</span> <span className="font-cinzel">{empresa}</span>
          </div>
          <div>
            <span className="font-cinzel font-medium">Capacidade:</span> <span className="font-cinzel">{capacidade} passageiros</span>
          </div>
          {numero_identificacao && (
            <div>
              <span className="font-cinzel font-medium">Identificação:</span> <span className="font-cinzel">{numero_identificacao}</span>
            </div>
          )}
          {description && (
            <div>
              <span className="font-cinzel font-medium">Descrição:</span>
              <p className="text-sm text-gray-500 mt-1 line-clamp-3 font-cinzel">{description}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEdit}
            className="flex items-center gap-1"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteClick}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Remover
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este ônibus? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Sim, remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
