// Script de debug para verificar valores dos passeios
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugPasseios() {
  console.log('🔍 Verificando dados dos passeios...\n');

  // 1. Verificar tabela passeios
  console.log('1️⃣ Dados na tabela passeios:');
  const { data: passeios, error: passeiosError } = await supabase
    .from('passeios')
    .select('*')
    .in('nome', ['Aquário', 'Pão de Açúcar']);

  if (passeiosError) {
    console.error('❌ Erro ao buscar passeios:', passeiosError);
  } else {
    console.table(passeios);
  }

  // 2. Verificar passageiro_passeios para Daniel
  console.log('\n2️⃣ Passeios do Daniel:');
  const { data: passageiroPasseios, error: ppError } = await supabase
    .from('passageiro_passeios')
    .select(`
      id,
      viagem_passageiro_id,
      passeio_nome,
      valor_cobrado,
      viagem_passageiros!inner(
        clientes!inner(nome)
      )
    `)
    .eq('viagem_passageiros.clientes.nome', 'Daniel Silva');

  if (ppError) {
    console.error('❌ Erro ao buscar passeios do Daniel:', ppError);
  } else {
    console.table(passageiroPasseios);
  }

  // 3. Verificar se Daniel existe
  console.log('\n3️⃣ Verificando se Daniel existe:');
  const { data: daniel, error: danielError } = await supabase
    .from('clientes')
    .select('*')
    .eq('nome', 'Daniel Silva');

  if (danielError) {
    console.error('❌ Erro ao buscar Daniel:', danielError);
  } else {
    console.table(daniel);
  }
}

debugPasseios().catch(console.error);