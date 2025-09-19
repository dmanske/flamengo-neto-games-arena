/**
 * Componente de preview em tempo real
 */

import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Download,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { PersonalizationConfig } from '@/types/personalizacao-relatorios';
import { PersonalizedReport } from '../PersonalizedReport';
// Removidas dependências problemáticas

interface PreviewPersonalizacaoProps {
  config: PersonalizationConfig;
  viagemId: string;
  realData?: {
    viagem: any;
    passageiros: any[];
    onibus: any[];
    passeios: any[];
  };
}

export function PreviewPersonalizacao({ config, viagemId, realData }: PreviewPersonalizacaoProps) {
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Usar dados reais quando disponíveis, senão usar dados mockados
  const previewData = useMemo(() => {
    if (realData) {
      return {
        viagem: realData.viagem,
        passageiros: realData.passageiros,
        onibus: realData.onibus,
        passeios: realData.passeios,
        estatisticas: {
          totalPassageiros: realData.passageiros.length,
          totalArrecadado: realData.passageiros.reduce((sum: number, p: any) => sum + (p.valor_pago || 0), 0),
          passageirosPagos: realData.passageiros.filter((p: any) => p.status_pagamento === 'Pago').length,
          passageirosPendentes: realData.passageiros.filter((p: any) => p.status_pagamento === 'Pendente').length
        }
      };
    }
    
    // Dados mockados para preview quando não há dados reais
    return {
    viagem: {
      id: viagemId,
      adversario: 'Botafogo',
      dataJogo: '2024-03-15T20:00:00',
      localJogo: 'Maracanã',
      estadio: 'Estádio do Maracanã',
      status: 'Confirmada',
      valorPadrao: 150,
      setorPadrao: 'Norte'
    },
    passageiros: [
      {
        numeroSequencial: 1,
        nome: 'João Silva',
        cpf: '123.456.789-00',
        dataNascimento: '1990-05-15',
        idade: 34,
        telefone: '(21) 99999-9999',
        email: 'joao@email.com',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        endereco: 'Rua das Flores, 123',
        numero: '123',
        bairro: 'Copacabana',
        cep: '22070-000',
        complemento: 'Apto 101',
        cidadeEmbarque: 'Rio de Janeiro',
        setorMaracana: 'Norte',
        onibusAlocado: 'Ônibus 01',
        assento: '15A',
        statusPagamento: 'Pago',
        formaPagamento: 'PIX',
        valorPago: 150,
        desconto: 0,
        valorBruto: 150,
        parcelas: '1x',
        pagoPorCredito: false,
        valorCreditoUtilizado: 0,
        origemCredito: '',
        passeiosSelecionados: ['Cristo Redentor', 'Pão de Açúcar'],
        statusPasseios: 'Confirmado',
        valoresCobradosPasseio: [50, 40],
        responsavelOnibus: false,
        observacoes: 'Primeira viagem',
        comoConheceu: 'Instagram'
      },
      {
        numeroSequencial: 2,
        nome: 'Maria Santos',
        cpf: '987.654.321-00',
        dataNascimento: '1985-08-22',
        idade: 39,
        telefone: '(21) 88888-8888',
        email: 'maria@email.com',
        cidade: 'Niterói',
        estado: 'RJ',
        endereco: 'Av. Atlântica, 456',
        numero: '456',
        bairro: 'Icaraí',
        cep: '24230-000',
        complemento: 'Casa',
        cidadeEmbarque: 'Niterói',
        setorMaracana: 'Sul',
        onibusAlocado: 'Ônibus 01',
        assento: '16B',
        statusPagamento: 'Pendente',
        formaPagamento: 'Cartão de Crédito',
        valorPago: 0,
        desconto: 15,
        valorBruto: 150,
        parcelas: '3x',
        pagoPorCredito: false,
        valorCreditoUtilizado: 0,
        origemCredito: '',
        passeiosSelecionados: ['Cristo Redentor'],
        statusPasseios: 'Pendente',
        valoresCobradosPasseio: [50],
        responsavelOnibus: false,
        observacoes: 'Cliente VIP',
        comoConheceu: 'Indicação'
      },
      {
        numeroSequencial: 3,
        nome: 'Pedro Costa',
        cpf: '456.789.123-00',
        dataNascimento: '1995-12-10',
        idade: 29,
        telefone: '(21) 77777-7777',
        email: 'pedro@email.com',
        cidade: 'São Gonçalo',
        estado: 'RJ',
        endereco: 'Rua do Sol, 789',
        numero: '789',
        bairro: 'Centro',
        cep: '24440-000',
        complemento: '',
        cidadeEmbarque: 'São Gonçalo',
        setorMaracana: 'Norte',
        onibusAlocado: 'Ônibus 02',
        assento: '10C',
        statusPagamento: 'Pago',
        formaPagamento: 'Dinheiro',
        valorPago: 135,
        desconto: 15,
        valorBruto: 150,
        parcelas: '1x',
        pagoPorCredito: true,
        valorCreditoUtilizado: 15,
        origemCredito: 'Viagem anterior',
        passeiosSelecionados: ['Museu do Flamengo'],
        statusPasseios: 'Confirmado',
        valoresCobradosPasseio: [30],
        responsavelOnibus: true,
        observacoes: 'Responsável pelo ônibus 02',
        comoConheceu: 'Facebook'
      }
    ],
    onibus: [
      {
        id: '1',
        numeroIdentificacao: 'Ônibus 01',
        tipoOnibus: '46 Semi-Leito',
        empresa: 'Viação 1001',
        capacidade: 46,
        ocupacao: 2,
        passageiros: []
      },
      {
        id: '2',
        numeroIdentificacao: 'Ônibus 02',
        tipoOnibus: '50 Convencional',
        empresa: 'Kaissara',
        capacidade: 50,
        ocupacao: 1,
        passageiros: []
      }
    ],
    passeios: [
      {
        id: '1',
        nome: 'Cristo Redentor',
        categoria: 'pago' as const,
        valor: 50,
        participantes: 2,
        custoOperacional: 30
      },
      {
        id: '2',
        nome: 'Pão de Açúcar',
        categoria: 'pago' as const,
        valor: 40,
        participantes: 1,
        custoOperacional: 25
      },
      {
        id: '3',
        nome: 'Museu do Flamengo',
        categoria: 'pago' as const,
        valor: 30,
        participantes: 1,
        custoOperacional: 15
      }
    ],
    estatisticas: {
      totalPassageiros: 3,
      totalArrecadado: 285,
      totalIngressos: 3,
      passageirosPagos: 2,
      passageirosPendentes: 1,
      ocupacaoMedia: 75
    }
  };
  }, [viagemId, realData]);

  // Funções de controle de zoom
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));

  /**
   * Função para gerar PDF usando a API nativa do navegador
   */
  const handleExportPDF = () => {
    setIsGeneratingPDF(true);
    
    try {
      // Criar uma nova janela para impressão
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Popup bloqueado. Permita popups para baixar o PDF.');
        setIsGeneratingPDF(false);
        return;
      }

      // Gerar HTML completo para impressão
      const printContent = generatePrintableHTML();
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Aguardar carregamento e imprimir
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setIsGeneratingPDF(false);
        alert('💡 Na janela que abrir, selecione "Salvar como PDF" como destino!');
      }, 500);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
      setIsGeneratingPDF(false);
    }
  };

  /**
   * Gera HTML completo para impressão
   */
  const generatePrintableHTML = () => {
    const colunasVisiveis = config.passageiros.colunas.filter(col => col.visivel);
    const secoesVisiveis = config.secoes.secoes.filter(secao => secao.visivel);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório Personalizado - ${config.header.textoPersonalizado.titulo || 'Flamengo vs ' + previewData.viagem.adversario}</title>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: ${config.estilo.fontes.familia}; 
            font-size: ${config.estilo.fontes.tamanhoTexto}px;
            color: ${config.estilo.cores.textoNormal};
            background: white;
            padding: 20px;
            line-height: ${config.estilo.layout.espacamento.entreLinhas};
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid ${config.estilo.cores.bordas};
          }
          .header h1 { 
            font-size: ${config.estilo.fontes.tamanhoHeader}px;
            font-weight: ${config.estilo.fontes.pesoHeader};
            color: ${config.estilo.cores.headerPrincipal};
            margin-bottom: 16px;
          }
          .header-info { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 16px; 
            margin-bottom: 16px;
          }
          .section { 
            margin-bottom: 30px; 
          }
          .section h3 { 
            font-size: ${config.estilo.fontes.tamanhoHeader - 2}px;
            font-weight: ${config.estilo.fontes.pesoHeader};
            color: ${config.estilo.cores.headerSecundario};
            margin-bottom: 15px;
            border-bottom: 1px solid ${config.estilo.cores.bordas};
            padding-bottom: 8px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: ${config.estilo.fontes.tamanhoTabela}px;
            margin-bottom: 20px;
          }
          th { 
            background-color: ${config.estilo.cores.headerPrincipal}; 
            color: white; 
            font-weight: bold; 
            padding: 12px 8px; 
            border: 1px solid ${config.estilo.cores.bordas};
            text-align: left;
          }
          td { 
            padding: 8px; 
            border: 1px solid ${config.estilo.cores.bordas};
          }
          tr:nth-child(even) { 
            background-color: ${config.estilo.cores.linhasAlternadas ? config.estilo.cores.corLinhasAlternadas : 'transparent'}; 
          }
          .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
            gap: 16px; 
            margin-bottom: 20px;
          }
          .footer { 
            text-align: center; 
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid ${config.estilo.cores.bordas};
            font-size: ${config.estilo.fontes.tamanhoTexto - 1}px;
            color: ${config.estilo.cores.headerSecundario};
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .section { page-break-inside: avoid; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        ${generatePrintContent(colunasVisiveis, secoesVisiveis)}
      </body>
      </html>
    `;
  };

  /**
   * Gera o conteúdo do relatório para impressão
   */
  const generatePrintContent = (colunasVisiveis: any[], secoesVisiveis: any[]) => {
    let content = '';

    // Header
    content += '<div class="header">';
    if (config.header.textoPersonalizado.titulo) {
      content += `<h1>${config.header.textoPersonalizado.titulo}</h1>`;
    } else {
      content += `<h1>Relatório de Viagem - Flamengo vs ${previewData.viagem.adversario}</h1>`;
    }
    
    if (config.header.textoPersonalizado.subtitulo) {
      content += `<h2 style="font-size: ${config.estilo.fontes.tamanhoTexto + 2}px; color: ${config.estilo.cores.headerSecundario}; margin-bottom: 16px;">${config.header.textoPersonalizado.subtitulo}</h2>`;
    }
    
    content += '<div class="header-info">';
    if (config.header.dadosJogo.mostrarAdversario) {
      content += `<div><strong>Adversário:</strong> ${previewData.viagem.adversario}</div>`;
    }
    if (config.header.dadosJogo.mostrarDataHora) {
      content += `<div><strong>Data/Hora:</strong> ${new Date(previewData.viagem.dataJogo).toLocaleString()}</div>`;
    }
    if (config.header.dadosJogo.mostrarLocalJogo) {
      content += `<div><strong>Local:</strong> ${previewData.viagem.localJogo}</div>`;
    }
    if (config.header.dadosJogo.mostrarNomeEstadio) {
      content += `<div><strong>Estádio:</strong> ${previewData.viagem.estadio || 'Maracanã'}</div>`;
    }
    if (config.header.totais.mostrarTotalPassageiros) {
      content += `<div><strong>Passageiros:</strong> ${previewData.estatisticas.totalPassageiros}</div>`;
    }
    if (config.header.totais.mostrarTotalArrecadado) {
      content += `<div><strong>Total Arrecadado:</strong> R$ ${previewData.estatisticas.totalArrecadado.toFixed(2)}</div>`;
    }
    content += '</div>';
    
    if (config.header.textoPersonalizado.observacoes) {
      content += `<div style="margin-top: 16px; padding: 12px; background-color: ${config.estilo.cores.corLinhasAlternadas}; border-radius: 4px; font-size: ${config.estilo.fontes.tamanhoTexto - 1}px;"><strong>Observações:</strong> ${config.header.textoPersonalizado.observacoes}</div>`;
    }
    
    if (config.header.textoPersonalizado.instrucoes) {
      content += `<div style="margin-top: 8px; padding: 12px; background-color: ${config.estilo.cores.corLinhasAlternadas}; border-radius: 4px; font-size: ${config.estilo.fontes.tamanhoTexto - 1}px;"><strong>Instruções:</strong> ${config.header.textoPersonalizado.instrucoes}</div>`;
    }
    
    content += '</div>';

    // Seções
    secoesVisiveis.forEach(secao => {
      content += `<div class="section"><h3>${secao.titulo}</h3>`;
      
      // Resumo Financeiro
      if (secao.tipo === 'resumo_financeiro') {
        content += '<div class="stats-grid">';
        content += `<div><strong>Total Arrecadado:</strong> R$ ${previewData.estatisticas.totalArrecadado.toFixed(2)}</div>`;
        content += `<div><strong>Passageiros Pagos:</strong> ${previewData.estatisticas.passageirosPagos}</div>`;
        content += `<div><strong>Passageiros Pendentes:</strong> ${previewData.estatisticas.passageirosPendentes}</div>`;
        content += `<div><strong>Taxa de Pagamento:</strong> ${Math.round((previewData.estatisticas.passageirosPagos / previewData.estatisticas.totalPassageiros) * 100)}%</div>`;
        content += '</div>';
      }
      
      // Distribuição por Ônibus
      else if (secao.tipo === 'distribuicao_onibus') {
        content += '<div>';
        previewData.onibus.forEach((onibus: any) => {
          const ocupacaoPercent = Math.round((onibus.ocupacao / onibus.capacidade) * 100);
          content += `<div style="margin-bottom: 8px;"><strong>${onibus.numeroIdentificacao}:</strong> ${onibus.ocupacao}/${onibus.capacidade} passageiros (${ocupacaoPercent}% ocupação)</div>`;
        });
        content += '</div>';
      }
      
      // Distribuição por Setor
      else if (secao.tipo === 'distribuicao_setor') {
        const setores = previewData.passageiros.reduce((acc: any, p: any) => {
          const setor = p.setorMaracana || 'Não informado';
          acc[setor] = (acc[setor] || 0) + 1;
          return acc;
        }, {});
        
        content += '<div>';
        Object.entries(setores).forEach(([setor, count]) => {
          content += `<div style="margin-bottom: 4px;"><strong>${setor}:</strong> ${count} passageiro(s)</div>`;
        });
        content += '</div>';
      }
      
      // Distribuição por Cidade
      else if (secao.tipo === 'distribuicao_cidade') {
        const cidades = previewData.passageiros.reduce((acc: any, p: any) => {
          const cidade = p.cidade || 'Não informado';
          acc[cidade] = (acc[cidade] || 0) + 1;
          return acc;
        }, {});
        
        content += '<div>';
        Object.entries(cidades).forEach(([cidade, count]) => {
          content += `<div style="margin-bottom: 4px;"><strong>${cidade}:</strong> ${count} passageiro(s)</div>`;
        });
        content += '</div>';
      }
      
      // Estatísticas de Passeios
      else if (secao.tipo === 'estatisticas_passeios') {
        content += '<div>';
        previewData.passeios.forEach((passeio: any) => {
          content += `<div style="margin-bottom: 8px;"><strong>${passeio.nome}:</strong> ${passeio.participantes} participante(s)`;
          if (passeio.valor > 0) {
            content += ` - R$ ${passeio.valor.toFixed(2)} cada`;
          }
          content += `</div>`;
        });
        content += '</div>';
      }
      
      // Faixas Etárias
      else if (secao.tipo === 'faixas_etarias') {
        const faixas = previewData.passageiros.reduce((acc: any, p: any) => {
          const idade = p.idade || 0;
          let faixa = '';
          if (idade < 18) faixa = 'Menor de 18';
          else if (idade < 30) faixa = '18-29';
          else if (idade < 50) faixa = '30-49';
          else if (idade < 65) faixa = '50-64';
          else faixa = '65+';
          
          acc[faixa] = (acc[faixa] || 0) + 1;
          return acc;
        }, {});
        
        content += '<div>';
        Object.entries(faixas).forEach(([faixa, count]) => {
          content += `<div style="margin-bottom: 4px;"><strong>${faixa} anos:</strong> ${count} passageiro(s)</div>`;
        });
        content += '</div>';
      }
      
      // Formas de Pagamento
      else if (secao.tipo === 'formas_pagamento') {
        const formas = previewData.passageiros.reduce((acc: any, p: any) => {
          const forma = p.formaPagamento || 'Não informado';
          acc[forma] = (acc[forma] || 0) + 1;
          return acc;
        }, {});
        
        content += '<div>';
        Object.entries(formas).forEach(([forma, count]) => {
          content += `<div style="margin-bottom: 4px;"><strong>${forma}:</strong> ${count} passageiro(s)</div>`;
        });
        content += '</div>';
      }
      
      // Status de Pagamento
      else if (secao.tipo === 'status_pagamento') {
        const status = previewData.passageiros.reduce((acc: any, p: any) => {
          const st = p.statusPagamento || 'Não informado';
          acc[st] = (acc[st] || 0) + 1;
          return acc;
        }, {});
        
        content += '<div>';
        Object.entries(status).forEach(([st, count]) => {
          content += `<div style="margin-bottom: 4px;"><strong>${st}:</strong> ${count} passageiro(s)</div>`;
        });
        content += '</div>';
      }
      
      // Seção genérica para outros tipos
      else {
        content += `<div style="padding: 10px; background-color: ${config.estilo.cores.corLinhasAlternadas}; border-radius: 4px; font-style: italic;">Conteúdo da seção "${secao.titulo}" será implementado conforme os dados disponíveis.</div>`;
      }
      
      content += '</div>';
    });

    // Tabela de Passageiros
    content += '<div class="section"><h3>Lista de Passageiros</h3>';
    content += '<table><thead><tr>';
    
    colunasVisiveis.forEach(coluna => {
      content += `<th style="text-align: ${coluna.alinhamento || 'left'}">${coluna.label}</th>`;
    });
    content += '</tr></thead><tbody>';
    
    previewData.passageiros.forEach((passageiro: any, index: number) => {
      const isEven = index % 2 === 1;
      const bgColor = config.estilo.cores.linhasAlternadas && isEven ? config.estilo.cores.corLinhasAlternadas : 'transparent';
      content += `<tr style="background-color: ${bgColor}">`;
      
      colunasVisiveis.forEach(coluna => {
        let valor = passageiro[coluna.id] || '-';
        
        // Formatação especial para alguns campos
        if (coluna.id === 'valorPago' && valor !== '-') {
          valor = `R$ ${parseFloat(valor).toFixed(2)}`;
        } else if (coluna.id === 'dataNascimento' && valor !== '-') {
          valor = new Date(valor).toLocaleDateString('pt-BR');
        } else if (coluna.id === 'telefone' && valor !== '-') {
          valor = valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        
        content += `<td style="text-align: ${coluna.alinhamento || 'left'}">${valor}</td>`;
      });
      content += '</tr>';
    });
    
    content += '</tbody></table></div>';

    // Footer
    if (config.header.totais.mostrarDataGeracao) {
      content += `<div class="footer">Relatório gerado em ${new Date().toLocaleString('pt-BR')}</div>`;
    }

    return content;
  };







  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Preview do Relatório
          </CardTitle>
          <CardDescription>
            Visualize como o relatório ficará com as configurações atuais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              
              <Badge variant="secondary">
                {zoom}%
              </Badge>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(100)}
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFullscreen(!fullscreen)}
              >
                <Maximize className="w-4 h-4" />
                {fullscreen ? 'Sair' : 'Tela Cheia'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Baixar PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className={fullscreen ? "h-screen" : "h-96"}>
            <div className="p-6">
              <div ref={reportRef} className="personalized-report">
                <PersonalizedReport
                  config={config}
                  data={previewData}
                />
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Informações do Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>Colunas Visíveis:</strong> {config.passageiros.colunas.filter(c => c.visivel).length}
            </div>
            <div>
              <strong>Seções Ativas:</strong> {config.secoes.secoes.filter(s => s.visivel).length}
            </div>
            <div>
              <strong>Orientação:</strong> {config.estilo.layout.orientacao}
            </div>
            <div>
              <strong>Fonte:</strong> {config.estilo.fontes.familia.split(',')[0]}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}