import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uroukakmvanyeqxicuzw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb3VrYWttdmFueWVxeGljdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MzMzOTYsImV4cCI6MjA2MjQwOTM5Nn0.fFRtqvpf7kwbJyAh5JHYjTU2zbEI9BvAjDp2rXikrO8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabaseStatus() {
  console.log('🔍 Verificando status geral do banco de dados...\n');

  try {
    // 1. Verificar tabela clientes
    const { count: clientesCount, error: clientesError } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true });

    console.log(`👥 Clientes cadastrados: ${clientesCount || 0}`);
    if (clientesError) console.error('❌ Erro clientes:', clientesError.message);

    // 2. Verificar tabela viagens
    const { count: viagensCount, error: viagensError } = await supabase
      .from('viagens')
      .select('*', { count: 'exact', head: true });

    console.log(`🚌 Viagens cadastradas: ${viagensCount || 0}`);
    if (viagensError) console.error('❌ Erro viagens:', viagensError.message);

    // 3. Verificar tabela viagem_passageiros
    const { count: passageirosCount, error: passageirosError } = await supabase
      .from('viagem_passageiros')
      .select('*', { count: 'exact', head: true });

    console.log(`🎫 Passageiros em viagens: ${passageirosCount || 0}`);
    if (passageirosError) console.error('❌ Erro passageiros:', passageirosError.message);

    // 4. Verificar tabela passeios
    const { count: passeiosCount, error: passeiosError } = await supabase
      .from('passeios')
      .select('*', { count: 'exact', head: true });

    console.log(`🎯 Passeios disponíveis: ${passeiosCount || 0}`);
    if (passeiosError) console.error('❌ Erro passeios:', passeiosError.message);

    // 5. Verificar tabela passageiro_passeios
    const { count: ppCount, error: ppError } = await supabase
      .from('passageiro_passeios')
      .select('*', { count: 'exact', head: true });

    console.log(`🎪 Passeios selecionados por passageiros: ${ppCount || 0}`);
    if (ppError) console.error('❌ Erro passageiro_passeios:', ppError.message);

    // 6. Se houver viagens, mostrar algumas
    if (viagensCount && viagensCount > 0) {
      const { data: viagensSample, error: viagensSampleError } = await supabase
        .from('viagens')
        .select('id, nome, data_viagem, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!viagensSampleError && viagensSample) {
        console.log('\n🚌 Últimas 5 viagens:');
        console.table(viagensSample);
      }
    }

    // 7. Se houver clientes, mostrar alguns
    if (clientesCount && clientesCount > 0) {
      const { data: clientesSample, error: clientesSampleError } = await supabase
        .from('clientes')
        .select('id, nome, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!clientesSampleError && clientesSample) {
        console.log('\n👥 Últimos 5 clientes:');
        console.table(clientesSample);
      }
    }

    // 8. Verificar se há passeios "mortos" (sem referências)
    if (passeiosCount && passeiosCount > 0 && ppCount === 0) {
      console.log('\n🚨 SITUAÇÃO DETECTADA:');
      console.log('✅ Existem passeios cadastrados na tabela "passeios"');
      console.log('❌ Não existem registros na tabela "passageiro_passeios"');
      console.log('💡 Isso significa que todos os passeios estão "mortos" (sem uso)');
      
      const { data: passeiosList, error: passeiosListError } = await supabase
        .from('passeios')
        .select('nome, valor, categoria, ativo')
        .order('categoria', { ascending: false })
        .order('valor', { ascending: false });

      if (!passeiosListError && passeiosList) {
        console.log('\n📋 Lista completa de passeios "mortos":');
        console.table(passeiosList);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkDatabaseStatus().catch(console.error);
