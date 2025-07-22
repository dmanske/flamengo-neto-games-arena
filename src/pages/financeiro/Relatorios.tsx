import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, BarChart3, PieChart } from "lucide-react";
import { toast } from "sonner";

const Relatorios = () => {
  const handleGerarRelatorio = (tipo: string) => {
    toast.info(`Relatório de ${tipo} será implementado em breve`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container py-6 px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-700 bg-clip-text text-transparent">
            Relatórios Financeiros
          </h1>
          <p className="text-slate-600 mt-2">
            Análises detalhadas do desempenho financeiro
          </p>
        </div>

        {/* Tipos de Relatórios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => handleGerarRelatorio('Receitas')}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Receitas</h3>
                <p className="text-sm text-slate-600">
                  Análise detalhada das receitas por período
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => handleGerarRelatorio('Despesas')}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="font-semibold mb-2">Despesas</h3>
                <p className="text-sm text-slate-600">
                  Controle de gastos por categoria
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <PieChart className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Lucratividade</h3>
                <p className="text-sm text-slate-600">
                  Análise de margem e rentabilidade
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Fluxo de Caixa</h3>
                <p className="text-sm text-slate-600">
                  Projeções e análise de fluxo
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Relatórios Recentes */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Relatórios Recentes</CardTitle>
            <CardDescription>
              Últimos relatórios gerados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-slate-500">
              <div className="bg-slate-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhum relatório gerado</h3>
              <p className="text-sm mb-6">
                Selecione um tipo de relatório acima para começar
              </p>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Relatorios;