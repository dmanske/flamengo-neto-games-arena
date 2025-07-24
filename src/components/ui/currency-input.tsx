import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CurrencyInput({ 
  value, 
  onChange, 
  placeholder = "R$ 0,00",
  className,
  disabled = false
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  // Formatar valor para exibição
  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  // Converter string para número
  const parseCurrency = (str: string): number => {
    // Remove tudo exceto números e vírgula/ponto
    const cleanStr = str.replace(/[^\d,.-]/g, '');
    
    // Substitui vírgula por ponto para parsing
    const normalizedStr = cleanStr.replace(',', '.');
    
    const num = parseFloat(normalizedStr);
    return isNaN(num) ? 0 : num;
  };

  // Atualizar display quando value mudar
  useEffect(() => {
    if (value === 0) {
      setDisplayValue('');
    } else {
      setDisplayValue(formatCurrency(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    const numericValue = parseCurrency(inputValue);
    onChange(numericValue);
  };

  const handleBlur = () => {
    // Reformatar ao perder foco
    if (value > 0) {
      setDisplayValue(formatCurrency(value));
    }
  };

  const handleFocus = () => {
    // Mostrar apenas números ao focar
    if (value > 0) {
      setDisplayValue(value.toString().replace('.', ','));
    }
  };

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder={placeholder}
      className={cn("text-right", className)}
      disabled={disabled}
    />
  );
}