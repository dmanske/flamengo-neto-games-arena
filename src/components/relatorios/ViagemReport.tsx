import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { PassageiroDisplay } from '@/hooks/useViagemDetails';
import { Badge } from '@/components/ui/badge';
import { converterStatusParaInteligente } from '@/lib/status-utils';
import { ReportFilters } from '@/types/report-filters';
import { useEmpresa } from '@/hooks/useEmpresa';

interface Viagem {
  id: string;
  adversario: string;
  data_jogo: string;
  data_saida?: string;
  created_at?: string;
  tipo_onibus: string;
  empresa: string;
  rota: string;
  capacidade_onibus: number;
  status_viagem: string;
  valor_padrao: number | null;
  setor_padrao: string | null;
  // Campos para passeios
  passeios_pagos?: string[];
  outro_passeio?: string;
  viagem_passeios?: Array<{
    passeio_id: string;
    passeios: {
      nome: string;
      valor: number;
      categoria: string;
    };
  }>;
}

interface Onibus {
  id: string;
  tipo_onibus: string;
  empresa: string;
  capacidade_onibus: number;
  numero_identificacao: string | null;
}

interface ViagemReportProps {
  viagem: Viagem;
  passageiros: PassageiroDisplay[];
  onibusList: Onibus[];
  totalArrecadado: number;
  totalPago: number;
  totalPendente: number;
  passageiroPorOnibus: Record<string, PassageiroDisplay[]>;
  filters?: ReportFilters;
  passageirosFiltrados?: PassageiroDisplay[];
}

