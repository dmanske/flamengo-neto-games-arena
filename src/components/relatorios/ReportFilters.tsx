import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ReportFilters, ReportPreviewData } from '@/types/report-filters';
import { PassageiroDisplay } from '@/hooks/useViagemDetails';
import { formatCurrency } from '@/lib/utils';
import { ReportPreview } from './ReportPreview';

interface Onibus {
  id: string;
  tipo_onibus: string;
  empresa: string;
  numero_identificacao: string | null;
}

interface Passeio {
  id: string;
  nome: string;
  valor: number;
}

interface ReportFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  passageiros: PassageiroDisplay[];
  onibusList: Onibus[];
  passeios?: Passeio[];
  previewData: ReportPreviewData;
}

export const ReportFiltersComponent: React.FC<ReportFiltersProps> = ({
  filters,
  onFiltersChange,
  passageiros = [],
  onibusList = [],
  passeios = [],
  previewData
}) => {
  // Verificação de segurança
  if (!filters || !onFiltersChange) {
    return <div>Carregando filtros...</div>;
  }

  // Extrair setores únicos dos passageiros
  const setoresDisponiveis = Array.from(
    new Set(passageiros.map(p => p.setor_maracana).filter(Boolean))
  ).sort();

  const updateFilter = (key: keyof ReportFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleSetor = (setor: string) => {
    const newSetores = filters.setorMaracana.includes(setor)
      ? filters.setorMaracana.filter(s => s !== setor)
      : [...filters.setorMaracana, setor];
    updateFilter('setorMaracana', newSetores);
  };

  const toggleOnibus = (onibusId: string) => {
    const newOnibus = filters.onibusIds.includes(onibusId)
      ? filters.onibusIds.filter(id => id !== onibusId)
      : [...filters.onibusIds, onibusId];
    updateFilter('onibusIds', newOnibus);
  };

  const togglePasseio = (passeioId: string) => {
    const newPasseios = filters.passeiosSelecionados.includes(passeioId)
      ? filters.passeiosSelecionados.filter(id => id !== passeioId)
      : [...filters.passeiosSelecionados, passeioId];
    updateFilter('passeiosSelecionados', newPasseios);
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = 
    filters.statusPagamento !== 'todos' ||
    filters.setorMaracana.length > 0 ||
    filters.onibusIds.length > 0 ||
    filters.passeiosSelecionados.length > 0 ||
    filters.tipoPasseios !== 'todos' ||
    !filters.mostrarNomesPasseios ||
    filters.valorMinimo !== undefined ||
    filters.valorMaximo !== undefined ||
    filters.apenasComDesconto ||
    !filters.incluirResumoFinanceiro ||
    !filters.incluirDistribuicaoSetor ||
    !filters.incluirListaOnibus ||
    !filters.incluirPassageirosNaoAlocados ||
    !filters.agruparPorOnibus ||
    filters.modoResponsavel ||
    filters.modoPassageiro ||
    filters.modoEmpresaOnibus ||
    !filters.mostrarStatusPagamento ||
    !filters.mostrarValorPadrao ||
    !filters.mostrarValoresPassageiros ||
    !filters.mostrarTelefone ||
    filters.mostrarFotoOnibus ||
    filters.mostrarNumeroPassageiro;

  const applyResponsavelMode = () => {
    const responsavelFilters = {
      ...filters,
      modoResponsavel: true,
      modoPassageiro: false,
      incluirResumoFinanceiro: false,
      mostrarValorPadrao: false,
      mostrarValoresPassageiros: false,
      mostrarStatusPagamento: false,
      mostrarTelefone: true,
      mostrarFotoOnibus: false,
      mostrarNumeroPassageiro: false,
      mostrarNomesPasseios: true,
    };
    onFiltersChange(responsavelFilters);
  };

  const applyPassageiroMode = () => {
    const passageiroFilters = {
      ...filters,
      modoResponsavel: false,
      modoPassageiro: true,
      modoEmpresaOnibus: false,
      incluirResumoFinanceiro: false,
      mostrarValorPadrao: false,
      mostrarValoresPassageiros: false,
      mostrarStatusPagamento: false,
      mostrarTelefone: false,
      mostrarFotoOnibus: true,
      mostrarNumeroPassageiro: true,
      mostrarNomesPasseios: true,
      agruparPorOnibus: true,
    };
    onFiltersChange(passageiroFilters);
  };

  const applyEmpresaOnibusMode = () => {
    const empresaOnibusFilters = {
      ...filters,
      modoResponsavel: false,
      modoPassageiro: false,
      modoEmpresaOnibus: true,
      incluirResumoFinanceiro: false,
      incluirDistribuicaoSetor: false, // Remove distribuição por setor
      mostrarValorPadrao: false,
      mostrarValoresPassageiros: false,
      mostrarStatusPagamento: false,
      mostrarTelefone: false,
      mostrarNomesPasseios: false,
      mostrarFotoOnibus: false,
      mostrarNumeroPassageiro: true,
      agruparPorOnibus: true,
    };
    onFiltersChange(empresaOnibusFilters);
  };

  const resetToNormalMode = () => {
    const normalFilters = {
      ...filters,
      modoResponsavel: false,
      modoPassageiro: false,
      modoEmpresaOnibus: false,
      incluirResumoFinanceiro: true,
      incluirDistribuicaoSetor: true,
      mostrarValorPadrao: true,
      mostrarValoresPassageiros: true,
      mostrarStatusPagamento: true,
      mostrarTelefone: true,
      mostrarFotoOnibus: false,
      mostrarNumeroPassageiro: false,
    };
    onFiltersChange(normalFilters);
  };

  return (
    <div className="space-y-6">
      {/* Filtros Rápidos */}
      <Card className={
        filters.modoResponsavel ? 'border-orange-200 bg-orange-50' : 
        filters.modoPassageiro ? 'border-blue-200 bg-blue-50' : 
        filters.modoEmpresaOnibus ? 'border-green-200 bg-green-50' : ''
      }>
        <CardHeader>
          <CardTitle className="text-lg">⚡ Filtros Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {!filters.modoResponsavel && !filters.modoPassageiro && !filters.modoEmpresaOnibus ? (
              <>
                <Button
                  onClick={applyResponsavelMode}
                  variant="outline"
                  className="bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700"
                >
                  📋 Lista para Responsável do Ônibus
                </Button>
                <Button
                  onClick={applyPassageiroMode}
                  variant="outline"
                  className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                >
                  👥 Lista para Passageiros
                </Button>
                <Button
                  onClick={applyEmpresaOnibusMode}
                  variant="outline"
                  className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                >
                  🚌 Enviar para Empresa de Ônibus
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {filters.modoResponsavel && (
                  <Badge className="bg-orange-100 text-orange-700 px-3 py-1">
                    📋 Modo: Lista para Responsável
                  </Badge>
                )}
                {filters.modoPassageiro && (
                  <Badge className="bg-blue-100 text-blue-700 px-3 py-1">
                    👥 Modo: Lista para Passageiros
                  </Badge>
                )}
                {filters.modoEmpresaOnibus && (
                  <Badge className="bg-green-100 text-green-700 px-3 py-1">
                    🚌 Modo: Empresa de Ônibus
                  </Badge>
                )}
                <Button
                  onClick={resetToNormalMode}
                  variant="outline"
                  size="sm"
                  className={
                    filters.modoResponsavel ? "text-orange-700 border-orange-300" : 
                    filters.modoPassageiro ? "text-blue-700 border-blue-300" :
                    filters.modoEmpresaOnibus ? "text-green-700 border-green-300" : ""
                  }
                >
                  Voltar ao Normal
                </Button>
              </div>
            )}
          </div>
          
          {filters.modoResponsavel && (
            <div className="mt-4 p-3 bg-orange-100 rounded-lg">
              <p className="text-sm text-orange-800 mb-2">
                <strong>Modo Responsável Ativo:</strong> Informações financeiras ocultas
              </p>
              <div className="flex items-center space-x-2">
                <Switch
                  id="mostrar-status-responsavel"
                  checked={filters.mostrarStatusPagamento}
                  onCheckedChange={(checked) => updateFilter('mostrarStatusPagamento', checked)}
                />
                <Label htmlFor="mostrar-status-responsavel" className="text-sm text-orange-800">
                  Mostrar status de pagamento
                </Label>
              </div>
            </div>
          )}

          {filters.modoPassageiro && (
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Modo Passageiro Ativo:</strong> Lista simplificada (número, nome, cidade, setor, passeios)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="mostrar-foto-onibus"
                    checked={filters.mostrarFotoOnibus}
                    onCheckedChange={(checked) => updateFilter('mostrarFotoOnibus', checked)}
                  />
                  <Label htmlFor="mostrar-foto-onibus" className="text-sm text-blue-800">
                    Mostrar foto do ônibus
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="mostrar-numero-passageiro"
                    checked={filters.mostrarNumeroPassageiro}
                    onCheckedChange={(checked) => updateFilter('mostrarNumeroPassageiro', checked)}
                  />
                  <Label htmlFor="mostrar-numero-passageiro" className="text-sm text-blue-800">
                    Mostrar número do passageiro
                  </Label>
                </div>
              </div>
            </div>
          )}

          {filters.modoEmpresaOnibus && (
            <div className="mt-4 p-3 bg-green-100 rounded-lg">
              <p className="text-sm text-green-800 mb-2">
                <strong>Modo Empresa de Ônibus Ativo:</strong> Lista com dados essenciais para embarque
              </p>
              <div className="text-sm text-green-700">
                <p><strong>Colunas exibidas:</strong> Número, Nome, CPF, Data de Nascimento, Local de Embarque</p>
                <p><strong>Removido:</strong> Informações financeiras, telefone, setor do Maracanã, passeios</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview dos Filtros */}
      <ReportPreview 
        previewData={previewData} 
        isFiltered={hasActiveFilters}
      />

      {/* Filtros de Passageiros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">👥 Filtros de Passageiros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status de Pagamento */}
          <div>
            <Label className="text-sm font-medium">Status de Pagamento</Label>
            <Select
              value={filters.statusPagamento}
              onValueChange={(value: any) => updateFilter('statusPagamento', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="pago">Apenas Pagos</SelectItem>
                <SelectItem value="pendente">Apenas Pendentes</SelectItem>
                <SelectItem value="parcial">Apenas Parciais</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Setores do Maracanã */}
          {setoresDisponiveis.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Setores do Maracanã</Label>
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                {setoresDisponiveis.map(setor => (
                  <div key={setor} className="flex items-center space-x-2">
                    <Checkbox
                      id={`setor-${setor}`}
                      checked={filters.setorMaracana.includes(setor)}
                      onCheckedChange={() => toggleSetor(setor)}
                    />
                    <Label htmlFor={`setor-${setor}`} className="text-sm">
                      {setor}
                    </Label>
                  </div>
                ))}
              </div>
              {filters.setorMaracana.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {filters.setorMaracana.map(setor => (
                    <Badge key={setor} variant="outline" className="text-xs">
                      {setor}
                      <button
                        onClick={() => toggleSetor(setor)}
                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ônibus */}
          {onibusList.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Ônibus</Label>
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                {onibusList.map((onibus, index) => (
                  <div key={onibus.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`onibus-${onibus.id}`}
                      checked={filters.onibusIds.includes(onibus.id)}
                      onCheckedChange={() => toggleOnibus(onibus.id)}
                    />
                    <Label htmlFor={`onibus-${onibus.id}`} className="text-sm">
                      Ônibus {index + 1} {onibus.numero_identificacao && `- ${onibus.numero_identificacao}`}
                      <span className="text-gray-500 ml-1">({onibus.tipo_onibus})</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Passeios (para viagens novas) */}
          {passeios.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Filtros de Passeios</Label>
              
              {/* Tipo de Passeios */}
              <div className="mt-2">
                <Label className="text-xs text-gray-600">Tipo de Passeios</Label>
                <Select
                  value={filters.tipoPasseios}
                  onValueChange={(value: any) => updateFilter('tipoPasseios', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Passeios</SelectItem>
                    <SelectItem value="pagos">Apenas Pagos</SelectItem>
                    <SelectItem value="gratuitos">Apenas Gratuitos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mostrar Nomes dos Passeios */}
              <div className="mt-3 flex items-center space-x-2">
                <Switch
                  id="mostrar-nomes-passeios"
                  checked={filters.mostrarNomesPasseios}
                  onCheckedChange={(checked) => updateFilter('mostrarNomesPasseios', checked)}
                />
                <Label htmlFor="mostrar-nomes-passeios" className="text-sm">
                  Mostrar nomes dos passeios na lista
                </Label>
              </div>

              {/* Passeios Específicos */}
              <div className="mt-3">
                <Label className="text-xs text-gray-600">Passeios Específicos</Label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {passeios
                    .filter(passeio => {
                      if (filters.tipoPasseios === 'pagos') return passeio.valor > 0;
                      if (filters.tipoPasseios === 'gratuitos') return passeio.valor === 0;
                      return true;
                    })
                    .map(passeio => (
                    <div key={passeio.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`passeio-${passeio.id}`}
                        checked={filters.passeiosSelecionados.includes(passeio.id)}
                        onCheckedChange={() => togglePasseio(passeio.id)}
                      />
                      <Label htmlFor={`passeio-${passeio.id}`} className="text-sm">
                        {passeio.nome}
                        <span className={`ml-1 ${passeio.valor > 0 ? 'text-green-600' : 'text-blue-600'}`}>
                          ({passeio.valor > 0 ? formatCurrency(passeio.valor) : 'Gratuito'})
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filtros de Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💰 Filtros de Valores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Valor Mínimo</Label>
              <Input
                type="number"
                placeholder="R$ 0,00"
                value={filters.valorMinimo || ''}
                onChange={(e) => updateFilter('valorMinimo', e.target.value ? Number(e.target.value) : undefined)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Valor Máximo</Label>
              <Input
                type="number"
                placeholder="R$ 999,99"
                value={filters.valorMaximo || ''}
                onChange={(e) => updateFilter('valorMaximo', e.target.value ? Number(e.target.value) : undefined)}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="apenas-desconto"
              checked={filters.apenasComDesconto}
              onCheckedChange={(checked) => updateFilter('apenasComDesconto', checked)}
            />
            <Label htmlFor="apenas-desconto" className="text-sm">
              Apenas passageiros com desconto
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Opções de Personalização do Relatório */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📄 Personalização do Relatório</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seções do Relatório */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Seções a Incluir</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="resumo-financeiro"
                  checked={filters.incluirResumoFinanceiro}
                  onCheckedChange={(checked) => updateFilter('incluirResumoFinanceiro', checked)}
                  disabled={filters.modoResponsavel || filters.modoPassageiro}
                />
                <Label htmlFor="resumo-financeiro" className="text-sm">
                  Incluir Resumo Financeiro
                  {filters.modoResponsavel && <span className="text-orange-600 ml-1">(Desabilitado no modo responsável)</span>}
                  {filters.modoPassageiro && <span className="text-blue-600 ml-1">(Desabilitado no modo passageiro)</span>}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="distribuicao-setor"
                  checked={filters.incluirDistribuicaoSetor}
                  onCheckedChange={(checked) => updateFilter('incluirDistribuicaoSetor', checked)}
                />
                <Label htmlFor="distribuicao-setor" className="text-sm">
                  Incluir Distribuição por Setor
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="lista-onibus"
                  checked={filters.incluirListaOnibus}
                  onCheckedChange={(checked) => updateFilter('incluirListaOnibus', checked)}
                />
                <Label htmlFor="lista-onibus" className="text-sm">
                  Incluir Lista de Ônibus
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="passageiros-nao-alocados"
                  checked={filters.incluirPassageirosNaoAlocados}
                  onCheckedChange={(checked) => updateFilter('incluirPassageirosNaoAlocados', checked)}
                />
                <Label htmlFor="passageiros-nao-alocados" className="text-sm">
                  Incluir Passageiros Não Alocados
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="agrupar-onibus"
                  checked={filters.agruparPorOnibus}
                  onCheckedChange={(checked) => updateFilter('agruparPorOnibus', checked)}
                />
                <Label htmlFor="agrupar-onibus" className="text-sm">
                  Agrupar por Ônibus
                </Label>
              </div>
            </div>
          </div>

          {/* Informações Financeiras */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium mb-3 block">Informações Financeiras</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="mostrar-valor-padrao"
                  checked={filters.mostrarValorPadrao}
                  onCheckedChange={(checked) => updateFilter('mostrarValorPadrao', checked)}
                  disabled={filters.modoResponsavel || filters.modoPassageiro}
                />
                <Label htmlFor="mostrar-valor-padrao" className="text-sm">
                  Mostrar valor padrão da viagem
                  {filters.modoResponsavel && <span className="text-orange-600 ml-1">(Oculto no modo responsável)</span>}
                  {filters.modoPassageiro && <span className="text-blue-600 ml-1">(Oculto no modo passageiro)</span>}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="mostrar-valores-passageiros"
                  checked={filters.mostrarValoresPassageiros}
                  onCheckedChange={(checked) => updateFilter('mostrarValoresPassageiros', checked)}
                  disabled={filters.modoResponsavel || filters.modoPassageiro}
                />
                <Label htmlFor="mostrar-valores-passageiros" className="text-sm">
                  Mostrar valores na lista de passageiros
                  {filters.modoResponsavel && <span className="text-orange-600 ml-1">(Oculto no modo responsável)</span>}
                  {filters.modoPassageiro && <span className="text-blue-600 ml-1">(Oculto no modo passageiro)</span>}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="mostrar-telefone"
                  checked={filters.mostrarTelefone}
                  onCheckedChange={(checked) => updateFilter('mostrarTelefone', checked)}
                />
                <Label htmlFor="mostrar-telefone" className="text-sm">
                  Mostrar telefone na lista
                  {filters.modoPassageiro && <span className="text-blue-600 ml-1">(Oculto no modo passageiro)</span>}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="mostrar-status-pagamento"
                  checked={filters.mostrarStatusPagamento}
                  onCheckedChange={(checked) => updateFilter('mostrarStatusPagamento', checked)}
                />
                <Label htmlFor="mostrar-status-pagamento" className="text-sm">
                  Mostrar status de pagamento
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};