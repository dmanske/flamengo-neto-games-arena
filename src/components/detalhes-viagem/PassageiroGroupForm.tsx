import React, { useState, useEffect } from 'react';
import { Users, Palette, Plus, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useGruposPassageiros } from '@/hooks/useGruposPassageiros';
import { CORES_GRUPOS } from '@/types/grupos-passageiros';

interface PassageiroGroupFormProps {
  viagemId: string;
  grupoNome?: string;
  grupoCor?: string;
  onChange: (grupoNome: string | null, grupoCor: string | null) => void;
  disabled?: boolean;
}

export function PassageiroGroupForm({
  viagemId,
  grupoNome = '',
  grupoCor = '',
  onChange,
  disabled = false
}: PassageiroGroupFormProps) {
  const [modoEdicao, setModoEdicao] = useState<'selecionar' | 'criar'>('selecionar');
  const [novoGrupoNome, setNovoGrupoNome] = useState('');
  const [novoGrupoCor, setNovoGrupoCor] = useState('');
  const [grupoSelecionado, setGrupoSelecionado] = useState('');

  const { gruposExistentes, obterCoresDisponiveis } = useGruposPassageiros(viagemId);

  // Inicializar valores quando o componente monta ou props mudam
  useEffect(() => {
    if (grupoNome && grupoCor) {
      // Se já tem grupo definido, verificar se existe nos grupos existentes
      const grupoExistente = gruposExistentes.find(g => g.nome === grupoNome && g.cor === grupoCor);
      if (grupoExistente) {
        setModoEdicao('selecionar');
        setGrupoSelecionado(`${grupoNome}|${grupoCor}`);
      } else {
        // Grupo não existe mais, limpar
        setModoEdicao('selecionar');
        setGrupoSelecionado('');
      }
    } else {
      setModoEdicao('selecionar');
      setGrupoSelecionado('');
    }
  }, [grupoNome, grupoCor, gruposExistentes]);

  // Cores disponíveis (não usadas por outros grupos)
  const coresDisponiveis = obterCoresDisponiveis();

  const handleGrupoSelecionadoChange = (value: string) => {
    setGrupoSelecionado(value);
    
    if (value === 'sem-grupo') {
      onChange(null, null);
    } else if (value === 'criar-novo') {
      setModoEdicao('criar');
      setNovoGrupoNome('');
      setNovoGrupoCor(coresDisponiveis[0] || CORES_GRUPOS[0]);
    } else {
      const [nome, cor] = value.split('|');
      onChange(nome, cor);
    }
  };

  const handleCriarGrupo = () => {
    if (novoGrupoNome.trim() && novoGrupoCor) {
      onChange(novoGrupoNome.trim(), novoGrupoCor);
      setModoEdicao('selecionar');
      setGrupoSelecionado(`${novoGrupoNome.trim()}|${novoGrupoCor}`);
    }
  };

  const handleCancelarCriacao = () => {
    setModoEdicao('selecionar');
    setNovoGrupoNome('');
    setNovoGrupoCor('');
    setGrupoSelecionado('');
    onChange(null, null);
  };

  // Verificar se o nome do novo grupo já existe
  const nomeJaExiste = gruposExistentes.some(g => 
    g.nome.toLowerCase() === novoGrupoNome.trim().toLowerCase()
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Grupo de Passageiros
        </Label>
        
        {modoEdicao === 'selecionar' ? (
          <Select 
            value={grupoSelecionado} 
            onValueChange={handleGrupoSelecionadoChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um grupo ou crie um novo..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sem-grupo">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                  <span>Sem grupo</span>
                </div>
              </SelectItem>
              
              {gruposExistentes.map(grupo => (
                <SelectItem key={`${grupo.nome}|${grupo.cor}`} value={`${grupo.nome}|${grupo.cor}`}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: grupo.cor, borderColor: grupo.cor }}
                    />
                    <span>{grupo.nome}</span>
                  </div>
                </SelectItem>
              ))}
              
              <SelectItem value="criar-novo">
                <div className="flex items-center gap-2">
                  <Plus className="h-3 w-3" />
                  <span>Criar novo grupo...</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Plus className="h-4 w-4" />
              Criar Novo Grupo
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="novo-grupo-nome">Nome do Grupo</Label>
              <Input
                id="novo-grupo-nome"
                value={novoGrupoNome}
                onChange={(e) => setNovoGrupoNome(e.target.value)}
                placeholder="Ex: Família Silva, Amigos do João..."
                disabled={disabled}
              />
              {nomeJaExiste && (
                <p className="text-xs text-red-600">
                  Este nome já está sendo usado por outro grupo
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Cor do Grupo</Label>
              <div className="grid grid-cols-5 gap-2">
                {CORES_GRUPOS.map(cor => {
                  const corUsada = gruposExistentes.some(g => g.cor === cor);
                  const isSelected = novoGrupoCor === cor;
                  
                  return (
                    <button
                      key={cor}
                      type="button"
                      onClick={() => setNovoGrupoCor(cor)}
                      disabled={disabled || corUsada}
                      className={`
                        w-8 h-8 rounded-full border-2 flex items-center justify-center
                        transition-all duration-200 hover:scale-110
                        ${isSelected ? 'border-gray-800 shadow-lg' : 'border-gray-300'}
                        ${corUsada ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                      style={{ backgroundColor: cor }}
                      title={corUsada ? 'Cor já em uso' : `Selecionar cor ${cor}`}
                    >
                      {isSelected && (
                        <Check className="h-4 w-4 text-white drop-shadow-sm" />
                      )}
                    </button>
                  );
                })}
              </div>
              {coresDisponiveis.length === 0 && (
                <p className="text-xs text-amber-600">
                  Todas as cores estão em uso. Você pode usar cores repetidas.
                </p>
              )}
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                size="sm"
                onClick={handleCriarGrupo}
                disabled={disabled || !novoGrupoNome.trim() || nomeJaExiste}
                className="flex items-center gap-1"
              >
                <Check className="h-3 w-3" />
                Criar Grupo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelarCriacao}
                disabled={disabled}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Preview do grupo selecionado */}
      {grupoNome && grupoCor && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: grupoCor, borderColor: grupoCor }}
            />
            <span className="text-sm font-medium text-blue-800">
              Grupo selecionado: {grupoNome}
            </span>
            <Badge variant="secondary" className="text-xs">
              {grupoCor}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}