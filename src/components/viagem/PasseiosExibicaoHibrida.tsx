import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { useViagemCompatibility } from '@/hooks/useViagemCompatibility';
import type { ViagemHibrida } from '@/utils/viagemCompatibility';

interface PasseiosExibicaoHibridaProps {
  viagem: ViagemHibrida;
  formato?: 'compacto' | 'detalhado' | 'lista';
  className?: string;
}

export const PasseiosExibicaoHibrida: React.FC<PasseiosExibicaoHibridaProps> = ({ 
  viagem, 
  formato = 'compacto',
  className = '' 
}) => {
  const { 
    sistema, 
    passeios, 
    valorPasseios, 
    temPasseios, 
    outroPasseio,
    shouldUseNewSystem 
  } = useViagemCompatibility(viagem);

  if (formato === 'compacto') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <MapPin className="h-4 w-4 text-gray-500" />
        {temPasseios ? (
          <div className="flex items-center gap-1">
            {passeios.length <= 2 ? (
              <span className="text-sm text-gray-700">
                {passeios.join(', ')} (+{passeios.length})
              </span>
            ) : (
              <span className="text-sm text-gray-700">
                {passeios.slice(0, 2).join(', ')}... (+{passeios.length})
              </span>
            )}
            {shouldUseNewSystem && valorPasseios > 0 && (
              <Badge variant="secondary" className="text-xs">
                +R$ {valorPasseios.toFixed(2).replace('.', ',')}
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-sm text-gray-500">Nenhum</span>
        )}
        {outroPasseio && (
          <Badge variant="outline" className="text-xs">
            +Personalizado
          </Badge>
        )}
      </div>
    );
  }

  if (formato === 'detalhado') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-900">
            Passeios {sistema === 'novo' ? 'com Valores' : 'Inclusos'}
          </span>
        </div>
        
        {temPasseios ? (
          <div className="space-y-1">
            {shouldUseNewSystem ? (
              // Sistema novo - mostrar com valores
              viagem.viagem_passeios?.map((vp, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{vp.passeios?.nome}</span>
                  <Badge variant="secondary" className="text-xs">
                    R$ {(vp.passeios?.valor || 0).toFixed(2).replace('.', ',')}
                  </Badge>
                </div>
              ))
            ) : (
              // Sistema antigo - só nomes
              passeios.map((passeio, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">{passeio}</span>
                  <Badge variant="outline" className="text-xs">Incluso</Badge>
                </div>
              ))
            )}
            
            {shouldUseNewSystem && valorPasseios > 0 && (
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-sm">Total Passeios:</span>
                  <span className="text-sm">R$ {valorPasseios.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Nenhum passeio selecionado</p>
        )}
        
        {outroPasseio && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Personalizado:</span>
              <span className="text-sm text-gray-600">{outroPasseio}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Formato lista
  return (
    <div className={`${className}`}>
      {temPasseios ? (
        <div className="flex flex-wrap gap-1">
          {passeios.map((passeio, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {passeio}
            </Badge>
          ))}
          {outroPasseio && (
            <Badge variant="outline" className="text-xs">
              {outroPasseio}
            </Badge>
          )}
        </div>
      ) : (
        <span className="text-sm text-gray-500">-</span>
      )}
    </div>
  );
};