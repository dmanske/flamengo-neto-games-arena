import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, CreditCard, Calendar, BarChart3, TrendingUp, Plus, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useIndicadoresFinanceiros } from "@/hooks/financeiro/useIndicadoresFinanceiros";

const DashboardFinanceiro = () => {
  const { indicadores, loading } = useIndicadoresFinanceiros();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container py-6 px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-700 bg-clip-text text-transparent">
            Dashboard Financeiro
          </h1>
          <p className="text-slate-600 mt-2">
            Visão geral da saúde financeira do seu negócio
          </p>
        </div>

        {/* Menu de Navegação Rápida */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Acesso Rápido</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Link to="/dashboard/financeiro/receitas">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 group-hover:bg-green-200 transition-colors">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">Receitas</h3>
                  <p className="text-sm text-slate-600">Gerencie entradas</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/dashboard/financeiro/despesas">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 group-hover:bg-red-200 transition-colors">
                    <CreditCard className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">Despesas</h3>
                  <p className="text-sm text-slate-600">Controle gastos</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/dashboard/financeiro/contas-pagar">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="bg-amber-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 group-hover:bg-amber-200 transition-colors">
                    <Calendar className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">Contas a Pagar</h3>
                  <p className="text-sm text-slate-600">Vencimentos</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/dashboard/financeiro/relatorios">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">Relatórios</h3>
                  <p className="text-sm text-slate-600">Análises</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/dashboard/financeiro/fluxo-caixa">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">Fluxo de Caixa</h3>
                  <p className="text-sm text-slate-600">Projeções</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Ações Rápidas</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/dashboard/financeiro/receitas">
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                <Plus className="h-4 w-4 mr-2" />
                Nova Receita
              </Button>
            </Link>
            <Link to="/dashboard/financeiro/despesas">
              <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
                <Plus className="h-4 w-4 mr-2" />
                Nova Despesa
              </Button>
            </Link>
            <Link to="/dashboard/financeiro/contas-pagar">
              <Button className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800">
                <Plus className="h-4 w-4 mr-2" />
                Nova Conta a Pagar
              </Button>
            </Link>
          </div>
        </div>

        {/* Indicadores Principais */}
        <div className="mb-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="border-0 shadow-lg animate-pulse">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-32"></div>
                      </div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Receita Total</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(indicadores.receita_total)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Despesa Total</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(indicadores.despesa_total)}
                      </p>
                    </div>
                    <CreditCard className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Lucro Líquido</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(indicadores.lucro_liquido)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Margem de Lucro</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {indicadores.margem_lucro.toFixed(1)}%
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Alertas */}
        <div className="mb-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="border-0 shadow-lg animate-pulse">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-40"></div>
                      </div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg border-l-4 border-l-red-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Contas Vencidas</p>
                      <p className="text-2xl font-bold text-red-600">{indicadores.contas_vencidas}</p>
                      <p className="text-sm text-red-500 mt-1">
                        {indicadores.contas_vencidas > 0 ? 'Requer atenção imediata' : 'Nenhuma conta vencida'}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg border-l-4 border-l-amber-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Vencem em 30 dias</p>
                      <p className="text-2xl font-bold text-amber-600">{indicadores.contas_a_vencer_30_dias}</p>
                      <p className="text-sm text-amber-600 mt-1">
                        {indicadores.contas_a_vencer_30_dias > 0 ? 'Planeje os pagamentos' : 'Nenhuma conta vencendo'}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Status do Sistema */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Carregando dados financeiros...</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-blue-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="h-12 w-12 text-blue-600" />
                </div>
                {indicadores.receita_total === 0 && indicadores.despesa_total === 0 ? (
                  <>
                    <h3 className="text-lg font-medium mb-2">Comece a usar o Sistema Financeiro</h3>
                    <p className="text-sm text-slate-600 mb-6">
                      Cadastre suas primeiras receitas e despesas para começar a acompanhar a saúde financeira do seu negócio.
                    </p>
                    <div className="flex justify-center gap-3">
                      <Link to="/dashboard/financeiro/receitas">
                        <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                          Primeira Receita
                        </Button>
                      </Link>
                      <Link to="/dashboard/financeiro/despesas">
                        <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
                          Primeira Despesa
                        </Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium mb-2">Sistema Financeiro Ativo</h3>
                    <p className="text-sm text-slate-600 mb-6">
                      Seus dados financeiros estão sendo monitorados. Continue cadastrando transações para manter o controle atualizado.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(indicadores.receita_total)}</p>
                        <p className="text-xs text-slate-500">Receitas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(indicadores.despesa_total)}</p>
                        <p className="text-xs text-slate-500">Despesas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(indicadores.lucro_liquido)}</p>
                        <p className="text-xs text-slate-500">Lucro</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardFinanceiro;