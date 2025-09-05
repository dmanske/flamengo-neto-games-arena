import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

export function useIngressosViagemReport() {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `Lista_Clientes_Ingressos_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}`,
    onAfterPrint: () => {
      toast.success('Lista de clientes enviada para impressão!');
    },
    onPrintError: () => {
      toast.error('Erro ao imprimir lista de clientes');
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
          print-color-adjust: exact;
        }
        
        .print-report {
          background: white !important;
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .print-report * {
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
          print-color-adjust: exact;
        }
        
        /* Remove hover effects */
        .hover\\:bg-gray-50:hover {
          background-color: transparent !important;
        }
        
        /* Remove shadows */
        .shadow-sm,
        .shadow-md {
          box-shadow: none !important;
        }
        
        /* Ensure table breaks properly */
        table {
          page-break-inside: auto;
        }
        
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        
        thead {
          display: table-header-group;
        }
        
        tfoot {
          display: table-footer-group;
        }
        
        /* Avoid breaking headers */
        h1, h2, h3, h4, h5, h6 {
          page-break-after: avoid;
        }
        
        /* Logo container adjustments */
        .logo-container {
          page-break-inside: avoid;
        }
      }
    `,
  });

  const handleExportPDF = () => {
    // Usar a funcionalidade nativa do navegador para "imprimir como PDF"
    toast.info('💡 Na janela que abrir, selecione "Salvar como PDF" como destino para exportar o arquivo');
    handlePrint();
  };

  return {
    reportRef,
    handlePrint,
    handleExportPDF,
  };
};