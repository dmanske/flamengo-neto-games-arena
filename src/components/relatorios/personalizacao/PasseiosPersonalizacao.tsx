/**
 * Componente para personalização de passeios
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, DollarSign, BarChart, Tag } from 'lucide-react';
import { PasseiosConfig } from '@/types/personalizacao-relatorios';

interface PasseiosPersonalizacaoProps {
  config: PasseiosConfig;
  onChange: (config: PasseiosConfig) => void;
}

export function PasseiosPersonalizacao({ config, onChange }: PasseiosPersonalizacaoProps) {
  const updateConfig = <K extends keyof PasseiosConfig>(
    section: K,
    updates: Partial<PasseiosConfig[K]>
  ) => {
    onChange({
      ...config,
      [section]: {
        ...config[section],
        ...updates
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Tipos de Passeios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Tipos de Passeios
          </CardTitle>
          <CardDescription>
            Configure quais tipos de passeios incluir no relatório
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Incluir Passeios Pagos</Label>
              <Switch
                checked={config.tiposPasseios.incluirPagos}
                onCheckedChange={(checked) => 
                  updateConfig('tiposPasseios', { incluirPagos: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Incluir Passeios Gratuitos</Label>
              <Switch
                checked={config.tiposPasseios.incluirGratuitos}
                onCheckedChange={(checked) => 
                  updateConfig('tiposPasseios', { incluirGratuitos: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados por Passeio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Dados por Passeio
          </CardTitle>
          <CardDescription>
            Configure quais informações mostrar para cada passeio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Nome do Passeio</Label>
              <Switch
                checked={config.dadosPorPasseio.mostrarNome}
                onCheckedChange={(checked) => 
                  updateConfig('dadosPorPasseio', { mostrarNome: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Categoria</Label>
              <Switch
                checked={config.dadosPorPasseio.mostrarCategoria}
                onCheckedChange={(checked) => 
                  updateConfig('dadosPorPasseio', { mostrarCategoria: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Valor Cobrado</Label>
              <Switch
                checked={config.dadosPorPasseio.mostrarValorCobrado}
                onCheckedChange={(checked) => 
                  updateConfig('dadosPorPasseio', { mostrarValorCobrado: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Custo Operacional</Label>
              <Switch
                checked={config.dadosPorPasseio.mostrarCustoOperacional}
                onCheckedChange={(checked) => 
                  updateConfig('dadosPorPasseio', { mostrarCustoOperacional: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Descrição</Label>
              <Switch
                checked={config.dadosPorPasseio.mostrarDescricao}
                onCheckedChange={(checked) => 
                  updateConfig('dadosPorPasseio', { mostrarDescricao: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Estatísticas de Passeios
          </CardTitle>
          <CardDescription>
            Configure quais estatísticas exibir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Total de Participantes</Label>
              <Switch
                checked={config.estatisticas.mostrarTotalParticipantes}
                onCheckedChange={(checked) => 
                  updateConfig('estatisticas', { mostrarTotalParticipantes: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Receita por Passeio</Label>
              <Switch
                checked={config.estatisticas.mostrarReceitaPorPasseio}
                onCheckedChange={(checked) => 
                  updateConfig('estatisticas', { mostrarReceitaPorPasseio: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Margem de Lucro</Label>
              <Switch
                checked={config.estatisticas.mostrarMargemLucro}
                onCheckedChange={(checked) => 
                  updateConfig('estatisticas', { mostrarMargemLucro: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Faixas Etárias</Label>
              <Switch
                checked={config.estatisticas.mostrarFaixasEtarias}
                onCheckedChange={(checked) => 
                  updateConfig('estatisticas', { mostrarFaixasEtarias: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agrupamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Agrupamentos
          </CardTitle>
          <CardDescription>
            Configure como agrupar os passeios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Agrupamento</Label>
              <Select
                value={config.agrupamentos.tipo}
                onValueChange={(value: 'categoria' | 'valor' | 'popularidade' | 'nenhum') => 
                  updateConfig('agrupamentos', { tipo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Sem Agrupamento</SelectItem>
                  <SelectItem value="categoria">Por Categoria</SelectItem>
                  <SelectItem value="valor">Por Valor</SelectItem>
                  <SelectItem value="popularidade">Por Popularidade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ordenação</Label>
              <Select
                value={config.agrupamentos.ordenacao}
                onValueChange={(value: 'alfabetica' | 'valor' | 'participantes') => 
                  updateConfig('agrupamentos', { ordenacao: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alfabetica">Alfabética</SelectItem>
                  <SelectItem value="valor">Por Valor</SelectItem>
                  <SelectItem value="participantes">Por Participantes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exibição na Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Exibição na Lista de Passageiros</CardTitle>
          <CardDescription>
            Configure como os passeios aparecem na lista de passageiros
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Formato de Exibição</Label>
            <Select
              value={config.exibicaoNaLista.formato}
              onValueChange={(value: 'coluna_separada' | 'texto_concatenado' | 'com_icones') => 
                updateConfig('exibicaoNaLista', { formato: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coluna_separada">Coluna Separada</SelectItem>
                <SelectItem value="texto_concatenado">Texto Concatenado</SelectItem>
                <SelectItem value="com_icones">Com Ícones</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Mostrar Status</Label>
              <Switch
                checked={config.exibicaoNaLista.mostrarStatus}
                onCheckedChange={(checked) => 
                  updateConfig('exibicaoNaLista', { mostrarStatus: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Valores Individuais</Label>
              <Switch
                checked={config.exibicaoNaLista.mostrarValoresIndividuais}
                onCheckedChange={(checked) => 
                  updateConfig('exibicaoNaLista', { mostrarValoresIndividuais: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Observações</Label>
              <Switch
                checked={config.exibicaoNaLista.mostrarObservacoes}
                onCheckedChange={(checked) => 
                  updateConfig('exibicaoNaLista', { mostrarObservacoes: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}