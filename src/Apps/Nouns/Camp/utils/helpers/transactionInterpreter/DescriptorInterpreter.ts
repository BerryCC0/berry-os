/**
 * Nouns Descriptor Contract Interpreter
 * 
 * Interprets transactions for the Nouns Descriptor V3 (art/trait generation)
 * Address: 0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac
 */

import { BaseInterpreter } from './BaseInterpreter';
import { NounsDescriptorV3ABI } from '@/app/lib/Nouns/Contracts/abis/NounsDescriptorV3';
import type { TransactionContext, InterpretedTransaction } from './types';

export class DescriptorInterpreter extends BaseInterpreter {
  readonly contractAddress = '0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac';
  readonly contractName = 'Nouns Descriptor V3';
  
  constructor() {
    super(NounsDescriptorV3ABI, 'Descriptor V3 for traits and artwork generation');
  }
  
  interpret(context: TransactionContext): InterpretedTransaction {
    const functionName = this.extractFunctionName(context.signature);
    
    // Art/trait addition functions
    if (functionName.startsWith('add')) {
      return this.interpretAddTrait(context, functionName);
    }
    
    // Art/trait update functions
    if (functionName.startsWith('update')) {
      return this.interpretUpdateTrait(context, functionName);
    }
    
    // Lock functions
    if (functionName === 'lockParts') {
      return this.interpretLockParts(context);
    }
    
    // Configuration functions
    switch (functionName) {
      case 'setArt':
      case 'setArtDescriptor':
      case 'setArtInflator':
      case 'setRenderer':
        return this.interpretSetConfiguration(context, functionName);
      
      case 'setBaseURI':
        return this.interpretSetBaseURI(context);
      
      case 'setPalette':
      case 'setPalettePointer':
        return this.interpretSetPalette(context, functionName);
      
      case 'toggleDataURIEnabled':
        return this.interpretToggleDataURI(context);
      
      case 'transferOwnership':
        return this.interpretTransferOwnership(context);
      
      case 'renounceOwnership':
        return this.interpretRenounceOwnership(context);
      
      default:
        return this.interpretGeneric(context, functionName);
    }
  }
  
  private interpretAddTrait(context: TransactionContext, functionName: string): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface.getFunction(functionName);
      const parameters = this.buildParameters(decoded, fragment, functionName);
      
      // Determine trait type from function name
      let traitType = 'traits';
      if (functionName.includes('Accessories')) traitType = 'accessories';
      else if (functionName.includes('Background')) traitType = 'backgrounds';
      else if (functionName.includes('Bodies') || functionName.includes('Body')) traitType = 'bodies';
      else if (functionName.includes('Glasses')) traitType = 'glasses';
      else if (functionName.includes('Heads') || functionName.includes('Head')) traitType = 'heads';
      
      const isFromPointer = functionName.includes('FromPointer');
      const isMany = functionName.includes('Many');
      
      let description = `Add new ${traitType} to Nouns artwork`;
      if (isFromPointer) description += ' (from SSTORE2 pointer)';
      if (isMany) description += ' (batch add)';
      
      return this.createBaseInterpretation(
        context,
        functionName,
        description,
        parameters,
        `Add ${traitType} to Nouns art library`,
        'art',
        'normal'
      );
    } catch (error) {
      return this.interpretGeneric(context, functionName);
    }
  }
  
  private interpretUpdateTrait(context: TransactionContext, functionName: string): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface.getFunction(functionName);
      const parameters = this.buildParameters(decoded, fragment, functionName);
      
      // Determine trait type
      let traitType = 'traits';
      if (functionName.includes('Accessories')) traitType = 'accessories';
      else if (functionName.includes('Bodies') || functionName.includes('Body')) traitType = 'bodies';
      else if (functionName.includes('Glasses')) traitType = 'glasses';
      else if (functionName.includes('Heads') || functionName.includes('Head')) traitType = 'heads';
      
      const isFromPointer = functionName.includes('FromPointer');
      
      let description = `Update existing ${traitType} in Nouns artwork`;
      if (isFromPointer) description += ' (from SSTORE2 pointer)';
      
      return this.createBaseInterpretation(
        context,
        functionName,
        description,
        parameters,
        `Update ${traitType} in Nouns art library`,
        'art',
        'elevated'
      );
    } catch (error) {
      return this.interpretGeneric(context, functionName);
    }
  }
  
  private interpretLockParts(context: TransactionContext): InterpretedTransaction {
    return this.createBaseInterpretation(
      context,
      'lockParts',
      'Permanently lock art parts (cannot add/update traits after this)',
      [],
      'Lock Nouns art parts permanently',
      'art',
      'critical'
    );
  }
  
  private interpretSetConfiguration(context: TransactionContext, functionName: string): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface.getFunction(functionName);
      const parameters = this.buildParameters(decoded, fragment, functionName);
      
      const configType = functionName.replace('set', '').replace('Art', 'art ');
      
      return this.createBaseInterpretation(
        context,
        functionName,
        `Update ${configType} configuration`,
        parameters,
        `Update descriptor ${configType.toLowerCase()} configuration`,
        'art',
        'elevated'
      );
    } catch (error) {
      return this.interpretGeneric(context, functionName);
    }
  }
  
  private interpretSetBaseURI(context: TransactionContext): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface.getFunction('setBaseURI');
      const parameters = this.buildParameters(decoded, fragment, 'setBaseURI');
      
      return this.createBaseInterpretation(
        context,
        'setBaseURI',
        'Set base URI for token metadata',
        parameters,
        'Update token metadata base URI',
        'configuration',
        'normal'
      );
    } catch (error) {
      return this.interpretGeneric(context, 'setBaseURI');
    }
  }
  
  private interpretSetPalette(context: TransactionContext, functionName: string): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface.getFunction(functionName);
      const parameters = this.buildParameters(decoded, fragment, functionName);
      
      const isPointer = functionName.includes('Pointer');
      const description = isPointer 
        ? 'Set color palette from SSTORE2 pointer'
        : 'Set color palette for artwork';
      
      return this.createBaseInterpretation(
        context,
        functionName,
        description,
        parameters,
        'Update Nouns color palette',
        'art',
        'normal'
      );
    } catch (error) {
      return this.interpretGeneric(context, functionName);
    }
  }
  
  private interpretToggleDataURI(context: TransactionContext): InterpretedTransaction {
    return this.createBaseInterpretation(
      context,
      'toggleDataURIEnabled',
      'Toggle data URI generation for tokens',
      [],
      'Toggle data URI functionality',
      'configuration',
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
      'Transfer ownership of Descriptor contract',
      parameters,
      'Transfer Descriptor ownership',
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
      'Renounce Descriptor ownership permanently',
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
        `Call ${functionName} on Descriptor`,
        parameters,
        `Execute ${functionName}`,
        'art',
        'normal'
      );
    } catch (error) {
      return this.createBaseInterpretation(
        context,
        functionName || 'unknown',
        'Unknown Descriptor function',
        [],
        'Call function on Descriptor',
        'unknown',
        'normal'
      );
    }
  }
}

