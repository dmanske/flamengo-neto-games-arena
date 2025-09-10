import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uroukakmvanyeqxicuzw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb3VrYWttdmFueWVxeGljdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MzMzOTYsImV4cCI6MjA2MjQwOTM5Nn0.fFRtqvpf7kwbJyAh5JHYjTU2zbEI9BvAjDp2rXikrO8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPassageiroPasseios() {
  console.log('🔍 Verificando tabela passageiro_passeios...\n');

  try {
    // Verificar se a tabela existe e tem dados
    const { data: count, error: countError } = await supabase
      .from('passageiro_passeios')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Erro ao acessar tabela passageiro_passeios:', countError);
      return;
    }

    console.log(`📊 Total de registros em passageiro_passeios: ${count || 0}`);

    if (count && count > 0) {
      // Mostrar alguns registros de exemplo
      const { data: samples, error: sampleError } = await supabase
        .from('passageiro_passeios')
        .select('*')
        .limit(10);

      if (!sampleError && samples) {
        console.log('\n📋 Primeiros 10 registros:');
        console.table(samples);
      }

      // Verificar passeios mais utilizados
      const { data: popular, error: popularError } = await supabase
        .from('passageiro_passeios')
        .select('passeio_nome')
        .limit(1000);

      if (!popularError && popular) {
        const contagem = popular.reduce((acc, item) => {
          acc[item.passeio_nome] = (acc[item.passeio_nome] || 0) + 1;
          return acc;
        }, {});

        const ordenados = Object.entries(contagem)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10);

        console.log('\n🏆 Top 10 passeios mais utilizados:');
        ordenados.forEach(([nome, count], index) => {
          console.log(`${index + 1}. ${nome}: ${count} vezes`);
        });
      }
    } else {
      console.log('⚠️ A tabela passageiro_passeios está vazia.');
      
      // Verificar se existem viagens com passageiros
      const { data: viagens, error: viagensError } = await supabase
        .from('viagens')
        .select('id, nome, data_viagem')
        .limit(5);

      if (!viagensError && viagens) {
        console.log('\n🚌 Últimas 5 viagens cadastradas:');
        console.table(viagens);
      }

      const { data: passageiros, error: passageirosError } = await supabase
        .from('viagem_passageiros')
        .select('id, viagem_id')
        .limit(5);

      if (!passageirosError && passageiros) {
        console.log(`\n👥 Total de passageiros cadastrados: ${passageiros.length}`);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkPassageiroPasseios().catch(console.error);
