# Farcaster Mini App SDK - Quick Reference

Quick lookup for common tasks.

## 🚀 Imports

```typescript
import {
  // Most common - complete hook
  useFarcasterMiniApp,
  
  // Specific hooks
  useFarcasterUser,
  useFarcasterLocation,
  useFarcasterActions,
  useFarcasterWallet,
  
  // Validation
  validateComposeCastOptions,
  validateOpenUrlOptions,
  
  // Formatting
  formatAddress,
  formatEther,
  getDisplayName,
  
  // URL Building
  buildProfileUrl,
  buildCastUrl,
  buildChannelUrl,
  buildMiniAppUrl,
  
  // Wallet
  getEthereumBalance,
  signEthereumMessage,
  requestEthereumAccounts,
  
  // Types
  type FarcasterUser,
  type MiniAppContext,
  type SDKCapability,
} from '@/app/lib/farcaster/utils';
```

## 📝 Common Patterns

### Get User Info
```typescript
const { user, location } = useFarcasterMiniApp();

// User data
user.fid              // User's FID
user.username         // Username (optional)
user.displayName      // Display name
user.pfpUrl           // Profile picture
user.mention          // "@username" or "fid:123"
user.formattedDisplayName  // Best display name

// Verification
user.hasVerifiedAddress    // Boolean
user.primaryVerification   // Primary address
user.allVerifications      // All verified addresses
```

### Check Location Context
```typescript
const { location } = useFarcasterMiniApp();

location.type          // 'cast' | 'channel' | 'profile' | ...
location.isFromCast    // Boolean
location.isFromChannel // Boolean
location.isFromProfile // Boolean
location.castHash      // If from cast
location.channelKey    // If from channel
location.profileFid    // If from profile
```

### Compose Cast
```typescript
const { actions } = useFarcasterMiniApp();

const options = {
  text: "Hello Farcaster!",
  channelKey: "nouns",
  embeds: ["https://example.com"],
};

// Validate first
const validation = validateComposeCastOptions(options);
if (!validation.valid) {
  alert(validation.error);
  return;
}

// Then compose
await actions.actions?.composeCast(options);
```

### Format Address
```typescript
const full = "0x1234567890abcdef1234567890abcdef12345678";
const short = formatAddress(full);  // "0x1234...5678"
const custom = formatAddress(full, 6);  // "0x123456...345678"
```

### Get Wallet Balance
```typescript
const { wallet } = useFarcasterWallet();
const provider = await wallet?.getEthereumProvider();

const balance = await getEthereumBalance(provider, address);
const eth = formatEther(balance);  // "1.5000"
```

### Build URLs
```typescript
// Profile
const profileUrl = buildProfileUrl(12345);
// "https://warpcast.com/~/profiles/12345"

// Cast
const castUrl = buildCastUrl("0xabc123...");
// "https://warpcast.com/~/conversations/0xabc123..."

// Channel
const channelUrl = buildChannelUrl("nouns");
// "https://warpcast.com/~/channel/nouns"

// Mini App with data
const appUrl = buildMiniAppUrl("https://app.com", { id: 123 });
// "https://app.com?miniAppData=eyJpZCI6MTIzfQ=="
```

### Sign Message
```typescript
const { wallet } = useFarcasterWallet();
const provider = await wallet?.getEthereumProvider();

const signature = await signEthereumMessage(
  provider,
  address,
  "Please sign this message"
);
```

### Navigate in Farcaster
```typescript
const { actions } = useFarcasterMiniApp();

// View profile
await actions.actions?.viewProfile({ fid: 12345 });

// View cast
await actions.actions?.viewCast({ hash: "0xabc..." });

// View channel
await actions.actions?.viewChannel({ channelKey: "nouns" });

// Open URL
await actions.actions?.openUrl({ url: "https://..." });

// Close app
await actions.actions?.close();
```

