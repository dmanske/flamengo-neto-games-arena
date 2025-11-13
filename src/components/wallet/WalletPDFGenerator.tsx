import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWalletTransacoes } from '@/hooks/useWallet';
import { formatCurrency, formatPhone } from '@/utils/formatters';
import { Loader2, FileText, Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface WalletPDFGeneratorProps {
  clienteId: string;
  clienteNome: string;
  clienteTelefone?: string;
  clienteEmail?: string;
  saldoAtual: number;
  totalDepositado: number;
  totalUsado: number;
  isOpen: boolean;
  onClose: () => void;
}

export const WalletPDFGenerator: React.FC<WalletPDFGeneratorProps> = ({
  clienteId,
  clienteNome,
  clienteTelefone,
  clienteEmail,
  saldoAtual,
  totalDepositado,
  totalUsado,
  isOpen,
  onClose,
}) => {
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar transações do período
  const { data: transacoes, isLoading: loadingTransacoes } = useWalletTransacoes(
    clienteId,
    {
      data_inicio: dataInicio || undefined,
      data_fim: dataFim || undefined,
    },
    1000 // Limite alto para pegar todas
  );

  // Definir período padrão (últimos 3 meses)
  useEffect(() => {
    if (isOpen) {
      const hoje = new Date();
      const tresMesesAtras = new Date();
      tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
      
      setDataFim(format(hoje, 'yyyy-MM-dd'));
      setDataInicio(format(tresMesesAtras, 'yyyy-MM-dd'));
      setError(null);
    }
  }, [isOpen]);

  const handleClose = () => {
    setError(null);
    setIsGenerating(false);
    onClose();
  };

  const gerarPDF = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // Criar documento PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 15;

      // Logo (texto estilizado - você pode substituir por imagem depois)
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38); // Vermelho
      doc.text('NETO TOURS', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 8;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Viagens e Turismo', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 12;
      
      // Cabeçalho
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Extrato de Carteira Digital', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Sistema de Créditos Pré-pagos', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 12;
      doc.setTextColor(0, 0, 0);

      // Dados do Cliente
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Dados do Cliente', 14, yPos);
      
      yPos += 7;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nome: ${clienteNome}`, 14, yPos);
      
      if (clienteTelefone) {
        yPos += 5;
        doc.text(`Telefone: ${formatPhone(clienteTelefone)}`, 14, yPos);
      }
      
      if (clienteEmail) {
        yPos += 5;
        doc.text(`Email: ${clienteEmail}`, 14, yPos);
      }
      
      yPos += 10;

      // Período
      doc.setFont('helvetica', 'bold');
      doc.text('Período do Extrato', 14, yPos);
      
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      const periodoTexto = dataInicio && dataFim
        ? `${format(new Date(dataInicio), 'dd/MM/yyyy')} a ${format(new Date(dataFim), 'dd/MM/yyyy')}`
        : 'Todo o período';
      doc.text(`Período: ${periodoTexto}`, 14, yPos);
      
      yPos += 10;

      // Resumo Financeiro
      doc.setFont('helvetica', 'bold');
      doc.text('Resumo Financeiro', 14, yPos);
      
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.text(`Saldo Atual: ${formatCurrency(saldoAtual)}`, 14, yPos);
      
      yPos += 5;
      doc.text(`Total Depositado: ${formatCurrency(totalDepositado)}`, 14, yPos);
      
      yPos += 5;
      doc.text(`Total Usado: ${formatCurrency(totalUsado)}`, 14, yPos);
      
      yPos += 10;

      // Histórico de Transações
      if (transacoes && transacoes.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('Histórico de Transações', 14, yPos);
        
        yPos += 5;

        // Preparar dados para tabela
        const tableData = transacoes.map(t => {
          const tipoLabel = t.tipo === 'deposito' ? 'Depósito' : 
                           t.tipo === 'uso' ? 'Uso' : 'Ajuste';
          const tipoIcon = t.tipo === 'deposito' ? '+' : 
                          t.tipo === 'uso' ? '-' : '~';
          
          let status = '';
          if (t.cancelada) {
            status = 'CANCELADA';
          } else if (t.editado_em) {
            status = 'Editada';
          }
          
          return [
            format(new Date(t.created_at), 'dd/MM/yyyy'),
            tipoLabel,
            `${tipoIcon} ${formatCurrency(t.valor)}`,
            t.descricao || '-',
            status
          ];
        });

        // Criar tabela
        autoTable(doc, {
          startY: yPos,
          head: [['Data', 'Tipo', 'Valor', 'Descrição', 'Status']],
          body: tableData,
          theme: 'striped',
          headStyles: {
            fillColor: [59, 130, 246], // blue-600
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9
          },
          bodyStyles: {
            fontSize: 8
          },
          columnStyles: {
            0: { cellWidth: 25 }, // Data
            1: { cellWidth: 25 }, // Tipo
            2: { cellWidth: 30 }, // Valor
            3: { cellWidth: 70 }, // Descrição
            4: { cellWidth: 25 }, // Status
          },
          margin: { left: 14, right: 14 },
          didParseCell: (data: any) => {
            // Destacar transações canceladas
            if (data.section === 'body' && data.column.index === 4) {
              if (data.cell.raw === 'CANCELADA') {
                data.cell.styles.textColor = [220, 38, 38]; // red-600
                data.cell.styles.fontStyle = 'bold';
              } else if (data.cell.raw === 'Editada') {
                data.cell.styles.textColor = [234, 179, 8]; // yellow-600
              }
            }
          }
        });

        // Atualizar yPos após tabela
        const finalY = (doc as any).lastAutoTable?.finalY || yPos;
        yPos = finalY + 10;
      } else {
        doc.setFont('helvetica', 'italic');
        doc.text('Nenhuma transação encontrada no período selecionado.', 14, yPos);
        yPos += 10;
      }

      // Rodapé
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')} - Página ${i} de ${totalPages}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Salvar PDF
      const nomeArquivo = `extrato-${clienteNome.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(nomeArquivo);

      setIsGenerating(false);
      handleClose();
    } catch (err: any) {
      console.error('Erro ao gerar PDF:', err);
      setError('Erro ao gerar PDF. Tente novamente.');
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    gerarPDF();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            <FileText className="h-5 w-5" />
            Gerar Extrato em PDF
          </DialogTitle>
          <DialogDescription>
            Selecione o período para gerar o extrato da carteira de <strong>{clienteNome}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações do Cliente */}
          <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Cliente:</span>
              <span className="font-medium">{clienteNome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Saldo Atual:</span>
              <span className="font-medium">{formatCurrency(saldoAtual)}</span>
            </div>
          </div>

          {/* Seleção de Período */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">
                <Calendar className="h-3 w-3 inline mr-1" />
                Data Início
              </Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataFim">
                <Calendar className="h-3 w-3 inline mr-1" />
                Data Fim
              </Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          </div>

          {/* Preview de Transações */}
          {loadingTransacoes ? (
            <div className="text-center py-4 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
              Carregando transações...
            </div>
          ) : (
            <Alert className="border-blue-200 bg-blue-50">
              <FileText className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                <div className="font-medium mb-1">Preview do Extrato:</div>
                <div className="space-y-1">
                  <div>
                    {transacoes && transacoes.length > 0 ? (
                      <>
                        <strong>{transacoes.length}</strong> transação(ões) encontrada(s)
                      </>
                    ) : (
                      'Nenhuma transação no período selecionado'
                    )}
                  </div>
                  <div className="text-xs">
                    O PDF incluirá: dados do cliente, resumo financeiro e histórico completo.
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Erro */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isGenerating || loadingTransacoes}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Gerar e Baixar PDF
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
