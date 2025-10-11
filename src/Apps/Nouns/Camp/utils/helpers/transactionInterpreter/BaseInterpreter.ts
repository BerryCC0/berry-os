/**
 * Base Contract Interpreter
 * 
 * Abstract base class for contract-specific transaction interpreters
 * Provides common utilities for ABI decoding and parameter processing
 */

import { Interface, type Result, type ParamType } from 'ethers';
import type {
  TransactionContext,
  InterpretedTransaction,
  InterpretedParameter,
  ContractInterpreter,
  TransactionCategory,
  TransactionSeverity,
} from './types';

export abstract class BaseInterpreter implements ContractInterpreter {
  abstract readonly contractAddress: string;
  abstract readonly contractName: string;
  
  protected readonly abi: any;
  protected readonly interface: Interface;
  protected readonly description: string;
  
  constructor(abi: any, description: string = '') {
    this.abi = abi;
    this.interface = new Interface(abi);
    this.description = description;
  }
  
  canHandle(context: TransactionContext): boolean {
    return context.target.toLowerCase() === this.contractAddress.toLowerCase();
  }
  
  abstract interpret(context: TransactionContext): InterpretedTransaction;
  
  /**
   * Extract all addresses from parameters
   */
  extractAddresses(context: TransactionContext): string[] {
    try {
      const functionName = this.extractFunctionName(context.signature);
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface.getFunction(context.signature || this.extractSelector(context.calldata));
      
      if (!fragment) return [];
      
      const addresses: string[] = [];
      
      fragment.inputs.forEach((input, idx) => {
        if (input.baseType === 'address' && decoded[idx]) {
          addresses.push(decoded[idx] as string);
        }
      });
      
      return addresses;
    } catch (error) {
      return [];
    }
  }
  
  /**
   * Decode function parameters using ABI
   */
  protected decodeParameters(signature: string, calldata: string): Result {
    try {
      const fragment = signature
        ? this.interface.getFunction(signature)
        : this.interface.getFunction(this.extractSelector(calldata));
      
      if (!fragment) {
        throw new Error('Function not found in ABI');
      }
      
      const normalizedCalldata = calldata.startsWith('0x') ? calldata : '0x' + calldata;
      const selector = fragment.selector;
      
      // Ensure calldata has the correct selector
      const dataToDecod = normalizedCalldata.toLowerCase().startsWith(selector.toLowerCase())
        ? normalizedCalldata
        : selector + normalizedCalldata.substring(2);
      
      return this.interface.decodeFunctionData(fragment, dataToDecod);
    } catch (error) {
      throw new Error(`Failed to decode parameters: ${error}`);
    }
  }
  
