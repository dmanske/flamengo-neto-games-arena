import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  Save,
  Calculator,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import {
  ViagemSetorPrecoFormData
} from '@/types/viagem-setores-precos';
import { useViagemSetoresPrecos } from '@/hooks/useViagemSetoresPrecos';
import { supabase } from '@/lib/supabase';

interface SetoresIngressosFormProps {
  viagemId: string;
  onSuccess?: () => void;
}

export function SetoresIngressosForm({ viagemId, onSuccess }: SetoresIngressosFormProps) {
  const {
    setoresPrecos,
    resumoIngressos,
    estados,
    erros,
    temPrecosCadastrados,
    salvarSetoresPrecos
  } = useViagemSetoresPrecos(viagemId);

  const [setores, setSetores] = useState<ViagemSetorPrecoFormData[]>([]);
  const [modoEdicao, setModoEdicao] = useState(false);

  // Função para buscar setores que têm passageiros
  const buscarSetoresComPassageiros = async () => {
    try {

      const { data: passageiros, error } = await supabase
        .from('viagem_passageiros')
        .select('setor_maracana')
        .eq('viagem_id', viagemId)
        .not('setor_maracana', 'is', null);

      if (error) {
        console.error('❌ Erro ao buscar passageiros:', error);
        return;
      }

      // Contar passageiros por setor
      const setoresComPassageiros = (passageiros || []).reduce((acc, p) => {
        const setor = p.setor_maracana;
        if (setor && setor !== 'Sem ingresso') {
          acc.add(setor);
        }
        return acc;
      }, new Set<string>());



      // CORREÇÃO: Criar formulário mesclando setores com passageiros + preços existentes
      if (setoresComPassageiros.size > 0) {
        const setoresParaFormulario = Array.from(setoresComPassageiros).map(nome => {
          // Buscar preço existente para este setor
          const precoExistente = setoresPrecos.find(p => p.setor_nome === nome);

          return {
            setor_nome: nome,
            preco_custo: precoExistente?.preco_custo || 0,
            preco_venda: precoExistente?.preco_venda || 0
          };
        });



        // CORREÇÃO PRINCIPAL: SEMPRE definir todos os setores no formulário
        setSetores(setoresParaFormulario);

        // SEMPRE entrar em modo edição (não há botão "Editar" separado)
        setModoEdicao(true);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar setores com passageiros:', error);
    }
  };

  // Inicializar formulário
  useEffect(() => {
    // CORREÇÃO PRINCIPAL: Sempre inicializar com setores e preços corretos
    if (setores.length === 0) {
      buscarSetoresComPassageiros();
    }
  }, [setoresPrecos]); // Simplificar dependências

  const adicionarSetor = () => {
    setSetores(prev => [...prev, {
      setor_nome: '',
      preco_custo: 0,
      preco_venda: 0
    }]);
  };

  const removerSetor = (index: number) => {
    setSetores(prev => prev.filter((_, i) => i !== index));
  };

  const atualizarSetor = (index: number, campo: keyof ViagemSetorPrecoFormData, valor: any) => {
    setSetores(prev => {
      const novosSetores = prev.map((setor, i) =>
        i === index ? { ...setor, [campo]: valor } : setor
      );
      return novosSetores;
    });
  };

  const calcularMargem = (custo: number, venda: number) => {
    if (venda <= 0) return 0;
    return ((venda - custo) / venda) * 100;
  };

  const handleSalvar = async () => {
    const sucesso = await salvarSetoresPrecos(setores);
    if (sucesso) {
      setModoEdicao(false);
      onSuccess?.();
    }
  };

  const handleEditar = async () => {
    try {
      // CORREÇÃO PRINCIPAL: Buscar preços diretamente do banco antes de editar
      const { data: precosAtuais, error } = await supabase
        .from('viagem_setores_precos')
        .select('*')
        .eq('viagem_id', viagemId)
        .order('setor_nome');

      if (error) {
        return;
      }

      // Buscar setores com passageiros
      const { data: passageiros, error: errorPassageiros } = await supabase
        .from('viagem_passageiros')
        .select('setor_maracana')
        .eq('viagem_id', viagemId)
        .not('setor_maracana', 'is', null);

      if (errorPassageiros) {
        console.error('❌ Erro ao buscar passageiros:', errorPassageiros);
        return;
      }

      // Contar passageiros por setor
      const setoresComPassageiros = (passageiros || []).reduce((acc, p) => {
        const setor = p.setor_maracana;
        if (setor && setor !== 'Sem ingresso') {
          acc.add(setor);
        }
        return acc;
      }, new Set<string>());

      // Mesclar setores com passageiros + preços atuais do banco
      const setoresParaEdicao = Array.from(setoresComPassageiros).map(nome => {
        const precoExistente = (precosAtuais || []).find(p => p.setor_nome === nome);

        return {
          setor_nome: nome,
          preco_custo: precoExistente?.preco_custo || 0,
          preco_venda: precoExistente?.preco_venda || 0
        };
      });



      // Definir setores no formulário e ativar modo edição
      setSetores(setoresParaEdicao);
      setModoEdicao(true);

    } catch (error) {
      console.error('❌ Erro ao preparar edição:', error);
    }
  };

  const handleCancelar = () => {
    setModoEdicao(false);

    // CORREÇÃO: Recarregar TODOS os setores com passageiros, mesclando com preços do banco
    buscarSetoresComPassageiros();
  };

  if (estados.carregando) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando preços dos setores...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card Principal - Cadastro/Visualização */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              🎫 Preços dos Setores de Ingressos
            </CardTitle>
            <div className="flex gap-2">

              {modoEdicao && (
                <>
                  <Button
                    onClick={handleCancelar}
                    variant="outline"
                    size="sm"
                    disabled={estados.salvando}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSalvar}
                    size="sm"
                    disabled={estados.salvando || setores.length === 0}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {estados.salvando ? 'Salvando...' : 'Salvar Preços'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {setores.length === 0 ? (
            // Carregando setores
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando setores com passageiros...</p>
            </div>
          ) : (
            // Formulário/Visualização
            <div className="space-y-4">
              {erros.geral && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{erros.geral}</p>
                </div>
              )}

              <div className="space-y-4">
                {setores.map((setor, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg bg-gray-50">
                    {/* Nome do Setor */}
                    <div>
                      <Label htmlFor={`setor-${index}`}>Setor</Label>
                      {modoEdicao ? (
                        <Input
                          id={`setor-${index}`}
                          value={setor.setor_nome}
                          onChange={(e) => atualizarSetor(index, 'setor_nome', e.target.value)}
                          placeholder="Nome do setor"
                          className="mt-1"
                        />
                      ) : (
                        <div className="mt-1 p-2 bg-white rounded border">
                          <span className="font-medium">{setor.setor_nome}</span>
                        </div>
                      )}
                    </div>

                    {/* Preço de Custo */}
                    <div>
                      <Label htmlFor={`custo-${index}`}>Custo</Label>
                      {modoEdicao ? (
                        <Input
                          id={`custo-${index}`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={setor.preco_custo}
                          onChange={(e) => atualizarSetor(index, 'preco_custo', parseFloat(e.target.value) || 0)}
                          placeholder="0,00"
                          className="mt-1"
                        />
                      ) : (
                        <div className="mt-1 p-2 bg-white rounded border">
                          <span className="font-medium text-red-600">
                            {formatCurrency(setor.preco_custo)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Preço de Venda */}
                    <div>
                      <Label htmlFor={`venda-${index}`}>Venda</Label>
                      {modoEdicao ? (
                        <Input
                          id={`venda-${index}`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={setor.preco_venda}
                          onChange={(e) => atualizarSetor(index, 'preco_venda', parseFloat(e.target.value) || 0)}
                          placeholder="0,00"
                          className="mt-1"
                        />
                      ) : (
                        <div className="mt-1 p-2 bg-white rounded border">
                          <span className="font-medium text-green-600">
                            {formatCurrency(setor.preco_venda)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Margem */}
                    <div>
                      <Label>Margem</Label>
                      <div className="mt-1 p-2 bg-white rounded border">
                        <Badge variant={calcularMargem(setor.preco_custo, setor.preco_venda) > 0 ? 'default' : 'destructive'}>
                          {calcularMargem(setor.preco_custo, setor.preco_venda).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-end">
                      {modoEdicao && (
                        <Button
                          onClick={() => removerSetor(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          disabled={setores.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {modoEdicao && (
                <Button onClick={adicionarSetor} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Setor
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Resumo Financeiro */}
      {resumoIngressos && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              💰 Resumo Financeiro dos Ingressos
            </CardTitle>
            {/* Indicador de Integração Financeira */}
            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">
                  🔗 Integrado automaticamente com Despesas e Receitas
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2 ml-4">
                Os valores são lançados automaticamente na aba Financeiro quando você salva os preços
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {resumoIngressos.total_ingressos}
                </div>
                <div className="text-sm font-medium text-blue-700">Total de Ingressos</div>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {formatCurrency(resumoIngressos.total_custo)}
                </div>
                <div className="text-sm font-medium text-red-700">Custo Total</div>
                <div className="text-xs text-red-600">Pagar ao Fornecedor</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {formatCurrency(resumoIngressos.total_venda)}
                </div>
                <div className="text-sm font-medium text-green-700">Receita Total</div>
                <div className="text-xs text-green-600">Valor de Venda</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {formatCurrency(resumoIngressos.total_lucro)}
                </div>
                <div className="text-sm font-medium text-purple-700">Lucro Estimado</div>
                <div className="text-xs text-purple-600">
                  {resumoIngressos.margem_percentual.toFixed(1)}% margem
                </div>
              </div>
            </div>

            {/* Detalhes por Setor */}
            {Object.keys(resumoIngressos.custos_por_setor).length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">Detalhes por Setor:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-200 p-3 text-left">Setor</th>
                        <th className="border border-gray-200 p-3 text-center">Qtd</th>
                        <th className="border border-gray-200 p-3 text-center">Custo Unit.</th>
                        <th className="border border-gray-200 p-3 text-center">Custo Total</th>
                        <th className="border border-gray-200 p-3 text-center">Venda Unit.</th>
                        <th className="border border-gray-200 p-3 text-center">Receita Total</th>
                        <th className="border border-gray-200 p-3 text-center">Lucro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(resumoIngressos.custos_por_setor).map(([setor, dados]) => (
                        <tr key={setor} className="hover:bg-gray-50">
                          <td className="border border-gray-200 p-3 font-medium">{setor}</td>
                          <td className="border border-gray-200 p-3 text-center">{dados.quantidade}</td>
                          <td className="border border-gray-200 p-3 text-center text-red-600">
                            {formatCurrency(dados.custo_unitario)}
                          </td>
                          <td className="border border-gray-200 p-3 text-center font-semibold text-red-600">
                            {formatCurrency(dados.custo_total)}
                          </td>
                          <td className="border border-gray-200 p-3 text-center text-green-600">
                            {formatCurrency(dados.venda_unitaria)}
                          </td>
                          <td className="border border-gray-200 p-3 text-center font-semibold text-green-600">
                            {formatCurrency(dados.venda_total)}
                          </td>
                          <td className="border border-gray-200 p-3 text-center font-semibold text-purple-600">
                            {formatCurrency(dados.lucro_total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}