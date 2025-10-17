# Image Upload System - Pinata IPFS Integration

## Overview

A clean, simple image upload system for the Camp proposal editor that uploads images to IPFS via Pinata with wallet-signed authentication.

## Architecture

### Components

1. **`app/lib/uploads/pinataUpload.ts`** - Upload utility
   - Single function: `uploadImageToPinata()`
   - Handles wallet signing and API communication
   - Progress callbacks for UI updates

2. **`app/api/uploads/image/route.ts`** - API endpoint
   - Verifies wallet signatures
   - Uploads to Pinata using JWT auth
   - Returns IPFS URL and CID

3. **`app/api/uploads/test/route.ts`** - Test endpoint
   - Visit `/api/uploads/test` to verify Pinata connection
   - Shows authentication status

4. **`MarkdownEditor.tsx`** - UI Integration
   - Drag & drop support via `react-dropzone`
   - Paste handling to intercept pasted images
   - Progress bar and error messages
   - Inserts markdown image syntax after upload

## Setup

### 1. Environment Variables

Add to `.env.local`:
```bash
PINATA_JWT=your_jwt_token_here
```

Get your JWT from: https://app.pinata.cloud

### 2. Restart Dev Server

After adding the JWT, restart:
```bash
npm run dev
```

### 3. Test Connection

Visit: `http://localhost:3000/api/uploads/test`

Should see:
```json
{
  "status": "success",
  "message": "Pinata connection successful!",
  "pinata": { ... }
}
```

## Usage

### Drag & Drop
1. Open Camp → Create tab
2. Connect your wallet
3. Drag an image into the markdown editor
4. Sign the wallet message
5. Image uploads to IPFS and inserts as: `![image.png](https://gateway.pinata.cloud/ipfs/Qm...)`

### Paste
1. Copy an image to clipboard
2. Paste into the markdown editor (Ctrl/Cmd + V)
3. Same upload flow as drag & drop

### Upload Button
1. Click 🖼️ Upload button in toolbar
2. Select image from file picker
3. Same upload flow

## Features

✅ **Wallet-signed uploads** - No API keys exposed in browser
✅ **IPFS permanent storage** - Images stored on IPFS via Pinata
✅ **Progress tracking** - Real-time upload status
✅ **Image validation** - Max 10MB, images only
✅ **Paste support** - Intercepts pasted images
✅ **Drag & drop** - Uses react-dropzone
✅ **Signature verification** - API verifies wallet signatures

## File Sizes & Limits

- **Max file size**: 10MB
- **Supported formats**: PNG, JPG, JPEG, GIF, WEBP, SVG
- **Pinata free tier**: 1GB storage, 100GB bandwidth/month

## Error Handling

The system gracefully handles:
- Signature rejection (user cancels)
- Network failures
- Invalid file types/sizes
- API errors
- Missing wallet connection

All errors show user-friendly messages in the editor.

## Security

1. **Wallet signatures** - Each upload requires a signed message
2. **Signature verification** - API verifies signature matches wallet
3. **Timestamp validation** - Prevents replay attacks
4. **File validation** - Server-side checks for type and size
5. **No exposed keys** - JWT stored in environment variables

## Future Enhancements

- [ ] Image optimization before upload
- [ ] Thumbnail generation
- [ ] Multiple image upload
- [ ] Upload queue management
- [ ] Image CDN integration
- [ ] Custom IPFS gateway support

## Troubleshooting

### "Missing required fields" error
- Check that PINATA_JWT is set in `.env.local`
- Restart dev server after adding environment variable

### Signature rejected
- User clicked "Cancel" on wallet signature request
- Try again and approve the signature

### Upload timeout
- Check internet connection
- Verify Pinata service status
- Try smaller file (< 5MB)

### Images not rendering
- Check browser console for errors
- Verify IPFS gateway is accessible
- Try different IPFS gateway URL

## API Routes

### POST `/api/uploads/image`
Upload an image to IPFS via Pinata

**Request:**
```
Content-Type: multipart/form-data

file: File
walletAddress: string
signature: string
timestamp: string
service: 'pinata'
```

**Response:**
```json
{
  "success": true,
  "cid": "QmXxx...",
  "url": "https://gateway.pinata.cloud/ipfs/QmXxx...",
  "provider": "ipfs-pinata"
}
```

### GET `/api/uploads/test`
Test Pinata authentication

**Response:**
```json
{
  "status": "success" | "error",
  "message": "...",
  "pinata": { ... }
}
```

