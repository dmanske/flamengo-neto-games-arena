
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Image, X } from "lucide-react";
import { Link } from "react-router-dom";
import { OnibusForm } from "@/components/viagem/OnibusForm";
import { ViagemOnibus } from "@/types/entities";

const CadastrarViagem = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [logoFlamengoDialogOpen, setLogoFlamengoDialogOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFlamengoUrl, setLogoFlamengoUrl] = useState("https://logodetimes.com/times/flamengo/logo-flamengo-256.png");
  const [onibusArray, setOnibusArray] = useState<ViagemOnibus[]>([]);
  
  const [formData, setFormData] = useState({
    adversario: "",
    data_jogo: "",
    rota: "",
    status_viagem: "Aberta",
    valor_padrao: "",
    setor_padrao: "",
    logo_adversario: "",
    logo_flamengo: "https://logodetimes.com/times/flamengo/logo-flamengo-256.png",
  });

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoSelect = (url: string) => {
    setLogoUrl(url);
    handleInputChange("logo_adversario", url);
    setLogoDialogOpen(false);
  };

  const handleLogoFlamengoSelect = (url: string) => {
    setLogoFlamengoUrl(url);
    handleInputChange("logo_flamengo", url);
    setLogoFlamengoDialogOpen(false);
  };

  const clearLogo = () => {
    setLogoUrl("");
    handleInputChange("logo_adversario", "");
  };

  const clearLogoFlamengo = () => {
    setLogoFlamengoUrl("");
    handleInputChange("logo_flamengo", "");
  };

  const handleCustomLogoSubmit = () => {
    const input = document.getElementById('custom-logo') as HTMLInputElement;
    if (input?.value.trim()) {
      handleLogoSelect(input.value.trim());
      input.value = '';
    }
  };

  const handleCustomFlamengoLogoSubmit = () => {
    const input = document.getElementById('custom-flamengo-logo') as HTMLInputElement;
    if (input?.value.trim()) {
      handleLogoFlamengoSelect(input.value.trim());
      input.value = '';
    }
  };

  const handlePrimaryBusChange = (tipo: string, empresa: string) => {
    // Atualizar dados principais da viagem com o primeiro ônibus
    console.log("Primary bus changed:", { tipo, empresa });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.adversario || !formData.data_jogo || !formData.rota || onibusArray.length === 0) {
      toast.error("Por favor, preencha todos os campos obrigatórios e adicione pelo menos um ônibus");
      return;
    }

    setIsLoading(true);

    try {
      // Calcular capacidade total de todos os ônibus
      const capacidadeTotal = onibusArray.reduce((total, onibus) => 
        total + onibus.capacidade_onibus + (onibus.lugares_extras || 0), 0
      );

      // Usar dados do primeiro ônibus como padrão da viagem
      const primeiroOnibus = onibusArray[0];

      const viagemData = {
        adversario: formData.adversario,
        data_jogo: formData.data_jogo,
        tipo_onibus: primeiroOnibus.tipo_onibus,
        empresa: primeiroOnibus.empresa,
        rota: formData.rota,
        capacidade_onibus: capacidadeTotal,
        status_viagem: formData.status_viagem,
        valor_padrao: formData.valor_padrao ? parseFloat(formData.valor_padrao) : null,
        setor_padrao: formData.setor_padrao || null,
        logo_adversario: formData.logo_adversario || null,
        logo_flamengo: formData.logo_flamengo || "https://logodetimes.com/times/flamengo/logo-flamengo-256.png",
      };

      const { data: viagemInserted, error: viagemError } = await supabase
        .from("viagens")
        .insert([viagemData])
        .select()
        .single();

      if (viagemError) throw viagemError;

      // Inserir todos os ônibus da viagem
      const onibusDataArray = onibusArray.map(onibus => ({
        ...onibus,
        viagem_id: viagemInserted.id
      }));

      const { error: onibusError } = await supabase
        .from("viagem_onibus")
        .insert(onibusDataArray);

      if (onibusError) throw onibusError;

      toast.success("Viagem criada com sucesso!");
      navigate(`/dashboard/viagem/${viagemInserted.id}`);
    } catch (error: any) {
      console.error("Erro ao criar viagem:", error);
      toast.error("Erro ao criar viagem");
    } finally {
      setIsLoading(false);
    }
  };

  // Logos predefinidos
  const logosAdversarios = [
    { name: "Botafogo", url: "https://logodetimes.com/times/botafogo/logo-botafogo-256.png" },
    { name: "Corinthians", url: "https://logodetimes.com/times/corinthians/logo-corinthians-256.png" },
    { name: "Palmeiras", url: "https://logodetimes.com/times/palmeiras/logo-palmeiras-256.png" },
    { name: "São Paulo", url: "https://logodetimes.com/times/sao-paulo/logo-sao-paulo-256.png" },
    { name: "Santos", url: "https://logodetimes.com/times/santos/logo-santos-256.png" },
    { name: "Grêmio", url: "https://logodetimes.com/times/gremio/logo-gremio-256.png" },
    { name: "Internacional", url: "https://logodetimes.com/times/internacional/logo-internacional-256.png" },
    { name: "Atlético-MG", url: "https://logodetimes.com/times/atletico-mineiro/logo-atletico-mineiro-256.png" },
    { name: "Cruzeiro", url: "https://logodetimes.com/times/cruzeiro/logo-cruzeiro-256.png" },
    { name: "Vasco", url: "https://logodetimes.com/times/vasco-da-gama/logo-vasco-da-gama-256.png" },
  ];

  const logosFlamengo = [
    { name: "Logo Oficial", url: "https://logodetimes.com/times/flamengo/logo-flamengo-256.png" },
    { name: "Escudo Clássico", url: "https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png" },
    { name: "Logo Moderno", url: "https://logoeps.com/wp-content/uploads/2013/03/flamengo-vector-logo.png" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="container py-6">
        <div className="mb-6 flex items-center gap-2">
          <Button variant="outline" size="icon" asChild className="border-blue-200 hover:bg-blue-50">
            <Link to="/dashboard/viagens">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Cadastrar Nova Viagem</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas da Viagem */}
          <Card className="bg-white border-gray-200 shadow-professional">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl">
              <CardTitle className="text-lg font-semibold">Informações da Viagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adversario" className="text-gray-700 font-medium">Adversário *</Label>
                  <Input
                    id="adversario"
                    value={formData.adversario}
                    onChange={(e) => handleInputChange("adversario", e.target.value)}
                    placeholder="Nome do time adversário"
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="data_jogo" className="text-gray-700 font-medium">Data do Jogo *</Label>
                  <Input
                    id="data_jogo"
                    type="datetime-local"
                    value={formData.data_jogo}
                    onChange={(e) => handleInputChange("data_jogo", e.target.value)}
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valor_padrao" className="text-gray-700 font-medium">Valor Padrão (R$)</Label>
                  <Input
                    id="valor_padrao"
                    type="number"
                    step="0.01"
                    value={formData.valor_padrao}
                    onChange={(e) => handleInputChange("valor_padrao", e.target.value)}
                    placeholder="0.00"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="setor_padrao" className="text-gray-700 font-medium">Setor Padrão</Label>
                  <Select onValueChange={(value) => handleInputChange("setor_padrao", value)}>
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white">
                      <SelectValue placeholder="Selecionar setor" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 z-50">
                      <SelectItem value="A definir" className="bg-white text-gray-900 hover:bg-gray-50">A definir</SelectItem>
                      <SelectItem value="Norte" className="bg-white text-gray-900 hover:bg-gray-50">Norte</SelectItem>
                      <SelectItem value="Sul" className="bg-white text-gray-900 hover:bg-gray-50">Sul</SelectItem>
                      <SelectItem value="Leste Inferior" className="bg-white text-gray-900 hover:bg-gray-50">Leste Inferior</SelectItem>
                      <SelectItem value="Leste Superior" className="bg-white text-gray-900 hover:bg-gray-50">Leste Superior</SelectItem>
                      <SelectItem value="Oeste" className="bg-white text-gray-900 hover:bg-gray-50">Oeste</SelectItem>
                      <SelectItem value="Maracanã Mais" className="bg-white text-gray-900 hover:bg-gray-50">Maracanã Mais</SelectItem>
                      <SelectItem value="Sem ingresso" className="bg-white text-gray-900 hover:bg-gray-50">Sem ingresso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="rota" className="text-gray-700 font-medium">Rota *</Label>
                <Input
                  id="rota"
                  value={formData.rota}
                  onChange={(e) => handleInputChange("rota", e.target.value)}
                  placeholder="Ex: Rio de Janeiro - São Paulo"
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Logo do Adversário */}
              <div>
                <Label className="text-gray-700 font-medium">Logo do Adversário</Label>
                <div className="flex items-center gap-4 mt-2">
                  {logoUrl ? (
                    <div className="relative">
                      <img 
                        src={logoUrl} 
                        alt="Logo do adversário" 
                        className="w-16 h-16 object-contain border border-gray-200 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={clearLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLogoDialogOpen(true)}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Selecionar Logo
                  </Button>
                </div>
              </div>

              {/* Logo do Flamengo */}
              <div>
                <Label className="text-gray-700 font-medium">Logo do Flamengo</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="relative">
                    <img 
                      src={logoFlamengoUrl} 
                      alt="Logo do Flamengo" 
                      className="w-16 h-16 object-contain border border-gray-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={clearLogoFlamengo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLogoFlamengoDialogOpen(true)}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Alterar Logo
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="status_viagem" className="text-gray-700 font-medium">Status da Viagem</Label>
                <Select 
                  value={formData.status_viagem}
                  onValueChange={(value) => handleInputChange("status_viagem", value)}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 z-50">
                    <SelectItem value="Aberta" className="bg-white text-gray-900 hover:bg-gray-50">Aberta</SelectItem>
                    <SelectItem value="Em Andamento" className="bg-white text-gray-900 hover:bg-gray-50">Em Andamento</SelectItem>
                    <SelectItem value="Finalizada" className="bg-white text-gray-900 hover:bg-gray-50">Finalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Seção de Ônibus */}
          <Card className="bg-white border-gray-200 shadow-professional">
            <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-t-xl">
              <CardTitle className="text-lg font-semibold">Ônibus da Viagem</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <OnibusForm 
                onibusArray={onibusArray}
                onChange={setOnibusArray}
                onPrimaryBusChange={handlePrimaryBusChange}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-medium shadow-professional hover:shadow-professional-md transition-all duration-200"
            >
              {isLoading ? "Criando..." : "Criar Viagem"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              asChild
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 font-medium"
            >
              <Link to="/dashboard/viagens">Cancelar</Link>
            </Button>
          </div>
        </form>

        {/* Dialog para seleção de logo do adversário */}
        <Dialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Selecionar Logo do Adversário</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-5 gap-4 py-4">
              {logosAdversarios.map((logo) => (
                <button
                  key={logo.name}
                  type="button"
                  onClick={() => handleLogoSelect(logo.url)}
                  className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <img src={logo.url} alt={logo.name} className="w-12 h-12 object-contain mb-2" />
                  <span className="text-xs text-gray-600 text-center">{logo.name}</span>
                </button>
              ))}
            </div>
            <div className="border-t pt-4">
              <Label htmlFor="custom-logo" className="text-gray-700 font-medium">URL personalizada:</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="custom-logo"
                  placeholder="https://exemplo.com/logo.png"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCustomLogoSubmit();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleCustomLogoSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Usar
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLogoDialogOpen(false)} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para seleção de logo do Flamengo */}
        <Dialog open={logoFlamengoDialogOpen} onOpenChange={setLogoFlamengoDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Selecionar Logo do Flamengo</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4 py-4">
              {logosFlamengo.map((logo) => (
                <button
                  key={logo.name}
                  type="button"
                  onClick={() => handleLogoFlamengoSelect(logo.url)}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                  <img src={logo.url} alt={logo.name} className="w-16 h-16 object-contain mb-2" />
                  <span className="text-xs text-gray-600 text-center">{logo.name}</span>
                </button>
              ))}
            </div>
            <div className="border-t pt-4">
              <Label htmlFor="custom-flamengo-logo" className="text-gray-700 font-medium">URL personalizada:</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="custom-flamengo-logo"
                  placeholder="https://exemplo.com/logo-flamengo.png"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCustomFlamengoLogoSubmit();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleCustomFlamengoLogoSubmit}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Usar
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLogoFlamengoDialogOpen(false)} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CadastrarViagem;
