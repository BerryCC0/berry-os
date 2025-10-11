/**
 * Recipient Identifier
 * 
 * Identifies which parameters in a function call represent recipient addresses
 * These addresses should be resolved to ENS names for better UX
 */

/**
 * Identify if a parameter is a recipient address based on function context
 */
export function isRecipientParameter(
  functionName: string,
  paramName: string,
  paramType: string,
  paramIndex: number
): boolean {
  if (paramType !== 'address') return false;
  
  // Common recipient functions and their recipient parameter positions
  const recipientFunctions: Record<string, number[]> = {
    // ERC20/Token transfers
    'transfer': [0], // recipient is first param
    'transferFrom': [1], // 'to' is second param (from, to, amount/tokenId)
    'send': [0],
    'safeTransfer': [1],
    'safeTransferFrom': [1],
    
    // Payment functions
    'sendOrRegisterDebt': [0], // account is first param
    'pay': [0],
    'sendPayment': [0],
    
    // Approval functions
    'approve': [0], // spender is recipient
    'setApprovalForAll': [0],
    
    // Delegation
    'delegate': [0], // delegatee is recipient
    'delegateBySig': [0],
    
    // Minting
    'mint': [0],
    'mintTo': [0],
    'safeMint': [0],
    
    // Admin functions
    'transferOwnership': [0],
    'grantRole': [1], // role, account
  };
  
  // Check if function has known recipient positions
  if (recipientFunctions[functionName]?.includes(paramIndex)) {
    return true;
  }
  
  // Check by parameter name (case-insensitive)
  const recipientParamNames = [
    'recipient',
    'to',
    'account',
    'spender',
    'delegatee',
    'receiver',
    'beneficiary',
    'owner',
    'newowner',
    'target',
    'destination',
  ];
  
  return recipientParamNames.includes(paramName.toLowerCase());
}

/**
 * Extract all recipient addresses from decoded parameters
 */
export function extractRecipientAddresses(
  functionName: string,
  parameters: Array<{ name: string; type: string; value: any }>
): string[] {
  const recipients: string[] = [];
  
  parameters.forEach((param, index) => {
    if (isRecipientParameter(functionName, param.name, param.type, index)) {
      // Handle both single addresses and address arrays
      if (typeof param.value === 'string' && param.value.startsWith('0x')) {
        recipients.push(param.value);
      } else if (Array.isArray(param.value)) {
        param.value.forEach(val => {
          if (typeof val === 'string' && val.startsWith('0x')) {
            recipients.push(val);
          }
        });
      }
    }
  });
  
  return recipients;
}

/**
 * Check if a function is a payment/transfer function
 */
export function isPaymentFunction(functionName: string): boolean {
  const paymentFunctions = [
    'transfer',
    'transferFrom',
    'send',
    'sendOrRegisterDebt',
    'pay',
    'sendPayment',
    'safeTransfer',
    'safeTransferFrom',
  ];
  
  return paymentFunctions.includes(functionName);
}

/**
 * Check if a function is a delegation function
 */
export function isDelegationFunction(functionName: string): boolean {
  const delegationFunctions = [
    'delegate',
    'delegateBySig',
  ];
  
  return delegationFunctions.includes(functionName);
}

/**
 * Get human-readable description of what a recipient parameter represents
 */
export function getRecipientRole(functionName: string, paramName: string): string {
  const lowerName = paramName.toLowerCase();
  
  // Specific role descriptions
  if (lowerName.includes('spender')) return 'Approved Spender';
  if (lowerName.includes('delegatee')) return 'Voting Delegate';
  if (lowerName.includes('owner')) return 'New Owner';
  if (lowerName.includes('beneficiary')) return 'Beneficiary';
  
  // Function-based descriptions
  if (isPaymentFunction(functionName)) return 'Recipient';
  if (isDelegationFunction(functionName)) return 'Delegate';
  if (functionName.includes('mint')) return 'Recipient';
  if (functionName.includes('burn')) return 'From';
  
  return 'Address';
}



