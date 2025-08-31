import React from 'react';
import { Ingresso } from '@/types/ingressos';
import { formatCPF, formatBirthDate } from '@/utils/formatters';
import { useEmpresa } from '@/hooks/useEmpresa';
import { formatDateTimeSafe } from '@/lib/date-utils';

interface JogoInfo {
  adversario: string;
  jogo_data: string;
  local_jogo: 'casa' | 'fora';
  total_ingressos: number;
  logo_adversario?: string;
  logo_flamengo?: string;
}

interface IngressosReportProps {
  ingressos: Ingresso[];
  jogoInfo: JogoInfo;
}

export const IngressosReport = React.forwardRef<HTMLDivElement, IngressosReportProps>(
  ({ ingressos, jogoInfo }, ref) => {
    // Hook para dados da empresa
    const { empresa } = useEmpresa();
    
    // Função para formatar data/hora igual aos cards de viagens e ingressos
    const dataFormatada = formatDateTimeSafe(jogoInfo.jogo_data);

    const agora = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const localJogoTexto = jogoInfo.local_jogo === 'casa' ? 'Maracanã' : 'Fora de Casa';

    return (
      <div ref={ref} className="print-report" style={{ backgroundColor: 'white', padding: '32px', maxWidth: '1024px', margin: '0 auto' }}>
        {/* Cabeçalho */}
        <div className="text-center mb-8 border-b-2 border-red-600 pb-6">
          {/* Logo da Empresa no topo */}
          <div className="flex justify-center mb-6">
            <div className="flex flex-col items-center logo-container">
              {empresa?.logo_url ? (
                <img 
                  src={empresa.logo_url} 
                  alt={empresa.nome_fantasia || empresa.nome} 
                  className="h-12 w-auto object-contain mb-2"
                />
              ) : (
                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-2 shadow-md">
                  <div className="text-center">
                    <div className="font-bold text-sm">
                      {empresa?.nome_fantasia?.toUpperCase() || empresa?.nome?.toUpperCase() || 'NETO TOURS VIAGENS'}
                    </div>
                    <div className="text-xs opacity-90">Turismo e Eventos</div>
                  </div>
                </div>
              )}
              <span className="text-xs text-gray-500 font-medium">
                {empresa?.nome_fantasia?.toUpperCase() || empresa?.nome?.toUpperCase() || 'NETO TOURS VIAGENS'}
              </span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-red-600 mb-4">LISTA DE CLIENTES - INGRESSOS</h1>
          
          {/* Informações do Jogo */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h2 className="text-2xl font-bold text-red-700 text-center mb-4">
              {jogoInfo.local_jogo === 'fora' ? 
                `${jogoInfo.adversario.toUpperCase()} × FLAMENGO` : 
                `FLAMENGO × ${jogoInfo.adversario.toUpperCase()}`
              }
            </h2>
            
            {/* Logos dos Times - Seguindo o mesmo padrão do card */}
            <div className="flex items-center justify-center gap-8 mt-4">
              {/* Mostrar adversário primeiro quando jogo for fora */}
              {jogoInfo.local_jogo === 'fora' ? (
                <>
                  {/* Logo do Adversário */}
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full border-2 border-red-300 bg-white flex items-center justify-center overflow-hidden shadow-sm">
                      <img 
                        src={jogoInfo.logo_adversario || `https://via.placeholder.com/64x64/cccccc/666666?text=${jogoInfo.adversario.substring(0, 3).toUpperCase()}`} 
                        alt={jogoInfo.adversario} 
                        className="h-12 w-12 object-contain" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `https://via.placeholder.com/64x64/cccccc/666666?text=${jogoInfo.adversario.substring(0, 3).toUpperCase()}`;
                        }}
                      />
                    </div>
                    <span className="text-xs text-red-600 font-medium mt-1">{jogoInfo.adversario.toUpperCase()}</span>
                  </div>
                  
                  {/* VS */}
                  <div className="text-3xl font-bold text-red-600">×</div>
                  
                  {/* Logo do Flamengo */}
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full border-2 border-red-300 bg-white flex items-center justify-center overflow-hidden shadow-sm">
                      <img 
                        src={jogoInfo.logo_flamengo || "https://logodetimes.com/times/flamengo/logo-flamengo-256.png"} 
                        alt="Flamengo" 
                        className="h-12 w-12 object-contain" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "https://logodetimes.com/times/flamengo/logo-flamengo-256.png";
                        }}
                      />
                    </div>
                    <span className="text-xs text-red-600 font-medium mt-1">FLAMENGO</span>
                  </div>
                </>
              ) : (
                <>
                  {/* Logo do Flamengo */}
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full border-2 border-red-300 bg-white flex items-center justify-center overflow-hidden shadow-sm">
                      <img 
                        src={jogoInfo.logo_flamengo || "https://logodetimes.com/times/flamengo/logo-flamengo-256.png"} 
                        alt="Flamengo" 
                        className="h-12 w-12 object-contain" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "https://logodetimes.com/times/flamengo/logo-flamengo-256.png";
                        }}
                      />
                    </div>
                    <span className="text-xs text-red-600 font-medium mt-1">FLAMENGO</span>
                  </div>
                  
                  {/* VS */}
                  <div className="text-3xl font-bold text-red-600">×</div>
                  
                  {/* Logo do Adversário */}
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full border-2 border-red-300 bg-white flex items-center justify-center overflow-hidden shadow-sm">
                      <img 
                        src={jogoInfo.logo_adversario || `https://via.placeholder.com/64x64/cccccc/666666?text=${jogoInfo.adversario.substring(0, 3).toUpperCase()}`} 
                        alt={jogoInfo.adversario} 
                        className="h-12 w-12 object-contain" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `https://via.placeholder.com/64x64/cccccc/666666?text=${jogoInfo.adversario.substring(0, 3).toUpperCase()}`;
                        }}
                      />
                    </div>
                    <span className="text-xs text-red-600 font-medium mt-1">{jogoInfo.adversario.toUpperCase()}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <span className="font-medium text-gray-700">Data do Jogo:</span>
              <p className="text-gray-600">{dataFormatada}</p>
            </div>
            <div className="text-center">
              <span className="font-medium text-gray-700">Local:</span>
              <p className="text-gray-600">{localJogoTexto}</p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className="bg-red-600 text-white px-6 py-2 text-sm font-medium rounded">
              Total de Ingressos: {jogoInfo.total_ingressos}
            </span>
          </div>
        </div>

        {/* Lista de Clientes */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-800 mb-4 text-lg">Lista de Clientes</h3>
          
          {ingressos.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-3 text-center w-16">#</th>
                    <th className="border p-3 text-left">Cliente</th>
                    <th className="border p-3 text-center">CPF</th>
                    <th className="border p-3 text-center">Data de Nascimento</th>
                    <th className="border p-3 text-left">Setor</th>
                  </tr>
                </thead>
                <tbody>
                  {ingressos
                    .sort((a, b) => {
                      const nomeA = a.cliente?.nome || '';
                      const nomeB = b.cliente?.nome || '';
                      return nomeA.localeCompare(nomeB, 'pt-BR');
                    })
                    .map((ingresso, index) => (
                    <tr key={ingresso.id} className="hover:bg-gray-50">
                      <td className="border p-3 text-center font-medium">{index + 1}</td>
                      <td className="border p-3">{ingresso.cliente?.nome || '-'}</td>
                      <td className="border p-3 text-center">
                        {ingresso.cliente?.cpf ? formatCPF(ingresso.cliente.cpf) : '-'}
                      </td>
                      <td className="border p-3 text-center">
                        {ingresso.cliente?.data_nascimento 
                          ? formatBirthDate(ingresso.cliente.data_nascimento)
                          : '-'
                        }
                      </td>
                      <td className="border p-3">{ingresso.setor_estadio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum ingresso encontrado para este jogo.</p>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-600" style={{ marginBottom: 0, paddingBottom: 0 }}>
          <div className="flex justify-center items-center gap-4 mb-3">
            {empresa?.logo_url ? (
              <img
                src={empresa.logo_url}
                alt={empresa.nome_fantasia || empresa.nome}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                NT
              </div>
            )}
            <div className="text-left">
              <p className="font-semibold text-gray-700">
                {empresa?.nome_fantasia?.toUpperCase() || empresa?.nome?.toUpperCase() || 'NETO TOURS VIAGENS'}
              </p>
              <p className="text-xs text-gray-500">Turismo e Eventos</p>
            </div>
          </div>
          <p>Relatório gerado em: {agora}</p>
          <p style={{ marginTop: '4px', marginBottom: 0 }}>Sistema de Gestão de Ingressos - Flamengo</p>
        </div>
      </div>
    );
  }
);

IngressosReport.displayName = 'IngressosReport';