/**
 * Token Buyer Contract Interpreter
 * 
 * Interprets transactions for the Token Buyer contract (ETH → USDC conversion)
 * Address: 0x4f2acdc74f6941390d9b1804fabc3e780388cfe5
 */

import { BaseInterpreter } from './BaseInterpreter';
import { TokenBuyerABI } from '@/app/lib/Nouns/Contracts/abis/TokenBuyer';
import type { TransactionContext, InterpretedTransaction } from './types';

export class TokenBuyerInterpreter extends BaseInterpreter {
  readonly contractAddress = '0x4f2acdc74f6941390d9b1804fabc3e780388cfe5';
  readonly contractName = 'Token Buyer';
  
  constructor() {
    super(TokenBuyerABI, 'Converts ETH to USDC for payments');
  }
  
  interpret(context: TransactionContext): InterpretedTransaction {
    const functionName = this.extractFunctionName(context.signature);
    
    switch (functionName) {
      case 'buyETH':
        return this.interpretBuyETH(context);
      
      case 'pause':
        return this.interpretPause(context);
      
      case 'unpause':
        return this.interpretUnpause(context);
      
      case 'setAdmin':
      case 'setBaselinePaymentTokenAmount':
      case 'setBotDiscountBPs':
      case 'setMaxAdminBaselinePaymentTokenAmount':
      case 'setMaxAdminBotDiscountBPs':
      case 'setMinAdminBaselinePaymentTokenAmount':
      case 'setMinAdminBotBPs':
        return this.interpretSetterFunction(context, functionName);
      
      case 'setPayer':
        return this.interpretSetPayer(context);
      
      case 'setPriceFeed':
        return this.interpretSetPriceFeed(context);
      
      case 'withdrawETH':
        return this.interpretWithdrawETH(context);
      
      case 'transferOwnership':
        return this.interpretTransferOwnership(context);
      
      case 'renounceOwnership':
        return this.interpretRenounceOwnership(context);
      
      default:
        return this.interpretGeneric(context, functionName);
    }
  }
  
  private interpretBuyETH(context: TransactionContext): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction(context.signature);
      
      // buyETH has 2 overloads: (uint256) and (uint256, bool)
      const tokenAmount = decoded[0] as bigint;
      const formattedAmount = this.formatTokenAmount(tokenAmount, 6, 'USDC');
      
      const parameters = this.buildParameters(decoded, fragment, 'buyETH');
      
      // Enhance amount parameter
      const amountParam = parameters.find(p => p.name === 'tokenAmount' || p.name === 'paymentAmount');
      if (amountParam) {
        amountParam.displayValue = formattedAmount;
        amountParam.decimals = 6;
        amountParam.symbol = 'USDC';
      }
      
