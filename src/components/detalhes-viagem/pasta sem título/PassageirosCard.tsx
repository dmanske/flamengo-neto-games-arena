// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { converterStatusParaInteligente } from "@/lib/status-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Pencil, Users, Plus, Search, Eye, Bus, Ticket } from "lucide-react";
import { formatBirthDate, formatarNomeComPreposicoes } from "@/utils/formatters";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface PassageirosCardProps {
  passageirosAtuais: any[];
  passageiros: any[];
  onibusAtual: any;
  selectedOnibusId: string | null;
  totalPassageirosNaoAlocados: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setAddPassageiroOpen: (open: boolean) => void;
  onEditPassageiro: (passageiro: any) => void;
  onDeletePassageiro: (passageiro: any) => void;
  onViewDetails?: (passageiro: any) => void;
  filterStatus: string;
  passeiosPagos?: string[];
  outroPasseio?: string | null;
  viagemId: string | null;
  setPassageiros: (passageiros: any[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  capacidadeTotal?: number;
  totalPassageiros?: number;
}

export const fetchPassageiros = async (viagemId: string, setPassageiros: (p: any[]) => void, setIsLoading: (b: boolean) => void, toast: any) => {
  try {
    setIsLoading(true);
    if (!viagemId || viagemId === "undefined") {
      console.warn("ID da viagem inválido:", viagemId);
      return;
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(viagemId)) {
      console.warn("ID da viagem não é um UUID válido:", viagemId);
      return;
    }
    
    // Consulta explicitamente o campo is_responsavel_onibus
    const { data, error } = await supabase
      .from('viagem_passageiros')
      .select(`
        id, 
        viagem_id, 
        cliente_id, 
        onibus_id, 
        is_responsavel_onibus,
        status_pagamento,
        setor_maracana,
        cidade_embarque,
        clientes:clientes!viagem_passageiros_cliente_id_fkey(*)
      `)
      .eq('viagem_id', viagemId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Mapear os dados para garantir que viagem_passageiro_id seja definido
    const passageirosFormatados = (data || []).map(p => ({
      ...p,
      viagem_passageiro_id: p.id, // Garantir que viagem_passageiro_id seja definido
      nome: p.clientes.nome,
      is_responsavel_onibus: p.is_responsavel_onibus || false
    }));
    
    console.log('Passageiros carregados:', passageirosFormatados);
    setPassageiros(passageirosFormatados);
  } catch (error: any) {
    console.error('Erro ao buscar passageiros:', error);
    toast.error("Erro ao carregar passageiros");
  } finally {
    setIsLoading(false);
  }
};

export function PassageirosCard({
  passageirosAtuais,
  passageiros,
  onibusAtual,
  selectedOnibusId,
  totalPassageirosNaoAlocados,
  searchTerm,
  setSearchTerm,
  setAddPassageiroOpen,
  onEditPassageiro,
  onDeletePassageiro,
  onViewDetails,
  filterStatus,
  passeiosPagos,
  outroPasseio,
  viagemId,
  setPassageiros,
  setIsLoading,
  capacidadeTotal,
  totalPassageiros,
}: PassageirosCardProps) {
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [passeioFilter, setPasseioFilter] = useState<string>("todos");
  const [setorFilter, setSetorFilter] = useState<string>("todos");

  // Permitir controle externo do filtro de status
  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail === "Pago" || e.detail === "Pendente" || e.detail === "Cancelado") {
        setStatusFilter(e.detail);
      }
    };
    document.addEventListener("setPassageirosStatusFilter", handler);
    return () => document.removeEventListener("setPassageirosStatusFilter", handler);
  }, []);

  // Filtrar passageiros por status e passeios
  const passageirosFiltrados = (passageirosAtuais || []).filter((passageiro) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      passageiro.nome.toLowerCase().includes(searchTermLower) ||
      passageiro.telefone?.includes(searchTerm) ||
      passageiro.email?.toLowerCase().includes(searchTermLower) ||
      passageiro.cidade_embarque?.toLowerCase().includes(searchTermLower) ||
      passageiro.setor_maracana?.toLowerCase().includes(searchTermLower) ||
      passageiro.status_pagamento?.toLowerCase().includes(searchTermLower);
    
    const matchesStatus = statusFilter === "todos" || passageiro.status_pagamento === statusFilter;
    
    // Filtro de passeios
    let matchesPasseio = true;
    if (passeioFilter !== "todos") {
      if (passeioFilter === "sem_passeios") {
        matchesPasseio = !passageiro.passeios || passageiro.passeios.length === 0;
      } else if (passeioFilter === "com_passeios") {
        matchesPasseio = passageiro.passeios && passageiro.passeios.length > 0;
      } else {
        // Filtro por passeio específico
        matchesPasseio = passageiro.passeios && passageiro.passeios.some(p => p.passeio_nome === passeioFilter);
      }
    }
    
    // Filtro de setores
    const matchesSetor = setorFilter === "todos" || passageiro.setor_maracana === setorFilter;
    
    return matchesSearch && matchesStatus && matchesPasseio && matchesSetor;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pago":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Cancelado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Verificar se a capacidade está completa
  const isCapacidadeCompleta = capacidadeTotal && totalPassageiros ? totalPassageiros >= capacidadeTotal : false;

  // Obter setores únicos dos passageiros
  const setoresUnicos = Array.from(new Set(
    (passageirosAtuais || [])
      .map(p => p.setor_maracana)
      .filter(setor => setor && setor !== "")
  )).sort();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Passageiros
              {onibusAtual && (
                <span className="flex items-center gap-1 text-sm font-normal text-muted-foreground">
                  <Bus className="h-4 w-4" />
                  {onibusAtual.numero_identificacao || `${onibusAtual.tipo_onibus} - ${onibusAtual.empresa}`}
                </span>
              )}
              {selectedOnibusId === null && totalPassageirosNaoAlocados > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  (Não Alocados)
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {passageirosFiltrados.length} de {(passageirosAtuais || []).length} passageiros
              {onibusAtual && ` • Capacidade: ${onibusAtual.capacidade_onibus + (onibusAtual.lugares_extras || 0)} lugares`}
              {capacidadeTotal && totalPassageiros && (
                <span className={`ml-2 font-medium ${
                  isCapacidadeCompleta ? 'text-red-600' : totalPassageiros / capacidadeTotal > 0.8 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  • Total da viagem: {totalPassageiros}/{capacidadeTotal}
                  {isCapacidadeCompleta && ' (COMPLETA)'}
                </span>
              )}
            </CardDescription>
          </div>
          <Button 
            onClick={() => setAddPassageiroOpen(true)}
            disabled={isCapacidadeCompleta}
            className={`${
              isCapacidadeCompleta 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            title={isCapacidadeCompleta ? "Capacidade da viagem completa" : "Adicionar novo passageiro"}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isCapacidadeCompleta ? "Capacidade Completa" : "Adicionar Passageiro"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome, telefone, setor, status ou cidade de embarque..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 z-50">
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="Pago">Pago</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={passeioFilter} onValueChange={setPasseioFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por passeios" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 z-50">
              <SelectItem value="todos">Todos os passeios</SelectItem>
              <SelectItem value="com_passeios">Com passeios</SelectItem>
              <SelectItem value="sem_passeios">Sem passeios</SelectItem>
              {passeiosPagos && passeiosPagos.map((passeio) => (
                <SelectItem key={passeio} value={passeio}>
                  {passeio}
                </SelectItem>
              ))}
              {outroPasseio && (
                <SelectItem value={outroPasseio}>
                  {outroPasseio}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <Select value={setorFilter} onValueChange={setSetorFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por setor" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 z-50">
              <SelectItem value="todos">Todos os setores</SelectItem>
              {setoresUnicos.map((setor) => (
                <SelectItem key={setor} value={setor}>
                  {setor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="text-center">Telefone</TableHead>
                <TableHead className="text-center">Data Nasc.</TableHead>
                <TableHead className="text-center">Cidade Embarque</TableHead>
                <TableHead className="text-center">Setor</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Valor</TableHead>
                <TableHead className="text-center">Passeios</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {passageirosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    {searchTerm || statusFilter !== "todos" 
                      ? "Nenhum passageiro encontrado com os filtros aplicados" 
                      : "Nenhum passageiro cadastrado"}
                  </TableCell>
                </TableRow>
              ) : (
                passageirosFiltrados.map((passageiro, index) => {
                  // Calcular valor pago e valor que falta (apenas parcelas realmente pagas)
                  const valorPago = (passageiro.parcelas || []).reduce((sum, p) => p.data_pagamento ? sum + (p.valor_parcela || 0) : sum, 0);
                  const valorLiquido = (passageiro.valor || 0) - (passageiro.desconto || 0);
                  const valorFalta = valorLiquido - valorPago;
                  return (
                    <TableRow key={passageiro.viagem_passageiro_id} className={passageiro.is_responsavel_onibus ? "bg-blue-50" : ""}>
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell className="font-cinzel font-semibold text-center text-rome-navy">
                        <div className="flex items-center gap-2">
                          {passageiro.foto ? (
                            <Avatar className="h-8 w-8 border-2 border-primary/20">
                              <AvatarImage 
                                src={passageiro.foto} 
                                alt={passageiro.nome}
                                className="object-cover"
                              />
                              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                {passageiro.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <Avatar className="h-8 w-8 border-2 border-primary/20">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                {passageiro.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          {onViewDetails ? (
                            <button
                              onClick={() => onViewDetails(passageiro)}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                              {formatarNomeComPreposicoes(passageiro.nome)}
                            </button>
                          ) : (
                            formatarNomeComPreposicoes(passageiro.nome)
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-cinzel font-semibold text-center text-black whitespace-nowrap">{passageiro.telefone}</TableCell>
                      <TableCell className="font-cinzel font-semibold text-center text-black">
                        {formatBirthDate(passageiro.data_nascimento)}
                      </TableCell>
                      <TableCell className="font-cinzel font-semibold text-center text-black">
                        {passageiro.cidade_embarque || 'Blumenau'}
                      </TableCell>
                      <TableCell className="font-cinzel font-semibold text-center text-black">{passageiro.setor_maracana}</TableCell>
                      <TableCell className="text-center">
                        {(() => {
                          const statusInteligente = converterStatusParaInteligente({
                            valor: passageiro.valor || 0,
                            desconto: passageiro.desconto || 0,
                            parcelas: passageiro.parcelas,
                            status_pagamento: passageiro.status_pagamento
                          });
                          
                          return (
                            <Badge className={statusInteligente.cor} title={statusInteligente.descricao}>
                              {statusInteligente.status}
                            </Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-semibold">R$ {valorLiquido.toFixed(2)}</span>
                          {passageiro.status_pagamento !== 'Pago' && (
                            <span className="text-xs text-green-700">Pago: R$ {valorPago.toFixed(2)}</span>
                          )}
                          {((valorFalta > 0.009) && passageiro.status_pagamento !== 'Pago') && (
                            <span className="text-xs text-orange-600">Falta: R$ {valorFalta.toFixed(2)}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {passageiro.passeios?.length > 0 ? (
                          <div className="flex flex-wrap gap-1 justify-center">
                            {passageiro.passeios.map((passeio) => (
                              <Badge
                                key={passeio.passeio_nome}
                                variant={passeio.status === 'Confirmado' ? 'default' : 'secondary'}
                                className="text-xs flex items-center gap-1"
                              >
                                <Ticket className="h-3 w-3" />
                                {passeio.passeio_nome}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm flex items-center justify-center gap-1">
                            <Ticket className="h-3 w-3" />
                            Sem passeios
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              onEditPassageiro(passageiro);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeletePassageiro(passageiro)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
