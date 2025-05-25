import { supabase } from "@/lib/supabase";
import { convertISOToBRDate, convertBRDateToISO, formatBrazilianDate } from "./dateUtils";

export async function fixExistingDates() {
  try {
    console.log("Iniciando correção das datas de nascimento com UTC-safe functions...");
    
    // Buscar todos os clientes com data de nascimento
    const { data: clientes, error: fetchError } = await supabase
      .from('clientes')
      .select('id, data_nascimento')
      .not('data_nascimento', 'is', null);
    
    if (fetchError) {
      throw fetchError;
    }
    
    if (!clientes || clientes.length === 0) {
      console.log("Nenhum cliente com data de nascimento encontrado.");
      return;
    }
    
    console.log(`Encontrados ${clientes.length} clientes com data de nascimento.`);
    
    let corrected = 0;
    let errors = 0;
    let skipped = 0;
    
    for (const cliente of clientes) {
      try {
        const { data_nascimento } = cliente;
        
        // Se já está no formato YYYY-MM-DD correto, pular
        if (data_nascimento.includes('-') && data_nascimento.length === 10) {
          skipped++;
          continue;
        }
        
        // Tentar converter usando as funções UTC-safe
        const brDate = convertISOToBRDate(data_nascimento);
        if (brDate !== 'Data inválida' && brDate !== 'Data não informada') {
          const newDateFormat = convertBRDateToISO(brDate);
          
          if (newDateFormat) {
            // Atualizar no banco
            const { error: updateError } = await supabase
              .from('clientes')
              .update({ data_nascimento: newDateFormat })
              .eq('id', cliente.id);
            
            if (updateError) {
              console.error(`Erro ao atualizar cliente ${cliente.id}:`, updateError);
              errors++;
            } else {
              console.log(`Cliente ${cliente.id}: ${data_nascimento} -> ${newDateFormat} (${brDate})`);
              corrected++;
            }
          } else {
            console.warn(`Não foi possível converter data para cliente ${cliente.id}: ${data_nascimento}`);
            errors++;
          }
        } else {
          console.warn(`Data inválida para cliente ${cliente.id}: ${data_nascimento}`);
          errors++;
        }
      } catch (error) {
        console.error(`Erro ao processar cliente ${cliente.id}:`, error);
        errors++;
      }
    }
    
    console.log(`Correção concluída: ${corrected} datas corrigidas, ${skipped} puladas (já corretas), ${errors} erros.`);
    return { corrected, errors, skipped };
    
  } catch (error) {
    console.error("Erro geral na correção das datas:", error);
    throw error;
  }
} 