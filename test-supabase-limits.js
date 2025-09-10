// Script para testar limitações do Supabase
// Execute com: node test-supabase-limits.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uroukakmvanyeqxicuzw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb3VrYWttdmFueWVxeGljdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MzMzOTYsImV4cCI6MjA2MjQwOTM5Nn0.fFRtqvpf7kwbJyAh5JHYjTU2zbEI9BvAjDp2rXikrO8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseLimits() {
  console.log('🔬 Testando limitações do Supabase...');
  
  try {
    // 1. Testar diferentes limites
    console.log('\n📊 Teste 1: Diferentes valores de limite');
    
    const limites = [100, 500, 1000, 1001, 1500, 2000, 5000, 10000];
    
    for (const limite of limites) {
      const { data, error } = await supabase
        .from('clientes')
        .select('id')
        .limit(limite);
      
      if (error) {
        console.log(`   Limite ${limite}: ❌ Erro - ${error.message}`);
      } else {
        console.log(`   Limite ${limite}: ✅ ${data?.length || 0} registros`);
      }
    }
    
    // 2. Testar sem limite explícito
    console.log('\n📊 Teste 2: Sem limite explícito');
    const { data: semLimite, error: errorSemLimite } = await supabase
      .from('clientes')
      .select('id');
    
    if (errorSemLimite) {
      console.log(`   ❌ Erro: ${errorSemLimite.message}`);
    } else {
      console.log(`   ✅ ${semLimite?.length || 0} registros sem limite`);
    }
    
    // 3. Testar paginação
    console.log('\n📊 Teste 3: Paginação para contornar limite');
    
    let todosClientes = [];
    let offset = 0;
    const pageSize = 1000;
    let hasMore = true;
    
    while (hasMore) {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
        .order('nome')
        .range(offset, offset + pageSize - 1);
      
      if (error) {
        console.log(`   ❌ Erro na página ${Math.floor(offset / pageSize) + 1}: ${error.message}`);
        break;
      }
      
      if (!data || data.length === 0) {
        hasMore = false;
      } else {
        todosClientes.push(...data);
        console.log(`   📄 Página ${Math.floor(offset / pageSize) + 1}: ${data.length} registros (total: ${todosClientes.length})`);
        
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          offset += pageSize;
        }
      }
    }
    
    console.log(`   ✅ Total com paginação: ${todosClientes.length} registros`);
    
    // 4. Verificar se há políticas RLS
    console.log('\n🔒 Teste 4: Verificar configurações da tabela');
    
    try {
      // Tentar uma query que pode revelar informações sobre RLS
      const { data: tableInfo, error: tableError } = await supabase
        .from('clientes')
        .select('id')
        .limit(1);
      
      if (tableError) {
        console.log(`   ❌ Erro de acesso: ${tableError.message}`);
        if (tableError.message.includes('RLS') || tableError.message.includes('policy')) {
          console.log('   🔍 Possível problema de RLS detectado');
        }
      } else {
        console.log('   ✅ Acesso à tabela funcionando');
      }
    } catch (error) {
      console.log(`   ❌ Erro geral: ${error.message}`);
    }
    
    // 5. Testar com diferentes ordenações
    console.log('\n📊 Teste 5: Diferentes ordenações');
    
    const ordenacoes = [
      { campo: 'nome', desc: 'por nome' },
      { campo: 'created_at', desc: 'por data de criação' },
      { campo: 'id', desc: 'por ID' }
    ];
    
    for (const ord of ordenacoes) {
      const { data, error } = await supabase
        .from('clientes')
        .select('id')
        .order(ord.campo)
        .limit(2000);
      
      if (error) {
        console.log(`   Ordenação ${ord.desc}: ❌ Erro - ${error.message}`);
      } else {
        console.log(`   Ordenação ${ord.desc}: ✅ ${data?.length || 0} registros`);
      }
    }
    
    // 6. Resumo e recomendações
    console.log('\n📋 RESUMO E RECOMENDAÇÕES:');
    
    if (todosClientes.length > 1000) {
      console.log('   ✅ SOLUÇÃO ENCONTRADA: Usar paginação com range()');
      console.log(`   📈 Paginação carregou ${todosClientes.length} registros vs 1000 com limit()`);
      console.log('   💡 Implementar paginação nos componentes React');
    } else {
      console.log('   ❌ Problema persiste mesmo com paginação');
      console.log('   🔍 Investigar políticas RLS ou configurações do projeto');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testSupabaseLimits();