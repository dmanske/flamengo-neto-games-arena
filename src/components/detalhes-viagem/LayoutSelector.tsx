
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Sparkles, Eye, LayoutGrid } from "lucide-react";

interface LayoutSelectorProps {
  selectedLayout: 'original' | 'modern' | 'glass';
  onLayoutChange: (layout: 'original' | 'modern' | 'glass') => void;
}

export function LayoutSelector({ selectedLayout, onLayoutChange }: LayoutSelectorProps) {
  return (
    <Card className="mb-6 bg-white shadow-lg border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Escolher Visualização
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant={selectedLayout === 'original' ? 'default' : 'outline'}
            onClick={() => onLayoutChange('original')}
            className="h-auto p-4 flex flex-col gap-2"
          >
            <Eye className="h-6 w-6" />
            <div className="text-center">
              <div className="font-semibold">Original</div>
              <div className="text-xs text-muted-foreground">Layout atual</div>
            </div>
          </Button>

          <Button
            variant={selectedLayout === 'modern' ? 'default' : 'outline'}
            onClick={() => onLayoutChange('modern')}
            className="h-auto p-4 flex flex-col gap-2"
          >
            <LayoutGrid className="h-6 w-6" />
            <div className="text-center">
              <div className="font-semibold">Moderno</div>
              <div className="text-xs text-muted-foreground">Design limpo</div>
            </div>
          </Button>

          <Button
            variant={selectedLayout === 'glass' ? 'default' : 'outline'}
            onClick={() => onLayoutChange('glass')}
            className="h-auto p-4 flex flex-col gap-2"
          >
            <Sparkles className="h-6 w-6" />
            <div className="text-center">
              <div className="font-semibold">Glass</div>
              <div className="text-xs text-muted-foreground">Efeito vidro</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
