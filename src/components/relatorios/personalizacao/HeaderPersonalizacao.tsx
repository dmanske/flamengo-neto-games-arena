/**
 * Componente para personalização do cabeçalho do relatório
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Building, 
  Phone, 
  Mail, 
  Globe, 
  Image,
  FileText,
  Hash,
  DollarSign
} from 'lucide-react';

import { HeaderConfig } from '@/types/personalizacao-relatorios';

// ============================================================================
// INTERFACES
// ============================================================================

interface HeaderPersonalizacaoProps {
  config: HeaderConfig;
  onChange: (config: HeaderConfig) => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function HeaderPersonalizacao({ config, onChange }: HeaderPersonalizacaoProps) {
  /**
   * Atualiza uma parte específica da configuração
   */
  const updateConfig = <K extends keyof HeaderConfig>(
    section: K,
    updates: Partial<HeaderConfig[K]>
  ) => {
    onChange({
      ...config,
      [section]: {
        ...config[section],
        ...updates
      }
    });
  };

  /**
   * Atualiza texto personalizado
   */
  const updateTextoPersonalizado = (field: keyof HeaderConfig['textoPersonalizado'], value: string) => {
    onChange({
      ...config,
      textoPersonalizado: {
        ...config.textoPersonalizado,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Dados do Jogo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Dados do Jogo
          </CardTitle>
          <CardDescription>
            Configure quais informações do jogo serão exibidas no cabeçalho
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="mostrar-adversario" className="flex items-center gap-2">
                <span>Mostrar Adversário</span>
                <Badge variant="secondary">Recomendado</Badge>
              </Label>
              <Switch
                id="mostrar-adversario"
                checked={config.dadosJogo.mostrarAdversario}
                onCheckedChange={(checked) => 
                  updateConfig('dadosJogo', { mostrarAdversario: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="mostrar-data-hora">Mostrar Data e Hora</Label>
              <Switch
                id="mostrar-data-hora"
                checked={config.dadosJogo.mostrarDataHora}
                onCheckedChange={(checked) => 
                  updateConfig('dadosJogo', { mostrarDataHora: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="mostrar-local">Mostrar Local do Jogo</Label>
              <Switch
                id="mostrar-local"
                checked={config.dadosJogo.mostrarLocalJogo}
                onCheckedChange={(checked) => 
                  updateConfig('dadosJogo', { mostrarLocalJogo: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="mostrar-estadio">Mostrar Nome do Estádio</Label>
              <Switch
                id="mostrar-estadio"
                checked={config.dadosJogo.mostrarNomeEstadio}
                onCheckedChange={(checked) => 
                  updateConfig('dadosJogo', { mostrarNomeEstadio: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados da Viagem */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Dados da Viagem
          </CardTitle>
          <CardDescription>
            Configure informações específicas da viagem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="mostrar-status">Mostrar Status da Viagem</Label>
              <Switch
                id="mostrar-status"
                checked={config.dadosViagem.mostrarStatus}
                onCheckedChange={(checked) => 
                  updateConfig('dadosViagem', { mostrarStatus: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="mostrar-valor-padrao">Mostrar Valor Padrão</Label>
              <Switch
                id="mostrar-valor-padrao"
                checked={config.dadosViagem.mostrarValorPadrao}
                onCheckedChange={(checked) => 
                  updateConfig('dadosViagem', { mostrarValorPadrao: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="mostrar-setor-padrao">Mostrar Setor Padrão</Label>
              <Switch
                id="mostrar-setor-padrao"
                checked={config.dadosViagem.mostrarSetorPadrao}
                onCheckedChange={(checked) => 
                  updateConfig('dadosViagem', { mostrarSetorPadrao: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="mostrar-rota">Mostrar Rota</Label>
              <Switch
                id="mostrar-rota"
                checked={config.dadosViagem.mostrarRota}
                onCheckedChange={(checked) => 
                  updateConfig('dadosViagem', { mostrarRota: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="mostrar-tipo-pagamento">Mostrar Tipo de Pagamento</Label>
              <Switch
                id="mostrar-tipo-pagamento"
                checked={config.dadosViagem.mostrarTipoPagamento}
                onCheckedChange={(checked) => 
                  updateConfig('dadosViagem', { mostrarTipoPagamento: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Logos e Imagens
          </CardTitle>
          <CardDescription>
            Configure a exibição de logos no cabeçalho
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="logo-empresa">Logo da Empresa</Label>
              <Switch
                id="logo-empresa"
                checked={config.logos.mostrarLogoEmpresa}
                onCheckedChange={(checked) => 
                  updateConfig('logos', { mostrarLogoEmpresa: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="logo-adversario">Logo do Adversário</Label>
              <Switch
                id="logo-adversario"
                checked={config.logos.mostrarLogoAdversario}
                onCheckedChange={(checked) => 
                  updateConfig('logos', { mostrarLogoAdversario: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="logo-flamengo">Logo do Flamengo</Label>
              <Switch
                id="logo-flamengo"
                checked={config.logos.mostrarLogoFlamengo}
                onCheckedChange={(checked) => 
                  updateConfig('logos', { mostrarLogoFlamengo: checked })
                }
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="posicionamento-logos">Posicionamento dos Logos</Label>
              <Select
                value={config.logos.posicionamento}
                onValueChange={(value: 'horizontal' | 'vertical' | 'personalizado') => 
                  updateConfig('logos', { posicionamento: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                  <SelectItem value="vertical">Vertical</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tamanho-logos">Tamanho dos Logos</Label>
              <Select
                value={config.logos.tamanhoLogos}
                onValueChange={(value: 'pequeno' | 'medio' | 'grande') => 
                  updateConfig('logos', { tamanhoLogos: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pequeno">Pequeno</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="grande">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações da Empresa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Informações da Empresa
          </CardTitle>
          <CardDescription>
            Configure quais dados da empresa serão exibidos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="empresa-nome" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Nome da Empresa
              </Label>
              <Switch
                id="empresa-nome"
                checked={config.empresa.mostrarNome}
                onCheckedChange={(checked) => 
                  updateConfig('empresa', { mostrarNome: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="empresa-telefone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telefone
              </Label>
              <Switch
                id="empresa-telefone"
                checked={config.empresa.mostrarTelefone}
                onCheckedChange={(checked) => 
                  updateConfig('empresa', { mostrarTelefone: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="empresa-email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                E-mail
              </Label>
              <Switch
                id="empresa-email"
                checked={config.empresa.mostrarEmail}
                onCheckedChange={(checked) => 
                  updateConfig('empresa', { mostrarEmail: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="empresa-endereco" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Endereço
              </Label>
              <Switch
                id="empresa-endereco"
                checked={config.empresa.mostrarEndereco}
                onCheckedChange={(checked) => 
                  updateConfig('empresa', { mostrarEndereco: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="empresa-site" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Site
              </Label>
              <Switch
                id="empresa-site"
                checked={config.empresa.mostrarSite}
                onCheckedChange={(checked) => 
                  updateConfig('empresa', { mostrarSite: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="empresa-redes">Redes Sociais</Label>
              <Switch
                id="empresa-redes"
                checked={config.empresa.mostrarRedesSociais}
                onCheckedChange={(checked) => 
                  updateConfig('empresa', { mostrarRedesSociais: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Totais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Totais e Estatísticas
          </CardTitle>
          <CardDescription>
            Configure quais totais serão exibidos no cabeçalho
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="total-ingressos">Total de Ingressos</Label>
              <Switch
                id="total-ingressos"
                checked={config.totais.mostrarTotalIngressos}
                onCheckedChange={(checked) => 
                  updateConfig('totais', { mostrarTotalIngressos: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="total-passageiros">Total de Passageiros</Label>
              <Switch
                id="total-passageiros"
                checked={config.totais.mostrarTotalPassageiros}
                onCheckedChange={(checked) => 
                  updateConfig('totais', { mostrarTotalPassageiros: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="total-arrecadado" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Arrecadado
              </Label>
              <Switch
                id="total-arrecadado"
                checked={config.totais.mostrarTotalArrecadado}
                onCheckedChange={(checked) => 
                  updateConfig('totais', { mostrarTotalArrecadado: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="data-geracao">Data de Geração</Label>
              <Switch
                id="data-geracao"
                checked={config.totais.mostrarDataGeracao}
                onCheckedChange={(checked) => 
                  updateConfig('totais', { mostrarDataGeracao: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Texto Personalizado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Texto Personalizado
          </CardTitle>
          <CardDescription>
            Adicione textos personalizados ao cabeçalho
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo-personalizado">Título Personalizado</Label>
            <Input
              id="titulo-personalizado"
              placeholder="Ex: Relatório de Viagem - Flamengo vs Adversário"
              value={config.textoPersonalizado.titulo || ''}
              onChange={(e) => updateTextoPersonalizado('titulo', e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {(config.textoPersonalizado.titulo || '').length}/200 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitulo-personalizado">Subtítulo</Label>
            <Input
              id="subtitulo-personalizado"
              placeholder="Ex: Informações detalhadas da viagem"
              value={config.textoPersonalizado.subtitulo || ''}
              onChange={(e) => updateTextoPersonalizado('subtitulo', e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes-personalizadas">Observações</Label>
            <Textarea
              id="observacoes-personalizadas"
              placeholder="Observações importantes sobre a viagem..."
              value={config.textoPersonalizado.observacoes || ''}
              onChange={(e) => updateTextoPersonalizado('observacoes', e.target.value)}
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {(config.textoPersonalizado.observacoes || '').length}/500 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instrucoes-personalizadas">Instruções</Label>
            <Textarea
              id="instrucoes-personalizadas"
              placeholder="Instruções para os passageiros..."
              value={config.textoPersonalizado.instrucoes || ''}
              onChange={(e) => updateTextoPersonalizado('instrucoes', e.target.value)}
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {(config.textoPersonalizado.instrucoes || '').length}/500 caracteres
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}