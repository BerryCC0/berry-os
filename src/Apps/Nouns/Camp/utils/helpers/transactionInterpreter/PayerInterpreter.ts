/**
 * Payer Contract Interpreter
 * 
 * Interprets transactions for the Payer contract (USDC payments from treasury)
 * Address: 0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D
 */

import { BaseInterpreter } from './BaseInterpreter';
import { PayerABI } from '@/app/lib/Nouns/Contracts/abis/Payer';
import type { TransactionContext, InterpretedTransaction } from './types';

export class PayerInterpreter extends BaseInterpreter {
  readonly contractAddress = '0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D';
  readonly contractName = 'Payer';
  
  constructor() {
    super(PayerABI, 'Handles USDC payments from treasury');
  }
  
  interpret(context: TransactionContext): InterpretedTransaction {
    const functionName = this.extractFunctionName(context.signature);
    
    switch (functionName) {
      case 'sendOrRegisterDebt':
        return this.interpretSendOrRegisterDebt(context);
      
      case 'payBackDebt':
        return this.interpretPayBackDebt(context);
      
      case 'withdrawPaymentToken':
        return this.interpretWithdrawPaymentToken(context);
      
      case 'transferOwnership':
        return this.interpretTransferOwnership(context);
      
      case 'renounceOwnership':
        return this.interpretRenounceOwnership(context);
      
      default:
        return this.interpretGeneric(context, functionName);
    }
  }
  
  private interpretSendOrRegisterDebt(context: TransactionContext): InterpretedTransaction {
    const decoded = this.decodeParameters(context.signature, context.calldata);
    const fragment = this.interface.getFunction('sendOrRegisterDebt');
    
    const account = decoded[0] as string;
    const amount = decoded[1] as bigint;
    
    // Format amount as USDC (6 decimals)
    const formattedAmount = this.formatTokenAmount(amount, 6, 'USDC');
    
    // Format address for display (truncate middle)
    const displayAddress = `${account.substring(0, 6)}...${account.substring(38)}`;
    
    const parameters = this.buildParameters(decoded, fragment, 'sendOrRegisterDebt');
    
    // Enhance amount parameter with USDC formatting
    const amountParam = parameters.find(p => p.name === 'amount');
    if (amountParam) {
      amountParam.displayValue = `${amount.toLocaleString()} ($${(Number(amount) / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
      amountParam.format = 'amount';
      amountParam.decimals = 6;
      amountParam.symbol = 'USDC';
    }
    
    return this.createBaseInterpretation(
      context,
      'sendOrRegisterDebt',
      'Send USDC payment or register as debt if insufficient balance',
      parameters,
      `Send ${formattedAmount} to ${displayAddress}`,
      'payment',
      amount > BigInt(50000e6) ? 'elevated' : 'normal' // Flag payments over $50k
    );
  }
  
  private interpretPayBackDebt(context: TransactionContext): InterpretedTransaction {
    const decoded = this.decodeParameters(context.signature, context.calldata);
    const fragment = this.interface.getFunction('payBackDebt');
    
    const amount = decoded[0] as bigint;
    const formattedAmount = this.formatTokenAmount(amount, 6, 'USDC');
    
    const parameters = this.buildParameters(decoded, fragment, 'payBackDebt');
    
    // Enhance amount parameter
    const amountParam = parameters.find(p => p.name === 'amount');
    if (amountParam) {
      amountParam.displayValue = `${amount.toLocaleString()} ($${(Number(amount) / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
      amountParam.decimals = 6;
      amountParam.symbol = 'USDC';
    }
    
    return this.createBaseInterpretation(
      context,
      'payBackDebt',
      'Pay back debt from the debt queue',
      parameters,
      `Pay back ${formattedAmount} in debt`,
      'payment',
      'normal'
    );
  }
  
  private interpretWithdrawPaymentToken(context: TransactionContext): InterpretedTransaction {
    return this.createBaseInterpretation(
      context,
      'withdrawPaymentToken',
      'Withdraw all USDC from Payer contract',
      [],
      'Withdraw all USDC from Payer',
      'treasury',
      'elevated'
    );
  }
  
  private interpretTransferOwnership(context: TransactionContext): InterpretedTransaction {
    const decoded = this.decodeParameters(context.signature, context.calldata);
    const fragment = this.interface.getFunction('transferOwnership');
    
    const newOwner = decoded[0] as string;
    const parameters = this.buildParameters(decoded, fragment, 'transferOwnership');
    
    return this.createBaseInterpretation(
      context,
      'transferOwnership',
      'Transfer ownership of Payer contract',
      parameters,
      `Transfer Payer ownership to new address`,
      'ownership',
      'critical'
    );
  }
  
  private interpretRenounceOwnership(context: TransactionContext): InterpretedTransaction {
    return this.createBaseInterpretation(
      context,
      'renounceOwnership',
      'Permanently renounce ownership (cannot be reversed)',
      [],
      'Renounce Payer ownership permanently',
      'ownership',
      'critical'
    );
  }
  
  private interpretGeneric(context: TransactionContext, functionName: string): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface.getFunction(functionName);
      const parameters = this.buildParameters(decoded, fragment, functionName);
      
      return this.createBaseInterpretation(
        context,
        functionName,
        `Call ${functionName} on Payer contract`,
        parameters,
        `Execute ${functionName}`,
        'treasury',
        'normal'
      );
    } catch (error) {
      // Fallback if decoding fails
      return this.createBaseInterpretation(
        context,
        functionName || 'unknown',
        'Unknown Payer function',
        [],
        `Call function on Payer contract`,
        'unknown',
        'normal'
      );
    }
  }
}

