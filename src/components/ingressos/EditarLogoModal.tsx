import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit3, Save, X, AlertCircle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useIngressos } from '@/hooks/useIngressos';

interface JogoIngresso {
  adversario: string;
  jogo_data: string;
  local_jogo: 'casa' | 'fora';
  logo_adversario?: string;
  total_ingressos: number;
}

interface EditarLogoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jogo: JogoIngresso | null;
  onSuccess: () => void;
}

const logoSchema = z.object({
  logo_url: z.string().optional()
});

type LogoFormData = z.infer<typeof logoSchema>;

export function EditarLogoModal({
  open,
  onOpenChange,
  jogo,
  onSuccess
}: EditarLogoModalProps) {
  const { atualizarLogoJogo, estados } = useIngressos();
  const [previewError, setPreviewError] = useState(false);

  const form = useForm<LogoFormData>({
    resolver: zodResolver(logoSchema),
    defaultValues: {
      logo_url: ''
    }
  });

  // Resetar formulário quando modal abrir/fechar ou jogo mudar
  useEffect(() => {
    if (open && jogo) {
      form.reset({
        logo_url: jogo.logo_adversario || ''
      });
      setPreviewError(false);
    }
  }, [open, jogo, form]);

  // Submeter formulário
  const onSubmit = async (data: LogoFormData) => {
    if (!jogo) return;

    try {
      const sucesso = await atualizarLogoJogo(
        jogo.adversario,
        jogo.jogo_data,
        jogo.local_jogo,
        data.logo_url || ''
      );

      if (sucesso) {
        onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar logo:', error);
    }
  };

  // Fechar modal
  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setPreviewError(false);
  };

  if (!jogo) return null;

  const logoUrl = form.watch('logo_url');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Editar Logo do Adversário
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do jogo */}
          <Card>
            <CardContent className="pt-4">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">
                  {jogo.local_jogo === 'fora' ? 
                    `${jogo.adversario} × Flamengo` : 
                    `Flamengo × ${jogo.adversario}`
                  }
                </h3>
                <p className="text-sm text-gray-600">
                  {jogo.total_ingressos} ingresso{jogo.total_ingressos !== 1 ? 's' : ''} será{jogo.total_ingressos !== 1 ? 'ão' : ''} atualizado{jogo.total_ingressos !== 1 ? 's' : ''}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preview atual vs novo */}
          <div className="grid grid-cols-2 gap-4">
            {/* Logo atual */}
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-gray-700">Logo Atual</p>
              <div className="w-16 h-16 mx-auto rounded-full border-2 border-gray-200 bg-white flex items-center justify-center overflow-hidden shadow-sm">
                {jogo.logo_adversario ? (
                  <img
                    src={jogo.logo_adversario}
                    alt={jogo.adversario}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = `https://via.placeholder.com/48x48/cccccc/666666?text=${jogo.adversario.substring(0, 2).toUpperCase()}`;
                    }}
                  />
                ) : (
                  <span className="text-sm text-gray-400 font-medium">
                    {jogo.adversario.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Novo logo */}
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-gray-700">Novo Logo</p>
              <div className="w-16 h-16 mx-auto rounded-full border-2 border-gray-200 bg-white flex items-center justify-center overflow-hidden shadow-sm">
                {logoUrl && !previewError ? (
                  <img
                    src={logoUrl}
                    alt="Novo logo"
                    className="w-12 h-12 object-contain"
                    onError={() => setPreviewError(true)}
                    onLoad={() => setPreviewError(false)}
                  />
                ) : (
                  <span className="text-sm text-gray-400 font-medium">
                    {logoUrl && previewError ? '❌' : jogo.adversario.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Formulário */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Logo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://logodetimes.com/..."
                        {...field}
                        disabled={estados.salvando}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Alerta de erro de preview */}
              {logoUrl && previewError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Não foi possível carregar a imagem. Verifique se a URL está correta.
                  </AlertDescription>
                </Alert>
              )}

              {/* Botões */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={estados.salvando}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={estados.salvando || (logoUrl && previewError)}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {estados.salvando ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </Form>

          {/* Dica */}
          <div className="text-xs text-gray-500 text-center bg-gray-50 p-3 rounded-lg">
            💡 Deixe o campo vazio para usar o placeholder padrão com as iniciais do time
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}