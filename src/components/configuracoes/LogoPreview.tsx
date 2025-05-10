
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

type LogoPreviewProps = {
  logoUrl: string | null;
  onPreviewClick: () => void;
};

export function LogoPreview({ logoUrl, onPreviewClick }: LogoPreviewProps) {
  if (!logoUrl) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-muted rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-2 text-center">
          Pré-visualização:
        </p>
        <img
          src={logoUrl}
          alt="Logo do Flamengo"
          className="max-h-32 max-w-32 object-contain"
        />
      </div>
      <Button variant="outline" size="sm" onClick={onPreviewClick}>
        <Upload className="h-4 w-4 mr-2" />
        Ver em tamanho real
      </Button>
    </div>
  );
}

export function CurrentLogoDisplay({ logoUrl }: { logoUrl: string | null }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={logoUrl || undefined} alt="Logo do Flamengo" />
        <AvatarFallback>FL</AvatarFallback>
      </Avatar>
      <span className="text-sm text-muted-foreground">
        Logo atual utilizado em toda a plataforma
      </span>
    </div>
  );
}
