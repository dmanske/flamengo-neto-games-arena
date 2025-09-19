/**
 * Botão para abrir o sistema de personalização de relatórios
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Palette, FileText } from 'lucide-react';
import { PersonalizacaoDialog } from './PersonalizacaoDialog';
import { PersonalizationConfig } from '@/types/personalizacao-relatorios';
import { migrateFiltersToPersonalization } from '@/lib/personalizacao/integration';
import { ReportFilters } from '@/types/report-filters';

interface ReportPersonalizationButtonProps {
  viagemId: string;
  currentFilters?: ReportFilters;
  onConfigApplied?: (config: PersonalizationConfig) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  realData?: {
    viagem: any;
    passageiros: any[];
    onibus: any[];
    passeios: any[];
  };
}

export function ReportPersonalizationButton({
  viagemId,
  currentFilters,
  onConfigApplied,
  variant = 'outline',
  size = 'default',
  className = '',
  realData
}: ReportPersonalizationButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  // Converter filtros atuais para configuração de personalização
  const initialConfig = currentFilters 
    ? migrateFiltersToPersonalization(currentFilters)
    : undefined;

  const handleOpenDialog = () => {
    setShowDialog(true);
  };

  const handleConfigApplied = (config: PersonalizationConfig) => {
    setShowDialog(false);
    onConfigApplied?.(config);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleOpenDialog}
        className={`${className} bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-blue-100`}
      >
        <Palette className="w-4 h-4 mr-2" />
        Personalização Avançada
      </Button>

      <PersonalizacaoDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        viagemId={viagemId}
        configuracaoInicial={initialConfig}
        onAplicar={handleConfigApplied}
        realData={realData}
      />
    </>
  );
}

/**
 * Versão compacta do botão para uso em toolbars
 */
export function ReportPersonalizationIconButton({
  viagemId,
  currentFilters,
  onConfigApplied,
  className = ''
}: Omit<ReportPersonalizationButtonProps, 'variant' | 'size'>) {
  return (
    <ReportPersonalizationButton
      viagemId={viagemId}
      currentFilters={currentFilters}
      onConfigApplied={onConfigApplied}
      variant="ghost"
      size="sm"
      className={className}
    />
  );
}

/**
 * Botão destacado para uso principal
 */
export function ReportPersonalizationPrimaryButton({
  viagemId,
  currentFilters,
  onConfigApplied,
  className = ''
}: Omit<ReportPersonalizationButtonProps, 'variant' | 'size'>) {
  return (
    <ReportPersonalizationButton
      viagemId={viagemId}
      currentFilters={currentFilters}
      onConfigApplied={onConfigApplied}
      variant="default"
      size="lg"
      className={`${className} bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0`}
    />
  );
}