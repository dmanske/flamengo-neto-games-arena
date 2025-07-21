
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MapPin, Calendar, Users, DollarSign, Edit, Eye, Store, Package, Plus, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from 'sonner';
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { ModernButton } from "@/components/ui/modern-button";

interface Viagem {
  id: string;
  adversario: string;
  data_jogo: string;
  rota: string;
  capacidade_onibus: number;
  valor_padrao: number;
  status_viagem: string;
  logo_adversario?: string;
  descricao_loja?: string;
  destaque_loja?: boolean;
  ativa_loja?: boolean;
  ordem_exibicao?: number;
}

interface LojaConfig {
  id?: string;
  titulo_loja: string;
  descricao_loja: string;
  cor_primaria: string;
  cor_secundaria: string;
  logo_url: string;
  banner_url: string;
  ativa: boolean;
}

const LojaAdmin = () => {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [lojaConfig, setLojaConfig] = useState<LojaConfig>({
    titulo_loja: "Neto Tours Viagens - Caravanas Rubro-Negras",
    descricao_loja: "As melhores viagens para acompanhar o Mengão! Pagamento seguro e confirmação imediata.",
    cor_primaria: "#dc2626",
    cor_secundaria: "#000000",
    logo_url: "https://logodetimes.com/wp-content/uploads/flamengo.png",
    banner_url: "",
    ativa: true
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingConfig, setEditingConfig] = useState(false);

  useEffect(() => {
    fetchViagens();
    fetchLojaConfig();
  }, []);

  const fetchViagens = async () => {
    try {
      const { data, error } = await supabase
        .from('viagens')
        .select('*')
        .order('data_jogo', { ascending: true });

      if (error) throw error;
      setViagens(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar viagens:', error);
      toast.error('Erro ao carregar viagens');
    } finally {
      setLoading(false);
    }
  };

  const fetchLojaConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .in('key', [
          'loja_titulo', 'loja_descricao', 'loja_cor_primaria', 
          'loja_cor_secundaria', 'loja_logo_url', 'loja_banner_url', 'loja_ativa'
        ]);

      if (error) throw error;

      if (data) {
        const config = data.reduce((acc, item) => {
          switch (item.key) {
            case 'loja_titulo':
              acc.titulo_loja = item.value || acc.titulo_loja;
              break;
            case 'loja_descricao':
              acc.descricao_loja = item.value || acc.descricao_loja;
              break;
            case 'loja_cor_primaria':
              acc.cor_primaria = item.value || acc.cor_primaria;
              break;
            case 'loja_cor_secundaria':
              acc.cor_secundaria = item.value || acc.cor_secundaria;
              break;
            case 'loja_logo_url':
              acc.logo_url = item.value || acc.logo_url;
              break;
            case 'loja_banner_url':
              acc.banner_url = item.value || acc.banner_url;
              break;
            case 'loja_ativa':
              acc.ativa = item.value === 'true';
              break;
          }
          return acc;
        }, { ...lojaConfig });

        setLojaConfig(config);
      }
    } catch (error: any) {
      console.error('Erro ao buscar configuração da loja:', error);
    }
  };

  const updateViagemLojaStatus = async (viagemId: string, field: string, value: any) => {
    try {
      const updateData: any = {};
      updateData[field] = value;

      const { error } = await supabase
        .from('viagens')
        .update(updateData)
        .eq('id', viagemId);

      if (error) throw error;

      setViagens(prev => prev.map(v => 
        v.id === viagemId ? { ...v, [field]: value } : v
      ));

      toast.success('Viagem atualizada na loja!');
    } catch (error: any) {
      console.error('Erro ao atualizar viagem:', error);
      toast.error('Erro ao atualizar viagem na loja');
    }
  };

  const saveLojaConfig = async () => {
    try {
      setLoading(true);
      
      const configItems = [
        { key: 'loja_titulo', value: lojaConfig.titulo_loja },
        { key: 'loja_descricao', value: lojaConfig.descricao_loja },
        { key: 'loja_cor_primaria', value: lojaConfig.cor_primaria },
        { key: 'loja_cor_secundaria', value: lojaConfig.cor_secundaria },
        { key: 'loja_logo_url', value: lojaConfig.logo_url },
        { key: 'loja_banner_url', value: lojaConfig.banner_url },
        { key: 'loja_ativa', value: lojaConfig.ativa.toString() }
      ];

      for (const item of configItems) {
        const { error } = await supabase
          .from('system_config')
          .upsert({ 
            key: item.key, 
            value: item.value,
            updated_at: new Date().toISOString()
          }, { 
            onConflict: 'key' 
          });

        if (error) throw error;
      }

      toast.success('Configuração da loja salva com sucesso!');
      setEditingConfig(false);
    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração da loja');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredViagens = viagens.filter(viagem =>
    viagem.adversario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    viagem.rota.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
          <p className="text-lg">Carregando configurações da loja...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Store className="h-8 w-8 text-red-600" />
              Gerenciar Loja
            </h1>
            <p className="text-gray-600 mt-2">Configure a aparência e produtos da sua loja online</p>
          </div>
          
          <div className="flex gap-4">
            <ModernButton 
              variant="secondary" 
              onClick={() => window.open('/loja', '_blank')}
            >
              <Eye className="mr-2 h-4 w-4" />
              Visualizar Loja
            </ModernButton>
            <ModernButton 
              variant="primary"
              onClick={() => setEditingConfig(!editingConfig)}
            >
              <Edit className="mr-2 h-4 w-4" />
              {editingConfig ? 'Cancelar' : 'Configurar Loja'}
            </ModernButton>
          </div>
        </div>
      </div>

      {/* Configuração da Loja */}
      {editingConfig && (
        <EnhancedCard variant="glass" className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Configuração da Loja
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título da Loja</Label>
                  <Input
                    id="titulo"
                    value={lojaConfig.titulo_loja}
                    onChange={(e) => setLojaConfig(prev => ({ ...prev, titulo_loja: e.target.value }))}
                    placeholder="Nome da sua loja"
                  />
                </div>
                
                <div>
                  <Label htmlFor="logo">URL do Logo</Label>
                  <Input
                    id="logo"
                    value={lojaConfig.logo_url}
                    onChange={(e) => setLojaConfig(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="https://exemplo.com/logo.png"
                  />
                </div>
                
                <div>
                  <Label htmlFor="banner">URL do Banner</Label>
                  <Input
                    id="banner"
                    value={lojaConfig.banner_url}
                    onChange={(e) => setLojaConfig(prev => ({ ...prev, banner_url: e.target.value }))}
                    placeholder="https://exemplo.com/banner.jpg"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="descricao">Descrição da Loja</Label>
                  <Textarea
                    id="descricao"
                    value={lojaConfig.descricao_loja}
                    onChange={(e) => setLojaConfig(prev => ({ ...prev, descricao_loja: e.target.value }))}
                    placeholder="Descrição que aparecerá na loja"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cor-primaria">Cor Primária</Label>
                    <Input
                      id="cor-primaria"
                      type="color"
                      value={lojaConfig.cor_primaria}
                      onChange={(e) => setLojaConfig(prev => ({ ...prev, cor_primaria: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cor-secundaria">Cor Secundária</Label>
                    <Input
                      id="cor-secundaria"
                      type="color"
                      value={lojaConfig.cor_secundaria}
                      onChange={(e) => setLojaConfig(prev => ({ ...prev, cor_secundaria: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="loja-ativa"
                    checked={lojaConfig.ativa}
                    onCheckedChange={(checked) => setLojaConfig(prev => ({ ...prev, ativa: checked }))}
                  />
                  <Label htmlFor="loja-ativa">Loja Ativa</Label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={saveLojaConfig} disabled={loading}>
                {loading ? "Salvando..." : "Salvar Configuração"}
              </Button>
            </div>
          </CardContent>
        </EnhancedCard>
      )}

      {/* Status da Loja */}
      <div className="mb-6">
        <EnhancedCard variant={lojaConfig.ativa ? "elevated" : "glass"} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${lojaConfig.ativa ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="font-medium">
                Status da Loja: {lojaConfig.ativa ? 'Ativa' : 'Inativa'}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {filteredViagens.filter(v => v.ativa_loja).length} viagens publicadas
            </span>
          </div>
        </EnhancedCard>
      </div>

      {/* Busca e Filtros */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar viagens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="outline">
            {filteredViagens.length} viagem(ns) encontrada(s)
          </Badge>
        </div>
      </div>

      {/* Lista de Viagens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredViagens.map((viagem) => (
          <EnhancedCard 
            key={viagem.id} 
            variant="interactive" 
            className="overflow-hidden"
            glow={viagem.destaque_loja}
          >
            {viagem.destaque_loja && (
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-center py-2 font-bold">
                ⭐ DESTAQUE ⭐
              </div>
            )}
            
            <CardHeader className="bg-red-600 text-white">
              <div className="flex items-center justify-between mb-2">
                <Badge 
                  variant={viagem.status_viagem === 'Aberta' ? 'default' : 'secondary'}
                  className="bg-white text-red-600"
                >
                  {viagem.status_viagem}
                </Badge>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${viagem.ativa_loja ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                  <span className="text-xs">
                    {viagem.ativa_loja ? 'Publicada' : 'Rascunho'}
                  </span>
                </div>
              </div>
              <CardTitle className="text-lg">
                Flamengo x {viagem.adversario}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(viagem.data_jogo)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{viagem.rota}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{viagem.capacidade_onibus} vagas</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="font-bold">{formatCurrency(viagem.valor_padrao)}</span>
                </div>
              </div>
              
              {/* Controles da Loja */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`ativa-${viagem.id}`} className="text-sm">
                    Publicar na Loja
                  </Label>
                  <Switch
                    id={`ativa-${viagem.id}`}
                    checked={viagem.ativa_loja || false}
                    onCheckedChange={(checked) => 
                      updateViagemLojaStatus(viagem.id, 'ativa_loja', checked)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor={`destaque-${viagem.id}`} className="text-sm">
                    Destacar
                  </Label>
                  <Switch
                    id={`destaque-${viagem.id}`}
                    checked={viagem.destaque_loja || false}
                    onCheckedChange={(checked) => 
                      updateViagemLojaStatus(viagem.id, 'destaque_loja', checked)
                    }
                  />
                </div>
                
                <div>
                  <Label htmlFor={`descricao-${viagem.id}`} className="text-sm">
                    Descrição na Loja
                  </Label>
                  <Textarea
                    id={`descricao-${viagem.id}`}
                    value={viagem.descricao_loja || ''}
                    onChange={(e) => 
                      updateViagemLojaStatus(viagem.id, 'descricao_loja', e.target.value)
                    }
                    placeholder="Descrição especial para a loja..."
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </EnhancedCard>
        ))}
      </div>

      {filteredViagens.length === 0 && (
        <EnhancedCard variant="glass" className="text-center py-16">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Nenhuma viagem encontrada
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Tente ajustar os filtros de busca' : 'Cadastre viagens para começar a vender na loja'}
          </p>
          {!searchTerm && (
            <Button onClick={() => window.location.href = '/dashboard/cadastrar-viagem'}>
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Nova Viagem
            </Button>
          )}
        </EnhancedCard>
      )}
    </div>
  );
};

export default LojaAdmin;
