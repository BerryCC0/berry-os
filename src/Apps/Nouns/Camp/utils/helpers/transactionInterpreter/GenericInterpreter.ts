/**
 * Generic Contract Interpreter
 * 
 * Fallback interpreter for unknown or external contracts
 * Uses Etherscan API to fetch ABI dynamically if needed
 */

import { Interface, type Result } from 'ethers';
import type {
  TransactionContext,
  InterpretedTransaction,
  InterpretedParameter,
  ContractInterpreter,
} from './types';

// Known external contracts
const KNOWN_EXTERNAL_CONTRACTS: Record<string, { name: string; description: string; type: string }> = {
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
    name: 'WETH',
    description: 'Wrapped Ether (ERC-20)',
    type: 'erc20',
  },
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    name: 'USDC',
    description: 'USD Coin (ERC-20)',
    type: 'erc20',
  },
};

export class GenericInterpreter implements ContractInterpreter {
  readonly contractAddress: string;
  readonly contractName: string;
  private abi: any[] | null = null;
  private interface: Interface | null = null;
  private contractType: string = 'unknown';
  
  constructor(address: string, name: string = 'Unknown Contract', abi: any[] | null = null) {
    this.contractAddress = address;
    
    // Check if this is a known external contract
    const known = KNOWN_EXTERNAL_CONTRACTS[address.toLowerCase()];
    if (known) {
      this.contractName = known.name;
      this.contractType = known.type;
    } else {
      this.contractName = name;
    }
    
    if (abi) {
      this.abi = abi;
      this.interface = new Interface(abi);
    }
  }
  
  canHandle(context: TransactionContext): boolean {
    return context.target.toLowerCase() === this.contractAddress.toLowerCase();
  }
  
  interpret(context: TransactionContext): InterpretedTransaction {
    // Check if it's a direct ETH transfer (no signature)
    if (!context.signature && context.value && context.value !== '0') {
      return this.interpretETHTransfer(context);
    }
    
    // Try common ERC20 functions first
    if (this.contractType === 'erc20') {
      const result = this.interpretCommonERC20(context);
      if (result) return result;
    }
    
    // Try to decode with ABI if available
    if (this.abi && this.interface) {
      return this.interpretWithABI(context);
    }
    
    // Try to decode common function signatures without ABI
    const commonResult = this.interpretCommonFunctions(context);
    if (commonResult) return commonResult;
    
    // Fallback to raw display
    return this.interpretRaw(context);
  }
  
  /**
   * Decode common functions across many contracts without needing full ABI
   */
  private interpretCommonFunctions(context: TransactionContext): InterpretedTransaction | null {
    const functionName = this.extractFunctionName(context.signature);
    
    switch (functionName) {
      case 'setApprovalForAll':
        return this.decodeSetApprovalForAll(context);
      
      case 'setName':
        return this.decodeSetName(context);
      
      default:
        return null;
    }
  }
  
  /**
   * Decode setApprovalForAll(address,bool) - common in ERC721/ERC1155
   */
  private decodeSetApprovalForAll(context: TransactionContext): InterpretedTransaction {
    const data = context.calldata.startsWith('0x') ? context.calldata.substring(2) : context.calldata;
    
    // First param: operator address (32 bytes, last 20 are the address)
    const operatorHex = data.substring(0, 64);
    const operator = '0x' + operatorHex.substring(24);
    
    // Second param: approved bool (32 bytes, last byte is the bool)
    const approvedHex = data.substring(64, 128);
    const approved = approvedHex.endsWith('1');
    
    // Check if operator is a Nouns contract
    const nounsContractName = this.getNounsContractName(operator);
    const operatorDisplay = nounsContractName 
      ? `${nounsContractName.replace(/([A-Z])/g, ' $1').trim().replace('Nouns', '').trim()}`
      : `${operator.substring(0, 6)}...${operator.substring(38)}`;
    
    return {
      target: context.target,
      contractName: this.contractName,
      contractDescription: 'NFT contract',
      isKnownContract: false,
      functionName: 'setApprovalForAll',
      functionSignature: context.signature,
      functionDescription: approved ? 'Approve operator to manage all tokens' : 'Revoke operator approval',
      value: context.value,
      valueFormatted: this.formatEthValue(context.value),
      parameters: [
        {
          name: 'operator',
          type: 'address',
          value: operator,
          displayValue: operator,
          isRecipient: true,
          recipientRole: 'Operator',
          format: 'address',
        },
        {
          name: 'approved',
          type: 'bool',
          value: approved,
          displayValue: approved ? 'true' : 'false',
          isRecipient: false,
          format: 'boolean',
        },
      ],
      calldata: context.calldata,
      summary: approved 
        ? `Approve ${operatorDisplay} to manage all NFTs`
        : `Revoke approval for ${operatorDisplay}`,
      category: 'ownership',
      severity: 'normal',
      addressesToResolve: nounsContractName ? [] : [operator],
    };
  }
  
