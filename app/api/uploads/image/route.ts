/**
 * API route for image uploads to IPFS
 * Uses Web3.Storage free public gateway (no API key needed)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyMessage } from 'viem';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const walletAddress = formData.get('walletAddress') as string;
    const signature = formData.get('signature') as string;
    const timestamp = formData.get('timestamp') as string;
    const service = formData.get('service') as string;

    if (!file || !walletAddress || !signature || !timestamp) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be less than 10MB' }, { status: 400 });
    }

    // Verify wallet signature
    // Message must match exactly what was signed on client
    const message = `Upload ${file.name} to IPFS at ${timestamp}`;
    const isValid = await verifyMessage({
      address: walletAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!isValid) {
      console.error('Signature verification failed:', {
        walletAddress,
        message,
        signature,
        timestamp,
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Upload to IPFS via Pinata
    try {
      const fileBuffer = await file.arrayBuffer();
      const blob = new Blob([fileBuffer], { type: file.type });

      // Use Pinata's pinFileToIPFS API
      const uploadFormData = new FormData();
      uploadFormData.append('file', blob, file.name);

      const pinataJWT = process.env.PINATA_JWT || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzODdkOWNjNS0wNDZmLTQxMTgtYmI2NC1jMGE1YWQyZjY0ZmYiLCJlbWFpbCI6Iml3eWxpZTk1OUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNDExOTAxYmE4OTBiNmFiZDIyMDciLCJzY29wZWRLZXlTZWNyZXQiOiJmZTIyMjU2ZDc2MzA4ZGEzZTE1MGU2NDRjMWRjODcyY2Q0YzUxNGU2NDFiYmI5ZTBmOWYxYTdjNzJlOThkMjRiIiwiZXhwIjoxNzkyMjI0NTU2fQ.0cC-v6XKG1-LyUMl4toK4_CdWiiWr6IcNzsql82WGhI';

      const uploadResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pinataJWT}`,
        },
        body: uploadFormData,
      });

      if (uploadResponse.ok) {
        const data = await uploadResponse.json();
        const cid = data.IpfsHash;
        const url = `https://gateway.pinata.cloud/ipfs/${cid}`;

        return NextResponse.json({
          success: true,
          cid,
          url,
          provider: 'ipfs-pinata',
        });
      } else {
        const errorData = await uploadResponse.json();
        console.error('Pinata upload failed:', errorData);
      }
    } catch (ipfsError) {
      console.warn('IPFS upload failed:', ipfsError);
    }

    // Fallback: Return base64 data URL if IPFS fails
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      id: `fallback_${Date.now()}`,
      provider: 'data-url',
      message: 'IPFS upload failed, using data URL fallback. Consider configuring Pinata API key.',
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

