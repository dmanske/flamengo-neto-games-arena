import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, MapPin, CreditCard, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  foto?: string;
}

interface PassageiroDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passageiro: PassageiroDetails | null;
}

export function PassageiroDetailsDialog({
  open,
  onOpenChange,
  passageiro,
}: PassageiroDetailsDialogProps) {
  if (!passageiro) return null;

  const valorLiquido = passageiro.valor - passageiro.desconto;
  const valorPago = passageiro.parcelas?.reduce((sum, p) => sum + p.valor_parcela, 0) || 0;
  const valorPendente = valorLiquido - valorPago;

  const statusColors = {
    "Pago": "bg-green-100 text-green-800 border-green-200",
    "Pendente": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Cancelado": "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <div className="flex flex-col items-center gap-2 mb-2">
            {passageiro.foto ? (
              <img src={passageiro.foto} alt={passageiro.nome} className="w-20 h-20 rounded-full object-cover border" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border text-3xl">
                {passageiro.nome[0]}
              </div>
            )}
            <DialogTitle className="flex items-center gap-2 text-xl">
              {passageiro.nome}
            </DialogTitle>
          </div>
          <DialogDescription>
            Informações completas do passageiro e detalhes do pagamento
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Coluna da Esquerda */}
          <div className="space-y-6">
            {/* Informações Pessoais */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">CPF:</span>
                    <p className="text-sm">{passageiro.cpf || 'Não informado'}</p>
                  </div>
                  {passageiro.data_nascimento && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Data de Nascimento:</span>
                      <p className="text-sm">
                        {format(new Date(passageiro.data_nascimento), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-1">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Telefone:</span>
                    <p className="text-sm">{passageiro.telefone}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <p className="text-sm break-all">{passageiro.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Endereço:</span>
                  <p className="text-sm">
                    {passageiro.endereco}, {passageiro.numero}
                    {passageiro.complemento && ` - ${passageiro.complemento}`}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Bairro:</span>
                    <p className="text-sm">{passageiro.bairro}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Cidade:</span>
                    <p className="text-sm">{passageiro.cidade}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Estado:</span>
                    <p className="text-sm">{passageiro.estado}</p>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">CEP:</span>
                  <p className="text-sm">{passageiro.cep}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna da Direita */}
          <div className="space-y-6">
            {/* Informações da Viagem */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Detalhes da Viagem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Setor no Maracanã:</span>
                    <p className="text-sm">{passageiro.setor_maracana}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Status do Pagamento:</span>
                    <Badge className={statusColors[passageiro.status_pagamento as keyof typeof statusColors] || statusColors.Pendente}>
                      {passageiro.status_pagamento}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detalhes Financeiros */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Detalhes Financeiros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-600">Valor Total</span>
                    <p className="text-lg font-bold text-blue-600">R$ {passageiro.valor.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-600">Desconto</span>
                    <p className="text-lg font-bold text-orange-600">R$ {passageiro.desconto.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-600">Valor Líquido</span>
                    <p className="text-lg font-bold text-green-600">R$ {valorLiquido.toFixed(2)}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-600">Valor Pago</span>
                    <p className="text-lg font-bold text-green-600">R$ {valorPago.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-600">Valor Pendente</span>
                    <p className="text-lg font-bold text-red-600">R$ {valorPendente.toFixed(2)}</p>
                  </div>
                </div>

                {/* Histórico de Parcelas */}
                {passageiro.parcelas && passageiro.parcelas.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-3">Histórico de Pagamentos</h4>
                      <div className="space-y-2">
                        {passageiro.parcelas.map((parcela, index) => (
                          <div key={parcela.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium">Parcela {index + 1}</p>
                              <p className="text-xs text-gray-600">
                                {format(new Date(parcela.data_pagamento), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </p>
                              {parcela.observacoes && (
                                <p className="text-xs text-gray-500">{parcela.observacoes}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-green-600">
                                R$ {parcela.valor_parcela.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-600">{parcela.forma_pagamento}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
