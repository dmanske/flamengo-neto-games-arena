import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uroukakmvanyeqxicuzw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb3VrYWttdmFueWVxeGljdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MzMzOTYsImV4cCI6MjA2MjQwOTM5Nn0.fFRtqvpf7kwbJyAh5JHYjTU2zbEI9BvAjDp2rXikrO8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPasseiosObsoletos() {
  console.log('🔍 Verificando passeios inativos ou obsoletos...\n');

  try {
    // 1. Passeios marcados como inativos
    console.log('1️⃣ PASSEIOS INATIVOS:');
    const { data: passeiosInativos, error: error1 } = await supabase
      .from('passeios')
      .select('id, nome, valor, categoria, ativo, created_at')
      .eq('ativo', false)
      .order('created_at', { ascending: false });

    if (error1) {
      console.error('❌ Erro ao buscar passeios inativos:', error1);
    } else if (passeiosInativos && passeiosInativos.length > 0) {
      console.table(passeiosInativos);
    } else {
      console.log('✅ Nenhum passeio inativo encontrado.');
    }

    // 2. Passeios órfãos (referenciados mas não existem na tabela passeios)
    console.log('\n2️⃣ PASSEIOS ÓRFÃOS (referenciados mas não existem):');
    const { data: passeiosOrfaos, error: error2 } = await supabase
      .rpc('check_passeios_orfaos');

    if (error2) {
      // Se a função RPC não existir, vamos fazer manualmente
      console.log('⚠️ Função RPC não encontrada, verificando manualmente...');
      
      // Buscar todos os nomes de passeios referenciados
      const { data: passageiroPasseios, error: ppError } = await supabase
        .from('passageiro_passeios')
        .select('passeio_nome');

      if (!ppError && passageiroPasseios) {
        const nomesReferenciados = [...new Set(passageiroPasseios.map(p => p.passeio_nome))];
        
        // Buscar passeios existentes
        const { data: passeiosExistentes, error: peError } = await supabase
          .from('passeios')
          .select('nome');

        if (!peError && passeiosExistentes) {
          const nomesExistentes = passeiosExistentes.map(p => p.nome);
          const orfaos = nomesReferenciados.filter(nome => !nomesExistentes.includes(nome));
          
          if (orfaos.length > 0) {
            console.log('🚨 Passeios órfãos encontrados:');
            orfaos.forEach(nome => console.log(`  - ${nome}`));
          } else {
            console.log('✅ Nenhum passeio órfão encontrado.');
          }
        }
      }
    } else if (passeiosOrfaos && passeiosOrfaos.length > 0) {
      console.table(passeiosOrfaos);
    } else {
      console.log('✅ Nenhum passeio órfão encontrado.');
    }

    // 3. Passeios sem uso (existem mas nunca foram selecionados)
    console.log('\n3️⃣ PASSEIOS SEM USO:');
    const { data: passeiosSemUso, error: error3 } = await supabase
      .from('passeios')
      .select(`
        id, nome, valor, categoria, ativo, created_at,
        passageiro_passeios!left(id)
      `)
      .is('passageiro_passeios.id', null)
      .order('created_at', { ascending: false });

    if (error3) {
      console.error('❌ Erro ao buscar passeios sem uso:', error3);
    } else if (passeiosSemUso && passeiosSemUso.length > 0) {
      console.table(passeiosSemUso.map(p => ({
        id: p.id,
        nome: p.nome,
        valor: p.valor,
        categoria: p.categoria,
        ativo: p.ativo,
        created_at: p.created_at
      })));
    } else {
      console.log('✅ Todos os passeios cadastrados estão sendo utilizados.');
    }

    // 4. Passeios com status problemático
    console.log('\n4️⃣ PASSEIOS COM STATUS PROBLEMÁTICO:');
    const { data: statusProblematico, error: error4 } = await supabase
      .from('passageiro_passeios')
      .select('passeio_nome, status')
      .not('status', 'in', '("confirmado","Confirmado","ativo","Ativo")');

    if (error4) {
      console.error('❌ Erro ao buscar status problemático:', error4);
    } else if (statusProblematico && statusProblematico.length > 0) {
      // Agrupar por passeio e status
      const agrupados = statusProblematico.reduce((acc, item) => {
        const key = `${item.passeio_nome} - ${item.status}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      
      console.log('🚨 Status problemáticos encontrados:');
      Object.entries(agrupados).forEach(([key, count]) => {
        console.log(`  - ${key}: ${count} ocorrências`);
      });
    } else {
      console.log('✅ Todos os passeios têm status válidos.');
    }

    // 5. Resumo geral
    console.log('\n5️⃣ RESUMO GERAL:');
    
    const { data: totalPasseios, error: errorTotal } = await supabase
      .from('passeios')
      .select('ativo');

    const { data: totalReferencias, error: errorRef } = await supabase
      .from('passageiro_passeios')
      .select('passeio_nome');

    if (!errorTotal && !errorRef && totalPasseios && totalReferencias) {
      const ativos = totalPasseios.filter(p => p.ativo).length;
      const inativos = totalPasseios.filter(p => !p.ativo).length;
      const totalRefs = totalReferencias.length;
      const passeiosUnicos = new Set(totalReferencias.map(r => r.passeio_nome)).size;
      
      console.log(`📊 Total de passeios cadastrados: ${totalPasseios.length}`);
      console.log(`✅ Passeios ativos: ${ativos}`);
      console.log(`❌ Passeios inativos: ${inativos}`);
      console.log(`🎯 Passeios únicos utilizados: ${passeiosUnicos}`);
      console.log(`📈 Total de referências: ${totalRefs}`);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkPasseiosObsoletos().catch(console.error);