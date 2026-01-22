import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';

interface EditarJogoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataAtual: string;
  adversario: string;
  onSalvar: (novaData: string) => void;
}

export function EditarJogoModal({
  open,
  onOpenChange,
  dataAtual,
  adversario,
  onSalvar
}: EditarJogoModalProps) {
  const [novaData, setNovaData] = useState(dataAtual);

  const handleSalvar = () => {
    if (!novaData) return;
    onSalvar(novaData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Editar Data do Jogo
          </DialogTitle>
          <DialogDescription>
            Altere a data do jogo contra {adversario}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="data">Data e Hora do Jogo</Label>
            <Input
              id="data"
              type="datetime-local"
              value={novaData}
              onChange={(e) => setNovaData(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Formato: DD/MM/AAAA HH:MM
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSalvar}
            disabled={!novaData}
          >
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
