
import { useRef, useState, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { ReportFilters, ReportPreviewData, defaultReportFilters } from '@/types/report-filters';
import { PassageiroDisplay } from '@/hooks/useViagemDetails';
import { converterStatusParaInteligente } from '@/lib/status-utils';

export function useViagemReport() {
  const reportRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<ReportFilters>(defaultReportFilters);

  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `Relatorio_Viagem_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}`,
    onAfterPrint: () => {
      toast.success('Relatório enviado para impressão!');
    },
    onPrintError: () => {
      toast.error('Erro ao imprimir relatório');
    },
    pageStyle: `
      @page {
        size: A4;
        margin: 1cm;
      }
      
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
        
        .print-report {
          margin: 0;
          padding: 0;
          box-shadow: none;
        }
        
        .print-report table {
          page-break-inside: auto;
        }
        
        .print-report tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        
        .print-report thead {
          display: table-header-group;
        }
      }
    `
  });

  const handleExportPDF = () => {
    // Usar a funcionalidade nativa do navegador para "imprimir como PDF"
    toast.info('💡 Na janela que abrir, selecione "Salvar como PDF" como destino para exportar o arquivo');
    handlePrint();
  };

  // Função para filtrar passageiros baseado nos filtros aplicados
  const filterPassageiros = (passageiros: PassageiroDisplay[], filters: ReportFilters): PassageiroDisplay[] => {
    return passageiros.filter(passageiro => {
      // Filtro por status de pagamento
      if (filters.statusPagamento !== 'todos') {
        const statusInteligente = converterStatusParaInteligente({
          valor: passageiro.valor || 0,
          desconto: passageiro.desconto || 0,
          parcelas: passageiro.parcelas,
          status_pagamento: passageiro.status_pagamento
        });

        const statusMap = {
          'pago': 'Pago',
          'pendente': 'Pendente',
          'parcial': 'Parcial'
        };

        if (statusInteligente.status !== statusMap[filters.statusPagamento]) {
          return false;
        }
      }

      // Filtro por setor do Maracanã
      if (filters.setorMaracana.length > 0) {
        if (!passageiro.setor_maracana || !filters.setorMaracana.includes(passageiro.setor_maracana)) {
          return false;
        }
      }

      // Filtro por ônibus
      if (filters.onibusIds.length > 0) {
        if (!passageiro.onibus_id || !filters.onibusIds.includes(passageiro.onibus_id)) {
          return false;
        }
      }

      // Filtro por passeios específicos (para viagens novas)
      if (filters.passeiosSelecionados.length > 0) {
        // Verificar se o passageiro tem algum dos passeios selecionados
        const passageiroPasseios = passageiro.passeios || [];
        const temPasseioSelecionado = passageiroPasseios.some(pp => 
          filters.passeiosSelecionados.includes(pp.passeio_id)
        );
        if (!temPasseioSelecionado) {
          return false;
        }
      }

      // Filtro por tipo de passeios (pagos/gratuitos)
      if (filters.tipoPasseios !== 'todos') {
        const passageiroPasseios = passageiro.passeios || [];
        if (passageiroPasseios.length > 0) {
          const temPasseioDoTipo = passageiroPasseios.some(pp => {
            const passeio = pp.passeio;
            if (!passeio) return false;
            
            if (filters.tipoPasseios === 'pagos') {
              return passeio.valor > 0;
            } else if (filters.tipoPasseios === 'gratuitos') {
              return passeio.valor === 0;
            }
            return true;
          });
          
          if (!temPasseioDoTipo) {
            return false;
          }
        } else {
          // Se não tem passeios e está filtrando por tipo específico, excluir
          if (filters.tipoPasseios !== 'todos') {
            return false;
          }
        }
      }

      // Filtro por valor mínimo (não aplicar no modo responsável)
      if (!filters.modoResponsavel && filters.valorMinimo !== undefined) {
        const valorTotal = (passageiro.valor || 0) - (passageiro.desconto || 0);
        if (valorTotal < filters.valorMinimo) {
          return false;
        }
      }

      // Filtro por valor máximo (não aplicar no modo responsável)
      if (!filters.modoResponsavel && filters.valorMaximo !== undefined) {
        const valorTotal = (passageiro.valor || 0) - (passageiro.desconto || 0);
        if (valorTotal > filters.valorMaximo) {
          return false;
        }
      }

      // Filtro apenas com desconto (não aplicar no modo responsável)
      if (!filters.modoResponsavel && filters.apenasComDesconto) {
        if (!passageiro.desconto || passageiro.desconto <= 0) {
          return false;
        }
      }

      return true;
    });
  };

  // Função para calcular dados de preview
  const calculatePreviewData = (
    passageiros: PassageiroDisplay[], 
    filters: ReportFilters
  ): ReportPreviewData => {
    const passageirosFiltrados = filterPassageiros(passageiros, filters);
    
    const totalArrecadado = passageirosFiltrados.reduce((total, p) => {
      return total + ((p.valor || 0) - (p.desconto || 0));
    }, 0);

    const secoesSelecionadas: string[] = [];
    if (filters.incluirResumoFinanceiro) secoesSelecionadas.push('Resumo Financeiro');
    if (filters.incluirDistribuicaoSetor) secoesSelecionadas.push('Distribuição por Setor');
    if (filters.incluirListaOnibus) secoesSelecionadas.push('Lista de Ônibus');
    if (filters.incluirPassageirosNaoAlocados) secoesSelecionadas.push('Não Alocados');

    return {
      totalPassageiros: passageiros.length,
      totalArrecadado,
      passageirosFiltrados: passageirosFiltrados.length,
      secoesSelecionadas
    };
  };

  return {
    reportRef,
    handlePrint,
    handleExportPDF,
    filters,
    setFilters,
    filterPassageiros,
    calculatePreviewData
  };
}
