import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ResumoGeral, ViagemFinanceiro } from '@/hooks/useFinanceiroGeral';

interface RelatoriosTabProps {
  resumoGeral: ResumoGeral | null;
  viagensFinanceiro: ViagemFinanceiro[];
  filtroData: { inicio: string; fim: string };
}

export function RelatoriosTab({ resumoGeral, viagensFinanceiro, filtroData }: RelatoriosTabProps) {
  // Calcular métricas adicionais
  const viagensLucrativas = viagensFinanceiro.filter(v => v.lucro > 0).length;
  const viagensPrejuizo = viagensFinanceiro.filter(v => v.lucro < 0).length;
  const margemMedia = viagensFinanceiro.length > 0 
    ? viagensFinanceiro.reduce((sum, v) => sum + v.margem, 0) / viagensFinanceiro.length 
    : 0;

  const melhorViagem = viagensFinanceiro.reduce((melhor, atual) => 
    atual.lucro > melhor.lucro ? atual : melhor, 
    viagensFinanceiro[0] || { lucro: 0, adversario: 'N/A', margem: 0 }
  );

  const piorViagem = viagensFinanceiro.reduce((pior, atual) => 
    atual.lucro < pior.lucro ? atual : pior, 
    viagensFinanceiro[0] || { lucro: 0, adversario: 'N/A', margem: 0 }
  );

  const gerarRelatorioPDF = (tipo: string) => {
    // TODO: Implementar geração de PDF
    console.log(`Gerando relatório ${tipo}`);
  };

  return (
    <div className="space-y-6">
      {/* Ações de Relatório */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Relatórios Financeiros</h3>
          <p className="text-sm text-gray-600">
            Período: {new Date(filtroData.inicio).toLocaleDateString()} até {new Date(filtroData.fim).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => gerarRelatorioPDF('completo')}>
            <Download className="h-4 w-4 mr-2" />
            Relatório Completo
          </Button>
          <Button variant="outline" onClick={() => gerarRelatorioPDF('dre')}>
            <FileText className="h-4 w-4 mr-2" />
            DRE
          </Button>
        </div>
      </div>

      {/* Resumo Executivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Resumo Executivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(resumoGeral?.total_receitas || 0)}
              </div>
              <div className="text-sm text-gray-600">Receita Total</div>
              <div className="mt-1">
                <Badge className="bg-green-100 text-green-800">
                  +{resumoGeral?.crescimento_receitas || 0}%
                </Badge>
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(resumoGeral?.total_despesas || 0)}
              </div>
              <div className="text-sm text-gray-600">Despesas Total</div>
              <div className="mt-1">
                <Badge className="bg-red-100 text-red-800">
                  +{resumoGeral?.crescimento_despesas || 0}%
                </Badge>
              </div>
            </div>

            <div className="text-center">
              <div className={`text-2xl font-bold ${
                (resumoGeral?.lucro_liquido || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(resumoGeral?.lucro_liquido || 0)}
              </div>
              <div className="text-sm text-gray-600">Lucro Líquido</div>
              <div className="mt-1">
                <Badge className="bg-blue-100 text-blue-800">
                  {resumoGeral?.margem_lucro?.toFixed(1) || 0}% margem
                </Badge>
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(resumoGeral?.total_pendencias || 0)}
              </div>
              <div className="text-sm text-gray-600">Pendências</div>
              <div className="mt-1">
                <Badge className="bg-orange-100 text-orange-800">
                  {resumoGeral?.count_pendencias || 0} contas
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance das Viagens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance das Viagens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-600">{viagensLucrativas}</div>
                  <div className="text-xs text-gray-600">Lucrativas</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-600">{viagensPrejuizo}</div>
                  <div className="text-xs text-gray-600">Prejuízo</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">{margemMedia.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">Margem Média</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Melhor Performance</span>
                  <Badge className="bg-green-100 text-green-800">
                    {melhorViagem.margem?.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{melhorViagem.adversario}</span>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(melhorViagem.lucro)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Pior Performance</span>
                  <Badge className="bg-red-100 text-red-800">
                    {piorViagem.margem?.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{piorViagem.adversario}</span>
                  <span className="text-sm font-medium text-red-600">
                    {formatCurrency(piorViagem.lucro)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Breakdown de Receitas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resumoGeral && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Viagens</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(resumoGeral.receitas_viagem)}</div>
                      <div className="text-xs text-gray-500">{resumoGeral.percentual_viagem.toFixed(1)}%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Passeios</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(resumoGeral.receitas_passeios)}</div>
                      <div className="text-xs text-gray-500">{resumoGeral.percentual_passeios.toFixed(1)}%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Extras</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(resumoGeral.receitas_extras)}</div>
                      <div className="text-xs text-gray-500">{resumoGeral.percentual_extras.toFixed(1)}%</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3 mt-4">
                    <div className="flex items-center justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(resumoGeral.total_receitas)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {!resumoGeral && (
                <div className="text-center py-8 text-gray-500">
                  <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Carregando dados de receitas...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranking de Viagens */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking de Viagens por Rentabilidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {viagensFinanceiro
              .sort((a, b) => b.margem - a.margem)
              .map((viagem, index) => (
                <div key={viagem.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{viagem.adversario}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(viagem.data_jogo).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Receitas</div>
                      <div className="font-medium text-green-600">
                        {formatCurrency(viagem.total_receitas)}
                      </div>
                      <div className="text-xs text-gray-500">
                        V: {formatCurrency(viagem.receitas_viagem)} | P: {formatCurrency(viagem.receitas_passeios)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Despesas</div>
                      <div className="font-medium text-red-600">
                        {formatCurrency(viagem.total_despesas)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Lucro</div>
                      <div className={`font-medium ${
                        viagem.lucro >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(viagem.lucro)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Margem</div>
                      <Badge className={
                        viagem.margem >= 20 ? 'bg-green-100 text-green-800' :
                        viagem.margem >= 10 ? 'bg-yellow-100 text-yellow-800' :
                        viagem.margem >= 0 ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {viagem.margem.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Relatórios Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <h4 className="font-medium">DRE Mensal</h4>
                  <p className="text-sm text-gray-600">Demonstrativo de Resultado</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Gerar PDF
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="h-8 w-8 text-green-600" />
                <div>
                  <h4 className="font-medium">Fluxo de Caixa</h4>
                  <p className="text-sm text-gray-600">Entradas e saídas</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Gerar PDF
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <h4 className="font-medium">Performance</h4>
                  <p className="text-sm text-gray-600">Análise por viagem</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Gerar PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}