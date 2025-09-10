// Script para debugar o problema de busca de clientes
// Execute com: node debug-clientes-busca.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uroukakmvanyeqxicuzw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb3VrYWttdmFueWVxeGljdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MzMzOTYsImV4cCI6MjA2MjQwOTM5Nn0.fFRtqvpf7kwbJyAh5JHYjTU2zbEI9BvAjDp2rXikrO8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugClientesBusca() {
  console.log('🔍 Iniciando debug da busca de clientes...');
  
  try {
    // 1. Contar total de clientes
    console.log('\n📊 Contando total de clientes...');
    const { count: totalClientes, error: countError } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao contar clientes:', countError);
      return;
    }
    
    console.log(`✅ Total de clientes na base: ${totalClientes}`);
    
    // 2. Buscar clientes sem limite (como no componente)
    console.log('\n🔍 Buscando clientes sem limite...');
    const { data: clientesSemLimite, error: errorSemLimite } = await supabase
      .from('clientes')
      .select('id, nome, telefone, email, cidade')
      .order('nome');
    
    if (errorSemLimite) {
      console.error('❌ Erro ao buscar clientes sem limite:', errorSemLimite);
      return;
    }
    
    console.log(`✅ Clientes retornados sem limite: ${clientesSemLimite?.length || 0}`);
    
    // 3. Buscar clientes com limite de 1000
    console.log('\n🔍 Buscando clientes com limite de 1000...');
    const { data: clientesComLimite, error: errorComLimite } = await supabase
      .from('clientes')
      .select('id, nome, telefone, email, cidade')
      .order('nome')
      .limit(1000);
    
    if (errorComLimite) {
      console.error('❌ Erro ao buscar clientes com limite:', errorComLimite);
      return;
    }
    
    console.log(`✅ Clientes retornados com limite 1000: ${clientesComLimite?.length || 0}`);
    
    // 4. Verificar se há diferença
    const diferencaResultados = (clientesSemLimite?.length || 0) !== (clientesComLimite?.length || 0);
    
    if (diferencaResultados) {
      console.log('\n⚠️  PROBLEMA DETECTADO: Há diferença entre os resultados!');
      console.log(`   - Sem limite: ${clientesSemLimite?.length || 0}`);
      console.log(`   - Com limite 1000: ${clientesComLimite?.length || 0}`);
      console.log('   - Isso indica que o Supabase pode ter um limite padrão.');
    } else {
      console.log('\n✅ Resultados consistentes entre as consultas.');
    }
    
    // 5. Buscar um cliente específico por nome (se fornecido)
    const nomeClienteTeste = process.argv[2];
    if (nomeClienteTeste) {
      console.log(`\n🔍 Buscando cliente específico: "${nomeClienteTeste}"...`);
      
      const { data: clienteEspecifico, error: errorEspecifico } = await supabase
        .from('clientes')
        .select('id, nome, telefone, email, cidade')
        .ilike('nome', `%${nomeClienteTeste}%`)
        .order('nome');
      
      if (errorEspecifico) {
        console.error('❌ Erro ao buscar cliente específico:', errorEspecifico);
        return;
      }
      
      console.log(`✅ Clientes encontrados com nome "${nomeClienteTeste}": ${clienteEspecifico?.length || 0}`);
      
      if (clienteEspecifico && clienteEspecifico.length > 0) {
        console.log('📋 Primeiros resultados:');
        clienteEspecifico.slice(0, 3).forEach((cliente, index) => {
          console.log(`   ${index + 1}. ${cliente.nome} - ${cliente.telefone || 'Sem telefone'}`);
        });
      }
    }
    
    // 6. Verificar configurações de RLS (Row Level Security)
    console.log('\n🔒 Verificando se há políticas RLS ativas...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies_for_table', { table_name: 'clientes' })
      .catch(() => ({ data: null, error: 'RPC não disponível' }));
    
    if (policies && policies.length > 0) {
      console.log('⚠️  Políticas RLS encontradas - podem estar afetando os resultados');
    } else {
      console.log('✅ Nenhuma política RLS detectada ou RPC não disponível');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

console.log('🚀 Debug da busca de clientes');
console.log('Usage: node debug-clientes-busca.js [nome_cliente_para_testar]');
console.log('Exemplo: node debug-clientes-busca.js "Maria Silva"');
console.log('=' .repeat(50));

debugClientesBusca();