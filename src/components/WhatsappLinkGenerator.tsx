import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Share2, Send } from "lucide-react";
import { toast } from "sonner";
import { formatTelefone } from "@/utils/cepUtils";

interface WhatsappLinkGeneratorProps {
  className?: string;
}

const WhatsappLinkGenerator: React.FC<WhatsappLinkGeneratorProps> = ({ className }) => {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    "Olá! Cadastre-se para nossas caravanas do Flamengo através deste link: {link}"
  );
  const [fonte, setFonte] = useState("whatsapp");
  
  const baseUrl = window.location.origin;
  const registrationUrl = `${baseUrl}/cadastro-publico?fonte=${fonte}`;
  
  const generateWhatsAppLink = () => {
    if (!phone) {
      toast.error("Digite um número de telefone");
      return;
    }
    
    // Remove formatting characters from phone number
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if the phone number looks valid
    if (cleanPhone.length < 11) {
      toast.error("Número de telefone inválido");
      return;
    }
    
    // Replace placeholder with actual link
    const finalMessage = message.replace("{link}", registrationUrl);
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(finalMessage);
    
    // Generate the WhatsApp link
    const whatsappLink = `https://wa.me/55${cleanPhone}?text=${encodedMessage}`;
    
    // Open the link in a new tab
    window.open(whatsappLink, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(registrationUrl);
    toast.success("Link copiado para a área de transferência!");
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Gerar Link para WhatsApp</CardTitle>
        <CardDescription>
          Crie links personalizados para enviar via WhatsApp e cadastrar clientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="phone">Número de Telefone</Label>
          <Input
            id="phone"
            placeholder="(00) 0 0000-0000"
            value={phone}
            onChange={(e) => setPhone(formatTelefone(e.target.value))}
          />
        </div>
        
        <div>
          <Label htmlFor="fonte">Código de Rastreamento (opcional)</Label>
          <Input
            id="fonte"
            placeholder="Identificador para rastrear origem do cadastro"
            value={fonte}
            onChange={(e) => setFonte(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Este código será incluído no link e ajudará a rastrear a origem dos cadastros
          </p>
        </div>
        
        <div>
          <Label htmlFor="message">Mensagem</Label>
          <Textarea
            id="message"
            placeholder="Mensagem para enviar junto com o link"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            Use {"{link}"} para incluir o link de cadastro na mensagem
          </p>
        </div>
        
        <div className="pt-2">
          <p className="text-sm font-medium mb-1">Link de cadastro:</p>
          <div className="flex items-center gap-2 border p-2 rounded-md bg-muted">
            <span className="text-sm truncate flex-1">{registrationUrl}</span>
            <Button className="bg-[#22c35f] hover:bg-[#128C7E] text-white" size="icon" onClick={copyLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button className="bg-[#22c35f] hover:bg-[#128C7E] text-white" onClick={copyLink}>
          <Copy className="h-4 w-4 mr-2" />
          Copiar Link
        </Button>
        <Button onClick={generateWhatsAppLink} className="bg-[#25D366] hover:bg-[#22c35f] text-white">
          <Send className="h-4 w-4 mr-2" />
          Enviar via WhatsApp
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WhatsappLinkGenerator;
