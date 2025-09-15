import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2, Users, Building2, Info, Wifi } from "lucide-react";
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
    wifi_ssid: string | null;
    wifi_password: string | null;
  };
  onDeleteClick: (onibus: any) => void;
}

export function OnibusCard({ onibus, onDeleteClick }: OnibusCardProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className="relative">
        {/* Imagem do Ônibus */}
        <div className="w-full h-48 bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
          {onibus.image_path ? (
            <img 
              src={onibus.image_path} 
              alt={`${onibus.tipo_onibus} - ${onibus.empresa}`}
              className="w-full h-full object-contain p-2"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <Info className="h-12 w-12 mb-2" />
              <span className="text-sm">Sem imagem</span>
            </div>
          )}
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {onibus.numero_identificacao && (
            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-md">
              #{onibus.numero_identificacao}
            </Badge>
          )}
          {(onibus.wifi_ssid || onibus.wifi_password) && (
            <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-md flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              WiFi
            </Badge>
          )}
        </div>
      </div>
      
      <CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-slate-50 to-blue-50/30">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">{onibus.tipo_onibus}</CardTitle>
            <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
              <Building2 className="h-3 w-3" />
              {onibus.empresa}
            </p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Users className="h-3 w-3 mr-1" />
            {onibus.capacidade}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 py-3">
        {onibus.description ? (
          <p className="text-sm text-slate-600 line-clamp-2">
            {onibus.description}
          </p>
        ) : (
          <p className="text-sm text-slate-400 italic">
            Sem descrição disponível
          </p>
        )}
      </CardContent>
      
      <CardFooter className="px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50/30 border-t border-slate-100">
        <div className="flex gap-2 w-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost" asChild className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                <Link to={`/dashboard/onibus/${onibus.id}`}>
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ver detalhes</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost" asChild className="flex-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                <Link to={`/dashboard/editar-onibus/${onibus.id}`}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Editar
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
                variant="ghost" 
                onClick={() => onDeleteClick(onibus)}
                className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Excluir</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardFooter>
    </Card>
  );
}