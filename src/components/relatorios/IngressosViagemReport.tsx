import React from 'react';
import { PassageiroDisplay } from '@/hooks/useViagemDetails';
import { formatCPF, formatBirthDate, calcularIdade } from '@/utils/formatters';
import { useEmpresa } from '@/hooks/useEmpresa';
import { formatDateTimeSafe } from '@/lib/date-utils';
import { ReportFilters } from '@/types/report-filters';
import { 
  categorizarIdadePorPasseio, 
  obterDescricaoFaixaEtaria,
  detectarTipoPasseio,
  type FaixaEtariaConfig 
} from '@/utils/passeiosFaixasEtarias';
import { Baby, GraduationCap, User, UserCheck, Users } from 'lucide-react';

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

// Função para obter ícone por tipo
const getIconeIdade = (icone: string) => {
  switch (icone) {
    case 'baby': return <Baby className="h-3 w-3" />;
    case 'graduationCap': return <GraduationCap className="h-3 w-3" />;
    case 'user': return <User className="h-3 w-3" />;
    case 'userCheck': return <UserCheck className="h-3 w-3" />;
    default: return <Users className="h-3 w-3" />;
  }
};

// Função para definir prioridade de ordenação dos passeios
const obterPrioridadePasseio = (nomePasseio: string): number => {
  const nome = nomePasseio.toLowerCase();
  
  // Cristo Redentor e variações - Prioridade 1
  if (nome.includes('cristo redentor') || nome.includes('cristo redendor') || nome.includes('cristo')) {
    return 1;
  }
  
  // Pão de Açúcar e variações - Prioridade 2
  if (nome.includes('pão de açúcar') || nome.includes('pao de acucar') || nome.includes('bondinho') ||
      (nome.includes('pão') && nome.includes('açúcar')) || (nome.includes('pao') && nome.includes('acucar'))) {
    return 2;
  }
  
  // Outros passeios - Prioridade 3 (ordem alfabética)
  return 3;
};

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
              
              .page-break-after {
                page-break-after: always !important;
                break-after: page !important;
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
              

              {/* Totais Agrupados por Passeio */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3 text-gray-700">👥 Totais por Passeio</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {(() => {
                    const passageirosComPasseios = passageiros.filter(p => p.passeios && p.passeios.length > 0);
                    const passeioTotais: Record<string, { 
                      total: number; 
                      faixas: Record<string, { quantidade: number; config: FaixaEtariaConfig }>;
                      prioridade: number;
                    }> = {};
                    
                    // Calcular totais agrupados por passeio
                    passageirosComPasseios.forEach(p => {
                      if (p.passeios && p.passeios.length > 0) {
                        p.passeios.forEach(passeio => {
                          const nomePasseio = passeio.passeio?.nome || passeio.passeio_nome || 'Passeio não identificado';
                          const idade = p.data_nascimento ? calcularIdade(p.data_nascimento) : 0;
                          const faixa = categorizarIdadePorPasseio(idade, nomePasseio);
                          const prioridade = obterPrioridadePasseio(nomePasseio);
                          
                          if (!passeioTotais[nomePasseio]) {
                            passeioTotais[nomePasseio] = {
                              total: 0,
                              faixas: {},
                              prioridade
                            };
                          }
                          
                          passeioTotais[nomePasseio].total += 1;
                          
                          if (!passeioTotais[nomePasseio].faixas[faixa.nome]) {
                            passeioTotais[nomePasseio].faixas[faixa.nome] = {
                              quantidade: 0,
                              config: faixa
                            };
                          }
                          passeioTotais[nomePasseio].faixas[faixa.nome].quantidade += 1;
                        });
                      }
                    });
                    
                    return Object.entries(passeioTotais)
                      .sort(([, a], [, b]) => a.prioridade - b.prioridade || b.total - a.total)
                      .map(([nomePasseio, dados]) => (
                        <div key={nomePasseio} className="bg-gray-50 p-4 rounded-lg border">
                          <div className="text-center mb-3">
                            <div className="text-2xl font-bold text-gray-700">
                              {dados.total}
                            </div>
                            <div className="text-sm font-medium text-gray-600 mt-1">
                              {nomePasseio}
                            </div>
                          </div>
                          
                          {/* Faixas etárias do passeio */}
                          <div className="space-y-1">
                            {Object.entries(dados.faixas)
                              .sort(([, a], [, b]) => a.config.idadeMin - b.config.idadeMin)
                              .map(([faixaNome, faixaDados]) => (
                                <div key={faixaNome} className={`flex items-center justify-between px-2 py-1 rounded text-xs ${faixaDados.config.cor} ${faixaDados.config.corTexto}`}>
                                  <div className="flex items-center gap-1 flex-1">
                                    {getIconeIdade(faixaDados.config.icone)}
                                    <div className="flex flex-col">
                                      <span className="font-medium">{faixaNome}</span>
                                      <span className="text-xs opacity-75">
                                        {obterDescricaoFaixaEtaria(faixaDados.config)}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="font-bold">{faixaDados.quantidade}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ));
                  })()} 
                </div>
              </div>
              
              {/* Estatísticas dos Taxis - Apenas no modo Transfer */}
              {filters?.modoTransfer && onibusList && onibusList.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-3 text-gray-700">🚕 Estatísticas dos Taxis</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {(() => {
                      // Calcular estatísticas dos taxis
                      const totalTaxis = onibusList.length;
                      let taxisCompletos = 0;
                      let taxisIncompletos = 0;
                      const ocupacaoPorCapacidade: Record<string, { ocupados: number; total: number }> = {};
                      
                      onibusList.forEach(onibus => {
                        const passageirosNoTaxi = passageiros.filter(p => p.onibus_id === onibus.id).length;
                        const capacidade = onibus.capacidade_onibus || 0;
                        const capacidadeTotal = capacidade + (onibus.lugares_extras || 0);
                        
                        // Contar completos vs incompletos
                        if (passageirosNoTaxi >= capacidadeTotal && capacidadeTotal > 0) {
                          taxisCompletos++;
                        } else {
                          taxisIncompletos++;
                        }
                        
                        // Agrupar por capacidade
                        const chaveCapacidade = `${capacidadeTotal} lugares`;
                        if (!ocupacaoPorCapacidade[chaveCapacidade]) {
                          ocupacaoPorCapacidade[chaveCapacidade] = { ocupados: 0, total: 0 };
                        }
                        ocupacaoPorCapacidade[chaveCapacidade].total++;
                        if (passageirosNoTaxi >= capacidadeTotal && capacidadeTotal > 0) {
                          ocupacaoPorCapacidade[chaveCapacidade].ocupados++;
                        }
                      });
                      
                      const cards = [];
                      
                      // Card Total de Taxis
                      cards.push(
                        <div key="total" className="bg-gray-50 p-4 rounded-lg border">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-600">{totalTaxis}</div>
                            <div className="text-sm text-gray-600 mt-1">Total de Taxis</div>
                          </div>
                        </div>
                      );
                      
                      // Card Taxis Completos
                      if (taxisCompletos > 0) {
                        cards.push(
                          <div key="completos" className="bg-green-50 p-4 rounded-lg border">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">{taxisCompletos}</div>
                              <div className="text-sm text-gray-600 mt-1">Taxis Lotados</div>
                              <div className="text-xs text-green-500 mt-1">100% ocupação</div>
                            </div>
                          </div>
                        );
                      }
                      
                      // Card Taxis Incompletos
                      if (taxisIncompletos > 0) {
                        cards.push(
                          <div key="incompletos" className="bg-yellow-50 p-4 rounded-lg border">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-yellow-600">{taxisIncompletos}</div>
                              <div className="text-sm text-gray-600 mt-1">Taxis Incompletos</div>
                              <div className="text-xs text-yellow-500 mt-1">Com vagas</div>
                            </div>
                          </div>
                        );
                      }
                      
                      // Cards por Capacidade (ex: 4/4, 5/5)
                      Object.entries(ocupacaoPorCapacidade)
                        .sort(([a], [b]) => {
                          const numA = parseInt(a.split(' ')[0]);
                          const numB = parseInt(b.split(' ')[0]);
                          return numA - numB;
                        })
                        .forEach(([capacidade, dados]) => {
                          cards.push(
                            <div key={capacidade} className="bg-blue-50 p-4 rounded-lg border">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                  {dados.ocupados}/{dados.total}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">{capacidade}</div>
                                <div className="text-xs text-blue-500 mt-1">
                                  {dados.ocupados > 0 ? 'Lotados' : 'Disponíveis'}
                                </div>
                              </div>
                            </div>
                          );
                        });
                      
                      return cards;
                    })()}
                  </div>
                </div>
              )}
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
              {filters?.modoComprarPasseios ? (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">Lista de Clientes</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>📋 Organização:</strong> Faixas especiais primeiro (Gratuidade, Meia-Entrada, etc.), depois ingressos Inteira
                    </p>
                  </div>
                </div>
              ) : (
                <h3 className="font-semibold text-gray-800 mb-4 text-lg">Lista de Clientes</h3>
              )}
              
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
                    {(() => {
                      // Ordenação inteligente para modo comprar passeios - MANTENDO PASSAGEIROS AGRUPADOS
                      if (filters?.modoComprarPasseios) {
                        // Processar passageiros mantendo-os agrupados
                        const passageirosProcessados = passageirosParaExibir.map(passageiro => {
                          if (passageiro.passeios && passageiro.passeios.length > 0) {
                            const idade = passageiro.data_nascimento ? calcularIdade(passageiro.data_nascimento) : 0;
                            
                            // Processar todos os passeios do passageiro
                            const passeiosProcessados = passageiro.passeios.map(passeio => {
                              const nomePasseio = passeio.passeio?.nome || passeio.passeio_nome || 'Passeio não identificado';
                              const faixa = categorizarIdadePorPasseio(idade, nomePasseio);
                              const isInteira = faixa.nome === 'Inteira';
                              const isAdulto = faixa.nome === 'Adulto';
                              const tipoPasseio = detectarTipoPasseio(nomePasseio);
                              const temFaixaEspecial = tipoPasseio !== 'padrao';
                              
                              return {
                                passeio,
                                faixa,
                                isInteira,
                                isAdulto,
                                temFaixaEspecial,
                                prioridadePasseio: obterPrioridadePasseio(nomePasseio),
                                prioridadeFaixa: !isInteira && !isAdulto ? 1 : 2 // Qualquer badge (não inteira/adulto) = prioridade 1
                              };
                            });
                            
                            // Determinar prioridade geral do passageiro baseada no melhor caso
                            // Se tem pelo menos um passeio com badge (qualquer faixa especial), vai para prioridade 1
                            const temAlgumBadge = passeiosProcessados.some(p => p.prioridadeFaixa === 1);
                            const menorPrioridadeFaixa = temAlgumBadge ? 1 : 2;
                            const menorPrioridadePasseio = Math.min(...passeiosProcessados.map(p => p.prioridadePasseio));
                            
                            return {
                              passageiro,
                              passeiosProcessados,
                              prioridadeFaixa: menorPrioridadeFaixa,
                              prioridadePasseio: menorPrioridadePasseio
                            };
                          } else {
                            // Passageiro sem passeios
                            return {
                              passageiro,
                              passeiosProcessados: [],
                              prioridadeFaixa: 3,
                              prioridadePasseio: 999
                            };
                          }
                        });
                        
                        // Ordenar passageiros mantendo-os agrupados
                        return passageirosProcessados
                          .sort((a, b) => {
                            // Primeiro: prioridade por badges (quem tem qualquer badge vs quem não tem)
                            if (a.prioridadeFaixa !== b.prioridadeFaixa) {
                              return a.prioridadeFaixa - b.prioridadeFaixa;
                            }
                            
                            // Segundo: prioridade de passeio (Cristo, Pão de Açúcar, Museu, outros)
                            if (a.prioridadePasseio !== b.prioridadePasseio) {
                              return a.prioridadePasseio - b.prioridadePasseio;
                            }
                            
                            // Terceiro: ordem alfabética do nome do passageiro
                            const nomeA = a.passageiro.nome || '';
                            const nomeB = b.passageiro.nome || '';
                            return nomeA.localeCompare(nomeB, 'pt-BR');
                          });
                      } else {
                        // ✅ CORREÇÃO: Ordenação normal para outros modos - incluir passeiosProcessados vazio
                        return passageirosParaExibir
                          .sort((a, b) => {
                            const nomeA = a.nome || '';
                            const nomeB = b.nome || '';
                            return nomeA.localeCompare(nomeB, 'pt-BR');
                          })
                          .map(passageiro => ({ 
                            passageiro, 
                            passeiosProcessados: [], // ✅ CORREÇÃO: Adicionar array vazio para evitar erro
                            passeio: null, 
                            faixa: null, 
                            isInteira: false, 
                            prioridade: 1,
                            prioridadeFaixa: 2
                          }));
                      }
                    })()
                      .map((dadosPassageiro, index) => {
                        const { passageiro, passeiosProcessados, prioridadeFaixa } = dadosPassageiro;
                        
                        // ✅ CORREÇÃO: Calcular cor da linha baseada no primeiro passeio com faixa especial
                        let corLinha = 'hover:bg-gray-50';
                        if (passeiosProcessados && Array.isArray(passeiosProcessados)) {
                          const primeiraFaixaEspecial = passeiosProcessados.find(p => p.prioridadeFaixa === 1);
                          if (primeiraFaixaEspecial) {
                            const corBase = primeiraFaixaEspecial.faixa.cor.replace('-50', '-25');
                            corLinha = `${corBase} hover:${primeiraFaixaEspecial.faixa.cor.replace('-50', '-100')}`;
                          }
                        }
                        
                        // Não quebrar página automaticamente - deixar fluir naturalmente
                        const deveQuebrarPagina = false;
                        
                        return (
                          <tr key={`${passageiro.id}-${index}`} className={corLinha}>
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
                                  {passeiosProcessados && Array.isArray(passeiosProcessados) && passeiosProcessados.length > 0 ? (
                                    <div className="flex flex-col gap-1">
                                      {passeiosProcessados
                                        .sort((a, b) => a.prioridadePasseio - b.prioridadePasseio)
                                        .map((dadosPasseio, idx) => (
                                          <div key={idx} className="flex items-center gap-2">
                                            <span className="text-sm">
                                              {dadosPasseio.passeio.passeio?.nome || dadosPasseio.passeio.passeio_nome || 'Passeio não identificado'}
                                            </span>
                                            {dadosPasseio.temFaixaEspecial && !dadosPasseio.isInteira && !dadosPasseio.isAdulto && 
                                             !dadosPasseio.passeio.passeio_nome?.toLowerCase().includes('museu do flamengo') && 
                                             !dadosPasseio.passeio.passeio?.nome?.toLowerCase().includes('museu do flamengo') && (
                                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${dadosPasseio.faixa.cor} ${dadosPasseio.faixa.corTexto}`}>
                                                {getIconeIdade(dadosPasseio.faixa.icone)}
                                                <span>{dadosPasseio.faixa.nome}</span>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                    </div>
                                  ) : '-'}
                                </td>
                              ) : (
                                <td className="border p-3">{passageiro.setor_maracana || '-'}</td>
                              )}
                            </tr>
                        );
                      })}
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