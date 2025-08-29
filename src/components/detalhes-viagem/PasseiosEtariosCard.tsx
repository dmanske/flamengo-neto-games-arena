import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  Baby, 
  GraduationCap, 
  User, 
  UserCheck,
  ChevronDown,
  ChevronUp,
  Ticket
} from "lucide-react";
import { isPasseioPago } from "@/data/passeios";
import { calcularIdade } from "@/utils/formatters";

interface PassageiroDisplay {
  clientes?: {
    nome?: string;
    telefone?: string;
    email?: string;
    data_nascimento?: string;
  };
  nome?: string;
  data_nascimento?: string;
  passeios?: Array<{ 
    passeio_nome: string; 
    status: string;
    valor_cobrado?: number;
    valor_real_calculado?: number;
  }>;
}

interface PasseiosEtariosCardProps {
  passageiros: PassageiroDisplay[];
}



// Função para categorizar por faixa etária
const categorizarPorIdade = (idade: number): string => {
  if (idade >= 0 && idade <= 5) return 'Bebês/Crianças (0-5 anos)';
  if (idade >= 6 && idade <= 12) return 'Crianças (6-12 anos)';
  if (idade >= 13 && idade <= 17) return 'Estudantes (13-17 anos)';
  if (idade >= 18 && idade <= 59) return 'Adultos (18-59 anos)';
  if (idade >= 60) return 'Idosos (60+ anos)';
  return 'Não informado';
};

// Função para mapear faixa etária para tipo de ingresso
const obterTipoIngresso = (idade: number): string => {
  if (idade >= 0 && idade <= 5) return 'Ingresso Bebê';
  if (idade >= 6 && idade <= 12) return 'Ingresso Criança';
  if (idade >= 13 && idade <= 17) return 'Ingresso Estudante';
  if (idade >= 18 && idade <= 59) return 'Ingresso Adulto';
  if (idade >= 60) return 'Ingresso Idoso';
  return 'Ingresso Não Informado';
};

