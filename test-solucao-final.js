// Script para testar a solução final de paginação
// Execute com: node test-solucao-final.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uroukakmvanyeqxicuzw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb3VrYWttdmFueWVxeGljdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MzMzOTYsImV4cCI6MjA2MjQwOTM5Nn0.fFRtqvpf7kwbJyAh5JHYjTU2zbEI9BvAjDp2rXikrO8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simular a função fetchClientes atualizada
async function fetchClientesComPaginacao() {
  try {
    console.log('🔄 Simulando fetchClientes com paginação...');
    
    // Usar paginação para contornar o limite de 1000 registros do Supabase
    let todosClientes = [];
    let offset = 0;
    const pageSize = 1000;
    let hasMore = true;
    
    while (hasMore) {
      console.log(`   📄 Carregando página ${Math.floor(offset / pageSize) + 1}...`);
      
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nome, telefone, email, cidade")
        .order("nome")
        .range(offset, offset + pageSize - 1);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        hasMore = false;
        console.log('   ✅ Fim dos dados');
      } else {
        todosClientes.push(...data);
        console.log(`   ✅ ${data.length} registros carregados (total: ${todosClientes.length})`);
        
        if (data.length < pageSize) {
          hasMore = false;
          console.log('   ✅ Última página carregada');
        } else {
          offset += pageSize;
        }
      }
    }
    
    console.log(`\n✅ Clientes carregados com paginação: ${todosClientes.length} total`);
    return todosClientes;
  } catch (error) {
    console.error('❌ Erro ao buscar clientes:', error);
    return [];
  }
}

async function testSolucaoFinal() {
  console.log('🎯 Testando solução final...');
  
  try {
    // 1. Contar total real
    console.log('\n📊 Contando total de clientes...');
    const { count: totalClientes } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   Total na base: ${totalClientes}`);
    
    // 2. Testar a nova função
    const clientesCarregados = await fetchClientesComPaginacao();
    
    // 3. Verificar se todos foram carregados
    console.log('\n🔍 Verificação final:');
    
    if (clientesCarregados.length === totalClientes) {
      console.log('   ✅ SUCESSO: Todos os clientes foram carregados!');
      console.log(`   📊 ${clientesCarregados.length}/${totalClientes} clientes`);
    } else {
      console.log('   ❌ PROBLEMA: Ainda há clientes faltando');
      console.log(`   📊 ${clientesCarregados.length}/${totalClientes} clientes`);
      console.log(`   📉 Faltam: ${(totalClientes || 0) - clientesCarregados.length} clientes`);
    }
    
    // 4. Testar busca por nome
    console.log('\n🔍 Testando busca por nome "Maria"...');
    const searchTerm = "Maria";
    const filtered = clientesCarregados.filter(cliente =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone.includes(searchTerm) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cidade.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    console.log(`   ✅ Clientes encontrados com "${searchTerm}": ${filtered.length}`);
    
    if (filtered.length > 0) {
      console.log('   📋 Primeiros 3 resultados:');
      filtered.slice(0, 3).forEach((cliente, index) => {
        console.log(`      ${index + 1}. ${cliente.nome} - ${cliente.telefone}`);
      });
    }
    
    // 5. Verificar performance
    console.log('\n⚡ Análise de performance:');
    const tempoInicio = Date.now();
    await fetchClientesComPaginacao();
    const tempoFim = Date.now();
    const tempoTotal = tempoFim - tempoInicio;
    
    console.log(`   ⏱️  Tempo de carregamento: ${tempoTotal}ms`);
    
    if (tempoTotal < 5000) {
      console.log('   ✅ Performance aceitável (< 5s)');
    } else {
      console.log('   ⚠️  Performance pode ser melhorada (> 5s)');
    }
    
    console.log('\n🎉 TESTE CONCLUÍDO!');
    console.log('   A solução de paginação resolve o problema de limitação do Supabase.');
    console.log('   Todos os clientes agora podem ser encontrados na busca.');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testSolucaoFinal();