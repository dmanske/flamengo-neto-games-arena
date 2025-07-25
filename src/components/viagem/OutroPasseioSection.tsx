import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, DollarSign, Gift } from 'lucide-react';
import type { PasseiosSectionProps } from '@/types/passeio';

export const OutroPasseioSection: React.FC<PasseiosSectionProps> = ({ form, disabled = false }) => {
  const [isPasseioPago, setIsPasseioPago] = useState(false);
  const [nomePasseio, setNomePasseio] = useState('');
  const [valorPasseio, setValorPasseio] = useState('');

  const adicionarPasseioPersonalizado = () => {
    if (!nomePasseio.trim()) return;

    const outroPasseioAtual = form.getValues('outro_passeio') || '';
    
    if (isPasseioPago && valorPasseio) {
      // Formato: "Nome do Passeio (R$ XX,XX)"
      const valorFormatado = parseFloat(valorPasseio).toFixed(2).replace('.', ',');
      const passeioComValor = `${nomePasseio.trim()} (R$ ${valorFormatado})`;
      
      const novoValor = outroPasseioAtual 
        ? `${outroPasseioAtual}; ${passeioComValor}`
        : passeioComValor;
      
      form.setValue('outro_passeio', novoValor);
    } else {
      // Passeio gratuito - só o nome
      const novoValor = outroPasseioAtual 
        ? `${outroPasseioAtual}; ${nomePasseio.trim()}`
        : nomePasseio.trim();
      
      form.setValue('outro_passeio', novoValor);
    }

    // Limpar campos
    setNomePasseio('');
    setValorPasseio('');
    setIsPasseioPago(false);
  };

  const limparPasseios = () => {
    form.setValue('outro_passeio', '');
  };

  const outroPasseio = form.watch('outro_passeio') || '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-purple-600" />
          Passeios Personalizados
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Toggle Pago/Gratuito */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {isPasseioPago ? (
              <>
                <DollarSign className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Passeio Pago</span>
              </>
            ) : (
              <>
                <Gift className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Passeio Gratuito</span>
              </>
            )}
          </div>
          <Switch
            checked={isPasseioPago}
            onCheckedChange={setIsPasseioPago}
            disabled={disabled}
          />
        </div>

        {/* Campos de entrada */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <FormLabel className="text-sm font-medium">Nome do Passeio</FormLabel>
            <Input
              placeholder="Ex: Museu Nacional, Quinta da Boa Vista..."
              value={nomePasseio}
              onChange={(e) => setNomePasseio(e.target.value)}
              disabled={disabled}
            />
          </div>
          
          {isPasseioPago && (
            <div>
              <FormLabel className="text-sm font-medium">Valor (R$)</FormLabel>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={valorPasseio}
                onChange={(e) => setValorPasseio(e.target.value)}
                disabled={disabled}
              />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={adicionarPasseioPersonalizado}
            disabled={!nomePasseio.trim() || (isPasseioPago && !valorPasseio) || disabled}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
          
          {outroPasseio && (
            <Button
              type="button"
              variant="outline"
              onClick={limparPasseios}
              disabled={disabled}
              size="sm"
            >
              Limpar Todos
            </Button>
          )}
        </div>

        {/* Exibir passeios adicionados */}
        {outroPasseio && (
          <div className="space-y-2">
            <FormLabel className="text-sm font-medium">Passeios Adicionados:</FormLabel>
            <div className="flex flex-wrap gap-2">
              {outroPasseio.split(';').map((passeio, index) => {
                const passeioTrimmed = passeio.trim();
                const isPago = passeioTrimmed.includes('(R$');
                
                return (
                  <Badge
                    key={index}
                    variant="secondary"
                    className={`${
                      isPago 
                        ? 'bg-orange-100 text-orange-800 border-orange-300' 
                        : 'bg-green-100 text-green-800 border-green-300'
                    } text-xs`}
                  >
                    {isPago ? (
                      <DollarSign className="h-3 w-3 mr-1" />
                    ) : (
                      <Gift className="h-3 w-3 mr-1" />
                    )}
                    {passeioTrimmed}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Campo hidden para o formulário */}
        <FormField
          control={form.control}
          name="outro_passeio"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};