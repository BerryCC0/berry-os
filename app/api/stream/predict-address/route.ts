/**
 * Predict Stream Address API
 * 
 * Calls the StreamFactory.predictStreamAddress() view function to compute
 * the deterministic address where a stream will be created.
 */

import { NextRequest, NextResponse } from 'next/server';
import { encodeFunctionData, createPublicClient, http, decodeFunctionResult } from 'viem';
import { mainnet } from 'viem/chains';
import { StreamFactoryABI } from '@/app/lib/Nouns/Contracts/abis/StreamFactory';

const STREAM_FACTORY_ADDRESS = '0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff';

// Create a public client for Ethereum mainnet
const client = createPublicClient({
  chain: mainnet,
  transport: http(process.env.RPC_URL || 'https://eth.llamarpc.com')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { msgSender, payer, recipient, tokenAmount, tokenAddress, startTime, stopTime } = body;

    // Validate required fields
    if (!msgSender || !payer || !recipient || !tokenAmount || !tokenAddress || !startTime || !stopTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call the contract using viem
    const predictedAddress = await client.readContract({
      address: STREAM_FACTORY_ADDRESS,
      abi: StreamFactoryABI,
      functionName: 'predictStreamAddress',
      args: [
        msgSender as `0x${string}`,
        payer as `0x${string}`,
        recipient as `0x${string}`,
        BigInt(tokenAmount),
        tokenAddress as `0x${string}`,
        BigInt(startTime),
        BigInt(stopTime)
      ]
    });

    return NextResponse.json({ 
      success: true, 
      predictedAddress 
    });
  } catch (error) {
    console.error('Error predicting stream address:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to predict stream address' },
      { status: 500 }
    );
  }
}

