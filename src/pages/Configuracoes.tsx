
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { supabase } from "@/lib/supabase";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Configuracoes = () => {
  const [logoFlamengo, setLogoFlamengo] = useState<string | null>(
    "https://logodetimes.com/wp-content/uploads/flamengo.png"
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  // Verificar se o bucket existe
  useEffect(() => {
    const checkBucketExists = async () => {
      try {
        const { data, error } = await supabase.storage.getBucket('logos');
        if (error) {
          console.error("Erro ao verificar bucket:", error);
          setUploadError("O bucket 'logos' não existe no Supabase. Por favor, verifique a configuração.");
        } else {
          setUploadError(null);
        }
      } catch (err) {
        console.error("Erro ao verificar bucket:", err);
      }
    };

    checkBucketExists();
  }, []);

  const handleLogoChange = async (url: string | null) => {
    if (!url) return;
    
    try {
      setIsLoading(true);
      setUploadError(null);
      
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

  const createBucket = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.storage.createBucket('logos', { 
        public: true,
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Bucket 'logos' criado com sucesso!");
      setUploadError(null);
    } catch (err) {
      console.error("Erro ao criar bucket:", err);
      toast.error("Erro ao criar bucket");
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
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {uploadError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{uploadError}</AlertDescription>
                    <button 
                      className="ml-auto bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                      onClick={createBucket}
                    >
                      Criar Bucket
                    </button>
                  </Alert>
                )}
                
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Configuracoes;
