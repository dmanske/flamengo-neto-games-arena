import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';
import { JogoDetails } from '@/hooks/useJogoDetails';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ModernJogoDetailsLayoutProps {
  jogo: JogoDetails;
  onVoltar: () => void;
  onDeletar: () => void;
  onExportarPDF: () => void;
  children: React.ReactNode;
}

function ModernJogoDetailsLayout({
  jogo,
  onVoltar,
  onDeletar,
  onExportarPDF,
  children
}: ModernJogoDetailsLayoutProps) {
  
  // Função para formatar data e hora
  const formatarDataJogo = (dataString: string) => {
    try {
      const data = new Date(dataString);
      return {
        data: format(data, 'dd/MM/yyyy', { locale: ptBR }),
        diaSemana: format(data, 'EEEE', { locale: ptBR }),
        hora: format(data, 'HH:mm', { locale: ptBR })
      };
    } catch (error) {
      return {
        data: 'Data inválida',
        diaSemana: '',
        hora: ''
      };
    }
  };

  const { data, diaSemana, hora } = formatarDataJogo(jogo.jogo_data);

  return (
    <div className="space-y-6">
      {/* Header com informações do jogo */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={onVoltar}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onExportarPDF}
              className="gap-2"
              disabled={jogo.total_ingressos === 0}
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
            
            <Button
              variant="outline"
              onClick={onDeletar}
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Deletar
            </Button>
          </div>
        </div>

        {/* Logos e informações do jogo */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-8">
            {/* Logo Flamengo */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 mb-3 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-3 shadow-sm border border-gray-200">
                <img
                  src={jogo.logo_flamengo || "https://logodetimes.com/times/flamengo/logo-flamengo-256.png"}
                  alt="Flamengo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-sm font-semibold text-gray-700">Flamengo</span>
            </div>

            {/* VS */}
            <div className="text-3xl font-bold text-gray-400 mx-6">×</div>

            {/* Logo Adversário */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 mb-3 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-3 shadow-sm border border-gray-200">
                {jogo.logo_adversario ? (
                  <img
                    src={jogo.logo_adversario}
                    alt={jogo.adversario}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-bold">
                      {jogo.adversario.substring(0, 3).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-sm font-semibold text-gray-700">{jogo.adversario}</span>
            </div>
          </div>
        </div>

        {/* Informações da partida */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Flamengo × {jogo.adversario}
          </h1>
          <div className="flex items-center justify-center gap-3 text-sm text-gray-600 bg-gray-50 rounded-full px-4 py-2 inline-flex">
            <span className="capitalize font-medium">{diaSemana}</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span className="font-medium">{data}</span>
            {hora !== '00:00' && (
              <>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span className="font-medium">{hora}</span>
              </>
            )}
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span className="font-medium">{jogo.local_jogo === 'casa' ? '🏠 Casa' : '✈️ Fora'}</span>
          </div>
        </div>
      </div>

      {/* Cards de resumo financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ingressos</CardTitle>
            <span className="text-2xl">🎫</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jogo.total_ingressos}</div>
            <p className="text-xs text-muted-foreground">
              {jogo.ingressos_pagos} pagos • {jogo.ingressos_pendentes} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(jogo.receita_total)}</div>
            <p className="text-xs text-muted-foreground">
              Valor total dos ingressos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
            <span className="text-2xl">📈</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(jogo.lucro_total)}</div>
            <p className="text-xs text-muted-foreground">
              {jogo.receita_total > 0 
                ? `Margem: ${((jogo.lucro_total / jogo.receita_total) * 100).toFixed(1)}%`
                : 'Sem receita'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <span className="text-2xl">
              {jogo.ingressos_pendentes > 0 ? '⏳' : jogo.total_ingressos > 0 ? '✅' : '📝'}
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jogo.ingressos_pendentes > 0 
                ? `${jogo.ingressos_pendentes} Pendente${jogo.ingressos_pendentes > 1 ? 's' : ''}`
                : jogo.total_ingressos > 0 
                  ? 'Completo'
                  : 'Sem Ingressos'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {jogo.total_ingressos === 0 
                ? 'Nenhum ingresso cadastrado'
                : jogo.ingressos_pendentes === 0 
                  ? 'Todos os pagamentos em dia'
                  : `${formatCurrency(jogo.receita_total * (jogo.ingressos_pendentes / jogo.total_ingressos))} pendente`
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo das abas */}
      {children}
    </div>
  );
}

export { ModernJogoDetailsLayout };