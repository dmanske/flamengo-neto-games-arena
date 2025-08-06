import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { converterStatusParaInteligente } from "@/lib/status-utils";
import { StatusBadgeAvancado } from "./StatusBadgeAvancado";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, MapPin, CreditCard, Phone, Mail, Calendar, CheckCircle, XCircle, Clock, DollarSign, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBirthDate, formatPhone, formatCPF } from "@/utils/formatters";
import { formatCEP, capitalizeWords } from "@/utils/cepUtils";
import { usePasseios } from "@/hooks/usePasseios";
import { formatCurrency } from "@/lib/utils";
// ControleFinanceiroAvancado removido - usando apenas Resumo Financeiro compacto
import { usePagamentosSeparados } from "@/hooks/usePagamentosSeparados";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

interface PassageiroDetails {
  viagem_passageiro_id: string;
  nome: string;
  telefone: string;
  email: string;
  cpf: string;
  cidade: string;
  estado: string;
  endereco: string;
  numero: string;
  bairro: string;
  cep: string;
  complemento?: string;
  data_nascimento?: string;
  setor_maracana: string;
  status_pagamento: string;
  forma_pagamento: string;
  valor: number;
  desconto: number;
  parcelas?: Array<{
    id: string;
    valor_parcela: number;
    forma_pagamento: string;
    data_pagamento: string;
    observacoes?: string;
  }>;
  passeios?: Array<{
    passeio_nome: string;
    status: string;
  }>;
  foto?: string;
}

interface PassageiroDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passageiro: PassageiroDetails | null;
  onSuccess?: () => void; // Callback para quando houver mudanças nos dados
}

