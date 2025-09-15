import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Upload, X, Loader2, Wifi, Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { SimpleImageUpload } from "@/components/onibus/SimpleImageUpload";

const EditarOnibus = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [newImagePath, setNewImagePath] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    tipo_onibus: "",
    empresa: "",
    numero_identificacao: "",
    capacidade: "",
    description: "",
    wifi_ssid: "",
    wifi_password: "",
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
          wifi_ssid: data.wifi_ssid || "",
          wifi_password: data.wifi_password || "",
        });

        // Buscar imagem associada
        const { data: imageData } = await supabase
          .from("onibus_images")
          .select("image_url")
          .eq("onibus_id", id)
          .single();

        if (imageData?.image_url) {
          setCurrentImageUrl(imageData.image_url);
        }
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

  const handleRemoveImage = async () => {
    if (!currentImageUrl) return;

    try {
      // Remover da tabela onibus_images
      const { error } = await supabase
        .from("onibus_images")
        .delete()
        .eq("onibus_id", id);

      if (error) throw error;

      setCurrentImageUrl(null);
      toast.success("Imagem removida com sucesso!");
    } catch (error: any) {
      console.error("Erro ao remover imagem:", error);
      toast.error("Erro ao remover imagem");
    }
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
        wifi_ssid: formData.wifi_ssid || null,
        wifi_password: formData.wifi_password || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("onibus")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      // Se há uma nova imagem para salvar
      if (newImagePath) {
        // Primeiro, remover imagem existente se houver
        await supabase
          .from("onibus_images")
          .delete()
          .eq("onibus_id", id);

        // Inserir nova imagem
        const { error: imageError } = await supabase
          .from("onibus_images")
          .insert({
            tipo_onibus: formData.tipo_onibus,
            empresa: formData.empresa,
            image_url: newImagePath,
            onibus_id: id
          });

        if (imageError) {
          console.error("Erro ao salvar nova imagem:", imageError);
          toast.error("Ônibus atualizado, mas houve erro ao salvar a nova imagem");
        }
      }

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
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Skeleton className="h-10 w-40" />
        </div>
        <Card className="max-w-2xl mx-auto">
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
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost"
          onClick={() => navigate("/dashboard/onibus")}
          className="p-0 h-auto"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Editar Ônibus</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Dados do Ônibus</CardTitle>
            <CardDescription>
              Edite as informações do ônibus no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipo_onibus">Tipo de Ônibus *</Label>
                <Input
                  id="tipo_onibus"
                  value={formData.tipo_onibus}
                  onChange={(e) => handleInputChange("tipo_onibus", e.target.value)}
                  placeholder="Ex: Semi-Leito, Convencional"
                  required
                />
              </div>
              <div>
                <Label htmlFor="empresa">Empresa *</Label>
                <Input
                  id="empresa"
                  value={formData.empresa}
                  onChange={(e) => handleInputChange("empresa", e.target.value)}
                  placeholder="Ex: Viação 1001, Kaissara"
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
                  placeholder="Número de identificação do ônibus (opcional)"
                />
              </div>
              <div>
                <Label htmlFor="capacidade">Capacidade *</Label>
                <Input
                  id="capacidade"
                  type="number"
                  value={formData.capacidade}
                  onChange={(e) => handleInputChange("capacidade", e.target.value)}
                  placeholder="Capacidade do ônibus"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Informações adicionais sobre o ônibus"
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Configurações de WiFi
            </CardTitle>
            <CardDescription>
              Configure as informações de WiFi do ônibus (opcional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wifi_ssid">Nome da Rede (SSID)</Label>
                <Input
                  id="wifi_ssid"
                  value={formData.wifi_ssid}
                  onChange={(e) => handleInputChange("wifi_ssid", e.target.value)}
                  placeholder="Nome da rede WiFi"
                />
              </div>
              <div>
                <Label htmlFor="wifi_password">Senha do WiFi</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="wifi_password"
                      type={showPassword ? "text" : "password"}
                      value={formData.wifi_password}
                      onChange={(e) => handleInputChange("wifi_password", e.target.value)}
                      placeholder="Senha da rede WiFi"
                    />
                    {formData.wifi_password && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  {formData.wifi_password && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(formData.wifi_password);
                        toast.success("Senha copiada!");
                      }}
                      title="Copiar senha"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Imagem do Ônibus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentImageUrl && !newImagePath && (
              <div className="space-y-2">
                <Label>Imagem Atual</Label>
                <div className="relative inline-block">
                  <img 
                    src={currentImageUrl} 
                    alt="Imagem atual do ônibus" 
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>
                {currentImageUrl && !newImagePath ? "Substituir Imagem" : "Nova Imagem"}
              </Label>
              <SimpleImageUpload
                value={newImagePath}
                onChange={setNewImagePath}
                maxSizeInMB={5}
              />

            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center max-w-2xl mx-auto">
          <Button 
            className="bg-[#e40016] text-white hover:bg-[#c20012]"
            onClick={() => navigate("/dashboard/onibus")} 
            type="button"
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={isSaving}
            className="bg-[#e40016] text-white hover:bg-[#c20012]"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditarOnibus;