import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { ReportPreviewData } from '@/types/report-filters';
import { Users, DollarSign, FileText, Filter } from 'lucide-react';

interface ReportPreviewProps {
  previewData: ReportPreviewData;
  isFiltered: boolean;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  previewData,
  isFiltered
}) => {
  return (
    <Card className={`${isFiltered ? 'border-purple-200 bg-purple-50' : 'border-gray-200'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {isFiltered ? (
            <>
              <Filter className="h-5 w-5 text-purple-600" />
              <span className="text-purple-700">Preview do Relatório (Filtrado)</span>
            </>
          ) : (
            <>
              <FileText className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Preview do Relatório</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Passageiros */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isFiltered ? 'bg-purple-100' : 'bg-blue-100'}`}>
              <Users className={`h-5 w-5 ${isFiltered ? 'text-purple-600' : 'text-blue-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Passageiros</p>
              <p className="text-lg font-bold">
                {isFiltered ? (
                  <>
                    <span className="text-purple-600">{previewData.passageirosFiltrados}</span>
                    <span className="text-gray-400 text-sm ml-1">/ {previewData.totalPassageiros}</span>
                  </>
                ) : (
                  <span className="text-blue-600">{previewData.totalPassageiros}</span>
                )}
              </p>
            </div>
          </div>

          {/* Total Arrecadado */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isFiltered ? 'bg-purple-100' : 'bg-green-100'}`}>
              <DollarSign className={`h-5 w-5 ${isFiltered ? 'text-purple-600' : 'text-green-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className={`text-lg font-bold ${isFiltered ? 'text-purple-600' : 'text-green-600'}`}>
                {formatCurrency(previewData.totalArrecadado)}
              </p>
            </div>
          </div>

          {/* Seções */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isFiltered ? 'bg-purple-100' : 'bg-orange-100'}`}>
              <FileText className={`h-5 w-5 ${isFiltered ? 'text-purple-600' : 'text-orange-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Seções</p>
              <p className={`text-lg font-bold ${isFiltered ? 'text-purple-600' : 'text-orange-600'}`}>
                {previewData.secoesSelecionadas.length}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Seções */}
        {previewData.secoesSelecionadas.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Seções incluídas:</p>
            <div className="flex flex-wrap gap-1">
              {previewData.secoesSelecionadas.map(secao => (
                <Badge 
                  key={secao} 
                  variant="secondary" 
                  className={`text-xs ${isFiltered ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}
                >
                  {secao}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Indicador de Filtros Ativos */}
        {isFiltered && (
          <div className="mt-4 pt-4 border-t border-purple-200">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700 font-medium">
                Filtros ativos - Relatório personalizado
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};