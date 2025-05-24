
import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { PassageiroDisplay } from '@/hooks/useViagemDetails';
import { Badge } from '@/components/ui/badge';

interface Viagem {
  id: string;
  adversario: string;
  data_jogo: string;
  tipo_onibus: string;
  empresa: string;
  rota: string;
  capacidade_onibus: number;
  status_viagem: string;
  valor_padrao: number | null;
  setor_padrao: string | null;
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
}

export const ViagemReport = React.forwardRef<HTMLDivElement, ViagemReportProps>(
  ({ viagem, passageiros, onibusList, totalArrecadado, totalPago, totalPendente, passageiroPorOnibus }, ref) => {
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

    // Estatísticas do Cristo Redentor
    const passageirosSim = passageiros.filter(p => p.passeio_cristo === 'sim');
    const passageirosNao = passageiros.filter(p => p.passeio_cristo === 'nao');

    // Estatísticas por setor
    const passageirosPorSetor = passageiros.reduce((acc, p) => {
      const setor = p.setor_maracana || 'Não informado';
      acc[setor] = (acc[setor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto print-report">
        {/* Cabeçalho */}
        <div className="text-center mb-8 border-b-2 border-red-600 pb-6">
          <h1 className="text-3xl font-bold text-red-600 mb-2">RELATÓRIO DE VIAGEM</h1>
          <h2 className="text-xl font-semibold text-gray-800">Flamengo x {viagem.adversario}</h2>
          <p className="text-gray-600 mt-2">Data do Jogo: {dataFormatada}</p>
          <div className="mt-4">
            <Badge className="bg-red-600 text-white px-4 py-1 text-sm">
              Status: {viagem.status_viagem}
            </Badge>
          </div>
        </div>

        {/* Informações Gerais */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3 text-lg">Informações da Viagem</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Rota:</strong> {viagem.rota}</p>
              <p><strong>Empresa:</strong> {viagem.empresa}</p>
              <p><strong>Tipo de Ônibus:</strong> {viagem.tipo_onibus}</p>
              <p><strong>Capacidade Total:</strong> {viagem.capacidade_onibus} passageiros</p>
              {viagem.valor_padrao && (
                <p><strong>Valor Padrão:</strong> {formatCurrency(viagem.valor_padrao)}</p>
              )}
              {viagem.setor_padrao && (
                <p><strong>Setor Padrão:</strong> {viagem.setor_padrao}</p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3 text-lg">Resumo Financeiro</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Total Arrecadado:</strong> <span className="text-green-600">{formatCurrency(totalArrecadado)}</span></p>
              <p><strong>Pagamentos Confirmados:</strong> <span className="text-green-600">{formatCurrency(totalPago)}</span></p>
              <p><strong>Pagamentos Pendentes:</strong> <span className="text-amber-600">{formatCurrency(totalPendente)}</span></p>
              <p><strong>Taxa de Pagamento:</strong> {totalArrecadado > 0 ? Math.round((totalPago / totalArrecadado) * 100) : 0}%</p>
              <p><strong>Total de Passageiros:</strong> {passageiros.length}</p>
            </div>
          </div>
        </div>

        {/* Estatísticas do Cristo Redentor */}
        {(passageirosSim.length > 0 || passageirosNao.length > 0) && (
          <div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-4 text-lg">Passeio Cristo Redentor</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-700 mb-2">Confirmaram o Passeio</h4>
                <p className="text-2xl font-bold text-green-600">{passageirosSim.length}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-700 mb-2">Não Farão o Passeio</h4>
                <p className="text-2xl font-bold text-red-600">{passageirosNao.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Setores do Maracanã */}
        {Object.keys(passageirosPorSetor).length > 0 && (
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
        {onibusList.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-4 text-lg">Ônibus da Viagem</h3>
            <div className="space-y-4">
              {onibusList.map((onibus, index) => {
                const passageirosOnibus = passageiroPorOnibus[onibus.id] || [];
                return (
                  <div key={onibus.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">
                        Ônibus {index + 1} {onibus.numero_identificacao && `- ${onibus.numero_identificacao}`}
                      </h4>
                      <span className="text-sm text-gray-600">
                        {passageirosOnibus.length}/{onibus.capacidade_onibus} passageiros
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
                              <th className="border p-1 text-left">Valor</th>
                              <th className="border p-1 text-left">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {passageirosOnibus.map((passageiro) => (
                              <tr key={passageiro.viagem_passageiro_id}>
                                <td className="border p-1">{passageiro.nome}</td>
                                <td className="border p-1">{passageiro.telefone}</td>
                                <td className="border p-1">{passageiro.setor_maracana}</td>
                                <td className="border p-1">
                                  {formatCurrency((passageiro.valor || 0) - (passageiro.desconto || 0))}
                                </td>
                                <td className="border p-1">
                                  <span className={`px-1 py-0.5 rounded text-xs ${
                                    passageiro.status_pagamento === "Pago" 
                                      ? "bg-green-100 text-green-800" 
                                      : "bg-amber-100 text-amber-800"
                                  }`}>
                                    {passageiro.status_pagamento}
                                  </span>
                                </td>
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
        {passageiroPorOnibus.semOnibus?.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-4 text-lg">Passageiros Não Alocados</h3>
            <div className="border rounded-lg p-4">
              <table className="w-full text-xs border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-1 text-left">Nome</th>
                    <th className="border p-1 text-left">Telefone</th>
                    <th className="border p-1 text-left">Setor</th>
                    <th className="border p-1 text-left">Valor</th>
                    <th className="border p-1 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {passageiroPorOnibus.semOnibus.map((passageiro) => (
                    <tr key={passageiro.viagem_passageiro_id}>
                      <td className="border p-1">{passageiro.nome}</td>
                      <td className="border p-1">{passageiro.telefone}</td>
                      <td className="border p-1">{passageiro.setor_maracana}</td>
                      <td className="border p-1">
                        {formatCurrency((passageiro.valor || 0) - (passageiro.desconto || 0))}
                      </td>
                      <td className="border p-1">
                        <span className={`px-1 py-0.5 rounded text-xs ${
                          passageiro.status_pagamento === "Pago" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {passageiro.status_pagamento}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div className="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-600">
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
          }
        `}</style>
      </div>
    );
  }
);

ViagemReport.displayName = 'ViagemReport';
