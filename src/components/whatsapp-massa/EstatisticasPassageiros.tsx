import React from 'react';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, MessageCircle, UserX } from 'lucide-react';

interface Passageiro {
  id: string;
  nome?: string;
  telefone?: string;
  clientes?: {
    nome?: string;
    telefone?: string;
  };
}

interface EstatisticasPassageirosProps {
  passageirosFiltrados: Passageiro[];
  totalPassageiros: number;
  filtroAtual: string;
}

export const EstatisticasPassageiros: React.FC<EstatisticasPassageirosProps> = ({
  passageirosFiltrados,
  totalPassageiros,
  filtroAtual
}) => {
  // Contar passageiros com telefone válido
  const passageirosComTelefone = passageirosFiltrados.filter(passageiro => {
    const telefone = passageiro.telefone || passageiro.clientes?.telefone;
    if (!telefone || telefone.trim() === '') return false;
    
    const telefoneNumeros = telefone.replace(/\D/g, '');
    return telefoneNumeros.length >= 10;
  });
  
  const comTelefone = passageirosComTelefone.length;
  const semTelefone = passageirosFiltrados.length - comTelefone;
  const percentualCobertura = passageirosFiltrados.length > 0 
    ? Math.round((comTelefone / passageirosFiltrados.length) * 100)
    : 0;
  
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Estatísticas dos Destinatários:</Label>
      
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 border-green-200 bg-green-50">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <MessageCircle className="h-4 w-4 text-green-600 mr-1" />
            </div>
            <div className="text-2xl font-bold text-green-600">{comTelefone}</div>
            <div className="text-xs text-green-700 font-medium">Com WhatsApp</div>
          </div>
        </Card>
        
        <Card className="p-3 border-gray-200 bg-gray-50">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <UserX className="h-4 w-4 text-gray-500 mr-1" />
            </div>
            <div className="text-2xl font-bold text-gray-500">{semTelefone}</div>
            <div className="text-xs text-gray-600 font-medium">Sem telefone</div>
          </div>
        </Card>
      </div>
      
      {/* Informações adicionais */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-blue-700">Filtro aplicado:</span>
            <span className="font-medium text-blue-800">
              {filtroAtual === 'todos' ? 'Todos os passageiros' : 'Ônibus específico'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Cobertura WhatsApp:</span>
            <span className="font-medium text-blue-800">{percentualCobertura}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Total selecionado:</span>
            <span className="font-medium text-blue-800">
              {passageirosFiltrados.length} de {totalPassageiros}
            </span>
          </div>
        </div>
      </div>
      
      {/* Alertas */}
      {semTelefone > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-sm text-yellow-800">
            <strong>{semTelefone}</strong> passageiro{semTelefone > 1 ? 's' : ''} 
            {semTelefone > 1 ? ' não têm' : ' não tem'} telefone cadastrado e 
            {semTelefone > 1 ? ' serão excluídos' : ' será excluído'} da lista de WhatsApp.
          </AlertDescription>
        </Alert>
      )}
      
      {comTelefone === 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-sm text-red-800">
            <strong>Nenhum passageiro</strong> com telefone válido foi encontrado com os filtros aplicados.
          </AlertDescription>
        </Alert>
      )}
      
      {comTelefone > 0 && (
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border">
          ✅ <strong>{comTelefone}</strong> mensagem{comTelefone > 1 ? 's' : ''} 
          {comTelefone > 1 ? ' serão enviadas' : ' será enviada'} via WhatsApp Business
        </div>
      )}
    </div>
  );
};