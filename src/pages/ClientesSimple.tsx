import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";

interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  data_nascimento: string | null;
  endereco: string;
  cidade: string;
  estado: string;
  created_at: string;
  foto: string | null;
}

const ClientesSimple = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setClientes(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar clientes:', err);
      setError(err.message || 'Erro ao carregar os clientes');
      toast.error('Erro ao carregar dados de clientes');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchClientes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Clientes</h1>
          <Button asChild>
            <Link to="/dashboard/cadastrar-cliente">
              <UserPlus className="h-4 w-4 mr-2" />
              Cadastrar Cliente
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando...</span>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchClientes}>Tentar Novamente</Button>
            </CardContent>
          </Card>
        ) : clientes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-600 mb-4">Nenhum cliente cadastrado</p>
              <Button asChild>
                <Link to="/dashboard/cadastrar-cliente">
                  Cadastrar Primeiro Cliente
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {clientes.map((cliente) => (
              <Card key={cliente.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{cliente.nome}</h3>
                      <p className="text-sm text-gray-600">
                        {cliente.cidade}/{cliente.estado}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/dashboard/clientes/${cliente.id}/editar`}>
                        Editar
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientesSimple;