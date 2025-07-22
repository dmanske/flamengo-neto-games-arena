import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

interface FinanceiroSimplesProps {
  viagemId: string;
}

export function FinanceiroSimples({ viagemId }: FinanceiroSimplesProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Sistema Financeiro - Teste
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-lg">✅ Componente financeiro carregado com sucesso!</p>
            <p className="text-sm text-gray-600">Viagem ID: {viagemId}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card className="bg-green-50">
                <CardContent className="p-4">
                  <h3 className="font-medium text-green-800">Receitas</h3>
                  <p className="text-2xl font-bold text-green-600">R$ 0,00</p>
                </CardContent>
              </Card>
              
              <Card className="bg-red-50">
                <CardContent className="p-4">
                  <h3 className="font-medium text-red-800">Despesas</h3>
                  <p className="text-2xl font-bold text-red-600">R$ 0,00</p>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <h3 className="font-medium text-blue-800">Lucro</h3>
                  <p className="text-2xl font-bold text-blue-600">R$ 0,00</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800 font-medium">🚧 Sistema em desenvolvimento</p>
              <p className="text-sm text-yellow-700 mt-1">
                As funcionalidades completas serão ativadas após os testes iniciais.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}