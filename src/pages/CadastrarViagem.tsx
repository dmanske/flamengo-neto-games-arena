import React, { useState, useEffect } from "react";
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
  DialogDescription,
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
  const [logosAdversarios, setLogosAdversarios] = useState([]);
  const [isLoadingAdversarios, setIsLoadingAdversarios] = useState(true);
  
  const [formData, setFormData] = useState({
    adversario: "",
    data_jogo: new Date().toISOString().split('T')[0],
    cidade_embarque: "Blumenau",
    status_viagem: "Aberta",
    valor_padrao: "",
    setor_padrao: "A definir",
    logo_adversario: "",
    logo_flamengo: "https://logodetimes.com/times/flamengo/logo-flamengo-256.png",
    passeios_pagos: [] as string[],
    outro_passeio: "",
  });

  // Adicionar estados para modal de adicionar/editar adversário
  const [showAddAdversario, setShowAddAdversario] = useState(false);
  const [showEditAdversario, setShowEditAdversario] = useState(false);
  const [adversarioEditando, setAdversarioEditando] = useState(null);
  const [novoNomeAdversario, setNovoNomeAdversario] = useState("");
  const [novaUrlAdversario, setNovaUrlAdversario] = useState("");

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

    // Se não houver ônibus no array, mas os campos do novo ônibus estiverem preenchidos, adiciona automaticamente
    if (onibusArray.length === 0) {
      // Tenta acessar os campos do OnibusForm pelo DOM
      const empresa = (document.getElementById('empresa') as HTMLInputElement)?.value;
      const tipo_onibus = (document.getElementById('tipo_onibus') as HTMLInputElement)?.value;
      const capacidade_onibus = parseInt((document.getElementById('capacidade') as HTMLInputElement)?.value || '0');
      const lugares_extras = parseInt((document.getElementById('lugares_extras') as HTMLInputElement)?.value || '0');
      if (empresa && tipo_onibus && capacidade_onibus) {
        const onibus = {
          id: `temp-${Date.now()}`,
          tipo_onibus,
          empresa,
          capacidade_onibus,
          lugares_extras: lugares_extras || 0,
          numero_identificacao: `${empresa} - ${tipo_onibus}`,
          viagem_id: "",
        };
        onibusArray.push(onibus);
      } else {
        toast.error("Por favor, adicione pelo menos um ônibus");
        return;
      }
    }

    setIsLoading(true);

    try {
      // Calcular capacidade total de todos os ônibus
      const capacidadeTotal = onibusArray.reduce((total, onibus) => 
        total + onibus.capacidade_onibus + (onibus.lugares_extras || 0), 0
      );

      console.log('onibusArray no submit:', onibusArray); // Debug

      // Usar dados do primeiro ônibus como padrão da viagem
      const primeiroOnibus = onibusArray[0];

      const viagemData = {
        adversario: formData.adversario,
        data_jogo: formData.data_jogo,
        tipo_onibus: primeiroOnibus ? primeiroOnibus.tipo_onibus : null,
        empresa: primeiroOnibus ? primeiroOnibus.empresa : null,
        capacidade_onibus: primeiroOnibus ? primeiroOnibus.capacidade_onibus : null,
        cidade_embarque: formData.cidade_embarque,
        status_viagem: formData.status_viagem,
        valor_padrao: formData.valor_padrao ? parseFloat(formData.valor_padrao) : null,
        setor_padrao: formData.setor_padrao || null,
        logo_adversario: formData.logo_adversario || null,
        logo_flamengo: formData.logo_flamengo || "https://logodetimes.com/times/flamengo/logo-flamengo-256.png",
        passeios_pagos: formData.passeios_pagos,
        outro_passeio: formData.outro_passeio,
      };

      const { data: viagemInserted, error: viagemError } = await supabase
        .from("viagens")
        .insert([viagemData])
        .select()
        .single();

      if (viagemError) throw viagemError;

      // Inserir todos os ônibus da viagem
      const onibusDataArray = onibusArray.map(({ id, ...onibus }) => ({
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

  // Buscar adversários do Supabase ao carregar o componente
  useEffect(() => {
    const fetchAdversarios = async () => {
      setIsLoadingAdversarios(true);
      const { data, error } = await supabase.from("adversarios").select("id, nome, logo_url");
      if (!error && data) {
        setLogosAdversarios(data.map(item => ({ id: item.id, name: item.nome, url: item.logo_url })));
      }
      setIsLoadingAdversarios(false);
    };
    fetchAdversarios();
  }, []);

  // Função para adicionar adversário
  const handleAddAdversario = async (nome, url) => {
    const { data, error } = await supabase.from("adversarios").insert([{ nome, logo_url: url }]).select();
    if (!error && data && data[0]) {
      setLogosAdversarios(prev => [...prev, { id: data[0].id, name: nome, url }]);
    }
  };

  // Função para editar adversário
  const handleEditAdversario = async (id, nome, url) => {
    const { error } = await supabase.from("adversarios").update({ nome, logo_url: url }).eq("id", id);
    if (!error) {
      setLogosAdversarios(prev => prev.map(a => a.id === id ? { ...a, name: nome, url } : a));
    }
  };

  // Função para remover adversário
  const handleRemoveAdversario = async (id) => {
    const { error } = await supabase.from("adversarios").delete().eq("id", id);
    if (!error) {
      setLogosAdversarios(prev => prev.filter(a => a.id !== id));
    }
  };

  // Logos predefinidos
  const logosFlamengo = [
    { name: "Logo Oficial", url: "https://logodetimes.com/times/flamengo/logo-flamengo-256.png" },
    { name: "Escudo Clássico", url: "https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png" },
    { name: "Logo Moderno", url: "https://logoeps.com/wp-content/uploads/2013/03/flamengo-vector-logo.png" },
  ];

  // Função para abrir modal de edição
  const openEditAdversario = (adv) => {
    setAdversarioEditando(adv);
    setNovoNomeAdversario(adv.name);
    setNovaUrlAdversario(adv.url);
    setShowEditAdversario(true);
  };

  // Função para abrir modal de adicionar
  const openAddAdversario = () => {
    setNovoNomeAdversario("");
    setNovaUrlAdversario("");
    setShowAddAdversario(true);
  };

  // Função para salvar edição
  const salvarEdicaoAdversario = async () => {
    await handleEditAdversario(adversarioEditando.id, novoNomeAdversario, novaUrlAdversario);
    setShowEditAdversario(false);
    setAdversarioEditando(null);
  };

  // Função para salvar novo adversário
  const salvarNovoAdversario = async () => {
    await handleAddAdversario(novoNomeAdversario, novaUrlAdversario);
    setShowAddAdversario(false);
  };

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
                    type="date"
                    value={formData.data_jogo}
                    onChange={(e) => handleInputChange("data_jogo", e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
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
                  <Select value={formData.setor_padrao} onValueChange={(value) => handleInputChange("setor_padrao", value)}>
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900">
                      <SelectValue placeholder="Selecionar setor" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 z-50 text-gray-900">
                      <SelectItem value="A definir" className="bg-white text-gray-900 hover:bg-blue-50">A definir</SelectItem>
                      <SelectItem value="Norte" className="bg-white text-gray-900 hover:bg-blue-50">Norte</SelectItem>
                      <SelectItem value="Sul" className="bg-white text-gray-900 hover:bg-blue-50">Sul</SelectItem>
                      <SelectItem value="Leste Inferior" className="bg-white text-gray-900 hover:bg-blue-50">Leste Inferior</SelectItem>
                      <SelectItem value="Leste Superior" className="bg-white text-gray-900 hover:bg-blue-50">Leste Superior</SelectItem>
                      <SelectItem value="Oeste" className="bg-white text-gray-900 hover:bg-blue-50">Oeste</SelectItem>
                      <SelectItem value="Maracanã Mais" className="bg-white text-gray-900 hover:bg-blue-50">Maracanã Mais</SelectItem>
                      <SelectItem value="Sem ingresso" className="bg-white text-gray-900 hover:bg-blue-50">Sem ingresso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cidade_embarque" className="text-gray-700 font-medium">Cidade de Embarque</Label>
                  <Select value={formData.cidade_embarque} onValueChange={(value) => handleInputChange("cidade_embarque", value)}>
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900">
                      <SelectValue placeholder="Selecionar cidade" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 z-50 text-gray-900">
                      <SelectItem value="Blumenau" className="bg-white text-gray-900 hover:bg-blue-50">Blumenau</SelectItem>
                      <SelectItem value="Itajaí" className="bg-white text-gray-900 hover:bg-blue-50">Itajaí</SelectItem>
                      <SelectItem value="Piçarras" className="bg-white text-gray-900 hover:bg-blue-50">Piçarras</SelectItem>
                      <SelectItem value="Joinville" className="bg-white text-gray-900 hover:bg-blue-50">Joinville</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4">
                <Label className="text-gray-700 font-medium">Passeios Pagos</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {["AquaRio", "Rio Star", "Museu de Cera Dreamland", "Cristo Redentor", "Pão de Açúcar"].map((passeio) => (
                    <div key={passeio} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={passeio}
                        checked={formData.passeios_pagos.includes(passeio)}
                        onChange={(e) => {
                          const newPasseios = e.target.checked
                            ? [...formData.passeios_pagos, passeio]
                            : formData.passeios_pagos.filter(p => p !== passeio);
                          handleInputChange("passeios_pagos", newPasseios);
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <Label htmlFor={passeio}>{passeio}</Label>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="outro"
                      checked={formData.passeios_pagos.includes("Outro")}
                      onChange={(e) => {
                        const newPasseios = e.target.checked
                          ? [...formData.passeios_pagos, "Outro"]
                          : formData.passeios_pagos.filter(p => p !== "Outro");
                        handleInputChange("passeios_pagos", newPasseios);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Label htmlFor="outro">Outro</Label>
                  </div>
                  {formData.passeios_pagos.includes("Outro") && (
                    <Input
                      type="text"
                      value={formData.outro_passeio}
                      onChange={(e) => handleInputChange("outro_passeio", e.target.value)}
                      placeholder="Especifique o passeio"
                      className="mt-2"
                    />
                  )}
                </div>
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
                <Select value={formData.status_viagem} onValueChange={(value) => handleInputChange("status_viagem", value)}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 z-50 text-gray-900">
                    <SelectItem value="Aberta" className="bg-white text-gray-900 hover:bg-blue-50">Aberta</SelectItem>
                    <SelectItem value="Em Andamento" className="bg-white text-gray-900 hover:bg-blue-50">Em Andamento</SelectItem>
                    <SelectItem value="Finalizada" className="bg-white text-gray-900 hover:bg-blue-50">Finalizada</SelectItem>
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
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Selecionar Logo do Time Adversário</DialogTitle>
              <DialogDescription>
                Escolha, edite ou adicione um adversário
              </DialogDescription>
            </DialogHeader>
            {isLoadingAdversarios ? (
              <div>Carregando adversários...</div>
            ) : (
              <div className="grid grid-cols-5 gap-4 py-4">
                {logosAdversarios.map((logo) => (
                  <div key={logo.id} className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
                    <img src={logo.url} alt={logo.name} className="w-12 h-12 object-contain mb-2" />
                    <span className="text-xs text-gray-600 text-center">{logo.name}</span>
                    <div className="flex gap-1 mt-1">
                      <button onClick={() => openEditAdversario(logo)} className="text-blue-600 text-xs">Editar</button>
                      <button onClick={() => handleRemoveAdversario(logo.id)} className="text-red-600 text-xs">Remover</button>
                    </div>
                    <button onClick={() => handleLogoSelect(logo.url)} className="mt-1 text-xs text-green-700">Usar</button>
                  </div>
                ))}
              </div>
            )}
            {/* Botão para adicionar novo adversário */}
            <div className="mt-4">
              <button onClick={openAddAdversario} className="bg-blue-600 text-white px-3 py-1 rounded">Adicionar novo adversário</button>
            </div>
            {/* Modal de adicionar adversário */}
            {showAddAdversario && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
                  <h3 className="text-lg font-bold mb-2">Adicionar novo adversário</h3>
                  <input
                    type="text"
                    placeholder="Nome do adversário"
                    value={novoNomeAdversario}
                    onChange={e => setNovoNomeAdversario(e.target.value)}
                    className="border p-2 w-full mb-2"
                  />
                  <input
                    type="text"
                    placeholder="URL do logo"
                    value={novaUrlAdversario}
                    onChange={e => setNovaUrlAdversario(e.target.value)}
                    className="border p-2 w-full mb-2"
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowAddAdversario(false)} className="px-3 py-1 border rounded">Cancelar</button>
                    <button onClick={salvarNovoAdversario} className="px-3 py-1 bg-blue-600 text-white rounded">Salvar</button>
                  </div>
                </div>
              </div>
            )}
            {/* Modal de editar adversário */}
            {showEditAdversario && adversarioEditando && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
                  <h3 className="text-lg font-bold mb-2">Editar adversário</h3>
                  <input
                    type="text"
                    placeholder="Nome do adversário"
                    value={novoNomeAdversario}
                    onChange={e => setNovoNomeAdversario(e.target.value)}
                    className="border p-2 w-full mb-2"
                  />
                  <input
                    type="text"
                    placeholder="URL do logo"
                    value={novaUrlAdversario}
                    onChange={e => setNovaUrlAdversario(e.target.value)}
                    className="border p-2 w-full mb-2"
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowEditAdversario(false)} className="px-3 py-1 border rounded">Cancelar</button>
                    <button onClick={salvarEdicaoAdversario} className="px-3 py-1 bg-blue-600 text-white rounded">Salvar</button>
                  </div>
                </div>
              </div>
            )}
            {/* Resto do conteúdo do Dialog (input de URL, etc) */}
            <div className="space-y-4">
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
