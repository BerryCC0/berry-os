/**
 * BalanceCard Component
 * Displays wallet balance with enhanced formatting and token icons
 * Supports EVM, Solana, and Bitcoin chains
 */

'use client';

import styles from './BalanceCard.module.css';

type ChainType = 'evm' | 'solana' | 'bitcoin';

interface BalanceCardProps {
  balance?: string;
  symbol?: string;
  decimals?: number;
  isLoading?: boolean;
  chainType: ChainType | null;
}

export default function BalanceCard({ balance, symbol, decimals, isLoading, chainType }: BalanceCardProps) {
  // Format balance for display with smart decimals
  const formatBalance = (bal?: string, sym?: string): string => {
    if (!bal) return '0.00';
    
    const num = parseFloat(bal);
    
    // Handle very small balances
    if (num < 0.0001 && num > 0) return '< 0.0001';
    
    // Handle zero
    if (num === 0) return '0.00';
    
    // Stablecoins: 2 decimals
    const stablecoins = ['USDC', 'USDT', 'DAI', 'BUSD', 'FRAX'];
    if (sym && stablecoins.includes(sym.toUpperCase())) {
      return num.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      });
    }
    
    // Other tokens: 2-4 decimals based on size
    if (num >= 1000) {
      return num.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      });
    }
    
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 4 
    });
  };

  // Determine default symbol based on chain type
  const getDefaultSymbol = (): string => {
    if (symbol) return symbol;
    
    if (chainType === 'solana') return 'SOL';
    if (chainType === 'bitcoin') return 'BTC';
    return 'ETH'; // EVM default
  };

  const displaySymbol = getDefaultSymbol();

  return (
    <div className={styles.balanceCard}>
      <div className={styles.label}>Balance</div>
      
      {isLoading ? (
        <div className={styles.balanceDisplay}>
          <div className={styles.loadingSkeleton}>
            <div className={styles.skeletonIcon} />
            <div className={styles.skeletonValue} />
          </div>
        </div>
      ) : (
        <div className={styles.balanceDisplay}>
          <div className={styles.amount}>
            <img src={getTokenIcon(displaySymbol)} alt={displaySymbol} className={styles.symbol} />
            <span className={styles.value}>{formatBalance(balance, displaySymbol)}</span>
            <span className={styles.unit}>{displaySymbol}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Get SVG icon path for token symbol
function getTokenIcon(symbol?: string): string {
  switch (symbol?.toUpperCase()) {
    case 'ETH':
    case 'WETH':
      return '/icons/tokens/eth.svg';
    case 'BTC':
    case 'WBTC':
      return '/icons/tokens/btc.svg';
    case 'SOL':
      return '/icons/tokens/sol.svg';
    case 'USDC':
      return '/icons/tokens/usdc.svg';
    case 'USDT':
      return '/icons/tokens/usdt.svg';
    case 'BNB':
      return '/icons/tokens/bnb.svg';
    default:
      return '/icons/tokens/generic.svg';
  }
}

