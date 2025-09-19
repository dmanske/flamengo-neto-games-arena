/**
 * Arquivo de teste para verificar se todas as importações estão funcionando
 * Este arquivo pode ser removido após a verificação
 */

import {
  PersonalizationConfig,
  ConfigScenario,
  getDefaultConfig,
  PersonalizationValidator,
  PersonalizationSanitizer,
  exportConfig,
  importConfig,
  cloneConfig,
  mergeConfigs
} from './index';

// Teste básico de funcionalidade
export function testPersonalizationSystem(): boolean {
  try {
    // Testar criação de configuração padrão
    const config = getDefaultConfig(ConfigScenario.COMPLETO);
    console.log('✅ Configuração padrão criada:', config.metadata.nome);

    // Testar validação
    const validation = PersonalizationValidator.validate(config);
    console.log('✅ Validação executada:', validation.valido ? 'Válida' : 'Inválida');

    // Testar sanitização
    const sanitized = PersonalizationSanitizer.sanitize(config);
    console.log('✅ Sanitização executada');

    // Testar clonagem
    const cloned = cloneConfig(config);
    console.log('✅ Clonagem executada');

    // Testar exportação
    const exported = exportConfig(config);
    console.log('✅ Exportação executada, tamanho:', exported.length, 'caracteres');

    // Testar importação
    const imported = importConfig(exported);
    console.log('✅ Importação executada:', imported.metadata.nome);

    // Testar merge
    const merged = mergeConfigs(config, {
      metadata: { ...config.metadata, nome: 'Configuração Mesclada' }
    });
    console.log('✅ Merge executado:', merged.metadata.nome);

    console.log('🎉 Todos os testes passaram!');
    return true;
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
    return false;
  }
}

// Executar teste se este arquivo for importado
if (typeof window !== 'undefined') {
  console.log('🧪 Testando sistema de personalização...');
  testPersonalizationSystem();
}