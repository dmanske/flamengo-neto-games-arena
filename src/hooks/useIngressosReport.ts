import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

export function useIngressosReport() {
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
          margin: 0;
          padding: 0;
          background: white !important;
        }
        
        .print-report {
          background: white !important;
          margin: 0 !important;
          padding: 20px !important;
          font-size: 12px;
          width: 100%;
          max-width: none;
        }
        
        /* Otimizar fundos para impressão */
        .print-report .bg-red-50 {
          background-color: #fef2f2 !important;
          border: 1px solid #fecaca !important;
        }
        
        .print-report .bg-gray-100 {
          background-color: #f3f4f6 !important;
        }
        
        .print-report .bg-blue-600 {
          background-color: #2563eb !important;
        }
        
        .print-report .bg-red-600 {
          background-color: #dc2626 !important;
        }
        
        .print-report .bg-white {
          background-color: white !important;
        }
        
        /* Remover hover effects na impressão */
        .print-report .hover\\:bg-gray-50 {
          background-color: transparent !important;
        }
        
        .print-report table {
          page-break-inside: auto;
        }
        
        .print-report tr {
          page-break-inside: avoid;
        }
        
        .print-report thead {
          display: table-header-group;
        }
        
        .print-report h3, .print-report h4 {
          page-break-after: avoid;
        }
        
        /* Garantir que não há elementos extras após o rodapé */
        .print-report > *:last-child {
          margin-bottom: 0 !important;
          padding-bottom: 0 !important;
        }
        
        /* Remover sombras na impressão */
        .print-report .shadow-md,
        .print-report .shadow-sm {
          box-shadow: none !important;
        }
      }
    `
  });

  const handleExportPDF = () => {
    // Usar a funcionalidade nativa do navegador para "imprimir como PDF"
    toast.info('💡 Na janela que abrir, selecione "Salvar como PDF" como destino para exportar o arquivo');
    handlePrint();
  };

  return {
    reportRef,
    handleExportPDF
  };
}