export function PasseiosEtariosCard({ passageiros }: PasseiosEtariosCardProps) {
  const [expandido, setExpandido] = useState(false);



  // Filtrar apenas passageiros que selecionaram passeios
  const passageirosComPasseios = passageiros.filter(p => p.passeios && p.passeios.length > 0);



  // Armazenar nomes dos passageiros sem data de nascimento
  const passageirosSemData: string[] = [];

  // Calcular resumo de tipos de ingresso (APENAS dos que têm passeios)
  const resumoIngressos = passageirosComPasseios.reduce((acc, p) => {
    const nomePassageiro = p.clientes?.nome || p.nome || 'Nome não encontrado';
    const dataNasc = p.clientes?.data_nascimento || p.data_nascimento;
    

    
    if (dataNasc && dataNasc.trim() !== '') {
      const idade = calcularIdade(dataNasc);
      const tipoIngresso = obterTipoIngresso(idade);
      acc[tipoIngresso] = (acc[tipoIngresso] || 0) + 1;
      

    } else {
      acc['Ingresso Não Informado'] = (acc['Ingresso Não Informado'] || 0) + 1;
      
      // Capturar nome do passageiro problemático
      passageirosSemData.push(nomePassageiro);
      

    }
    return acc;
  }, {} as Record<string, number>);

  // Calcular resumo de passeios (contando participações por passeio)
  const passeioResumo = passageiros.reduce((acc, p) => {
    if (p.passeios && p.passeios.length > 0) {
      p.passeios.forEach(passeio => {
        if (!acc[passeio.passeio_nome]) {
          acc[passeio.passeio_nome] = {
            count: 0,
            isPago: isPasseioPago(passeio.passeio_nome)
          };
        }
        acc[passeio.passeio_nome].count += 1;
      });
    }
    return acc;
  }, {} as Record<string, { count: number; isPago: boolean }>);

  // Separar passeios pagos e gratuitos
  const passeiosPagos = Object.entries(passeioResumo).filter(([_, data]) => data.isPago);
  const passeiosGratuitos = Object.entries(passeioResumo).filter(([_, data]) => !data.isPago);

  // Calcular totais CORRETOS - passageiros únicos, não participações
  const totalPassageiros = passageiros.length;
  
  // Passageiros únicos com passeios pagos
  const passageirosComPasseiosPagos = passageiros.filter(p => 
    p.passeios && p.passeios.some(passeio => isPasseioPago(passeio.passeio_nome))
  ).length;
  
  // Passageiros únicos com passeios gratuitos
  const passageirosComPasseiosGratuitos = passageiros.filter(p => 
    p.passeios && p.passeios.some(passeio => !isPasseioPago(passeio.passeio_nome))
  ).length;

  // Percentuais corretos
  const percentualComPasseiosPagos = totalPassageiros > 0 ? Math.round((passageirosComPasseiosPagos / totalPassageiros) * 100) : 0;
  const percentualComPasseiosGratuitos = totalPassageiros > 0 ? Math.round((passageirosComPasseiosGratuitos / totalPassageiros) * 100) : 0;

  // Debug final
  console.log('🎯 Estado final dos arrays:', {
    resumoIngressos,
    passageirosSemData,
    totalPassageirosComPasseios: passageirosComPasseios.length,
    ingressosNaoInformado: resumoIngressos['Ingresso Não Informado']
  });

  const getIconeIdade = (categoria: string) => {
    if (categoria.includes('Bebês') || categoria.includes('Bebê')) return <Baby className="h-4 w-4 text-pink-600" />;
    if (categoria.includes('Crianças') && !categoria.includes('Bebês')) return <Baby className="h-4 w-4" />;
    if (categoria.includes('Estudantes')) return <GraduationCap className="h-4 w-4" />;
    if (categoria.includes('Adultos')) return <User className="h-4 w-4" />;
    if (categoria.includes('Idosos')) return <UserCheck className="h-4 w-4" />;
    return <Users className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Passeios & Faixas Etárias
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandido(!expandido)}
            className="h-8 w-8 p-0"
          >
            {expandido ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Resumo Geral */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Total Passageiros</span>
            </div>
            <div className="text-lg font-bold text-blue-900">
              {totalPassageiros}
            </div>
            <div className="text-xs text-blue-600">
              na viagem
            </div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Passeios Pagos</span>
            </div>
            <div className="text-lg font-bold text-green-900">
              {passageirosComPasseiosPagos}
            </div>
            <div className="text-xs text-green-600">
              {percentualComPasseiosPagos}% dos passageiros
            </div>
          </div>

          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <Ticket className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Passeios Gratuitos</span>
            </div>
            <div className="text-lg font-bold text-orange-900">
              {passageirosComPasseiosGratuitos}
            </div>
            <div className="text-xs text-orange-600">
              {percentualComPasseiosGratuitos}% dos passageiros
            </div>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Tipos Disponíveis</span>
            </div>
            <div className="text-lg font-bold text-purple-900">
              {Object.keys(passeioResumo).length}
            </div>
            <div className="text-xs text-purple-600">
              {passeiosPagos.length} pagos, {passeiosGratuitos.length} gratuitos
            </div>
          </div>
        </div>

        {/* Tipos de Ingresso por Faixa Etária */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Ingressos por Faixa Etária (Passageiros com Passeios)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.entries(resumoIngressos)
              .filter(([tipo]) => tipo !== 'Ingresso Não Informado') // Filtrar "Não informado" primeiro
              .sort(([a], [b]) => {
                const ordem = ['Ingresso Bebê', 'Ingresso Criança', 'Ingresso Estudante', 'Ingresso Adulto', 'Ingresso Idoso'];
                return ordem.indexOf(a) - ordem.indexOf(b);
              })
              .map(([tipoIngresso, count]) => (
                <div key={tipoIngresso} className={`flex flex-col items-center p-3 rounded border ${
                  tipoIngresso === 'Ingresso Bebê' 
                    ? 'bg-pink-50 border-pink-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {getIconeIdade(tipoIngresso)}
                    <span className={`text-xs font-medium ${
                      tipoIngresso === 'Ingresso Bebê' 
                        ? 'text-pink-800' 
                        : 'text-blue-800'
                    }`}>
                      {tipoIngresso.replace('Ingresso ', '')}
                    </span>
                  </div>
                  <div className={`text-lg font-bold ${
                    tipoIngresso === 'Ingresso Bebê' 
                      ? 'text-pink-900' 
                      : 'text-blue-900'
                  }`}>{count}</div>
                  <div className={`text-xs ${
                    tipoIngresso === 'Ingresso Bebê' 
                      ? 'text-pink-600' 
                      : 'text-blue-600'
                  }`}>
                    {tipoIngresso === 'Ingresso Bebê' && '0-5 anos'}
                    {tipoIngresso === 'Ingresso Criança' && '6-12 anos'}
                    {tipoIngresso === 'Ingresso Estudante' && '13-17 anos'}
                    {tipoIngresso === 'Ingresso Adulto' && '18-59 anos'}
                    {tipoIngresso === 'Ingresso Idoso' && '60+ anos'}
                  </div>
                </div>
              ))}
            
            {/* Mostrar "Não informado" separadamente se existir E for maior que 0 */}
            {resumoIngressos['Ingresso Não Informado'] && resumoIngressos['Ingresso Não Informado'] > 0 && (
              <div className="flex flex-col items-center p-3 bg-red-50 rounded border border-red-200">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-red-600" />
                  <span className="text-xs font-medium text-red-800">Idade Não Informada</span>
                </div>
                <div className="text-lg font-bold text-red-900">{resumoIngressos['Ingresso Não Informado']}</div>
                <div className="text-xs text-red-600 text-center">
                  <div className="font-bold text-red-800">
                    👤 {passageirosSemData.length > 0 ? passageirosSemData.join(', ') : 'Nome não capturado'}
                  </div>
                  <div className="mt-1">sem data nasc.</div>
                  <div className="mt-1 text-xs text-gray-500">
                    Debug: {passageirosSemData.length} nomes capturados
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Passeios Detalhados - Expandível */}
        {expandido && (
          <div className="space-y-4 border-t pt-4">
            {/* Passeios Pagos */}
            {passeiosPagos.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  Passeios Pagos ({passeiosPagos.length} tipos)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {passeiosPagos
                    .sort(([, a], [, b]) => b.count - a.count)
                    .map(([passeio, data]) => (
                      <div key={passeio} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                        <span className="text-sm text-green-800 truncate flex-1" title={passeio}>
                          {passeio}
                        </span>
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          {data.count}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Passeios Gratuitos */}
            {passeiosGratuitos.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-blue-600" />
                  Passeios Gratuitos ({passeiosGratuitos.length} tipos)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {passeiosGratuitos
                    .sort(([, a], [, b]) => b.count - a.count)
                    .map(([passeio, data]) => (
                      <div key={passeio} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                        <span className="text-sm text-blue-800 truncate flex-1" title={passeio}>
                          {passeio}
                        </span>
                        <Badge variant="outline" className="text-blue-700 border-blue-300">
                          {data.count}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Estado vazio */}
            {passeiosPagos.length === 0 && passeiosGratuitos.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Nenhum passageiro inscrito em passeios</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}