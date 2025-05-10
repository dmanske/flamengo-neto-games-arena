
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WhatsappLinkGenerator from "@/components/WhatsappLinkGenerator";

const GerenciadorWhatsApp = () => {
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Gerenciador de Links WhatsApp</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <WhatsappLinkGenerator className="h-full" />
        </div>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Instruções de Uso</CardTitle>
              <CardDescription>
                Como utilizar o gerador de links para WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">Como funciona?</h3>
                <p className="text-muted-foreground">
                  Este sistema gera links personalizados que você pode enviar via WhatsApp para convidar
                  clientes a se cadastrarem nas caravanas do Flamengo.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-lg">Passo a passo:</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Digite o número de telefone do cliente no formato correto</li>
                  <li>Personalize o código de rastreamento (opcional) para identificar a origem do cadastro</li>
                  <li>Edite a mensagem, se necessário, mantendo o {"{link}"} onde deseja inserir o link</li>
                  <li>Clique em "Enviar via WhatsApp" para abrir o WhatsApp Web com a mensagem pronta</li>
                  <li>Ou copie o link diretamente e envie por outro meio</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-medium text-lg">Rastreamento de Cadastros</h3>
                <p className="text-muted-foreground">
                  Todos os cadastros realizados através dos links gerados serão automaticamente
                  marcados com o código de rastreamento escolhido, permitindo que você saiba
                  a origem de cada cliente na tela de gerenciamento de clientes.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-lg">Dicas:</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Use um código de rastreamento específico para cada campanha ou fonte</li>
                  <li>Personalize a mensagem de acordo com o contexto ou promoção</li>
                  <li>O link funciona em qualquer dispositivo com acesso à internet</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GerenciadorWhatsApp;
