import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, Baby, GraduationCap, User, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { calcularIdade } from "@/utils/formatters";

interface PassageiroDisplay {
  data_nascimento?: string;
  clientes?: {
    data_nascimento?: string;
  };
  passeios?: Array<{ 
    passeio_nome: string; 
    status: string;
    valor_cobrado?: number;
    passeio?: {
      nome: string;
      valor: number;
    };
  }>;
}

interface PasseiosTotaisCardProps {
  passageiros: PassageiroDisplay[];
  className?: string;
}

// Função para mapear faixa etária para tipo de ingresso
const obterTipoIngresso = (idade: number): string => {
  if (idade >= 0 && idade <= 5) return 'Bebê';
  if (idade >= 6 && idade <= 12) return 'Criança';
  if (idade >= 13 && idade <= 17) return 'Estudante';
  if (idade >= 18 && idade <= 59) return 'Adulto';
  if (idade >= 60) return 'Idoso';
  return 'Não Informado';
};

// Função para obter ícone por faixa etária
const getIconeIdade = (categoria: string) => {
  if (categoria === 'Bebê') return <Baby className="h-3 w-3 text-pink-600" />;
  if (categoria === 'Criança') return <Baby className="h-3 w-3 text-blue-600" />;
  if (categoria === 'Estudante') return <GraduationCap className="h-3 w-3 text-purple-600" />;
  if (categoria === 'Adulto') return <User className="h-3 w-3 text-green-600" />;
  if (categoria === 'Idoso') return <UserCheck className="h-3 w-3 text-orange-600" />;
  return <Users className="h-3 w-3 text-gray-600" />;
};

export function PasseiosTotaisCard({ passageiros, className }: PasseiosTotaisCardProps) {
  // Calcular totais de passeios com faixas etárias
  const passeioTotais = passageiros.reduce((acc, passageiro) => {
    if (passageiro.passeios && passageiro.passeios.length > 0) {
      // Calcular idade do passageiro
      const dataNasc = passageiro.clientes?.data_nascimento || passageiro.data_nascimento;
      let faixaEtaria = 'Não Informado';
      
      if (dataNasc && dataNasc.trim() !== '') {
        const idade = calcularIdade(dataNasc);
        faixaEtaria = obterTipoIngresso(idade);
      }
      
      passageiro.passeios.forEach(passeio => {
        const nomePasseio = passeio.passeio?.nome || passeio.passeio_nome || 'Passeio não identificado';
        
        if (!acc[nomePasseio]) {
          acc[nomePasseio] = {
            quantidade: 0,
            faixasEtarias: {}
          };
        }
        
        acc[nomePasseio].quantidade += 1;
        acc[nomePasseio].faixasEtarias[faixaEtaria] = (acc[nomePasseio].faixasEtarias[faixaEtaria] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, { quantidade: number; faixasEtarias: Record<string, number> }>);

  const totalPasseios = Object.values(passeioTotais).reduce((sum, item) => sum + item.quantidade, 0);
  const passageirosComPasseios = passageiros.filter(p => p.passeios && p.passeios.length > 0).length;

  return (
    <div className={className}>
      <h3 className="text-lg font-medium mb-4">Totais de Passeios</h3>
      
      {Object.keys(passeioTotais).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(passeioTotais)
            .sort(([, a], [, b]) => b.quantidade - a.quantidade)
            .map(([nomePasseio, dados]) => (
              <Card key={nomePasseio} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium truncate" title={nomePasseio}>
                    {nomePasseio}
                  </CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center mb-3">
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      <Users className="h-4 w-4 mr-2" />
                      {dados.quantidade}
                    </Badge>
                  </div>
                  
                  {/* Faixas Etárias */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-700 text-center mb-2">
                      Por Faixa Etária:
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {Object.entries(dados.faixasEtarias)
                        .sort(([a], [b]) => {
                          const ordem = ['Bebê', 'Criança', 'Estudante', 'Adulto', 'Idoso', 'Não Informado'];
                          return ordem.indexOf(a) - ordem.indexOf(b);
                        })
                        .map(([faixa, quantidade]) => (
                          <div key={faixa} className={`flex items-center justify-between p-1 rounded text-xs ${
                            faixa === 'Bebê' ? 'bg-pink-50 text-pink-800' :
                            faixa === 'Criança' ? 'bg-blue-50 text-blue-800' :
                            faixa === 'Estudante' ? 'bg-purple-50 text-purple-800' :
                            faixa === 'Adulto' ? 'bg-green-50 text-green-800' :
                            faixa === 'Idoso' ? 'bg-orange-50 text-orange-800' :
                            'bg-gray-50 text-gray-800'
                          }`}>
                            <div className="flex items-center gap-1">
                              {getIconeIdade(faixa)}
                              <span className="truncate">{faixa}</span>
                            </div>
                            <span className="font-bold">{quantidade}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                  
                  <div className="text-center mt-2">
                    <div className="text-xs text-gray-500">
                      {dados.quantidade === 1 ? 'passageiro' : 'passageiros'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          }
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <MapPin className="h-12 w-12 text-gray-300 mb-4" />
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 mb-1">
                Nenhum passeio selecionado
              </div>
              <div className="text-xs text-gray-400">
                Os passageiros ainda não escolheram passeios
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Card de resumo geral */}
      {Object.keys(passeioTotais).length > 0 && (
        <Card className="mt-4 bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-blue-800">
                Resumo Geral
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-blue-600">
                  <span className="font-bold">{Object.keys(passeioTotais).length}</span> tipos de passeios
                </div>
                <div className="text-blue-600">
                  <span className="font-bold">{totalPasseios}</span> passeios totais
                </div>
                <div className="text-blue-600">
                  <span className="font-bold">{passageirosComPasseios}</span> passageiros
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}