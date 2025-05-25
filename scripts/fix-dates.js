// Script para corrigir datas existentes no banco de dados
// Execute com: node scripts/fix-dates.js

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase (substitua pelas suas)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para converter timestamp para YYYY-MM-DD
function convertToISODate(dateString) {
  if (!dateString) return null;
  
  try {
    // Se já está no formato YYYY-MM-DD, manter
    if (dateString.includes('-') && dateString.length === 10) {
      return dateString;
    }
    
    // Converter timestamp para YYYY-MM-DD
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao converter data:', error);
    return null;
  }
}

async function fixDatesInDatabase() {
  try {
    console.log('🔧 Iniciando correção das datas de nascimento...');
    
    // Buscar todos os clientes com data de nascimento
    const { data: clientes, error: fetchError } = await supabase
      .from('clientes')
      .select('id, data_nascimento, nome')
      .not('data_nascimento', 'is', null);
    
    if (fetchError) {
      throw fetchError;
    }
    
    if (!clientes || clientes.length === 0) {
      console.log('ℹ️  Nenhum cliente com data de nascimento encontrado.');
      return;
    }
    
    console.log(`📊 Encontrados ${clientes.length} clientes com data de nascimento.`);
    
    let corrected = 0;
    let errors = 0;
    let skipped = 0;
    
    for (const cliente of clientes) {
      try {
        const { id, data_nascimento, nome } = cliente;
        
        // Se já está no formato YYYY-MM-DD correto, pular
        if (data_nascimento.includes('-') && data_nascimento.length === 10) {
          skipped++;
          continue;
        }
        
        // Converter para o formato correto
        const newDateFormat = convertToISODate(data_nascimento);
        
        if (newDateFormat) {
          // Atualizar no banco
          const { error: updateError } = await supabase
            .from('clientes')
            .update({ data_nascimento: newDateFormat })
            .eq('id', id);
          
          if (updateError) {
            console.error(`❌ Erro ao atualizar cliente ${nome} (ID: ${id}):`, updateError);
            errors++;
          } else {
            console.log(`✅ Cliente ${nome}: ${data_nascimento} → ${newDateFormat}`);
            corrected++;
          }
        } else {
          console.warn(`⚠️  Data inválida para cliente ${nome} (ID: ${id}): ${data_nascimento}`);
          errors++;
        }
      } catch (error) {
        console.error(`❌ Erro ao processar cliente ${cliente.nome}:`, error);
        errors++;
      }
    }
    
    console.log('\n📈 RESULTADO DA CORREÇÃO:');
    console.log(`✅ Datas corrigidas: ${corrected}`);
    console.log(`⏭️  Já estavam corretas: ${skipped}`);
    console.log(`❌ Erros encontrados: ${errors}`);
    console.log(`📊 Total processado: ${clientes.length}`);
    
    if (corrected > 0) {
      console.log('\n🎉 Correção concluída com sucesso!');
    } else if (skipped === clientes.length) {
      console.log('\n✨ Todas as datas já estavam no formato correto!');
    }
    
    return { corrected, errors, skipped, total: clientes.length };
    
  } catch (error) {
    console.error('💥 Erro geral na correção das datas:', error);
    throw error;
  }
}

// Executar o script
if (import.meta.url === `file://${process.argv[1]}`) {
  fixDatesInDatabase()
    .then((result) => {
      console.log('\n🏁 Script finalizado.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na execução:', error);
      process.exit(1);
    });
}

export { fixDatesInDatabase }; 