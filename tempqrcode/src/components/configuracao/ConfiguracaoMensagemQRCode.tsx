import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, RefreshCw, MessageCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const TEMPLATE_PADRAO = `🔥 *{time_principal} vs {adversario}*
📅 *Data:* {data_jogo}

👋 Olá *{nome}*!

📱 *SEU QR CODE PARA LISTA DE PRESENÇA*

✅ *Como usar:*
1️⃣ Mostre este QR code na tela do seu celular
2️⃣ O responsável irá escanear com o celular dele
3️⃣ Sua presença será confirmada automaticamente

🔗 *Link direto:* {link_qrcode}

⚠️ *IMPORTANTE:*
• Mantenha a tela ligada e com bom brilho
• Chegue com antecedência ao local de embarque
• Em caso de dúvidas, entre em contato`;

const VARIAVEIS_DISPONIVEIS = [
  { nome: '{time_principal}', descricao: 'Nome do time principal' },
  { nome: '{adversario}', descricao: 'Time adversário' },
  { nome: '{data_jogo}', descricao: 'Data e hora do jogo' },
  { nome: '{nome}', descricao: 'Nome do passageiro' },
  { nome: '{link_qrcode}', descricao: 'Link direto para o QR Code' },
];

export function ConfiguracaoMensagemQRCode() {
  const [mensagem, setMensagem] = useState(TEMPLATE_PADRAO);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarMensagem();
  }, []);

  const carregarMensagem = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('templates_whatsapp_personalizados')
        .select('conteudo')
        .eq('nome_template', 'qrcode_lista_presenca')
        .eq('ativo', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setMensagem(data.conteudo);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagem:', error);
      toast.error('Erro ao carregar template');
    } finally {
      setLoading(false);
    }
  };

  const salvarMensagem = async () => {
    try {
      setSalvando(true);

      // Verificar se o template existe
      const { data: existente } = await supabase
        .from('templates_whatsapp_personalizados')
        .select('id')
        .eq('nome_template', 'qrcode_lista_presenca')
        .single();

      if (existente) {
        // Atualizar
        const { error } = await supabase
          .from('templates_whatsapp_personalizados')
          .update({
            conteudo: mensagem,
            updated_at: new Date().toISOString()
          })
          .eq('id', existente.id);

        if (error) throw error;
      } else {
        // Criar
        const { error } = await supabase
          .from('templates_whatsapp_personalizados')
          .insert({
            nome_template: 'qrcode_lista_presenca',
            categoria: 'qrcode',
            conteudo: mensagem,
            variaveis_disponiveis: ['time_principal', 'adversario', 'data_jogo', 'nome', 'link_qrcode'],
            ativo: true
          });

        if (error) throw error;
      }

      toast.success('Template salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
      toast.error('Erro ao salvar template');
    } finally {
      setSalvando(false);
    }
  };

  const restaurarPadrao = () => {
    setMensagem(TEMPLATE_PADRAO);
    toast.info('Template restaurado para o padrão');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <CardTitle>Mensagem de QR Code</CardTitle>
        </div>
        <CardDescription>
          Configure a mensagem que será enviada junto com o QR Code de lista de presença
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Variáveis disponíveis */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            <Label className="text-sm font-medium">Variáveis Disponíveis</Label>
          </div>
          <div className="flex flex-wrap gap-2">
            {VARIAVEIS_DISPONIVEIS.map((variavel) => (
              <Badge
                key={variavel.nome}
                variant="outline"
                className="cursor-pointer hover:bg-blue-50"
                onClick={() => {
                  setMensagem(prev => prev + ' ' + variavel.nome);
                  toast.info(`Variável ${variavel.nome} adicionada`);
                }}
                title={variavel.descricao}
              >
                {variavel.nome}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Clique em uma variável para adicioná-la à mensagem
          </p>
        </div>

        {/* Editor de mensagem */}
        <div className="space-y-2">
          <Label htmlFor="mensagem">Template da Mensagem</Label>
          <Textarea
            id="mensagem"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Digite a mensagem..."
            className="min-h-[400px] font-mono text-sm"
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Use as variáveis acima para personalizar a mensagem. Elas serão substituídas automaticamente.
          </p>
        </div>

        {/* Botões */}
        <div className="flex gap-2">
          <Button
            onClick={salvarMensagem}
            disabled={salvando || loading}
            className="flex items-center gap-2"
          >
            {salvando ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {salvando ? 'Salvando...' : 'Salvar Template'}
          </Button>

          <Button
            onClick={restaurarPadrao}
            variant="outline"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Restaurar Padrão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