### Check Environment
```typescript
const { isInMiniApp, isInFarcaster } = useIsMiniApp();

if (!isInFarcaster) {
  return <div>Please open in Farcaster</div>;
}
```

### Extract Launch Data
```typescript
import { extractMiniAppData } from '@/app/lib/farcaster/utils';

// On component mount
const data = extractMiniAppData(window.location.href);
if (data) {
  console.log('Received data:', data);
}
```

### Share Current State
```typescript
const shareUrl = buildMiniAppUrl(window.location.origin, {
  itemId: 123,
  view: 'detail',
});

navigator.clipboard.writeText(shareUrl);
```

## ⚡ Error Handling

### Validate Before Action
```typescript
// Always validate user input
const validation = validateComposeCastOptions(options);
if (!validation.valid) {
  alert(validation.error);  // User-friendly error
  return;
}
```

### Handle Wallet Errors
```typescript
import { getWalletErrorMessage } from '@/app/lib/farcaster/utils';

try {
  await walletAction();
} catch (error) {
  const message = getWalletErrorMessage(error);
  alert(message);  // "User rejected the request"
}
```

### Wrap SDK Calls
```typescript
try {
  await actions.actions?.composeCast(options);
} catch (error) {
  console.error('Failed to compose cast:', error);
  alert('Failed to post cast. Please try again.');
}
```

## 🎨 Component Templates

### Simple User Display
```typescript
function UserCard() {
  const { user } = useFarcasterUser();
  
  return (
    <div>
      {user.pfpUrl && <img src={user.pfpUrl} alt={user.displayName} />}
      <p>{user.formattedDisplayName}</p>
      <p>{user.mention}</p>
    </div>
  );
}
```

### Context-Aware Welcome
```typescript
function Welcome() {
  const { user, location } = useFarcasterMiniApp();
  
  return (
    <div>
      <h1>Welcome {user.formattedDisplayName}!</h1>
      {location.isFromChannel && (
        <p>You're in /{location.channelKey}</p>
      )}
    </div>
  );
}
```

### Wallet Display
```typescript
function Wallet() {
  const { wallet } = useFarcasterWallet();
  const [balance, setBalance] = useState('0');
  
  useEffect(() => {
    wallet?.getEthereumProvider().then(async provider => {
      const addr = getPrimaryAccount(provider);
      if (addr) {
        const bal = await getEthereumBalance(provider, addr);
        setBalance(formatEther(bal));
      }
    });
  }, [wallet]);
  
  return <div>Balance: {balance} ETH</div>;
}
```

### Compose Button
```typescript
function ComposeButton() {
  const { actions } = useFarcasterActions();
  const [text, setText] = useState('');
  
  const handleCompose = async () => {
    const validation = validateComposeCastOptions({ text });
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    
    await actions.actions?.composeCast({ text });
    setText('');
  };
  
  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={handleCompose}>Post</button>
    </div>
  );
}
```

## 🔍 Debugging

### Log Context
```typescript
const { contextSummary } = useFarcasterMiniApp();
console.log('Context:', contextSummary);
// "@vitalik from channel (nouns)"
```

### Check SDK Status
```typescript
const { isSDKLoaded } = useFarcasterMiniApp();
console.log('SDK loaded:', isSDKLoaded);
```

### Verify Environment
```typescript
const { isInMiniApp, isInFarcaster } = useIsMiniApp();
console.log('In Mini App:', isInMiniApp);
console.log('In Farcaster:', isInFarcaster);
```

## 📚 Full Documentation

- **API Reference**: See `README.md`
- **Examples**: See `EXAMPLES.md`
- **Setup Guide**: See `docs/FARCASTER_MINIAPP.md`
- **Summary**: See `IMPLEMENTATION_SUMMARY.md`

## 🎯 Remember

1. Always validate before SDK actions
2. Use business logic for formatting
3. Check capabilities before showing UI
4. Handle errors gracefully
5. Test in Farcaster environment

Happy coding! 🚀

