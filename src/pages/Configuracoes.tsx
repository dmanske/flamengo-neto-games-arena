
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { supabase } from "@/lib/supabase";

const Configuracoes = () => {
  const [logoFlamengo, setLogoFlamengo] = useState<string | null>(
    "https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png"
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Buscar o logo atual do Flamengo
  useEffect(() => {
    const fetchLogoFlamengo = async () => {
      try {
        // Buscar o logo mais recente usado
        const { data, error } = await supabase
          .from("viagens")
          .select("logo_flamengo")
          .order("created_at", { ascending: false })
          .limit(1);

        if (error) {
          throw error;
        }

        if (data && data.length > 0 && data[0].logo_flamengo) {
          setLogoFlamengo(data[0].logo_flamengo);
        }
      } catch (err) {
        console.error("Erro ao buscar logo do Flamengo:", err);
        toast.error("Erro ao buscar logo do Flamengo");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogoFlamengo();
  }, []);

  const handleLogoChange = async (url: string | null) => {
    if (!url) return;
    
    try {
      setIsLoading(true);
      
      // Atualizar o logo em todas as viagens existentes
      const { error } = await supabase
        .from("viagens")
        .update({ logo_flamengo: url })
        .neq("id", ""); // Atualizar todas as linhas

      if (error) {
        throw error;
      }

      setLogoFlamengo(url);
      toast.success("Logo do Flamengo atualizado com sucesso em todas as viagens!");
    } catch (err) {
      console.error("Erro ao atualizar logo:", err);
      toast.error("Erro ao atualizar logo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Logo do Flamengo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {logoFlamengo && (
                  <div className="w-32 h-32 border rounded-lg overflow-hidden flex items-center justify-center p-2">
                    <img
                      src={logoFlamengo}
                      alt="Logo do Flamengo"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Este logo será usado como padrão em todas as viagens. O upload será feito para o banco de dados e usado automaticamente.
                  </p>
                  <FileUpload
                    value={logoFlamengo}
                    onChange={handleLogoChange}
                    bucketName="logos"
                    folderPath="flamengo"
                    allowedFileTypes={["image/jpeg", "image/png", "image/jpg", "image/svg+xml"]}
                  />
                </div>
              </div>
              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-medium mb-2">Logo Atual:</p>
                <p className="text-xs text-muted-foreground break-all">{logoFlamengo}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Configuracoes;
