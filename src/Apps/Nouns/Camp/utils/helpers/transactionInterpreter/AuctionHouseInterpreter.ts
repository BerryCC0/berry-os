/**
 * Auction House Contract Interpreter
 * 
 * Interprets transactions for the Nouns Auction House
 * Address: 0x830BD73E4184ceF73443C15111a1DF14e495C706
 */

import { BaseInterpreter } from './BaseInterpreter';
import { NounsAuctionHouseABI } from '@/app/lib/Nouns/Contracts/abis/NounsAuctionHouse';
import type { TransactionContext, InterpretedTransaction } from './types';

export class AuctionHouseInterpreter extends BaseInterpreter {
  readonly contractAddress = '0x830BD73E4184ceF73443C15111a1DF14e495C706';
  readonly contractName = 'Auction House';
  
  constructor() {
    super(NounsAuctionHouseABI, 'Daily auction house for Nouns');
  }
  
  interpret(context: TransactionContext): InterpretedTransaction {
    const functionName = this.extractFunctionName(context.signature);
    
    switch (functionName) {
      case 'pause':
        return this.interpretPause(context);
      
      case 'unpause':
        return this.interpretUnpause(context);
      
      case 'setReservePrice':
        return this.interpretSetReservePrice(context);
      
      case 'setMinBidIncrementPercentage':
        return this.interpretSetMinBidIncrementPercentage(context);
      
      case 'setTimeBuffer':
        return this.interpretSetTimeBuffer(context);
      
      case 'setPrices':
        return this.interpretSetPrices(context);
      
      case 'setSanctionsOracle':
        return this.interpretSetSanctionsOracle(context);
      
      case 'transferOwnership':
        return this.interpretTransferOwnership(context);
      
      case 'renounceOwnership':
        return this.interpretRenounceOwnership(context);
      
      case 'initialize':
        return this.interpretInitialize(context);
      
      default:
        return this.interpretGeneric(context, functionName);
    }
  }
  
  private interpretPause(context: TransactionContext): InterpretedTransaction {
    return this.createBaseInterpretation(
      context,
      'pause',
      'Pause all auction activity (emergency only)',
      [],
      'Pause Auction House',
      'auction',
      'critical'
    );
  }
  
  private interpretUnpause(context: TransactionContext): InterpretedTransaction {
    return this.createBaseInterpretation(
      context,
      'unpause',
      'Resume auction activity after pause',
      [],
      'Unpause Auction House',
      'auction',
      'elevated'
    );
  }
  
  private interpretSetReservePrice(context: TransactionContext): InterpretedTransaction {
    const decoded = this.decodeParameters(context.signature, context.calldata);
    const fragment = this.interface.getFunction('setReservePrice');
    
    const reservePrice = decoded[0] as bigint;
    const formattedPrice = this.formatTokenAmount(reservePrice, 18, 'ETH');
    
    const parameters = this.buildParameters(decoded, fragment, 'setReservePrice');
    
    // Enhance price parameter
    const priceParam = parameters.find(p => p.name === '_reservePrice');
    if (priceParam) {
      priceParam.displayValue = formattedPrice;
      priceParam.decimals = 18;
      priceParam.symbol = 'ETH';
    }
    
    return this.createBaseInterpretation(
      context,
      'setReservePrice',
      'Set minimum price for auction bids',
      parameters,
      `Set auction reserve price to ${formattedPrice}`,
      'configuration',
      'elevated'
    );
  }
  
  private interpretSetMinBidIncrementPercentage(context: TransactionContext): InterpretedTransaction {
    const decoded = this.decodeParameters(context.signature, context.calldata);
    const fragment = this.interface.getFunction('setMinBidIncrementPercentage');
    
    const percentage = Number(decoded[0]);
    const parameters = this.buildParameters(decoded, fragment, 'setMinBidIncrementPercentage');
    
    // Enhance percentage parameter
    const percentParam = parameters.find(p => p.name === '_minBidIncrementPercentage');
    if (percentParam) {
      percentParam.displayValue = `${percentage}%`;
    }
    
    return this.createBaseInterpretation(
      context,
      'setMinBidIncrementPercentage',
      'Set minimum bid increment percentage',
      parameters,
      `Set min bid increment to ${percentage}%`,
      'configuration',
      'normal'
    );
  }
  
