import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const EditarOnibus = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    tipo_onibus: "",
    empresa: "",
    numero_identificacao: "",
    capacidade: "",
    description: "",
  });

  useEffect(() => {
    if (id) {
      fetchOnibusData();
    }
  }, [id]);

  const fetchOnibusData = async () => {
    try {
      const { data, error } = await supabase
        .from("onibus")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          tipo_onibus: data.tipo_onibus || "",
          empresa: data.empresa || "",
          numero_identificacao: data.numero_identificacao || "",
          capacidade: data.capacidade?.toString() || "",
          description: data.description || "",
        });
      }
    } catch (error: any) {
      console.error("Erro ao buscar ônibus:", error);
      toast.error("Erro ao carregar dados do ônibus");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tipo_onibus || !formData.empresa || !formData.capacidade) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setIsSaving(true);

    try {
      const updateData = {
        tipo_onibus: formData.tipo_onibus,
        empresa: formData.empresa,
        numero_identificacao: formData.numero_identificacao || null,
        capacidade: parseInt(formData.capacidade),
        description: formData.description || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("onibus")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      toast.success("Ônibus atualizado com sucesso!");
      navigate("/dashboard/onibus");
    } catch (error: any) {
      console.error("Erro ao atualizar ônibus:", error);
      toast.error("Erro ao atualizar ônibus");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="mb-6">
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link to="/dashboard/onibus">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Editar Ônibus</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Ônibus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipo_onibus">Tipo de Ônibus *</Label>
                <Input
                  id="tipo_onibus"
                  value={formData.tipo_onibus}
                  onChange={(e) => handleInputChange("tipo_onibus", e.target.value)}
                  placeholder="Ex: Leito, Semi-leito, Executivo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="empresa">Empresa *</Label>
                <Input
                  id="empresa"
                  value={formData.empresa}
                  onChange={(e) => handleInputChange("empresa", e.target.value)}
                  placeholder="Nome da empresa"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numero_identificacao">Número de Identificação</Label>
                <Input
                  id="numero_identificacao"
                  value={formData.numero_identificacao}
                  onChange={(e) => handleInputChange("numero_identificacao", e.target.value)}
                  placeholder="Ex: 001, A-123"
                />
              </div>
              <div>
                <Label htmlFor="capacidade">Capacidade *</Label>
                <Input
                  id="capacidade"
                  type="number"
                  value={formData.capacidade}
                  onChange={(e) => handleInputChange("capacidade", e.target.value)}
                  placeholder="Número de assentos"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Descrição adicional do ônibus"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSaving} className="bg-red-600 hover:bg-red-700">
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/dashboard/onibus">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditarOnibus;
