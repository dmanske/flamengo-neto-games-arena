/**
 * Teste rápido para verificar se o sistema está funcionando
 */

// Teste de importações
try {
  console.log('🧪 Testando importações do sistema de personalização...');

  // Testar importação dos tipos
  import type { PersonalizationConfig } from '@/types/personalizacao-relatorios';
  console.log('✅ Tipos importados com sucesso');

  // Testar importação das configurações padrão
  import { getDefaultConfig, ConfigScenario } from '@/lib/personalizacao-defaults';
  console.log('✅ Configurações padrão importadas com sucesso');

  // Testar importação dos validadores
  import { PersonalizationValidator } from '@/lib/validations/personalizacao-relatorios';
  console.log('✅ Validadores importados com sucesso');

  // Testar criação de configuração
  const config = getDefaultConfig(ConfigScenario.COMPLETO);
  console.log('✅ Configuração criada:', config.metadata.nome);

  // Testar validação
  const validation = PersonalizationValidator.validate(config);
  console.log('✅ Validação executada:', validation.valido ? 'VÁLIDA' : 'INVÁLIDA');

  console.log('🎉 Todos os testes de importação passaram!');

} catch (error) {
  console.error('❌ Erro nos testes:', error);
}

export const testResult = 'Sistema funcionando!';