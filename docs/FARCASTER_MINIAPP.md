# Farcaster Mini App Integration

Nouns OS is now a **Farcaster Mini App**! This means it can be launched directly from Farcaster feeds and interact with users' connected wallets.

## 🎉 What's Integrated

### 1. **Farcaster Mini App SDK**
- ✅ SDK loads and calls `ready()` when app is ready
- ✅ User context (FID, username, display name, pfp)
- ✅ Location context (where in Farcaster the app was opened)
- ✅ Mini App actions (open URL, close app)

### 2. **Wallet Integration**
- ✅ Farcaster Mini App Wagmi connector
- ✅ Auto-connects to user's wallet in Farcaster
- ✅ Works with existing Reown/Wagmi setup
- ✅ EVM chains supported (Ethereum, Base, etc.)

### 3. **Solana Support**
- ✅ Farcaster Solana Provider integrated
- ✅ Ready for Solana wallets when available
- ✅ Placeholder hooks for Solana functionality

### 4. **Manifest & Metadata**
- ✅ `farcaster.json` manifest at `/.well-known/farcaster.json`
- ✅ Frame metadata (`fc:frame`) for embeds
- ✅ Launch button configuration
- ✅ Splash screen setup

## 📁 File Structure

```
lib/farcaster/
├── MiniAppProvider.tsx     ← Mini App SDK wrapper
├── SolanaProvider.tsx      ← Solana wallet support
└── hooks.ts                ← Convenient hooks

public/
└── .well-known/
    └── farcaster.json      ← Manifest file (needs signing!)

app/
└── layout.tsx              ← All providers wrapped
```

## 🔧 How It Works

### Provider Stack

```tsx
<MiniAppProvider>            {/* Farcaster SDK */}
  <SolanaProvider>          {/* Solana wallets */}
    <Appkit>                {/* EVM wallets */}
      <ApolloProvider>      {/* GraphQL */}
        <NeynarProvider>    {/* Farcaster data */}
          <App />
        </NeynarProvider>
      </ApolloProvider>
    </Appkit>
  </SolanaProvider>
</MiniAppProvider>
```

### Using in Components

```typescript
import { useFarcasterMiniApp } from '@/lib/farcaster/hooks';

function MyComponent() {
  const { user, isSDKLoaded, actions } = useFarcasterMiniApp();
  
  if (!isSDKLoaded) return <div>Loading...</div>;
  
  return (
    <div>
      <p>Welcome, {user?.displayName}!</p>
      <p>FID: {user?.fid}</p>
      <button onClick={() => actions.close()}>Close</button>
    </div>
  );
}
```

### Available Hooks

```typescript
// Get user info
const { user, fid, username, displayName, pfpUrl } = useFarcasterUser();

// Get location context
const { location } = useFarcasterLocation();

// Perform actions
const { openUrl, close, ready } = useFarcasterActions();

// Check if in Farcaster
const inFarcaster = isInFarcaster();

// All in one
const miniApp = useFarcasterMiniApp();
```

## 🚀 Publishing Steps

### 1. Update Manifest URLs

Edit `/public/.well-known/farcaster.json` and replace all URLs with your production domain:

```json
{
  "miniapp": {
    "version": "1",
    "name": "Nouns OS",
    "iconUrl": "https://YOUR-DOMAIN.com/icons/apps/berry.svg",
    "homeUrl": "https://YOUR-DOMAIN.com",
    "imageUrl": "https://YOUR-DOMAIN.com/icons/apps/berry.svg",
    "buttonTitle": "Launch Nouns OS",
    "splashImageUrl": "https://YOUR-DOMAIN.com/icons/apps/berry.svg",
    "splashBackgroundColor": "#FFFFFF"
  }
}
```

### 2. Sign the Manifest

Once your app is deployed and serving the manifest:

1. Go to https://warpcast.com/~/developers/frames (on desktop)
2. Enter your domain URL
3. Scroll to bottom and click **"Claim Ownership"**
4. Follow the steps to sign with your Farcaster custody address
5. Copy the full signed manifest
6. Update `/public/.well-known/farcaster.json` with the signed version

The signed manifest will look like:

```json
{
  "accountAssociation": {
    "header": "eyJmaWQ...",
    "payload": "eyJkb21...",
    "signature": "MHgwZmJ..."
  },
  "miniapp": {
    "version": "1",
    "name": "Nouns OS",
    ...
  }
}
```

### 3. Update Frame Metadata

Edit `/app/layout.tsx` and update the `frameMetadata` URLs:

```typescript
const frameMetadata = {
  version: "next",
  imageUrl: "https://YOUR-DOMAIN.com/icons/apps/berry.svg",
  button: {
    title: "Launch Nouns OS",
    action: {
      type: "launch_miniapp",
      name: "Nouns OS",
      url: "https://YOUR-DOMAIN.com",
      splashImageUrl: "https://YOUR-DOMAIN.com/icons/apps/berry.svg",
      splashBackgroundColor: "#FFFFFF"
    }
  }
};
```

### 4. Test the Integration

1. Deploy your app to production
2. Verify manifest is accessible at `https://YOUR-DOMAIN.com/.well-known/farcaster.json`
3. Cast a link to your app on Warpcast
4. The frame should appear with a "Launch Nouns OS" button
5. Click the button to launch the Mini App

## 🔍 Debugging

### Check if SDK is loaded:

```typescript
const { isSDKLoaded } = useMiniApp();
console.log('SDK loaded:', isSDKLoaded);
```

### Check if running in Farcaster:

```typescript
const inFarcaster = isInFarcaster();
console.log('In Farcaster:', inFarcaster);
```

### Verify manifest:

```bash
curl https://YOUR-DOMAIN.com/.well-known/farcaster.json
```

## 📚 Resources

- [Farcaster Mini Apps Docs](https://docs.neynar.com/docs/convert-web-app-to-mini-app)
- [Mini App SDK](https://github.com/farcasterxyz/miniapp-sdk)
- [Manifest Tool](https://warpcast.com/~/developers/frames)
- [Frame Validator](https://warpcast.com/~/developers/frames)

## ⚠️ Important Notes

1. **Manifest Signing**: The manifest MUST be signed with your Farcaster custody address
2. **Production URLs**: All URLs in manifest and metadata must point to your production domain
3. **HTTPS Required**: Mini Apps must be served over HTTPS
4. **Wallet Connection**: Users must have their wallet connected in Farcaster
5. **Testing**: Test in Warpcast before sharing publicly

## 🎯 Next Steps

1. ✅ Deploy to production
2. ⏳ Update all URLs in manifest and metadata
3. ⏳ Sign the manifest with custody address
4. ⏳ Test Mini App launch in Warpcast
5. ⏳ Share with the community!

---

**Nouns OS is now ready to be a Farcaster Mini App!** 🎉

