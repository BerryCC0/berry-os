/**
 * BalanceCard Component
 * Displays wallet balance and USD value
 */

'use client';

import styles from './BalanceCard.module.css';

interface BalanceCardProps {
  balance?: string;
  symbol?: string;
  decimals?: number;
}

export default function BalanceCard({ balance, symbol, decimals }: BalanceCardProps) {
  // Format balance for display
  const formatBalance = (bal?: string) => {
    if (!bal) return '0.0000';
    const num = parseFloat(bal);
    return num.toFixed(4);
  };

  return (
    <div className={styles.balanceCard}>
      <div className={styles.label}>Balance</div>
      
      <div className={styles.balanceDisplay}>
        <div className={styles.amount}>
          <span className={styles.symbol}>{getSymbolIcon(symbol)}</span>
          <span className={styles.value}>{formatBalance(balance)}</span>
          <span className={styles.unit}>{symbol || 'ETH'}</span>
        </div>
        
        {/* USD value placeholder - would need price feed integration */}
        {/* <div className={styles.usdValue}>$0.00 USD</div> */}
      </div>
    </div>
  );
}

// Get icon for token symbol
function getSymbolIcon(symbol?: string): string {
  switch (symbol?.toUpperCase()) {
    case 'ETH':
      return '🔷';
    case 'BTC':
      return '₿';
    case 'SOL':
      return '◎';
    case 'USDC':
    case 'USDT':
      return '💵';
    default:
      return '🪙';
  }
}

