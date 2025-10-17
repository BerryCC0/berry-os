/**
 * Pinata IPFS Upload Utility
 * Simple, wallet-signed image uploads to IPFS via Pinata
 */

export interface UploadProgress {
  percent: number;
  status: string;
}

export interface UploadResult {
  url: string;
  cid: string;
  provider: 'pinata';
}

export async function uploadImageToPinata(
  file: File,
  walletAddress: string,
  signMessage: (message: string) => Promise<string>,
  onProgress?: (percent: number, status: string) => void
): Promise<UploadResult> {
  // Validate image
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File must be less than 10MB');
  }

  // Step 1: Sign message with wallet
  onProgress?.(10, 'Requesting signature...');
  const timestamp = Date.now();
  const message = `Upload ${file.name} to IPFS at ${timestamp}`;
  
  let signature: string;
  try {
    signature = await signMessage(message);
  } catch (error) {
    throw new Error('Signature rejected. Please sign the message to upload.');
  }

  // Step 2: Upload to Pinata via our API route
  onProgress?.(30, 'Uploading to IPFS...');
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('walletAddress', walletAddress);
  formData.append('signature', signature);
  formData.append('timestamp', timestamp.toString());
  formData.append('service', 'pinata');

  const response = await fetch('/api/uploads/image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  const result = await response.json();
  
  onProgress?.(100, 'Upload complete!');

  return {
    url: result.url,
    cid: result.cid,
    provider: 'pinata',
  };
}

