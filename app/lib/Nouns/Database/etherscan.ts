/**
 * Etherscan API Client
 * Fetch transaction data and decode settler addresses
 */

const ETHERSCAN_API_URL = 'https://api.etherscan.io/api';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

// Rate limiting
const RATE_LIMIT_MS = 200; // 5 requests per second
let lastRequestTime = 0;

/**
 * Rate-limited delay to respect Etherscan API limits
 */
async function rateLimitedDelay(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await new Promise(resolve => 
      setTimeout(resolve, RATE_LIMIT_MS - timeSinceLastRequest)
    );
  }
  
  lastRequestTime = Date.now();
}

/**
 * Etherscan API response for transaction
 */
interface EtherscanTransaction {
  blockHash: string;
  blockNumber: string;
  from: string;
  gas: string;
  gasPrice: string;
  hash: string;
  input: string;
  nonce: string;
  to: string;
  transactionIndex: string;
  value: string;
  type: string;
  chainId: string;
  v: string;
  r: string;
  s: string;
}

/**
 * Etherscan API response wrapper
 */
interface EtherscanResponse<T> {
  status: string;
  message: string;
  result: T;
}

/**
 * Get transaction details from Etherscan
 */
export async function getTransactionByHash(
  txHash: string
): Promise<EtherscanTransaction | null> {
  try {
    if (!ETHERSCAN_API_KEY) {
      console.warn('ETHERSCAN_API_KEY not configured');
      return null;
    }

    // Rate limiting
    await rateLimitedDelay();

    const url = `${ETHERSCAN_API_URL}?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${ETHERSCAN_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Etherscan API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: EtherscanResponse<EtherscanTransaction> = await response.json();
    
    if (data.status === '0' && data.message !== 'OK') {
      console.error(`Etherscan API error: ${data.message}`);
      return null;
    }

    return data.result;
  } catch (error) {
    console.error('Error fetching transaction from Etherscan:', error);
    return null;
  }
}

/**
 * Extract settler address from auction settlement transaction
 * The settler is the address that called settleCurrentAndCreateNewAuction()
 */
export async function getSettlerAddress(txHash: string): Promise<string | null> {
  try {
    const tx = await getTransactionByHash(txHash);
    
    if (!tx) {
      return null;
    }

    // The 'from' field is the settler (msg.sender)
    return tx.from;
  } catch (error) {
    console.error('Error extracting settler address:', error);
    return null;
  }
}

/**
 * Batch fetch settler addresses for multiple transactions
 * Returns a map of txHash -> settler address
 */
export async function batchGetSettlerAddresses(
  txHashes: string[],
  progressCallback?: (completed: number, total: number) => void
): Promise<Map<string, string | null>> {
  const settlers = new Map<string, string | null>();
  
  for (let i = 0; i < txHashes.length; i++) {
    const txHash = txHashes[i];
    const settler = await getSettlerAddress(txHash);
    settlers.set(txHash, settler);
    
    if (progressCallback) {
      progressCallback(i + 1, txHashes.length);
    }
  }
  
  return settlers;
}

/**
 * Get transaction receipt from Etherscan
 * Useful for getting more detailed information about the transaction
 */
export async function getTransactionReceipt(
  txHash: string
): Promise<any | null> {
  try {
    if (!ETHERSCAN_API_KEY) {
      console.warn('ETHERSCAN_API_KEY not configured');
      return null;
    }

    // Rate limiting
    await rateLimitedDelay();

    const url = `${ETHERSCAN_API_URL}?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=${ETHERSCAN_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Etherscan API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: EtherscanResponse<any> = await response.json();
    
    if (data.status === '0' && data.message !== 'OK') {
      console.error(`Etherscan API error: ${data.message}`);
      return null;
    }

    return data.result;
  } catch (error) {
    console.error('Error fetching transaction receipt from Etherscan:', error);
    return null;
  }
}

/**
 * Verify that a transaction is an auction settlement
 * Checks that the 'to' address is the Nouns Auction House
 */
export function isAuctionSettlementTransaction(
  tx: EtherscanTransaction
): boolean {
  const AUCTION_HOUSE_ADDRESS = '0x830BD73E4184ceF73443C15111a1DF14e495C706';
  return tx.to.toLowerCase() === AUCTION_HOUSE_ADDRESS.toLowerCase();
}

/**
 * Get block timestamp from Etherscan
 */
export async function getBlockTimestamp(blockNumber: string): Promise<string | null> {
  try {
    if (!ETHERSCAN_API_KEY) {
      console.warn('ETHERSCAN_API_KEY not configured');
      return null;
    }

    // Rate limiting
    await rateLimitedDelay();

    const url = `${ETHERSCAN_API_URL}?module=block&action=getblockreward&blockno=${blockNumber}&apikey=${ETHERSCAN_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Etherscan API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: EtherscanResponse<{ timeStamp: string }> = await response.json();
    
    if (data.status === '0' && data.message !== 'OK') {
      console.error(`Etherscan API error: ${data.message}`);
      return null;
    }

    return data.result.timeStamp;
  } catch (error) {
    console.error('Error fetching block timestamp from Etherscan:', error);
    return null;
  }
}

