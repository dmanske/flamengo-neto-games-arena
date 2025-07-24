import React, { useState, useEffect } from "react";
import { Plus, Trash2, DollarSign, Calculator, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Parcela } from "./types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/lib/supabase";

interface ParcelasManagerProps {
  valorTotal: number;
  viagemId?: string;
  onParcelasChange: (parcelas: any[]) => void;
}

export function ParcelasManager({ valorTotal, viagemId, onParcelasChange }: ParcelasManagerProps) {
  const [parcelas, setParcelas] = useState<any[]>([]);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<'avista' | number | 'personalizado'>('avista');
  const [dataViagem, setDataViagem] = useState<Date | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  // Buscar data da viagem
  useEffect(() => {
    const buscarDataViagem = async () => {
      if (!viagemId) {
        // Fallback: usar data exemplo
        const dataExemplo = new Date();
        dataExemplo.setDate(dataExemplo.getDate() + 30);
        setDataViagem(dataExemplo);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('viagens')
          .select('data_jogo')
          .eq('id', viagemId)
          .single();

        if (error) throw error;
        
        if (data?.data_jogo) {
          setDataViagem(new Date(data.data_jogo));
        } else {
          // Fallback se não encontrar
          const dataExemplo = new Date();
          dataExemplo.setDate(dataExemplo.getDate() + 30);
          setDataViagem(dataExemplo);
        }
      } catch (error) {
        console.error('Erro ao buscar data da viagem:', error);
        // Fallback em caso de erro
        const dataExemplo = new Date();
        dataExemplo.setDate(dataExemplo.getDate() + 30);
        setDataViagem(dataExemplo);
      }
    };

    buscarDataViagem();
  }, [viagemId]);

  // Calcular opções de parcelamento inteligente baseado no tempo disponível
  const calcularOpcoes = () => {
    if (!dataViagem) return [];

    const prazoLimite = new Date(dataViagem);
    prazoLimite.setDate(prazoLimite.getDate() - 5); // 5 dias antes da viagem

    const hoje = new Date();
    const diasDisponiveis = Math.floor(
      (prazoLimite.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Se não há tempo suficiente, não oferecer parcelamento
    if (diasDisponiveis < 7) {
      return []; // Só à vista se restam menos de 7 dias
    }

    const opcoes = [];
    
    // Definir intervalos baseados no tempo disponível
    let intervalosDisponiveis = [];
    
    if (diasDisponiveis >= 30) {
      // Mais de 30 dias: oferecer semanal, quinzenal e mensal
      intervalosDisponiveis = [
        { nome: 'semanal', dias: 7, max: Math.floor(diasDisponiveis / 7) },
        { nome: 'quinzenal', dias: 15, max: Math.floor(diasDisponiveis / 15) },
        { nome: 'mensal', dias: 30, max: Math.floor(diasDisponiveis / 30) }
      ];
    } else if (diasDisponiveis >= 15) {
      // 15-30 dias: oferecer semanal e quinzenal
      intervalosDisponiveis = [
        { nome: 'semanal', dias: 7, max: Math.floor(diasDisponiveis / 7) },
        { nome: 'quinzenal', dias: 15, max: Math.floor(diasDisponiveis / 15) }
      ];
    } else {
      // 7-15 dias: apenas semanal
      intervalosDisponiveis = [
        { nome: 'semanal', dias: 7, max: Math.floor(diasDisponiveis / 7) }
      ];
    }

    // Gerar opções para cada intervalo
    intervalosDisponiveis.forEach(intervalo => {
      for (let numParcelas = 2; numParcelas <= Math.min(intervalo.max, 6); numParcelas++) {
        const valorParcela = valorTotal / numParcelas;
        const datas = [];

        // Calcular datas das parcelas
        for (let i = 0; i < numParcelas; i++) {
          const dataVencimento = new Date(hoje);
          dataVencimento.setDate(hoje.getDate() + (i * intervalo.dias));
          datas.push(dataVencimento);
        }

        // Verificar se a última parcela não passa do prazo limite
        if (datas[datas.length - 1] <= prazoLimite) {
          const nomeIntervalo = intervalo.nome === 'semanal' ? 'semanais' : 
                               intervalo.nome === 'quinzenal' ? 'quinzenais' : 'mensais';
          
          opcoes.push({
            parcelas: numParcelas,
            valorParcela: Math.round(valorParcela * 100) / 100,
            datas,
            intervalo: intervalo.nome,
            descricao: `${numParcelas}x ${nomeIntervalo} de ${formatCurrency(valorParcela)}`,
            detalhes: `Vencimentos ${nomeIntervalo} até ${datas[datas.length - 1].toLocaleDateString('pt-BR')}`
          });
        }
      }
    });

    // Ordenar por número de parcelas e depois por intervalo (semanal primeiro)
    opcoes.sort((a, b) => {
      if (a.parcelas !== b.parcelas) return a.parcelas - b.parcelas;
      const ordemIntervalo = { 'semanal': 1, 'quinzenal': 2, 'mensal': 3 };
      return ordemIntervalo[a.intervalo] - ordemIntervalo[b.intervalo];
    });

    return opcoes;
  };

  const opcoesParcelas = calcularOpcoes();

  // Gerar parcelas baseado na opção selecionada
  const gerarParcelas = (opcao: any) => {
    const novasParcelas = opcao.datas.map((data: Date, index: number) => ({
      numero: index + 1,
      valor_parcela: opcao.valorParcela,
      data_vencimento: data.toISOString().split('T')[0],
      forma_pagamento: 'pix',
      status: 'pendente'
    }));
    
    setParcelas(novasParcelas);
    onParcelasChange(novasParcelas);
  };

  // Gerar à vista
  const gerarAvista = () => {
    // Para pagamento à vista, usar data futura para dar flexibilidade ao usuário
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 3); // Vence em 3 dias por padrão
    
    const parcelaAvista = [{
      numero: 1,
      valor_parcela: valorTotal,
      data_vencimento: dataVencimento.toISOString().split('T')[0],
      forma_pagamento: 'pix',
      status: 'pendente' // Sempre começa como pendente
    }];
    
    setParcelas(parcelaAvista);
    onParcelasChange(parcelaAvista);
  };

  const totalParcelas = parcelas.reduce((sum, p) => sum + p.valor_parcela, 0);

  // Editar valor de uma parcela
  const editarValorParcela = (index: number, novoValor: number) => {
    const novasParcelas = [...parcelas];
    novasParcelas[index].valor_parcela = novoValor;
    setParcelas(novasParcelas);
    onParcelasChange(novasParcelas);
  };

  // Editar data de uma parcela
  const editarDataParcela = (index: number, novaData: string) => {
    const novasParcelas = [...parcelas];
    novasParcelas[index].data_vencimento = novaData;
    setParcelas(novasParcelas);
    onParcelasChange(novasParcelas);
  };

  // Adicionar nova parcela
  const adicionarParcela = () => {
    const ultimaParcela = parcelas[parcelas.length - 1];
    const novaData = new Date(ultimaParcela?.data_vencimento || new Date());
    novaData.setDate(novaData.getDate() + 15);

    const novaParcela = {
      numero: parcelas.length + 1,
      valor_parcela: 0,
      data_vencimento: novaData.toISOString().split('T')[0],
      forma_pagamento: 'pix',
      status: 'pendente'
    };

    const novasParcelas = [...parcelas, novaParcela];
    setParcelas(novasParcelas);
    onParcelasChange(novasParcelas);
  };

  // Remover parcela
  const removerParcela = (index: number) => {
    const novasParcelas = parcelas.filter((_, i) => i !== index);
    // Renumerar parcelas
    const parcelasRenumeradas = novasParcelas.map((parcela, i) => ({
      ...parcela,
      numero: i + 1
    }));
    
    setParcelas(parcelasRenumeradas);
    onParcelasChange(parcelasRenumeradas);
  };

  // Gerar parcelamento personalizado
  const gerarPersonalizado = () => {
    const parcelas2x = [
      {
        numero: 1,
        valor_parcela: valorTotal / 2,
        data_vencimento: new Date().toISOString().split('T')[0],
        forma_pagamento: 'pix',
        status: 'pendente'
      },
      {
        numero: 2,
        valor_parcela: valorTotal / 2,
        data_vencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        forma_pagamento: 'pix',
        status: 'pendente'
      }
    ];
    
    setParcelas(parcelas2x);
    onParcelasChange(parcelas2x);
  };

  // Inicializar com à vista
  useEffect(() => {
    if (valorTotal > 0) {
      gerarAvista();
    }
  }, [valorTotal]);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Sistema de Parcelamento
        </CardTitle>
        {dataViagem && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Viagem: {dataViagem.toLocaleDateString('pt-BR')}
            </div>
            <Badge variant="secondary">
              Prazo: {new Date(dataViagem.getTime() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
            </Badge>
          </div>
        )}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 font-medium">
            ℹ️ Todos os pagamentos começam como "Pendente". Você pode alterar o status depois de confirmar o pagamento.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Opções de Pagamento */}
        <div className="space-y-3">
          {/* À Vista */}
          <button
            type="button"
            className={`w-full p-4 border rounded-lg text-left hover:bg-gray-50 ${
              opcaoSelecionada === 'avista' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onClick={() => {
              setOpcaoSelecionada('avista');
              gerarAvista();
            }}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">À vista</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(valorTotal)}
              </span>
            </div>
            <p className="text-sm text-gray-600">Pagamento imediato</p>
          </button>

          {/* Opções de Parcelamento */}
          {opcoesParcelas.map((opcao, index) => (
            <button
              key={`${opcao.parcelas}-${opcao.intervalo}-${index}`}
              type="button"
              className={`w-full p-4 border rounded-lg text-left hover:bg-gray-50 ${
                opcaoSelecionada === `${opcao.parcelas}-${opcao.intervalo}` ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onClick={() => {
                setOpcaoSelecionada(`${opcao.parcelas}-${opcao.intervalo}`);
                setModoEdicao(false);
                gerarParcelas(opcao);
              }}
            >
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-medium">{opcao.descricao}</span>
                  <span className="text-xs text-blue-600 font-medium capitalize">
                    📅 {opcao.intervalo} • {opcao.detalhes}
                  </span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(opcao.valorParcela)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Primeira: {opcao.datas[0].toLocaleDateString('pt-BR')} • 
                  Última: {opcao.datas[opcao.datas.length - 1].toLocaleDateString('pt-BR')}
                </p>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {opcao.parcelas} parcelas
                </span>
              </div>
            </button>
          ))}

          {/* Mensagem quando não há opções de parcelamento */}
          {opcoesParcelas.length === 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-amber-600">⚠️</span>
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Parcelamento não disponível
                  </p>
                  <p className="text-xs text-amber-600">
                    Tempo insuficiente para parcelamento (menos de 7 dias até o prazo limite). 
                    Apenas pagamento à vista disponível.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Parcelamento Personalizado */}
          <button
            type="button"
            className={`w-full p-4 border rounded-lg text-left hover:bg-gray-50 ${
              opcaoSelecionada === 'personalizado' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onClick={() => {
              setOpcaoSelecionada('personalizado');
              setModoEdicao(true);
              gerarPersonalizado();
            }}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">Personalizado</span>
              <span className="text-sm text-gray-600">Editar valores e datas</span>
            </div>
            <p className="text-sm text-gray-600">Configure parcelas manualmente</p>
          </button>
        </div>

        {/* Editor de Parcelas */}
        {parcelas.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Parcelas Configuradas:</h4>
              {(opcaoSelecionada === 'personalizado' || modoEdicao) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModoEdicao(!modoEdicao)}
                >
                  {modoEdicao ? 'Finalizar' : 'Editar'}
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {parcelas.map((parcela, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-white">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Parcela {parcela.numero}</label>
                      {modoEdicao ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={parcela.valor_parcela}
                          onChange={(e) => editarValorParcela(index, parseFloat(e.target.value) || 0)}
                          className="h-8 mt-1"
                        />
                      ) : (
                        <div className="font-medium text-sm mt-1">{formatCurrency(parcela.valor_parcela)}</div>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-gray-600">Vencimento</label>
                      {modoEdicao ? (
                        <Input
                          type="date"
                          value={parcela.data_vencimento}
                          onChange={(e) => editarDataParcela(index, e.target.value)}
                          className="h-8 mt-1"
                        />
                      ) : (
                        <div className="text-sm mt-1">{new Date(parcela.data_vencimento).toLocaleDateString('pt-BR')}</div>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-gray-600">Status</label>
                      {modoEdicao ? (
                        <Select
                          value={parcela.status}
                          onValueChange={(value) => {
                            const novasParcelas = [...parcelas];
                            novasParcelas[index].status = value;
                            setParcelas(novasParcelas);
                            onParcelasChange(novasParcelas);
                          }}
                        >
                          <SelectTrigger className="h-8 mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="pago">Pago</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="mt-1">
                          <Badge 
                            variant={parcela.status === 'pago' ? 'default' : 'secondary'} 
                            className={`text-xs ${parcela.status === 'pago' ? 'bg-green-600' : ''}`}
                          >
                            {parcela.status === 'pago' ? 'Pago' : 'Pendente'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {modoEdicao && parcelas.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removerParcela(index)}
                      className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Ações do Editor */}
            {modoEdicao && (
              <div className="flex justify-between items-center pt-3 mt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={adicionarParcela}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Parcela
                </Button>
                
                <div className="text-sm">
                  Total: {formatCurrency(totalParcelas)}
                  {Math.abs(totalParcelas - valorTotal) > 0.01 && (
                    <span className="text-red-600 ml-2">
                      (Diferença: {formatCurrency(Math.abs(totalParcelas - valorTotal))})
                    </span>
                  )}
                </div>
              </div>
            )}

            {!modoEdicao && (
              <div className="border-t pt-2 mt-3">
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{formatCurrency(totalParcelas)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
