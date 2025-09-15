import React from 'react';
import { PassageiroDisplay } from '@/hooks/useViagemDetails';
import { formatCPF, formatBirthDate } from '@/utils/formatters';
import { useEmpresa } from '@/hooks/useEmpresa';
import { formatDateTimeSafe } from '@/lib/date-utils';
import { ReportFilters } from '@/types/report-filters';

interface JogoInfo {
  adversario: string;
  jogo_data: string;
  local_jogo: 'casa' | 'fora';
  total_ingressos: number;
  logo_adversario?: string;
  logo_flamengo?: string;
}

interface OnibusData {
  id: string;
  viagem_id?: string;
  tipo_onibus?: string;
  empresa?: string;
  capacidade_onibus?: number;
  numero_identificacao?: string | null;
  lugares_extras?: number | null;
  passageiros_count?: number;
  rota_transfer?: string;
  placa_transfer?: string;
  motorista_transfer?: string;
}

interface IngressosViagemReportProps {
  passageiros: PassageiroDisplay[];
  jogoInfo: JogoInfo;
  filters?: ReportFilters;
  onibusList?: OnibusData[];
}

export const IngressosViagemReport = React.forwardRef<HTMLDivElement, IngressosViagemReportProps>(
  ({ passageiros, jogoInfo, filters, onibusList = [] }, ref) => {
    // Hook para dados da empresa
    const { empresa } = useEmpresa();
    
    // Debug: Verificação de dados recebidos
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [IngressosViagemReport] Debug:', {
        passageiros: passageiros?.length || 0,
        filters: filters?.modoTransfer ? 'Transfer' : filters?.modoComprarPasseios ? 'Passeios' : 'Ingressos',
        onibusList: onibusList?.length || 0,
        jogoInfo: jogoInfo?.adversario || 'N/A'
      });
    }
    
    // Verificação de dados essenciais
    if (!passageiros || passageiros.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ [IngressosViagemReport] Nenhum passageiro encontrado');
      }
      return (
        <div ref={ref} className="print-report bg-white p-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">📋 Relatório Vazio</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-blue-800 mb-2">ℹ️ Nenhum passageiro encontrado</p>
              <p className="text-blue-700 text-sm">
                Verifique os filtros aplicados ou se há passageiros cadastrados nesta viagem.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
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

    // Filtrar apenas passageiros com setor do Maracanã
    const passageirosComSetor = passageiros.filter(p => p.setor_maracana);

    return (
      <>
        <style>
          {`
            @media print {
              .print-report {
                background-color: white !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
                margin: 0 !important;
                padding: 20px !important;
                box-shadow: none !important;
                border: none !important;
                min-height: auto !important;
              }
              
              body {
                background-color: white !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              
              @page {
                margin: 20mm;
                background-color: white;
                size: A4;
              }
              
              .page-break {
                page-break-before: always !important;
                break-before: page !important;
              }
              
              .no-break {
                page-break-inside: avoid;
              }
            }
            
            @media screen {
              .print-report {
                background-color: white;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              }
            }
          `}
        </style>
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

          <h1 className="text-3xl font-bold text-red-600 mb-4">
            {filters?.modoTransfer 
              ? 'LISTA DE CLIENTES - TRANSFERS E PASSEIOS'
              : filters?.modoComprarPasseios 
                ? 'LISTA DE CLIENTES - PASSEIOS' 
                : 'LISTA DE CLIENTES - INGRESSOS'
            }
          </h1>
          
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

          {/* Total de Ingressos - Oculto no modo comprar passeios e transfer */}
          {!filters?.modoComprarPasseios && !filters?.modoTransfer && (
            <div className="mt-4 text-center">
              <span className="bg-red-600 text-white px-6 py-2 text-sm font-medium rounded">
                Total de Ingressos: {passageirosComSetor.length}
              </span>
            </div>
          )}
        </div>

        {/* Distribuição por Setor - Oculto no modo comprar passeios e transfer */}
        {!filters?.modoComprarPasseios && !filters?.modoTransfer && (
          <div className="mb-8 page-break">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Distribuição por Setor</h3>
            
            {(() => {
              const setorCount = passageirosComSetor.reduce((acc, passageiro) => {
                const setor = passageiro.setor_maracana || 'Sem setor';
                acc[setor] = (acc[setor] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              
              const setoresOrdenados = Object.entries(setorCount)
                .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'));
              
              return (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {setoresOrdenados.map(([setor, quantidade]) => (
                    <div key={setor} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{quantidade}</div>
                        <div className="text-sm text-gray-600 mt-1">{setor}</div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()} 
          </div>
        )}

        {/* Seções específicas do modo comprar passeios e transfer */}
        {(filters?.modoComprarPasseios || filters?.modoTransfer) && (
          <>
            {/* Ingressos por Faixa Etária (Passageiros com Passeios) */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Ingressos por Faixa Etária (Passageiros com Passeios)</h3>
              
              {/* Totais de Passeios - Movido para baixo do header */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3 text-gray-700">📊 Totais de Passeios</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {(() => {
                    const passeiosTotais = passageiros.reduce((acc, p) => {
                      const passeios = p.passeios || [];
                      
                      passeios.forEach(pp => {
                        const passeioNome = pp.passeio?.nome || pp.passeio_nome || 'Passeio não identificado';
                        acc[passeioNome] = (acc[passeioNome] || 0) + 1;
                      });
                      
                      return acc;
                    }, {} as Record<string, number>);
                    
                    return Object.entries(passeiosTotais).map(([passeioNome, quantidade]) => (
                      <div key={passeioNome} className="bg-green-50 p-4 rounded-lg border">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{quantidade}</div>
                          <div className="text-sm text-gray-600 mt-1">{passeioNome}</div>
                        </div>
                      </div>
                    ));
                  })()} 
                </div>
              </div>
              
              {/* Faixas Etárias */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3 text-gray-700">👥 Distribuição por Idade</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                  {(() => {
                    const passageirosComPasseios = passageiros.filter(p => p.passeios && p.passeios.length > 0);
                    const faixasEtarias = passageirosComPasseios.reduce((acc, p) => {
                      const idade = p.data_nascimento ? 
                        new Date().getFullYear() - new Date(p.data_nascimento).getFullYear() : null;
                      
                      let faixaEtaria = 'Não informado';
                      if (idade !== null) {
                        if (idade >= 0 && idade <= 5) faixaEtaria = 'Bebê';
                        else if (idade >= 6 && idade <= 12) faixaEtaria = 'Criança';
                        else if (idade >= 13 && idade <= 17) faixaEtaria = 'Estudante';
                        else if (idade >= 18 && idade <= 59) faixaEtaria = 'Adulto';
                        else if (idade >= 60) faixaEtaria = 'Idoso';
                        else faixaEtaria = 'Não informado';
                      }
                      
                      acc[faixaEtaria] = (acc[faixaEtaria] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);
                    
                    const faixasCriterios = {
                      'Bebê': '0-5 anos',
                      'Criança': '6-12 anos',
                      'Estudante': '13-17 anos',
                      'Adulto': '18-59 anos',
                      'Idoso': '60+ anos',
                      'Não informado': 'Sem data'
                    };
                    
                    const faixasOrdenadas = ['Bebê', 'Criança', 'Estudante', 'Adulto', 'Idoso', 'Não informado'];
                    
                    return faixasOrdenadas
                      .filter(faixa => (faixasEtarias[faixa] || 0) > 0) // Ocultar se for 0
                      .map(faixa => (
                      <div key={faixa} className="bg-blue-50 p-4 rounded-lg border">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{faixasEtarias[faixa] || 0}</div>
                          <div className="text-sm text-gray-600 mt-1">{faixa}</div>
                          <div className="text-xs text-blue-500 mt-1">{faixasCriterios[faixa]}</div>
                        </div>
                      </div>
                    ));
                  })()} 
                </div>
              </div>
            </div>
          </>
        )}

        {/* Lista de Clientes */}
        <div className="mb-8 no-break">
          {filters?.modoTransfer ? (
            // Modo Transfer: Lista por taxi com numeração reiniciada
            <>
              <h3 className="font-semibold text-gray-800 mb-4 text-lg">Lista de Clientes por Taxi</h3>
              
              {onibusList && onibusList.length > 0 ? (
                (() => {
                  // Ordenar taxis: primeiro os com lotação máxima, depois os com lotação incompleta
                  const onibusOrdenados = [...onibusList].sort((a, b) => {
                    const passageirosA = passageiros.filter(p => p.onibus_id === a.id).length;
                    const passageirosB = passageiros.filter(p => p.onibus_id === b.id).length;
                    const capacidadeA = a.capacidade_onibus || 0;
                    const capacidadeB = b.capacidade_onibus || 0;
                    
                    // Verificar se atingiu lotação máxima
                    const lotacaoCompletaA = passageirosA >= capacidadeA && capacidadeA > 0;
                    const lotacaoCompletaB = passageirosB >= capacidadeB && capacidadeB > 0;
                    
                    // Primeiro os com lotação completa, depois os incompletos
                    if (lotacaoCompletaA && !lotacaoCompletaB) return -1;
                    if (!lotacaoCompletaA && lotacaoCompletaB) return 1;
                    
                    // Se ambos têm o mesmo status de lotação, manter ordem original
                    return 0;
                  });
                  
                  return onibusOrdenados.map((onibus, onibusIndex) => {
                    const passageirosDoTaxi = passageiros.filter(p => p.onibus_id === onibus.id);
                  
                  return (
                    <div key={onibus.id} className={onibusIndex > 0 ? "page-break" : ""} style={onibusIndex > 0 ? { pageBreakBefore: 'always', breakBefore: 'page' } : {}}>
                      <div className="mb-8">
                        <h4 className="font-medium text-gray-700 mb-3 text-base">
                          🚕 TAXI {onibusIndex + 1} - {onibus.numero_identificacao || `${onibus.tipo_onibus} - ${onibus.empresa}`}
                          {(() => {
                            const capacidade = onibus.capacidade_onibus || 0;
                            const ocupacao = passageirosDoTaxi.length;
                            const lotacaoCompleta = ocupacao >= capacidade && capacidade > 0;
                            
                            return (
                              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                lotacaoCompleta 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {ocupacao}/{capacidade > 0 ? capacidade : '?'} 
                                {lotacaoCompleta ? ' ✅ LOTADO' : ' ⚠️ INCOMPLETO'}
                              </span>
                            );
                          })()}
                        </h4>
                        
                        {/* Faixas Etárias para este taxi */}
                        {passageirosDoTaxi.length > 0 && (
                          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <h5 className="font-medium text-blue-800 mb-2 text-sm">👥 Faixas Etárias - TAXI {onibusIndex + 1}</h5>
                            <div className="grid grid-cols-5 gap-2">
                              {(() => {
                                const faixasEtarias = passageirosDoTaxi.reduce((acc, p) => {
                                  const idade = p.data_nascimento ? 
                                    new Date().getFullYear() - new Date(p.data_nascimento).getFullYear() : null;
                                  
                                  let faixaEtaria = 'Não informado';
                                  if (idade !== null) {
                                    if (idade >= 0 && idade <= 5) faixaEtaria = 'Bebê';
                                    else if (idade >= 6 && idade <= 12) faixaEtaria = 'Criança';
                                    else if (idade >= 13 && idade <= 17) faixaEtaria = 'Estudante';
                                    else if (idade >= 18 && idade <= 59) faixaEtaria = 'Adulto';
                                    else if (idade >= 60) faixaEtaria = 'Idoso';
                                    else faixaEtaria = 'Não informado';
                                  }
                                  
                                  acc[faixaEtaria] = (acc[faixaEtaria] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>);
                                
                                const faixasOrdenadas = ['Bebê', 'Criança', 'Estudante', 'Adulto', 'Idoso'];
                                
                                const faixasCriterios = {
                                  'Bebê': '0-5 anos',
                                  'Criança': '6-12 anos',
                                  'Estudante': '13-17 anos',
                                  'Adulto': '18-59 anos',
                                  'Idoso': '60+ anos'
                                };
                                
                                return faixasOrdenadas.map(faixa => (
                                  <div key={faixa} className="text-center">
                                    <div className="text-lg font-bold text-blue-600">{faixasEtarias[faixa] || 0}</div>
                                    <div className="text-xs text-blue-700">{faixa}</div>
                                    <div className="text-xs text-blue-500 mt-1">{faixasCriterios[faixa]}</div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        )}
                        
                        {passageirosDoTaxi.length > 0 ? (
                          <div className="border rounded-lg overflow-hidden mb-6">
                            <table className="w-full text-sm border-collapse">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="border p-3 text-center w-16">#</th>
                                  <th className="border p-3 text-left">Cliente</th>
                                  <th className="border p-3 text-left">Passeio</th>
                                </tr>
                              </thead>
                              <tbody>
                                {passageirosDoTaxi
                                  .sort((a, b) => {
                                    const nomeA = a.nome || '';
                                    const nomeB = b.nome || '';
                                    return nomeA.localeCompare(nomeB, 'pt-BR');
                                  })
                                  .map((passageiro, index) => (
                                  <tr key={passageiro.id} className="hover:bg-gray-50">
                                    <td className="border p-3 text-center font-medium">{index + 1}</td>
                                    <td className="border p-3">{passageiro.nome || '-'}</td>
                                    <td className="border p-3">
                                      {passageiro.passeios && passageiro.passeios.length > 0 
                                        ? passageiro.passeios.map(pp => pp.passeio?.nome || pp.passeio_nome).filter(Boolean).join(', ') || '-'
                                        : '-'
                                      }
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500 text-sm mb-6">
                            <p>Nenhum passageiro alocado neste taxi.</p>
                          </div>
                        )}

                        {/* Informações de Transfer para este taxi específico */}
                        <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                          <h5 className="font-medium text-teal-800 mb-3">
                            📋 Informações de Transfer - TAXI {onibusIndex + 1}
                          </h5>
                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <span className="font-medium text-teal-800 flex-shrink-0">🎯 NOME DO TOUR:</span>
                              <div className="flex-1">
                                {onibus.nome_tour_transfer ? (
                                  <span className="text-teal-700 font-medium">{onibus.nome_tour_transfer}</span>
                                ) : (
                                  <div className="border-b-2 border-dotted border-teal-400 min-h-[24px] w-full">
                                    <span className="text-teal-500 text-sm italic">
                                      ________________________________
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <span className="font-medium text-teal-800 flex-shrink-0">🗺️ ROTA:</span>
                              <div className="flex-1">
                                {onibus.rota_transfer ? (
                                  <span className="text-teal-700 font-medium">{onibus.rota_transfer}</span>
                                ) : (
                                  <div className="border-b-2 border-dotted border-teal-400 min-h-[24px] w-full">
                                    <span className="text-teal-500 text-sm italic">
                                      ________________________________
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <span className="font-medium text-teal-800 flex-shrink-0">🚗 PLACA:</span>
                              <div className="flex-1">
                                {onibus.placa_transfer ? (
                                  <span className="text-teal-700 font-medium">{onibus.placa_transfer}</span>
                                ) : (
                                  <div className="border-b-2 border-dotted border-teal-400 min-h-[24px] w-32">
                                    <span className="text-teal-500 text-sm italic">
                                      _______________
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <span className="font-medium text-teal-800 flex-shrink-0">👨‍✈️ MOTORISTA:</span>
                              <div className="flex-1">
                                {onibus.motorista_transfer ? (
                                  <span className="text-teal-700 font-medium">{onibus.motorista_transfer}</span>
                                ) : (
                                  <div className="border-b-2 border-dotted border-teal-400 min-h-[24px] w-full">
                                    <span className="text-teal-500 text-sm italic">
                                      ________________________
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Nota explicativa */}
                          <div className="mt-3 pt-3 border-t border-teal-200">
                            <p className="text-xs text-teal-600 italic">
                              💡 Dados podem ser preenchidos no sistema ou anotados manualmente neste relatório
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  });
                })()
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum taxi encontrado para esta viagem.</p>
                </div>
              )}
            </>
          ) : (
            // Modo normal
            <>
              <h3 className="font-semibold text-gray-800 mb-4 text-lg">Lista de Clientes</h3>
              
              {(() => {
                // No modo comprar passeios, usar todos os passageiros, senão usar apenas os com setor
                const passageirosParaExibir = filters?.modoComprarPasseios ? passageiros : passageirosComSetor;
            
            return passageirosParaExibir.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-3 text-center w-16">#</th>
                      <th className="border p-3 text-left">Cliente</th>
                      <th className="border p-3 text-center">CPF</th>
                      <th className="border p-3 text-center">Data de Nascimento</th>
                      {(filters?.modoComprarPasseios || filters?.modoTransfer) ? (
                        <th className="border p-3 text-left">Passeio</th>
                      ) : (
                        <th className="border p-3 text-left">Setor</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {passageirosParaExibir
                      .sort((a, b) => {
                        const nomeA = a.nome || '';
                        const nomeB = b.nome || '';
                        return nomeA.localeCompare(nomeB, 'pt-BR');
                      })
                      .map((passageiro, index) => (
                      <tr key={passageiro.id} className="hover:bg-gray-50">
                        <td className="border p-3 text-center font-medium">{index + 1}</td>
                        <td className="border p-3">{passageiro.nome || '-'}</td>
                        <td className="border p-3 text-center">
                          {passageiro.cpf ? formatCPF(passageiro.cpf) : '-'}
                        </td>
                        <td className="border p-3 text-center">
                          {passageiro.data_nascimento 
                            ? formatBirthDate(passageiro.data_nascimento)
                            : '-'
                          }
                        </td>
                        {(filters?.modoComprarPasseios || filters?.modoTransfer) ? (
                          <td className="border p-3">
                            {passageiro.passeios && passageiro.passeios.length > 0 
                              ? passageiro.passeios.map(pp => pp.passeio?.nome || pp.passeio_nome).filter(Boolean).join(', ') || '-'
                              : '-'
                            }
                          </td>
                        ) : (
                          <td className="border p-3">{passageiro.setor_maracana || '-'}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>
                  {(filters?.modoComprarPasseios || filters?.modoTransfer)
                    ? 'Nenhum passageiro encontrado para esta viagem.'
                    : 'Nenhum passageiro com setor do Maracanã encontrado para esta viagem.'
                  }
                </p>
              </div>
            );
          })()}
            </>
          )}
        </div>



        {/* Rodapé */}
        <div className="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-600" style={{ marginBottom: 0, paddingBottom: 0, backgroundColor: 'white' }}>
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
          <p style={{ marginTop: '4px', marginBottom: 0 }}>Sistema de Gestão de Viagens - Flamengo</p>
        </div>
        </div>
      </>
    );
  }
);

IngressosViagemReport.displayName = 'IngressosViagemReport';