  private interpretSetTimeBuffer(context: TransactionContext): InterpretedTransaction {
    const decoded = this.decodeParameters(context.signature, context.calldata);
    const fragment = this.interface.getFunction('setTimeBuffer');
    
    const timeBuffer = decoded[0] as bigint;
    const seconds = Number(timeBuffer);
    const minutes = seconds / 60;
    
    const parameters = this.buildParameters(decoded, fragment, 'setTimeBuffer');
    
    // Enhance time parameter
    const timeParam = parameters.find(p => p.name === '_timeBuffer');
    if (timeParam) {
      timeParam.displayValue = `${seconds} seconds (${minutes} minutes)`;
    }
    
    return this.createBaseInterpretation(
      context,
      'setTimeBuffer',
      'Set auction extension time when bid placed near end',
      parameters,
      `Set auction time buffer to ${minutes} minutes`,
      'configuration',
      'normal'
    );
  }
  
  private interpretSetPrices(context: TransactionContext): InterpretedTransaction {
    const decoded = this.decodeParameters(context.signature, context.calldata);
    const fragment = this.interface.getFunction('setPrices');
    
    const settlements = decoded[0] as any[];
    const parameters = this.buildParameters(decoded, fragment, 'setPrices');
    
    return this.createBaseInterpretation(
      context,
      'setPrices',
      'Backfill historical auction settlement prices',
      parameters,
      `Set ${settlements.length} historical auction prices`,
      'configuration',
      'normal'
    );
  }
  
  private interpretSetSanctionsOracle(context: TransactionContext): InterpretedTransaction {
    const decoded = this.decodeParameters(context.signature, context.calldata);
    const fragment = this.interface.getFunction('setSanctionsOracle');
    
    const newOracle = decoded[0] as string;
    const parameters = this.buildParameters(decoded, fragment, 'setSanctionsOracle');
    
    return this.createBaseInterpretation(
      context,
      'setSanctionsOracle',
      'Update sanctions list oracle for compliance',
      parameters,
      'Update sanctions oracle address',
      'configuration',
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
      'Transfer ownership of Auction House',
      parameters,
      'Transfer Auction House ownership',
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
      'Renounce Auction House ownership permanently',
      'ownership',
      'critical'
    );
  }
  
  private interpretInitialize(context: TransactionContext): InterpretedTransaction {
    const decoded = this.decodeParameters(context.signature, context.calldata);
    const fragment = this.interface.getFunction('initialize');
    
    const parameters = this.buildParameters(decoded, fragment, 'initialize');
    
    // Enhance reserve price parameter
    const reservePriceParam = parameters.find(p => p.name === '_reservePrice');
    if (reservePriceParam && typeof reservePriceParam.value === 'bigint') {
      reservePriceParam.displayValue = this.formatTokenAmount(reservePriceParam.value, 18, 'ETH');
      reservePriceParam.decimals = 18;
      reservePriceParam.symbol = 'ETH';
    }
    
    // Enhance time buffer parameter
    const timeBufferParam = parameters.find(p => p.name === '_timeBuffer');
    if (timeBufferParam) {
      const seconds = Number(timeBufferParam.value);
      timeBufferParam.displayValue = `${seconds} seconds (${seconds / 60} minutes)`;
    }
    
    // Enhance percentage parameter
    const percentParam = parameters.find(p => p.name === '_minBidIncrementPercentage');
    if (percentParam) {
      percentParam.displayValue = `${percentParam.value}%`;
    }
    
    return this.createBaseInterpretation(
      context,
      'initialize',
      'Initialize Auction House (one-time setup)',
      parameters,
      'Initialize Auction House contract',
      'configuration',
      'elevated'
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
        `Call ${functionName} on Auction House`,
        parameters,
        `Execute ${functionName}`,
        'auction',
        'normal'
      );
    } catch (error) {
      return this.createBaseInterpretation(
        context,
        functionName || 'unknown',
        'Unknown Auction House function',
        [],
        'Call function on Auction House',
        'unknown',
        'normal'
      );
    }
  }
}

