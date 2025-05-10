
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Plus, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

const Passageiros = () => {
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Passageiros</h1>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link to="/cadastrar-passageiro">
            <Plus className="mr-2 h-4 w-4" /> Novo Passageiro
          </Link>
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtrar Passageiros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Buscar por nome..." className="w-full pl-9" />
            </div>
            <select className="bg-white border border-gray-300 rounded-md px-3 py-2">
              <option value="">Todas as cidades</option>
            </select>
            <select className="bg-white border border-gray-300 rounded-md px-3 py-2">
              <option value="">Todos os status</option>
              <option value="Pago">Pago</option>
              <option value="Pendente">Pendente</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Nome</th>
                  <th className="px-4 py-3 text-left">Telefone</th>
                  <th className="px-4 py-3 text-left">Cidade</th>
                  <th className="px-4 py-3 text-left">Setor</th>
                  <th className="px-4 py-3 text-left">Ônibus</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-12 w-12 mb-2 text-muted-foreground/50" />
                      <p>Nenhum passageiro cadastrado</p>
                      <p className="text-sm">Clique em "Novo Passageiro" para cadastrar</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center p-4 border-t">
            <div>Mostrando 0 resultados</div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>Anterior</Button>
              <Button variant="outline" size="sm" disabled>Próximo</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Passageiros;
