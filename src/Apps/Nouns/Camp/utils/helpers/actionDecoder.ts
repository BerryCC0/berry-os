/**
 * Proposal Action Decoder
 * 
 * Parse and format proposal actions into human-readable descriptions
 * Uses ethers Interface for complete ABI decoding support
 */

import { Interface, type Result, type ParamType } from 'ethers';
import type { Proposal } from '@/app/lib/Nouns/Goldsky/utils/types';
import { NOUNS_CONTRACTS, EXTERNAL_CONTRACTS } from '@/app/lib/Nouns/Contracts/utils/addresses';
import { getABIForAddress, type ABIEntry } from './abiRegistry';
import { isRecipientParameter, getRecipientRole } from './recipientIdentifier';

export interface DecodedParameter {
  name: string;
  type: string; // Full type (e.g., "address[]", "tuple(uint256,address)")
  baseType: string; // Base type (e.g., "address", "uint256")
  value: any; // Raw decoded value
  displayValue: string; // Formatted for display
  isRecipient: boolean; // Whether this is a recipient address (for ENS resolution)
  recipientRole?: string; // What role this recipient plays
  ensName?: string | null; // ENS name if resolved (populated by component)
}

export interface DecodedAction {
  target: string;
  targetName: string; // Human-readable contract name
  targetDescription: string; // Detailed description of what the contract does
  value: string; // ETH amount
  valueFormatted: string; // "0.5 ETH"
  signature: string; // Function signature
  functionName: string; // Extracted function name
  parameters: DecodedParameter[];
  calldata: string; // Raw hex calldata
  description: string; // Human-readable description
  isNounsContract: boolean; // Whether this is a known Nouns contract
  isVerified?: boolean; // Whether contract is verified on Etherscan
  isLoading?: boolean; // Whether external contract info is being fetched
}

/**
 * Build contract address map from our Contracts lib
 */
const KNOWN_CONTRACTS: Record<string, { name: string; description: string }> = {};

// Add all Nouns contracts
Object.entries(NOUNS_CONTRACTS).forEach(([key, config]) => {
  const address = ('proxy' in config ? config.proxy : config.address).toLowerCase();
  KNOWN_CONTRACTS[address] = {
    name: key.replace(/([A-Z])/g, ' $1').trim(), // "NounsToken" => "Nouns Token"
    description: config.description,
  };
});

// Add external contracts
Object.entries(EXTERNAL_CONTRACTS).forEach(([key, config]) => {
  const address = config.address.toLowerCase();
  KNOWN_CONTRACTS[address] = {
    name: key,
    description: config.description,
  };
});

/**
 * Common parameter names for Nouns functions
 */
const COMMON_PARAM_NAMES: Record<string, string[]> = {
  'transfer': ['recipient', 'amount'],
  'transferFrom': ['from', 'to', 'tokenId'],
  'approve': ['spender', 'amount'],
  'delegate': ['delegatee'],
  'sendOrRegisterDebt': ['account', 'amount'],
  'setPendingAdmin': ['newAdmin'],
  'setVotingDelay': ['newVotingDelay'],
  'setVotingPeriod': ['newVotingPeriod'],
  'setProposalThresholdBPS': ['newProposalThresholdBPS'],
};

/**
 * Extract function name from signature
 */
