import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Copy, Download, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { EnvioAutomaticoWhatsApp } from './EnvioAutomaticoWhatsApp';
import { TesteZAPI } from './TesteZAPI';

interface Passageiro {
  id: string;
  nome?: string;
  telefone?: string;
  clientes?: {
    nome?: string;
    telefone?: string;
  };
}

interface GerarListaContatosProps {
  passageiros: Passageiro[];
  mensagem: string;
  onGerarLista: () => string;
  onBaixarVCF: () => void;
  onRegistrarHistorico: (tipo: string, quantidade: number) => void;
  dadosViagem?: {
    adversario?: string;
    dataJogo?: string;
    dataViagem?: string;
    horario?: string;
    localSaida?: string;
    valor?: string;
    onibus?: string;
    prazo?: string;
  };
}

export const GerarListaContatos: React.FC<GerarListaContatosProps> = ({
  passageiros,
  mensagem,
  onGerarLista,
  onBaixarVCF,
  onRegistrarHistorico,
  dadosViagem
}) => {
  const [modoExibicao, setModoExibicao] = useState<'numeros' | 'vcf' | 'links' | 'automatico'>('automatico');
  const [copiandoLista, setCopiandoLista] = useState(false);
  const [baixandoVCF, setBaixandoVCF] = useState(false);
  
  // Filtrar passageiros com telefone válido
  const passageirosComTelefone = passageiros.filter(passageiro => {
    const telefone = passageiro.telefone || passageiro.clientes?.telefone;
    if (!telefone || telefone.trim() === '') return false;
    
    const telefoneNumeros = telefone.replace(/\D/g, '');
    return telefoneNumeros.length >= 10;
  });
  
  const isDisabled = !mensagem.trim() || passageirosComTelefone.length === 0;
  
  const handleCopiarLista = async () => {
    if (isDisabled) return;
    
    try {
      setCopiandoLista(true);
      const lista = onGerarLista();
      
      await navigator.clipboard.writeText(lista);
      
      toast.success(
        `✅ ${passageirosComTelefone.length} números copiados!`,
        {
          description: 'Cole a lista no WhatsApp Business para criar uma lista de transmissão'
        }
      );
      
      onRegistrarHistorico('lista_copiada', passageirosComTelefone.length);
    } catch (error) {
      console.error('Erro ao copiar lista:', error);
      toast.error('Erro ao copiar lista de números');
    } finally {
      setCopiandoLista(false);
    }
  };
  
  const handleBaixarVCF = async () => {
    if (isDisabled) return;
    
    try {
      setBaixandoVCF(true);
      onBaixarVCF();
      onRegistrarHistorico('vcf_baixado', passageirosComTelefone.length);
    } catch (error) {
      console.error('Erro ao baixar VCF:', error);
      toast.error('Erro ao baixar arquivo de contatos');
    } finally {
      setBaixandoVCF(false);
    }
  };
  
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-800">Gerar Lista de Contatos</h4>
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
            {passageirosComTelefone.length} contatos válidos
          </Badge>
        </div>
        
        <Tabs value={modoExibicao} onValueChange={(value) => setModoExibicao(value as 'numeros' | 'vcf' | 'links' | 'automatico')}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="numeros" className="flex items-center gap-1 text-xs">
              <Copy className="h-3 w-3" />
              Números
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-1 text-xs">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              Links
            </TabsTrigger>
            <TabsTrigger value="automatico" className="flex items-center gap-1 text-xs">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Auto
            </TabsTrigger>
            <TabsTrigger value="vcf" className="flex items-center gap-1 text-xs">
              <Download className="h-3 w-3" />
              VCF
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="numeros" className="space-y-3 mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h5 className="font-medium text-blue-800 mb-2">📋 Como usar a lista de números:</h5>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Clique em "Copiar Lista de Números" abaixo</li>
                <li>Abra o <strong>WhatsApp Business</strong> no seu celular</li>
                <li>Vá em <strong>Menu → Nova transmissão</strong></li>
                <li>Cole os números copiados ou adicione manualmente</li>
                <li>Digite sua mensagem e envie para todos de uma vez!</li>
              </ol>
            </div>
            
            <Button 
              onClick={handleCopiarLista}
              disabled={isDisabled || copiandoLista}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            >
              {copiandoLista ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Copiando...
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar {passageirosComTelefone.length} Números
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="links" className="space-y-3 mt-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h5 className="font-medium text-green-800 mb-2">📱 Melhor opção para iPhone:</h5>
              <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                <li>Clique nos links abaixo (um por vez)</li>
                <li>Cada link abre o WhatsApp com a mensagem pronta</li>
                <li>Clique "Enviar" em cada conversa</li>
                <li>Volte aqui e clique no próximo link</li>
                <li>Repita até enviar para todos!</li>
              </ol>
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-3 bg-gray-50">
              {passageirosComTelefone.map((passageiro, index) => {
                const telefone = passageiro.telefone || passageiro.clientes?.telefone || '';
                const telefoneNumeros = telefone.replace(/\D/g, '');
                const telefoneCompleto = telefoneNumeros.startsWith('55') 
                  ? telefoneNumeros 
                  : `55${telefoneNumeros}`;
                const nome = passageiro.nome || passageiro.clientes?.nome || `Passageiro ${index + 1}`;
                
                // Substituir variáveis na mensagem para este passageiro
                const mensagemPersonalizada = mensagem
                  .replace(/\{nome\}/g, nome)
                  .replace(/\{adversario\}/g, dadosViagem?.adversario || 'Adversário')
                  .replace(/\{dataJogo\}/g, dadosViagem?.dataJogo || 'Data do jogo')
                  .replace(/\{dataViagem\}/g, dadosViagem?.dataViagem || 'Data da viagem')
                  .replace(/\{horario\}/g, dadosViagem?.horario || 'Horário')
                  .replace(/\{localSaida\}/g, dadosViagem?.localSaida || 'Local de saída')
                  .replace(/\{valor\}/g, dadosViagem?.valor || 'R$ 150,00')
                  .replace(/\{onibus\}/g, dadosViagem?.onibus || 'Ônibus')
                  .replace(/\{prazo\}/g, dadosViagem?.prazo || 'Data limite');
                
                const whatsappUrl = `https://wa.me/${telefoneCompleto}?text=${encodeURIComponent(mensagemPersonalizada)}`;
                
                return (
                  <div key={passageiro.id} className="flex items-center justify-between bg-white p-2 rounded border">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-800">{nome}</div>
                      <div className="text-xs text-gray-500">{telefone}</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        window.open(whatsappUrl, '_blank');
                        toast.success(`WhatsApp aberto para ${nome}!`);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                    >
                      <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      Enviar
                    </Button>
                  </div>
                );
              })}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                onClick={() => {
                  passageirosComTelefone.forEach((passageiro, index) => {
                    setTimeout(() => {
                      const telefone = passageiro.telefone || passageiro.clientes?.telefone || '';
                      const telefoneNumeros = telefone.replace(/\D/g, '');
                      const telefoneCompleto = telefoneNumeros.startsWith('55') 
                        ? telefoneNumeros 
                        : `55${telefoneNumeros}`;
                      const nome = passageiro.nome || passageiro.clientes?.nome || `Passageiro ${index + 1}`;
                      
                      // Substituir variáveis na mensagem para este passageiro
                      const mensagemPersonalizada = mensagem
                        .replace(/\{nome\}/g, nome)
                        .replace(/\{adversario\}/g, dadosViagem?.adversario || 'Adversário')
                        .replace(/\{dataJogo\}/g, dadosViagem?.dataJogo || 'Data do jogo')
                        .replace(/\{dataViagem\}/g, dadosViagem?.dataViagem || 'Data da viagem')
                        .replace(/\{horario\}/g, dadosViagem?.horario || 'Horário')
                        .replace(/\{localSaida\}/g, dadosViagem?.localSaida || 'Local de saída')
                        .replace(/\{valor\}/g, dadosViagem?.valor || 'R$ 150,00')
                        .replace(/\{onibus\}/g, dadosViagem?.onibus || 'Ônibus')
                        .replace(/\{prazo\}/g, dadosViagem?.prazo || 'Data limite');
                      
                      const whatsappUrl = `https://wa.me/${telefoneCompleto}?text=${encodeURIComponent(mensagemPersonalizada)}`;
                      window.open(whatsappUrl, '_blank');
                    }, index * 1000); // 1 segundo de delay entre cada abertura
                  });
                  toast.success(`Abrindo ${passageirosComTelefone.length} conversas do WhatsApp!`);
                  onRegistrarHistorico('links_abertos', passageirosComTelefone.length);
                }}
                disabled={isDisabled}
                className="bg-green-600 hover:bg-green-700"
              >
                🚀 Abrir Todos os Links
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  const links = passageirosComTelefone.map((passageiro, index) => {
                    const telefone = passageiro.telefone || passageiro.clientes?.telefone || '';
                    const telefoneNumeros = telefone.replace(/\D/g, '');
                    const telefoneCompleto = telefoneNumeros.startsWith('55') 
                      ? telefoneNumeros 
                      : `55${telefoneNumeros}`;
                    const nome = passageiro.nome || passageiro.clientes?.nome || `Passageiro ${index + 1}`;
                    return `${nome}: https://wa.me/${telefoneCompleto}?text=${encodeURIComponent(mensagem)}`;
                  }).join('\n\n');
                  
                  navigator.clipboard.writeText(links);
                  toast.success('Links copiados! Cole em qualquer lugar.');
                }}
                disabled={isDisabled}
              >
                📋 Copiar Todos os Links
              </Button>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>💡 Melhor para iPhone:</strong> Use os botões individuais "Enviar" acima, ou clique "Abrir Todos os Links" para abrir todas as conversas de uma vez (com delay de 1 segundo entre cada uma).
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="automatico" className="space-y-3 mt-4">
            <TesteZAPI />
            <EnvioAutomaticoWhatsApp 
              passageiros={passageirosComTelefone}
              mensagem={mensagem}
              onRegistrarHistorico={onRegistrarHistorico}
              dadosViagem={dadosViagem}
            />
          </TabsContent>
          
          <TabsContent value="vcf" className="space-y-3 mt-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <h5 className="font-medium text-purple-800 mb-2">📁 Como usar o arquivo VCF no iPhone:</h5>
              <ol className="text-sm text-purple-700 space-y-1 list-decimal list-inside">
                <li>Clique em "Baixar Arquivo de Contatos" abaixo</li>
                <li><strong>Envie por email</strong> para você mesmo (mais confiável no iPhone)</li>
                <li>No iPhone, abra o email e toque no arquivo .vcf</li>
                <li>Toque em "Adicionar todos os contatos"</li>
                <li>Abra o WhatsApp Business → Menu → Nova transmissão</li>
                <li>Selecione os contatos importados e envie sua mensagem!</li>
              </ol>
            </div>
            
            <Button 
              onClick={handleBaixarVCF}
              disabled={isDisabled || baixandoVCF}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400"
            >
              {baixandoVCF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Baixando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Arquivo de Contatos
                </>
              )}
            </Button>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              <Button
                variant="outline"
                onClick={() => {
                  const emailBody = `Contatos da viagem:

${passageirosComTelefone.map((passageiro, index) => {
  const telefone = passageiro.telefone || passageiro.clientes?.telefone || '';
  const nome = passageiro.nome || passageiro.clientes?.nome || `Passageiro ${index + 1}`;
  return `${nome}: ${telefone}`;
}).join('\n')}

Mensagem para enviar:
${mensagem}`;

                  const mailtoLink = `mailto:?subject=Contatos da Viagem - Flamengo&body=${encodeURIComponent(emailBody)}`;
                  window.open(mailtoLink);
                  toast.success('Email aberto com os contatos!');
                }}
                disabled={isDisabled}
                className="text-xs"
              >
                📧 Enviar por Email
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  const textoFormatado = passageirosComTelefone.map((passageiro, index) => {
                    const telefone = passageiro.telefone || passageiro.clientes?.telefone || '';
                    const nome = passageiro.nome || passageiro.clientes?.nome || `Passageiro ${index + 1}`;
                    return `${nome}: ${telefone}`;
                  }).join('\n');
                  
                  navigator.clipboard.writeText(textoFormatado);
                  toast.success('Lista de contatos copiada!');
                }}
                disabled={isDisabled}
                className="text-xs"
              >
                📋 Copiar Lista Simples
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">
              💡 <strong>Para iPhone:</strong> Use "Enviar por Email" para ter os contatos no seu celular, ou use a aba "Links" que é mais prática.
            </p>
          </TabsContent>
        </Tabs>
        
        {/* Alertas de validação */}
        {!mensagem.trim() && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm text-yellow-800">
              <strong>Digite uma mensagem</strong> antes de gerar a lista de contatos.
            </AlertDescription>
          </Alert>
        )}
        
        {mensagem.trim() && passageirosComTelefone.length === 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm text-red-800">
              <strong>Nenhum passageiro</strong> com telefone válido foi encontrado com os filtros aplicados.
            </AlertDescription>
          </Alert>
        )}
        
        {mensagem.trim() && passageirosComTelefone.length > 0 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm text-green-800">
              <strong>Tudo pronto!</strong> Sua mensagem será enviada para {passageirosComTelefone.length} passageiro{passageirosComTelefone.length > 1 ? 's' : ''}.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  );
};