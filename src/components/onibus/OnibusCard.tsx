
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bus, Users, Building2, Edit, Trash2 } from "lucide-react";

interface OnibusCardProps {
  onibus: {
    id: string;
    tipo_onibus: string;
    empresa: string;
    numero_identificacao?: string;
    capacidade: number;
    description?: string;
    image_path?: string;
  };
  onEdit: (onibus: any) => void;
  onDelete: (onibus: any) => void;
}

export function OnibusCard({ onibus, onEdit, onDelete }: OnibusCardProps) {
  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-professional hover:shadow-professional-md transition-all duration-300 hover:scale-[1.02] group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
              <Bus className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                {onibus.tipo_onibus}
              </CardTitle>
              {onibus.numero_identificacao && (
                <p className="text-sm text-gray-600 mt-1">{onibus.numero_identificacao}</p>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
            Ativo
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {onibus.image_path && (
          <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={onibus.image_path} 
              alt={`${onibus.tipo_onibus} - ${onibus.empresa}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Building2 className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">{onibus.empresa}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-sm">
              <span className="font-medium text-gray-900">{onibus.capacidade}</span> lugares
            </span>
          </div>

          {onibus.description && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {onibus.description}
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(onibus)}
            className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(onibus)}
            className="flex-1 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
