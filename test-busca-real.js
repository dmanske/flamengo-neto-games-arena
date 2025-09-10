// Script para testar a busca exatamente como é feita nos componentes React
// Execute com: node test-busca-real.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uroukakmvanyeqxicuzw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb3VrYWttdmFueWVxeGljdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MzMzOTYsImV4cCI6MjA2MjQwOTM5Nn0.fFRtqvpf7kwbJyAh5JHYjTU2zbEI9BvAjDp2rXikrO8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testBuscaReal() {
  console.log('🧪 Testando busca exatamente como nos componentes React...');
  
  try {
    // 1. Simular a função fetchClientes do ClienteSearchWithSuggestions
    console.log('\n📋 Teste 1: ClienteSearchWithSuggestions.fetchClientes()');
    
    // Primeiro, contar o total de clientes para definir um limite adequado
    const { count: totalClientes } = await supabase
      .from("clientes")
      .select("*", { count: 'exact', head: true });
    
    console.log(`   Total de clientes: ${totalClientes}`);
    
    // Definir um limite seguro (total + margem de segurança)
    const limite = Math.max((totalClientes || 0) + 100, 2000);
    console.log(`   Limite calculado: ${limite}`);
    
    const { data, error } = await supabase
      .from("clientes")
      .select("id, nome, telefone, email, cidade")
      .order("nome")
      .limit(limite);

    if (error) throw error;
    
    console.log(`   ✅ Clientes carregados: ${data?.length || 0} de ${totalClientes || 0} total`);
    
    // 2. Testar busca por nome específico (como no componente)
    console.log('\n🔍 Teste 2: Busca por nome "Maria"');
    
    const searchTerm = "Maria";
    const filtered = data.filter(cliente =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone.includes(searchTerm) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cidade.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    console.log(`   ✅ Clientes filtrados com "${searchTerm}": ${filtered.length}`);
    
    if (filtered.length > 0) {
      console.log('   📋 Primeiros 3 resultados:');
      filtered.slice(0, 3).forEach((cliente, index) => {
        console.log(`      ${index + 1}. ${cliente.nome} - ${cliente.telefone}`);
      });
    }
    
    // 3. Testar busca vazia (mostrar todos)
    console.log('\n📋 Teste 3: Busca vazia (mostrar todos)');
    const emptySearchTerm = "";
    const allClientes = emptySearchTerm.trim() === "" ? data : [];
    console.log(`   ✅ Clientes disponíveis com busca vazia: ${allClientes.length}`);
    
    // 4. Verificar se há clientes "perdidos"
    console.log('\n⚠️  Análise de Problemas:');
    const clientesPerdidos = (totalClientes || 0) - (data?.length || 0);
    
    if (clientesPerdidos > 0) {
      console.log(`   ❌ PROBLEMA: ${clientesPerdidos} clientes não estão sendo carregados!`);
      console.log(`   📊 Total na base: ${totalClientes}`);
      console.log(`   📊 Carregados: ${data?.length || 0}`);
      console.log(`   📊 Limite usado: ${limite}`);
      
      // Verificar se o limite está sendo respeitado
      if ((data?.length || 0) === 1000) {
        console.log('   🔍 Suspeita: Supabase pode ter limite padrão de 1000 registros');
        console.log('   💡 Solução: Aumentar o limite explicitamente');
      }
    } else {
      console.log(`   ✅ Todos os clientes estão sendo carregados corretamente`);
    }
    
    // 5. Testar com limite muito alto
    console.log('\n🚀 Teste 4: Forçar limite muito alto (5000)');
    const { data: dataAltoLimite, error: errorAltoLimite } = await supabase
      .from("clientes")
      .select("id, nome, telefone, email, cidade")
      .order("nome")
      .limit(5000);

    if (errorAltoLimite) {
      console.log(`   ❌ Erro com limite alto: ${errorAltoLimite.message}`);
    } else {
      console.log(`   ✅ Com limite 5000: ${dataAltoLimite?.length || 0} clientes carregados`);
      
      if ((dataAltoLimite?.length || 0) > (data?.length || 0)) {
        console.log(`   🎯 SOLUÇÃO ENCONTRADA: Limite alto carregou mais clientes!`);
        console.log(`   📈 Diferença: +${(dataAltoLimite?.length || 0) - (data?.length || 0)} clientes`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testBuscaReal();