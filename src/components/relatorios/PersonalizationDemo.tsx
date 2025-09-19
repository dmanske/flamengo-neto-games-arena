/**
 * Componente de demonstração do sistema de personalização
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Eye, 
  Download, 
  Share, 
  Palette,
  FileText,
  Zap
} from 'lucide-react';
import { PersonalizacaoDialog } from './PersonalizacaoDialog';
import { PersonalizedReport } from './PersonalizedReport';
import { usePersonalizacao } from '@/hooks/usePersonalizacao';
import { getDefaultConfig, ConfigScenario } from '@/lib/personalizacao-defaults';
import { PersonalizationConfig } from '@/types/personalizacao-relatorios';

interface PersonalizationDemoProps {
  viagemId: string;
  className?: string;
}

export function PersonalizationDemo({ viagemId, className = '' }: PersonalizationDemoProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
    config,
    updateConfig,
    validation,
    hasChanges,
    canApply,
    saveAsTemplate,
    exportConfig,
    getConfigStats
  } = usePersonalizacao({
    viagemId,
    autoSave: true
  });

  const stats = getConfigStats();

  // Dados mockados para demonstração
  const mockData = {
    viagem: {
      id: viagemId,
      adversario: 'Botafogo',
      dataJogo: '2024-03-15T20:00:00',
      localJogo: 'Maracanã',
      estadio: 'Estádio do Maracanã',
      status: 'Confirmada',
      valorPadrao: 150,
      setorPadrao: 'Norte'
    },
    passageiros: [
      {
        numeroSequencial: 1,
        nome: 'João Silva',
        cpf: '123.456.789-00',
        dataNascimento: '1990-05-15',
        idade: 34,
        telefone: '(21) 99999-9999',
        email: 'joao@email.com',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        endereco: 'Rua das Flores, 123',
        numero: '123',
        bairro: 'Copacabana',
        cep: '22070-000',
        cidadeEmbarque: 'Rio de Janeiro',
        setorMaracana: 'Norte',
        onibusAlocado: 'Ônibus 01',
        statusPagamento: 'Pago',
        formaPagamento: 'PIX',
        valorPago: 150,
        desconto: 0,
        valorBruto: 150,
        pagoPorCredito: false,
        valorCreditoUtilizado: 0,
        passeiosSelecionados: ['Cristo Redentor', 'Pão de Açúcar'],
        statusPasseios: 'Confirmado',
        valoresCobradosPasseio: [50, 40],
        responsavelOnibus: false,
        comoConheceu: 'Instagram'
      },
      {
        numeroSequencial: 2,
        nome: 'Maria Santos',
        cpf: '987.654.321-00',
        dataNascimento: '1985-08-22',
        idade: 39,
        telefone: '(21) 88888-8888',
        email: 'maria@email.com',
        cidade: 'Niterói',
        estado: 'RJ',
        endereco: 'Av. Atlântica, 456',
        numero: '456',
        bairro: 'Icaraí',
        cep: '24230-000',
        cidadeEmbarque: 'Niterói',
        setorMaracana: 'Sul',
        onibusAlocado: 'Ônibus 01',
        statusPagamento: 'Pendente',
        formaPagamento: 'Cartão de Crédito',
        valorPago: 0,
        desconto: 15,
        valorBruto: 150,
        pagoPorCredito: false,
        valorCreditoUtilizado: 0,
        passeiosSelecionados: ['Cristo Redentor'],
        statusPasseios: 'Pendente',
        valoresCobradosPasseio: [50],
        responsavelOnibus: false,
        comoConheceu: 'Indicação'
      }
    ],
    onibus: [
      {
        id: '1',
        numeroIdentificacao: 'Ônibus 01',
        tipoOnibus: '46 Semi-Leito',
        empresa: 'Viação 1001',
        capacidade: 46,
        ocupacao: 2,
        passageiros: []
      }
    ],
    passeios: [
      {
        id: '1',
        nome: 'Cristo Redentor',
        categoria: 'pago' as const,
        valor: 50,
        participantes: 2,
        custoOperacional: 30
      },
      {
        id: '2',
        nome: 'Pão de Açúcar',
        categoria: 'pago' as const,
        valor: 40,
        participantes: 1,
        custoOperacional: 25
      }
    ]
  };

  const handleApplyScenario = (scenario: ConfigScenario) => {
    const newConfig = getDefaultConfig(scenario);
    updateConfig(newConfig);
  };

  const handleSaveTemplate = async () => {
    const nome = prompt('Nome do template:');
    if (!nome) return;

    try {
      await saveAsTemplate(nome, `Template criado em ${new Date().toLocaleDateString()}`);
      alert('Template salvo com sucesso!');
    } catch (error) {
      alert(`Erro ao salvar template: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleExport = () => {
    try {
      const exported = exportConfig({ demo: true });
      const blob = new Blob([exported], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personalizacao-${viagemId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Erro ao exportar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header da Demo */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Palette className="w-6 h-6" />
            Sistema de Personalização Completa de Relatórios
          </CardTitle>
          <CardDescription className="text-purple-600">
            Personalize cada aspecto do seu relatório com controle granular sobre colunas, seções, estilo e muito mais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">{stats.colunasVisiveis}</div>
              <div className="text-sm text-purple-600">Colunas Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{stats.secoesVisiveis}</div>
              <div className="text-sm text-blue-600">Seções Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">{stats.larguraTotal}px</div>
              <div className="text-sm text-green-600">Largura Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-700">{stats.orientacao}</div>
              <div className="text-sm text-orange-600">Orientação</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setShowDialog(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Abrir Personalização
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Ocultar' : 'Mostrar'} Preview
            </Button>
            
            <Button
              variant="outline"
              onClick={handleSaveTemplate}
              disabled={!canApply()}
            >
              <FileText className="w-4 h-4 mr-2" />
              Salvar Template
            </Button>
            
            <Button
              variant="outline"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>

            {hasChanges && (
              <Badge variant="secondary" className="ml-2">
                Alterações não salvas
              </Badge>
            )}

            {validation && !validation.valido && (
              <Badge variant="destructive" className="ml-2">
                {validation.errors.length} erro(s)
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cenários Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Cenários Rápidos
          </CardTitle>
          <CardDescription>
            Aplique configurações predefinidas para diferentes casos de uso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApplyScenario(ConfigScenario.COMPLETO)}
              className="h-auto p-3 flex flex-col items-center gap-2"
            >
              <span className="text-lg">📊</span>
              <span className="text-xs text-center">Completo</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApplyScenario(ConfigScenario.RESPONSAVEL)}
              className="h-auto p-3 flex flex-col items-center gap-2"
            >
              <span className="text-lg">📋</span>
              <span className="text-xs text-center">Responsável</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApplyScenario(ConfigScenario.PASSAGEIROS)}
              className="h-auto p-3 flex flex-col items-center gap-2"
            >
              <span className="text-lg">👥</span>
              <span className="text-xs text-center">Passageiros</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApplyScenario(ConfigScenario.EMPRESA_ONIBUS)}
              className="h-auto p-3 flex flex-col items-center gap-2"
            >
              <span className="text-lg">🚌</span>
              <span className="text-xs text-center">Empresa</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApplyScenario(ConfigScenario.COMPRAR_INGRESSOS)}
              className="h-auto p-3 flex flex-col items-center gap-2"
            >
              <span className="text-lg">🎫</span>
              <span className="text-xs text-center">Ingressos</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApplyScenario(ConfigScenario.COMPRAR_PASSEIOS)}
              className="h-auto p-3 flex flex-col items-center gap-2"
            >
              <span className="text-lg">🎠</span>
              <span className="text-xs text-center">Passeios</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApplyScenario(ConfigScenario.TRANSFER)}
              className="h-auto p-3 flex flex-col items-center gap-2"
            >
              <span className="text-lg">🚐</span>
              <span className="text-xs text-center">Transfer</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview do Relatório */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Preview do Relatório Personalizado
            </CardTitle>
            <CardDescription>
              Visualização em tempo real com as configurações atuais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-white max-h-96 overflow-auto">
              <PersonalizedReport
                config={config}
                data={mockData}
                className="scale-75 origin-top-left"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Personalização */}
      <PersonalizacaoDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        viagemId={viagemId}
        configuracaoInicial={config}
        onAplicar={(newConfig: PersonalizationConfig) => {
          updateConfig(newConfig);
          setShowDialog(false);
        }}
      />
    </div>
  );
}