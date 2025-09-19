/**
 * Componente de relatório personalizado que usa PersonalizationConfig
 */

import React, { useMemo } from 'react';
import { PersonalizationConfig, PassageiroDisplay, OnibusData, PasseioData, ViagemData } from '@/types/personalizacao-relatorios';
import { formatColumnValue } from '@/lib/personalizacao-utils';

interface PersonalizedReportProps {
  config: PersonalizationConfig;
  data: {
    viagem: ViagemData;
    passageiros: PassageiroDisplay[];
    onibus: OnibusData[];
    passeios: PasseioData[];
  };
  className?: string;
}

export function PersonalizedReport({ config, data, className = '' }: PersonalizedReportProps) {
  // Colunas visíveis ordenadas
  const colunasVisiveis = useMemo(() => {
    return config.passageiros.colunas
      .filter(col => col.visivel)
      .sort((a, b) => a.ordem - b.ordem);
  }, [config.passageiros.colunas]);

  // Seções visíveis ordenadas
  const secoesVisiveis = useMemo(() => {
    return config.secoes.secoes
      .filter(secao => secao.visivel)
      .sort((a, b) => a.ordem - b.ordem);
  }, [config.secoes.secoes]);

  // Passageiros ordenados e agrupados
  const passageirosProcessados = useMemo(() => {
    let processedPassageiros = [...data.passageiros];

    // Aplicar ordenação
    processedPassageiros.sort((a, b) => {
      const campo = config.passageiros.ordenacao.campo;
      const direcao = config.passageiros.ordenacao.direcao;
      
      const valueA = a[campo];
      const valueB = b[campo];
      
      let comparison = 0;
      if (valueA < valueB) comparison = -1;
      if (valueA > valueB) comparison = 1;
      
      return direcao === 'desc' ? -comparison : comparison;
    });

    // Aplicar agrupamento se ativo
    if (config.passageiros.agrupamento.ativo && config.passageiros.agrupamento.campo) {
      const grupos: Record<string, PassageiroDisplay[]> = {};
      
      processedPassageiros.forEach(passageiro => {
        const campo = config.passageiros.agrupamento.campo!;
        const chave = String(passageiro[campo] || 'Não informado');
        
        if (!grupos[chave]) {
          grupos[chave] = [];
        }
        grupos[chave].push(passageiro);
      });

      return grupos;
    }

    return { 'Todos': processedPassageiros };
  }, [data.passageiros, config.passageiros.ordenacao, config.passageiros.agrupamento]);

  // Estilos CSS baseados na configuração
  const styles = useMemo(() => ({
    container: {
      fontFamily: config.estilo.fontes.familia,
      fontSize: `${config.estilo.fontes.tamanhoTexto}px`,
      color: config.estilo.cores.textoNormal,
      backgroundColor: config.estilo.cores.fundo,
      padding: `${config.estilo.layout.margens.superior}px ${config.estilo.layout.margens.direita}px ${config.estilo.layout.margens.inferior}px ${config.estilo.layout.margens.esquerda}px`,
      lineHeight: config.estilo.layout.espacamento.entreLinhas
    },
    header: {
      fontSize: `${config.estilo.fontes.tamanhoHeader}px`,
      fontWeight: config.estilo.fontes.pesoHeader,
      color: config.estilo.cores.headerPrincipal,
      marginBottom: `${config.estilo.layout.espacamento.entreSecoes}px`,
      textAlign: 'center' as const
    },
    sectionTitle: {
      fontSize: `${config.estilo.fontes.tamanhoHeader - 2}px`,
      fontWeight: config.estilo.fontes.pesoHeader,
      color: config.estilo.cores.headerSecundario,
      marginTop: `${config.estilo.layout.espacamento.entreSecoes}px`,
      marginBottom: `${config.estilo.layout.espacamento.entreParagrafos}px`,
      borderBottom: config.estilo.elementos.separadores ? `1px solid ${config.estilo.cores.bordas}` : 'none',
      paddingBottom: config.estilo.elementos.separadores ? '8px' : '0'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      fontSize: `${config.estilo.fontes.tamanhoTabela}px`,
      marginBottom: `${config.estilo.layout.espacamento.entreTabelas}px`
    },
    tableHeader: {
      backgroundColor: config.estilo.cores.headerPrincipal,
      color: 'white',
      fontWeight: 'bold',
      padding: '8px',
      border: config.estilo.elementos.bordas ? `1px solid ${config.estilo.cores.bordas}` : 'none'
    },
    tableCell: {
      padding: '6px 8px',
      border: config.estilo.elementos.bordas ? `1px solid ${config.estilo.cores.bordas}` : 'none'
    }
  }), [config.estilo]);

  // Renderizar header
  const renderHeader = () => (
    <div style={styles.header}>
      {config.header.textoPersonalizado.titulo && (
        <h1 style={{ margin: 0, marginBottom: '16px' }}>
          {config.header.textoPersonalizado.titulo}
        </h1>
      )}
      
      {config.header.textoPersonalizado.subtitulo && (
        <h2 style={{ 
          margin: 0, 
          marginBottom: '16px',
          fontSize: `${config.estilo.fontes.tamanhoTexto + 2}px`,
          color: config.estilo.cores.headerSecundario
        }}>
          {config.header.textoPersonalizado.subtitulo}
        </h2>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '16px',
        fontSize: `${config.estilo.fontes.tamanhoTexto}px`
      }}>
        {config.header.dadosJogo.mostrarAdversario && (
          <div><strong>Adversário:</strong> {data.viagem.adversario}</div>
        )}
        {config.header.dadosJogo.mostrarDataHora && (
          <div><strong>Data/Hora:</strong> {new Date(data.viagem.dataJogo).toLocaleString()}</div>
        )}
        {config.header.dadosJogo.mostrarLocalJogo && (
          <div><strong>Local:</strong> {data.viagem.localJogo}</div>
        )}
        {config.header.dadosJogo.mostrarNomeEstadio && (
          <div><strong>Estádio:</strong> {data.viagem.estadio}</div>
        )}
        {config.header.dadosViagem.mostrarStatus && (
          <div><strong>Status:</strong> {data.viagem.status}</div>
        )}
        {config.header.dadosViagem.mostrarValorPadrao && (
          <div><strong>Valor Padrão:</strong> R$ {data.viagem.valorPadrao.toFixed(2)}</div>
        )}
        {config.header.dadosViagem.mostrarSetorPadrao && (
          <div><strong>Setor Padrão:</strong> {data.viagem.setorPadrao}</div>
        )}
        {config.header.totais.mostrarTotalPassageiros && (
          <div><strong>Total de Passageiros:</strong> {data.passageiros.length}</div>
        )}
        {config.header.totais.mostrarTotalArrecadado && (
          <div><strong>Total Arrecadado:</strong> R$ {data.passageiros.reduce((sum, p) => sum + p.valorPago, 0).toFixed(2)}</div>
        )}
      </div>

      {config.header.textoPersonalizado.observacoes && (
        <div style={{ 
          marginTop: '16px',
          padding: '12px',
          backgroundColor: config.estilo.cores.corLinhasAlternadas,
          borderRadius: '4px',
          fontSize: `${config.estilo.fontes.tamanhoTexto - 1}px`
        }}>
          <strong>Observações:</strong> {config.header.textoPersonalizado.observacoes}
        </div>
      )}

      {config.header.textoPersonalizado.instrucoes && (
        <div style={{ 
          marginTop: '8px',
          padding: '12px',
          backgroundColor: config.estilo.cores.corLinhasAlternadas,
          borderRadius: '4px',
          fontSize: `${config.estilo.fontes.tamanhoTexto - 1}px`
        }}>
          <strong>Instruções:</strong> {config.header.textoPersonalizado.instrucoes}
        </div>
      )}
    </div>
  );

  // Renderizar seção
  const renderSection = (secao: any) => {
    const sectionStyle = { ...styles.sectionTitle };
    
    return (
      <div key={secao.id} style={{ marginBottom: `${config.estilo.layout.espacamento.entreSecoes}px` }}>
        <h3 style={sectionStyle}>{secao.titulo}</h3>
        
        {secao.tipo === 'resumo_financeiro' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '16px' 
          }}>
            <div><strong>Total Arrecadado:</strong> R$ {data.passageiros.reduce((sum, p) => sum + p.valorPago, 0).toFixed(2)}</div>
            <div><strong>Passageiros Pagos:</strong> {data.passageiros.filter(p => p.statusPagamento === 'Pago').length}</div>
            <div><strong>Passageiros Pendentes:</strong> {data.passageiros.filter(p => p.statusPagamento === 'Pendente').length}</div>
          </div>
        )}
        
        {secao.tipo === 'distribuicao_onibus' && (
          <div>
            {data.onibus.map(onibus => (
              <div key={onibus.id} style={{ marginBottom: '8px' }}>
                <strong>{onibus.numeroIdentificacao}:</strong> {onibus.ocupacao}/{onibus.capacidade} passageiros 
                ({Math.round((onibus.ocupacao / onibus.capacidade) * 100)}% ocupação)
              </div>
            ))}
          </div>
        )}
        
        {secao.tipo === 'distribuicao_setor' && (
          <div>
            {Object.entries(
              data.passageiros.reduce((acc, p) => {
                acc[p.setorMaracana] = (acc[p.setorMaracana] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([setor, count]) => (
              <div key={setor} style={{ marginBottom: '4px' }}>
                <strong>{setor}:</strong> {count} passageiro(s)
              </div>
            ))}
          </div>
        )}
        
        {secao.tipo === 'estatisticas_passeios' && (
          <div>
            {data.passeios.map(passeio => (
              <div key={passeio.id} style={{ marginBottom: '8px' }}>
                <strong>{passeio.nome}:</strong> {passeio.participantes} participante(s)
                {config.passeios.dadosPorPasseio.mostrarValorCobrado && (
                  <span> - R$ {passeio.valor.toFixed(2)}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Renderizar tabela de passageiros
  const renderPassageirosTable = (passageiros: PassageiroDisplay[], titulo?: string) => (
    <div style={{ marginBottom: `${config.estilo.layout.espacamento.entreTabelas}px` }}>
      {titulo && (
        <h4 style={{
          ...styles.sectionTitle,
          fontSize: `${config.estilo.fontes.tamanhoTexto + 2}px`,
          marginTop: '16px'
        }}>
          {titulo} ({passageiros.length} passageiro{passageiros.length !== 1 ? 's' : ''})
        </h4>
      )}
      
      <table style={styles.table}>
        <thead>
          <tr>
            {colunasVisiveis.map(coluna => (
              <th 
                key={coluna.id}
                style={{
                  ...styles.tableHeader,
                  width: coluna.largura ? `${coluna.largura}px` : 'auto',
                  textAlign: coluna.alinhamento || 'left'
                }}
              >
                {coluna.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {passageiros.map((passageiro, index) => (
            <tr key={index}>
              {colunasVisiveis.map(coluna => (
                <td 
                  key={coluna.id}
                  style={{
                    ...styles.tableCell,
                    textAlign: coluna.alinhamento || 'left',
                    backgroundColor: config.estilo.cores.linhasAlternadas && index % 2 === 1 
                      ? config.estilo.cores.corLinhasAlternadas 
                      : 'transparent'
                  }}
                >
                  {formatColumnValue(passageiro[coluna.id], coluna)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={className} style={styles.container}>
      {/* Header */}
      {renderHeader()}

      {/* Seções */}
      {secoesVisiveis.map(renderSection)}

      {/* Lista de Passageiros */}
      <div style={styles.sectionTitle}>
        Lista de Passageiros
      </div>
      
      {config.passageiros.agrupamento.ativo ? (
        Object.entries(passageirosProcessados).map(([grupo, passageiros]) => 
          renderPassageirosTable(passageiros, grupo !== 'Todos' ? grupo : undefined)
        )
      ) : (
        renderPassageirosTable(passageirosProcessados['Todos'])
      )}

      {/* Footer */}
      {config.header.totais.mostrarDataGeracao && (
        <div style={{
          textAlign: 'center',
          marginTop: `${config.estilo.layout.espacamento.entreSecoes}px`,
          paddingTop: '16px',
          borderTop: config.estilo.elementos.separadores ? `1px solid ${config.estilo.cores.bordas}` : 'none',
          fontSize: `${config.estilo.fontes.tamanhoTexto - 1}px`,
          color: config.estilo.cores.headerSecundario
        }}>
          Relatório gerado em {new Date().toLocaleString()}
        </div>
      )}
    </div>
  );
}