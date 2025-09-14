import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, Upload, Copy, Wifi } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { SimpleImageUpload } from "@/components/onibus/SimpleImageUpload";

const CadastrarOnibus = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tipo_onibus: "",
    empresa: "",
    numero_identificacao: "",
    capacidade: "",
    description: "",
    wifiSsid: "",
    wifiPassword: "",
  });

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tipo_onibus || !formData.empresa || !formData.capacidade) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);

    try {
      // Create the main onibus record
      const { data: onibusData, error: onibusError } = await supabase
        .from("onibus")
        .insert({
          tipo_onibus: formData.tipo_onibus,
          empresa: formData.empresa,
          numero_identificacao: formData.numero_identificacao || null,
          capacidade: parseInt(formData.capacidade),
          description: formData.description || null,
          image_path: imagePath,
          wifi_ssid: formData.wifiSsid || null,
          wifi_password: formData.wifiPassword || null,
        })
        .select("id")
        .single();

      if (onibusError) throw onibusError;
      
      // Create the image record linked to the onibus if an image was uploaded
      if (imagePath) {
        const { error: imageError } = await supabase.from("onibus_images").insert({
          tipo_onibus: formData.tipo_onibus,
          empresa: formData.empresa,
          image_url: imagePath,
          onibus_id: onibusData.id
        });
        
        if (imageError) {
          console.error("Erro ao salvar imagem:", imageError);
          // Continue even if image fails, but notify user
          toast.error("Ônibus cadastrado, mas houve um erro ao salvar a imagem");
        }
      }

      toast.success("Ônibus cadastrado com sucesso");
      navigate("/dashboard/onibus");
    } catch (error: any) {
      console.error("Erro ao cadastrar ônibus:", error);
      toast.error(`Erro ao cadastrar ônibus: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold">Cadastrar Ônibus</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Dados do Ônibus</CardTitle>
            <CardDescription>
              Cadastre um novo modelo de ônibus no sistema
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wifiSsid" className="flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  SSID do WiFi
                </Label>
                <Input
                  id="wifiSsid"
                  value={formData.wifiSsid}
                  onChange={(e) => handleInputChange("wifiSsid", e.target.value)}
                  placeholder="Nome da rede WiFi"
                />
              </div>
              <div>
                <Label htmlFor="wifiPassword">Senha do WiFi</Label>
                <div className="flex gap-2">
                  <Input
                    id="wifiPassword"
                    value={formData.wifiPassword}
                    onChange={(e) => handleInputChange("wifiPassword", e.target.value)}
                    placeholder="Senha da rede WiFi"
                    type="password"
                  />
                  {formData.wifiPassword && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(formData.wifiPassword);
                        toast.success("Senha copiada para a área de transferência");
                      }}
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
            <div className="space-y-2">
              <Label>Imagem do Ônibus</Label>
              <SimpleImageUpload
                value={imagePath}
                onChange={setImagePath}
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
            disabled={isLoading}
            className="bg-[#e40016] text-white hover:bg-[#c20012]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : "Cadastrar Ônibus"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CadastrarOnibus;
