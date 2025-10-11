/**
 * DAO Admin Contract Interpreter
 * 
 * Interprets transactions for the Nouns DAO Admin functions (governance settings)
 * Address: 0x6f3E6272A167e8AcCb32072d08E0957F9c79223d (proxy)
 */

import { BaseInterpreter } from './BaseInterpreter';
import { NounsDAOAdminABI } from '@/app/lib/Nouns/Contracts/abis/NounsDAOAdmin';
import type { TransactionContext, InterpretedTransaction } from './types';

export class DAOAdminInterpreter extends BaseInterpreter {
  readonly contractAddress = '0x6f3E6272A167e8AcCb32072d08E0957F9c79223d';
  readonly contractName = 'Nouns DAO';
  
  constructor() {
    super(NounsDAOAdminABI, 'DAO governance settings and admin functions');
  }
  
  interpret(context: TransactionContext): InterpretedTransaction {
    const functionName = this.extractFunctionName(context.signature);
    
    switch (functionName) {
      // Threshold settings
      case 'setProposalThresholdBPS':
      case 'setMinQuorumVotesBPS':
      case 'setMaxQuorumVotesBPS':
      case 'setQuorumCoefficient':
        return this.interpretSetThreshold(context, functionName);
      
      // Timing settings
      case 'setVotingDelay':
      case 'setVotingPeriod':
      case 'setPendingVetoer':
      case 'setObjectionPeriodDurationInBlocks':
      case 'setProposalUpdatablePeriodInBlocks':
        return this.interpretSetTiming(context, functionName);
      
      // Role management
      case 'setPendingAdmin':
      case 'acceptAdmin':
      case 'setVetoer':
      case 'burnVetoPower':
        return this.interpretRoleManagement(context, functionName);
      
      // Contract references
      case 'setTimelock':
      case 'setNounsTokenAddress':
      case 'setForkDAODeployer':
      case 'setForkEscrow':
      case 'setForkParams':
        return this.interpretSetContract(context, functionName);
      
      // Dynamic quorum
      case 'setDynamicQuorumParams':
        return this.interpretSetDynamicQuorumParams(context);
      
      // Upgrade
      case 'upgradeTo':
      case 'upgradeToAndCall':
        return this.interpretUpgrade(context, functionName);
      
      // Withdrawal
      case 'withdrawDAONounsFromEscrowIncreasingTotalSupply':
      case 'withdrawDAONounsFromEscrowToTreasury':
      case 'withdrawFromForkEscrow':
        return this.interpretWithdrawal(context, functionName);
      
      default:
        return this.interpretGeneric(context, functionName);
    }
  }
  
  private interpretSetThreshold(context: TransactionContext, functionName: string): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction(functionName);
      const parameters = this.buildParameters(decoded, fragment, functionName);
      
      // Convert basis points to percentage
      const bpsParam = parameters.find(p => p.name.toLowerCase().includes('bps') || p.name === 'newProposalThresholdBPS');
      if (bpsParam && typeof bpsParam.value === 'bigint') {
        const percentage = Number(bpsParam.value) / 100;
        bpsParam.displayValue = `${percentage}%`;
        bpsParam.format = 'percentage';
      }
      
      // Friendly name
      const friendlyName = functionName
        .replace(/^set/, '')
        .replace(/BPS$/, '')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .toLowerCase();
      
