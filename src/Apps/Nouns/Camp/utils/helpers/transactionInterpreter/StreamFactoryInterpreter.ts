/**
 * Stream Factory Contract Interpreter
 * 
 * Interprets transactions for the Stream Factory (payment streams)
 * Address: 0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff
 */

import { BaseInterpreter } from './BaseInterpreter';
import { StreamFactoryABI } from '@/app/lib/Nouns/Contracts/abis/StreamFactory';
import type { TransactionContext, InterpretedTransaction } from './types';

export class StreamFactoryInterpreter extends BaseInterpreter {
  readonly contractAddress = '0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff';
  readonly contractName = 'Stream Factory';
  
  constructor() {
    super(StreamFactoryABI, 'Factory for creating payment streams');
  }
  
  interpret(context: TransactionContext): InterpretedTransaction {
    const functionName = this.extractFunctionName(context.signature);
    
    // createStream and createAndFundStream have multiple overloads
    if (functionName === 'createStream' || functionName === 'createAndFundStream') {
      return this.interpretCreateStream(context, functionName);
    }
    
    return this.interpretGeneric(context, functionName);
  }
  
  /**
   * Get parameter layout based on which createStream overload is being used
   * 
   * The 4 overloads are:
   * 1. (recipient, tokenAmount, tokenAddress, startTime, stopTime) - 5 params
   * 2. (recipient, tokenAmount, tokenAddress, startTime, stopTime, nonce, predictedStreamAddress) - 7 params
   * 3. (payer, recipient, tokenAmount, tokenAddress, startTime, stopTime, nonce) - 7 params
   * 4. (payer, recipient, tokenAmount, tokenAddress, startTime, stopTime, nonce, msgSender, predictedStreamAddress) - 9 params
   */
  private getCreateStreamParams(signature: string): {
    recipientIndex: number;
    tokenAmountIndex: number;
    tokenAddressIndex: number;
    startTimeIndex: number;
    stopTimeIndex: number;
  } {
    // Count parameters to determine overload
    const paramMatch = signature.match(/\((.*?)\)/);
    if (!paramMatch) return { recipientIndex: 0, tokenAmountIndex: 1, tokenAddressIndex: 2, startTimeIndex: 3, stopTimeIndex: 4 };
    
    const params = paramMatch[1].split(',').filter(p => p.trim());
    const paramCount = params.length;
    
    // Check if first param is address (check parameter type order)
    // If signature has pattern (address,uint256,address,...), first is recipient
    // If signature has pattern (address,address,uint256,address,...), first is payer, second is recipient
    const firstIsRecipient = params[1]?.trim().startsWith('uint');
    
    if (firstIsRecipient) {
      // Pattern: (recipient, tokenAmount, tokenAddress, ...)
      return {
        recipientIndex: 0,
        tokenAmountIndex: 1,
        tokenAddressIndex: 2,
        startTimeIndex: 3,
        stopTimeIndex: 4,
      };
    } else {
      // Pattern: (payer, recipient, tokenAmount, tokenAddress, ...)
      return {
        recipientIndex: 1,
        tokenAmountIndex: 2,
        tokenAddressIndex: 3,
        startTimeIndex: 4,
        stopTimeIndex: 5,
      };
    }
  }
  
