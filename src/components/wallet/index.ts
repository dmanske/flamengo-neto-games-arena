// =====================================================
// BARREL EXPORTS PARA COMPONENTES DE WALLET
// =====================================================

// Componentes principais
export { default as WalletSaldoCard, WalletSaldoCompacto, WalletMetricas } from './WalletSaldoCard';
export { default as WalletDepositoModal, WalletDepositoButton } from './WalletDepositoModal';
export { default as WalletUsoModal, WalletUsoButton } from './WalletUsoModal';
export { default as WalletHistoricoAgrupado } from './WalletHistoricoAgrupado';
export { default as WalletRelatorios } from './WalletRelatorios';

// Hooks
export * from '../../hooks/useWallet';

// Tipos
export * from '../../types/wallet';

// Utilitários
export * from '../../utils/walletNotifications';