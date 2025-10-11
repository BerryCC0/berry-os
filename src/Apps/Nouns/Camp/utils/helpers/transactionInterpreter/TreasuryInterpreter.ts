/**
 * Treasury (Timelock) Contract Interpreter
 * 
 * Interprets transactions for the Treasury/Timelock contract
 * Address: 0xb1a32FC9F9D8b2cf86C068Cae13108809547ef71
 */

import { BaseInterpreter } from './BaseInterpreter';
import { TreasuryTimelockABI } from '@/app/lib/Nouns/Contracts/abis/TreasuryTimelock';
import type { TransactionContext, InterpretedTransaction } from './types';

export class TreasuryInterpreter extends BaseInterpreter {
  readonly contractAddress = '0xb1a32FC9F9D8b2cf86C068Cae13108809547ef71';
  readonly contractName = 'Treasury';
  
  constructor() {
    super(TreasuryTimelockABI, 'Main treasury (Executor/Timelock)');
  }
  
  interpret(context: TransactionContext): InterpretedTransaction {
    const functionName = this.extractFunctionName(context.signature);
    
    switch (functionName) {
      case 'sendETH':
        return this.interpretSendETH(context);
      
      case 'sendERC20':
        return this.interpretSendERC20(context);
      
      case 'acceptAdmin':
        return this.interpretAcceptAdmin(context);
      
      case 'setPendingAdmin':
        return this.interpretSetPendingAdmin(context);
      
      case 'setDelay':
        return this.interpretSetDelay(context);
      
      case 'upgradeTo':
        return this.interpretUpgradeTo(context);
      
      case 'upgradeToAndCall':
        return this.interpretUpgradeToAndCall(context);
      
      case 'initialize':
        return this.interpretInitialize(context);
      
      default:
        return this.interpretGeneric(context, functionName);
    }
  }
  
  private interpretSendETH(context: TransactionContext): InterpretedTransaction {
    const decoded = this.decodeParameters(context.signature, context.calldata);
    const fragment = this.interface.getFunction('sendETH');
    
    const recipient = decoded[0] as string;
    const ethToSend = decoded[1] as bigint;
    
    const formattedAmount = this.formatEthValue(ethToSend.toString());
    const parameters = this.buildParameters(decoded, fragment, 'sendETH');
    
    // Enhance ETH amount parameter
    const amountParam = parameters.find(p => p.name === 'ethToSend');
    if (amountParam) {
      amountParam.decimals = 18;
      amountParam.symbol = 'ETH';
    }
    
    return this.createBaseInterpretation(
      context,
      'sendETH',
      'Send ETH from treasury',
      parameters,
      `Transfer ${formattedAmount} from treasury to recipient`,
      'payment',
      ethToSend > BigInt(10e18) ? 'elevated' : 'normal' // Flag transfers over 10 ETH
    );
  }
  
