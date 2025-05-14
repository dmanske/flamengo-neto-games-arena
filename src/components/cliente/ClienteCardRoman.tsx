import React from "react";
import { User, MapPin, Star, Users, MessageSquare, Star as StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Influencia {
  tipo: "politica" | "popular" | "economica";
  valor: number; // 0-5
  cor: string;
  icone: React.ReactNode;
}

interface ClienteCardRomanProps {
  nome: string;
  status: string;
  cargo: string;
  local: string;
  influencias: Influencia[];
}

export const ClienteCardRoman: React.FC<ClienteCardRomanProps> = ({
  nome,
  status,
  cargo,
  local,
  influencias,
}) => {
  return (
    <Card className="roman-card border-2 border-rome-gold/70 relative max-w-xl w-full mx-auto p-0">
      <div className="flex items-center justify-between p-4 pb-0">
        <div className="flex items-center gap-2">
          <Users className="text-purple-600 h-7 w-7" />
          <h2 className="font-cinzel text-2xl text-rome-navy">{nome}</h2>
        </div>
        <span className="bg-green-100 text-green-800 px-4 py-1 rounded-full font-medium text-sm">
          {status}
        </span>
      </div>
      <div className="px-4 pt-2 pb-0">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <User className="h-4 w-4" /> {cargo}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <MapPin className="h-4 w-4" /> {local}
        </div>
        <div className="mt-2 mb-2">
          <span className="font-cinzel text-lg text-rome-navy">Influências:</span>
          <div className="mt-1 space-y-1">
            {influencias.map((inf, idx) => (
              <div key={idx} className="flex items-center gap-1">
                {inf.icone}
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${i < inf.valor ? inf.cor : 'text-gray-300'}`}
                    fill={i < inf.valor ? inf.cor.replace('text-', 'fill-') : 'none'}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-rome-gold/30 mt-4 flex gap-2 p-4 pt-3 bg-transparent">
        <Button variant="outline" className="rounded-lg"><Star className="h-5 w-5" /></Button>
        <Button variant="outline" className="rounded-lg"><MessageSquare className="h-5 w-5" /></Button>
        <Button variant="default" className="rounded-lg bg-rome-terracotta text-white"><Users className="h-5 w-5" /></Button>
        <Button variant="outline" className="rounded-lg flex-1">Detalhes</Button>
      </div>
    </Card>
  );
}; 