import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ReportFiltersComponent } from './ReportFilters';
import { ReportFilters, ReportPreviewData } from '@/types/report-filters';
import { PassageiroDisplay } from '@/hooks/useViagemDetails';

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

interface ReportFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  onApplyFilters: (filters: ReportFilters) => void;
  passageiros: PassageiroDisplay[];
  onibusList: Onibus[];
  passeios?: Passeio[];
  previewData: ReportPreviewData;
}

export const ReportFiltersDialog: React.FC<ReportFiltersDialogProps> = ({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onApplyFilters,
  passageiros,
  onibusList,
  passeios,
  previewData
}) => {
  const [localFilters, setLocalFilters] = useState<ReportFilters>(filters);

  // Atualizar localFilters quando filters mudar
  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApplyFilters(localFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    const defaultFilters: ReportFilters = {
      statusPagamento: 'todos',
      setorMaracana: [],
      onibusIds: [],
      passeiosSelecionados: [],
      tipoPasseios: 'todos',
      mostrarNomesPasseios: true,
      incluirResumoFinanceiro: true,
      incluirDistribuicaoSetor: true,
      incluirListaOnibus: true,
      incluirPassageirosNaoAlocados: true,
      agruparPorOnibus: true,
      apenasComDesconto: false,
      modoResponsavel: false,
      modoPassageiro: false,
      modoEmpresaOnibus: false,
      mostrarStatusPagamento: true,
      mostrarValorPadrao: true,
      mostrarValoresPassageiros: true,
      mostrarTelefone: true,
      mostrarFotoOnibus: false,
      mostrarNumeroPassageiro: false,
    };
    setLocalFilters(defaultFilters);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">🔍 Filtros do Relatório</DialogTitle>
          <DialogDescription>
            Configure os filtros para personalizar seu relatório PDF. 
            Use o preview para ver quantos passageiros serão incluídos.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-4">
          <ReportFiltersComponent
            filters={localFilters}
            onFiltersChange={setLocalFilters}
            passageiros={passageiros}
            onibusList={onibusList}
            passeios={passeios}
            previewData={previewData}
          />
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            className="mr-auto"
          >
            🔄 Resetar Filtros
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleApply}
              className="bg-red-600 hover:bg-red-700"
            >
              📊 Aplicar Filtros
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};