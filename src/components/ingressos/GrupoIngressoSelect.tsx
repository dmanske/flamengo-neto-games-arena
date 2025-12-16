import React, { useState } from 'react';
import { Users, Plus, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CORES_GRUPOS_INGRESSOS } from '@/types/grupos-ingressos';

interface GrupoIngressoSelectProps {
  grupoNome: string | null | undefined;
  grupoCor: string | null | undefined;
  gruposExistentes: Array<{ nome: string; cor: string }>;
  onGrupoChange: (nome: string | null, cor: string | null) => void;
  disabled?: boolean;
}

export function GrupoIngressoSelect({
  grupoNome,
  grupoCor,
  gruposExistentes,
  onGrupoChange,
  disabled = false
}: GrupoIngressoSelectProps) {
  const [modoNovoGrupo, setModoNovoGrupo] = useState(false);
  const [novoGrupoNome, setNovoGrupoNome] = useState('');
  const [novoGrupoCor, setNovoGrupoCor] = useState<string>(CORES_GRUPOS_INGRESSOS[0]);
  const [popoverAberto, setPopoverAberto] = useState(false);

  // Cores já usadas pelos grupos existentes
  const coresUsadas = gruposExistentes.map(g => g.cor);

  // Função para converter hex para rgba
  const hexToRgba = (hex: string, alpha: number = 0.1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Selecionar grupo existente
  const handleSelecionarGrupo = (value: string) => {
    if (value === 'nenhum') {
      onGrupoChange(null, null);
    } else if (value === 'novo') {
      setModoNovoGrupo(true);
    } else {
      const grupo = gruposExistentes.find(g => g.nome === value);
      if (grupo) {
        onGrupoChange(grupo.nome, grupo.cor);
      }
    }
  };

  // Criar novo grupo
  const handleCriarGrupo = () => {
    if (novoGrupoNome.trim()) {
      onGrupoChange(novoGrupoNome.trim(), novoGrupoCor);
      setModoNovoGrupo(false);
      setNovoGrupoNome('');
      setPopoverAberto(false);
    }
  };

  // Cancelar criação de novo grupo
  const handleCancelarNovoGrupo = () => {
    setModoNovoGrupo(false);
    setNovoGrupoNome('');
    setNovoGrupoCor(CORES_GRUPOS_INGRESSOS[0]);
  };

  // Remover do grupo
  const handleRemoverDoGrupo = () => {
    onGrupoChange(null, null);
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        Grupo (Opcional)
      </Label>

      {/* Se já tem grupo selecionado */}
      {grupoNome && grupoCor ? (
        <div 
          className="flex items-center justify-between p-3 rounded-lg border-2"
          style={{
            backgroundColor: hexToRgba(grupoCor, 0.1),
            borderColor: grupoCor
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: grupoCor }}
            />
            <span className="font-medium" style={{ color: grupoCor }}>
              {grupoNome}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoverDoGrupo}
            disabled={disabled}
            className="text-gray-500 hover:text-red-500"
          >
            Remover
          </Button>
        </div>
      ) : modoNovoGrupo ? (
        /* Formulário para criar novo grupo */
        <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
          <div>
            <Label className="text-sm">Nome do Grupo</Label>
            <Input
              value={novoGrupoNome}
              onChange={(e) => setNovoGrupoNome(e.target.value)}
              placeholder="Ex: Família Silva, Amigos do João..."
              disabled={disabled}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm flex items-center gap-2">
              <Palette className="h-3 w-3" />
              Cor do Grupo
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {CORES_GRUPOS_INGRESSOS.map((cor) => {
                const jaUsada = coresUsadas.includes(cor);
                return (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => setNovoGrupoCor(cor)}
                    disabled={disabled}
                    className={`
                      w-8 h-8 rounded-full border-2 transition-all
                      ${novoGrupoCor === cor ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''}
                      ${jaUsada ? 'opacity-50' : 'hover:scale-105'}
                    `}
                    style={{ 
                      backgroundColor: cor,
                      borderColor: novoGrupoCor === cor ? cor : 'transparent'
                    }}
                    title={jaUsada ? `${cor} - já em uso` : cor}
                  />
                );
              })}
            </div>
            {coresUsadas.includes(novoGrupoCor) && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Esta cor já está sendo usada por outro grupo
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              size="sm"
              onClick={handleCriarGrupo}
              disabled={!novoGrupoNome.trim() || disabled}
            >
              Criar Grupo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancelarNovoGrupo}
              disabled={disabled}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        /* Seletor de grupo */
        <Select
          value={grupoNome || 'nenhum'}
          onValueChange={handleSelecionarGrupo}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione ou crie um grupo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nenhum">
              <span className="text-gray-500">Sem grupo (individual)</span>
            </SelectItem>
            
            {gruposExistentes.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                  Grupos Existentes
                </div>
                {gruposExistentes.map((grupo) => (
                  <SelectItem key={grupo.nome} value={grupo.nome}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: grupo.cor }}
                      />
                      <span>{grupo.nome}</span>
                    </div>
                  </SelectItem>
                ))}
              </>
            )}
            
            <div className="border-t my-1" />
            <SelectItem value="novo">
              <div className="flex items-center gap-2 text-blue-600">
                <Plus className="h-4 w-4" />
                <span>Criar novo grupo...</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      )}

      {/* Dica */}
      {!grupoNome && !modoNovoGrupo && (
        <p className="text-xs text-gray-500">
          💡 Agrupe ingressos de famílias ou amigos para facilitar a organização
        </p>
      )}
    </div>
  );
}
