import React from 'react';
import { render, screen } from '@testing-library/react';
import { LinksOnibusSection } from '../LinksOnibusSection';

// Mock do Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          count: 0,
          error: null
        }))
      }))
    }))
  }
}));

// Mock do toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const mockOnibus = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    numero_identificacao: '001',
    tipo_onibus: 'Executivo',
    empresa: 'Viação Teste',
    capacidade_onibus: 45
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    numero_identificacao: '002',
    tipo_onibus: 'Leito',
    empresa: 'Viação Teste',
    capacidade_onibus: 42
  }
];

describe('LinksOnibusSection', () => {
  it('deve renderizar a seção de links por ônibus', () => {
    render(
      <LinksOnibusSection
        viagemId="123e4567-e89b-12d3-a456-426614174000"
        onibus={mockOnibus}
      />
    );

    expect(screen.getByText('Links por Ônibus')).toBeInTheDocument();
    expect(screen.getByText('2 ônibus')).toBeInTheDocument();
  });

  it('deve exibir mensagem quando não há ônibus', () => {
    render(
      <LinksOnibusSection
        viagemId="123e4567-e89b-12d3-a456-426614174000"
        onibus={[]}
      />
    );

    expect(screen.getByText('Nenhum ônibus cadastrado para esta viagem.')).toBeInTheDocument();
  });

  it('deve renderizar informações dos ônibus', () => {
    render(
      <LinksOnibusSection
        viagemId="123e4567-e89b-12d3-a456-426614174000"
        onibus={mockOnibus}
      />
    );

    expect(screen.getByText('001')).toBeInTheDocument();
    expect(screen.getByText('002')).toBeInTheDocument();
    expect(screen.getByText('Executivo')).toBeInTheDocument();
    expect(screen.getByText('Leito')).toBeInTheDocument();
  });
});