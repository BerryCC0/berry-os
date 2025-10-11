/**
 * Transaction Interpreter Types
 * 
 * Core types for interpreting governance proposal transactions into human-readable format
 * with rich context for display
 */

/**
 * Raw transaction data from proposal
 */
export interface TransactionContext {
  target: string;
  value: string;
  signature: string;
  calldata: string;
}

/**
 * Enriched parameter with display hints
 */
export interface InterpretedParameter {
  name: string;
  type: string; // Solidity type (address, uint256, etc.)
  value: any; // Raw decoded value
  displayValue: string; // Formatted for display
  
  // Recipient identification
  isRecipient: boolean;
  recipientRole?: string; // "Payment Recipient", "Delegate", "New Owner", etc.
  
  // Display formatting hints
  format: 'address' | 'amount' | 'percentage' | 'duration' | 'text' | 'boolean' | 'bytes';
  decimals?: number; // For amounts (6 for USDC, 18 for ETH)
  symbol?: string; // Token symbol (USDC, ETH, NOUN)
  unit?: string; // For non-token amounts (blocks, seconds, bps)
}

/**
 * Fully interpreted transaction ready for display
 */
export interface InterpretedTransaction {
  // Contract info
  target: string;
  contractName: string;
  contractDescription: string;
  isKnownContract: boolean;
  
  // Function info
  functionName: string;
  functionSignature: string;
  functionDescription: string; // Human-readable explanation
  
  // Transaction value
  value: string;
  valueFormatted: string;
  
  // Parameters
  parameters: InterpretedParameter[];
  calldata: string;
  
  // Summary for display
  summary: string; // One-line description: "Send $10,000 USDC to vitalik.eth"
  category: TransactionCategory;
  severity: TransactionSeverity;
  
  // All addresses that need ENS resolution
  addressesToResolve: string[];
}

/**
 * Transaction categories for grouping and iconography
 */
export type TransactionCategory =
  | 'payment'         // USDC payments, ETH transfers
  | 'stream'          // Payment streams
  | 'treasury'        // Treasury management (admin, delays)
  | 'governance'      // DAO settings, upgrades
  | 'auction'         // Auction house configuration
  | 'token'           // Token operations (admin functions only, not delegation)
  | 'art'             // Descriptor, artwork
  | 'rewards'         // Client rewards
  | 'ownership'       // Ownership transfers
  | 'upgrade'         // Contract upgrades
  | 'configuration'   // Generic config changes
  | 'unknown';        // Unrecognized

/**
 * Severity for UI styling
 */
export type TransactionSeverity =
  | 'normal'          // Regular operations
  | 'elevated'        // Important changes (large payments, config changes)
  | 'critical';       // High-risk operations (ownership, upgrades, renounce)

/**
 * Contract interpreter interface
 */
export interface ContractInterpreter {
  /**
   * Contract address this interpreter handles
   */
  readonly contractAddress: string;
  
  /**
   * Contract name
   */
  readonly contractName: string;
  
  /**
   * Check if this interpreter can handle the transaction
   */
  canHandle(context: TransactionContext): boolean;
  
  /**
   * Interpret the transaction
   */
  interpret(context: TransactionContext): InterpretedTransaction;
  
  /**
   * Extract all addresses that need ENS resolution
   */
  extractAddresses(context: TransactionContext): string[];
}

/**
 * Registry for all contract interpreters
 */
export interface InterpreterRegistry {
  /**
   * Register a contract interpreter
   */
  register(interpreter: ContractInterpreter): void;
  
  /**
   * Get interpreter for a transaction
   */
  getInterpreter(context: TransactionContext): ContractInterpreter;
  
  /**
   * Interpret a transaction
   */
  interpret(context: TransactionContext): InterpretedTransaction;
  
  /**
   * Extract all addresses from a transaction
   */
  extractAddresses(context: TransactionContext): string[];
}

