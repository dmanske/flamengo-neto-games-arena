// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/currency-input';
import { 
  Calculator, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Edit3,
  Clock,
  CreditCard
} from 'lucide-react';
import { calcularOpcoesParcelamento } from '@/lib/parcelamento-calculator';
import { OpcaoParcelamento, ParcelaConfig } from '@/types/parcelamento';
import { formatCurrency } from '@/lib/utils';

interface ParcelamentoSelectorProps {
  valorTotal: number;
  dataViagem: Date;
  onParcelamentoChange: (parcelas: ParcelaConfig[]) => void;
  valorInicial?: ParcelaConfig[];
}

export function ParcelamentoSelector({ 
  valorTotal, 
  dataViagem, 
  onParcelamentoChange,
  valorInicial = []
}: ParcelamentoSelectorProps) {
  const [opcoesParcelas, setOpcoesParcelas] = useState<OpcaoParcelamento[]>([]);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<'avista' | number | 'personalizado'>('avista');
  const [parcelasPersonalizadas, setParcelasPersonalizadas] = useState<ParcelaConfig[]>([]);
  const [modoEdicao, setModoEdicao] = useState(false);

  // Calcular opções quando valor ou data mudarem
  useEffect(() => {
    if (valorTotal > 0 && dataViagem) {
      const opcoes = calcularOpcoesParcelamento(dataViagem, valorTotal);
      setOpcoesParcelas(opcoes);
      
      // Se há valor inicial, configurar
      if (valorInicial.length > 0) {
        setParcelasPersonalizadas(valorInicial);
        setOpcaoSelecionada(valorInicial.length === 1 ? 'avista' : valorInicial.length);
      }
    }
  }, [valorTotal, dataViagem, valorInicial]);

  // Calcular prazo limite (5 dias antes da viagem)
  const prazoLimite = new Date(dataViagem);
  prazoLimite.setDate(prazoLimite.getDate() - 5);

  const diasRestantes = Math.ceil(
    (prazoLimite.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // Gerar parcelas baseado na opção selecionada
  const gerarParcelas = (opcao: OpcaoParcelamento) => {
    const parcelas: ParcelaConfig[] = opcao.datas.map((data, index) => ({
      numero: index + 1,
      valor: opcao.valorParcela,
      dataVencimento: data,
      status: 'pendente'
    }));
    
    setParcelasPersonalizadas(parcelas);
    onParcelamentoChange(parcelas);
  };

  // Gerar parcela única (à vista)
  const gerarParcelaAvista = () => {
    const parcela: ParcelaConfig[] = [{
      numero: 1,
      valor: valorTotal,
      dataVencimento: new Date(),
      status: 'pendente'
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

  // Adicionar nova parcela
  const adicionarParcela = () => {
    const ultimaParcela = parcelasPersonalizadas[parcelasPersonalizadas.length - 1];
    const novaData = new Date(ultimaParcela?.dataVencimento || new Date());
    novaData.setDate(novaData.getDate() + 15); // 15 dias após a última

    const novasParcelas = [...parcelasPersonalizadas, {
      numero: parcelasPersonalizadas.length + 1,
      valor: 0,
      dataVencimento: novaData,
      status: 'pendente'
    }];

    setParcelasPersonalizadas(novasParcelas);
    onParcelamentoChange(novasParcelas);
  };

  // Remover parcela
  const removerParcela = (index: number) => {
    const novasParcelas = parcelasPersonalizadas.filter((_, i) => i !== index);
    // Renumerar parcelas
    const parcelasRenumeradas = novasParcelas.map((parcela, i) => ({
      ...parcela,
      numero: i + 1
    }));
    
    setParcelasPersonalizadas(parcelasRenumeradas);
    onParcelamentoChange(parcelasRenumeradas);
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
                if (parcelasPersonalizadas.length === 0) {
                  // Começar com 2 parcelas
                  const parcelas: ParcelaConfig[] = [
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

        {/* Editor de Parcelas (quando selecionado parcelamento ou personalizado) */}
        {(opcaoSelecionada !== 'avista' && parcelasPersonalizadas.length > 0) && (
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
                        <CurrencyInput
                          value={parcela.valor}
                          onChange={(valor) => editarValorParcela(index, valor)}
                          className="h-8"
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

                  {modoEdicao && parcelasPersonalizadas.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removerParcela(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Ações do Editor */}
            {modoEdicao && (
              <div className="flex justify-between items-center pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={adicionarParcela}
                >
                  + Adicionar Parcela
                </Button>
                
                <div className="text-sm">
                  Total: {formatCurrency(totalParcelas)}
                  {diferenca > 0.01 && (
                    <span className="text-red-600 ml-2">
                      (Diferença: {formatCurrency(diferenca)})
                    </span>
                  )}
                </div>
              </div>
            )}

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