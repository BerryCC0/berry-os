/**
 * Client Rewards Contract Interpreter
 * 
 * Interprets transactions for the Client Rewards contract
 * Address: 0x883860178F95d0C82413eDc1D6De530cB4771d55 (proxy)
 */

import { BaseInterpreter } from './BaseInterpreter';
import { ClientRewardsABI } from '@/app/lib/Nouns/Contracts/abis/ClientRewards';
import type { TransactionContext, InterpretedTransaction } from './types';

export class ClientRewardsInterpreter extends BaseInterpreter {
  readonly contractAddress = '0x883860178F95d0C82413eDc1D6De530cB4771d55';
  readonly contractName = 'Client Rewards';
  
  constructor() {
    super(ClientRewardsABI, 'Client rewards for proposal creation and voting');
  }
  
  interpret(context: TransactionContext): InterpretedTransaction {
    const functionName = this.extractFunctionName(context.signature);
    
    switch (functionName) {
      case 'enableAuctionRewards':
      case 'disableAuctionRewards':
      case 'enableProposalRewards':
      case 'disableProposalRewards':
        return this.interpretToggleRewards(context, functionName);
      
      case 'setAuctionRewardsParams':
        return this.interpretSetAuctionRewardsParams(context);
      
      case 'setProposalRewardParams':
        return this.interpretSetProposalRewardParams(context);
      
      case 'registerClient':
        return this.interpretRegisterClient(context);
      
      case 'setClientApproval':
        return this.interpretSetClientApproval(context);
      
      case 'updateRewardsForAuctions':
        return this.interpretUpdateRewardsForAuctions(context);
      
      case 'updateRewardsForProposalWritingAndVoting':
        return this.interpretUpdateRewardsForProposalWritingAndVoting(context);
      
      case 'pause':
        return this.interpretPause(context);
      
      case 'unpause':
        return this.interpretUnpause(context);
      
      case 'setAdmin':
        return this.interpretSetAdmin(context);
      
      case 'setDescriptor':
        return this.interpretSetDescriptor(context);
      
      case 'setETHToken':
        return this.interpretSetETHToken(context);
      
      case 'withdrawToken':
        return this.interpretWithdrawToken(context);
      
      case 'upgradeTo':
      case 'upgradeToAndCall':
        return this.interpretUpgrade(context, functionName);
      
      case 'transferOwnership':
        return this.interpretTransferOwnership(context);
      
      case 'renounceOwnership':
        return this.interpretRenounceOwnership(context);
      
      default:
        return this.interpretGeneric(context, functionName);
    }
  }
  
  private interpretToggleRewards(context: TransactionContext, functionName: string): InterpretedTransaction {
    const isEnable = functionName.startsWith('enable');
    const rewardType = functionName.includes('Auction') ? 'auction' : 'proposal';
    
    return this.createBaseInterpretation(
      context,
      functionName,
      `${isEnable ? 'Enable' : 'Disable'} client rewards for ${rewardType}s`,
      [],
      `${isEnable ? 'Enable' : 'Disable'} ${rewardType} rewards`,
      'governance',
      'elevated'
    );
  }
  
  private interpretSetAuctionRewardsParams(context: TransactionContext): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction('setAuctionRewardsParams');
      const parameters = this.buildParameters(decoded, fragment, 'setAuctionRewardsParams');
      
