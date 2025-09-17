import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, Baby, GraduationCap, User, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { calcularIdade } from "@/utils/formatters";
import { 
  categorizarIdadePorPasseio, 
  obterDescricaoFaixaEtaria,
  detectarTipoPasseio,
  type FaixaEtariaConfig 
} from "@/utils/passeiosFaixasEtarias";

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

// Função para obter ícone por tipo
const getIconeIdade = (icone: string) => {
  switch (icone) {
    case 'baby': return <Baby className="h-3 w-3" />;
    case 'graduationCap': return <GraduationCap className="h-3 w-3" />;
    case 'user': return <User className="h-3 w-3" />;
    case 'userCheck': return <UserCheck className="h-3 w-3" />;
    default: return <Users className="h-3 w-3" />;
  }
};

export function PasseiosTotaisCard({ passageiros, className }: PasseiosTotaisCardProps) {
  // Calcular totais de passeios com faixas etárias específicas
  const passeioTotais = passageiros.reduce((acc, passageiro) => {
    if (passageiro.passeios && passageiro.passeios.length > 0) {
      // Calcular idade do passageiro
      const dataNasc = passageiro.clientes?.data_nascimento || passageiro.data_nascimento;
      
      passageiro.passeios.forEach(passeio => {
        const nomePasseio = passeio.passeio?.nome || passeio.passeio_nome || 'Passeio não identificado';
        
        if (!acc[nomePasseio]) {
          acc[nomePasseio] = {
            quantidade: 0,
            faixasEtarias: {},
            tipoPasseio: detectarTipoPasseio(nomePasseio)
          };
        }
        
        // Categorizar idade específica para este passeio
        let faixaEtaria: FaixaEtariaConfig;
        if (dataNasc && dataNasc.trim() !== '') {
          const idade = calcularIdade(dataNasc);
          faixaEtaria = categorizarIdadePorPasseio(idade, nomePasseio);
        } else {
          faixaEtaria = {
            nome: 'Não Informado',
            idadeMin: 0,
            idadeMax: 0,
            cor: 'bg-gray-50',
            corTexto: 'text-gray-800',
            icone: 'users'
          };
        }
        
        acc[nomePasseio].quantidade += 1;
        
        const chave = faixaEtaria.nome;
        if (!acc[nomePasseio].faixasEtarias[chave]) {
          acc[nomePasseio].faixasEtarias[chave] = {
            quantidade: 0,
            config: faixaEtaria
          };
        }
        acc[nomePasseio].faixasEtarias[chave].quantidade += 1;
      });
    }
    return acc;
  }, {} as Record<string, { 
    quantidade: number; 
    faixasEtarias: Record<string, { quantidade: number; config: FaixaEtariaConfig }>;
    tipoPasseio: string;
  }>);

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
              <Card key={nomePasseio} className={`hover:shadow-md transition-shadow ${
                dados.tipoPasseio !== 'padrao' ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''
              }`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium truncate" title={nomePasseio}>
                      {nomePasseio}
                    </CardTitle>
                    {dados.tipoPasseio !== 'padrao' && (
                      <div className="text-xs text-blue-600 font-medium mt-1">
                        ⭐ Faixas Específicas
                      </div>
                    )}
                  </div>
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center mb-3">
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      <Users className="h-4 w-4 mr-2" />
                      {dados.quantidade}
                    </Badge>
                  </div>
                  
                  {/* Faixas Etárias Específicas - Versão Compacta */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-700 text-center mb-2">
                      {dados.tipoPasseio !== 'padrao' ? 'Tipos de Ingresso:' : 'Por Faixa Etária:'}
                    </div>
                    
                    {dados.tipoPasseio !== 'padrao' ? (
                      // Layout compacto para passeios específicos
                      <div className="grid grid-cols-2 gap-1">
                        {Object.entries(dados.faixasEtarias)
                          .sort(([, a], [, b]) => a.config.idadeMin - b.config.idadeMin)
                          .map(([faixa, dadosFaixa]) => (
                            <div key={faixa} className={`flex items-center justify-between p-1.5 rounded text-xs ${
                              dadosFaixa.config.cor
                            } ${dadosFaixa.config.corTexto}`}>
                              <div className="flex items-center gap-1">
                                {getIconeIdade(dadosFaixa.config.icone)}
                                <div className="flex flex-col">
                                  <span className="font-medium text-xs">{dadosFaixa.config.nome}</span>
                                  <span className="text-xs opacity-75">
                                    {obterDescricaoFaixaEtaria(dadosFaixa.config)}
                                  </span>
                                </div>
                              </div>
                              <span className="font-bold">{dadosFaixa.quantidade}</span>
                            </div>
                          ))
                        }
                      </div>
                    ) : (
                      // Layout original para passeios padrão
                      <div className="grid grid-cols-2 gap-1">
                        {Object.entries(dados.faixasEtarias)
                          .sort(([, a], [, b]) => a.config.idadeMin - b.config.idadeMin)
                          .map(([faixa, dadosFaixa]) => (
                            <div key={faixa} className={`flex items-center justify-between p-1 rounded text-xs ${
                              dadosFaixa.config.cor
                            } ${dadosFaixa.config.corTexto}`}>
                              <div className="flex items-center gap-1">
                                {getIconeIdade(dadosFaixa.config.icone)}
                                <span className="truncate">{dadosFaixa.config.nome}</span>
                              </div>
                              <span className="font-bold">{dadosFaixa.quantidade}</span>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center mt-3">
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