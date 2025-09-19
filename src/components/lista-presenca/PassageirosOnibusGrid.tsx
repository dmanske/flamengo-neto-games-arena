import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserCheck, UserX, MapPin, Ticket, Phone, Loader2 } from 'lucide-react';
import { PassageiroOnibus } from '@/hooks/useListaPresencaOnibus';
import { formatCPF, formatPhone } from '@/utils/formatters';

interface PassageirosOnibusGridProps {
  passageiros: PassageiroOnibus[];
  onTogglePresenca: (viagemPassageiroId: string, statusAtual: string) => Promise<void>;
  atualizandoPresenca: Set<string>;
  viagemEmAndamento?: boolean;
}

export const PassageirosOnibusGrid: React.FC<PassageirosOnibusGridProps> = ({
  passageiros,
  onTogglePresenca,
  atualizandoPresenca,
  viagemEmAndamento = true
}) => {
  // Função para calcular informações financeiras do passageiro
  const getInfoFinanceira = (passageiro: PassageiroOnibus) => {
    const valorViagem = (passageiro.valor || 0) - (passageiro.desconto || 0);
    const valorPasseios = (passageiro.passeios || []).reduce((sum, passeio) => {
      return sum + (passeio.valor_cobrado || 0);
    }, 0);
    const valorTotal = valorViagem + valorPasseios;

    // Calcular valores pagos por categoria usando historico_pagamentos_categorizado
    const historico = passageiro.historico_pagamentos || [];
    
    let pagoViagem = historico
      .filter(h => h.categoria === 'viagem' || h.categoria === 'ambos')
      .reduce((sum, h) => sum + h.valor_pago, 0);
    
    let pagoPasseios = historico
      .filter(h => h.categoria === 'passeios' || h.categoria === 'ambos')
      .reduce((sum, h) => sum + h.valor_pago, 0);

    // Considerar pagamento via crédito
    if (passageiro.pago_por_credito && passageiro.valor_credito_utilizado) {
      const valorCredito = passageiro.valor_credito_utilizado;
      
      if (valorCredito >= valorViagem) {
        pagoViagem = valorViagem;
        const creditoSobrando = valorCredito - valorViagem;
        if (creditoSobrando > 0) {
          pagoPasseios += Math.min(creditoSobrando, valorPasseios);
        }
      } else {
        pagoViagem += valorCredito;
      }
    }

    const totalPago = pagoViagem + pagoPasseios;
    const pendenteViagem = Math.max(0, valorViagem - pagoViagem);
    const pendentePasseios = Math.max(0, valorPasseios - pagoPasseios);
    const totalPendente = pendenteViagem + pendentePasseios;

    // Verificar se é brinde
    const ehBrinde = valorTotal === 0;

    if (ehBrinde) {
      return {
        status: 'brinde',
        texto: '🎁 Cortesia',
        cor: 'text-purple-600 bg-purple-50 border-purple-200'
      };
    }

    const foiPagoViaCredito = passageiro.pago_por_credito && passageiro.valor_credito_utilizado > 0;
    const sufixoCredito = foiPagoViaCredito ? ' (via Crédito)' : '';
    
    if (totalPendente <= 0.01) {
      return {
        status: 'pago',
        texto: `✅ Pago Completo${sufixoCredito}`,
        cor: foiPagoViaCredito ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-green-600 bg-green-50 border-green-200'
      };
    } else if (pendenteViagem <= 0.01 && pendentePasseios > 0.01) {
      return {
        status: 'parcial',
        texto: `🎫 Viagem Paga${sufixoCredito} - Passeios: R$ ${pendentePasseios.toFixed(2)}`,
        cor: 'text-blue-600 bg-blue-50 border-blue-200'
      };
    } else if (pendentePasseios <= 0.01 && pendenteViagem > 0.01) {
      return {
        status: 'parcial',
        texto: `🎢 Passeios Pagos${sufixoCredito} - Viagem: R$ ${pendenteViagem.toFixed(2)}`,
        cor: 'text-blue-600 bg-blue-50 border-blue-200'
      };
    } else if (totalPago > 0.01) {
      const textoCredito = foiPagoViaCredito ? ` (R$ ${passageiro.valor_credito_utilizado.toFixed(2)} via Crédito)` : '';
      return {
        status: 'parcial',
        texto: `💳 Pago: R$ ${totalPago.toFixed(2)}${textoCredito} - Pendente: R$ ${totalPendente.toFixed(2)}`,
        cor: 'text-orange-600 bg-orange-50 border-orange-200'
      };
    } else {
      if (foiPagoViaCredito) {
        return {
          status: 'parcial',
          texto: `💳 Crédito: R$ ${passageiro.valor_credito_utilizado.toFixed(2)} - Pendente: R$ ${totalPendente.toFixed(2)}`,
          cor: 'text-blue-600 bg-blue-50 border-blue-200'
        };
      } else {
        return {
          status: 'pendente',
          texto: `⚠️ Pendente: R$ ${totalPendente.toFixed(2)}`,
          cor: 'text-red-600 bg-red-50 border-red-200'
        };
      }
    }
  };

  if (passageiros.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🚌</div>
          <h3 className="text-xl font-semibold mb-2">Nenhum passageiro alocado</h3>
          <p className="text-muted-foreground">
            Este ônibus ainda não possui passageiros alocados.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Agrupar passageiros por cidade de embarque
  const passageirosPorCidade = passageiros.reduce((acc, passageiro) => {
    const cidade = passageiro.cidade_embarque || 'Não especificada';
    if (!acc[cidade]) {
      acc[cidade] = [];
    }
    acc[cidade].push(passageiro);
    return acc;
  }, {} as Record<string, PassageiroOnibus[]>);

  const cidades = Object.keys(passageirosPorCidade).sort();

  return (
    <div className="space-y-6">
      {cidades.map(cidade => (
        <Card key={cidade}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" />
              {cidade}
              <Badge variant="outline" className="ml-2">
                {passageirosPorCidade[cidade].length} passageiros
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {passageirosPorCidade[cidade]
                .sort((a, b) => a.nome.localeCompare(b.nome))
                .map((passageiro) => {
                  const infoFinanceira = getInfoFinanceira(passageiro);
                  const isAtualizando = atualizandoPresenca.has(passageiro.viagem_passageiro_id);
                  
                  return (
                    <Card 
                      key={passageiro.viagem_passageiro_id}
                      className={`transition-all duration-200 ${
                        passageiro.status_presenca === 'presente' 
                          ? 'border-green-300 bg-green-50' 
                          : passageiro.status_presenca === 'ausente'
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200'
                      } ${passageiro.is_responsavel_onibus ? 'ring-2 ring-blue-300' : ''} ${
                        viagemEmAndamento ? 'cursor-pointer hover:shadow-md' : ''
                      }`}
                      onClick={viagemEmAndamento && !isAtualizando ? () => {
                        const novoStatus = passageiro.status_presenca === 'presente' ? 'pendente' : 'presente';
                        onTogglePresenca(passageiro.viagem_passageiro_id, novoStatus);
                      } : undefined}
                    >
                      <CardContent className="p-4">
                        {/* Cabeçalho do Card */}
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={passageiro.foto} alt={passageiro.nome} />
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                              {passageiro.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-sm truncate">
                                {passageiro.nome}
                              </h3>
                              {passageiro.is_responsavel_onibus && (
                                <Badge className="bg-blue-600 text-white text-xs">
                                  Responsável
                                </Badge>
                              )}
                            </div>
                            
                            <div className="space-y-1 text-xs text-muted-foreground">
                              {passageiro.telefone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{formatPhone(passageiro.telefone)}</span>
                                </div>
                              )}
                              {passageiro.cpf && (
                                <div>CPF: {formatCPF(passageiro.cpf)}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Informações do Setor */}
                        <div className="mb-3">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Ticket className="h-3 w-3" />
                            <span>{passageiro.setor_maracana}</span>
                          </div>
                        </div>

                        {/* Status Financeiro */}
                        <div className="mb-3">
                          <Badge 
                            className={`text-xs w-full justify-center py-1 ${infoFinanceira.cor}`}
                            variant="outline"
                          >
                            {infoFinanceira.texto}
                          </Badge>
                        </div>

                        {/* Passeios */}
                        {passageiro.passeios && passageiro.passeios.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs text-muted-foreground mb-1">Passeios:</div>
                            <div className="flex flex-wrap gap-1">
                              {passageiro.passeios.map((passeio, index) => (
                                <Badge
                                  key={index}
                                  className={`text-xs ${
                                    (passeio.valor_cobrado || 0) > 0
                                      ? 'bg-green-100 text-green-700 border-green-300'
                                      : 'bg-blue-100 text-blue-700 border-blue-300'
                                  }`}
                                  variant="outline"
                                >
                                  {passeio.passeio_nome}
                                  {(passeio.valor_cobrado || 0) === 0 && ' 🎁'}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Status de Presença - Visual apenas, clique é no card inteiro */}
                        <div className={`p-2 rounded text-center text-sm font-medium ${
                          isAtualizando 
                            ? 'bg-gray-100 text-gray-500'
                            : passageiro.status_presenca === 'presente'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isAtualizando ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Atualizando...
                            </div>
                          ) : passageiro.status_presenca === 'presente' ? (
                            <div className="flex items-center justify-center gap-2">
                              <UserCheck className="h-4 w-4" />
                              Presente
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <UserX className="h-4 w-4" />
                              Pendente
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};