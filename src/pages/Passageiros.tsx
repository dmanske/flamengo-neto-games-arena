
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Passageiros = () => {
  // Mock data for passengers
  const passageiros = [
    { id: 1, nome: "João Silva", telefone: "(21) 99999-1111", cidade: "Rio de Janeiro", setor: "Norte", status: "Pago", onibus: "01" },
    { id: 2, nome: "Maria Santos", telefone: "(21) 99999-2222", cidade: "Niterói", setor: "Sul", status: "Pendente", onibus: "02" },
    { id: 3, nome: "Carlos Oliveira", telefone: "(21) 99999-3333", cidade: "Duque de Caxias", setor: "Leste", status: "Pago", onibus: "01" },
    { id: 4, nome: "Ana Costa", telefone: "(21) 99999-4444", cidade: "Nova Iguaçu", setor: "Oeste", status: "Cancelado", onibus: "03" },
    { id: 5, nome: "Roberto Almeida", telefone: "(21) 99999-5555", cidade: "Rio de Janeiro", setor: "Norte", status: "Pago", onibus: "02" },
  ];

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
            <div>
              <Input placeholder="Buscar por nome..." className="w-full" startContent={<Search className="h-4 w-4" />} />
            </div>
            <select className="bg-white border border-gray-300 rounded-md px-3 py-2">
              <option value="">Todas as cidades</option>
              <option value="Rio de Janeiro">Rio de Janeiro</option>
              <option value="Niterói">Niterói</option>
              <option value="Duque de Caxias">Duque de Caxias</option>
              <option value="Nova Iguaçu">Nova Iguaçu</option>
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
                {passageiros.map((passageiro) => (
                  <tr key={passageiro.id} className="border-t border-gray-200">
                    <td className="px-4 py-3">{passageiro.nome}</td>
                    <td className="px-4 py-3">{passageiro.telefone}</td>
                    <td className="px-4 py-3">{passageiro.cidade}</td>
                    <td className="px-4 py-3">{passageiro.setor}</td>
                    <td className="px-4 py-3">{passageiro.onibus}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        passageiro.status === "Pago" ? "bg-green-100 text-green-700" :
                        passageiro.status === "Pendente" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {passageiro.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center space-x-2">
                        <Button variant="outline" size="sm">Editar</Button>
                        <Button variant="outline" size="sm" className="text-red-500 border-red-500 hover:bg-red-50">Excluir</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center p-4 border-t">
            <div>Mostrando 1-5 de 5 resultados</div>
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
