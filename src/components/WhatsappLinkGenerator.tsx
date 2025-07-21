import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Send, Phone, MessageSquare, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { formatTelefone } from "@/utils/cepUtils";

interface WhatsappLinkGeneratorProps {
  className?: string;
}

const WhatsappLinkGenerator: React.FC<WhatsappLinkGeneratorProps> = ({ className }) => {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    "🔴⚫ Olá! Venha conosco torcer pelo Mengão! Cadastre-se para nossa caravana: {link}"
  );
  const [fonte, setFonte] = useState("whatsapp");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const baseUrl = window.location.origin;
  const registrationUrl = `${baseUrl}/cadastro-publico?fonte=${fonte}`;
  
  const generateWhatsAppLink = async () => {
    if (!phone) {
      toast.error("Digite um número de telefone");
      return;
    }
    
    setIsGenerating(true);
    
    // Remove formatting characters from phone number
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if the phone number looks valid
    if (cleanPhone.length < 11) {
      toast.error("Número de telefone inválido");
      setIsGenerating(false);
      return;
    }
    
    // Replace placeholder with actual link
    const finalMessage = message.replace("{link}", registrationUrl);
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(finalMessage);
    
    // Generate the WhatsApp link
    const whatsappLink = `https://wa.me/55${cleanPhone}?text=${encodedMessage}`;
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      window.open(whatsappLink, '_blank');
      toast.success("WhatsApp aberto com sucesso!");
      setIsGenerating(false);
    }, 500);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(registrationUrl);
      toast.success("Link copiado para a área de transferência!");
    } catch (error) {
      toast.error("Erro ao copiar link");
    }
  };

  const quickMessages = [
    "🔴⚫ Olá! Venha conosco torcer pelo Mengão! Cadastre-se: {link}",
    "🎉 OFERTA ESPECIAL! Caravana do Flamengo com desconto! Garante já: {link}",
    "⏰ ÚLTIMAS VAGAS! Não perca a chance de torcer no Maracanã: {link}"
  ];

  return (
    <Card className={`${className} border-0 shadow-lg bg-white/95 backdrop-blur-sm`}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#25D366] rounded-lg">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Gerador de Links</CardTitle>
            <CardDescription>
              Crie links personalizados para WhatsApp
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Phone Input */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2 font-medium">
            <Phone className="h-4 w-4" />
            Número de Telefone
          </Label>
          <Input
            id="phone"
            placeholder="(00) 0 0000-0000"
            value={phone}
            onChange={(e) => setPhone(formatTelefone(e.target.value))}
            className="h-12 text-lg"
          />
        </div>
        
        {/* Tracking Code */}
        <div className="space-y-2">
          <Label htmlFor="fonte" className="flex items-center gap-2 font-medium">
            <Sparkles className="h-4 w-4" />
            Código de Rastreamento
          </Label>
          <Input
            id="fonte"
            placeholder="ex: campanha-outubro, promocao-especial"
            value={fonte}
            onChange={(e) => setFonte(e.target.value)}
            className="h-11"
          />
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Badge variant="outline" className="text-xs px-2 py-0">Opcional</Badge>
            Ajuda a identificar a origem dos cadastros
          </p>
        </div>
        
        {/* Message Template */}
        <div className="space-y-3">
          <Label htmlFor="message" className="flex items-center gap-2 font-medium">
            <MessageSquare className="h-4 w-4" />
            Mensagem Personalizada
          </Label>
          
          {/* Quick Message Options */}
          <div className="grid gap-2">
            <p className="text-xs text-gray-600 mb-1">Mensagens rápidas:</p>
            {quickMessages.map((msg, index) => (
              <button
                key={index}
                onClick={() => setMessage(msg)}
                className="text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-md transition-colors border"
              >
                {msg.replace("{link}", "[LINK]")}
              </button>
            ))}
          </div>
          
          <Textarea
            id="message"
            placeholder="Sua mensagem personalizada..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            Use <code className="bg-gray-100 px-1 rounded">{"{link}"}</code> onde o link de cadastro deve aparecer
          </p>
        </div>
        
        {/* Generated Link Preview */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-medium">
            <ExternalLink className="h-4 w-4" />
            Link Gerado
          </Label>
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <span className="text-sm text-green-800 truncate flex-1 font-mono">
              {registrationUrl}
            </span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={copyLink}
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-3 pt-6">
        <Button 
          onClick={copyLink}
          variant="outline"
          className="flex-1 h-12 border-2"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copiar Link
        </Button>
        <Button 
          onClick={generateWhatsAppLink}
          disabled={isGenerating}
          className="flex-1 h-12 bg-[#25D366] hover:bg-[#22c35f] text-white"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Abrindo...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Enviar WhatsApp
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WhatsappLinkGenerator;
