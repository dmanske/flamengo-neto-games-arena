import React from 'react';
import { Eye, Edit, Trash2, Copy, Phone, Mail, User, MapPin, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Ingresso, SituacaoFinanceiraIngresso } from '@/types/ingressos';
import { formatCurrency, formatCPF, formatPhone, formatBirthDate } from '@/utils/formatters';

interface IngressoJogoCardProps {
  ingresso: Ingresso;
  onVerDetalhes: (ingresso: Ingresso) => void;
  onEditar: (ingresso: Ingresso) => void;
  onDeletar: (ingresso: Ingresso) => void;
}

export function IngressoJogoCard({
  ingresso,
  onVerDetalhes,
  onEditar,
  onDeletar
}: IngressoJogoCardProps) {
  
  // Função para copiar campo específico do cliente
  const copiarCampo = (valor: string, nomeCampo: string) => {
    if (!valor) {
      toast.error(`${nomeCampo} não disponível`);
      return;
    }

    navigator.clipboard.writeText(valor).then(() => {
      toast.success(`${nomeCampo} copiado!`);
    }).catch(() => {
      toast.error(`Erro ao copiar ${nomeCampo.toLowerCase()}`);
    });
  };

  // Função para obter cor do badge de status
  const getStatusBadgeVariant = (status: SituacaoFinanceiraIngresso) => {
    switch (status) {
      case 'pago':
        return 'default';
      case 'pendente':
        return 'secondary';
      case 'cancelado':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Função para obter texto do status
  const getStatusText = (status: SituacaoFinanceiraIngresso) => {
    switch (status) {
      case 'pago':
        return '✅ Pago';
      case 'pendente':
        return '⏳ Pendente';
      case 'cancelado':
        return '❌ Cancelado';
      default:
        return status;
    }
  };

  const nomeCliente = ingresso.cliente?.nome || 'Cliente não encontrado';
  const iniciais = nomeCliente.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                {iniciais}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {nomeCliente}
                {ingresso.cliente?.nome && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copiarCampo(ingresso.cliente!.nome, 'Nome')}
                    className="h-6 w-6 p-0 hover:bg-blue-100"
                    title="Copiar nome"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(ingresso.situacao_financeira)} className="text-xs">
                  {getStatusText(ingresso.situacao_financeira)}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onVerDetalhes(ingresso)}
              title="Ver detalhes"
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditar(ingresso)}
              title="Editar ingresso"
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeletar(ingresso)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Deletar ingresso"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4">
          {/* Coluna 1: Informações do Cliente */}
          <div className="space-y-3">
            {ingresso.cliente?.cpf && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-mono">{formatCPF(ingresso.cliente.cpf)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copiarCampo(ingresso.cliente!.cpf!, 'CPF')}
                  className="h-6 w-6 p-0 hover:bg-blue-100"
                  title="Copiar CPF"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {ingresso.cliente?.data_nascimento && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">🎂</span>
                <span className="text-sm">{formatBirthDate(ingresso.cliente.data_nascimento)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copiarCampo(
                    formatBirthDate(ingresso.cliente!.data_nascimento!), 
                    'Data de nascimento'
                  )}
                  className="h-6 w-6 p-0 hover:bg-blue-100"
                  title="Copiar data de nascimento"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {ingresso.cliente?.telefone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-600" />
                <span className="text-sm">{formatPhone(ingresso.cliente.telefone)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copiarCampo(ingresso.cliente!.telefone!, 'Telefone')}
                  className="h-6 w-6 p-0 hover:bg-blue-100"
                  title="Copiar telefone"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {ingresso.cliente?.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-600" />
                <span className="text-sm truncate">{ingresso.cliente.email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copiarCampo(ingresso.cliente!.email!, 'Email')}
                  className="h-6 w-6 p-0 hover:bg-blue-100"
                  title="Copiar email"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          
          {/* Coluna 2: Informações do Ingresso */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{ingresso.setor_estadio}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-600">
                {formatCurrency(ingresso.valor_final)}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <TrendingUp className={`h-4 w-4 ${ingresso.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-sm font-semibold ${ingresso.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(ingresso.lucro)}
              </span>
            </div>
            
            {ingresso.margem_percentual !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Margem:</span>
                <Badge variant={ingresso.margem_percentual >= 0 ? 'default' : 'destructive'} className="text-xs">
                  {ingresso.margem_percentual.toFixed(1)}%
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}