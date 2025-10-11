/**
 * Interpreter Registry
 * 
 * Central registry for all contract interpreters
 * Routes transactions to the appropriate interpreter
 */

import type {
  TransactionContext,
  InterpretedTransaction,
  ContractInterpreter,
  InterpreterRegistry as IInterpreterRegistry,
} from './types';
import { PayerInterpreter } from './PayerInterpreter';
import { TreasuryInterpreter } from './TreasuryInterpreter';
import { AuctionHouseInterpreter } from './AuctionHouseInterpreter';
import { TokenInterpreter } from './TokenInterpreter';
import { StreamFactoryInterpreter } from './StreamFactoryInterpreter';
import { DescriptorInterpreter } from './DescriptorInterpreter';
import { TokenBuyerInterpreter } from './TokenBuyerInterpreter';
import { ClientRewardsInterpreter } from './ClientRewardsInterpreter';
import { DAOAdminInterpreter } from './DAOAdminInterpreter';
import { GenericInterpreter } from './GenericInterpreter';
import { NOUNS_CONTRACTS } from '@/app/lib/Nouns/Contracts/utils/addresses';

/**
 * Registry implementation
 */
export class InterpreterRegistry implements IInterpreterRegistry {
  private interpreters: Map<string, ContractInterpreter> = new Map();
  private fallbackInterpreter: GenericInterpreter;
  
  constructor() {
    // Register all Nouns contract interpreters
    this.register(new PayerInterpreter());
    this.register(new TreasuryInterpreter());
    this.register(new AuctionHouseInterpreter());
    this.register(new TokenInterpreter());
    this.register(new StreamFactoryInterpreter());
    this.register(new DescriptorInterpreter());
    this.register(new TokenBuyerInterpreter());
    this.register(new ClientRewardsInterpreter());
    this.register(new DAOAdminInterpreter());
    
    // Fallback for unknown contracts
    this.fallbackInterpreter = new GenericInterpreter('0x0', 'Unknown Contract');
  }
  
  register(interpreter: ContractInterpreter): void {
    const address = interpreter.contractAddress.toLowerCase();
    this.interpreters.set(address, interpreter);
  }
  
  getInterpreter(context: TransactionContext): ContractInterpreter {
    const targetAddress = context.target.toLowerCase();
    
    // Check registered interpreters
    const interpreter = this.interpreters.get(targetAddress);
    if (interpreter) {
      return interpreter;
    }
    
    // Check if it's a known Nouns contract without a dedicated interpreter
    const contractInfo = this.getContractInfo(targetAddress);
    if (contractInfo) {
      return new GenericInterpreter(
        context.target,
        contractInfo.name,
        null // No ABI for now - could add later
      );
    }
    
    // Return fallback for completely unknown contracts
    return new GenericInterpreter(context.target, 'External Contract', null);
  }
  
  interpret(context: TransactionContext): InterpretedTransaction {
    const interpreter = this.getInterpreter(context);
    return interpreter.interpret(context);
  }
  
  extractAddresses(context: TransactionContext): string[] {
    const interpreter = this.getInterpreter(context);
    return interpreter.extractAddresses(context);
  }
  
  /**
   * Get contract info from Nouns contracts registry
   */
  private getContractInfo(address: string): { name: string; description: string } | null {
    const lowerAddress = address.toLowerCase();
    
    for (const [key, config] of Object.entries(NOUNS_CONTRACTS)) {
      const contractAddress = ('proxy' in config ? config.proxy : config.address).toLowerCase();
      if (contractAddress === lowerAddress) {
        return {
          name: key.replace(/([A-Z])/g, ' $1').trim(),
          description: config.description,
        };
      }
    }
    
    return null;
  }
}

/**
 * Singleton instance
 */
export const interpreterRegistry = new InterpreterRegistry();

