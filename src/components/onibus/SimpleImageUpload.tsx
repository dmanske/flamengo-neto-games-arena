import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SimpleImageUploadProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  maxSizeInMB?: number;
}

export const SimpleImageUpload: React.FC<SimpleImageUploadProps> = ({
  value,
  onChange,
  maxSizeInMB = 5,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setIsUploading(true);
      const file = acceptedFiles[0];
      
      // Verificar tamanho do arquivo
      if (file.size > maxSizeInMB * 1024 * 1024) {
        toast.error(`O arquivo deve ter no máximo ${maxSizeInMB}MB`);
        return;
      }

      // Converter para base64 para preview local
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        onChange(base64String);
        toast.success("Imagem carregada com sucesso!");
      };
      
      reader.onerror = () => {
        toast.error("Erro ao carregar a imagem");
      };
      
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      toast.error("Erro ao processar a imagem");
    } finally {
      setIsUploading(false);
    }
  }, [maxSizeInMB, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleRemove = () => {
    onChange(null);
    toast.success("Imagem removida com sucesso!");
  };
  
  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">
          {isUploading ? 'Processando imagem...' : `Clique ou arraste para enviar uma imagem (máx. ${maxSizeInMB}MB)`}
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