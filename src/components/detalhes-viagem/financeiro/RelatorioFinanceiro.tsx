// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { converterStatusParaInteligente } from '@/lib/status-utils';
import { formatPhone } from '@/utils/formatters';
import { 
  Download, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  Users,
  Receipt,
  Calendar,
  DollarSign,
  MapPin,
  Bus
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ViagemDespesa, ViagemPassageiro, ResumoFinanceiro } from '@/hooks/financeiro/useViagemFinanceiro';
import { useListaPresenca } from '@/hooks/useListaPresenca';

interface RelatorioFinanceiroProps {
  viagemId: string;
  resumo: ResumoFinanceiro;
  despesas: ViagemDespesa[];
  passageiros: ViagemPassageiro[];
  adversario: string;
  dataJogo: string;
  // Novos props para sistema de passeios
  sistema?: 'novo' | 'antigo' | 'sem_dados';
  valorPasseios?: number;
  temPasseios?: boolean;
  // Todos os passageiros (não só pendentes)
  todosPassageiros?: any[];
  // Capacidade total dos ônibus
  capacidadeTotal?: number;
}

export function RelatorioFinanceiro({ 
  viagemId, 
  resumo, 
  despesas, 
  passageiros, 
  adversario, 
  dataJogo,
  sistema = 'sem_dados',
  valorPasseios = 0,
  temPasseios = false,
  todosPassageiros = [],
  capacidadeTotal = 50
}: RelatorioFinanceiroProps) {
  
  const [filtroStatus, setFiltroStatus] = useState('todos');
  
  // ✨ NOVO: Hook para dados de presença
  const { dadosPresenca, loading: loadingPresenca } = useListaPresenca(viagemId);
  
  const gerarRelatorioPDF = () => {
    // Implementar geração de PDF
    const printContent = document.getElementById('relatorio-financeiro');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Relatório Financeiro - ${adversario}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .card { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 8px; }
                .grid { display: grid; gap: 15px; }
                .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
                .text-center { text-align: center; }
                .font-bold { font-weight: bold; }
                .text-green-600 { color: #059669; }
                .text-red-600 { color: #dc2626; }
                .text-blue-600 { color: #2563eb; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const gerarRelatorioExcel = () => {
    // Implementar geração de Excel (CSV)
    const csvData = [
      ['Relatório Financeiro', adversario],
      ['Data do Jogo', new Date(dataJogo).toLocaleDateString()],
      [''],
      ['Resumo Financeiro'],
      ['Receita Total', resumo.total_receitas || 0],
      ['Despesas Totais', resumo.total_despesas || 0],
      ['Lucro Líquido', resumo.lucro_bruto || 0],
      [''],
      ['Despesas por Categoria'],
      ['Categoria', 'Valor', 'Quantidade'],
      ...Object.entries(despesasPorCategoria).map(([categoria, dados]) => [
        categoria.replace('_', ' '),
        dados.total,
        dados.quantidade
      ]),
      [''],
      ['Passageiros'],
      ['Nome', 'Telefone', 'Valor', 'Status'],
      ...passageiros.map(p => [
        p.nome,
        p.telefone,
        p.valor_total || 0,
        p.status_pagamento
      ])
    ];

    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-financeiro-${adversario}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const despesasPorCategoria = despesas.reduce((acc, despesa) => {
    if (!acc[despesa.categoria]) {
      acc[despesa.categoria] = { total: 0, quantidade: 0 };
    }
    acc[despesa.categoria].total += despesa.valor;
    acc[despesa.categoria].quantidade += 1;
    return acc;
  }, {} as Record<string, { total: number; quantidade: number }>);

  // Usar status que já vem calculado do sistema, com fallback para cálculo local
  const obterStatusCorreto = (passageiro: any) => {
    // Se o passageiro já tem status calculado corretamente, usar ele
    if (passageiro.status_calculado) {
      return passageiro.status_calculado;
    }
    
    // Verificar se é passageiro gratuito
    if (passageiro.gratuito === true) {
      return '🎁 Brinde';
    }

    const valorViagem = (passageiro.valor || 0) - (passageiro.desconto || 0);
    const valorPasseios = (passageiro.passeios || [])
      .reduce((sum: number, p: any) => sum + (p.valor_cobrado || 0), 0);

    // Se valor total é 0, é brinde
    if (valorViagem + valorPasseios === 0) {
      return '🎁 Brinde';
    }

    // Usar status da tabela como fallback se não conseguir calcular
    return passageiro.status_pagamento || 'Pendente';
  };

  const passageirosPorStatus = todosPassageiros.reduce((acc, passageiro) => {
    const status = obterStatusCorreto(passageiro);
    if (!acc[status]) {
      acc[status] = { quantidade: 0, valor: 0 };
    }
    acc[status].quantidade += 1;
    
    // Usar valores que já vêm calculados do hook, com fallback
    const valorReal = passageiro.valor_total || 
                     ((passageiro.valor || 0) - (passageiro.desconto || 0) + 
                      (passageiro.passeios || []).reduce((sum: number, p: any) => sum + (p.valor_cobrado || 0), 0));
    
    acc[status].valor += valorReal;
    return acc;
  }, {} as Record<string, { quantidade: number; valor: number }>);

  return (
    <div id="relatorio-financeiro" className="space-y-6">
      {/* Header do Relatório */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                Relatório Financeiro - {adversario}
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Data do Jogo: {new Date(dataJogo).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={gerarRelatorioPDF} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button onClick={gerarRelatorioExcel} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Resumo Executivo */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
        sistema === 'novo' && temPasseios ? 'lg:grid-cols-5' : 'lg:grid-cols-4'
      }`}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(resumo.total_receitas || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {loadingPresenca ? '...' : dadosPresenca.total_passageiros} passageiros
                </p>
                {sistema === 'novo' && temPasseios && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Viagem:</span>
                      <span>{formatCurrency(resumo.receitas_viagem || 0)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Passeios:</span>
                      <span>{formatCurrency(resumo.receitas_passeios || 0)}</span>
                    </div>
                  </div>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Despesas Totais</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(resumo?.total_despesas || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {despesas.length} lançamentos
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Lucro Líquido</p>
                <p className={`text-2xl font-bold ${
                  (resumo.lucro_bruto || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(resumo.lucro_bruto || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Margem: {resumo.total_receitas > 0 ? ((resumo.lucro_bruto || 0) / resumo.total_receitas * 100).toFixed(1) : 0}%
                </p>
                {sistema === 'novo' && temPasseios && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Margem Viagem:</span>
                      <span>
                        {resumo.receitas_viagem > 0 
                          ? (((resumo.receitas_viagem || 0) - (resumo.total_despesas || 0) * 0.7) / resumo.receitas_viagem * 100).toFixed(1)
                          : 0
                        }%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Margem Passeios:</span>
                      <span>
                        {resumo.receitas_passeios > 0 
                          ? (((resumo.receitas_passeios || 0) - (resumo.total_despesas || 0) * 0.3) / resumo.receitas_passeios * 100).toFixed(1)
                          : 0
                        }%
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Taxa de Ocupação */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Ocupação</p>
                {loadingPresenca ? (
                  <p className="text-2xl font-bold text-gray-400">...</p>
                ) : (
                  (() => {
                    // Usar capacidade calculada dos ônibus, ou fallback para capacidade da viagem (50 padrão)
                    const capacidadeReal = capacidadeTotal > 0 ? capacidadeTotal : 50;
                    const taxaOcupacao = ((dadosPresenca.total_passageiros / capacidadeReal) * 100).toFixed(0);
                    const vagasLivres = capacidadeReal - dadosPresenca.total_passageiros;
                    
                    return (
                      <>
                        <p className="text-2xl font-bold text-blue-600">
                          {taxaOcupacao}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {dadosPresenca.total_passageiros}/{capacidadeReal} lugares
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {vagasLivres} vagas livres
                        </p>
                        {capacidadeTotal === 0 && (
                          <p className="text-xs text-orange-500 mt-1">
                            * Capacidade estimada
                          </p>
                        )}
                      </>
                    );
                  })()
                )}
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* ✨ NOVO: Card de Taxa de Presença */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Taxa de Presença</p>
                {loadingPresenca ? (
                  <p className="text-2xl font-bold text-gray-400">...</p>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-green-600">
                      {dadosPresenca.taxa_presenca.toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {dadosPresenca.presentes}/{dadosPresenca.total_passageiros} embarcaram
                    </p>
                    {dadosPresenca.ausentes > 0 && (
                      <p className="text-xs text-red-500 mt-1">
                        {dadosPresenca.ausentes} faltaram
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Status: {
                        dadosPresenca.status_viagem === 'realizada' ? 'Viagem Realizada' :
                        dadosPresenca.status_viagem === 'em_andamento' ? 'Em Andamento' :
                        'Planejada'
                      }
                    </p>
                  </>
                )}
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ✨ NOVOS CARDS: Status de Pagamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pagamentos Viagem */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Pagamentos Viagem</p>
                <div className="mt-2 space-y-2">
                  {(() => {
                    const passageirosComViagem = todosPassageiros.filter(p => {
                      const valorViagem = (p.valor_viagem || p.valor || 0) - (p.desconto || 0);
                      return valorViagem > 0; // Só contar quem tem valor de viagem
                    });

                    const viagemPaga = passageirosComViagem.filter(p => {
                      const valorViagem = (p.valor_viagem || p.valor || 0) - (p.desconto || 0);
                      const historico = p.historico_pagamentos_categorizado || [];
                      const pagoViagem = historico
                        .filter(h => h.categoria === 'viagem' || h.categoria === 'ambos')
                        .reduce((sum, h) => sum + h.valor_pago, 0);
                      
                      return pagoViagem >= valorViagem - 0.01; // Margem para centavos
                    }).length;

                    const viagemDevendo = passageirosComViagem.length - viagemPaga;
                    
                    const valorDevendo = passageirosComViagem.reduce((total, p) => {
                      const valorViagem = (p.valor_viagem || p.valor || 0) - (p.desconto || 0);
                      const historico = p.historico_pagamentos_categorizado || [];
                      const pagoViagem = historico
                        .filter(h => h.categoria === 'viagem' || h.categoria === 'ambos')
                        .reduce((sum, h) => sum + h.valor_pago, 0);
                      
                      const pendente = Math.max(0, valorViagem - pagoViagem);
                      return total + pendente;
                    }, 0);

                    return (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✅</span>
                          <span className="text-sm">Pagos: <strong>{viagemPaga}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-orange-600">⚠️</span>
                          <span className="text-sm">
                            Devendo: <strong>{viagemDevendo}</strong> ({formatCurrency(valorDevendo)})
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Status dos pagamentos de viagem
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Pagamentos Passeios */}
        {sistema === 'novo' && temPasseios && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Pagamentos Passeios</p>
                  <div className="mt-2 space-y-2">
                    {(() => {
                      const passageirosComPasseios = todosPassageiros.filter(p => {
                        const valorPasseios = (p.passeios || []).reduce((sum, passeio) => sum + (passeio.valor_cobrado || 0), 0);
                        return valorPasseios > 0; // Só contar quem tem passeios
                      });

                      const passeiosPagos = passageirosComPasseios.filter(p => {
                        const valorPasseios = (p.passeios || []).reduce((sum, passeio) => sum + (passeio.valor_cobrado || 0), 0);
                        const historico = p.historico_pagamentos_categorizado || [];
                        const pagoPasseios = historico
                          .filter(h => h.categoria === 'passeios' || h.categoria === 'ambos')
                          .reduce((sum, h) => sum + h.valor_pago, 0);
                        
                        return pagoPasseios >= valorPasseios - 0.01; // Margem para centavos
                      }).length;

                      const passeiosDevendo = passageirosComPasseios.length - passeiosPagos;
                      
                      const valorDevendo = passageirosComPasseios.reduce((total, p) => {
                        const valorPasseios = (p.passeios || []).reduce((sum, passeio) => sum + (passeio.valor_cobrado || 0), 0);
                        const historico = p.historico_pagamentos_categorizado || [];
                        const pagoPasseios = historico
                          .filter(h => h.categoria === 'passeios' || h.categoria === 'ambos')
                          .reduce((sum, h) => sum + h.valor_pago, 0);
                        
                        const pendente = Math.max(0, valorPasseios - pagoPasseios);
                        return total + pendente;
                      }, 0);

                      return (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">✅</span>
                            <span className="text-sm">Pagos: <strong>{passeiosPagos}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-orange-600">⚠️</span>
                            <span className="text-sm">
                              Devendo: <strong>{passeiosDevendo}</strong> ({formatCurrency(valorDevendo)})
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Status dos pagamentos de passeios
                  </p>
                </div>
                <Receipt className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ✨ NOVOS CARDS: Resumos Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Resumo por Cidade */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Resumo por Cidade</p>
                <div className="mt-2 space-y-2">
                  {loadingPresenca ? (
                    <p className="text-xs text-gray-400">Carregando...</p>
                  ) : (
                    (() => {
                      const passageirosDetalhados = dadosPresenca.passageiros_detalhados || [];
                      const cidadeStats = passageirosDetalhados.reduce((acc, p) => {
                        const cidade = p.cidade_embarque || 'Não especificada';
                        if (!acc[cidade]) {
                          acc[cidade] = { total: 0, presentes: 0 };
                        }
                        acc[cidade].total += 1;
                        if (p.presente === true) {
                          acc[cidade].presentes += 1;
                        }
                        return acc;
                      }, {} as Record<string, { total: number; presentes: number }>);

                      const cidadesOrdenadas = Object.entries(cidadeStats)
                        .sort(([,a], [,b]) => b.total - a.total)
                        .slice(0, 3);

                      return cidadesOrdenadas.map(([cidade, stats]) => (
                        <div key={cidade} className="flex justify-between text-xs">
                          <span className="truncate max-w-[100px]" title={cidade}>
                            {cidade}
                          </span>
                          <span className="font-medium">
                            {stats.total} ({stats.presentes} ✓)
                          </span>
                        </div>
                      ));
                    })()
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {loadingPresenca ? '-' : [...new Set((dadosPresenca.passageiros_detalhados || []).map(p => p.cidade_embarque))].length} cidades
                </p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Resumo por Setor */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Resumo por Setor</p>
                <div className="mt-2 space-y-2">
                  {loadingPresenca ? (
                    <p className="text-xs text-gray-400">Carregando...</p>
                  ) : (
                    (() => {
                      const passageirosDetalhados = dadosPresenca.passageiros_detalhados || [];
                      const setorStats = passageirosDetalhados.reduce((acc, p) => {
                        const setor = p.setor_maracana || 'Não especificado';
                        if (!acc[setor]) {
                          acc[setor] = { total: 0, presentes: 0 };
                        }
                        acc[setor].total += 1;
                        if (p.presente === true) {
                          acc[setor].presentes += 1;
                        }
                        return acc;
                      }, {} as Record<string, { total: number; presentes: number }>);

                      const setoresOrdenados = Object.entries(setorStats)
                        .sort(([,a], [,b]) => b.total - a.total)
                        .slice(0, 3);

                      return setoresOrdenados.map(([setor, stats]) => (
                        <div key={setor} className="flex justify-between text-xs">
                          <span className="truncate max-w-[100px]" title={setor}>
                            {setor}
                          </span>
                          <span className="font-medium">
                            {stats.total} ({stats.presentes} ✓)
                          </span>
                        </div>
                      ));
                    })()
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {loadingPresenca ? '-' : [...new Set((dadosPresenca.passageiros_detalhados || []).map(p => p.setor_maracana))].length} setores
                </p>
              </div>
              <Receipt className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        {/* Ônibus da Viagem */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Ônibus da Viagem</p>
                <div className="mt-2 space-y-2">
                  {loadingPresenca ? (
                    <p className="text-xs text-gray-400">Carregando...</p>
                  ) : (
                    (() => {
                      const passageirosDetalhados = dadosPresenca.passageiros_detalhados || [];
                      const onibusStats = passageirosDetalhados.reduce((acc, p) => {
                        const onibusId = p.onibus_id || 'sem_onibus';
                        if (!acc[onibusId]) {
                          acc[onibusId] = { 
                            total: 0, 
                            presentes: 0,
                            numero: p.onibus_numero || 'S/N',
                            empresa: p.onibus_empresa || 'N/A'
                          };
                        }
                        acc[onibusId].total += 1;
                        if (p.presente === true) {
                          acc[onibusId].presentes += 1;
                        }
                        return acc;
                      }, {} as Record<string, { total: number; presentes: number; numero: string; empresa: string }>);

                      const onibusOrdenados = Object.entries(onibusStats)
                        .sort(([,a], [,b]) => b.total - a.total)
                        .slice(0, 3);

                      return onibusOrdenados.map(([onibusId, stats]) => (
                        <div key={onibusId} className="flex justify-between text-xs">
                          <span className="truncate max-w-[100px]" title={`${stats.empresa} - ${stats.numero}`}>
                            Ônibus {stats.numero}
                          </span>
                          <span className="font-medium">
                            {stats.total} ({stats.presentes} ✓)
                          </span>
                        </div>
                      ));
                    })()
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {loadingPresenca ? '-' : [...new Set((dadosPresenca.passageiros_detalhados || []).map(p => p.onibus_id).filter(Boolean))].length} ônibus
                </p>
              </div>
              <Bus className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        {/* Responsáveis por Ônibus */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Responsáveis</p>
                <div className="mt-2 space-y-2">
                  {loadingPresenca ? (
                    <p className="text-xs text-gray-400">Carregando...</p>
                  ) : (
                    (() => {
                      const passageirosDetalhados = dadosPresenca.passageiros_detalhados || [];
                      const responsaveis = passageirosDetalhados.filter(p => p.is_responsavel_onibus);
                      
                      if (responsaveis.length === 0) {
                        return (
                          <p className="text-xs text-gray-400">
                            Nenhum responsável definido
                          </p>
                        );
                      }

                      return responsaveis.slice(0, 3).map((responsavel) => (
                        <div key={responsavel.id} className="flex justify-between text-xs">
                          <span className="truncate max-w-[100px]" title={responsavel.nome}>
                            {responsavel.nome.split(' ')[0]}
                          </span>
                          <span className={`font-medium ${
                            responsavel.presente === true ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {responsavel.presente === true ? '✓ Presente' : '⏳ Pendente'}
                          </span>
                        </div>
                      ));
                    })()
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {loadingPresenca ? '-' : (dadosPresenca.passageiros_detalhados || []).filter(p => p.is_responsavel_onibus).length} responsáveis
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* ✅ NOVO: Passeios da Viagem */}
        {sistema === 'novo' && temPasseios && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Passeios da Viagem</p>
                  <div className="mt-2 space-y-2">
                    {(() => {
                      // Obter lista de passeios únicos dos passageiros
                      const passeiosUnicos = [...new Set(
                        todosPassageiros
                          .flatMap(p => p.passeios || [])
                          .map(passeio => passeio.passeio_nome)
                      )];

                      if (passeiosUnicos.length === 0) {
                        return (
                          <p className="text-sm text-gray-400">
                            Nenhum passeio cadastrado
                          </p>
                        );
                      }

                      return passeiosUnicos.slice(0, 3).map((passeioNome) => {
                        const vendas = todosPassageiros
                          .flatMap(p => p.passeios || [])
                          .filter(passeio => passeio.passeio_nome === passeioNome);
                        
                        const totalVendas = vendas.length;
                        const receitaTotal = vendas.reduce((sum, p) => sum + (p.valor_cobrado || 0), 0);

                        return (
                          <div key={passeioNome} className="flex justify-between text-xs">
                            <span className="truncate max-w-[120px]" title={passeioNome}>
                              {passeioNome}
                            </span>
                            <span className="font-medium">
                              {totalVendas} vendas - {formatCurrency(receitaTotal)}
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {[...new Set(todosPassageiros.flatMap(p => p.passeios || []).map(p => p.passeio_nome))].length} passeios
                  </p>
                </div>
                <Receipt className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        )}


      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Despesas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(despesasPorCategoria).map(([categoria, dados]) => (
                <div key={categoria} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium capitalize">{categoria.replace('_', ' ')}</p>
                    <p className="text-sm text-gray-600">{dados.quantidade} lançamentos</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      {formatCurrency(dados.total)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {resumo?.total_despesas > 0 ? ((dados.total / resumo.total_despesas) * 100).toFixed(1) : '0'}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>



        {/* ✨ MELHORADO: Análise Completa de Passeios */}
        {sistema === 'novo' && temPasseios && (
          <Card>
            <CardHeader>
              <CardTitle>Análise Completa de Passeios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800">Receita Total</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(resumo.receitas_passeios || 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-800">Despesa Total</h4>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(resumo.custos_passeios || 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800">Lucro Total</h4>
                    <p className={`text-2xl font-bold ${
                      (resumo.lucro_passeios || 0) >= 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(resumo.lucro_passeios || 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-medium text-purple-800">Margem</h4>
                    <p className={`text-2xl font-bold ${
                      (resumo.margem_passeios || 0) >= 20 ? 'text-purple-600' : 'text-orange-600'
                    }`}>
                      {(resumo.margem_passeios || 0).toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium text-gray-700 mb-3">Comparativo Viagem vs Passeios:</h4>
                  <div className="space-y-3">
                    {/* Receitas */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Receitas:</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Receita Viagem</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ 
                                  width: `${Math.min(100, ((resumo.receitas_viagem || 0) / Math.max(resumo.receitas_viagem || 1, resumo.receitas_passeios || 1)) * 100)}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{formatCurrency(resumo.receitas_viagem || 0)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Receita Passeios</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ 
                                  width: `${Math.min(100, ((resumo.receitas_passeios || 0) / Math.max(resumo.receitas_viagem || 1, resumo.receitas_passeios || 1)) * 100)}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{formatCurrency(resumo.receitas_passeios || 0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lucros */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Lucros:</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Lucro Viagem</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ 
                                  width: `${Math.min(100, Math.max(0, ((resumo.lucro_viagem || 0) / Math.max(Math.abs(resumo.lucro_viagem || 1), Math.abs(resumo.lucro_passeios || 1))) * 100))}%` 
                                }}
                              ></div>
                            </div>
                            <span className={`text-sm font-medium ${(resumo.lucro_viagem || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                              {formatCurrency(resumo.lucro_viagem || 0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Lucro Passeios</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ 
                                  width: `${Math.min(100, Math.max(0, ((resumo.lucro_passeios || 0) / Math.max(Math.abs(resumo.lucro_viagem || 1), Math.abs(resumo.lucro_passeios || 1))) * 100))}%` 
                                }}
                              ></div>
                            </div>
                            <span className={`text-sm font-medium ${(resumo.lucro_passeios || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(resumo.lucro_passeios || 0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t pt-2">
                          <span className="text-sm font-medium">Lucro Total</span>
                          <span className={`text-sm font-bold ${((resumo.lucro_viagem || 0) + (resumo.lucro_passeios || 0)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency((resumo.lucro_viagem || 0) + (resumo.lucro_passeios || 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>



      {/* Detalhamento de Despesas */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Data</th>
                  <th className="text-left p-2">Fornecedor</th>
                  <th className="text-left p-2">Categoria</th>
                  <th className="text-left p-2">Forma Pagamento</th>
                  <th className="text-right p-2">Valor</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {despesas.map((despesa) => (
                  <tr key={despesa.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      {new Date(despesa.data_despesa).toLocaleDateString()}
                    </td>
                    <td className="p-2 font-medium">{despesa.fornecedor}</td>
                    <td className="p-2 capitalize">
                      {despesa.categoria.replace('_', ' ')}
                      {despesa.subcategoria && (
                        <span className="text-gray-500 text-xs block">
                          {despesa.subcategoria.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="p-2">{despesa.forma_pagamento}</td>
                    <td className="p-2 text-right font-bold text-red-600">
                      {formatCurrency(despesa.valor)}
                    </td>
                    <td className="p-2 text-center">
                      <Badge 
                        className={
                          despesa.status === 'pago' 
                            ? 'bg-green-100 text-green-800' 
                            : despesa.status === 'pendente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {despesa.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detalhamento de Passageiros */}
      {(() => {
        // Preparar lista de passageiros com filtro e ordenação
        const passageirosParaExibir = (todosPassageiros.length > 0 ? todosPassageiros : passageiros)
          .filter(passageiro => {
            if (filtroStatus === 'todos') return true;
            const statusObtido = obterStatusCorreto(passageiro);
            return statusObtido === filtroStatus;
          })
          .sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));

        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detalhamento de Passageiros ({passageirosParaExibir.length})</CardTitle>
            <div className="flex gap-2">
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="🎁 Brinde">Brinde</SelectItem>
                  <SelectItem value="Pago Completo">Pago Completo</SelectItem>
                  <SelectItem value="Viagem Paga">Viagem Paga</SelectItem>
                  <SelectItem value="Passeios Pagos">Passeios Pagos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Nome</th>
                  <th className="text-left p-2">Telefone</th>
                  <th className="text-left p-2">Setor</th>
                  <th className="text-left p-2">Passeios</th>
                  <th className="text-right p-2">Valor</th>
                  <th className="text-right p-2">Desconto</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {passageirosParaExibir.map((passageiro) => (
                  <tr key={passageiro.viagem_passageiro_id || passageiro.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{passageiro.nome}</td>
                    <td className="p-2">{formatPhone(passageiro.telefone)}</td>
                    <td className="p-2">{passageiro.setor_maracana || '-'}</td>
                    <td className="p-2">
                      {sistema === 'novo' && passageiro.passeios && passageiro.passeios.length > 0 ? (
                        <div className="text-xs">
                          {passageiro.passeios.map((passeio: any, index: number) => (
                            <span key={index} className="inline-block mr-1 mb-1 px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              {passeio.passeio_nome}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-2 text-right font-bold">
                      {(() => {
                        const valorViagem = (passageiro.valor || 0) - (passageiro.desconto || 0);
                        const valorPasseios = (passageiro.passeios || [])
                          .reduce((sum: number, p: any) => sum + (p.valor_cobrado || 0), 0);
                        const valorTotal = valorViagem + valorPasseios;
                        return formatCurrency(valorTotal);
                      })()}
                      {sistema === 'novo' && (
                        <div className="text-xs text-gray-500 mt-1">
                          V: {formatCurrency((passageiro.valor || 0) - (passageiro.desconto || 0))} | P: {formatCurrency((passageiro.passeios || []).reduce((sum: number, p: any) => sum + (p.valor_cobrado || 0), 0))}
                        </div>
                      )}
                    </td>
                    <td className="p-2 text-right text-red-600">
                      {(passageiro.desconto || 0) > 0 ? `-${formatCurrency(passageiro.desconto)}` : '-'}
                    </td>
                    <td className="p-2 text-center">
                      {(() => {
                        const statusObtido = obterStatusCorreto(passageiro);
                        return (
                          <Badge 
                            className={
                              statusObtido === 'Pago Completo' || statusObtido === '🎁 Brinde'
                                ? 'bg-green-100 text-green-800' 
                                : statusObtido === 'Pendente'
                                ? 'bg-yellow-100 text-yellow-800'
                                : statusObtido === 'Viagem Paga' || statusObtido === 'Passeios Pagos'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {statusObtido}
                          </Badge>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
        );
      })()}

      {/* Rodapé do Relatório */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <div className="text-center text-sm text-gray-600">
            <p>Relatório gerado em {new Date().toLocaleString()}</p>
            <p className="mt-1">Sistema de Gestão de Viagens - Flamengo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}