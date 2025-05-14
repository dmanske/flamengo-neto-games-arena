
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Pencil, Trash2, Calendar as CalendarIcon, Info as InfoIcon } from "lucide-react";

interface OnibusCardProps {
  id: string;
  tipo_onibus: string;
  empresa: string;
  numero_identificacao: string | null;
  capacidade: number;
  year: number | null;
  description: string | null;
  image_url: string | null;
  onDelete: (id: string) => void;
}

export function OnibusCard({
  id,
  tipo_onibus,
  empresa,
  numero_identificacao,
  capacidade,
  year,
  description,
  image_url,
  onDelete
}: OnibusCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden">
      {image_url && (
        <AspectRatio ratio={16 / 9}>
          <img
            src={image_url}
            alt={`${empresa} ${tipo_onibus}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/400x225?text=Imagem+indisponível';
            }}
          />
        </AspectRatio>
      )}
      <CardContent className="pt-6 pb-2">
        <h3 className="text-xl font-bold">{tipo_onibus}</h3>
        <CardDescription className="space-y-1">
          <p>{empresa}</p>
          {numero_identificacao && (
            <p>ID: {numero_identificacao}</p>
          )}
          <p>Capacidade: {capacidade} lugares</p>
          {year && (
            <div className="flex items-center gap-1 text-sm">
              <CalendarIcon className="h-3 w-3" />
              <span>Ano: {year}</span>
            </div>
          )}
          {description && (
            <div className="flex items-start gap-1 text-sm mt-1">
              <InfoIcon className="h-3 w-3 mt-1 flex-shrink-0" />
              <span className="line-clamp-2">{description}</span>
            </div>
          )}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(id)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Remover
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/dashboard/onibus/${id}/editar`)}
        >
          <Pencil className="h-4 w-4 mr-1" />
          Editar
        </Button>
      </CardFooter>
    </Card>
  );
}