  private interpretSendERC20(context: TransactionContext): InterpretedTransaction {
    const decoded = this.decodeParameters(context.signature, context.calldata);
    const fragment = this.interface.getFunction('sendERC20');
    
    const recipient = decoded[0] as string;
    const erc20Token = decoded[1] as string;
    const tokensToSend = decoded[2] as bigint;
    
    const parameters = this.buildParameters(decoded, fragment, 'sendERC20');
    
    // Determine token symbol
    let tokenSymbol = 'tokens';
    if (erc20Token.toLowerCase() === '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48') {
      tokenSymbol = 'USDC';
      // Enhance amount parameter for USDC
      const amountParam = parameters.find(p => p.name === 'tokensToSend');
      if (amountParam) {
        amountParam.displayValue = `${tokensToSend.toLocaleString()} ($${(Number(tokensToSend) / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
        amountParam.decimals = 6;
        amountParam.symbol = 'USDC';
      }
    } else if (erc20Token.toLowerCase() === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
      tokenSymbol = 'WETH';
      const amountParam = parameters.find(p => p.name === 'tokensToSend');
      if (amountParam) {
        amountParam.decimals = 18;
        amountParam.symbol = 'WETH';
      }
    }
    
    return this.createBaseInterpretation(
      context,
      'sendERC20',
      'Send ERC-20 tokens from treasury',
      parameters,
      `Transfer ${tokenSymbol} from treasury to recipient`,
      'payment',
      'normal'
    );
  }
  
  private interpretAcceptAdmin(context: TransactionContext): InterpretedTransaction {
    return this.createBaseInterpretation(
      context,
      'acceptAdmin',
      'Accept treasury admin role (must be pending admin)',
      [],
      'Accept treasury admin role',
      'ownership',
      'critical'
    );
  }
  
  private interpretSetPendingAdmin(context: TransactionContext): InterpretedTransaction {
    const decoded = this.decodeParameters(context.signature, context.calldata);
    const fragment = this.interface.getFunction('setPendingAdmin');
    
    const newPendingAdmin = decoded[0] as string;
    const parameters = this.buildParameters(decoded, fragment, 'setPendingAdmin');
    
    return this.createBaseInterpretation(
      context,
      'setPendingAdmin',
      'Set pending admin for treasury (2-step ownership transfer)',
      parameters,
      'Set new pending admin for treasury',
      'ownership',
      'critical'
    );
  }
  
  private interpretSetDelay(context: TransactionContext): InterpretedTransaction {
    const decoded = this.decodeParameters(context.signature, context.calldata);
    const fragment = this.interface.getFunction('setDelay');
    
    const delay = decoded[0] as bigint;
    const delayInHours = Number(delay) / 3600;
    
    const parameters = this.buildParameters(decoded, fragment, 'setDelay');
    
    // Enhance delay parameter
    const delayParam = parameters.find(p => p.name === 'delay_');
    if (delayParam) {
      delayParam.displayValue = `${delay.toString()} seconds (${delayInHours.toFixed(1)} hours)`;
      delayParam.format = 'duration';
      delayParam.unit = 'seconds';
    }
    
    return this.createBaseInterpretation(
      context,
      'setDelay',
      'Set timelock delay for proposal execution',
      parameters,
      `Set treasury timelock delay to ${delayInHours.toFixed(1)} hours`,
      'configuration',
      'elevated'
    );
  }
  
  private interpretUpgradeTo(context: TransactionContext): InterpretedTransaction {
    const decoded = this.decodeParameters(context.signature, context.calldata);
    const fragment = this.interface.getFunction('upgradeTo');
    
    const newImplementation = decoded[0] as string;
    const parameters = this.buildParameters(decoded, fragment, 'upgradeTo');
    
    return this.createBaseInterpretation(
      context,
      'upgradeTo',
      'Upgrade treasury contract to new implementation',
      parameters,
      'Upgrade treasury contract',
      'upgrade',
      'critical'
    );
  }
  
  private interpretUpgradeToAndCall(context: TransactionContext): InterpretedTransaction {
    const decoded = this.decodeParameters(context.signature, context.calldata);
    const fragment = this.interface.getFunction('upgradeToAndCall');
    
    const newImplementation = decoded[0] as string;
    const data = decoded[1] as string;
    
    const parameters = this.buildParameters(decoded, fragment, 'upgradeToAndCall');
    
    return this.createBaseInterpretation(
      context,
      'upgradeToAndCall',
      'Upgrade treasury contract and call initialization function',
      parameters,
      'Upgrade treasury contract with initialization',
      'upgrade',
      'critical'
    );
  }
  
  private interpretInitialize(context: TransactionContext): InterpretedTransaction {
    const decoded = this.decodeParameters(context.signature, context.calldata);
    const fragment = this.interface.getFunction('initialize');
    
    const parameters = this.buildParameters(decoded, fragment, 'initialize');
    
    return this.createBaseInterpretation(
      context,
      'initialize',
      'Initialize treasury contract (one-time setup)',
      parameters,
      'Initialize treasury contract',
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
        `Call ${functionName} on Treasury contract`,
        parameters,
        `Execute ${functionName}`,
        'treasury',
        'normal'
      );
    } catch (error) {
      return this.createBaseInterpretation(
        context,
        functionName || 'unknown',
        'Unknown Treasury function',
        [],
        'Call function on Treasury contract',
        'unknown',
        'normal'
      );
    }
  }
}