export const ViagemReport = React.forwardRef<HTMLDivElement, ViagemReportProps>(
  ({ 
    viagem, 
    passageiros, 
    onibusList, 
    totalArrecadado, 
    totalPago, 
    totalPendente, 
    passageiroPorOnibus, 
    filters,
    passageirosFiltrados
  }, ref) => {
    // Hook para dados da empresa
    const { empresa } = useEmpresa();
    
    // Usar passageiros filtrados se fornecidos, senão usar todos
    const passageirosParaExibir = passageirosFiltrados || passageiros;
    const dataFormatada = new Date(viagem.data_jogo).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const agora = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Estatísticas por setor (usando passageiros filtrados)
    const passageirosPorSetor = passageirosParaExibir.reduce((acc, p) => {
      const setor = p.setor_maracana || 'Não informado';
      acc[setor] = (acc[setor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calcular totais dos passageiros filtrados
    const totalArrecadadoFiltrado = passageirosFiltrados ? 
      passageirosFiltrados.reduce((total, p) => total + ((p.valor || 0) - (p.desconto || 0)), 0) :
      totalArrecadado;

    const totalPagoFiltrado = passageirosFiltrados ?
      passageirosFiltrados.reduce((total, p) => {
        const statusInteligente = converterStatusParaInteligente({
          valor: p.valor || 0,
          desconto: p.desconto || 0,
          parcelas: p.parcelas,
          status_pagamento: p.status_pagamento
        });
        return statusInteligente.status === 'Pago' ? total + ((p.valor || 0) - (p.desconto || 0)) : total;
      }, 0) :
      totalPago;

    const totalPendenteFiltrado = totalArrecadadoFiltrado - totalPagoFiltrado;

    return (
      <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto print-report">
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

          {/* Logos dos Times */}
          <div className="flex justify-center items-center gap-6 mb-4">
            {/* Logo do Flamengo */}
            <div className="flex flex-col items-center logo-container">
              <img 
                src={viagem.logo_flamengo || "https://logodetimes.com/times/flamengo/logo-flamengo-256.png"} 
                alt="Flamengo" 
                className="h-16 w-16 object-contain mb-2"
                onError={(e) => {
                  // Fallback para uma logo alternativa
                  const img = e.currentTarget;
                  if (img.src !== "https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png") {
                    img.src = "https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png";
                  } else {
                    // Se ainda assim falhar, mostrar um placeholder
                    img.style.display = 'none';
                    const parent = img.parentElement;
                    if (parent && !parent.querySelector('.logo-fallback')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'h-16 w-16 bg-red-600 rounded-full flex items-center justify-center mb-2 logo-fallback';
                      fallback.innerHTML = '<span class="text-white font-bold text-lg">FLA</span>';
                      parent.insertBefore(fallback, img);
                    }
                  }
                }}
              />
              <span className="text-sm font-medium text-red-600">FLAMENGO</span>
            </div>

            {/* VS */}
            <div className="text-2xl font-bold text-gray-400 mx-4">×</div>

            {/* Logo do Adversário */}
            <div className="flex flex-col items-center logo-container">
              {viagem.logo_adversario ? (
                <>
                  <img 
                    src={viagem.logo_adversario} 
                    alt={viagem.adversario} 
                    className="h-16 w-16 object-contain mb-2"
                    onError={(e) => {
                      // Fallback para texto se a imagem não carregar
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mb-2';
                        fallback.innerHTML = `<span class="text-gray-600 font-bold text-lg">${viagem.adversario.substring(0, 3).toUpperCase()}</span>`;
                        parent.insertBefore(fallback, e.currentTarget);
                      }
                    }}
                  />
                  <span className="text-sm font-medium text-gray-600">{viagem.adversario.toUpperCase()}</span>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                    <span className="text-gray-600 font-bold text-lg">
                      {viagem.adversario.substring(0, 3).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{viagem.adversario.toUpperCase()}</span>
                </>
              )}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-red-600 mb-4">RELATÓRIO DE VIAGEM</h1>
          
          {/* Nome do Jogo Centralizado */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h2 className="text-2xl font-bold text-red-700 text-center">
              FLAMENGO × {viagem.adversario.toUpperCase()}
            </h2>
          </div>
          
          {/* Informações da Viagem */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {viagem.data_saida && (
              <div className="text-center">
                <span className="font-medium text-gray-700">Data da Viagem:</span>
                <p className="text-gray-600">
                  {new Date(viagem.data_saida).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
            <div className="text-center">
              <span className="font-medium text-gray-700">Data do Jogo:</span>
              <p className="text-gray-600">{dataFormatada}</p>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <Badge className="bg-red-600 text-white px-6 py-2 text-sm font-medium">
              Status: {viagem.status_viagem}
            </Badge>
          </div>
        </div>

        {/* Informações Gerais */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3 text-lg">Informações da Viagem</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Empresa:</strong> {viagem.empresa}</p>
              <p><strong>Tipo de Ônibus:</strong> {viagem.tipo_onibus}</p>
              <p><strong>Capacidade Total:</strong> {viagem.capacidade_onibus} passageiros</p>
              {(!filters || filters.mostrarValorPadrao) && viagem.valor_padrao && (
                <p><strong>Valor Padrão:</strong> {formatCurrency(viagem.valor_padrao)}</p>
              )}
              {viagem.setor_padrao && (
                <p><strong>Setor Padrão:</strong> {viagem.setor_padrao}</p>
              )}
              
              {/* Informações sobre Passeios da Viagem */}
              {(viagem.viagem_passeios && viagem.viagem_passeios.length > 0) || (viagem.passeios_pagos && viagem.passeios_pagos.length > 0) ? (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <p><strong>Passeios da Viagem:</strong></p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {/* Sistema novo - viagem_passeios */}
                    {viagem.viagem_passeios && viagem.viagem_passeios.map((vp, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {vp.passeios.nome} ({formatCurrency(vp.passeios.valor)})
                      </span>
                    ))}
                    
                    {/* Sistema antigo - passeios_pagos */}
                    {viagem.passeios_pagos && viagem.passeios_pagos.map((passeio, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        {passeio}
                      </span>
                    ))}
                    
                    {/* Outro passeio */}
                    {viagem.outro_passeio && (
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                        {viagem.outro_passeio}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p><strong>Passeios:</strong> <span className="text-gray-500">Nenhum passeio configurado</span></p>
              )}
              
              {filters?.modoResponsavel && (
                <p className="text-orange-600 font-medium">📋 Lista para Responsável do Ônibus</p>
              )}
            </div>
          </div>

          {(!filters || (filters.incluirResumoFinanceiro && !filters.modoResponsavel)) && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3 text-lg">
                Resumo Financeiro
                {passageirosFiltrados && (
                  <span className="text-sm font-normal text-blue-600 ml-2">
                    (Filtrado: {passageirosParaExibir.length}/{passageiros.length})
                  </span>
                )}
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Total Arrecadado:</strong> <span className="text-green-600">{formatCurrency(totalArrecadadoFiltrado)}</span></p>
                <p><strong>Pagamentos Confirmados:</strong> <span className="text-green-600">{formatCurrency(totalPagoFiltrado)}</span></p>
                <p><strong>Pagamentos Pendentes:</strong> <span className="text-amber-600">{formatCurrency(totalPendenteFiltrado)}</span></p>
                <p><strong>Taxa de Pagamento:</strong> {totalArrecadadoFiltrado > 0 ? Math.round((totalPagoFiltrado / totalArrecadadoFiltrado) * 100) : 0}%</p>
                <p><strong>Total de Passageiros:</strong> {passageirosParaExibir.length}</p>
              </div>
            </div>
          )}
        </div>

        {/* Setores do Maracanã */}
        {(!filters || filters.incluirDistribuicaoSetor) && Object.keys(passageirosPorSetor).length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-4 text-lg">Distribuição por Setor do Maracanã</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(passageirosPorSetor).map(([setor, count]) => (
                <div key={setor} className="bg-gray-50 p-3 rounded border">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{setor}</span>
                    <span className="text-red-600 font-bold">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Ônibus */}
        {(!filters || filters.incluirListaOnibus) && onibusList.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-4 text-lg">Ônibus da Viagem</h3>
            <div className="space-y-4">
              {onibusList.map((onibus, index) => {
                // Filtrar passageiros do ônibus baseado nos filtros aplicados
                const passageirosOnibus = (passageiroPorOnibus[onibus.id] || [])
                  .filter(p => passageirosParaExibir.some(pf => pf.viagem_passageiro_id === p.viagem_passageiro_id));
                
                // Se não há filtros de ônibus específicos ou este ônibus está selecionado
                const shouldShowOnibus = !filters || 
                  filters.onibusIds.length === 0 || 
                  filters.onibusIds.includes(onibus.id);

                if (!shouldShowOnibus && passageirosOnibus.length === 0) {
                  return null;
                }

                return (
                  <div key={onibus.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">
                        Ônibus {index + 1} {onibus.numero_identificacao && `- ${onibus.numero_identificacao}`}
                      </h4>
                      <span className="text-sm text-gray-600">
                        {passageirosOnibus.length}/{onibus.capacidade_onibus} passageiros
                        {passageirosFiltrados && (
                          <span className="text-blue-600 ml-1">(filtrado)</span>
                        )}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      <p>{onibus.tipo_onibus} - {onibus.empresa}</p>
                    </div>
                    
                    {passageirosOnibus.length > 0 && (
                      <div className="mt-3">
                        <table className="w-full text-xs border">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border p-1 text-left">Nome</th>
                              <th className="border p-1 text-left">Telefone</th>
                              <th className="border p-1 text-left">Setor</th>
                              {(!filters || filters.mostrarNomesPasseios) && (
                                <th className="border p-1 text-left">Passeios</th>
                              )}
                              {(!filters || filters.mostrarValoresPassageiros) && (
                                <th className="border p-1 text-left">Valor</th>
                              )}
                              {(!filters || filters.mostrarStatusPagamento) && (
                                <th className="border p-1 text-left">Status</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {passageirosOnibus.map((passageiro) => (
                              <tr key={passageiro.viagem_passageiro_id}>
                                <td className="border p-1">{passageiro.nome}</td>
                                <td className="border p-1">{passageiro.telefone}</td>
                                <td className="border p-1">{passageiro.setor_maracana}</td>
                                {(!filters || filters.mostrarNomesPasseios) && (
                                  <td className="border p-1">
                                    {passageiro.passeios && passageiro.passeios.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {passageiro.passeios.map((pp, idx) => (
                                          <span key={idx} className={`text-xs px-1 py-0.5 rounded ${(pp.valor_cobrado || 0) > 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {pp.passeio_nome || pp.passeio?.nome}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                )}
                                {(!filters || filters.mostrarValoresPassageiros) && (
                                  <td className="border p-1">
                                    {formatCurrency((passageiro.valor || 0) - (passageiro.desconto || 0))}
                                  </td>
                                )}
                                {(!filters || filters.mostrarStatusPagamento) && (
                                  <td className="border p-1">
                                    {(() => {
                                      const statusInteligente = converterStatusParaInteligente({
                                        valor: passageiro.valor || 0,
                                        desconto: passageiro.desconto || 0,
                                        parcelas: passageiro.parcelas,
                                        status_pagamento: passageiro.status_pagamento
                                      });
                                      
                                      return (
                                        <span className={`px-1 py-0.5 rounded text-xs ${statusInteligente.cor}`} title={statusInteligente.descricao}>
                                          {statusInteligente.status}
                                        </span>
                                      );
                                    })()}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Passageiros não alocados */}
        {(!filters || filters.incluirPassageirosNaoAlocados) && passageiroPorOnibus.semOnibus?.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-4 text-lg">Passageiros Não Alocados</h3>
            <div className="border rounded-lg p-4">
              <table className="w-full text-xs border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-1 text-left">Nome</th>
                    <th className="border p-1 text-left">Telefone</th>
                    <th className="border p-1 text-left">Setor</th>
                    {(!filters || filters.mostrarNomesPasseios) && (
                      <th className="border p-1 text-left">Passeios</th>
                    )}
                    {(!filters || filters.mostrarValoresPassageiros) && (
                      <th className="border p-1 text-left">Valor</th>
                    )}
                    {(!filters || filters.mostrarStatusPagamento) && (
                      <th className="border p-1 text-left">Status</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {passageiroPorOnibus.semOnibus
                    .filter(p => passageirosParaExibir.some(pf => pf.viagem_passageiro_id === p.viagem_passageiro_id))
                    .map((passageiro) => (
                    <tr key={passageiro.viagem_passageiro_id}>
                      <td className="border p-1">{passageiro.nome}</td>
                      <td className="border p-1">{passageiro.telefone}</td>
                      <td className="border p-1">{passageiro.setor_maracana}</td>
                      {(!filters || filters.mostrarNomesPasseios) && (
                        <td className="border p-1">
                          {passageiro.passeios && passageiro.passeios.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {passageiro.passeios.map((pp, idx) => (
                                <span key={idx} className={`text-xs px-1 py-0.5 rounded ${(pp.valor_cobrado || 0) > 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {pp.passeio_nome || pp.passeio?.nome}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      )}
                      {(!filters || filters.mostrarValoresPassageiros) && (
                        <td className="border p-1">
                          {formatCurrency((passageiro.valor || 0) - (passageiro.desconto || 0))}
                        </td>
                      )}
                      {(!filters || filters.mostrarStatusPagamento) && (
                        <td className="border p-1">
                          {(() => {
                            const statusInteligente = converterStatusParaInteligente({
                              valor: passageiro.valor || 0,
                              desconto: passageiro.desconto || 0,
                              parcelas: passageiro.parcelas,
                              status_pagamento: passageiro.status_pagamento
                            });
                            
                            return (
                              <span className={`px-1 py-0.5 rounded text-xs ${statusInteligente.cor}`} title={statusInteligente.descricao}>
                                {statusInteligente.status}
                              </span>
                            );
                          })()}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div className="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-600">
          <div className="flex justify-center items-center gap-4 mb-3">
            {empresa?.logo_url ? (
              <img 
                src={empresa.logo_url} 
                alt={empresa.nome_fantasia || empresa.nome} 
                className="h-8 w-auto object-contain"
              />
            ) : (
              <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                {empresa?.nome_fantasia?.charAt(0) || empresa?.nome?.charAt(0) || 'N'}
              </div>
            )}
            <div className="text-left">
              <p className="font-semibold text-gray-700">
                {empresa?.nome_fantasia || empresa?.nome || 'Neto Tours Viagens'}
              </p>
              <p className="text-xs text-gray-500">Turismo e Eventos</p>
            </div>
          </div>
          <p>Relatório gerado em: {agora}</p>
          <p className="mt-1">Sistema de Gestão de Viagens - Flamengo</p>
        </div>

        {/* Estilos para impressão */}
        <style>{`
          @media print {
            .print-report {
              margin: 0;
              padding: 20px;
              box-shadow: none;
            }
            
            @page {
              margin: 1cm;
              size: A4;
              
              /* Cabeçalho em todas as páginas */
              @top-left {
                content: "${empresa?.nome_fantasia || empresa?.nome || 'Neto Tours Viagens'}";
                font-size: 10px;
                color: #666;
              }
              
              @top-center {
                content: "Flamengo x ${viagem.adversario}";
                font-size: 12px;
                font-weight: bold;
                color: #dc2626;
              }
              
              @top-right {
                content: "Página " counter(page) " de " counter(pages);
                font-size: 10px;
                color: #666;
              }
              
              /* Rodapé em todas as páginas */
              @bottom-center {
                content: "Relatório gerado em ${agora} - Sistema de Gestão de Viagens";
                font-size: 9px;
                color: #666;
                text-align: center;
              }
            }
            
            .print-report table {
              page-break-inside: auto;
            }
            
            .print-report tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            
            .print-report thead {
              display: table-header-group;
            }
            
            .print-report .break-before {
              page-break-before: always;
            }

            /* Garantir que as logos apareçam na impressão */
            .print-report img {
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
              print-color-adjust: exact;
            }

            /* Melhorar a qualidade das logos na impressão */
            .print-report .logo-container img {
              max-width: 64px;
              max-height: 64px;
              image-rendering: -webkit-optimize-contrast;
              image-rendering: crisp-edges;
            }

            /* Ocultar rodapé manual na impressão já que temos o automático */
            .manual-footer {
              display: none;
            }
          }
        `}</style>
      </div>
    );
  }
);

ViagemReport.displayName = 'ViagemReport';
