import { useMemo } from 'react';
import { 
  ViagemHibrida, 
  getViagemCompatibilityInfo,
  isViagemNova,
  isViagemLegacy 
} from '@/utils/viagemCompatibility';

/**
 * Hook para gerenciar compatibilidade entre sistemas antigo e novo de passeios
 */
export const useViagemCompatibility = (viagem: ViagemHibrida | null) => {
  const compatibilityInfo = useMemo(() => {
    if (!viagem || !viagem.id) {
      return {
        isNova: false,
        isLegacy: false,
        sistema: 'sem_dados' as const,
        passeios: [],
        valorPasseios: 0,
        temPasseios: false,
        outroPasseio: undefined
      };
    }

    try {
      return getViagemCompatibilityInfo(viagem);
    } catch (error) {
      console.error('Erro no hook useViagemCompatibility:', error);
      return {
        isNova: false,
        isLegacy: false,
        sistema: 'erro' as const,
        passeios: [],
        valorPasseios: 0,
        temPasseios: false,
        outroPasseio: undefined
      };
    }
  }, [viagem]);

  const shouldUseNewSystem = useMemo(() => {
    return compatibilityInfo.isNova;
  }, [compatibilityInfo.isNova]);

  const shouldUseLegacySystem = useMemo(() => {
    return compatibilityInfo.isLegacy;
  }, [compatibilityInfo.isLegacy]);

  return {
    ...compatibilityInfo,
    shouldUseNewSystem,
    shouldUseLegacySystem,
    // Funções de conveniência
    isViagemNova: (v: ViagemHibrida) => isViagemNova(v),
    isViagemLegacy: (v: ViagemHibrida) => isViagemLegacy(v)
  };
};