function extractFunctionName(signature: string): string {
  if (!signature) return '';
  
  // Format: "functionName(type1,type2,...)"
  const match = signature.match(/^([^(]+)\(/);
  return match ? match[1] : signature;
}

/**
 * Format ETH value
 */
function formatEthValue(value: string): string {
  if (!value || value === '0') return '0 ETH';
  
  try {
    const valueInWei = BigInt(value);
    const valueInEth = Number(valueInWei) / 1e18;
    
    if (valueInEth === 0) return '0 ETH';
    if (valueInEth < 0.0001) return `${valueInWei.toString()} wei`;
    
    return `${valueInEth.toLocaleString(undefined, { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 4 
    })} ETH`;
  } catch (error) {
    return value;
  }
}

/**
 * Get contract name or truncated address
 */
function getContractInfo(address: string): { name: string; description: string; isKnown: boolean } {
  const known = KNOWN_CONTRACTS[address.toLowerCase()];
  
  if (known) {
    return {
      name: known.name,
      description: known.description,
      isKnown: true,
    };
  }
  
  // Unknown contract - return truncated address
  const truncated = address && address.length >= 10
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : address;
    
  return {
    name: truncated,
    description: 'Unknown contract',
    isKnown: false,
  };
}

/**
 * Format decoded value from ethers (handles complex types)
 */
function formatDecodedValue(value: any, paramType: ParamType): string {
  // Arrays
  if (paramType.isArray() && Array.isArray(value)) {
    if (value.length === 0) return '[]';
    if (value.length <= 3) {
      return `[${value.map((v, i) => formatDecodedValue(v, paramType.arrayChildren!)).join(', ')}]`;
    }
    return `[${value.length} items]`;
  }
  
  // BigInt/BigNumber
  if (typeof value === 'bigint') {
    const num = value;
    // Format with commas
    const formatted = num.toLocaleString();
    
    // Don't show decimal conversion for amounts (will be handled by context)
    return formatted;
  }
  
  // Address
  if (paramType.baseType === 'address' && typeof value === 'string') {
    // Check if it's a known contract
    const contractInfo = getContractInfo(value);
    if (contractInfo.isKnown) {
      return `${value} (${contractInfo.name})`;
    }
    return value;
  }
  
  // Bool
  if (typeof value === 'boolean') {
    return value.toString();
  }
  
  // Bytes
  if (paramType.baseType.startsWith('bytes') && typeof value === 'string') {
    if (value.length > 66) {
      return `${value.substring(0, 10)}...${value.substring(value.length - 8)} (${(value.length - 2) / 2} bytes)`;
    }
    return value;
  }
  
  // Tuple/Struct
  if (paramType.isTuple() && typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const components = paramType.components || [];
    if (components.length > 0) {
      const entries = components.slice(0, 2).map((comp, idx) => {
        const compValue = Array.isArray(value) ? value[idx] : value[comp.name];
        return `${comp.name}: ${formatDecodedValue(compValue, comp)}`;
      });
      return `{ ${entries.join(', ')}${components.length > 2 ? '...' : ''} }`;
    }
  }
  
  // String
  if (typeof value === 'string') {
    if (value.length > 50) {
      return `${value.substring(0, 47)}...`;
    }
    return value;
  }
  
  return String(value);
}

/**
 * Decode parameters using ABI (ethers Interface)
 */
function decodeParametersWithABI(
  abiEntry: ABIEntry,
  signature: string,
  calldata: string,
  functionName: string
): DecodedParameter[] {
  try {
    const iface = abiEntry.interface;
    
    // For proposals, the signature might be empty or the calldata might be just parameter data
    // We need to handle both full calldata (with selector) and parameter-only data
    
    let fragment;
    let dataToDecode = calldata;
    
    if (signature) {
      // We have a signature - try to get the function by signature
      try {
        fragment = iface.getFunction(signature);
      } catch (e) {
        // Function not found in ABI
        return [];
      }
      
      // If calldata doesn't start with function selector, we need to add it
      if (calldata && calldata !== '0x' && fragment) {
        const selector = fragment.selector;
        
        // Normalize calldata to have 0x prefix
        const normalizedCalldata = calldata.startsWith('0x') ? calldata : '0x' + calldata;
        
        // Check if calldata already has the selector (after 0x)
        if (!normalizedCalldata.toLowerCase().startsWith(selector.toLowerCase())) {
          // Calldata is parameter-only - add the selector
          const paramData = normalizedCalldata.substring(2);
          dataToDecode = selector + paramData;
        } else {
          dataToDecode = normalizedCalldata;
        }
      }
    } else {
      // No signature - try to parse from calldata selector
      if (!calldata || calldata === '0x' || calldata.length < 10) {
        return [];
      }
      
      const selector = calldata.substring(0, 10);
      try {
        fragment = iface.getFunction(selector);
      } catch (e) {
        return [];
      }
      
      dataToDecode = calldata;
    }
    
    if (!fragment) {
      return [];
    }
    
    const decoded: Result = iface.decodeFunctionData(fragment, dataToDecode);
    
    return fragment.inputs.map((input, idx) => {
      const value = decoded[idx];
      const isRecip = isRecipientParameter(functionName, input.name, input.baseType, idx);
      
      return {
        name: input.name || `param${idx}`,
        type: input.type,
        baseType: input.baseType,
        value,
        displayValue: formatDecodedValue(value, input),
        isRecipient: isRecip,
        recipientRole: isRecip ? getRecipientRole(functionName, input.name) : undefined,
      };
    });
  } catch (error) {
    console.error('Error decoding with ABI:', {
      error,
      signature,
      calldata: calldata?.substring(0, 66) + '...',
    });
    return [];
  }
}

/**
 * Manual parameter parsing fallback (for contracts without ABIs)
 */
function parseParametersManually(signature: string, calldata: string, functionName: string): DecodedParameter[] {
  if (!signature || !calldata || calldata === '0x') {
    return [];
  }

  try {
    // Extract parameter types from signature: "functionName(type1,type2)"
    const match = signature.match(/\(([^)]*)\)/);
    if (!match || !match[1]) return [];
    
    const types = match[1].split(',').map(t => t.trim()).filter(Boolean);
    if (types.length === 0) return [];

    // Normalize calldata to have 0x prefix
    const normalizedCalldata = calldata.startsWith('0x') ? calldata : '0x' + calldata;
    
    // For parameter-only data (from proposals), we don't remove selector since it's not there
    // If data length suggests no selector (exactly N * 64 chars after 0x), use as-is
    const hasSelector = normalizedCalldata.length > 10 && normalizedCalldata.substring(0, 10) !== '0x' + '0'.repeat(8);
    const dataWithoutSelector = hasSelector ? normalizedCalldata.substring(10) : normalizedCalldata.substring(2);
    
    // Get parameter names if we have them in COMMON_PARAM_NAMES
    const paramNames = COMMON_PARAM_NAMES[functionName] || [];
    
    // Each parameter is 32 bytes (64 hex chars)
    const parameters: DecodedParameter[] = types.map((type, index) => {
      const start = index * 64;
      const end = start + 64;
      const rawValue = dataWithoutSelector.substring(start, end);
      
      let displayValue = rawValue;
      let actualValue: any = rawValue;
      
      // Use common parameter name if available, otherwise paramN (must be defined before use)
      const paramName = paramNames[index] || `param${index}`;
      
      // Try to decode common types
      if (type === 'address') {
        // Address is last 20 bytes (40 hex chars) of the 32-byte value
        // But we need to handle it as a 64-char hex string where address is right-aligned
        const addr = '0x' + rawValue.substring(rawValue.length - 40);
        actualValue = addr;
        // Check if it's a known contract
        const contractInfo = getContractInfo(addr);
        displayValue = contractInfo.isKnown ? `${addr} (${contractInfo.name})` : addr;
      } else if (type.startsWith('uint') || type.startsWith('int')) {
        try {
          const num = BigInt('0x' + rawValue);
          actualValue = num;
          
          // Smart formatting based on function and parameter name
          // USDC amounts (6 decimals)
          if (functionName === 'sendOrRegisterDebt' && paramName === 'amount') {
            const usdcAmount = Number(num) / 1e6;
            displayValue = `${num.toLocaleString()} ($${usdcAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
          }
          // Generic token amounts (18 decimals) - only if very large
          else if (num > BigInt(1e15)) {
            const asToken = Number(num) / 1e18;
            displayValue = `${num.toLocaleString()} (${asToken.toFixed(4)} tokens)`;
          }
          // Regular numbers
          else {
            displayValue = num.toLocaleString();
          }
        } catch {
          displayValue = rawValue;
        }
      } else if (type === 'bool') {
        actualValue = rawValue !== '0'.repeat(64);
        displayValue = actualValue ? 'true' : 'false';
      } else if (type.startsWith('bytes')) {
        actualValue = '0x' + rawValue;
        displayValue = actualValue;
      }
      
      const isRecip = type === 'address' && isRecipientParameter(functionName, paramName, type, index);
      
      return {
        name: paramName,
        type,
        baseType: type,
        value: actualValue,
        displayValue,
        isRecipient: isRecip,
        recipientRole: isRecip ? getRecipientRole(functionName, paramName) : undefined,
      };
    });

    return parameters;
  } catch (error) {
    console.error('Error parsing parameters manually:', error);
    return [];
  }
}

/**
 * Parse function parameters - try ABI first, fallback to manual
 */
function parseParameters(
  target: string,
  signature: string,
  calldata: string,
  functionName: string
): DecodedParameter[] {
  // Try ABI decoding first
  const abiEntry = getABIForAddress(target);
  if (abiEntry) {
    const params = decodeParametersWithABI(abiEntry, signature, calldata, functionName);
    if (params.length > 0) {
      return params;
    }
  }
  
  // Fallback to manual parsing
  return parseParametersManually(signature, calldata, functionName);
}

/**
 * Generate human-readable description for common actions
 */
function generateDescription(action: DecodedAction): string {
  const { functionName, targetName, valueFormatted, parameters, isNounsContract } = action;
  
  // ETH transfers (no function call)
  if (valueFormatted !== '0 ETH' && !functionName) {
    return `Transfer ${valueFormatted} to ${targetName}`;
  }
  
  // Nouns-specific functions with better descriptions
  if (functionName === 'sendOrRegisterDebt') {
    const accountParam = parameters.find(p => p.name === 'account');
    const amountParam = parameters.find(p => p.name === 'amount');
    
    const account = accountParam?.displayValue || 'recipient';
    
    // Format USDC amount (6 decimals)
    let amountDisplay = 'amount';
    if (amountParam && typeof amountParam.value === 'bigint') {
      const usdcAmount = Number(amountParam.value) / 1e6;
      amountDisplay = `$${usdcAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (amountParam) {
      amountDisplay = amountParam.displayValue;
    }
    
    return `Send payment of ${amountDisplay} USDC to ${account} via ${targetName}`;
  }
  
  if (functionName === 'transfer') {
    const recipient = parameters.find(p => p.isRecipient)?.displayValue || parameters[0]?.displayValue;
    const amount = parameters.find(p => p.name === 'amount')?.displayValue || parameters[1]?.displayValue;
    return `Transfer ${amount} to ${recipient}`;
  }
  
  if (functionName === 'transferFrom') {
    const to = parameters.find(p => p.name === 'to')?.displayValue || parameters[1]?.displayValue;
    const tokenId = parameters.find(p => p.name === 'tokenId')?.displayValue;
    if (tokenId) {
      return `Transfer Noun ${tokenId} to ${to}`;
    }
    return `Transfer from ${targetName} to ${to}`;
  }
  
  if (functionName === 'approve') {
    const spender = parameters.find(p => p.isRecipient)?.displayValue;
    const amount = parameters.find(p => p.name === 'amount')?.displayValue;
    return `Approve ${spender} to spend ${amount}`;
  }
  
  if (functionName === 'delegate') {
    const delegatee = parameters.find(p => p.isRecipient)?.displayValue;
    return `Delegate voting power to ${delegatee}`;
  }
  
  if (functionName.startsWith('set')) {
    const paramName = parameters[0]?.name || 'value';
    const paramValue = parameters[0]?.displayValue;
    return `Set ${paramName} to ${paramValue} in ${targetName}`;
  }
  
  if (functionName.toLowerCase().includes('mint')) {
    return `Mint via ${targetName}`;
  }
  
  if (functionName.toLowerCase().includes('withdraw')) {
    return `Withdraw from ${targetName}`;
  }
  
  if (functionName.toLowerCase().includes('deposit')) {
    return `Deposit to ${targetName}`;
  }
  
  // For known Nouns contracts, add helpful context
  if (isNounsContract) {
    return `Execute ${functionName}() on ${targetName}`;
  }
  
  // Generic fallback
  return `Call ${functionName}() on ${targetName}`;
}

/**
 * Decode a single proposal action
 */
export function decodeAction(
  target: string,
  value: string,
  signature: string,
  calldata: string
): DecodedAction {
  const contractInfo = getContractInfo(target);
  const valueFormatted = formatEthValue(value);
  const functionName = extractFunctionName(signature);
  const parameters = parseParameters(target, signature, calldata, functionName);
  
  const action: DecodedAction = {
    target,
    targetName: contractInfo.name,
    targetDescription: contractInfo.description,
    value,
    valueFormatted,
    signature,
    functionName,
    parameters,
    calldata,
    isNounsContract: contractInfo.isKnown,
    description: '', // Set below
  };
  
  action.description = generateDescription(action);
  
  return action;
}

/**
 * Decode all actions from a proposal
 */
export function decodeProposalActions(proposal: Proposal): DecodedAction[] {
  const { targets, values, signatures, calldatas } = proposal;
  
  if (!targets || targets.length === 0) {
    return [];
  }
  
  const actions: DecodedAction[] = [];
  
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const value = values?.[i] || '0';
    const signature = signatures?.[i] || '';
    const calldata = calldatas?.[i] || '0x';
    
    actions.push(decodeAction(target, value, signature, calldata));
  }
  
  return actions;
}

/**
 * Get a summary of all actions
 */
export function getActionsSummary(actions: DecodedAction[]): string {
  if (actions.length === 0) return 'No actions';
  if (actions.length === 1) return actions[0].description;
  
  const summary = actions.slice(0, 2).map(a => a.description).join(', ');
  if (actions.length > 2) {
    return `${summary}, and ${actions.length - 2} more action${actions.length - 2 > 1 ? 's' : ''}`;
  }
  
  return summary;
}

/**
 * Extract all recipient addresses from actions
 */
export function extractAllRecipients(actions: DecodedAction[]): string[] {
  const recipients: string[] = [];
  
  actions.forEach(action => {
    action.parameters.forEach(param => {
      if (param.isRecipient && typeof param.value === 'string' && param.value.startsWith('0x')) {
        recipients.push(param.value);
      }
    });
  });
  
  return [...new Set(recipients)]; // Remove duplicates
}
