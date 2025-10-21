/**
 * Treasury Tokens API
 * Fetches ERC20 token holdings from Nouns DAO Treasury via Moralis API
 * Filters out spam tokens and only returns legitimate treasury holdings
 */

import { NextRequest, NextResponse } from 'next/server';

const NOUNS_TREASURY_ADDRESS = '0xb1a32FC9F9D8b2cf86C068Cae13108809547ef71';
const MORALIS_API_KEY = process.env.MORALIS_API_KEY;

// Whitelist of known legitimate tokens in Nouns Treasury
const LEGITIMATE_TOKENS = [
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', // stETH (Lido)
  '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', // wstETH (Wrapped stETH)
  '0xae78736Cd615f374D3085123A210448E74Fc6393', // rETH (Rocket Pool)
  '0xd5F7838F5C461fefF7FE49ea5eBAf7728bB0ADfa', // mETH (Mantle Staked ETH)
  '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
];

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(
      `https://deep-index.moralis.io/api/v2.2/${NOUNS_TREASURY_ADDRESS}/erc20?chain=eth`,
      {
        headers: {
          'X-API-Key': MORALIS_API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch tokens from Moralis');
    }

    const data = await response.json();
    
    // Filter and transform to our TokenInfo format
    const tokens = data
      .filter((token: any) => {
        // Only include whitelisted tokens
        const isWhitelisted = LEGITIMATE_TOKENS.some(
          addr => addr.toLowerCase() === token.token_address.toLowerCase()
        );
        
        // Additional spam filter: token must have a balance
        const hasBalance = token.balance && token.balance !== '0';
        
        return isWhitelisted && hasBalance;
      })
      .map((token: any) => ({
        symbol: token.symbol,
        address: token.token_address,
        decimals: token.decimals,
        balance: token.balance,
        name: token.name,
      }))
      .sort((a: any, b: any) => {
        // Sort by symbol alphabetically
        return a.symbol.localeCompare(b.symbol);
      });

    return NextResponse.json({ tokens });
  } catch (error) {
    console.error('Error fetching treasury tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch treasury tokens' },
      { status: 500 }
    );
  }
}

