
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type LogoPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logoUrl: string | null;
};

export function LogoPreviewDialog({
  open,
  onOpenChange,
  logoUrl,
}: LogoPreviewDialogProps) {
  if (!logoUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Logo em tamanho real</DialogTitle>
          <DialogDescription>
            Visualize como o logo aparecerá nos documentos
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center p-6">
          <img
            src={logoUrl}
            alt="Logo do Flamengo"
            className="max-w-full max-h-[60vh]"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
