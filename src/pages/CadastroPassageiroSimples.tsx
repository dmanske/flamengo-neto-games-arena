import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";

interface Viagem {
  id: string;
  adversario: string;
  data_jogo: string;
}

interface ParcelaSimples {
  numero: number;
  valor: number;
  dataVencimento: Date;
  status: string;
}

export default function CadastroPassageiroSimples() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [viagemSelecionada, setViagemSelecionada] = useState<Viagem | null>(null);
  const [parcelas, setParcelas] = useState<ParcelaSimples[]>([]);
  const navigate = useNavigate();

  // Dados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    cidade_embarque: '',
    setor_maracana: '',
    numero_onibus: '',
    viagem_id: '',
    valor: 0, // Começar com 0 para forçar definição manual
    desconto: 0
  });

  // Carregar viagens
  useEffect(() => {
    const carregarViagens = async () => {
      try {
        const { data, error } = await supabase
          .from('viagens')
          .select('id, adversario, data_jogo, valor_padrao')
          .gte('data_jogo', new Date().toISOString().split('T')[0])
          .order('data_jogo', { ascending: true });

        if (error) throw error;
        setViagens(data || []);
      } catch (error) {
        console.error('Erro ao carregar viagens:', error);
        toast.error('Erro ao carregar viagens disponíveis');
      }
    };

    carregarViagens();
  }, []);

  // Atualizar valor quando viagem é selecionada
  useEffect(() => {
    if (viagemSelecionada && viagemSelecionada.valor_padrao) {
      setFormData(prev => ({ 
        ...prev, 
        valor: viagemSelecionada.valor_padrao 
      }));
    }
  }, [viagemSelecionada]);

  // Calcular valor final
  const valorFinal = formData.valor - formData.desconto;

  // Calcular opções de parcelamento inteligente baseado no tempo disponível
  const calcularOpcoes = () => {
    if (!viagemSelecionada) return [];

    const dataViagem = new Date(viagemSelecionada.data_jogo);
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
        // Calcular parcelas com arredondamento inteligente
        const valorParcelaBase = Math.floor(valorFinal / numParcelas);
        const resto = valorFinal - (valorParcelaBase * numParcelas);
        
        // Distribuir o resto na primeira parcela para evitar centavos
        const valorPrimeiraParcela = valorParcelaBase + resto;
        const valorDemaisParcelas = valorParcelaBase;
        
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
          
          const valorExibicao = numParcelas === 1 ? valorFinal : 
                               resto > 0 ? `1ª: ${formatCurrency(valorPrimeiraParcela)} + ${numParcelas - 1}x ${formatCurrency(valorDemaisParcelas)}` :
                               formatCurrency(valorParcelaBase);
          
          opcoes.push({
            parcelas: numParcelas,
            valorPrimeiraParcela,
            valorDemaisParcelas,
            datas,
            intervalo: intervalo.nome,
            descricao: `${numParcelas}x ${nomeIntervalo}`,
            valorExibicao,
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

  // Gerar parcelas
  const gerarParcelas = (opcao: any) => {
    const novasParcelas: ParcelaSimples[] = opcao.datas.map((data: Date, index: number) => ({
      numero: index + 1,
      valor: index === 0 ? opcao.valorPrimeiraParcela : opcao.valorDemaisParcelas,
      dataVencimento: data,
      status: 'pendente'
    }));
    setParcelas(novasParcelas);
  };

  // Gerar à vista
  const gerarAvista = () => {
    // Para pagamento à vista, usar data futura para dar flexibilidade
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 3); // Vence em 3 dias
    
    setParcelas([{
      numero: 1,
      valor: valorFinal,
      dataVencimento: dataVencimento,
      status: 'pendente' // Sempre começa como pendente
    }]);
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (parcelas.length === 0) {
      toast.error('Selecione uma forma de pagamento');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Criar cliente
      const { data: clienteData, error: clienteError } = await supabase
        .from("clientes")
        .insert({
          nome: formData.nome,
          telefone: formData.telefone,
          email: formData.email,
          cidade: formData.cidade_embarque,
          cpf: "",
          data_nascimento: new Date().toISOString(),
          cep: "",
          bairro: "",
          endereco: "",
          estado: "",
          como_conheceu: "Cadastro pelo app"
        })
        .select('id')
        .single();

      if (clienteError) throw clienteError;

      // 2. Criar passageiro da viagem
      const { data: passageiroData, error: passageiroError } = await supabase
        .from("viagem_passageiros")
        .insert({
          viagem_id: formData.viagem_id,
          cliente_id: clienteData.id,
          valor: formData.valor,
          desconto: formData.desconto,
          setor_maracana: formData.setor_maracana,
          numero_onibus: formData.numero_onibus,
          status_pagamento: 'Pendente' // Sempre começa como pendente
        })
        .select('id')
        .single();

      if (passageiroError) throw passageiroError;

      // 3. Salvar parcelas
      const parcelasParaInserir = parcelas.map(parcela => ({
        viagem_passageiro_id: passageiroData.id,
        numero_parcela: parcela.numero,
        total_parcelas: parcelas.length,
        valor_parcela: parcela.valor,
        data_vencimento: parcela.dataVencimento.toISOString().split('T')[0],
        status: 'pendente', // Sempre pendente na inserção
        tipo_parcelamento: parcelas.length === 1 ? 'avista' : 'parcelado',
        forma_pagamento: null, // Sem forma de pagamento definida inicialmente
        data_pagamento: null // Sem data de pagamento
      }));

      const { error: parcelasError } = await supabase
        .from('viagem_passageiros_parcelas')
        .insert(parcelasParaInserir);

      if (parcelasError) throw parcelasError;

      toast.success("Passageiro cadastrado com parcelamento configurado!");
      
      // Reset
      setFormData({
        nome: '',
        telefone: '',
        email: '',
        cidade_embarque: '',
        setor_maracana: '',
        numero_onibus: '',
        viagem_id: '',
        valor: 800,
        desconto: 0
      });
      setParcelas([]);
      setViagemSelecionada(null);

    } catch (error: any) {
      console.error("Erro ao cadastrar:", error);
      toast.error("Erro ao cadastrar passageiro");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Cadastrar Passageiro</h1>
          <p className="text-gray-600">Sistema de parcelamento simplificado</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Básicos */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Passageiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="cidade">Cidade de Embarque</Label>
                <Input
                  id="cidade"
                  value={formData.cidade_embarque}
                  onChange={(e) => setFormData(prev => ({ ...prev, cidade_embarque: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="setor">Setor no Maracanã</Label>
                <Input
                  id="setor"
                  value={formData.setor_maracana}
                  onChange={(e) => setFormData(prev => ({ ...prev, setor_maracana: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="onibus">Número do Ônibus</Label>
                <Input
                  id="onibus"
                  value={formData.numero_onibus}
                  onChange={(e) => setFormData(prev => ({ ...prev, numero_onibus: e.target.value }))}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Viagem e Valores */}
        <Card>
          <CardHeader>
            <CardTitle>Viagem e Valores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Seleção da Viagem */}
              <div>
                <Label htmlFor="viagem">Viagem</Label>
                <Select 
                  value={formData.viagem_id} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, viagem_id: value }));
                    const viagem = viagens.find(v => v.id === value);
                    setViagemSelecionada(viagem || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma viagem" />
                  </SelectTrigger>
                  <SelectContent>
                    {viagens.map((viagem) => (
                      <SelectItem key={viagem.id} value={viagem.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>Flamengo x {viagem.adversario} - {new Date(viagem.data_jogo).toLocaleDateString('pt-BR')}</span>
                          {viagem.valor_padrao && (
                            <span className="text-sm text-gray-500 ml-2">
                              ({formatCurrency(viagem.valor_padrao)})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Configuração de Valores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="valor">
                    Valor Base
                    {viagemSelecionada?.valor_padrao && (
                      <span className="text-xs text-gray-500 ml-1">
                        (padrão: {formatCurrency(viagemSelecionada.valor_padrao)})
                      </span>
                    )}
                  </Label>
                  <Input
                    id="valor"
                    type="number"
                    step="1"
                    min="0"
                    value={formData.valor || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                    placeholder="Digite o valor"
                    className={formData.valor === 0 ? 'border-amber-300 bg-amber-50' : ''}
                  />
                  {formData.valor === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ Defina o valor da viagem
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="desconto">
                    Desconto
                    <span className="text-xs text-gray-500 ml-1">(opcional)</span>
                  </Label>
                  <Input
                    id="desconto"
                    type="number"
                    step="1"
                    min="0"
                    max={formData.valor}
                    value={formData.desconto || ''}
                    onChange={(e) => {
                      const desconto = parseFloat(e.target.value) || 0;
                      if (desconto <= formData.valor) {
                        setFormData(prev => ({ ...prev, desconto }));
                      }
                    }}
                    placeholder="0"
                  />
                  {formData.desconto > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      💰 Desconto de {((formData.desconto / formData.valor) * 100).toFixed(1)}%
                    </p>
                  )}
                </div>

                <div>
                  <Label>Valor Final</Label>
                  <div className="h-10 flex items-center justify-center bg-gray-50 border rounded-md">
                    <span className={`text-lg font-bold ${valorFinal > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {valorFinal > 0 ? formatCurrency(valorFinal) : 'R$ 0,00'}
                    </span>
                  </div>
                  {formData.desconto > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      De {formatCurrency(formData.valor)} por {formatCurrency(valorFinal)}
                    </p>
                  )}
                </div>
              </div>

              {/* Botões de Valor Rápido */}
              {viagemSelecionada?.valor_padrao && formData.valor !== viagemSelecionada.valor_padrao && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, valor: viagemSelecionada.valor_padrao }))}
                  >
                    Usar valor padrão ({formatCurrency(viagemSelecionada.valor_padrao)})
                  </Button>
                </div>
              )}

              {/* Resumo Visual */}
              {valorFinal > 0 && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Valor a ser cobrado:</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(valorFinal)}
                      </p>
                    </div>
                    {formData.desconto > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500 line-through">
                          {formatCurrency(formData.valor)}
                        </p>
                        <p className="text-sm font-medium text-green-600">
                          Economia: {formatCurrency(formData.desconto)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Parcelamento */}
        {viagemSelecionada && valorFinal > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Forma de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* À Vista */}
                <button
                  type="button"
                  className="w-full p-4 border rounded-lg text-left hover:bg-gray-50 focus:bg-blue-50 focus:border-blue-300"
                  onClick={gerarAvista}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">À vista</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(valorFinal)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Pagamento imediato</p>
                </button>

                {/* Opções de Parcelamento */}
                {opcoesParcelas.map((opcao, index) => (
                  <button
                    key={`${opcao.parcelas}-${opcao.intervalo}-${index}`}
                    type="button"
                    className="w-full p-4 border rounded-lg text-left hover:bg-gray-50 focus:bg-blue-50 focus:border-blue-300"
                    onClick={() => gerarParcelas(opcao)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="font-medium">{opcao.descricao}</span>
                        <span className="text-xs text-blue-600 font-medium capitalize">
                          📅 {opcao.intervalo} • {opcao.detalhes}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-blue-600">
                          {opcao.valorExibicao}
                        </span>
                        {opcao.valorPrimeiraParcela !== opcao.valorDemaisParcelas && (
                          <p className="text-xs text-gray-500">
                            (sem centavos)
                          </p>
                        )}
                      </div>
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resumo das Parcelas */}
        {parcelas.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Resumo do Parcelamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {parcelas.map((parcela, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>Parcela {parcela.numero}:</span>
                    <span>
                      {formatCurrency(parcela.valor)} - {parcela.dataVencimento.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-2 mt-4">
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{formatCurrency(parcelas.reduce((sum, p) => sum + p.valor, 0))}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botões */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || parcelas.length === 0 || !viagemSelecionada}
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar com Parcelamento"}
          </Button>
        </div>
      </form>
    </div>
  );
}