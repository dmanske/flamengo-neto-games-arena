import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { Button } from "./button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { compressImage } from "@/utils/imageUtils";

interface FileUploadProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  bucketName: string;
  folderPath: string;
  maxSizeInMB?: number;
  showPreview?: boolean;
  previewClassName?: string;
  uploadText?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  value,
  onChange,
  bucketName,
  folderPath,
  maxSizeInMB = 2,
  showPreview = false,
  previewClassName = "",
  uploadText = "Clique ou arraste para enviar uma foto (máx. 2MB)",
}) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const file = acceptedFiles[0];
      
      // Verificar tamanho do arquivo
      if (file.size > maxSizeInMB * 1024 * 1024) {
        toast.error(`O arquivo deve ter no máximo ${maxSizeInMB}MB`);
        return;
      }

      // Comprimir a imagem antes do upload
      const compressedFile = await compressImage(file);
      
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folderPath}/${fileName}`;

      // Upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, compressedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success("Arquivo enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao fazer upload do arquivo");
    }
  }, [bucketName, folderPath, maxSizeInMB, onChange]);

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
      const filePath = value.split('/').pop();
      if (!filePath) return;

      // Remover do storage
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([`${folderPath}/${filePath}`]);

      if (error) {
        throw error;
      }

      onChange(null);
      toast.success("Arquivo removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover arquivo:", error);
      toast.error("Erro ao remover arquivo");
    }
  };

  return (
    <div className="space-y-4 flex flex-col items-center">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors w-full max-w-xs mx-auto
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {uploadText}
        </p>
      </div>

      {value && (
        <div className="relative flex flex-col items-center mt-2">
          {showPreview && (
            <img
              src={value}
              alt="Preview"
              className={previewClassName || "w-48 h-48 object-cover rounded-lg shadow-md"}
            />
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="mt-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
