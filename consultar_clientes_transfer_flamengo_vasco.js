import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://gqjcnqphkzjaidlotdkx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxamNucXBoa3pqYWlkbG90ZGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MjU5NzEsImV4cCI6MjA1MTUwMTk3MX0.Ej7Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function consultarClientesTransferFlamengoVasco() {
    console.log('🔍 CONSULTANDO CLIENTES COM TRANSFER PARA JOGOS FLAMENGO x VASCO\n');
    
    try {
        // 1. Buscar viagens do Flamengo contra o Vasco
        console.log('📋 1. Buscando viagens Flamengo x Vasco...');
        const { data: viagensFlamengoVasco, error: errorViagens } = await supabase
            .from('viagens')
            .select('id, adversario, data_jogo, destino, local_jogo')
            .or('adversario.ilike.%vasco%,destino.ilike.%vasco%')
            .order('data_jogo', { ascending: false });
            
        if (errorViagens) {
            console.error('❌ Erro ao buscar viagens:', errorViagens);
            return;
        }
        
        if (!viagensFlamengoVasco || viagensFlamengoVasco.length === 0) {
            console.log('⚠️ Nenhuma viagem encontrada para Flamengo x Vasco');
            return;
        }
        
        console.log(`✅ Encontradas ${viagensFlamengoVasco.length} viagens Flamengo x Vasco:`);
        viagensFlamengoVasco.forEach(viagem => {
            console.log(`   - ${viagem.adversario} | ${new Date(viagem.data_jogo).toLocaleDateString('pt-BR')} | ID: ${viagem.id}`);
        });
        
        const viagemIds = viagensFlamengoVasco.map(v => v.id);
        
        // 2. Buscar passageiros dessas viagens
        console.log('\n👥 2. Buscando passageiros das viagens...');
        const { data: passageiros, error: errorPassageiros } = await supabase
            .from('viagem_passageiros')
            .select(`
                id,
                cliente_id,
                viagem_id,
                setor_maracana,
                status_pagamento,
                valor,
                forma_pagamento,
                cidade_embarque,
                gratuito,
                clientes!inner(
                    id,
                    nome,
                    telefone,
                    email
                ),
                viagens!inner(
                    id,
                    adversario,
                    data_jogo
                )
            `)
            .in('viagem_id', viagemIds)
            .order('clientes.nome');
            
        if (errorPassageiros) {
            console.error('❌ Erro ao buscar passageiros:', errorPassageiros);
            return;
        }
        
        if (!passageiros || passageiros.length === 0) {
            console.log('⚠️ Nenhum passageiro encontrado para as viagens Flamengo x Vasco');
            return;
        }
        
        // 3. Buscar passeios (transfers) dos passageiros
        console.log('\n🚌 3. Buscando transfers (passeios) dos passageiros...');
        const passageiroIds = passageiros.map(p => p.id);
        
        const { data: transfers, error: errorTransfers } = await supabase
            .from('passageiro_passeios')
            .select('*')
            .in('viagem_passageiro_id', passageiroIds)
            .ilike('passeio_nome', '%transfer%');
            
        if (errorTransfers) {
            console.error('❌ Erro ao buscar transfers:', errorTransfers);
            return;
        }
        
        // 4. Processar dados e gerar relatório
        console.log('\n📊 4. RELATÓRIO DE CLIENTES COM TRANSFER\n');
        
        // Agrupar por cliente
        const clientesComTransfer = new Map();
        
        passageiros.forEach(passageiro => {
            const clienteId = passageiro.clientes.id;
            const clienteNome = passageiro.clientes.nome;
            const viagemInfo = {
                id: passageiro.viagem_id,
                adversario: passageiro.viagens.adversario,
                data_jogo: passageiro.viagens.data_jogo,
                passageiro_id: passageiro.id,
                valor: passageiro.valor,
                forma_pagamento: passageiro.forma_pagamento,
                cidade_embarque: passageiro.cidade_embarque
            };
            
            if (!clientesComTransfer.has(clienteId)) {
                clientesComTransfer.set(clienteId, {
                    nome: clienteNome,
                    telefone: passageiro.clientes.telefone,
                    email: passageiro.clientes.email,
                    viagens: [],
                    transfers: []
                });
            }
            
            clientesComTransfer.get(clienteId).viagens.push(viagemInfo);
        });
        
        // Adicionar informações de transfers
        if (transfers && transfers.length > 0) {
            transfers.forEach(transfer => {
                const passageiro = passageiros.find(p => p.id === transfer.viagem_passageiro_id);
                if (passageiro) {
                    const clienteId = passageiro.clientes.id;
                    if (clientesComTransfer.has(clienteId)) {
                        clientesComTransfer.get(clienteId).transfers.push({
                            passeio_nome: transfer.passeio_nome,
                            valor_cobrado: transfer.valor_cobrado,
                            status: transfer.status,
                            viagem_adversario: passageiro.viagens.adversario,
                            viagem_data: passageiro.viagens.data_jogo
                        });
                    }
                }
            });
        }
        
        // 5. Exibir resultados
        console.log('═'.repeat(80));
        console.log('📋 RESUMO GERAL');
        console.log('═'.repeat(80));
        console.log(`Total de viagens Flamengo x Vasco: ${viagensFlamengoVasco.length}`);
        console.log(`Total de passageiros: ${passageiros.length}`);
        console.log(`Total de clientes únicos: ${clientesComTransfer.size}`);
        console.log(`Total de transfers encontrados: ${transfers ? transfers.length : 0}`);
        
        console.log('\n' + '═'.repeat(80));
        console.log('👥 CLIENTES QUE PARTICIPARAM DE JOGOS FLAMENGO x VASCO');
        console.log('═'.repeat(80));
        
        let clientesComTransferCount = 0;
        let clientesComMultiplasViagens = 0;
        
        for (const [clienteId, cliente] of clientesComTransfer) {
            console.log(`\n🧑‍💼 ${cliente.nome}`);
            console.log(`   📞 ${cliente.telefone || 'N/A'} | 📧 ${cliente.email || 'N/A'}`);
            
            if (cliente.viagens.length > 1) {
                clientesComMultiplasViagens++;
                console.log(`   🔥 CLIENTE FIEL: ${cliente.viagens.length} viagens para jogos contra o Vasco!`);
            }
            
            console.log(`   🚌 Viagens (${cliente.viagens.length}):`);
            cliente.viagens.forEach((viagem, index) => {
                const dataFormatada = new Date(viagem.data_jogo).toLocaleDateString('pt-BR');
                console.log(`      ${index + 1}. ${viagem.adversario} - ${dataFormatada}`);
                console.log(`         💰 R$ ${viagem.valor} | 💳 ${viagem.forma_pagamento} | 🏙️ ${viagem.cidade_embarque}`);
            });
            
            if (cliente.transfers.length > 0) {
                clientesComTransferCount++;
                console.log(`   🚐 Transfers (${cliente.transfers.length}):`);
                cliente.transfers.forEach((transfer, index) => {
                    const dataFormatada = new Date(transfer.viagem_data).toLocaleDateString('pt-BR');
                    console.log(`      ${index + 1}. ${transfer.passeio_nome}`);
                    console.log(`         💰 R$ ${transfer.valor_cobrado} | ✅ ${transfer.status}`);
                    console.log(`         🎯 Jogo: ${transfer.viagem_adversario} - ${dataFormatada}`);
                });
            } else {
                console.log(`   ⚠️ Nenhum transfer encontrado`);
            }
        }
        
        // 6. Estatísticas finais
        console.log('\n' + '═'.repeat(80));
        console.log('📊 ESTATÍSTICAS FINAIS');
        console.log('═'.repeat(80));
        console.log(`👥 Total de clientes únicos: ${clientesComTransfer.size}`);
        console.log(`🚐 Clientes com transfer: ${clientesComTransferCount}`);
        console.log(`🔥 Clientes fiéis (múltiplas viagens): ${clientesComMultiplasViagens}`);
        console.log(`📈 Taxa de transfer: ${clientesComTransfer.size > 0 ? ((clientesComTransferCount / clientesComTransfer.size) * 100).toFixed(1) : 0}%`);
        
        if (clientesComTransferCount === 0) {
            console.log('\n⚠️ ATENÇÃO: Nenhum cliente com transfer encontrado!');
            console.log('   Possíveis motivos:');
            console.log('   - Transfers não estão cadastrados como passeios');
            console.log('   - Nome do passeio não contém "transfer"');
            console.log('   - Dados ainda não foram migrados para o sistema');
        }
        
        // 7. Buscar todos os tipos de passeios para análise
        console.log('\n' + '═'.repeat(80));
        console.log('🔍 ANÁLISE DE PASSEIOS DISPONÍVEIS');
        console.log('═'.repeat(80));
        
        if (passageiroIds.length > 0) {
            const { data: todosPasseios, error: errorTodosPasseios } = await supabase
                .from('passageiro_passeios')
                .select('passeio_nome')
                .in('viagem_passageiro_id', passageiroIds);
                
            if (!errorTodosPasseios && todosPasseios) {
                const passeiosUnicos = [...new Set(todosPasseios.map(p => p.passeio_nome))];
                console.log('Tipos de passeios encontrados:');
                passeiosUnicos.forEach(passeio => {
                    const isTransfer = passeio.toLowerCase().includes('transfer');
                    console.log(`   ${isTransfer ? '🚐' : '📦'} ${passeio}`);
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

// Executar a consulta
consultarClientesTransferFlamengoVasco();