      return this.createBaseInterpretation(
        context,
        'buyETH',
        'Buy ETH with USDC from treasury',
        parameters,
        `Buy ETH with ${formattedAmount}`,
        'treasury',
        tokenAmount > BigInt(100000e6) ? 'elevated' : 'normal'
      );
    } catch (error) {
      return this.interpretGeneric(context, 'buyETH');
    }
  }
  
  private interpretPause(context: TransactionContext): InterpretedTransaction {
    return this.createBaseInterpretation(
      context,
      'pause',
      'Pause Token Buyer operations',
      [],
      'Pause Token Buyer',
      'governance',
      'elevated'
    );
  }
  
  private interpretUnpause(context: TransactionContext): InterpretedTransaction {
    return this.createBaseInterpretation(
      context,
      'unpause',
      'Resume Token Buyer operations',
      [],
      'Unpause Token Buyer',
      'governance',
      'normal'
    );
  }
  
  private interpretSetterFunction(context: TransactionContext, functionName: string): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction(functionName);
      const parameters = this.buildParameters(decoded, fragment, functionName);
      
      // Create human-readable description
      const friendlyName = functionName
        .replace(/^set/, '')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .toLowerCase();
      
      let summary = `Update ${friendlyName}`;
      let category: 'governance' | 'configuration' = 'configuration';
      
      // Special handling for specific setters
      if (functionName.includes('Admin')) {
        category = 'governance';
        summary = `Set ${friendlyName}`;
      }
      
      if (functionName.includes('BPs')) {
        // Basis points - convert to percentage
        const bpsParam = parameters.find(p => p.name.toLowerCase().includes('bp'));
        if (bpsParam && typeof bpsParam.value === 'bigint') {
          const percentage = Number(bpsParam.value) / 100;
          bpsParam.displayValue = `${percentage}%`;
        }
      }
      
      return this.createBaseInterpretation(
        context,
        functionName,
        `Update Token Buyer ${friendlyName} setting`,
        parameters,
        summary,
        category,
        category === 'governance' ? 'elevated' : 'normal'
      );
    } catch (error) {
      return this.interpretGeneric(context, functionName);
    }
  }
  
  private interpretSetPayer(context: TransactionContext): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction('setPayer');
      const payer = decoded[0] as string;
      
      const parameters = this.buildParameters(decoded, fragment, 'setPayer');
      
      const displayAddress = `${payer.substring(0, 6)}...${payer.substring(38)}`;
      
      return this.createBaseInterpretation(
        context,
        'setPayer',
        'Set Payer contract address',
        parameters,
        `Set Payer to ${displayAddress}`,
        'configuration',
        'elevated'
      );
    } catch (error) {
      return this.interpretGeneric(context, 'setPayer');
    }
  }
  
  private interpretSetPriceFeed(context: TransactionContext): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction('setPriceFeed');
      const priceFeed = decoded[0] as string;
      
      const parameters = this.buildParameters(decoded, fragment, 'setPriceFeed');
      
      const displayAddress = `${priceFeed.substring(0, 6)}...${priceFeed.substring(38)}`;
      
      return this.createBaseInterpretation(
        context,
        'setPriceFeed',
        'Set price feed oracle address',
        parameters,
        `Set price feed to ${displayAddress}`,
        'configuration',
        'elevated'
      );
    } catch (error) {
      return this.interpretGeneric(context, 'setPriceFeed');
    }
  }
  
  private interpretWithdrawETH(context: TransactionContext): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction('withdrawETH');
      
      const to = decoded[0] as string;
      const amount = decoded[1] as bigint;
      const formattedAmount = this.formatEthValue(amount.toString());
      
      const parameters = this.buildParameters(decoded, fragment, 'withdrawETH');
      
      const displayAddress = `${to.substring(0, 6)}...${to.substring(38)}`;
      
      return this.createBaseInterpretation(
        context,
        'withdrawETH',
        'Withdraw ETH from Token Buyer',
        parameters,
        `Withdraw ${formattedAmount} to ${displayAddress}`,
        'treasury',
        amount > BigInt(10e18) ? 'elevated' : 'normal'
      );
    } catch (error) {
      return this.interpretGeneric(context, 'withdrawETH');
    }
  }
  
  private interpretTransferOwnership(context: TransactionContext): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction('transferOwnership');
      const newOwner = decoded[0] as string;
      
      const parameters = this.buildParameters(decoded, fragment, 'transferOwnership');
      
      const displayAddress = `${newOwner.substring(0, 6)}...${newOwner.substring(38)}`;
      
      return this.createBaseInterpretation(
        context,
        'transferOwnership',
        'Transfer Token Buyer ownership',
        parameters,
        `Transfer ownership to ${displayAddress}`,
        'governance',
        'critical'
      );
    } catch (error) {
      return this.interpretGeneric(context, 'transferOwnership');
    }
  }
  
  private interpretRenounceOwnership(context: TransactionContext): InterpretedTransaction {
    return this.createBaseInterpretation(
      context,
      'renounceOwnership',
      'Permanently renounce Token Buyer ownership',
      [],
      'Renounce ownership',
      'governance',
      'critical'
    );
  }
  
  private interpretGeneric(context: TransactionContext, functionName: string): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction(functionName);
      const parameters = this.buildParameters(decoded, fragment, functionName);
      
      return this.createBaseInterpretation(
        context,
        functionName,
        `Call ${functionName} on Token Buyer`,
        parameters,
        `Execute ${functionName}`,
        'configuration',
        'normal'
      );
    } catch (error) {
      return this.createBaseInterpretation(
        context,
        functionName || 'unknown',
        'Unknown Token Buyer function',
        [],
        'Call function on Token Buyer',
        'unknown',
        'normal'
      );
    }
  }
}

