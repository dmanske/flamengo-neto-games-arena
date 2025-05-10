
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FileUploadProps = {
  value: string | null;
  onChange: (url: string | null) => void;
  bucketName: string;
  folderPath?: string;
  allowedFileTypes?: string[];
  maxSizeInMB?: number;
};

export const FileUpload = ({
  value,
  onChange,
  bucketName,
  folderPath = "",
  allowedFileTypes = ["image/jpeg", "image/png", "image/jpg"],
  maxSizeInMB = 5,
}: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!allowedFileTypes.includes(file.type)) {
      toast.error(`Tipo de arquivo não permitido. Use: ${allowedFileTypes.join(", ")}`);
      return;
    }
    
    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSizeInMB) {
      toast.error(`Arquivo muito grande. Máximo: ${maxSizeInMB}MB`);
      return;
    }
    
    setIsUploading(true);
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);
        
      if (error) {
        throw error;
      }
      
      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
        
      if (publicUrl) {
        onChange(publicUrl.publicUrl);
        toast.success("Arquivo enviado com sucesso!");
      }
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      toast.error(`Erro ao enviar arquivo: ${error.message}`);
    } finally {
      setIsUploading(false);
      // Clear input value to allow uploading the same file again
      if (e.target) {
        e.target.value = '';
      }
    }
  };
  
  const handleRemove = () => {
    if (!value) return;
    
    // Extract file path from URL
    const urlParts = value.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const storagePath = folderPath ? `${folderPath}/${fileName}` : fileName;
    
    // Delete from Supabase Storage
    supabase.storage
      .from(bucketName)
      .remove([storagePath])
      .then(({ error }) => {
        if (error) {
          console.error("Erro ao remover arquivo:", error);
          toast.error("Erro ao remover arquivo");
        } else {
          onChange(null);
          toast.success("Arquivo removido com sucesso!");
        }
      });
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-sm font-normal",
            isUploading && "pointer-events-none opacity-60"
          )}
          onClick={() => document.getElementById("fileInput")?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <UploadCloud className="mr-2 h-4 w-4" />
              Escolher arquivo
            </>
          )}
        </Button>
        
        {value && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <input
        id="fileInput"
        type="file"
        accept={allowedFileTypes.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />
      
      {value && (
        <div className="mt-4 rounded-lg border border-muted p-1">
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <img
              src={value}
              alt="Arquivo enviado"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};
