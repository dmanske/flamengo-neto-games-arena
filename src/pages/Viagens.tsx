
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Plus } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Viagem {
  id: string;
  adversario: string;
  data_jogo: string;
  tipo_onibus: string;
  empresa: string;
  rota: string;
  capacidade_onibus: number;
  status_viagem: string;
  created_at: string;
}

const statusColors = {
  "Aberta": "bg-green-100 text-green-800",
  "Em Andamento": "bg-blue-100 text-blue-800",
  "Finalizada": "bg-gray-100 text-gray-800",
};

const Viagens = () => {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchViagens = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("viagens")
          .select("*")
          .order("data_jogo", { ascending: true });
        
        if (error) {
          throw error;
        }
        
        setViagens(data || []);
      } catch (err) {
        console.error("Erro ao buscar viagens:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchViagens();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Viagens</h1>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link to="/cadastrar-viagem">
            <Plus className="mr-2 h-4 w-4" /> Nova Viagem
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Viagens Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <p className="text-muted-foreground">Carregando viagens...</p>
            </div>
          ) : viagens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="h-12 w-12 mb-3 text-muted-foreground/50" />
              <p className="text-lg font-medium">Nenhuma viagem cadastrada</p>
              <p className="text-muted-foreground mt-1">
                Clique em "Nova Viagem" para cadastrar
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Adversário</TableHead>
                    <TableHead>Data do Jogo</TableHead>
                    <TableHead>Ônibus</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Rota</TableHead>
                    <TableHead>Capacidade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viagens.map((viagem) => (
                    <TableRow key={viagem.id} className="cursor-pointer hover:bg-accent/50">
                      <TableCell className="font-medium">{viagem.adversario}</TableCell>
                      <TableCell>{formatDate(viagem.data_jogo)}</TableCell>
                      <TableCell>{viagem.tipo_onibus}</TableCell>
                      <TableCell>{viagem.empresa}</TableCell>
                      <TableCell>{viagem.rota}</TableCell>
                      <TableCell>{viagem.capacidade_onibus}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[viagem.status_viagem as keyof typeof statusColors] || "bg-gray-100"}`}>
                          {viagem.status_viagem}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Viagens;
