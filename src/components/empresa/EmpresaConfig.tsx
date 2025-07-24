import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Save, Image } from 'lucide-react';
import { toast } from 'sonner';

interface EmpresaData {
  id?: string;
  nome: string;
  nome_fantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  whatsapp: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  logo_url: string;
  logo_bucket_path: string;
  site: string;
  instagram: string;
  facebook: string;
  descricao: string;
}

export default function EmpresaConfig() {
  const [empresa, setEmpresa] = useState<EmpresaData>({
    nome: '',
    nome_fantasia: '',
    cnpj: '',
    email: '',
    telefone: '',
    whatsapp: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    logo_url: '',
    logo_bucket_path: '',
    site: '',
    instagram: '',
    facebook: '',
    descricao: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    carregarDadosEmpresa();
  }, []);

  const carregarDadosEmpresa = async () => {
    try {
      const { data, error } = await supabase
        .from('empresa_config')
        .select('*')
        .eq('ativo', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar dados da empresa:', error);
        return;
      }

      if (data) {
        setEmpresa(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipo de arquivo não permitido. Use JPG, PNG, GIF, WebP ou SVG.');
        return;
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 5MB.');
        return;
      }

      setLogoFile(file);
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return null;

    setUploading(true);
    try {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `logo-empresa-${Date.now()}.${fileExt}`;
      const filePath = `empresa/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, logoFile);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da logo:', error);
      toast.error('Erro ao fazer upload da logo');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const salvarDados = async () => {
    setLoading(true);
    try {
      let logoUrl = empresa.logo_url;
      let logoBucketPath = empresa.logo_bucket_path;

      // Se há um novo arquivo de logo, fazer upload
      if (logoFile) {
        const newLogoUrl = await uploadLogo();
        if (newLogoUrl) {
          logoUrl = newLogoUrl;
          logoBucketPath = newLogoUrl.split('/').slice(-2).join('/'); // Pegar apenas o caminho relativo
        }
      }

      const dadosParaSalvar = {
        ...empresa,
        logo_url: logoUrl,
        logo_bucket_path: logoBucketPath
      };

      if (empresa.id) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('empresa_config')
          .update(dadosParaSalvar)
          .eq('id', empresa.id);

        if (error) throw error;
      } else {
        // Criar novo registro
        const { data, error } = await supabase
          .from('empresa_config')
          .insert([dadosParaSalvar])
          .select()
          .single();

        if (error) throw error;
        setEmpresa(data);
      }

      toast.success('Dados da empresa salvos com sucesso!');
      setLogoFile(null);
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast.error('Erro ao salvar dados da empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-6 w-6" />
            Configurações da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-4">
            <Label>Logo da Empresa</Label>
            <div className="flex items-center gap-4">
              {empresa.logo_url && (
                <img 
                  src={empresa.logo_url} 
                  alt="Logo atual" 
                  className="h-20 w-20 object-contain border rounded"
                />
              )}
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mb-2"
                />
                {logoFile && (
                  <p className="text-sm text-gray-600">
                    Arquivo selecionado: {logoFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome da Empresa *</Label>
              <Input
                id="nome"
                value={empresa.nome}
                onChange={(e) => setEmpresa({...empresa, nome: e.target.value})}
                placeholder="Nome oficial da empresa"
              />
            </div>
            <div>
              <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
              <Input
                id="nome_fantasia"
                value={empresa.nome_fantasia}
                onChange={(e) => setEmpresa({...empresa, nome_fantasia: e.target.value})}
                placeholder="Nome fantasia"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={empresa.cnpj}
                onChange={(e) => setEmpresa({...empresa, cnpj: e.target.value})}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={empresa.email}
                onChange={(e) => setEmpresa({...empresa, email: e.target.value})}
                placeholder="contato@empresa.com"
              />
            </div>
          </div>

          {/* Contato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={empresa.telefone}
                onChange={(e) => setEmpresa({...empresa, telefone: e.target.value})}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={empresa.whatsapp}
                onChange={(e) => setEmpresa({...empresa, whatsapp: e.target.value})}
                placeholder="11999999999"
              />
            </div>
          </div>

          {/* Endereço */}
          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={empresa.endereco}
              onChange={(e) => setEmpresa({...empresa, endereco: e.target.value})}
              placeholder="Rua, número, bairro"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={empresa.cidade}
                onChange={(e) => setEmpresa({...empresa, cidade: e.target.value})}
                placeholder="São Paulo"
              />
            </div>
            <div>
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={empresa.estado}
                onChange={(e) => setEmpresa({...empresa, estado: e.target.value})}
                placeholder="SP"
                maxLength={2}
              />
            </div>
            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={empresa.cep}
                onChange={(e) => setEmpresa({...empresa, cep: e.target.value})}
                placeholder="01234-567"
              />
            </div>
          </div>

          {/* Redes Sociais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="site">Site</Label>
              <Input
                id="site"
                value={empresa.site}
                onChange={(e) => setEmpresa({...empresa, site: e.target.value})}
                placeholder="https://www.empresa.com"
              />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={empresa.instagram}
                onChange={(e) => setEmpresa({...empresa, instagram: e.target.value})}
                placeholder="@empresa"
              />
            </div>
            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={empresa.facebook}
                onChange={(e) => setEmpresa({...empresa, facebook: e.target.value})}
                placeholder="facebook.com/empresa"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="descricao">Descrição da Empresa</Label>
            <Textarea
              id="descricao"
              value={empresa.descricao}
              onChange={(e) => setEmpresa({...empresa, descricao: e.target.value})}
              placeholder="Descreva sua empresa..."
              rows={4}
            />
          </div>

          {/* Botão Salvar */}
          <Button 
            onClick={salvarDados} 
            disabled={loading || uploading}
            className="w-full"
          >
            {loading || uploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                {uploading ? 'Fazendo upload...' : 'Salvando...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}