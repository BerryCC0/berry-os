/**
 * Nouns Token Contract Interpreter
 * 
 * Interprets transactions for the Nouns Token (admin functions only, NOT delegation)
 * Address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03
 */

import { BaseInterpreter } from './BaseInterpreter';
import { NounsTokenABI } from '@/app/lib/Nouns/Contracts/abis/NounsToken';
import type { TransactionContext, InterpretedTransaction } from './types';

export class TokenInterpreter extends BaseInterpreter {
  readonly contractAddress = '0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03';
  readonly contractName = 'Nouns Token';
  
  constructor() {
    super(NounsTokenABI, 'ERC-721 token contract for Nouns NFTs');
  }
  
  interpret(context: TransactionContext): InterpretedTransaction {
    const functionName = this.extractFunctionName(context.signature);
    
    switch (functionName) {
      case 'setMinter':
        return this.interpretSetMinter(context);
      
      case 'lockMinter':
        return this.interpretLockMinter(context);
      
      case 'setDescriptor':
        return this.interpretSetDescriptor(context);
      
      case 'lockDescriptor':
        return this.interpretLockDescriptor(context);
      
      case 'setSeeder':
        return this.interpretSetSeeder(context);
      
      case 'lockSeeder':
        return this.interpretLockSeeder(context);
      
      case 'setContractURIHash':
        return this.interpretSetContractURIHash(context);
      
      case 'transferFrom':
        return this.interpretTransferFrom(context);
      
      case 'safeTransferFrom':
        return this.interpretSafeTransferFrom(context);
      
      case 'transferOwnership':
        return this.interpretTransferOwnership(context);
      
      case 'renounceOwnership':
        return this.interpretRenounceOwnership(context);
      
      default:
        return this.interpretGeneric(context, functionName);
    }
  }
  
  private interpretSetMinter(context: TransactionContext): InterpretedTransaction {
    const decoded = this.decodeParameters(context.signature, context.calldata);
    const fragment = this.interface.getFunction('setMinter');
    
    const newMinter = decoded[0] as string;
    const parameters = this.buildParameters(decoded, fragment, 'setMinter');
    
    return this.createBaseInterpretation(
      context,
      'setMinter',
      'Set address authorized to mint new Nouns',
      parameters,
      'Update Nouns minter address',
      'configuration',
      'critical'
    );
  }
  
  private interpretLockMinter(context: TransactionContext): InterpretedTransaction {
    return this.createBaseInterpretation(
      context,
      'lockMinter',
      'Permanently lock minter address (cannot be changed)',
      [],
      'Lock Nouns minter permanently',
      'configuration',
      'critical'
    );
  }
  
  private interpretSetDescriptor(context: TransactionContext): InterpretedTransaction {
    const decoded = this.decodeParameters(context.signature, context.calldata);
    const fragment = this.interface.getFunction('setDescriptor');
    
    const newDescriptor = decoded[0] as string;
    const parameters = this.buildParameters(decoded, fragment, 'setDescriptor');
    
    return this.createBaseInterpretation(
      context,
      'setDescriptor',
      'Set descriptor contract for trait generation',
      parameters,
      'Update Nouns descriptor contract',
      'art',
      'critical'
    );
  }
  
  private interpretLockDescriptor(context: TransactionContext): InterpretedTransaction {
    return this.createBaseInterpretation(
      context,
      'lockDescriptor',
      'Permanently lock descriptor contract (art becomes immutable)',
      [],
      'Lock Nouns descriptor permanently',
      'art',
      'critical'
    );
  }
  
  private interpretSetSeeder(context: TransactionContext): InterpretedTransaction {
    const decoded = this.decodeParameters(context.signature, context.calldata);
    const fragment = this.interface.getFunction('setSeeder');
    
    const newSeeder = decoded[0] as string;
    const parameters = this.buildParameters(decoded, fragment, 'setSeeder');
    
    return this.createBaseInterpretation(
      context,
      'setSeeder',
      'Set seeder contract for trait randomization',
      parameters,
      'Update Nouns seeder contract',
      'configuration',
      'critical'
    );
  }
  
  private interpretLockSeeder(context: TransactionContext): InterpretedTransaction {
    return this.createBaseInterpretation(
      context,
      'lockSeeder',
      'Permanently lock seeder contract (randomization becomes immutable)',
      [],
      'Lock Nouns seeder permanently',
      'configuration',
      'critical'
    );
  }
  
  private interpretSetContractURIHash(context: TransactionContext): InterpretedTransaction {
    const decoded = this.decodeParameters(context.signature, context.calldata);
    const fragment = this.interface.getFunction('setContractURIHash');
    
    const newHash = decoded[0] as string;
    const parameters = this.buildParameters(decoded, fragment, 'setContractURIHash');
    
    return this.createBaseInterpretation(
      context,
      'setContractURIHash',
      'Update contract metadata URI hash',
      parameters,
      'Update contract URI hash',
      'configuration',
      'normal'
    );
  }
  
  private interpretTransferFrom(context: TransactionContext): InterpretedTransaction {
    const decoded = this.decodeParameters(context.signature, context.calldata);
    const fragment = this.interface.getFunction('transferFrom');
    
    const from = decoded[0] as string;
    const to = decoded[1] as string;
    const tokenId = decoded[2] as bigint;
    
    const parameters = this.buildParameters(decoded, fragment, 'transferFrom');
    
    return this.createBaseInterpretation(
      context,
      'transferFrom',
      'Transfer Noun NFT to another address',
      parameters,
      `Transfer Noun ${tokenId} to recipient`,
      'token',
      'normal'
    );
  }
  
  private interpretSafeTransferFrom(context: TransactionContext): InterpretedTransaction {
    const decoded = this.decodeParameters(context.signature, context.calldata);
    
    // safeTransferFrom has multiple overloads, need to check which one
    const fragment = this.interface.getFunction(context.signature);
    
    const from = decoded[0] as string;
    const to = decoded[1] as string;
    const tokenId = decoded[2] as bigint;
    
    const parameters = this.buildParameters(decoded, fragment, 'safeTransferFrom');
    
    return this.createBaseInterpretation(
      context,
      'safeTransferFrom',
      'Safely transfer Noun NFT (with recipient validation)',
      parameters,
      `Safely transfer Noun ${tokenId} to recipient`,
      'token',
      'normal'
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
      'Transfer ownership of Nouns Token contract',
      parameters,
      'Transfer Nouns Token ownership',
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
      'Renounce Nouns Token ownership permanently',
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
        `Call ${functionName} on Nouns Token`,
        parameters,
        `Execute ${functionName}`,
        'token',
        'normal'
      );
    } catch (error) {
      return this.createBaseInterpretation(
        context,
        functionName || 'unknown',
        'Unknown Nouns Token function',
        [],
        'Call function on Nouns Token',
        'unknown',
        'normal'
      );
    }
  }
}

