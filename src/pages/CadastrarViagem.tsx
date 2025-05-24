import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { OnibusForm } from "@/components/viagem/OnibusForm";

const CadastrarViagem = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    adversario: "",
    data_jogo: "",
    tipo_onibus: "",
    empresa: "",
    rota: "",
    capacidade_onibus: "",
    status_viagem: "Aberta",
    valor_padrao: "",
    setor_padrao: "",
    logo_adversario: "",
  });

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.adversario || !formData.data_jogo || !formData.tipo_onibus || 
        !formData.empresa || !formData.rota || !formData.capacidade_onibus) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);

    try {
      const viagemData = {
        adversario: formData.adversario,
        data_jogo: formData.data_jogo,
        tipo_onibus: formData.tipo_onibus,
        empresa: formData.empresa,
        rota: formData.rota,
        capacidade_onibus: parseInt(formData.capacidade_onibus),
        status_viagem: formData.status_viagem,
        valor_padrao: formData.valor_padrao ? parseFloat(formData.valor_padrao) : null,
        setor_padrao: formData.setor_padrao || null,
        logo_adversario: formData.logo_adversario || null,
      };

      const { data: viagemInserted, error: viagemError } = await supabase
        .from("viagens")
        .insert([viagemData])
        .select()
        .single();

      if (viagemError) throw viagemError;

      toast.success("Viagem criada com sucesso!");
      navigate(`/dashboard/viagem/${viagemInserted.id}`);
    } catch (error: any) {
      console.error("Erro ao criar viagem:", error);
      toast.error("Erro ao criar viagem");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link to="/dashboard/viagens">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Cadastrar Nova Viagem</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas da Viagem */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Viagem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adversario">Adversário *</Label>
                <Input
                  id="adversario"
                  value={formData.adversario}
                  onChange={(e) => handleInputChange("adversario", e.target.value)}
                  placeholder="Nome do time adversário"
                  required
                />
              </div>
              <div>
                <Label htmlFor="data_jogo">Data do Jogo *</Label>
                <Input
                  id="data_jogo"
                  type="datetime-local"
                  value={formData.data_jogo}
                  onChange={(e) => handleInputChange("data_jogo", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valor_padrao">Valor Padrão (R$)</Label>
                <Input
                  id="valor_padrao"
                  type="number"
                  step="0.01"
                  value={formData.valor_padrao}
                  onChange={(e) => handleInputChange("valor_padrao", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="setor_padrao">Setor Padrão</Label>
                <Select onValueChange={(value) => handleInputChange("setor_padrao", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Norte">Norte</SelectItem>
                    <SelectItem value="Sul">Sul</SelectItem>
                    <SelectItem value="Leste">Leste</SelectItem>
                    <SelectItem value="Oeste">Oeste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="logo_adversario">URL do Logo do Adversário</Label>
              <Input
                id="logo_adversario"
                value={formData.logo_adversario}
                onChange={(e) => handleInputChange("logo_adversario", e.target.value)}
                placeholder="https://exemplo.com/logo.png"
              />
            </div>

            <div>
              <Label htmlFor="status_viagem">Status da Viagem</Label>
              <Select 
                value={formData.status_viagem}
                onValueChange={(value) => handleInputChange("status_viagem", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aberta">Aberta</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Finalizada">Finalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Ônibus */}
        <OnibusForm
          formData={formData}
          handleInputChange={handleInputChange}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700">
            {isLoading ? "Criando..." : "Criar Viagem"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/dashboard/viagens">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CadastrarViagem;
