import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket } from 'lucide-react';
import { PassageiroOnibus } from '@/hooks/useListaPresencaOnibus';

interface ResumoSetorProps {
  passageiros: PassageiroOnibus[];
}

export const ResumoSetor: React.FC<ResumoSetorProps> = ({ passageiros }) => {
  // Obter setores únicos
  const setoresUnicos = [...new Set(passageiros.map(p => p.setor_maracana))].sort();

  if (setoresUnicos.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Resumo por Setor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {setoresUnicos.map(setor => {
            const passageirosSetor = passageiros.filter(p => p.setor_maracana === setor);
            const presentesSetor = passageirosSetor.filter(p => p.status_presenca === 'presente').length;
            const percentualSetor = passageirosSetor.length > 0 ? Math.round((presentesSetor / passageirosSetor.length) * 100) : 0;
            
            return (
              <div key={setor} className="flex justify-between items-center p-2 rounded bg-gray-50">
                <span className="font-medium">{setor}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {presentesSetor}/{passageirosSetor.length}
                  </span>
                  <Badge 
                    variant={percentualSetor >= 80 ? "default" : percentualSetor >= 60 ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {percentualSetor}%
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};