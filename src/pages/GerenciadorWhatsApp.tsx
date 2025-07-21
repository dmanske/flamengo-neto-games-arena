import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WhatsappLinkGenerator from "@/components/WhatsappLinkGenerator";
import { MessageSquare, Users, TrendingUp, Zap, Phone, Send, Copy, CheckCircle } from "lucide-react";

const GerenciadorWhatsApp = () => {
  const [activeTab, setActiveTab] = useState("generator");

  const stats = [
    { label: "Links Gerados", value: "247", icon: Send, color: "text-blue-600" },
    { label: "Cadastros via WhatsApp", value: "89", icon: Users, color: "text-green-600" },
    { label: "Taxa de Conversão", value: "36%", icon: TrendingUp, color: "text-purple-600" },
    { label: "Mensagens Enviadas", value: "1.2k", icon: MessageSquare, color: "text-orange-600" },
  ];

  const templates = [
    {
      id: 1,
      name: "Convite Padrão",
      message: "🔴⚫ Olá! Venha conosco para torcer pelo Mengão! Cadastre-se aqui: {link}",
      category: "Geral"
    },
    {
      id: 2,
      name: "Promoção Especial",
      message: "🎉 OFERTA ESPECIAL! Caravana do Flamengo com desconto! Garante já sua vaga: {link}",
      category: "Promoção"
    },
    {
      id: 3,
      name: "Último Chamado",
      message: "⏰ ÚLTIMAS VAGAS! Não perca a chance de torcer pelo Flamengo no Maracanã: {link}",
      category: "Urgência"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-gray-50">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#25D366] rounded-xl">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Central WhatsApp</h1>
              <p className="text-gray-600">Gerencie suas campanhas e links de cadastro</p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Gerador
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Ajuda
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <WhatsappLinkGenerator className="h-full" />
              </div>
              
              <div className="space-y-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Phone className="h-5 w-5 text-green-600" />
                      Dica Rápida
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Use códigos de rastreamento únicos para cada campanha e monitore a performance.
                    </p>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Conversão média: 36%
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Últimos Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">campanha-outubro</span>
                      <Badge variant="outline" className="text-xs">12 cadastros</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">promocao-especial</span>
                      <Badge variant="outline" className="text-xs">8 cadastros</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">whatsapp-geral</span>
                      <Badge variant="outline" className="text-xs">23 cadastros</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Copy className="h-5 w-5" />
                  Templates de Mensagem
                </CardTitle>
                <CardDescription>
                  Mensagens pré-definidas para diferentes tipos de campanha
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {templates.map((template) => (
                    <div key={template.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          <Badge variant="outline" className="text-xs mt-1">
                            {template.category}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          Usar Template
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{template.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="help" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Como Usar</CardTitle>
                  <CardDescription>
                    Guia passo a passo para gerar links
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Digite o telefone</h4>
                      <p className="text-sm text-gray-600">Insira o número no formato (00) 0 0000-0000</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Defina o código</h4>
                      <p className="text-sm text-gray-600">Crie um identificador único para rastreamento</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Personalize a mensagem</h4>
                      <p className="text-sm text-gray-600">Edite o texto mantendo o placeholder {"{link}"}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium">Envie ou copie</h4>
                      <p className="text-sm text-gray-600">Clique para abrir o WhatsApp ou copie o link</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Melhores Práticas</CardTitle>
                  <CardDescription>
                    Dicas para aumentar a conversão
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm">Use emojis relevantes</h4>
                        <p className="text-xs text-gray-600">🔴⚫ para Flamengo, 🚍 para viagem</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm">Crie senso de urgência</h4>
                        <p className="text-xs text-gray-600">Use palavras como "últimas vagas", "oferta limitada"</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm">Personalize por contexto</h4>
                        <p className="text-xs text-gray-600">Adapte a mensagem para cada tipo de cliente</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm">Monitore os resultados</h4>
                        <p className="text-xs text-gray-600">Use códigos únicos para cada campanha</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GerenciadorWhatsApp;
