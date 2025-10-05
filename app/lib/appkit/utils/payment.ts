/**
 * Reown AppKit - Payment Business Logic
 * Pure functions for payment and exchange operations (no React dependencies)
 */

import type {
  PaymentOptions,
  ExchangeInfo,
  PaymentStatus,
  PaymentResult,
  ExchangeBuyStatus,
} from './types';

/**
 * Validate payment options
 */
export function validatePaymentOptions(options: PaymentOptions): {
  valid: boolean;
  error?: string;
} {
  if (!options.asset || options.asset.trim() === '') {
    return { valid: false, error: 'Asset is required' };
  }
  
  if (!options.amount || options.amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  
  if (!options.recipient || options.recipient.trim() === '') {
    return { valid: false, error: 'Recipient address is required' };
  }
  
  return { valid: true };
}

/**
 * Format payment amount for display
 */
export function formatPaymentAmount(amount: number, asset: string): string {
  return `${amount.toFixed(6)} ${asset}`;
}

/**
 * Calculate exchange fees
 */
export function calculateExchangeFees(
  amount: number,
  exchange: ExchangeInfo
): number {
  let totalFees = 0;
  
  if (exchange.fees) {
    // Fixed fee
    if (exchange.fees.fixed) {
      totalFees += exchange.fees.fixed;
    }
    
    // Percentage fee
    if (exchange.fees.percentage) {
      totalFees += (amount * exchange.fees.percentage) / 100;
    }
  }
  
  return totalFees;
}

/**
 * Calculate net amount after fees
 */
export function calculateNetAmount(
  amount: number,
  exchange: ExchangeInfo
): number {
  const fees = calculateExchangeFees(amount, exchange);
  return amount - fees;
}

/**
 * Check if amount meets exchange minimum
 */
export function meetsExchangeMinimum(
  amount: number,
  exchange: ExchangeInfo
): boolean {
  if (!exchange.minAmount) return true;
  return amount >= exchange.minAmount;
}

/**
 * Check if amount is within exchange maximum
 */
export function withinExchangeMaximum(
  amount: number,
  exchange: ExchangeInfo
): boolean {
  if (!exchange.maxAmount) return true;
  return amount <= exchange.maxAmount;
}

/**
 * Check if exchange supports asset
 */
export function exchangeSupportsAsset(
  exchange: ExchangeInfo,
  asset: string
): boolean {
  // This would require more exchange data
  // Placeholder implementation
  return exchange.supported;
}

/**
 * Get best exchange for amount
 */
export function getBestExchange(
  exchanges: ExchangeInfo[],
  amount: number,
  asset: string
): ExchangeInfo | null {
  const suitable = exchanges.filter(exchange => 
    exchange.supported &&
    meetsExchangeMinimum(amount, exchange) &&
    withinExchangeMaximum(amount, exchange)
  );
  
  if (suitable.length === 0) return null;
  
  // Sort by lowest fees
  return suitable.reduce((best, current) => {
    const bestFees = calculateExchangeFees(amount, best);
    const currentFees = calculateExchangeFees(amount, current);
    return currentFees < bestFees ? current : best;
  });
}

/**
 * Sort exchanges by fees (lowest first)
 */
export function sortExchangesByFees(
  exchanges: ExchangeInfo[],
  amount: number
): ExchangeInfo[] {
  return [...exchanges].sort((a, b) => {
    const aFees = calculateExchangeFees(amount, a);
    const bFees = calculateExchangeFees(amount, b);
    return aFees - bFees;
  });
}

/**
 * Filter exchanges by criteria
 */
export function filterExchanges(
  exchanges: ExchangeInfo[],
  options: {
    minAmount?: number;
    maxAmount?: number;
    supported?: boolean;
  }
): ExchangeInfo[] {
  return exchanges.filter(exchange => {
    if (options.supported !== undefined && exchange.supported !== options.supported) {
      return false;
    }
    
    if (options.minAmount && !meetsExchangeMinimum(options.minAmount, exchange)) {
      return false;
    }
    
    if (options.maxAmount && !withinExchangeMaximum(options.maxAmount, exchange)) {
      return false;
    }
    
    return true;
  });
}

/**
 * Format exchange name
 */
export function formatExchangeName(exchange: ExchangeInfo): string {
  return exchange.name.charAt(0).toUpperCase() + exchange.name.slice(1);
}

/**
 * Get exchange icon URL
 */
export function getExchangeIcon(exchange: ExchangeInfo): string {
  return exchange.iconUrl || '/icons/exchanges/default.svg';
}

/**
 * Check payment status completion
 */
export function isPaymentCompleted(status: PaymentStatus): boolean {
  return status === 'completed';
}

/**
 * Check payment status failure
 */
export function isPaymentFailed(status: PaymentStatus): boolean {
  return status === 'failed' || status === 'cancelled';
}

/**
 * Check payment status in progress
 */
export function isPaymentInProgress(status: PaymentStatus): boolean {
  return status === 'pending' || status === 'processing';
}

/**
 * Get payment status display text
 */
export function getPaymentStatusText(status: PaymentStatus): string {
  const statusText: Record<PaymentStatus, string> = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
  };
  
  return statusText[status] || status;
}