  /**
   * Decode setName(address,string,string,bytes32) - ENS resolver
   */
  private decodeSetName(context: TransactionContext): InterpretedTransaction {
    const data = context.calldata.startsWith('0x') ? context.calldata.substring(2) : context.calldata;
    
    // Parse parameters manually
    // Param 0: address (32 bytes)
    const addressHex = data.substring(0, 64);
    const targetAddress = '0x' + addressHex.substring(24);
    
    // Param 1: string offset (32 bytes) - points to where string data starts
    // Param 2: string offset (32 bytes) - points to where second string data starts
    // Param 3: bytes32 (32 bytes)
    
    // Get the first string (subdomain like "auction", "candidates", etc.)
    const string1Offset = parseInt(data.substring(64, 128), 16) * 2;
    const string1Length = parseInt(data.substring(string1Offset, string1Offset + 64), 16) * 2;
    const string1Hex = data.substring(string1Offset + 64, string1Offset + 64 + string1Length);
    const subdomain = this.hexToString(string1Hex);
    
    // Get the second string (domain like "nouns.eth")
    const string2Offset = parseInt(data.substring(128, 192), 16) * 2;
    const string2Length = parseInt(data.substring(string2Offset, string2Offset + 64), 16) * 2;
    const string2Hex = data.substring(string2Offset + 64, string2Offset + 64 + string2Length);
    const domain = this.hexToString(string2Hex);
    
    const fullName = subdomain ? `${subdomain}.${domain}` : domain;
    
    // Check if target is a Nouns contract
    const nounsContractName = this.getNounsContractName(targetAddress);
    const targetDisplay = nounsContractName
      ? nounsContractName.replace(/([A-Z])/g, ' $1').trim().replace('Nouns', '').trim()
      : `${targetAddress.substring(0, 6)}...${targetAddress.substring(38)}`;
    
    return {
      target: context.target,
      contractName: 'ENS Resolver',
      contractDescription: 'Ethereum Name Service',
      isKnownContract: false,
      functionName: 'setName',
      functionSignature: context.signature,
      functionDescription: `Set ENS name for contract`,
      value: context.value,
      valueFormatted: this.formatEthValue(context.value),
      parameters: [
        {
          name: 'target',
          type: 'address',
          value: targetAddress,
          displayValue: targetAddress,
          isRecipient: false,
          format: 'address',
        },
        {
          name: 'subdomain',
          type: 'string',
          value: subdomain,
          displayValue: subdomain,
          isRecipient: false,
          format: 'text',
        },
        {
          name: 'domain',
          type: 'string',
          value: domain,
          displayValue: domain,
          isRecipient: false,
          format: 'text',
        },
      ],
      calldata: context.calldata,
      summary: `Set ENS name "${fullName}" for ${targetDisplay}`,
      category: 'configuration',
      severity: 'normal',
      addressesToResolve: nounsContractName ? [] : [targetAddress],
    };
  }
  
