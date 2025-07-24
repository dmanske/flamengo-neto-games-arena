import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// Componente temporário simplificado
const ExemploIntegracao = () => (
  <div className="p-6 border rounded-lg bg-gray-50">
    <h3 className="font-medium mb-4">Exemplo de Integração</h3>
    <p className="text-gray-600">
      Esta é uma demonstração simplificada do sistema de parcelamento.
      O sistema completo será implementado em breve.
    </p>
    <div className="mt-4 p-4 bg-white rounded border">
      <h4 className="font-medium">Funcionalidades:</h4>
      <ul className="mt-2 space-y-1 text-sm">
        <li>• Cálculo automático de parcelas</li>
        <li>• Validação de prazos</li>
        <li>• Alertas automáticos</li>
        <li>• Integração com WhatsApp</li>
      </ul>
    </div>
  </div>
);
import { 
  Calculator, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Users,
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DemoParcelamento() {
  return (
    <div className="container py-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Sistema de Parcelamento Inteligente
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Automatize o parcelamento de viagens com cálculo inteligente de datas, 
          alertas automáticos e cobrança personalizada.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/dashboard/cadastrar-passageiro-parcelamento">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <CreditCard className="h-5 w-5 mr-2" />
              Testar Agora
            </Button>
          </Link>
          <Button variant="outline" size="lg">
            <Calculator className="h-5 w-5 mr-2" />
            Ver Demonstração
          </Button>
        </div>
      </div>

      {/* Funcionalidades Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Calculator className="h-5 w-5" />
              Cálculo Automático
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Opções automáticas (2x, 3x, 4x)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Respeita prazo de 5 dias antes da viagem
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Intervalo mínimo de 15 dias entre parcelas
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Sem juros para PIX/Transferência
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Calendar className="h-5 w-5" />
              Alertas Inteligentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Lembrete 5 dias antes do vencimento
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Alerta no dia do vencimento
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Cobrança automática após atraso
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Templates personalizados por parcela
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <CreditCard className="h-5 w-5" />
              Gestão Avançada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Edição manual de datas e valores
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Dashboard de vencimentos
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Histórico completo de cobrança
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Integração com sistema financeiro
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Como Funciona */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Como Funciona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">1. Cadastrar Passageiro</h3>
              <p className="text-sm text-gray-600">
                Preencha os dados do passageiro e selecione a viagem
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Calculator className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">2. Escolher Parcelamento</h3>
              <p className="text-sm text-gray-600">
                Sistema calcula opções automáticas ou configure manualmente
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">3. Alertas Automáticos</h3>
              <p className="text-sm text-gray-600">
                Sistema envia lembretes e cobranças automaticamente
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold">4. Controle Financeiro</h3>
              <p className="text-sm text-gray-600">
                Acompanhe pagamentos no dashboard financeiro integrado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exemplo de Uso */}
      <Card>
        <CardHeader>
          <CardTitle>Exemplo Prático</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Viagem: Flamengo x Vasco</h4>
                <p className="text-sm text-gray-600">Data: 15/03/2025 | Valor: R$ 800,00</p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                Prazo limite: 10/03/2025
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded border">
                <h5 className="font-medium mb-2">Opção 1: À vista</h5>
                <p className="text-lg font-bold text-green-600">R$ 800,00</p>
                <p className="text-sm text-gray-600">Pagamento imediato</p>
              </div>

              <div className="bg-white p-4 rounded border">
                <h5 className="font-medium mb-2">Opção 2: 2x sem juros</h5>
                <p className="text-lg font-bold text-blue-600">2x R$ 400,00</p>
                <p className="text-sm text-gray-600">
                  1ª: Hoje | 2ª: 15/02/2025
                </p>
              </div>

              <div className="bg-white p-4 rounded border">
                <h5 className="font-medium mb-2">Opção 3: 3x sem juros</h5>
                <p className="text-lg font-bold text-purple-600">3x R$ 266,67</p>
                <p className="text-sm text-gray-600">
                  Hoje, 01/02 e 16/02/2025
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Sistema automaticamente valida que todas as parcelas vencem antes do prazo limite
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Pronto para Revolucionar sua Gestão Financeira?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Reduza inadimplência, automatize cobranças e tenha controle total 
            sobre os pagamentos das suas viagens.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/dashboard/cadastrar-passageiro-parcelamento">
              <Button size="lg" variant="secondary">
                Começar Agora
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Demonstração Interativa */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Demonstração Interativa</h2>
          <p className="text-gray-600">
            Teste o sistema completo com dados de exemplo
          </p>
        </div>
        
        <ExemploIntegracao />
      </div>
    </div>
  );
}