import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { compressImage } from "@/utils/imageUtils";

interface OnibusImageUploadProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  maxSizeInMB?: number;
}

export const OnibusImageUpload: React.FC<OnibusImageUploadProps> = ({
  value,
  onChange,
  maxSizeInMB = 5,
}) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const file = acceptedFiles[0];
      
      // Verificar tamanho do arquivo
      if (file.size > maxSizeInMB * 1024 * 1024) {
        toast.error(`O arquivo deve ter no máximo ${maxSizeInMB}MB`);
        return;
      }

      // Prosseguir diretamente com o upload

      // Comprimir a imagem antes do upload
      const compressedFile = await compressImage(file, 800, 0.8); // Maior qualidade para ônibus
      
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `images/${fileName}`;

      // Upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('onibus')
        .upload(filePath, compressedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('onibus')
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      if (error.message && error.message.includes('not found')) {
        toast.error("Bucket de armazenamento não configurado. Contate o administrador.");
      } else if (error.message && error.message.includes('row-level security')) {
        toast.error("Sem permissão para upload. Verifique se está logado.");
      } else {
        toast.error("Erro ao fazer upload da imagem. Tente novamente.");
      }
    }
  }, [maxSizeInMB, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
  });

  const handleRemove = async () => {
    if (!value) return;

    try {
      // Extrair o caminho do arquivo da URL
      const bucketIndex = value.indexOf('onibus');
      if (bucketIndex !== -1) {
        const pathAfterBucket = value.substring(bucketIndex + 'onibus'.length + 1);
        
        // Remover do storage
        const { error } = await supabase.storage
          .from('onibus')
          .remove([pathAfterBucket]);

        if (error) {
          console.warn("Erro ao remover do storage:", error);
        }
      }

      onChange(null);
      toast.success("Imagem removida com sucesso!");
    } catch (error) {
      console.error("Erro ao remover imagem:", error);
      toast.error("Erro ao remover imagem");
    }
  };
  
  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">
          Clique ou arraste para enviar uma imagem (máx. {maxSizeInMB}MB)
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Formatos aceitos: JPG, PNG, GIF
        </p>
      </div>

      {value && (
        <div className="relative">
          <img
            src={value}
            alt="Preview da imagem do ônibus"
            className="w-full max-w-xs mx-auto h-48 object-cover rounded-lg shadow-md"
            onError={(e) => {
              console.error("Erro ao carregar imagem:", e);
              e.currentTarget.src = "https://via.placeholder.com/300x200?text=Erro+na+imagem";
            }}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
          <p className="text-sm text-green-600 text-center mt-2">
            ✓ Imagem carregada com sucesso
          </p>
        </div>
      )}
    </div>
  );
};