
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2, Users, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface OnibusCardProps {
  onibus: {
    id: string;
    tipo_onibus: string;
    empresa: string;
    capacidade: number;
    numero_identificacao: string | null;
    image_path: string | null;
    description: string | null;
  };
  onDeleteClick: (onibus: any) => void;
}

export function OnibusCard({ onibus, onDeleteClick }: OnibusCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{onibus.tipo_onibus}</CardTitle>
            <p className="text-sm text-gray-600">{onibus.empresa}</p>
          </div>
          {onibus.numero_identificacao && (
            <Badge variant="outline">
              #{onibus.numero_identificacao}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {onibus.image_path && (
          <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={onibus.image_path} 
              alt={`${onibus.tipo_onibus} - ${onibus.empresa}`}
              className="w-full h-full object-contain"
            />
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>Capacidade: {onibus.capacidade} passageiros</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 className="h-4 w-4" />
            <span>{onibus.empresa}</span>
          </div>
        </div>

        {onibus.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {onibus.description}
          </p>
        )}
        
        <div className="flex gap-2 pt-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ver detalhes</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" asChild className="flex-1">
                <Link to={`/dashboard/onibus/${onibus.id}/editar`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Editar</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onDeleteClick(onibus)}
                className="flex-1 text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Excluir</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
}
