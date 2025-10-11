import { NextRequest, NextResponse } from 'next/server';

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const ETHERSCAN_API_URL = 'https://api.etherscan.io/api';

// In-memory cache for contract info (consider Redis for production)
const contractCache = new Map<string, ContractInfo>();

interface ContractInfo {
  name: string;
  abi: any[] | null;
  isVerified: boolean;
}

/**
 * GET /api/etherscan/contract?address=0x...
 * 
 * Fetches contract source code and ABI from Etherscan
 * Server-side only to keep API key secure
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  
  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter required' },
      { status: 400 }
    );
  }
  
  // Validate address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { error: 'Invalid Ethereum address format' },
      { status: 400 }
    );
  }
  
  const lowerAddress = address.toLowerCase();
  
  // Check cache first
  if (contractCache.has(lowerAddress)) {
    const cached = contractCache.get(lowerAddress)!;
    return NextResponse.json(cached, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  }
  
  // Check if API key is configured
  if (!ETHERSCAN_API_KEY) {
    console.warn('ETHERSCAN_API_KEY not configured');
    return NextResponse.json(
      {
        name: 'Unknown',
        abi: null,
        isVerified: false,
      },
      { status: 200 }
    );
  }
  
  try {
    const response = await fetch(
      `${ETHERSCAN_API_URL}?module=contract&action=getsourcecode&address=${address}&apikey=${ETHERSCAN_API_KEY}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );
    
    if (!response.ok) {
      throw new Error(`Etherscan API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === '1' && data.result?.[0]) {
      const result = data.result[0];
      
      const contractInfo: ContractInfo = {
        name: result.ContractName || 'Unknown',
        abi: result.ABI !== 'Contract source code not verified' 
          ? JSON.parse(result.ABI) 
          : null,
        isVerified: result.ABI !== 'Contract source code not verified',
      };
      
      // Cache the result
      contractCache.set(lowerAddress, contractInfo);
      
      return NextResponse.json(contractInfo, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      });
    }
    
    // No result found
    const notFoundInfo: ContractInfo = {
      name: 'Unknown',
      abi: null,
      isVerified: false,
    };
    
    contractCache.set(lowerAddress, notFoundInfo);
    return NextResponse.json(notFoundInfo);
    
  } catch (error) {
    console.error('Etherscan API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch contract information',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Rate limit info endpoint
 * GET /api/etherscan/contract/info
 */
export async function HEAD() {
  return NextResponse.json({
    cacheSize: contractCache.size,
    apiKeyConfigured: !!ETHERSCAN_API_KEY,
  });
}



