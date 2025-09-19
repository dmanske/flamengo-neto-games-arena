import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { PassageiroOnibus } from '@/hooks/useListaPresencaOnibus';

interface FiltrosOnibusProps {
  passageiros: PassageiroOnibus[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filtroStatus: string;
  setFiltroStatus: (status: string) => void;
  filtroCidade: string;
  setFiltroCidade: (cidade: string) => void;
  filtroSetor: string;
  setFiltroSetor: (setor: string) => void;
  filtroPasseio: string;
  setFiltroPasseio: (passeio: string) => void;
  passageirosFiltrados: PassageiroOnibus[];
}

export const FiltrosOnibus: React.FC<FiltrosOnibusProps> = ({
  passageiros,
  searchTerm,
  setSearchTerm,
  filtroStatus,
  setFiltroStatus,
  filtroCidade,
  setFiltroCidade,
  filtroSetor,
  setFiltroSetor,
  filtroPasseio,
  setFiltroPasseio,
  passageirosFiltrados
}) => {
  // Obter listas únicas para os filtros
  const cidadesUnicas = [...new Set(passageiros.map(p => p.cidade_embarque))].sort();
  const setoresUnicos = [...new Set(passageiros.map(p => p.setor_maracana))].sort();
  
  // Obter lista de passeios únicos
  const passeiosUnicos = [...new Set(
    passageiros
      .flatMap(p => p.passeios || [])
      .map(passeio => passeio.passeio_nome)
  )].sort();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros e Busca
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Campo de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome, CPF ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por Status de Presença */}
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status de Presença" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="presente">✅ Presente</SelectItem>
                <SelectItem value="pendente">⏳ Pendente</SelectItem>
                <SelectItem value="ausente">❌ Ausente</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por Cidade */}
            {cidadesUnicas.length > 1 && (
              <Select value={filtroCidade} onValueChange={setFiltroCidade}>
                <SelectTrigger>
                  <SelectValue placeholder="Cidade de Embarque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as cidades</SelectItem>
                  {cidadesUnicas.map(cidade => (
                    <SelectItem key={cidade} value={cidade}>{cidade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Filtro por Setor */}
            {setoresUnicos.length > 1 && (
              <Select value={filtroSetor} onValueChange={setFiltroSetor}>
                <SelectTrigger>
                  <SelectValue placeholder="Setor no Maracanã" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os setores</SelectItem>
                  {setoresUnicos.map(setor => (
                    <SelectItem key={setor} value={setor}>{setor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {/* Filtro por Passeio */}
            {passeiosUnicos.length > 0 && (
              <Select value={filtroPasseio} onValueChange={setFiltroPasseio}>
                <SelectTrigger>
                  <SelectValue placeholder="Passeios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os passeios</SelectItem>
                  <SelectItem value="com_passeios">Com passeios</SelectItem>
                  <SelectItem value="sem_passeios">Sem passeios</SelectItem>
                  {passeiosUnicos.map(passeio => (
                    <SelectItem key={passeio} value={passeio}>{passeio}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Resumo dos filtros aplicados */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {passageirosFiltrados.length} de {passageiros.length} passageiros
            </Badge>
            {filtroStatus !== "todos" && (
              <Badge variant="secondary" className="text-xs">
                Status: {filtroStatus === 'presente' ? '✅ Presente' : 
                        filtroStatus === 'ausente' ? '❌ Ausente' : 
                        '⏳ Pendente'}
              </Badge>
            )}
            {filtroCidade !== "todas" && filtroCidade && (
              <Badge variant="secondary" className="text-xs">
                Cidade: {filtroCidade}
              </Badge>
            )}
            {filtroSetor !== "todos" && filtroSetor && (
              <Badge variant="secondary" className="text-xs">
                Setor: {filtroSetor}
              </Badge>
            )}
            {filtroPasseio !== "todos" && filtroPasseio && (
              <Badge variant="secondary" className="text-xs">
                Passeio: {filtroPasseio === "com_passeios" ? "Com passeios" : 
                         filtroPasseio === "sem_passeios" ? "Sem passeios" : filtroPasseio}
              </Badge>
            )}
            {searchTerm && (
              <Badge variant="secondary" className="text-xs">
                Busca: "{searchTerm}"
              </Badge>
            )}
          </div>

          {/* Estatísticas dos filtros */}
          {passageirosFiltrados.length !== passageiros.length && (
            <div className="text-xs text-muted-foreground">
              Mostrando {passageirosFiltrados.length} de {passageiros.length} passageiros
              {passageirosFiltrados.length > 0 && (
                <>
                  {' • '}
                  {passageirosFiltrados.filter(p => p.status_presenca === 'presente').length} presentes
                  {' • '}
                  {passageirosFiltrados.filter(p => p.status_presenca === 'pendente').length} pendentes
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};