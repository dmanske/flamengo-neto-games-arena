import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Trophy,
  Star,
  Target,
  Zap,
  Crown,
  AlertTriangle,
  TrendingDown,
  Minus,
  RefreshCw
} from 'lucide-react';
import { useClienteEstatisticas } from '@/hooks/useClienteEstatisticas';

interface EstatisticasInsightsProps {
  clienteId: string;
}

const EstatisticasInsights: React.FC<EstatisticasInsightsProps> = ({ clienteId }) => {
  const { estatisticas, loading, error, refetch } = useClienteEstatisticas(clienteId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !estatisticas) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600">Erro ao carregar estatísticas</p>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }
  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'VIP':
        return <Crown className="h-3 w-3" />;
      case 'Fiel':
        return <Target className="h-3 w-3" />;
      case 'Pontual':
        return <Zap className="h-3 w-3" />;
      case 'Bom Pagador':
        return <Star className="h-3 w-3" />;
      default:
        return <Trophy className="h-3 w-3" />;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'VIP':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'Fiel':
        return 'bg-blue-100 text-blue-800';
      case 'Pontual':
        return 'bg-green-100 text-green-800';
      case 'Bom Pagador':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'crescente':
      case 'aumentando':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decrescente':
      case 'diminuindo':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com botão de refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Estatísticas e Insights</h2>
          <p className="text-sm text-gray-500">Análise completa do perfil do cliente</p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900">
              {estatisticas.tempo_relacionamento.anos > 0 
                ? `${estatisticas.tempo_relacionamento.anos} ano${estatisticas.tempo_relacionamento.anos > 1 ? 's' : ''}`
                : estatisticas.tempo_relacionamento.meses > 0
                ? `${estatisticas.tempo_relacionamento.meses} mês${estatisticas.tempo_relacionamento.meses > 1 ? 'es' : ''}`
                : `${estatisticas.tempo_relacionamento.dias} dias`
              }
            </div>
            <div className="text-sm text-gray-500">Cliente há</div>
            <div className="text-xs text-gray-400">Desde {estatisticas.cliente_desde}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900">
              {estatisticas.frequencia_viagens.por_ano}
            </div>
            <div className="text-sm text-gray-500">Viagens por ano</div>
            <div className="text-xs text-gray-400">
              ~{Math.round(estatisticas.frequencia_viagens.por_ano / 12)} por mês
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900">
              {estatisticas.adversario_favorito.nome}
            </div>
            <div className="text-sm text-gray-500">Adversário favorito</div>
            <div className="text-xs text-gray-400">
              {estatisticas.adversario_favorito.percentual}% das viagens
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className={`text-lg font-bold ${getScoreColor(estatisticas.score_fidelidade)}`}>
              {estatisticas.score_fidelidade}/100
            </div>
            <div className="text-sm text-gray-500">Score Fidelidade</div>
            <div className="text-xs text-gray-400">
              {estatisticas.score_fidelidade >= 80 ? 'Excelente' : 
               estatisticas.score_fidelidade >= 60 ? 'Bom' : 'Regular'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Perfil do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Perfil do Cliente</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Adversário Favorito</label>
                <p className="text-lg font-semibold text-gray-900">
                  {estatisticas.adversario_favorito.nome}
                  <span className="text-sm text-gray-500 ml-2">
                    ({estatisticas.adversario_favorito.quantidade} jogos, {estatisticas.adversario_favorito.percentual}%)
                  </span>
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Mês Preferido</label>
                <p className="text-lg font-semibold text-gray-900">
                  {estatisticas.sazonalidade.mes_favorito}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Formas de Pagamento</label>
                <div className="space-y-2 mt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">PIX</span>
                    <span className="text-sm font-medium">{estatisticas.formas_pagamento.pix}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${estatisticas.formas_pagamento.pix}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cartão</span>
                    <span className="text-sm font-medium">{estatisticas.formas_pagamento.cartao}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${estatisticas.formas_pagamento.cartao}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Dinheiro</span>
                    <span className="text-sm font-medium">{estatisticas.formas_pagamento.dinheiro}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${estatisticas.formas_pagamento.dinheiro}%` }}
                    />
                  </div>
                  
                  {estatisticas.formas_pagamento.outros > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Outros</span>
                        <span className="text-sm font-medium">{estatisticas.formas_pagamento.outros}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${estatisticas.formas_pagamento.outros}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Padrões de Comportamento */}
              <div>
                <label className="text-sm font-medium text-gray-500">Tendências</label>
                <div className="space-y-2 mt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ticket Médio</span>
                    <div className="flex items-center space-x-1">
                      {getTendenciaIcon(estatisticas.padroes_comportamento.ticket_medio_evolucao)}
                      <span className="text-sm font-medium capitalize">
                        {estatisticas.padroes_comportamento.ticket_medio_evolucao}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Frequência</span>
                    <div className="flex items-center space-x-1">
                      {getTendenciaIcon(estatisticas.padroes_comportamento.frequencia_tendencia)}
                      <span className="text-sm font-medium capitalize">
                        {estatisticas.padroes_comportamento.frequencia_tendencia}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Atividade Mensal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span>Atividade Mensal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {estatisticas.sazonalidade.distribuicao_mensal.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">Dados insuficientes para análise sazonal</p>
              <p className="text-sm text-gray-500">
                Mais dados serão disponibilizados conforme o histórico aumenta
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((mes) => {
                const dadosMes = estatisticas.sazonalidade.distribuicao_mensal.find(d => d.mes === mes);
                const quantidade = dadosMes?.quantidade || 0;
                const maxQuantidade = Math.max(...estatisticas.sazonalidade.distribuicao_mensal.map(d => d.quantidade));
                const largura = maxQuantidade > 0 ? (quantidade / maxQuantidade) * 100 : 0;
                
                return (
                  <div key={mes} className="flex items-center space-x-3">
                    <div className="w-8 text-sm text-gray-600">{mes}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full transition-all duration-300 ${
                          mes === estatisticas.sazonalidade.mes_favorito 
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-600'
                        }`}
                        style={{ width: `${largura}%` }}
                      />
                    </div>
                    <div className="w-8 text-sm text-gray-600 text-right">{quantidade}</div>
                    {dadosMes && (
                      <div className="w-12 text-xs text-gray-500 text-right">
                        {dadosMes.percentual}%
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badges e Conquistas */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-800">
            <Trophy className="h-5 w-5" />
            <span>Badges e Conquistas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {estatisticas.badges.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600">Nenhuma conquista ainda</p>
              <p className="text-sm text-gray-500">
                Badges serão desbloqueadas conforme a atividade do cliente
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {estatisticas.badges.map((badge, index) => (
                  <Badge 
                    key={index}
                    className={`${getBadgeColor(badge)} px-3 py-1 text-sm font-medium`}
                  >
                    {getBadgeIcon(badge)}
                    <span className="ml-1">{badge}</span>
                  </Badge>
                ))}
              </div>
              
              {/* Resumo de Conquistas */}
              <div className="bg-white/50 rounded-lg p-3 border border-yellow-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-orange-800">
                      {estatisticas.badges.length}
                    </div>
                    <div className="text-xs text-orange-600">Badges Ativas</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-800">
                      {estatisticas.frequencia_viagens.por_ano || 0}
                    </div>
                    <div className="text-xs text-orange-600">Viagens/Ano</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-800">
                      {estatisticas.tempo_relacionamento.anos || 0}
                    </div>
                    <div className="text-xs text-orange-600">Anos Conosco</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-800">
                      {estatisticas.score_fidelidade}
                    </div>
                    <div className="text-xs text-orange-600">Score Fidelidade</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights e Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-indigo-600" />
            <span>Insights e Recomendações</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Insights baseados nos dados */}
            {estatisticas.score_fidelidade >= 80 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Star className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">Cliente VIP</h4>
                    <p className="text-sm text-green-700">
                      Este cliente tem alta fidelidade ({estatisticas.score_fidelidade}/100). 
                      Considere oferecer benefícios exclusivos ou descontos especiais.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {estatisticas.padroes_comportamento.ticket_medio_evolucao === 'crescente' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Ticket Médio Crescente</h4>
                    <p className="text-sm text-blue-700">
                      O valor médio das viagens está aumentando. Ótima oportunidade para 
                      oferecer pacotes premium ou serviços adicionais.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {estatisticas.formas_pagamento.pix >= 70 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-800">Preferência Digital</h4>
                    <p className="text-sm text-purple-700">
                      Cliente prefere pagamentos digitais ({estatisticas.formas_pagamento.pix}% PIX). 
                      Ideal para promoções via app ou cashback digital.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {estatisticas.sazonalidade.mes_favorito !== 'Nenhum' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-800">Padrão Sazonal</h4>
                    <p className="text-sm text-orange-700">
                      Cliente mais ativo em {estatisticas.sazonalidade.mes_favorito}. 
                      Planeje campanhas direcionadas para este período.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {estatisticas.frequencia_viagens.por_ano < 3 && estatisticas.tempo_relacionamento.anos >= 1 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Baixa Frequência</h4>
                    <p className="text-sm text-yellow-700">
                      Cliente com baixa frequência de viagens. Considere campanhas de 
                      reativação ou pesquisa de satisfação.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EstatisticasInsights;