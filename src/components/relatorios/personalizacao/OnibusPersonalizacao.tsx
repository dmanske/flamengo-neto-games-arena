/**
 * Componente para personalização da lista de ônibus
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bus, Settings, Route, Users, Camera } from 'lucide-react';
import { OnibusConfig } from '@/types/personalizacao-relatorios';

interface OnibusPersonalizacaoProps {
  config: OnibusConfig;
  onChange: (config: OnibusConfig) => void;
}

export function OnibusPersonalizacao({ config, onChange }: OnibusPersonalizacaoProps) {
  const updateConfig = <K extends keyof OnibusConfig>(
    section: K,
    updates: Partial<OnibusConfig[K]>
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
      {/* Dados Básicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bus className="w-5 h-5" />
            Dados Básicos dos Ônibus
          </CardTitle>
          <CardDescription>
            Configure quais informações básicas dos ônibus serão exibidas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Número de Identificação</Label>
              <Switch
                checked={config.dadosBasicos.mostrarNumeroIdentificacao}
                onCheckedChange={(checked) => 
                  updateConfig('dadosBasicos', { mostrarNumeroIdentificacao: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Tipo do Ônibus</Label>
              <Switch
                checked={config.dadosBasicos.mostrarTipoOnibus}
                onCheckedChange={(checked) => 
                  updateConfig('dadosBasicos', { mostrarTipoOnibus: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Empresa</Label>
              <Switch
                checked={config.dadosBasicos.mostrarEmpresa}
                onCheckedChange={(checked) => 
                  updateConfig('dadosBasicos', { mostrarEmpresa: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Capacidade</Label>
              <Switch
                checked={config.dadosBasicos.mostrarCapacidade}
                onCheckedChange={(checked) => 
                  updateConfig('dadosBasicos', { mostrarCapacidade: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Lugares Extras</Label>
              <Switch
                checked={config.dadosBasicos.mostrarLugaresExtras}
                onCheckedChange={(checked) => 
                  updateConfig('dadosBasicos', { mostrarLugaresExtras: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados de Transfer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="w-5 h-5" />
            Dados de Transfer
          </CardTitle>
          <CardDescription>
            Informações específicas para transfer e turismo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Nome do Tour</Label>
              <Switch
                checked={config.dadosTransfer.mostrarNomeTour}
                onCheckedChange={(checked) => 
                  updateConfig('dadosTransfer', { mostrarNomeTour: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Rota</Label>
              <Switch
                checked={config.dadosTransfer.mostrarRota}
                onCheckedChange={(checked) => 
                  updateConfig('dadosTransfer', { mostrarRota: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Placa do Veículo</Label>
              <Switch
                checked={config.dadosTransfer.mostrarPlaca}
                onCheckedChange={(checked) => 
                  updateConfig('dadosTransfer', { mostrarPlaca: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Motorista</Label>
              <Switch
                checked={config.dadosTransfer.mostrarMotorista}
                onCheckedChange={(checked) => 
                  updateConfig('dadosTransfer', { mostrarMotorista: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados de Ocupação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Dados de Ocupação
          </CardTitle>
          <CardDescription>
            Estatísticas de ocupação dos ônibus
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Total de Passageiros</Label>
              <Switch
                checked={config.dadosOcupacao.mostrarTotalPassageiros}
                onCheckedChange={(checked) => 
                  updateConfig('dadosOcupacao', { mostrarTotalPassageiros: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Passageiros Confirmados</Label>
              <Switch
                checked={config.dadosOcupacao.mostrarPassageirosConfirmados}
                onCheckedChange={(checked) => 
                  updateConfig('dadosOcupacao', { mostrarPassageirosConfirmados: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Vagas Disponíveis</Label>
              <Switch
                checked={config.dadosOcupacao.mostrarVagasDisponiveis}
                onCheckedChange={(checked) => 
                  updateConfig('dadosOcupacao', { mostrarVagasDisponiveis: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Taxa de Ocupação</Label>
              <Switch
                checked={config.dadosOcupacao.mostrarTaxaOcupacao}
                onCheckedChange={(checked) => 
                  updateConfig('dadosOcupacao', { mostrarTaxaOcupacao: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados Técnicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Dados Técnicos
          </CardTitle>
          <CardDescription>
            Informações técnicas e extras dos ônibus
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>WiFi</Label>
              <Switch
                checked={config.dadosTecnicos.mostrarWifi}
                onCheckedChange={(checked) => 
                  updateConfig('dadosTecnicos', { mostrarWifi: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Foto do Ônibus</Label>
              <Switch
                checked={config.dadosTecnicos.mostrarFoto}
                onCheckedChange={(checked) => 
                  updateConfig('dadosTecnicos', { mostrarFoto: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Observações</Label>
              <Switch
                checked={config.dadosTecnicos.mostrarObservacoes}
                onCheckedChange={(checked) => 
                  updateConfig('dadosTecnicos', { mostrarObservacoes: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Exibição */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Configurações de Exibição
          </CardTitle>
          <CardDescription>
            Como os ônibus serão apresentados no relatório
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Mostrar Lista de Passageiros</Label>
            <Switch
              checked={config.exibicao.mostrarListaPassageiros}
              onCheckedChange={(checked) => 
                updateConfig('exibicao', { mostrarListaPassageiros: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Página Separada por Ônibus</Label>
            <Switch
              checked={config.exibicao.paginaSeparadaPorOnibus}
              onCheckedChange={(checked) => 
                updateConfig('exibicao', { paginaSeparadaPorOnibus: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Ordenar Por</Label>
            <Select
              value={config.exibicao.ordenarPor}
              onValueChange={(value: 'numero' | 'empresa' | 'capacidade' | 'ocupacao') => 
                updateConfig('exibicao', { ordenarPor: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="numero">Número de Identificação</SelectItem>
                <SelectItem value="empresa">Empresa</SelectItem>
                <SelectItem value="capacidade">Capacidade</SelectItem>
                <SelectItem value="ocupacao">Taxa de Ocupação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}