      return this.createBaseInterpretation(
        context,
        functionName,
        `Update ${friendlyName} threshold`,
        parameters,
        `Set ${friendlyName} threshold`,
        'governance',
        'elevated'
      );
    } catch (error) {
      return this.interpretGeneric(context, functionName);
    }
  }
  
  private interpretSetTiming(context: TransactionContext, functionName: string): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction(functionName);
      const parameters = this.buildParameters(decoded, fragment, functionName);
      
      // Convert blocks to approximate days/hours
      const blocksParam = parameters.find(p => 
        p.name.toLowerCase().includes('blocks') || 
        p.name.toLowerCase().includes('delay') ||
        p.name.toLowerCase().includes('period')
      );
      
      if (blocksParam && typeof blocksParam.value === 'bigint') {
        const blocks = Number(blocksParam.value);
        const hours = (blocks * 12) / 3600; // ~12 seconds per block
        const days = hours / 24;
        
        if (days >= 1) {
          blocksParam.displayValue = `${blocks.toLocaleString()} blocks (~${days.toFixed(1)} days)`;
        } else {
          blocksParam.displayValue = `${blocks.toLocaleString()} blocks (~${hours.toFixed(1)} hours)`;
        }
        blocksParam.format = 'duration';
      }
      
      const friendlyName = functionName
        .replace(/^set/, '')
        .replace(/InBlocks$/, '')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .toLowerCase();
      
      return this.createBaseInterpretation(
        context,
        functionName,
        `Update ${friendlyName} setting`,
        parameters,
        `Set ${friendlyName}`,
        'governance',
        'elevated'
      );
    } catch (error) {
      return this.interpretGeneric(context, functionName);
    }
  }
  
  private interpretRoleManagement(context: TransactionContext, functionName: string): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction(functionName);
      const parameters = this.buildParameters(decoded, fragment, functionName);
      
      let summary: string;
      let severity: 'normal' | 'elevated' | 'critical' = 'critical';
      
      switch (functionName) {
        case 'setPendingAdmin':
          const pendingAdmin = decoded[0] as string;
          summary = `Set pending admin to ${pendingAdmin.substring(0, 6)}...${pendingAdmin.substring(38)}`;
          break;
        
        case 'acceptAdmin':
          summary = 'Accept admin role';
          break;
        
        case 'setVetoer':
          const vetoer = decoded[0] as string;
          summary = `Set vetoer to ${vetoer.substring(0, 6)}...${vetoer.substring(38)}`;
          break;
        
        case 'burnVetoPower':
          summary = 'Permanently burn veto power';
          break;
        
        default:
          summary = `Execute ${functionName}`;
      }
      
      return this.createBaseInterpretation(
        context,
        functionName,
        `Governance role management: ${functionName}`,
        parameters,
        summary,
        'governance',
        severity
      );
    } catch (error) {
      return this.interpretGeneric(context, functionName);
    }
  }
  
  private interpretSetContract(context: TransactionContext, functionName: string): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction(functionName);
      const parameters = this.buildParameters(decoded, fragment, functionName);
      
      const friendlyName = functionName
        .replace(/^set/, '')
        .replace(/Address$/, '')
        .replace(/([A-Z])/g, ' $1')
        .trim();
      
      return this.createBaseInterpretation(
        context,
        functionName,
        `Update ${friendlyName} contract reference`,
        parameters,
        `Set ${friendlyName}`,
        'configuration',
        'elevated'
      );
    } catch (error) {
      return this.interpretGeneric(context, functionName);
    }
  }
  
  private interpretSetDynamicQuorumParams(context: TransactionContext): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction('setDynamicQuorumParams');
      const parameters = this.buildParameters(decoded, fragment, 'setDynamicQuorumParams');
      
      // Convert BPS parameters to percentages
      parameters.forEach(param => {
        if (param.name.toLowerCase().includes('bps') && typeof param.value === 'bigint') {
          const percentage = Number(param.value) / 100;
          param.displayValue = `${percentage}%`;
          param.format = 'percentage';
        }
      });
      
      return this.createBaseInterpretation(
        context,
        'setDynamicQuorumParams',
        'Update dynamic quorum parameters',
        parameters,
        'Set dynamic quorum params',
        'governance',
        'elevated'
      );
    } catch (error) {
      return this.interpretGeneric(context, 'setDynamicQuorumParams');
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
        'Upgrade DAO governance contract',
        parameters,
        `Upgrade DAO to ${displayAddress}`,
        'upgrade',
        'critical'
      );
    } catch (error) {
      return this.interpretGeneric(context, functionName);
    }
  }
  
  private interpretWithdrawal(context: TransactionContext, functionName: string): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction(functionName);
      const parameters = this.buildParameters(decoded, fragment, functionName);
      
      const friendlyName = functionName
        .replace(/^withdraw/, 'Withdraw ')
        .replace(/([A-Z])/g, ' $1')
        .trim();
      
      return this.createBaseInterpretation(
        context,
        functionName,
        friendlyName,
        parameters,
        friendlyName,
        'treasury',
        'elevated'
      );
    } catch (error) {
      return this.interpretGeneric(context, functionName);
    }
  }
  
  private interpretGeneric(context: TransactionContext, functionName: string): InterpretedTransaction {
    try {
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction(functionName);
      const parameters = this.buildParameters(decoded, fragment, functionName);
      
      return this.createBaseInterpretation(
        context,
        functionName,
        `Call ${functionName} on DAO`,
        parameters,
        `Execute ${functionName}`,
        'governance',
        'normal'
      );
    } catch (error) {
      return this.createBaseInterpretation(
        context,
        functionName || 'unknown',
        'Unknown DAO function',
        [],
        'Call function on DAO',
        'unknown',
        'normal'
      );
    }
  }
}

