import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ParcelamentoSelector } from './ParcelamentoSelector';
import { useParcelamento } from '@/hooks/useParcelamento';
import { ParcelaConfig } from '@/types/parcelamento';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

// Exemplo de como integrar o ParcelamentoSelector no cadastro de passageiro
export function ExemploIntegracao() {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    valor: 800,
    desconto: 0,
    viagemId: 'exemplo-viagem-id',
    dataViagem: new Date('2025-03-15') // Exemplo: viagem em março
  });

  const [parcelas, setParcelas] = useState<ParcelaConfig[]>([]);
  const { salvarParcelasPassageiro, isLoading } = useParcelamento();

  const valorFinal = formData.valor - formData.desconto;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (parcelas.length === 0) {
      toast.error('Configure a forma de pagamento');
      return;
    }

    try {
      // Aqui você salvaria o passageiro primeiro
      const passageiroId = 'exemplo-passageiro-id'; // ID retornado do cadastro
      
      // Depois salvar as parcelas
      await salvarParcelasPassageiro(passageiroId, parcelas);
      
      toast.success('Passageiro cadastrado com sucesso!');
      
      // Reset form
      setFormData({
        nome: '',
        telefone: '',
        valor: 800,
        desconto: 0,
        viagemId: 'exemplo-viagem-id',
        dataViagem: new Date('2025-03-15')
      });
      setParcelas([]);
      
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cadastro de Passageiro - Exemplo de Integração</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados do Passageiro */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Nome do passageiro"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
            </div>

            {/* Valores */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="valor">Valor da Viagem</Label>
                <Input
                  id="valor"
                  type="number"
                  value={formData.valor}
                  onChange={(e) => setFormData(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div>
                <Label htmlFor="desconto">Desconto</Label>
                <Input
                  id="desconto"
                  type="number"
                  value={formData.desconto}
                  onChange={(e) => setFormData(prev => ({ ...prev, desconto: parseFloat(e.target.value) || 0 }))}
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div>
                <Label>Valor Final</Label>
                <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center font-medium">
                  {formatCurrency(valorFinal)}
                </div>
              </div>
            </div>

            {/* Seletor de Parcelamento */}
            <ParcelamentoSelector
              valorTotal={valorFinal}
              dataViagem={formData.dataViagem}
              onParcelamentoChange={setParcelas}
            />

            {/* Resumo das Parcelas */}
            {parcelas.length > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">Resumo do Parcelamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {parcelas.map((parcela, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>Parcela {parcela.numero}:</span>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(parcela.valor)}</div>
                          <div className="text-sm text-gray-600">
                            Vence: {parcela.dataVencimento.toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-2 mt-4">
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>{formatCurrency(parcelas.reduce((sum, p) => sum + p.valor, 0))}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || parcelas.length === 0}>
                {isLoading ? 'Salvando...' : 'Cadastrar Passageiro'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Demonstração de Estados */}
      <Card>
        <CardHeader>
          <CardTitle>Debug - Estados Atuais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <strong>Dados do Form:</strong>
              <pre className="bg-gray-100 p-2 rounded text-sm mt-1">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
            
            <div>
              <strong>Parcelas Configuradas:</strong>
              <pre className="bg-gray-100 p-2 rounded text-sm mt-1">
                {JSON.stringify(parcelas, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}