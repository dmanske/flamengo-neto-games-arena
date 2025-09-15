import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface WifiInfoProps {
  wifi_ssid: string | null;
  wifi_password: string | null;
  customText?: string;
}

export function WifiInfo({ wifi_ssid, wifi_password, customText }: WifiInfoProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Se não há informações de WiFi, não renderiza o componente
  if (!wifi_ssid && !wifi_password) {
    return null;
  }

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copiado para a área de transferência!`);
      
      // Remove o feedback visual após 2 segundos
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error("Erro ao copiar para a área de transferência");
    }
  };

  const defaultText = `📡 INFORMAÇÃO IMPORTANTE – CONEXÃO WI-FI A BORDO

Estamos em um processo de inovação, e alguns dos nossos ônibus já estão equipados com a Starlink, garantindo que você fique 24 horas conectado, sem interrupções, durante toda a viagem.

Aproveite para compartilhar seus momentos, conversar com a família ou curtir suas redes sociais com total liberdade!

(Utilize fone de ouvido para ouvir músicas ou vídeos, por respeito aos demais passageiros.)

📸 Nos siga no Instagram e aproveite para nos marcar em suas publicações:
🔗 @neto.viagens

⸻

🧳 Boa viagem e aproveitem a experiência com conforto e conectividade!

🔴⚫ Neto Tours Viagens – Conforto, segurança e tecnologia a seu favor.`;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/30 shadow-2xl">
      {/* Efeitos de fundo animados */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-purple-500/10 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full blur-xl"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-400/20 to-transparent rounded-full blur-xl"></div>
      
      {/* Header com gradiente */}
      <div className="relative bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            <Wifi className="h-7 w-7 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">WiFi Disponível</h3>
            <p className="text-cyan-100 text-sm">Conecte-se gratuitamente</p>
          </div>
        </div>
      </div>

      <div className="relative p-6 space-y-6">
        {/* Texto explicativo com glassmorphism */}
        <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
          <p className="text-white leading-relaxed whitespace-pre-line text-sm">
            {customText || defaultText}
          </p>
        </div>

        {/* Informações de conexão com design moderno */}
        {(wifi_ssid || wifi_password) && (
          <div className="p-6 bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              {/* Nome da Rede */}
              {wifi_ssid && (
                <div className="group">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-300/30 hover:border-cyan-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25">
                    <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Wifi className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-cyan-200 uppercase tracking-wider block mb-1">📶 Nome da Rede</span>
                      <p className="font-black text-white text-xl tracking-wide">{wifi_ssid}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Senha com botão copiar */}
              {wifi_password && (
                <div className="group">
                  <div className="flex items-center justify-between gap-4 p-4 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl border border-emerald-300/30 hover:border-emerald-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Wifi className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider block mb-1">🔑 Senha</span>
                        <p className="font-black text-white text-lg font-mono tracking-widest bg-black/40 px-4 py-2 rounded-lg border border-white/20">
                          {wifi_password}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(wifi_password, "Senha")}
                      className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      {copiedField === "Senha" ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 mr-2 animate-bounce" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-5 w-5 mr-2" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Badge de status com animação */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <Wifi className="h-5 w-5 animate-pulse" />
            <span>WiFi Ativo</span>
            <div className="w-2 h-2 bg-green-300 rounded-full animate-ping"></div>
          </div>
        </div>
      </div>
    </div>
  );
}