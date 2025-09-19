import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bus, Phone } from 'lucide-react';
import { EstatisticasOnibus as EstatisticasType, PassageiroOnibus } from '@/hooks/useListaPresencaOnibus';
import { formatPhone } from '@/utils/formatters';

interface EstatisticasOnibusProps {
  estatisticas: EstatisticasType;
  passageiros: PassageiroOnibus[];
}

export const EstatisticasOnibus: React.FC<EstatisticasOnibusProps> = ({
  estatisticas,
  passageiros
}) => {
  // Filtrar responsáveis do ônibus
  const responsaveis = passageiros.filter(p => p.is_responsavel_onibus);

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💰 Resumo Financeiro do Ônibus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-2xl font-bold text-green-600">{estatisticas.pagosCompletos}</p>
              <p className="text-sm text-green-700">Pagamentos Completos</p>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-2xl font-bold text-red-600">{estatisticas.pendentesFinanceiro}</p>
              <p className="text-sm text-red-700">Pendências Financeiras</p>
              <p className="text-xs text-red-600 mt-1">R$ {estatisticas.valorTotalPendente.toFixed(2)}</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-2xl font-bold text-purple-600">{estatisticas.brindes}</p>
              <p className="text-sm text-purple-700">Cortesias</p>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-2xl font-bold text-blue-600">
                {estatisticas.total > 0 ? Math.round(((estatisticas.pagosCompletos + estatisticas.brindes) / estatisticas.total) * 100) : 0}%
              </p>
              <p className="text-sm text-blue-700">Taxa Pagamento</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responsáveis do Ônibus */}
      {responsaveis.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bus className="h-5 w-5" />
              Responsáveis do Ônibus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {responsaveis.map((responsavel) => (
                <div
                  key={responsavel.viagem_passageiro_id}
                  className="p-4 rounded-lg border border-blue-200 bg-blue-50"
                >
                  <div className="flex items-start gap-4">
                    {/* Foto do Responsável */}
                    <div className="flex-shrink-0">
                      {responsavel.foto ? (
                        <img
                          src={responsavel.foto}
                          alt={responsavel.nome}
                          className="w-16 h-16 object-cover rounded-lg border-2 border-blue-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-16 h-16 bg-blue-200 text-blue-700 font-bold text-lg flex items-center justify-center rounded-lg border-2 border-blue-300"
                        style={{ 
                          display: responsavel.foto ? 'none' : 'flex'
                        }}
                      >
                        {responsavel.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-blue-900 truncate">
                          {responsavel.nome}
                        </h3>
                        <Badge className="bg-blue-600 text-white text-xs flex-shrink-0">
                          Responsável
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-blue-700">
                        {responsavel.telefone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{formatPhone(responsavel.telefone)}</span>
                          </div>
                        )}
                        <div className="text-xs text-blue-600">
                          {responsavel.cidade_embarque} • {responsavel.setor_maracana}
                        </div>
                      </div>

                      {/* Status de Presença do Responsável */}
                      <div className="mt-2">
                        <Badge 
                          className={`text-xs ${
                            responsavel.status_presenca === 'presente' 
                              ? 'bg-green-100 text-green-700 border-green-300' 
                              : responsavel.status_presenca === 'ausente'
                              ? 'bg-red-100 text-red-700 border-red-300'
                              : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                          }`}
                          variant="outline"
                        >
                          {responsavel.status_presenca === 'presente' ? '✅ Presente' : 
                           responsavel.status_presenca === 'ausente' ? '❌ Ausente' : 
                           '⏳ Pendente'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              💡 Os responsáveis são os contatos principais para questões relacionadas a este ônibus
            </p>
          </CardContent>
        </Card>
      )}

      {/* Resumo por Cidade de Embarque */}
      {(() => {
        const cidadesResumo = passageiros.reduce((acc, p) => {
          const cidade = p.cidade_embarque || 'Não especificada';
          if (!acc[cidade]) {
            acc[cidade] = { total: 0, presentes: 0 };
          }
          acc[cidade].total++;
          if (p.status_presenca === 'presente') {
            acc[cidade].presentes++;
          }
          return acc;
        }, {} as Record<string, { total: number; presentes: number }>);

        const cidades = Object.keys(cidadesResumo).sort();

        return cidades.length > 1 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📍 Resumo por Cidade de Embarque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cidades.map(cidade => {
                  const dados = cidadesResumo[cidade];
                  const percentual = dados.total > 0 ? Math.round((dados.presentes / dados.total) * 100) : 0;
                  
                  return (
                    <div
                      key={cidade}
                      className="p-3 rounded-lg border bg-gray-50"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium text-sm truncate">{cidade}</h4>
                        <Badge variant="outline" className="text-xs">
                          {percentual}%
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {dados.presentes} de {dados.total} presentes
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentual}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : null;
      })()}
    </div>
  );
};