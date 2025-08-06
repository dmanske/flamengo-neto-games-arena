// Botões de ação rápida para pagamentos separados
// Task 20.2: Botões de ação rápida nos cards

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CreditCard, 
  ChevronDown, 
  DollarSign, 
  MapPin, 
  // Wallet removido (era usado no botão Pagar Tudo)
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { BreakdownVisual } from './StatusBadgeAvancado';
import type { CategoriaPagamento } from '@/types/pagamentos-separados';

interface BotoesAcaoRapidaProps {
  passageiroId: string;
  nomePassageiro: string;
  valorViagem: number;
  valorPasseios: number;
  pagoViagem: number;
  pagoPasseios: number;
  onPagamento: (categoria: CategoriaPagamento, valor: number, formaPagamento: string, observacoes?: string, dataPagamento?: string) => Promise<boolean>;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

type TipoPagamento = 'viagem' | 'passeios' | 'ambos';

interface ModalPagamentoData {
  tipo: TipoPagamento;
  titulo: string;
  valorSugerido: number;
  categoria: CategoriaPagamento;
}

export function BotoesAcaoRapida({
  passageiroId,
  nomePassageiro,
  valorViagem,
  valorPasseios,
  pagoViagem,
  pagoPasseios,
  onPagamento,
  disabled = false,
  size = 'sm'
}: BotoesAcaoRapidaProps) {
  const [modalAberto, setModalAberto] = useState(false);
  const [dadosModal, setDadosModal] = useState<ModalPagamentoData | null>(null);
  const [valor, setValor] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [dataPagamento, setDataPagamento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [processando, setProcessando] = useState(false);

  const pendenteViagem = Math.max(0, valorViagem - pagoViagem);
  const pendentePasseios = Math.max(0, valorPasseios - pagoPasseios);
  const pendenteTotal = pendenteViagem + pendentePasseios;

  const abrirModal = (tipo: TipoPagamento) => {
    let modalData: ModalPagamentoData;
    
    switch (tipo) {
      case 'viagem':
        modalData = {
          tipo: 'viagem',
          titulo: 'Pagar Viagem',
          valorSugerido: pendenteViagem,
          categoria: 'viagem'
        };
        break;
      case 'passeios':
        modalData = {
          tipo: 'passeios',
          titulo: 'Pagar Passeios',
          valorSugerido: pendentePasseios,
          categoria: 'passeios'
        };
        break;
      // Caso 'ambos' removido - função "Pagar Tudo" desabilitada
    }
    
    setDadosModal(modalData);
    setValor(modalData.valorSugerido.toFixed(2));
    setFormaPagamento('pix');
    setDataPagamento(''); // Deixar vazio para usar data atual
    setObservacoes('');
    setModalAberto(true);
  };

  const confirmarPagamento = async () => {
    if (!dadosModal) return;
    
    const valorNumerico = parseFloat(valor);
    
    // Debug removido - função "Pagar Tudo" desabilitada
    
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      toast.error('Valor inválido');
      return;
    }

    setProcessando(true);
    try {
      // Usar data personalizada ou atual
      const dataFinal = dataPagamento || new Date().toISOString();
      
      console.log('🚀 Chamando onPagamento...');
      const sucesso = await onPagamento(
        dadosModal.categoria,
        valorNumerico,
        formaPagamento,
        observacoes || undefined,
        dataFinal
      );

      console.log('✅ Resultado onPagamento:', sucesso);

      if (sucesso) {
        setModalAberto(false);
        toast.success(`Pagamento de ${dadosModal.titulo.toLowerCase()} registrado!`);
      } else {
        toast.error('Erro ao processar pagamento');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setProcessando(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-9 px-3 text-sm',
    lg: 'h-10 px-4 text-base'
  };

  // Se não há pendências, mostrar apenas status
  if (pendenteTotal <= 0.01) {
    return (
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <span className="text-xs text-green-700 font-medium">Pago</span>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={`${sizeClasses[size]} border-blue-200 hover:bg-blue-50`}
            disabled={disabled}
          >
            <CreditCard className="h-3 w-3 mr-1" />
            Pagar
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {pendenteViagem > 0.01 && (
            <DropdownMenuItem onClick={() => abrirModal('viagem')}>
              <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
              <div className="flex flex-col">
                <span>Pagar Viagem</span>
                <span className="text-xs text-muted-foreground">
                  R$ {pendenteViagem.toFixed(2)}
                </span>
              </div>
            </DropdownMenuItem>
          )}
          
          {pendentePasseios > 0.01 && (
            <DropdownMenuItem onClick={() => abrirModal('passeios')}>
              <MapPin className="h-4 w-4 mr-2 text-purple-600" />
              <div className="flex flex-col">
                <span>Pagar Passeios</span>
                <span className="text-xs text-muted-foreground">
                  R$ {pendentePasseios.toFixed(2)}
                </span>
              </div>
            </DropdownMenuItem>
          )}
          
          {/* Botão "Pagar Tudo" removido */}
          

        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal de Confirmação */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {dadosModal?.titulo}
            </DialogTitle>
            <DialogDescription>
              Registrar pagamento para <strong>{nomePassageiro}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Breakdown Visual */}
            <BreakdownVisual
              valorViagem={valorViagem}
              valorPasseios={valorPasseios}
              pagoViagem={pagoViagem}
              pagoPasseios={pagoPasseios}
              compact={true}
            />

            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="valor">Valor do Pagamento</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="pl-8"
                  placeholder="0,00"
                  // Validações para "Pagar Tudo" removidas
                />
              </div>
              {dadosModal && parseFloat(valor) > dadosModal.valorSugerido && (
                <div className="flex items-center gap-1 text-amber-600 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  Valor maior que o pendente
                </div>
              )}
            </div>

            {/* Forma de Pagamento */}
            <div className="space-y-2">
              <Label htmlFor="forma-pagamento">Forma de Pagamento</Label>
              <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                  <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data do Pagamento */}
            <div className="space-y-2">
              <Label htmlFor="data-pagamento">Data do Pagamento</Label>
              <Input
                id="data-pagamento"
                type="date"
                value={dataPagamento ? dataPagamento.split('T')[0] : ''}
                onChange={(e) => {
                  // Converter para ISO string com horário atual se data for selecionada
                  if (e.target.value) {
                    const selectedDate = new Date(e.target.value + 'T' + new Date().toTimeString().slice(0, 8));
                    setDataPagamento(selectedDate.toISOString());
                  } else {
                    setDataPagamento('');
                  }
                }}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground">
                Deixe em branco para usar a data atual
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Informações adicionais sobre o pagamento..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setModalAberto(false)}
              disabled={processando}
            >
              Cancelar
            </Button>
            <Button 
              onClick={confirmarPagamento}
              disabled={processando || !valor || parseFloat(valor) <= 0}
            >
              {processando ? 'Processando...' : 'Confirmar Pagamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </>
  );
}