      return this.createBaseInterpretation(
        context,
        'setAuctionRewardsParams',
        'Update auction rewards parameters',
        parameters,
        'Update auction rewards settings',
        'configuration',
        'normal'
      );
    } catch (error) {
      return this.interpretGeneric(context, 'setAuctionRewardsParams');
    }
  }
  
  private interpretSetProposalRewardParams(context: TransactionContext): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction('setProposalRewardParams');
      const parameters = this.buildParameters(decoded, fragment, 'setProposalRewardParams');
      
      return this.createBaseInterpretation(
        context,
        'setProposalRewardParams',
        'Update proposal rewards parameters',
        parameters,
        'Update proposal rewards settings',
        'configuration',
        'normal'
      );
    } catch (error) {
      return this.interpretGeneric(context, 'setProposalRewardParams');
    }
  }
  
  private interpretRegisterClient(context: TransactionContext): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction('registerClient');
      const parameters = this.buildParameters(decoded, fragment, 'registerClient');
      
      // Get client name from parameters
      const nameParam = parameters.find(p => p.name === 'name');
      const name = nameParam?.displayValue || 'client';
      
      return this.createBaseInterpretation(
        context,
        'registerClient',
        'Register new client for rewards',
        parameters,
        `Register client "${name}"`,
        'configuration',
        'normal'
      );
    } catch (error) {
      return this.interpretGeneric(context, 'registerClient');
    }
  }
  
  private interpretSetClientApproval(context: TransactionContext): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction('setClientApproval');
      const parameters = this.buildParameters(decoded, fragment, 'setClientApproval');
      
      // Get approved status
      const approvedParam = parameters.find(p => p.name === 'approved');
      const isApproved = approvedParam?.value === true;
      
      return this.createBaseInterpretation(
        context,
        'setClientApproval',
        `${isApproved ? 'Approve' : 'Revoke'} client for rewards`,
        parameters,
        `${isApproved ? 'Approve' : 'Revoke'} client`,
        'governance',
        'normal'
      );
    } catch (error) {
      return this.interpretGeneric(context, 'setClientApproval');
    }
  }
  
  private interpretUpdateRewardsForAuctions(context: TransactionContext): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction('updateRewardsForAuctions');
      const parameters = this.buildParameters(decoded, fragment, 'updateRewardsForAuctions');
      
      return this.createBaseInterpretation(
        context,
        'updateRewardsForAuctions',
        'Distribute rewards for auction activity',
        parameters,
        'Distribute auction rewards',
        'rewards',
        'normal'
      );
    } catch (error) {
      return this.interpretGeneric(context, 'updateRewardsForAuctions');
    }
  }
  
  private interpretUpdateRewardsForProposalWritingAndVoting(context: TransactionContext): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction('updateRewardsForProposalWritingAndVoting');
      const parameters = this.buildParameters(decoded, fragment, 'updateRewardsForProposalWritingAndVoting');
      
      return this.createBaseInterpretation(
        context,
        'updateRewardsForProposalWritingAndVoting',
        'Distribute rewards for proposal activity',
        parameters,
        'Distribute proposal rewards',
        'rewards',
        'normal'
      );
    } catch (error) {
      return this.interpretGeneric(context, 'updateRewardsForProposalWritingAndVoting');
    }
  }
  
  private interpretPause(context: TransactionContext): InterpretedTransaction {
    return this.createBaseInterpretation(
      context,
      'pause',
      'Pause Client Rewards operations',
      [],
      'Pause Client Rewards',
      'governance',
      'elevated'
    );
  }
  
  private interpretUnpause(context: TransactionContext): InterpretedTransaction {
    return this.createBaseInterpretation(
      context,
      'unpause',
      'Resume Client Rewards operations',
      [],
      'Unpause Client Rewards',
      'governance',
      'normal'
    );
  }
  
  private interpretSetAdmin(context: TransactionContext): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction('setAdmin');
      const admin = decoded[0] as string;
      
      const parameters = this.buildParameters(decoded, fragment, 'setAdmin');
      const displayAddress = `${admin.substring(0, 6)}...${admin.substring(38)}`;
      
      return this.createBaseInterpretation(
        context,
        'setAdmin',
        'Set Client Rewards admin',
        parameters,
        `Set admin to ${displayAddress}`,
        'governance',
        'elevated'
      );
    } catch (error) {
      return this.interpretGeneric(context, 'setAdmin');
    }
  }
  
  private interpretSetDescriptor(context: TransactionContext): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction('setDescriptor');
      const descriptor = decoded[0] as string;
      
      const parameters = this.buildParameters(decoded, fragment, 'setDescriptor');
      const displayAddress = `${descriptor.substring(0, 6)}...${descriptor.substring(38)}`;
      
      return this.createBaseInterpretation(
        context,
        'setDescriptor',
        'Set Client Rewards descriptor',
        parameters,
        `Set descriptor to ${displayAddress}`,
        'configuration',
        'normal'
      );
    } catch (error) {
      return this.interpretGeneric(context, 'setDescriptor');
    }
  }
  
  private interpretSetETHToken(context: TransactionContext): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction('setETHToken');
      const ethToken = decoded[0] as string;
      
      const parameters = this.buildParameters(decoded, fragment, 'setETHToken');
      const displayAddress = `${ethToken.substring(0, 6)}...${ethToken.substring(38)}`;
      
      return this.createBaseInterpretation(
        context,
        'setETHToken',
        'Set ETH token address (WETH)',
        parameters,
        `Set ETH token to ${displayAddress}`,
        'configuration',
        'elevated'
      );
    } catch (error) {
      return this.interpretGeneric(context, 'setETHToken');
    }
  }
  
  private interpretWithdrawToken(context: TransactionContext): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction('withdrawToken');
      const parameters = this.buildParameters(decoded, fragment, 'withdrawToken');
      
      return this.createBaseInterpretation(
        context,
        'withdrawToken',
        'Withdraw tokens from Client Rewards',
        parameters,
        'Withdraw tokens',
        'treasury',
        'normal'
      );
    } catch (error) {
      return this.interpretGeneric(context, 'withdrawToken');
    }
  }
  
  private interpretUpgrade(context: TransactionContext, functionName: string): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction(functionName);
      const newImplementation = decoded[0] as string;
      
      const parameters = this.buildParameters(decoded, fragment, functionName);
      const displayAddress = `${newImplementation.substring(0, 6)}...${newImplementation.substring(38)}`;
      
      return this.createBaseInterpretation(
        context,
        functionName,
        'Upgrade Client Rewards contract',
        parameters,
        `Upgrade to ${displayAddress}`,
        'upgrade',
        'critical'
      );
    } catch (error) {
      return this.interpretGeneric(context, functionName);
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
        'Transfer Client Rewards ownership',
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
      'Permanently renounce Client Rewards ownership',
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
        `Call ${functionName} on Client Rewards`,
        parameters,
        `Execute ${functionName}`,
        'configuration',
        'normal'
      );
    } catch (error) {
      return this.createBaseInterpretation(
        context,
        functionName || 'unknown',
        'Unknown Client Rewards function',
        [],
        'Call function on Client Rewards',
        'unknown',
        'normal'
      );
    }
  }
}