  /**
   * Convert hex string to UTF-8 string
   */
  private hexToString(hex: string): string {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      const charCode = parseInt(hex.substring(i, i + 2), 16);
      if (charCode !== 0) {
        str += String.fromCharCode(charCode);
      }
    }
    return str;
  }
  
  /**
   * Check if address is a Nouns contract and return its name
   */
  private getNounsContractName(address: string): string | null {
    // Import at runtime to avoid circular dependencies
    try {
      const { getContractName } = require('@/app/lib/Nouns/Contracts/utils/addresses');
      return getContractName(address);
    } catch {
      return null;
    }
  }
  
  /**
   * Interpret common ERC20 functions without needing full ABI
   */
  private interpretCommonERC20(context: TransactionContext): InterpretedTransaction | null {
    const functionName = this.extractFunctionName(context.signature);
    
    switch (functionName) {
      case 'deposit':
        return this.interpretWETHDeposit(context);
      
      case 'withdraw':
        return this.interpretWETHWithdraw(context);
      
      case 'transfer':
        return this.interpretERC20Transfer(context);
      
      case 'approve':
        return this.interpretERC20Approve(context);
      
      default:
        return null;
    }
  }
  
  private interpretWETHDeposit(context: TransactionContext): InterpretedTransaction {
    // Format ETH value as decimal number
    const ethValue = Number(context.value) / 1e18;
    const formattedAmount = ethValue.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    const known = KNOWN_EXTERNAL_CONTRACTS[this.contractAddress.toLowerCase()];
    
    return {
      target: context.target,
      contractName: this.contractName,
      contractDescription: known?.description || 'External contract',
      isKnownContract: false,
      functionName: 'deposit',
      functionSignature: context.signature,
      functionDescription: 'Wrap ETH into WETH (ERC-20 wrapped ether)',
      value: context.value,
      valueFormatted: this.formatEthValue(context.value),
      parameters: [],
      calldata: context.calldata,
      summary: `Wrap ${formattedAmount} ETH into WETH`,
      category: 'token',
      severity: 'normal',
      addressesToResolve: [],
    };
  }
  
  private interpretWETHWithdraw(context: TransactionContext): InterpretedTransaction {
    // Decode amount from calldata (first 32 bytes after selector)
    const calldata = context.calldata.startsWith('0x') ? context.calldata : '0x' + context.calldata;
    const amountHex = calldata.substring(10, 74); // Skip selector (10 chars), take 64 chars
    const amount = BigInt('0x' + amountHex);
    const ethValue = Number(amount) / 1e18;
    const formattedAmount = ethValue.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    const known = KNOWN_EXTERNAL_CONTRACTS[this.contractAddress.toLowerCase()];
    
    return {
      target: context.target,
      contractName: this.contractName,
      contractDescription: known?.description || 'External contract',
      isKnownContract: false,
      functionName: 'withdraw',
      functionSignature: context.signature,
      functionDescription: 'Unwrap WETH back into ETH',
      value: context.value,
      valueFormatted: this.formatEthValue(context.value),
      parameters: [{
        name: 'amount',
        type: 'uint256',
        value: amount,
        displayValue: `${formattedAmount} WETH`,
        isRecipient: false,
        format: 'amount',
        decimals: 18,
        symbol: 'WETH',
      }],
      calldata: context.calldata,
      summary: `Unwrap ${formattedAmount} WETH to ETH`,
      category: 'token',
      severity: 'normal',
      addressesToResolve: [],
    };
  }
  
  private interpretERC20Transfer(context: TransactionContext): InterpretedTransaction {
    // Decode recipient and amount from calldata
    // Calldata format: 0x[param1: 64 chars][param2: 64 chars]
    const calldata = context.calldata.startsWith('0x') ? context.calldata : '0x' + context.calldata;
    
    // Remove '0x' prefix for easier indexing
    const data = calldata.substring(2);
    
    // First parameter (recipient): first 64 chars
    // Address is the last 40 hex chars (20 bytes) of the 64-char parameter
    const recipientHex = data.substring(0, 64);
    const recipient = '0x' + recipientHex.substring(24); // Skip 24 leading zeros, take last 40 chars
    
    // Second parameter (amount): next 64 chars
    const amountHex = data.substring(64, 128);
    const amount = BigInt('0x' + amountHex);
    
    const known = KNOWN_EXTERNAL_CONTRACTS[this.contractAddress.toLowerCase()];
    const decimals = this.contractName === 'USDC' ? 6 : 18;
    const symbol = this.contractName === 'WETH' ? 'WETH' : (this.contractName === 'USDC' ? 'USDC' : 'tokens');
    
    // Format amount - for USDC show as $, for WETH/ETH show as decimal with symbol
    let formattedAmount: string;
    if (decimals === 6) {
      formattedAmount = `$${(Number(amount) / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      // For WETH/ETH, just show the number without symbol (we'll add symbol separately)
      const ethValue = Number(amount) / 1e18;
      formattedAmount = ethValue.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    }
    
    const displayAddress = `${recipient.substring(0, 6)}...${recipient.substring(38)}`;
    
    // Detect if this is funding a stream contract (common pattern)
    const isStreamFunding = this.isLikelyStreamContract(recipient);
    const recipientRole = isStreamFunding ? 'Stream Contract (funding)' : 'Recipient';
    const description = isStreamFunding 
      ? `Fund payment stream with ${symbol}` 
      : `Transfer ${symbol} tokens`;
    const summary = isStreamFunding
      ? `Fund stream contract ${displayAddress} with ${formattedAmount} ${symbol}`
      : `Transfer ${formattedAmount} ${symbol} to ${displayAddress}`;
    
    return {
      target: context.target,
      contractName: this.contractName,
      contractDescription: known?.description || 'External contract',
      isKnownContract: false,
      functionName: 'transfer',
      functionSignature: context.signature,
      functionDescription: description,
      value: context.value,
      valueFormatted: this.formatEthValue(context.value),
      parameters: [
        {
          name: 'recipient',
          type: 'address',
          value: recipient,
          displayValue: recipient,
          isRecipient: true,
          recipientRole,
          format: 'address',
        },
        {
          name: 'amount',
          type: 'uint256',
          value: amount,
          displayValue: `${formattedAmount} ${symbol}`,
          isRecipient: false,
          format: 'amount',
          decimals,
          symbol,
        },
      ],
      calldata: context.calldata,
      summary,
      category: isStreamFunding ? 'stream' : 'payment',
      severity: 'normal',
      addressesToResolve: [recipient],
    };
  }
  
  /**
   * Heuristic to detect if an address is likely a stream contract
   * Stream contracts typically have specific bytecode patterns
   * For now, we'll mark addresses that don't resolve to ENS as potential stream contracts
   */
  private isLikelyStreamContract(address: string): boolean {
    // This is a simple heuristic - in a real implementation you might:
    // 1. Check if the address was mentioned in a previous createStream action
    // 2. Query the blockchain to see if it's a contract
    // 3. Check against known stream factory patterns
    
    // For now, we'll return false and let the component layer handle cross-referencing
    // The StreamFactoryInterpreter marks predictedStreamAddress, so ActionDisplay can detect the pattern
    return false;
  }
  
  private interpretERC20Approve(context: TransactionContext): InterpretedTransaction {
    // Decode spender and amount from calldata
    // Calldata format: 0x[param1: 64 chars][param2: 64 chars]
    const calldata = context.calldata.startsWith('0x') ? context.calldata : '0x' + context.calldata;
    
    // Remove '0x' prefix for easier indexing
    const data = calldata.substring(2);
    
    // First parameter (spender): first 64 chars
    const spenderHex = data.substring(0, 64);
    const spender = '0x' + spenderHex.substring(24); // Skip 24 leading zeros
    
    // Second parameter (amount): next 64 chars
    const amountHex = data.substring(64, 128);
    const amount = BigInt('0x' + amountHex);
    
    const known = KNOWN_EXTERNAL_CONTRACTS[this.contractAddress.toLowerCase()];
    const symbol = this.contractName === 'WETH' ? 'WETH' : (this.contractName === 'USDC' ? 'USDC' : 'tokens');
    const displayAddress = `${spender.substring(0, 6)}...${spender.substring(38)}`;
    
    // Check for infinite approval
    const isInfinite = amount === BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
    const amountDisplay = isInfinite ? 'unlimited' : amount.toString();
    
    return {
      target: context.target,
      contractName: this.contractName,
      contractDescription: known?.description || 'External contract',
      isKnownContract: false,
      functionName: 'approve',
      functionSignature: context.signature,
      functionDescription: `Approve ${symbol} spending`,
      value: context.value,
      valueFormatted: this.formatEthValue(context.value),
      parameters: [
        {
          name: 'spender',
          type: 'address',
          value: spender,
          displayValue: spender,
          isRecipient: true,
          recipientRole: 'Approved Spender',
          format: 'address',
        },
        {
          name: 'amount',
          type: 'uint256',
          value: amount,
          displayValue: amountDisplay,
          isRecipient: false,
          format: 'amount',
        },
      ],
      calldata: context.calldata,
      summary: `Approve ${displayAddress} to spend ${amountDisplay} ${symbol}`,
      category: 'token',
      severity: isInfinite ? 'elevated' : 'normal',
      addressesToResolve: [spender],
    };
  }
  
  extractAddresses(context: TransactionContext): string[] {
    const addresses: string[] = [];
    
    // Add target if it's an ETH transfer
    if (!context.signature && context.value && context.value !== '0') {
      addresses.push(context.target);
      return addresses;
    }
    
    // Try to extract from ABI if available
    if (this.abi && this.interface) {
      try {
        const functionName = this.extractFunctionName(context.signature);
        const decoded = this.decodeParameters(context.signature, context.calldata);
        const fragment = this.interface.getFunction(functionName);
        
        if (fragment) {
          fragment.inputs.forEach((input, idx) => {
            if (input.baseType === 'address' && decoded[idx]) {
              addresses.push(decoded[idx] as string);
            }
          });
        }
      } catch (error) {
        // Silently fail - no addresses to extract
      }
    }
    
    return addresses;
  }
  
  private interpretETHTransfer(context: TransactionContext): InterpretedTransaction {
    const valueFormatted = this.formatEthValue(context.value);
    
    // Format address for display (truncate middle)
    const displayAddress = `${context.target.substring(0, 6)}...${context.target.substring(38)}`;
    
    return {
      target: context.target,
      contractName: this.contractName,
      contractDescription: 'External contract or EOA',
      isKnownContract: false,
      functionName: '',
      functionSignature: '',
      functionDescription: 'Direct ETH transfer',
      value: context.value,
      valueFormatted,
      parameters: [],
      calldata: context.calldata,
      summary: `Transfer ${valueFormatted} to ${displayAddress}`,
      category: 'payment',
      severity: 'normal',
      addressesToResolve: [context.target],
    };
  }
  
  private interpretWithABI(context: TransactionContext): InterpretedTransaction {
    try {
      const functionName = this.extractFunctionName(context.signature);
      const decoded = this.decodeParameters(context.signature, context.calldata);
      const fragment = this.interface!.getFunction(functionName);
      
      if (!fragment) {
        return this.interpretRaw(context);
      }
      
      const parameters: InterpretedParameter[] = fragment.inputs.map((input, idx) => {
        const value = decoded[idx];
        const isAddress = input.baseType === 'address';
        
        return {
          name: input.name || `param${idx}`,
          type: input.type,
          value,
          displayValue: this.formatDisplayValue(value, input.baseType),
          isRecipient: isAddress && idx === 0, // Assume first address is recipient
          recipientRole: isAddress && idx === 0 ? 'Recipient' : undefined,
          format: this.getDisplayFormat(input.baseType),
        };
      });
      
      const addressesToResolve = parameters
        .filter(p => p.isRecipient)
        .map(p => p.value as string);
      
      return {
        target: context.target,
        contractName: this.contractName,
        contractDescription: 'External contract',
        isKnownContract: false,
        functionName,
        functionSignature: context.signature,
        functionDescription: `Call ${functionName} function`,
        value: context.value,
        valueFormatted: this.formatEthValue(context.value),
        parameters,
        calldata: context.calldata,
        summary: `Call ${functionName} on ${this.contractName}`,
        category: 'unknown',
        severity: 'normal',
        addressesToResolve,
      };
    } catch (error) {
      return this.interpretRaw(context);
    }
  }
  
  private interpretRaw(context: TransactionContext): InterpretedTransaction {
    const functionName = this.extractFunctionName(context.signature);
    
    return {
      target: context.target,
      contractName: this.contractName,
      contractDescription: 'Unknown or unverified contract',
      isKnownContract: false,
      functionName: functionName || 'unknown',
      functionSignature: context.signature,
      functionDescription: 'Raw contract call (ABI not available)',
      value: context.value,
      valueFormatted: this.formatEthValue(context.value),
      parameters: [],
      calldata: context.calldata,
      summary: `Call ${functionName || 'function'} on ${this.contractName}`,
      category: 'unknown',
      severity: 'normal',
      addressesToResolve: [],
    };
  }
  
  private extractFunctionName(signature: string): string {
    if (!signature) return '';
    const match = signature.match(/^([^(]+)\(/);
    return match ? match[1] : signature;
  }
  
  private decodeParameters(signature: string, calldata: string): Result {
    if (!this.interface) throw new Error('No ABI available');
    
    const fragment = this.interface.getFunction(signature);
    if (!fragment) throw new Error('Function not found in ABI');
    
    const normalizedCalldata = calldata.startsWith('0x') ? calldata : '0x' + calldata;
    const selector = fragment.selector;
    
    const dataToDecod = normalizedCalldata.toLowerCase().startsWith(selector.toLowerCase())
      ? normalizedCalldata
      : selector + normalizedCalldata.substring(2);
    
    return this.interface.decodeFunctionData(fragment, dataToDecod);
  }
  
  private formatEthValue(value: string): string {
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
  
  private formatDisplayValue(value: any, baseType: string): string {
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
    
    return String(value);
  }
  
  private getDisplayFormat(baseType: string): InterpretedParameter['format'] {
    if (baseType === 'address') return 'address';
    if (baseType === 'uint256' || baseType === 'int256') return 'amount';
    if (baseType === 'bool') return 'boolean';
    if (baseType === 'bytes' || baseType.startsWith('bytes')) return 'bytes';
    return 'text';
  }
}

