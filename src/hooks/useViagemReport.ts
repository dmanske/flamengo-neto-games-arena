
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

export function useViagemReport() {
  const reportRef = useRef<HTMLDivElement>(null);

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
    toast.info('Use a opção "Salvar como PDF" na janela de impressão para exportar');
    handlePrint();
  };

  return {
    reportRef,
    handlePrint,
    handleExportPDF
  };
}
