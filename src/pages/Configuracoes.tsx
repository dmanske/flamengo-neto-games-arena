
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Upload } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Configuracoes = () => {
  const [flamengoLogo, setFlamengoLogo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState<boolean>(false);

  // Fetch current logo settings
  useEffect(() => {
    const fetchLogoSettings = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("system_config")
          .select("value")
          .eq("key", "flamengo_logo")
          .single();

        if (error) {
          throw error;
        }

        setFlamengoLogo(data.value);
      } catch (error) {
        console.error("Error fetching logo settings:", error);
        toast.error("Erro ao carregar configurações do logo");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogoSettings();
  }, []);

  // Save logo settings
  const saveLogo = async () => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from("system_config")
        .update({ value: flamengoLogo, updated_at: new Date().toISOString() })
        .eq("key", "flamengo_logo");

      if (error) {
        throw error;
      }

      // Update all viagens with the new logo
      const { error: updateError } = await supabase
        .from("viagens")
        .update({ logo_flamengo: flamengoLogo })
        .not("id", "is", null);

      if (updateError) {
        throw updateError;
      }

      toast.success("Logo do Flamengo atualizado com sucesso!");
    } catch (error) {
      console.error("Error saving logo settings:", error);
      toast.error("Erro ao salvar configurações do logo");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default logo
  const resetLogo = async () => {
    const defaultLogo = "https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png";
    setFlamengoLogo(defaultLogo);
    
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from("system_config")
        .update({ value: defaultLogo, updated_at: new Date().toISOString() })
        .eq("key", "flamengo_logo");

      if (error) {
        throw error;
      }

      // Update all viagens with the default logo
      const { error: updateError } = await supabase
        .from("viagens")
        .update({ logo_flamengo: defaultLogo })
        .not("id", "is", null);

      if (updateError) {
        throw updateError;
      }

      toast.success("Logo do Flamengo redefinido para o padrão!");
    } catch (error) {
      console.error("Error resetting logo:", error);
      toast.error("Erro ao redefinir o logo");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Logo do Flamengo</CardTitle>
            <CardDescription>
              Personalize o logo do Flamengo utilizado em toda a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex-1">
                    <FileUpload
                      value={flamengoLogo}
                      onChange={setFlamengoLogo}
                      bucketName="logos"
                      folderPath="flamengo"
                      allowedFileTypes={["image/jpeg", "image/png", "image/jpg", "image/webp"]}
                    />
                  </div>
                  {flamengoLogo && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-2 text-center">Pré-visualização:</p>
                        <img 
                          src={flamengoLogo} 
                          alt="Logo do Flamengo" 
                          className="max-h-32 max-w-32 object-contain"
                        />
                      </div>
                      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Ver em tamanho real
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Logo em tamanho real</DialogTitle>
                            <DialogDescription>
                              Visualize como o logo aparecerá nos documentos
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-center p-6">
                            <img 
                              src={flamengoLogo}
                              alt="Logo do Flamengo"
                              className="max-w-full max-h-[60vh]"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={flamengoLogo || undefined} alt="Logo do Flamengo" />
                      <AvatarFallback>FL</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      Logo atual utilizado em toda a plataforma
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={resetLogo}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Restaurar Padrão
                    </Button>
                    <Button 
                      onClick={saveLogo}
                      disabled={isSaving}
                    >
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Salvar Alterações
                    </Button>
                  </div>
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
