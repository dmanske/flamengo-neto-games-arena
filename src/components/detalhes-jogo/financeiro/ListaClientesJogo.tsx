import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ingresso } from '@/types/ingressos';
import { HistoricoCobranca } from '@/hooks/financeiro/useCobrancaJogo';
import { formatCurrency, formatPhone } from '@/utils/formatters';
import { formatarDataBrasil } from '@/utils/dateUtils';
import { Search, Users, CheckCircle, MessageCircle, Phone, Mail } from 'lucide-react';

interface ListaClientesJogoProps {
  ingressos: Ingresso[];
  historicoCobrancas: HistoricoCobranca[];
  onMarcarComoPago: (ingressoId: string) => Promise<void>;
  onRegistrarCobranca: (ingressoId: string, tipo: 'whatsapp' | 'email' | 'telefone' | 'presencial' | 'outros', mensagem?: string) => Promise<string>;
}

export function ListaClientesJogo({
  ingressos,
  historicoCobrancas,
  onMarcarComoPago,
  onRegistrarCobranca
}: ListaClientesJogoProps) {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroSetor, setFiltroSetor] = useState<string>('todos');

  // Processar dados dos clientes com informações de cobrança
  const clientesProcessados = useMemo(() => {
    return ingressos.map(ingresso => {
      const cobrancasDoIngresso = historicoCobrancas.filter(h => h.ingresso_id === ingresso.id);
      const ultimaCobranca = cobrancasDoIngresso.sort((a, b) => 
        new Date(b.data_envio).getTime() - new Date(a.data_envio).getTime()
      )[0];

      return {
        ...ingresso,
        totalCobrancas: cobrancasDoIngresso.length,
        ultimaCobranca: ultimaCobranca?.data_envio,
        ultimoTipoCobranca: ultimaCobranca?.tipo_cobranca,
        statusUltimaCobranca: ultimaCobranca?.status,
        lucroIndividual: ingresso.valor_final - (ingresso.preco_custo || 0),
        margemPercentual: ingresso.valor_final > 0 ? 
          ((ingresso.valor_final - (ingresso.preco_custo || 0)) / ingresso.valor_final) * 100 : 0
      };
    });
  }, [ingressos, historicoCobrancas]);

  // Aplicar filtros
  const clientesFiltrados = useMemo(() => {
    return clientesProcessados.filter(cliente => {
      // Filtro de busca
      if (busca) {
        const termoBusca = busca.toLowerCase();
        const matchNome = cliente.cliente?.nome?.toLowerCase().includes(termoBusca);
        const matchCPF = cliente.cliente?.cpf?.includes(termoBusca);
        const matchTelefone = cliente.cliente?.telefone?.includes(termoBusca);
        const matchSetor = cliente.setor_estadio?.toLowerCase().includes(termoBusca);
        
        if (!matchNome && !matchCPF && !matchTelefone && !matchSetor) {
          return false;
        }
      }

      // Filtro de status
      if (filtroStatus !== 'todos' && cliente.situacao_financeira !== filtroStatus) {
        return false;
      }

      // Filtro de setor
      if (filtroSetor !== 'todos' && cliente.setor_estadio !== filtroSetor) {
        return false;
      }

      return true;
    });
  }, [clientesProcessados, busca, filtroStatus, filtroSetor]);

  // Obter setores únicos para o filtro
  const setoresUnicos = useMemo(() => {
    return Array.from(new Set(ingressos.map(ing => ing.setor_estadio))).sort();
  }, [ingressos]);

  // Estatísticas dos clientes filtrados
  const estatisticas = useMemo(() => {
    const total = clientesFiltrados.length;
    const pagos = clientesFiltrados.filter(c => c.situacao_financeira === 'pago').length;
    const pendentes = clientesFiltrados.filter(c => c.situacao_financeira === 'pendente').length;
    const cancelados = clientesFiltrados.filter(c => c.situacao_financeira === 'cancelado').length;
    const valorTotal = clientesFiltrados.reduce((sum, c) => sum + c.valor_final, 0);
    const lucroTotal = clientesFiltrados.reduce((sum, c) => sum + c.lucroIndividual, 0);

    return { total, pagos, pendentes, cancelados, valorTotal, lucroTotal };
  }, [clientesFiltrados]);

  const handleMarcarComoPago = async (cliente: any) => {
    if (confirm(`Marcar ingresso de ${cliente.cliente?.nome} como pago?`)) {
      await onMarcarComoPago(cliente.id);
    }
  };

  const handleEnviarCobranca = async (cliente: any, tipo: 'whatsapp' | 'email' | 'telefone') => {
    const mensagem = `Cobrança enviada via ${tipo} para ${cliente.cliente?.nome}`;
    await onRegistrarCobranca(cliente.id, tipo, mensagem);
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                <p className="text-2xl font-bold">{estatisticas.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pagos</p>
                <p className="text-2xl font-bold text-green-600">{estatisticas.pagos}</p>
                <p className="text-xs text-gray-500">
                  {estatisticas.total > 0 ? ((estatisticas.pagos / estatisticas.total) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(estatisticas.valorTotal)}
                </p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lucro Total</p>
                <p className={`text-2xl font-bold ${estatisticas.lucroTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(estatisticas.lucroTotal)}
                </p>
              </div>
              <div className="text-2xl">📈</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista Completa de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, CPF, telefone ou setor..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroSetor} onValueChange={setFiltroSetor}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Setores</SelectItem>
                {setoresUnicos.map(setor => (
                  <SelectItem key={setor} value={setor}>{setor}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabela de Clientes */}
          {clientesFiltrados.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Lucro</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cobranças</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesFiltrados.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{cliente.cliente?.nome}</div>
                          <div className="text-sm text-gray-500">{cliente.cliente?.cpf}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatPhone(cliente.cliente?.telefone || '')}</div>
                          <div className="text-gray-500 truncate max-w-32" title={cliente.cliente?.email}>
                            {cliente.cliente?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{cliente.setor_estadio}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(cliente.valor_final)}
                        {cliente.preco_custo && (
                          <div className="text-xs text-gray-500">
                            Custo: {formatCurrency(cliente.preco_custo)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium ${cliente.lucroIndividual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(cliente.lucroIndividual)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {cliente.margemPercentual.toFixed(1)}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            cliente.situacao_financeira === 'pago' ? 'default' :
                            cliente.situacao_financeira === 'pendente' ? 'secondary' : 'destructive'
                          }
                        >
                          {cliente.situacao_financeira}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{cliente.totalCobrancas} tentativa{cliente.totalCobrancas !== 1 ? 's' : ''}</div>
                          {cliente.ultimaCobranca && (
                            <div className="text-xs text-gray-500">
                              Última: {formatarDataBrasil(cliente.ultimaCobranca)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {cliente.situacao_financeira === 'pendente' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarcarComoPago(cliente)}
                                title="Marcar como pago"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEnviarCobranca(cliente, 'whatsapp')}
                                title="Enviar cobrança via WhatsApp"
                              >
                                <MessageCircle className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEnviarCobranca(cliente, 'telefone')}
                                title="Registrar cobrança por telefone"
                              >
                                <Phone className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🔍</div>
              <h3 className="text-lg font-medium mb-2">Nenhum cliente encontrado</h3>
              <p className="text-muted-foreground">
                {busca || filtroStatus !== 'todos' || filtroSetor !== 'todos'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Nenhum ingresso cadastrado para este jogo ainda.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}