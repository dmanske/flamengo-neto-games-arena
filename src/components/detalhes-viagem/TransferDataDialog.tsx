import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface TransferData {
  nome_tour_transfer?: string;
  rota_transfer?: string;
  placa_transfer?: string;
  motorista_transfer?: string;
}

interface TransferDataDialogProps {
  onibusId: string;
  onibusNome: string;
  currentData?: TransferData;
  onUpdate?: (data: TransferData) => void;
}

export const TransferDataDialog: React.FC<TransferDataDialogProps> = ({
  onibusId,
  onibusNome,
  currentData,
  onUpdate
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TransferData>({
    nome_tour_transfer: currentData?.nome_tour_transfer || '',
    rota_transfer: currentData?.rota_transfer || '',
    placa_transfer: currentData?.placa_transfer || '',
    motorista_transfer: currentData?.motorista_transfer || ''
  });

  useEffect(() => {
    if (currentData) {
      setFormData({
        nome_tour_transfer: currentData.nome_tour_transfer || '',
        rota_transfer: currentData.rota_transfer || '',
        placa_transfer: currentData.placa_transfer || '',
        motorista_transfer: currentData.motorista_transfer || ''
      });
    }
  }, [currentData]);

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log('🔍 Salvando dados de transfer:', {
        onibusId,
        formData
      });

      // Usar a função RPC que existe no banco
      const { error } = await supabase.rpc('save_transfer_data', {
        onibus_id: onibusId,
        nome_tour: formData.nome_tour_transfer || null,
        rota: formData.rota_transfer || null,
        placa: formData.placa_transfer || null,
        motorista: formData.motorista_transfer || null
      });

      if (error) {
        console.error('❌ Erro ao salvar:', error);
        throw error;
      }

      console.log('✅ Dados salvos com sucesso!');
      toast.success('Dados de transfer atualizados com sucesso!');
      
      // Forçar recarregamento da página para atualizar dados
      if (typeof window !== 'undefined' && window.reloadViagemPassageiros) {
        console.log('🔄 Recarregando dados da viagem...');
        window.reloadViagemPassageiros();
      }
      
      onUpdate?.(formData);
      setOpen(false);
    } catch (error) {
      console.error('❌ Erro ao salvar dados de transfer:', error);
      toast.error(`Erro ao salvar dados de transfer: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TransferData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-gray-500 hover:text-teal-600 hover:bg-teal-50"
        >
          <Edit className="h-3 w-3 mr-1" />
          Transfer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🚕 Dados de Transfer - {onibusNome}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Nome do Tour */}
          <div>
            <Label htmlFor="nome_tour" className="text-sm font-medium">
              🎯 Nome do Tour
            </Label>
            <Input
              id="nome_tour"
              placeholder="Ex: Tour Cristo Redentor + Pão de Açúcar"
              value={formData.nome_tour_transfer}
              onChange={(e) => handleInputChange('nome_tour_transfer', e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Nome do passeio ou tour que será realizado
            </p>
          </div>

          {/* Rota */}
          <div>
            <Label htmlFor="rota" className="text-sm font-medium">
              🗺️ Rota
            </Label>
            <Textarea
              id="rota"
              placeholder="Ex: Blumenau → Joinville → Itajaí → Rio de Janeiro"
              value={formData.rota_transfer}
              onChange={(e) => handleInputChange('rota_transfer', e.target.value)}
              className="mt-1 resize-none"
              rows={2}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use → para separar as cidades da rota
            </p>
          </div>

          {/* Placa */}
          <div>
            <Label htmlFor="placa" className="text-sm font-medium">
              🚗 Placa do Veículo
            </Label>
            <Input
              id="placa"
              placeholder="Ex: ABC-1234"
              value={formData.placa_transfer}
              onChange={(e) => handleInputChange('placa_transfer', e.target.value.toUpperCase())}
              className="mt-1"
              maxLength={8}
            />
          </div>

          {/* Motorista */}
          <div>
            <Label htmlFor="motorista" className="text-sm font-medium">
              👨‍✈️ Nome do Motorista
            </Label>
            <Input
              id="motorista"
              placeholder="Ex: José da Silva"
              value={formData.motorista_transfer}
              onChange={(e) => handleInputChange('motorista_transfer', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};