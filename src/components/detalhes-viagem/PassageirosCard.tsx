import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Trash2, Pencil, Users, Plus, Search, Eye, Bus } from "lucide-react";

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
}

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
}: PassageirosCardProps) {
  const [statusFilter, setStatusFilter] = useState<string>("todos");

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

  // Filtrar passageiros por status se necessário
  const passageirosFiltrados = passageirosAtuais.filter((passageiro) => {
    const matchesSearch = !searchTerm || 
      passageiro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passageiro.telefone.includes(searchTerm) ||
      passageiro.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "todos" || passageiro.status_pagamento === statusFilter;
    
    return matchesSearch && matchesStatus;
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
              {passageirosFiltrados.length} de {passageirosAtuais.length} passageiros
              {onibusAtual && ` • Capacidade: ${onibusAtual.capacidade_onibus + (onibusAtual.lugares_extras || 0)} lugares`}
            </CardDescription>
          </div>
          <Button 
            onClick={() => setAddPassageiroOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Passageiro
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome, telefone ou email..."
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
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="text-center">Telefone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Setor</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Valor</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {passageirosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm || statusFilter !== "todos" 
                      ? "Nenhum passageiro encontrado com os filtros aplicados" 
                      : "Nenhum passageiro cadastrado"}
                  </TableCell>
                </TableRow>
              ) : (
                passageirosFiltrados.map((passageiro) => {
                  // Calcular valor pago e valor que falta
                  const valorPago = (passageiro.parcelas || []).reduce((sum, p) => sum + (p.valor_parcela || 0), 0);
                  const valorLiquido = (passageiro.valor || 0) - (passageiro.desconto || 0);
                  const valorFalta = valorLiquido - valorPago;
                  return (
                    <TableRow key={passageiro.viagem_passageiro_id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {passageiro.foto ? (
                            <img src={passageiro.foto} alt={passageiro.nome} className="w-8 h-8 rounded-full object-cover border" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border">
                              <span className="text-xs">{passageiro.nome[0]}</span>
                            </div>
                          )}
                          {onViewDetails ? (
                            <button
                              onClick={() => onViewDetails(passageiro)}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                              {passageiro.nome}
                            </button>
                          ) : (
                            passageiro.nome
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{passageiro.telefone}</TableCell>
                      <TableCell>{passageiro.email}</TableCell>
                      <TableCell className="text-center">{passageiro.setor_maracana}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={getStatusColor(passageiro.status_pagamento)}>
                          {passageiro.status_pagamento}
                        </Badge>
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
                        <div className="flex items-center justify-center gap-2">
                          {onViewDetails && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewDetails(passageiro)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditPassageiro(passageiro)}
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