  private interpretCreateStream(context: TransactionContext, functionName: string): InterpretedTransaction {
    try {
      // Try to decode - if it fails, fall back to generic
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction(context.signature);
      
      if (!fragment) {
        console.warn('[StreamFactory] No fragment found for signature:', context.signature);
        return this.interpretGeneric(context, functionName);
      }
      
      // Determine which overload based on signature and extract parameters at correct indices
      const layout = this.getCreateStreamParams(context.signature);
      
      const recipient = decoded[layout.recipientIndex] as string;
      const tokenAmount = decoded[layout.tokenAmountIndex] as bigint;
      const tokenAddress = decoded[layout.tokenAddressIndex] as string;
      const startTime = decoded[layout.startTimeIndex] as bigint;
      const stopTime = decoded[layout.stopTimeIndex] as bigint;
      
      // Build parameters with proper display
      const parameters = this.buildParameters(decoded, fragment, functionName);
      
      // Determine token symbol
      let tokenSymbol = 'tokens';
      let decimals = 18;
      if (tokenAddress.toLowerCase() === '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48') {
        tokenSymbol = 'USDC';
        decimals = 6;
        
        // Enhance amount parameter for USDC
        const amountParam = parameters.find(p => p.name === 'tokenAmount');
        if (amountParam) {
          amountParam.displayValue = this.formatTokenAmount(tokenAmount, decimals, tokenSymbol);
          amountParam.decimals = decimals;
          amountParam.symbol = tokenSymbol;
        }
      } else if (tokenAddress.toLowerCase() === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
        tokenSymbol = 'WETH';
      }
      
      // Format timestamps
      const startDate = new Date(Number(startTime) * 1000);
      const stopDate = new Date(Number(stopTime) * 1000);
      const durationDays = (Number(stopTime) - Number(startTime)) / 86400;
      
      const startParam = parameters.find(p => p.name === 'startTime');
      if (startParam) {
        startParam.displayValue = `${startDate.toLocaleDateString()}`;
      }
      
      const stopParam = parameters.find(p => p.name === 'stopTime');
      if (stopParam) {
        stopParam.displayValue = `${stopDate.toLocaleDateString()}`;
      }
      
      // Mark recipient parameter
      const recipientParam = parameters.find(p => p.name === 'recipient' || p.name === 'payer');
      if (recipientParam && recipientParam.type === 'address') {
        recipientParam.isRecipient = true;
        recipientParam.recipientRole = 'Stream Recipient';
      }
      
      // Format token address parameter
      const tokenParam = parameters.find(p => p.name === 'tokenAddress');
      if (tokenParam) {
        tokenParam.displayValue = tokenSymbol === 'tokens' ? tokenAddress : tokenSymbol;
      }
      
      // Mark predicted stream address as important for cross-referencing
      const predictedAddressParam = parameters.find(p => p.name === 'predictedStreamAddress');
      if (predictedAddressParam) {
        predictedAddressParam.isRecipient = true;
        predictedAddressParam.recipientRole = 'Stream Contract (for funding)';
      }
      
      const formattedAmount = this.formatTokenAmount(tokenAmount, decimals, ''); // Don't include symbol here
      const action = functionName === 'createAndFundStream' ? 'Create and fund' : 'Create';
      
      // Create truncated address for summary
      const displayRecipient = `${recipient.substring(0, 6)}...${recipient.substring(38)}`;
      
      // Calculate total amount per day/month for context
      const amountPerDay = Number(tokenAmount) / (decimals === 6 ? 1e6 : 1e18) / durationDays;
      const rateDescription = decimals === 6 
        ? `$${amountPerDay.toFixed(2)}/day`
        : `${amountPerDay.toFixed(4)} ${tokenSymbol}/day`;
      
      return this.createBaseInterpretation(
        context,
        functionName,
        `${action} ${formattedAmount} ${tokenSymbol} payment stream to recipient over ${durationDays.toFixed(0)} days (${rateDescription})`,
        parameters,
        `${action} ${formattedAmount} ${tokenSymbol} stream to ${displayRecipient} over ${durationDays.toFixed(0)} days`,
        'stream',
        'normal'
      );
    } catch (error) {
      console.error('[StreamFactory] Error interpreting createStream:', error);
      return this.interpretGeneric(context, functionName);
    }
  }
  
  private interpretGeneric(context: TransactionContext, functionName: string): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface.getFunction(functionName);
      const parameters = this.buildParameters(decoded, fragment, functionName);
      
      return this.createBaseInterpretation(
        context,
        functionName,
        `Call ${functionName} on Stream Factory`,
        parameters,
        `Execute ${functionName}`,
        'stream',
        'normal'
      );
    } catch (error) {
      return this.createBaseInterpretation(
        context,
        functionName || 'unknown',
        'Unknown Stream Factory function',
        [],
        'Call function on Stream Factory',
        'unknown',
        'normal'
      );
    }
  }
}