  /**
   * Extract function name from signature
   */
  protected extractFunctionName(signature: string): string {
    if (!signature) return '';
    const match = signature.match(/^([^(]+)\(/);
    return match ? match[1] : signature;
  }
  
  /**
   * Extract function selector from calldata
   */
  protected extractSelector(calldata: string): string {
    const normalized = calldata.startsWith('0x') ? calldata : '0x' + calldata;
    return normalized.substring(0, 10);
  }
  
  /**
   * Format ETH value
   */
  protected formatEthValue(value: string): string {
    if (!value || value === '0') return '0 ETH';
    
    try {
      const valueInWei = BigInt(value);
      const valueInEth = Number(valueInWei) / 1e18;
      
      if (valueInEth === 0) return '0 ETH';
      if (valueInEth < 0.0001) return `${valueInWei.toString()} wei`;
      if (valueInEth < 1) return `${valueInEth.toFixed(6)} ETH`;
      
      return `${valueInEth.toFixed(4)} ETH`;
    } catch {
      return `${value} wei`;
    }
  }
  
  /**
   * Format token amount with decimals
   */
  protected formatTokenAmount(amount: bigint, decimals: number, symbol: string): string {
    const value = Number(amount) / Math.pow(10, decimals);
    
    if (symbol === 'USDC') {
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    return `${value.toLocaleString()} ${symbol}`;
  }
  
  /**
   * Format display value based on parameter type
   */
  protected formatDisplayValue(value: any, type: ParamType): string {
    const baseType = type.baseType;
    
    if (baseType === 'address') {
      return value as string;
    }
    
    if (baseType === 'uint256' || baseType === 'int256') {
      const num = BigInt(value);
      return num.toLocaleString();
    }
    
    if (baseType === 'bool') {
      return value ? 'true' : 'false';
    }
    
    if (baseType === 'bytes' || baseType.startsWith('bytes')) {
      return value as string;
    }
    
    if (baseType === 'string') {
      return value as string;
    }
    
    if (type.isArray()) {
      const arr = value as any[];
      return `[${arr.map(v => this.formatDisplayValue(v, type.arrayChildren!)).join(', ')}]`;
    }
    
    return String(value);
  }
  
  /**
   * Check if parameter is a recipient address
   */
  protected isRecipientParam(functionName: string, paramName: string, paramType: string, index: number): boolean {
    const recipientNames = ['to', 'recipient', 'account', 'newOwner', 'delegatee', 'spender'];
    const recipientFunctions = ['transfer', 'send', 'sendEth', 'sendERC20', 'sendOrRegisterDebt'];
    
    if (recipientNames.includes(paramName)) return true;
    if (recipientFunctions.some(fn => functionName.toLowerCase().includes(fn.toLowerCase())) && paramType === 'address' && index === 0) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Get recipient role description
   */
  protected getRecipientRole(functionName: string, paramName: string): string {
    if (paramName === 'account' || paramName === 'recipient' || paramName === 'to') return 'Recipient';
    if (paramName === 'newOwner') return 'New Owner';
    if (paramName === 'delegatee') return 'Delegate';
    if (paramName === 'spender') return 'Approved Spender';
    if (functionName.includes('transfer')) return 'Transfer Recipient';
    if (functionName.includes('send')) return 'Payment Recipient';
    return 'Recipient';
  }
  
  /**
   * Build interpreted parameters
   */
  protected buildParameters(
    decoded: Result,
    fragment: any,
    functionName: string
  ): InterpretedParameter[] {
    return fragment.inputs.map((input: ParamType, idx: number) => {
      const value = decoded[idx];
      const isRecipient = this.isRecipientParam(functionName, input.name, input.baseType, idx);
      
      return {
        name: input.name || `param${idx}`,
        type: input.type,
        value,
        displayValue: this.formatDisplayValue(value, input),
        isRecipient,
        recipientRole: isRecipient ? this.getRecipientRole(functionName, input.name) : undefined,
        format: this.getDisplayFormat(input.baseType),
      };
    });
  }
  
  /**
   * Get display format hint for parameter type
   */
  protected getDisplayFormat(baseType: string): InterpretedParameter['format'] {
    if (baseType === 'address') return 'address';
    if (baseType === 'uint256' || baseType === 'int256') return 'amount';
    if (baseType === 'bool') return 'boolean';
    if (baseType === 'bytes' || baseType.startsWith('bytes')) return 'bytes';
    return 'text';
  }
  
  /**
   * Create base interpreted transaction
   */
  protected createBaseInterpretation(
    context: TransactionContext,
    functionName: string,
    functionDescription: string,
    parameters: InterpretedParameter[],
    summary: string,
    category: TransactionCategory,
    severity: TransactionSeverity = 'normal'
  ): InterpretedTransaction {
    const addressesToResolve = parameters
      .filter(p => p.isRecipient)
      .map(p => p.value as string);
    
    // Add target if it's an ETH transfer
    if (context.value && context.value !== '0' && !context.signature) {
      addressesToResolve.push(context.target);
    }
    
    return {
      target: context.target,
      contractName: this.contractName,
      contractDescription: this.description,
      isKnownContract: true,
      functionName,
      functionSignature: context.signature,
      functionDescription,
      value: context.value,
      valueFormatted: this.formatEthValue(context.value),
      parameters,
      calldata: context.calldata,
      summary,
      category,
      severity,
      addressesToResolve,
    };
  }
}

