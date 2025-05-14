import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface FileUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  bucketName: string;
  folderPath?: string;
  allowedFileTypes?: string[];
  maxSizeInMB?: number;
  className?: string;
  showPreview?: boolean;
  previewClassName?: string;
}

export const FileUpload = ({
  value,
  onChange,
  bucketName,
  folderPath = "",
  allowedFileTypes = ["image/jpeg", "image/png", "image/jpg"],
  maxSizeInMB = 5,
  className,
  showPreview = true,
  previewClassName,
}: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file
    if (!validateFile(file, allowedFileTypes, maxSizeInMB)) {
      return;
    }
    
    setIsUploading(true);
    try {
      const url = await uploadFile(file, bucketName, folderPath);
      onChange(url);
      toast("Arquivo enviado com sucesso!");
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
          toast("Arquivo removido com sucesso!");
        }
      });
  };
  
  return (
    <div className={cn("space-y-2", className)}>
      <FileUploadControls 
        isUploading={isUploading} 
        hasFile={!!value} 
        onSelectFile={() => document.getElementById("fileInput")?.click()}
        onRemoveFile={handleRemove}
      />
      
      <input
        id="fileInput"
        type="file"
        accept={allowedFileTypes.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />
      
      {showPreview && value && (
        <FilePreview 
          fileUrl={value} 
          className={previewClassName}
        />
      )}
    </div>
  );
};

interface FileUploadControlsProps {
  isUploading: boolean;
  hasFile: boolean;
  onSelectFile: () => void;
  onRemoveFile: () => void;
}

export function FileUploadControls({ 
  isUploading, 
  hasFile, 
  onSelectFile, 
  onRemoveFile 
}: FileUploadControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        className={cn(
          "w-full justify-start text-sm font-normal bg-[#e40016] text-white hover:bg-[#c20012] border-none",
          isUploading && "pointer-events-none opacity-60"
        )}
        onClick={onSelectFile}
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
      
      {hasFile && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={onRemoveFile}
          disabled={isUploading}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

interface FilePreviewProps {
  fileUrl: string;
  className?: string;
}

export function FilePreview({ fileUrl, className }: FilePreviewProps) {
  return (
    <div className={cn("mt-4 rounded-lg border border-muted p-1", className)}>
      <div className="relative aspect-video w-full overflow-hidden rounded-md">
        <img
          src={fileUrl}
          alt="Arquivo enviado"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

// Utility functions
function validateFile(
  file: File, 
  allowedFileTypes: string[], 
  maxSizeInMB: number
): boolean {
  // Check file type
  if (!allowedFileTypes.includes(file.type)) {
    toast.error(`Tipo de arquivo não permitido. Use: ${allowedFileTypes.join(", ")}`);
    return false;
  }
  
  // Check file size
  const fileSizeInMB = file.size / (1024 * 1024);
  if (fileSizeInMB > maxSizeInMB) {
    toast.error(`Arquivo muito grande. Máximo: ${maxSizeInMB}MB`);
    return false;
  }
  
  return true;
}

async function uploadFile(
  file: File, 
  bucketName: string, 
  folderPath: string
): Promise<string> {
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
    
  if (!publicUrl) {
    throw new Error("Falha ao obter URL pública");
  }
  
  return publicUrl.publicUrl;
}
