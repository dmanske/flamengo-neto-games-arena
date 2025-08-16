import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { PassageiroDisplay } from '@/hooks/useViagemDetails';
import { Badge } from '@/components/ui/badge';
import { converterStatusParaInteligente } from '@/lib/status-utils';
import { ReportFilters } from '@/types/report-filters';
import { useEmpresa } from '@/hooks/useEmpresa';
import { supabase } from '@/lib/supabase';
import { formatCPF, formatBirthDate, formatPhone } from '@/utils/formatters';

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
  foto_url?: string | null;
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
    
    // Estado para armazenar as imagens dos ônibus
    const [busImages, setBusImages] = React.useState<Record<string, string>>({});

    // Carregar imagens dos ônibus
    React.useEffect(() => {
      const loadBusImages = async () => {
        try {
          const { data, error } = await supabase
            .from("onibus_images")
            .select("tipo_onibus, image_url");
          
          if (error) throw error;
          
          if (data && data.length > 0) {
            const images: Record<string, string> = {};
            data.forEach(item => {
              if (item.image_url) {
                images[item.tipo_onibus] = item.image_url;
              }
            });
            
            setBusImages(images);
          }
        } catch (error) {
          console.error("Erro ao carregar imagens dos ônibus:", error);
        }
      };

      if (filters?.mostrarFotoOnibus) {
        loadBusImages();
      }
    }, [filters?.mostrarFotoOnibus]);
    
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

    // Contador global para numeração dos passageiros
    let contadorGlobalPassageiros = 0;

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

          <h1 className="text-3xl font-bold text-red-600 mb-4">RELATÓRIO DE VIAGEM</h1>
          
          {/* Informações da Viagem */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h2 className="text-2xl font-bold text-red-700 text-center">
              FLAMENGO × {viagem.adversario.toUpperCase()}
            </h2>
          </div>

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
              {viagem.status_viagem}
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
              
              {filters?.modoResponsavel && (
                <p className="text-orange-600 font-medium">📋 Lista para Responsável do Ônibus</p>
              )}
              {filters?.modoPassageiro && (
                <p className="text-blue-600 font-medium">👥 Lista para Passageiros</p>
              )}
            </div>
          </div>

          {(!filters || filters.incluirResumoFinanceiro) && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3 text-lg">
                Resumo Financeiro
                {passageirosFiltrados && (
                  <span className="text-sm font-normal text-blue-600 ml-2">
                    (filtrado)
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

        {/* Distribuição por Setor */}
        {(!filters || filters.incluirDistribuicaoSetor) && !filters?.modoEmpresaOnibus && (
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
          <div className="mb-8 page-break-before">
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
                  <div key={onibus.id} className={`border rounded-lg p-4 onibus-section ${index > 0 ? 'page-break-before' : ''}`}>
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
                              {filters?.mostrarNumeroPassageiro && (
                                <th className="border p-1 text-center w-12">#</th>
                              )}
                              <th className="border p-1 text-left">Nome</th>
                              {(filters?.modoEmpresaOnibus || filters?.modoResponsavel) && (
                                <th className="border p-1 text-center">CPF</th>
                              )}
                              {(filters?.modoEmpresaOnibus || filters?.modoResponsavel) && (
                                <th className="border p-1 text-center">Data Nasc.</th>
                              )}
                              {(!filters || filters.mostrarTelefone) && !filters?.modoEmpresaOnibus && (
                                <th className="border p-1 text-left">Telefone</th>
                              )}
                              {(filters?.modoEmpresaOnibus || filters?.modoResponsavel) && (
                                <th className="border p-1 text-left">Local Embarque</th>
                              )}
                              {filters?.modoPassageiro && !filters?.modoEmpresaOnibus && (
                                <th className="border p-1 text-left">Cidade</th>
                              )}
                              {!filters?.modoEmpresaOnibus && (
                                <th className="border p-1 text-left">Setor</th>
                              )}
                              {(!filters || filters.mostrarNomesPasseios) && !filters?.modoEmpresaOnibus && (
                                <th className="border p-1 text-left">Passeios</th>
                              )}
                              {(!filters || filters.mostrarValoresPassageiros) && !filters?.modoEmpresaOnibus && (
                                <th className="border p-1 text-left">Valor</th>
                              )}
                              {(!filters || filters.mostrarStatusPagamento) && !filters?.modoEmpresaOnibus && (
                                <th className="border p-1 text-left">Status</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {passageirosOnibus.map((passageiro, localIndex) => {
                              contadorGlobalPassageiros++;
                              return (
                                <tr key={passageiro.viagem_passageiro_id}>
                                  {filters?.mostrarNumeroPassageiro && (
                                    <td className="border p-1 text-center font-medium">{contadorGlobalPassageiros}</td>
                                  )}
                                  <td className="border p-1">{passageiro.nome}</td>
                                  {(filters?.modoEmpresaOnibus || filters?.modoResponsavel) && (
                                    <td className="border p-1 text-center">
                                      {passageiro.cpf ? formatCPF(passageiro.cpf) : '-'}
                                    </td>
                                  )}
                                  {(filters?.modoEmpresaOnibus || filters?.modoResponsavel) && (
                                    <td className="border p-1 text-center">
                                      {passageiro.data_nascimento 
                                        ? formatBirthDate(passageiro.data_nascimento)
                                        : '-'
                                      }
                                    </td>
                                  )}
                                  {(!filters || filters.mostrarTelefone) && !filters?.modoEmpresaOnibus && (
                                    <td className="border p-1">
                                      {passageiro.telefone ? formatPhone(passageiro.telefone) : '-'}
                                    </td>
                                  )}
                                  {(filters?.modoEmpresaOnibus || filters?.modoResponsavel) && (
                                    <td className="border p-1">{passageiro.cidade_embarque || passageiro.cidade || '-'}</td>
                                  )}
                                  {filters?.modoPassageiro && !filters?.modoEmpresaOnibus && (
                                    <td className="border p-1">{passageiro.cidade_embarque || passageiro.cidade || '-'}</td>
                                  )}
                                  {!filters?.modoEmpresaOnibus && (
                                    <td className="border p-1">{passageiro.setor_maracana}</td>
                                  )}
                                  {(!filters || filters.mostrarNomesPasseios) && !filters?.modoEmpresaOnibus && (
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
                                  {(!filters || filters.mostrarValoresPassageiros) && !filters?.modoEmpresaOnibus && (
                                    <td className="border p-1">
                                      {formatCurrency((passageiro.valor || 0) - (passageiro.desconto || 0))}
                                    </td>
                                  )}
                                  {(!filters || filters.mostrarStatusPagamento) && !filters?.modoEmpresaOnibus && (
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
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    {/* Foto do Ônibus - Modo Passageiro */}
                    {filters?.mostrarFotoOnibus && busImages[onibus.tipo_onibus] && (
                      <div className="mt-4 text-center foto-onibus-container">
                        <img 
                          src={busImages[onibus.tipo_onibus]} 
                          alt={`Ônibus ${index + 1} - ${onibus.tipo_onibus}`}
                          className="max-w-full h-32 object-contain mx-auto rounded-lg border foto-onibus"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Ônibus {index + 1} - {onibus.tipo_onibus}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Passageiros Não Alocados */}
        {(!filters || filters.incluirPassageirosNaoAlocados) && passageiroPorOnibus.semOnibus && passageiroPorOnibus.semOnibus.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-4 text-lg">Passageiros Não Alocados</h3>
            <div className="border rounded-lg p-4">
              <table className="w-full text-xs border">
                <thead className="bg-gray-100">
                  <tr>
                    {filters?.mostrarNumeroPassageiro && (
                      <th className="border p-1 text-center w-12">#</th>
                    )}
                    <th className="border p-1 text-left">Nome</th>
                    {(!filters || filters.mostrarTelefone) && (
                      <th className="border p-1 text-left">Telefone</th>
                    )}
                    {filters?.modoPassageiro && (
                      <th className="border p-1 text-left">Cidade</th>
                    )}
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
                    .map((passageiro, index) => {
                      contadorGlobalPassageiros++;
                      return (
                        <tr key={passageiro.viagem_passageiro_id}>
                          {filters?.mostrarNumeroPassageiro && (
                            <td className="border p-1 text-center font-medium">{contadorGlobalPassageiros}</td>
                          )}
                          <td className="border p-1">{passageiro.nome}</td>
                          {(!filters || filters.mostrarTelefone) && (
                            <td className="border p-1">{passageiro.telefone}</td>
                          )}
                          {filters?.modoPassageiro && (
                            <td className="border p-1">{passageiro.cidade_embarque || passageiro.cidade || '-'}</td>
                          )}
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
                      );
                    })}
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
          <p className="mt-1">Sistema de Gestão de Viagens - Flamengo</p>
        </div>

        <style>{`
          @media print {
            .print-report {
              font-size: 12px;
            }
            
            /* Controle de quebra de páginas */
            .page-break-before {
              page-break-before: always;
            }
            
            .page-break-after {
              page-break-after: always;
            }
            
            .page-break-avoid {
              page-break-inside: avoid;
            }
            
            /* Seção de ônibus - cada ônibus em página nova (exceto o primeiro) */
            .onibus-section {
              page-break-inside: avoid;
            }
            
            /* Foto do ônibus - nunca cortar */
            .foto-onibus-container {
              page-break-inside: avoid;
              page-break-before: avoid;
              margin-top: 1rem;
            }
            
            .foto-onibus {
              page-break-inside: avoid;
            }
            
            /* Tabelas */
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
            
            .print-report tbody {
              display: table-row-group;
            }
            
            /* Cabeçalho da tabela sempre junto com pelo menos uma linha */
            .print-report thead tr {
              page-break-after: avoid;
            }
            
            /* Evitar órfãos e viúvas */
            .print-report {
              orphans: 3;
              widows: 3;
            }
            
            /* Títulos sempre com conteúdo */
            .print-report h3, .print-report h4 {
              page-break-after: avoid;
            }
          }
        `}</style>
      </div>
    );
  }
);

ViagemReport.displayName = 'ViagemReport';