/**
 * Get payment status color
 */
export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors: Record<PaymentStatus, string> = {
    pending: 'orange',
    processing: 'blue',
    completed: 'green',
    failed: 'red',
    cancelled: 'gray',
  };
  
  return colors[status] || 'gray';
}

/**
 * Format payment result for display
 */
export function formatPaymentResult(result: PaymentResult): string {
  return `Payment ${result.status}: ${result.amount} ${result.asset}`;
}

/**
 * Get payment transaction URL
 */
export function getPaymentTransactionUrl(
  result: PaymentResult,
  explorerBaseUrl: string
): string | null {
  if (!result.transactionHash) return null;
  return `${explorerBaseUrl}/tx/${result.transactionHash}`;
}

/**
 * Estimate payment time
 */
export function estimatePaymentTime(exchange: ExchangeInfo): string {
  // This would depend on exchange data
  // Placeholder implementation
  return '2-5 minutes';
}

/**
 * Create payment result summary
 */
export function createPaymentSummary(result: PaymentResult): string {
  const status = getPaymentStatusText(result.status);
  const amount = result.amount ? `${result.amount} ${result.asset}` : 'Unknown';
  
  return `${status} - ${amount} via ${result.exchangeId}`;
}

/**
 * Validate exchange session ID
 */
export function isValidSessionId(sessionId: string): boolean {
  return typeof sessionId === 'string' && sessionId.length > 0;
}

/**
 * Build payment URL with parameters
 */
export function buildPaymentUrl(
  baseUrl: string,
  options: PaymentOptions
): string {
  const url = new URL(baseUrl);
  url.searchParams.set('asset', options.asset);
  url.searchParams.set('amount', options.amount.toString());
  url.searchParams.set('recipient', options.recipient);
  
  if (options.network) {
    url.searchParams.set('network', options.network);
  }
  
  if (options.memo) {
    url.searchParams.set('memo', options.memo);
  }
  
  return url.toString();
}

/**
 * Parse payment URL parameters
 */
export function parsePaymentUrl(url: string): Partial<PaymentOptions> | null {
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;
    
    const asset = params.get('asset');
    const amountStr = params.get('amount');
    const recipient = params.get('recipient');
    
    if (!asset || !amountStr || !recipient) return null;
    
    return {
      asset,
      amount: parseFloat(amountStr),
      recipient,
      network: params.get('network') || undefined,
      memo: params.get('memo') || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Check if exchange buy status needs polling
 */
export function shouldPollStatus(status: ExchangeBuyStatus): boolean {
  return isPaymentInProgress(status.status);
}

/**
 * Calculate polling interval based on status
 */
export function calculatePollingInterval(status: ExchangeBuyStatus): number {
  // More frequent polling for pending, less for processing
  if (status.status === 'pending') return 2000; // 2 seconds
  if (status.status === 'processing') return 5000; // 5 seconds
  
  return 10000; // 10 seconds for other states
}

/**
 * Format exchange buy status
 */
export function formatBuyStatus(status: ExchangeBuyStatus): string {
  const statusText = getPaymentStatusText(status.status);
  
  if (status.transactionHash) {
    return `${statusText} - TX: ${status.transactionHash.substring(0, 10)}...`;
  }
  
  if (status.error) {
    return `${statusText} - ${status.error}`;
  }
  
  return statusText;
}

/**
 * Get retry strategy for failed payments
 */
export function shouldRetryPayment(status: ExchangeBuyStatus): boolean {
  // Don't retry cancelled or completed payments
  if (status.status === 'cancelled' || status.status === 'completed') {
    return false;
  }
  
  // Retry failed payments
  return status.status === 'failed';
}

/**
 * Get exchange comparison data
 */
export function compareExchanges(
  exchange1: ExchangeInfo,
  exchange2: ExchangeInfo,
  amount: number
): {
  cheaper: ExchangeInfo;
  priceDifference: number;
  percentageDifference: number;
} {
  const fees1 = calculateExchangeFees(amount, exchange1);
  const fees2 = calculateExchangeFees(amount, exchange2);
  
  const cheaper = fees1 < fees2 ? exchange1 : exchange2;
  const priceDifference = Math.abs(fees1 - fees2);
  const percentageDifference = (priceDifference / Math.max(fees1, fees2)) * 100;
  
  return {
    cheaper,
    priceDifference,
    percentageDifference,
  };
}

