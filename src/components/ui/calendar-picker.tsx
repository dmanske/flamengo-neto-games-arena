import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface CalendarPickerProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
  onClose?: () => void;
}

export function CalendarPicker({ selectedMonth, selectedYear, onMonthChange, onClose }: CalendarPickerProps) {
  const [viewYear, setViewYear] = useState(selectedYear);
  
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handleMonthSelect = (month: number) => {
    onMonthChange(month, viewYear);
    onClose?.();
  };

  return (
    <Card className="absolute top-full left-0 z-50 mt-2 w-80">
      <CardContent className="p-4">
        {/* Header com navegação de ano */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewYear(viewYear - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h3 className="font-semibold text-lg">{viewYear}</h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewYear(viewYear + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Grid de meses */}
        <div className="grid grid-cols-3 gap-2">
          {meses.map((mes, index) => {
            const isSelected = index === selectedMonth && viewYear === selectedYear;
            const isCurrentMonth = index === new Date().getMonth() && viewYear === new Date().getFullYear();
            
            return (
              <Button
                key={index}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleMonthSelect(index)}
                className={`
                  h-12 text-xs
                  ${isSelected ? 'bg-blue-600 text-white' : ''}
                  ${isCurrentMonth && !isSelected ? 'border-blue-400 text-blue-600' : ''}
                `}
              >
                {mes}
              </Button>
            );
          })}
        </div>

        {/* Botões de ação rápida */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const hoje = new Date();
              handleMonthSelect(hoje.getMonth());
              setViewYear(hoje.getFullYear());
            }}
            className="flex-1"
          >
            Hoje
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const ultimoMes = new Date();
              ultimoMes.setMonth(ultimoMes.getMonth() - 1);
              handleMonthSelect(ultimoMes.getMonth());
              setViewYear(ultimoMes.getFullYear());
            }}
            className="flex-1"
          >
            Mês Passado
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface CalendarButtonProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
}

export function CalendarButton({ selectedMonth, selectedYear, onMonthChange }: CalendarButtonProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  const mesNome = new Date(selectedYear, selectedMonth).toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setShowCalendar(!showCalendar)}
        className="flex items-center gap-2 min-w-[180px] justify-start"
      >
        <Calendar className="h-4 w-4" />
        <span className="capitalize">{mesNome}</span>
      </Button>

      {showCalendar && (
        <>
          {/* Overlay para fechar */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowCalendar(false)}
          />
          
          <CalendarPicker
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={onMonthChange}
            onClose={() => setShowCalendar(false)}
          />
        </>
      )}
    </div>
  );
}