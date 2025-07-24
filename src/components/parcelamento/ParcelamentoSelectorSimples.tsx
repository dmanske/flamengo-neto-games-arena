import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calculator, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Edit3,
  Clock,
  CreditCard
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Tipos simples para o componente
interface ParcelaSimples {
  numero: number;
  valor: number;
  dataVencimento: Date;
  status: 'pendente' | 'pago';
}

interface ParcelamentoSelectorSimplesProps {
  valorTotal: number;
  dataViagem: Date;
  onParcelamentoChange: (parcelas: ParcelaSimples[]) => void;
  valorInicial?: ParcelaSimples[];
}

export function ParcelamentoSelectorSimples({ 
  valorTotal, 
  dataViagem, 
  onParcelamentoChange,
  valorInicial = []
}: ParcelamentoSelectorSimplesProps) {
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<'avista' | number | 'personalizado'>('avista');
  const [parcelasPersonalizadas, setParcelasPersonalizadas] = useState<ParcelaSimples[]>([]);
  const [modoEdicao, setModoEdicao] = useState(false);

  // Calcular prazo limite (5 dias antes da viagem)
  const prazoLimite = new Date(dataViagem);
  prazoLimite.setDate(prazoLimite.getDate() - 5);

  const diasRestantes = Math.ceil(
    (prazoLimite.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calcular opções de parcelamento disponíveis
  const calcularOpcoes = () => {
    const opcoes = [];
    const hoje = new Date();
    
    // Verificar quantas parcelas cabem (mínimo 15 dias entre parcelas)
    const maxParcelas = Math.floor(diasRestantes / 15) + 1;
    
    for (let parcelas = 2; parcelas <= Math.min(maxParcelas, 4); parcelas++) {
      const valorParcela = valorTotal / parcelas;
      const datas = [];
      
      for (let i = 0; i < parcelas; i++) {
        const dataVencimento = new Date(hoje);
        dataVencimento.setDate(hoje.getDate() + (i * 15));
        datas.push(dataVencimento);
      }
      
      // Verificar se última parcela não passa do prazo
      if (datas[datas.length - 1] <= prazoLimite) {
        opcoes.push({
          parcelas,
          valorParcela: Math.round(valorParcela * 100) / 100,
          datas,
          descricao: `${parcelas}x de ${formatCurrency(valorParcela)} sem juros`
        });
      }
    }
    
    return opcoes;
  };

  const opcoesParcelas = calcularOpcoes();

  // Gerar parcelas baseado na opção selecionada
  const gerarParcelas = (opcao: any) => {
    const parcelas: ParcelaSimples[] = opcao.datas.map((data: Date, index: number) => ({
      numero: index + 1,
      valor: opcao.valorParcela,
      dataVencimento: data,
      status: 'pendente' as const
    }));
    
    setParcelasPersonalizadas(parcelas);
    onParcelamentoChange(parcelas);
  };

  // Gerar parcela única (à vista)
  const gerarParcelaAvista = () => {
    const parcela: ParcelaSimples[] = [{
      numero: 1,
      valor: valorTotal,
      dataVencimento: new Date(),
      status: 'pendente' as const
    }];
    
    setParcelasPersonalizadas(parcela);
    onParcelamentoChange(parcela);
  };

  // Editar data de uma parcela
  const editarDataParcela = (index: number, novaData: string) => {
    const novasParcelas = [...parcelasPersonalizadas];
    novasParcelas[index].dataVencimento = new Date(novaData);
    setParcelasPersonalizadas(novasParcelas);
    onParcelamentoChange(novasParcelas);
  };

  // Editar valor de uma parcela
  const editarValorParcela = (index: number, novoValor: number) => {
    const novasParcelas = [...parcelasPersonalizadas];
    novasParcelas[index].valor = novoValor;
    setParcelasPersonalizadas(novasParcelas);
    onParcelamentoChange(novasParcelas);
  };

  // Validar se todas as parcelas estão dentro do prazo
  const validarPrazos = () => {
    return parcelasPersonalizadas.every(parcela => 
      parcela.dataVencimento <= prazoLimite
    );
  };

  // Calcular total das parcelas
  const totalParcelas = parcelasPersonalizadas.reduce((sum, parcela) => sum + parcela.valor, 0);
  const diferenca = Math.abs(totalParcelas - valorTotal);

  // Inicializar com à vista
  useEffect(() => {
    if (valorInicial.length > 0) {
      setParcelasPersonalizadas(valorInicial);
      setOpcaoSelecionada(valorInicial.length === 1 ? 'avista' : valorInicial.length);
    } else {
      gerarParcelaAvista();
    }
  }, [valorTotal]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Forma de Pagamento
        </CardTitle>
        
        {/* Informações da viagem */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Viagem: {dataViagem.toLocaleDateString('pt-BR')}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Prazo limite: {prazoLimite.toLocaleDateString('pt-BR')}
          </div>
          <Badge variant={diasRestantes > 30 ? 'default' : diasRestantes > 7 ? 'secondary' : 'destructive'}>
            {diasRestantes} dias restantes
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Opções de Pagamento */}
        <div className="space-y-3">
          {/* À Vista */}
          <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="parcelamento"
              value="avista"
              checked={opcaoSelecionada === 'avista'}
              onChange={() => {
                setOpcaoSelecionada('avista');
                setModoEdicao(false);
                gerarParcelaAvista();
              }}
              className="text-blue-600"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">À vista</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(valorTotal)}
                </span>
              </div>
              <p className="text-sm text-gray-600">Pagamento imediato</p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </label>

          {/* Opções de Parcelamento */}
          {opcoesParcelas.map((opcao) => (
            <label 
              key={opcao.parcelas} 
              className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                name="parcelamento"
                value={opcao.parcelas}
                checked={opcaoSelecionada === opcao.parcelas}
                onChange={() => {
                  setOpcaoSelecionada(opcao.parcelas);
                  setModoEdicao(false);
                  gerarParcelas(opcao);
                }}
                className="text-blue-600"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{opcao.descricao}</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(opcao.valorParcela)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Vencimentos: {opcao.datas.slice(0, 2).map(d => d.toLocaleDateString('pt-BR')).join(', ')}
                  {opcao.datas.length > 2 && '...'}
                </p>
              </div>
              <CreditCard className="h-5 w-5 text-blue-500" />
            </label>
          ))}

          {/* Parcelamento Personalizado */}
          <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="parcelamento"
              value="personalizado"
              checked={opcaoSelecionada === 'personalizado'}
              onChange={() => {
                setOpcaoSelecionada('personalizado');
                setModoEdicao(true);
                if (parcelasPersonalizadas.length <= 1) {
                  // Começar com 2 parcelas
                  const parcelas: ParcelaSimples[] = [
                    {
                      numero: 1,
                      valor: valorTotal / 2,
                      dataVencimento: new Date(),
                      status: 'pendente'
                    },
                    {
                      numero: 2,
                      valor: valorTotal / 2,
                      dataVencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                      status: 'pendente'
                    }
                  ];
                  setParcelasPersonalizadas(parcelas);
                  onParcelamentoChange(parcelas);
                }
              }}
              className="text-blue-600"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">Personalizado</span>
                <Edit3 className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">Defina valores e datas manualmente</p>
            </div>
          </label>
        </div>

        {/* Editor de Parcelas */}
        {(opcaoSelecionada !== 'avista' && parcelasPersonalizadas.length > 1) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Parcelas Configuradas</h4>
              {(opcaoSelecionada === 'personalizado' || modoEdicao) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModoEdicao(!modoEdicao)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  {modoEdicao ? 'Finalizar' : 'Editar'}
                </Button>
              )}
            </div>

            {/* Lista de Parcelas */}
            <div className="space-y-3">
              {parcelasPersonalizadas.map((parcela, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Parcela {parcela.numero}</Label>
                      {modoEdicao ? (
                        <Input
                          type="number"
                          value={parcela.valor}
                          onChange={(e) => editarValorParcela(index, parseFloat(e.target.value) || 0)}
                          className="h-8"
                          step="0.01"
                        />
                      ) : (
                        <div className="font-medium">{formatCurrency(parcela.valor)}</div>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-xs">Vencimento</Label>
                      {modoEdicao ? (
                        <Input
                          type="date"
                          value={parcela.dataVencimento.toISOString().split('T')[0]}
                          onChange={(e) => editarDataParcela(index, e.target.value)}
                          max={prazoLimite.toISOString().split('T')[0]}
                          className="h-8"
                        />
                      ) : (
                        <div className="text-sm">{parcela.dataVencimento.toLocaleDateString('pt-BR')}</div>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-xs">Status</Label>
                      <Badge variant="secondary" className="text-xs">
                        {parcela.dataVencimento > prazoLimite ? (
                          <><AlertTriangle className="h-3 w-3 mr-1" /> Fora do prazo</>
                        ) : (
                          <><CheckCircle className="h-3 w-3 mr-1" /> OK</>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Alertas de Validação */}
            {!validarPrazos() && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">
                  Algumas parcelas vencem após o prazo limite ({prazoLimite.toLocaleDateString('pt-BR')})
                </span>
              </div>
            )}

            {diferenca > 0.01 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-700">
                  Total das parcelas ({formatCurrency(totalParcelas)}) difere do valor total ({formatCurrency(valorTotal)})
                </span>
              </div>
            )}
          </div>
        )}

        {/* Resumo */}
        {parcelasPersonalizadas.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Valor Total:</span>
                <span className="font-medium ml-2">{formatCurrency(valorTotal)}</span>
              </div>
              <div>
                <span className="text-gray-600">Parcelas:</span>
                <span className="font-medium ml-2">{parcelasPersonalizadas.length}x</span>
              </div>
              <div>
                <span className="text-gray-600">Primeira Parcela:</span>
                <span className="font-medium ml-2">
                  {parcelasPersonalizadas[0]?.dataVencimento.toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Última Parcela:</span>
                <span className="font-medium ml-2">
                  {parcelasPersonalizadas[parcelasPersonalizadas.length - 1]?.dataVencimento.toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}