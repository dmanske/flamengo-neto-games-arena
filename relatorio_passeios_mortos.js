import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uroukakmvanyeqxicuzw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb3VrYWttdmFueWVxeGljdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MzMzOTYsImV4cCI6MjA2MjQwOTM5Nn0.fFRtqvpf7kwbJyAh5JHYjTU2zbEI9BvAjDp2rXikrO8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function gerarRelatorioPasseiosMortos() {
  console.log('🚨 RELATÓRIO: PASSEIOS MORTOS NO SISTEMA\n');
  console.log('=' .repeat(60));

  try {
    // Buscar todos os passeios
    const { data: passeios, error: passeiosError } = await supabase
      .from('passeios')
      .select('*')
      .order('categoria', { ascending: false })
      .order('valor', { ascending: false });

    if (passeiosError) {
      console.error('❌ Erro ao buscar passeios:', passeiosError.message);
      return;
    }

    // Verificar uso dos passeios
    const { count: usoCount } = await supabase
      .from('passageiro_passeios')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 RESUMO EXECUTIVO:`);
    console.log(`   • Total de passeios cadastrados: ${passeios.length}`);
    console.log(`   • Passeios utilizados: ${usoCount || 0}`);
    console.log(`   • Status: ${usoCount === 0 ? '🚨 TODOS OS PASSEIOS ESTÃO MORTOS' : '✅ Alguns passeios em uso'}`);
    console.log('');

    if (usoCount === 0) {
      // Categorizar passeios
      const passeiosPagos = passeios.filter(p => p.categoria === 'pago');
      const passeiosGratuitos = passeios.filter(p => p.categoria === 'gratuito');
      const passeiosInativos = passeios.filter(p => !p.ativo);
      const passeiosAtivos = passeios.filter(p => p.ativo);

      console.log('📋 ANÁLISE DETALHADA:');
      console.log(`   • Passeios pagos: ${passeiosPagos.length}`);
      console.log(`   • Passeios gratuitos: ${passeiosGratuitos.length}`);
      console.log(`   • Passeios ativos: ${passeiosAtivos.length}`);
      console.log(`   • Passeios inativos: ${passeiosInativos.length}`);
      console.log('');

      // Valor total dos passeios pagos
      const valorTotal = passeiosPagos.reduce((sum, p) => sum + (p.valor || 0), 0);
      console.log(`💰 VALOR TOTAL DOS PASSEIOS PAGOS: R$ ${valorTotal.toFixed(2)}`);
      console.log('');

      // Listar passeios mais caros
      console.log('💎 TOP 10 PASSEIOS MAIS CAROS (MORTOS):');
      const topCaros = passeiosPagos
        .sort((a, b) => (b.valor || 0) - (a.valor || 0))
        .slice(0, 10);
      
      topCaros.forEach((passeio, index) => {
        console.log(`   ${index + 1}. ${passeio.nome} - R$ ${passeio.valor}`);
      });
      console.log('');

      // Opções de limpeza
      console.log('🧹 OPÇÕES DE LIMPEZA:');
      console.log('');
      console.log('1️⃣  LIMPEZA CONSERVADORA:');
      console.log('   • Manter passeios ativos');
      console.log('   • Remover apenas passeios inativos');
      console.log(`   • Passeios a remover: ${passeiosInativos.length}`);
      console.log('');
      
      console.log('2️⃣  LIMPEZA MODERADA:');
      console.log('   • Manter apenas passeios gratuitos');
      console.log('   • Remover todos os passeios pagos');
      console.log(`   • Passeios a remover: ${passeiosPagos.length}`);
      console.log('');
      
      console.log('3️⃣  LIMPEZA COMPLETA:');
      console.log('   • Remover TODOS os passeios');
      console.log('   • Começar do zero');
      console.log(`   • Passeios a remover: ${passeios.length}`);
      console.log('');
      
      console.log('4️⃣  LIMPEZA SELETIVA:');
      console.log('   • Manter apenas passeios específicos');
      console.log('   • Remover passeios duplicados ou desnecessários');
      console.log('   • Análise manual necessária');
      console.log('');

      // Detectar possíveis duplicatas
      console.log('🔍 ANÁLISE DE DUPLICATAS:');
      const nomes = passeios.map(p => p.nome.toLowerCase().trim());
      const duplicatas = nomes.filter((nome, index) => nomes.indexOf(nome) !== index);
      
      if (duplicatas.length > 0) {
        console.log(`   ⚠️  Possíveis duplicatas encontradas: ${duplicatas.length}`);
        const nomesUnicos = [...new Set(duplicatas)];
        nomesUnicos.forEach(nome => {
          const similares = passeios.filter(p => p.nome.toLowerCase().trim() === nome);
          console.log(`   • "${similares[0].nome}" - ${similares.length} ocorrências`);
        });
      } else {
        console.log('   ✅ Nenhuma duplicata óbvia encontrada');
      }
      console.log('');

      // Comandos SQL para limpeza
      console.log('💻 COMANDOS SQL PARA LIMPEZA:');
      console.log('');
      console.log('-- Opção 1: Remover apenas inativos');
      console.log('DELETE FROM passeios WHERE ativo = false;');
      console.log('');
      console.log('-- Opção 2: Remover apenas pagos');
      console.log("DELETE FROM passeios WHERE categoria = 'pago';");
      console.log('');
      console.log('-- Opção 3: Remover todos');
      console.log('DELETE FROM passeios;');
      console.log('');
      console.log('-- Opção 4: Backup antes da limpeza');
      console.log('-- CREATE TABLE passeios_backup AS SELECT * FROM passeios;');
      console.log('');

      // Lista completa para referência
      console.log('📋 LISTA COMPLETA DE PASSEIOS MORTOS:');
      console.log('=' .repeat(80));
      console.table(passeios.map(p => ({
        id: p.id,
        nome: p.nome,
        valor: p.valor,
        categoria: p.categoria,
        ativo: p.ativo,
        created_at: p.created_at?.substring(0, 10)
      })));
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

gerarRelatorioPasseiosMortos().catch(console.error);