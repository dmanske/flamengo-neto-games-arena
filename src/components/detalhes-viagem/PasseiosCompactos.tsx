import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PasseioInfo {
  nome: string;
  valor: number;
  gratuito?: boolean;
}

interface PasseiosCompactosProps {
  passeios?: PasseioInfo[];
}

export function PasseiosCompactos({ passeios = [] }: PasseiosCompactosProps) {
  // Debug temporário - mais detalhado
  console.log('🔍 PasseiosCompactos sempre executa:', {
    passeios,
    length: passeios.length,
    primeiroPasseio: passeios[0],
    todosPasseios: passeios
  });

  if (!passeios || passeios.length === 0) {
    return <span className="text-muted-foreground text-xs">Nenhum</span>;
  }

  // Filtrar passeios ativos (qualquer passeio com nome válido)
  const passeiosAtivos = passeios.filter(p => p.nome && p.nome.trim() !== '');
  
  // Debug do filtro
  if (passeios.length > 0 && passeiosAtivos.length === 0) {
    console.log('🚨 Filtro eliminou todos os passeios:', {
      original: passeios,
      filtrado: passeiosAtivos,
      filtro: 'p.valor > 0 || p.gratuito === true'
    });
  }
  
  if (passeiosAtivos.length === 0) {
    return <span className="text-muted-foreground text-xs">Nenhum</span>;
  }

  const valorTotal = passeiosAtivos.reduce((sum, p) => sum + p.valor, 0);

  // Opção 3: Lista Vertical Compacta
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            <div className="space-y-0.5">
              {passeiosAtivos.slice(0, 3).map((passeio, index) => (
                <div key={index} className="text-xs text-gray-700 truncate max-w-[120px] flex items-center gap-1">
                  {passeio.gratuito && <span>🎁</span>}
                  {passeio.nome}
                </div>
              ))}
              {passeiosAtivos.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{passeiosAtivos.length - 3} mais
                </div>
              )}
              <div className="text-xs font-medium pt-1 border-t border-gray-200">
                {valorTotal > 0 ? (
                  <span className="text-green-600">R$ {valorTotal.toFixed(0)} total</span>
                ) : (
                  <span className="text-purple-600">🎁 Gratuito</span>
                )}
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="font-semibold mb-2">Passeios selecionados ({passeiosAtivos.length}):</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {passeiosAtivos.map((passeio, index) => (
                <div key={index} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-1">
                    {passeio.gratuito && <span>🎁</span>}
                    {passeio.nome}
                  </span>
                  <span className="text-muted-foreground">
                    {passeio.gratuito ? "Gratuito" : `R$ ${passeio.valor.toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>R$ {valorTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}