export function PassageiroDetailsDialog({
  open,
  onOpenChange,
  passageiro,
  onSuccess,
}: PassageiroDetailsDialogProps) {
  const { passeios } = usePasseios();
  
  // Usar sistema novo de pagamentos separados - só chama se passageiro existe
  const {
    breakdown,
    historicoPagamentos,
    loading: loadingPagamentos,
    obterStatusAtual
  } = usePagamentosSeparados(passageiro?.viagem_passageiro_id || undefined);
  
  if (!passageiro) return null;

  // Usar dados do sistema novo se disponível, senão fallback para sistema antigo
  const valorViagem = breakdown?.valor_viagem || (passageiro.valor - passageiro.desconto);
  const valorPasseios = breakdown?.valor_passeios || 0;
  const valorTotal = valorViagem + valorPasseios;
  const valorPago = breakdown?.pago_total || 0;
  const valorPendente = breakdown?.pendente_total || (valorTotal - valorPago);

  // Status usando sistema novo (mesmo da lista e modal de edição)
  const statusAvancado = breakdown && obterStatusAtual ? obterStatusAtual() : 'Pendente';

  // Passeios selecionados usando dados corretos
  const passeiosSelecionados = passageiro.passeios || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar */}
            <div className="relative">
              {passageiro.foto ? (
                <img 
                  src={passageiro.foto} 
                  alt={passageiro.nome} 
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg" 
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white border-4 border-white shadow-lg text-xl font-bold">
                  {passageiro.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
              )}
              {/* Status Indicator */}
              <div className="absolute -bottom-1 -right-1">
                {statusAvancado === 'Pago Completo' || statusAvancado === 'Brinde' ? (
                  <CheckCircle className="h-6 w-6 text-green-500 bg-white rounded-full" />
                ) : statusAvancado === 'Pendente' ? (
                  <Clock className="h-6 w-6 text-yellow-500 bg-white rounded-full" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500 bg-white rounded-full" />
                )}
              </div>
            </div>
            
            {/* Nome e Status */}
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-1">
                {passageiro.nome}
              </DialogTitle>
              <div className="flex items-center gap-3 mb-2">
                <StatusBadgeAvancado 
                  status={statusAvancado}
                  size="md"
                />
                <span className="text-sm text-gray-600">
                  {passageiro.cidade}, {passageiro.estado}
                </span>
              </div>
              {/* Botão WhatsApp - Desabilitado temporariamente */}
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  variant="outline"
                  disabled
                  className="opacity-50 cursor-not-allowed"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat (Em breve)
                </Button>
                <span className="text-xs text-gray-500 self-center ml-2">
                  💬 Disponível na lista de passageiros
                </span>
              </div>
            </div>
            
            {/* Valor Total */}
            <div className="text-right">
              <div className="text-sm text-gray-600">Valor Total</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(valorTotal)}
              </div>
              {breakdown && (
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Viagem: {formatCurrency(valorViagem)}</div>
                  <div>Passeios: {formatCurrency(valorPasseios)}</div>
                </div>
              )}
            </div>
          </div>
          
          <DialogDescription className="text-gray-600">
            Informações completas do passageiro, detalhes financeiros e passeios selecionados
          </DialogDescription>
        </DialogHeader>

        {/* Cards de Resumo Rápido */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">{formatCurrency(valorPago)}</div>
              <div className="text-sm text-blue-600">Valor Pago</div>
              {breakdown && (
                <div className="text-xs text-gray-500 mt-1">
                  V: {formatCurrency(breakdown.pago_viagem)} | P: {formatCurrency(breakdown.pago_passeios)}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-700">{formatCurrency(valorPendente)}</div>
              <div className="text-sm text-amber-600">Pendente</div>
              {breakdown && (
                <div className="text-xs text-gray-500 mt-1">
                  V: {formatCurrency(breakdown.pendente_viagem)} | P: {formatCurrency(breakdown.pendente_passeios)}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
              <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">{passeiosSelecionados.length}</div>
              <div className="text-sm text-green-600">Passeios</div>
              {valorPasseios > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {formatCurrency(valorPasseios)}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <User className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">{passageiro.setor_maracana}</div>
              <div className="text-sm text-purple-600">Setor</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna da Esquerda */}
          <div className="space-y-6">
            {/* Informações Pessoais */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">CPF</label>
                    <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                      {formatCPF(passageiro.cpf) || 'Não informado'}
                    </p>
                  </div>
                  {passageiro.data_nascimento && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-600">Data de Nascimento</label>
                      <p className="text-sm bg-gray-50 p-2 rounded flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {formatBirthDate(passageiro.data_nascimento)}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">Telefone</label>
                    <p className="text-sm bg-gray-50 p-2 rounded flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      {formatPhone(passageiro.telefone)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm bg-gray-50 p-2 rounded flex items-center gap-2 break-all">
                      <Mail className="h-4 w-4 text-gray-500" />
                      {passageiro.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço Completo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Logradouro</label>
                  <p className="text-sm bg-gray-50 p-3 rounded">
                    {capitalizeWords(passageiro.endereco)}, {passageiro.numero}
                    {passageiro.complemento && ` - ${capitalizeWords(passageiro.complemento)}`}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">Bairro</label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{capitalizeWords(passageiro.bairro)}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">Cidade</label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{capitalizeWords(passageiro.cidade)}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">Estado</label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{passageiro.estado?.toUpperCase()}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">CEP</label>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded">{formatCEP(passageiro.cep)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna da Direita */}
          <div className="space-y-6">
            {/* Passeios Selecionados */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Passeios Selecionados
                </CardTitle>
                <CardDescription className="text-purple-100">
                  {passeiosSelecionados.length} passeio(s) selecionado(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {passeiosSelecionados.length > 0 ? (
                  <div className="space-y-3">
                    {passeiosSelecionados.map((pp, index) => {
                      const passeio = passeios.find(p => p.nome === pp.passeio_nome);
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                              <MapPin className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{pp.passeio_nome}</p>
                              <p className="text-xs text-gray-600">Status: {pp.status}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {passeio?.valor ? (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                {formatCurrency(passeio.valor)}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Incluso</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {valorPasseios > 0 && (
                      <div className="pt-3 border-t border-purple-200">
                        <div className="flex justify-between items-center font-semibold text-purple-700">
                          <span>Total Passeios:</span>
                          <span className="text-lg">{formatCurrency(valorPasseios)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhum passeio selecionado</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detalhes Financeiros */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Resumo Financeiro
                </CardTitle>
                <CardDescription className="text-emerald-100">
                  Breakdown completo dos valores
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {/* Layout compacto em 2 colunas */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Coluna Esquerda - Composição */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Composição</div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Viagem:</span>
                        <span className="font-medium">{formatCurrency(valorViagem)}</span>
                      </div>
                      {valorPasseios > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Passeios:</span>
                          <span className="font-medium text-purple-600">+{formatCurrency(valorPasseios)}</span>
                        </div>
                      )}
                      {passageiro.desconto > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Desconto:</span>
                          <span className="font-medium text-orange-600">-{formatCurrency(passageiro.desconto)}</span>
                        </div>
                      )}
                      <div className="border-t pt-1 mt-2">
                        <div className="flex justify-between items-center font-semibold">
                          <span>Total:</span>
                          <span className="text-lg text-blue-600">{formatCurrency(valorTotal)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coluna Direita - Status */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Status</div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Pago:</span>
                        <span className="font-medium text-green-600">{formatCurrency(valorPago)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Pendente:</span>
                        <span className="font-medium text-red-600">{formatCurrency(valorPendente)}</span>
                      </div>
                      {breakdown && (
                        <div className="text-xs text-gray-500 mt-2 space-y-0.5">
                          <div>V: {formatCurrency(breakdown.pago_viagem)} / {formatCurrency(breakdown.pendente_viagem)}</div>
                          <div>P: {formatCurrency(breakdown.pago_passeios)} / {formatCurrency(breakdown.pendente_passeios)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Histórico de Parcelas */}
                {passageiro.parcelas && passageiro.parcelas.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Histórico de Pagamentos ({passageiro.parcelas.length})
                      </h4>
                      <div className="space-y-3">
                        {passageiro.parcelas.map((parcela, index) => (
                          <div key={parcela.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Parcela {index + 1}</p>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {parcela.data_pagamento && !isNaN(new Date(parcela.data_pagamento).getTime())
                                    ? format(new Date(parcela.data_pagamento), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                                    : "Data inválida"
                                  }
                                </p>
                                {parcela.observacoes && (
                                  <p className="text-xs text-gray-500 mt-1 italic">"{parcela.observacoes}"</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-emerald-600">
                                {formatCurrency(parcela.valor_parcela)}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {parcela.forma_pagamento}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Sistema Avançado de Pagamento removido - usando apenas Resumo Financeiro */}
          </div>
        </div>

        {/* Histórico de Pagamentos - Sistema Novo */}
        {breakdown && historicoPagamentos.length > 0 && (
          <Card className="shadow-lg border-0 mt-6">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Histórico de Pagamentos ({historicoPagamentos.length})
              </CardTitle>
              <CardDescription className="text-green-100">
                Pagamentos registrados no sistema novo
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {historicoPagamentos
                  .sort((a, b) => new Date(b.data_pagamento).getTime() - new Date(a.data_pagamento).getTime())
                  .map((pagamento, index) => (
                    <div key={pagamento.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatCurrency(pagamento.valor_pago)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {pagamento.categoria === 'viagem' ? 'Viagem' : 
                             pagamento.categoria === 'passeios' ? 'Passeios' : 'Viagem + Passeios'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {pagamento.data_pagamento && !isNaN(new Date(pagamento.data_pagamento).getTime()) 
                            ? format(new Date(pagamento.data_pagamento), "dd/MM/yyyy", { locale: ptBR })
                            : "Data inválida"
                          }
                        </div>
                        {pagamento.forma_pagamento && (
                          <div className="text-xs text-gray-500">
                            {pagamento.forma_pagamento.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading indicator para dados financeiros */}
        {loadingPagamentos && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Carregando dados financeiros...</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
