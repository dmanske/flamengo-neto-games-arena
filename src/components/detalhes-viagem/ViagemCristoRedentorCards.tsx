import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PassageiroDisplay } from '@/hooks/useViagemDetails';

interface ViagemCristoRedentorCardsProps {
  passageiros: PassageiroDisplay[];
}

export function ViagemCristoRedentorCards({ passageiros }: ViagemCristoRedentorCardsProps) {
  // Separar passageiros que querem e não querem o passeio no Cristo
  const passageirosSim = passageiros.filter(p => p.passeio_cristo === 'sim');
  const passageirosNao = passageiros.filter(p => p.passeio_cristo === 'nao');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Card de quem vai ao Cristo */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            Vai ao Cristo Redentor
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
              {passageirosSim.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {passageirosSim.length > 0 ? (
              passageirosSim.map((passageiro) => (
                <div key={passageiro.id} className="flex items-center gap-2 p-2 bg-white rounded-md">
                  <Users className="h-4 w-4 text-green-600" />
                  <span>{passageiro.nome}</span>
                </div>
              ))
            ) : (
              <p className="text-green-600">Ninguém confirmou o passeio</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card de quem NÃO vai ao Cristo */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-red-700">
            <XCircle className="h-5 w-5" />
            Não vai ao Cristo Redentor
            <Badge variant="secondary" className="ml-2 bg-red-100 text-red-700">
              {passageirosNao.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {passageirosNao.length > 0 ? (
              passageirosNao.map((passageiro) => (
                <div key={passageiro.id} className="flex items-center gap-2 p-2 bg-white rounded-md">
                  <Users className="h-4 w-4 text-red-600" />
                  <span>{passageiro.nome}</span>
                </div>
              ))
            ) : (
              <p className="text-red-600">Todos querem o passeio</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 