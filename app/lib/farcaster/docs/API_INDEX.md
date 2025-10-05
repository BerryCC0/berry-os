# Farcaster Mini App SDK - Complete API Index

Alphabetical index of all available functions, hooks, and types.

## 🎣 React Hooks

| Hook | Purpose |
|------|---------|
| `useFarcasterActions()` | Get SDK actions with availability flags |
| `useFarcasterCapabilities()` | Get SDK capabilities and feature availability |
| `useFarcasterLocation()` | Get location context with utilities |
| `useFarcasterMiniApp()` | Complete hook with all features |
| `useFarcasterUser()` | Get user context with utilities |
| `useFarcasterWallet()` | Get wallet helpers |
| `useIsMiniApp()` | Detect Mini App environment |

## 🔧 Action Utilities

| Function | Purpose |
|----------|---------|
| `buildMiniAppUrl()` | Build Mini App URL with data |
| `calculateCastLength()` | Calculate cast length with embeds |
| `checkIsMiniAppEnvironment()` | Check if in Mini App (client-side) |
| `extractMiniAppData()` | Extract data from Mini App URL |
| `formatChannelKey()` | Format channel key for display |
| `getMiniAppLaunchContext()` | Get launch context from URL |
| `isCastTooLong()` | Check if cast exceeds limit |
| `isCapabilitySupported()` | Check capability support |
| `parseChannelKey()` | Parse channel key from input |
| `serializeMiniAppData()` | Serialize data for URL |
| `deserializeMiniAppData()` | Deserialize data from URL |
| `truncateCastText()` | Truncate cast to length limit |
| `validateCastHash()` | Validate cast hash format |
| `validateChannelKey()` | Validate channel key format |
| `validateComposeCastOptions()` | Validate compose cast options |
| `validateFid()` | Validate FID |
| `validateOpenMiniAppOptions()` | Validate Mini App opening options |
| `validateOpenUrlOptions()` | Validate URL opening options |
| `validateUrl()` | Validate URL format |
| `validateViewCastOptions()` | Validate view cast options |
| `validateViewChannelOptions()` | Validate view channel options |
| `validateViewProfileOptions()` | Validate view profile options |

## 💰 Wallet Utilities

| Function | Purpose |
|----------|---------|
| `chainIdToHex()` | Convert chain ID to hex |
| `estimateGas()` | Estimate transaction gas |
| `extractChainId()` | Extract numeric chain ID from CAIP-2 |
| `formatAddress()` | Format address for display |
| `formatEther()` | Format Wei to Ether string |
| `getChainExplorer()` | Get block explorer URL |
| `getChainName()` | Get human-readable chain name |
| `getCurrentChainId()` | Get current chain from provider |
| `getEthereumBalance()` | Get ETH balance |
| `getPrimaryAccount()` | Get primary account from provider |
| `getSolanaPublicKey()` | Get Solana public key as string |
| `getTransactionReceipt()` | Get transaction receipt |
| `getWalletErrorMessage()` | Format wallet error message |
| `hexToChainId()` | Convert hex to chain ID |
| `isEthereumProviderConnected()` | Check ETH provider connection |
| `isEVMChain()` | Check if chain is EVM |
| `isSolanaChain()` | Check if chain is Solana |
| `isSolanaProviderConnected()` | Check Solana provider connection |
| `isValidEthereumAddress()` | Validate ETH address |
| `isValidSolanaAddress()` | Validate Solana address |
| `parseChainId()` | Parse CAIP-2 chain identifier |
| `parseEther()` | Parse Ether to Wei |
| `requestEthereumAccounts()` | Request accounts from provider |
| `sendEthereumTransaction()` | Send ETH transaction |
| `signEthereumMessage()` | Sign message with ETH |
| `signSolanaMessage()` | Sign message with Solana |
| `supportsMethod()` | Check if provider supports method |
| `switchEthereumChain()` | Switch to different chain |
| `waitForTransaction()` | Wait for transaction confirmation |

## 👤 Context Utilities

| Function | Purpose |
|----------|---------|
| `buildCastUrl()` | Build Warpcast cast URL |
| `buildChannelUrl()` | Build Warpcast channel URL |
| `buildMention()` | Build user mention string |
| `buildProfileUrl()` | Build Warpcast profile URL (from FID) |
| `buildProfileUrlFromUsername()` | Build profile URL from username |
| `createDefaultContext()` | Create default context (testing) |
| `deserializeContext()` | Deserialize context from string |
| `extractFidFromUrl()` | Extract FID from URL |
| `formatUsername()` | Format username with @ |
| `getAllVerifications()` | Get all verified addresses |
| `getCastHash()` | Extract cast hash from location |
| `getChannelKey()` | Extract channel key from location |
| `getContextSummary()` | Get debug summary of context |
| `getDisplayName()` | Get best display name |
| `getProfileFid()` | Extract profile FID from location |
| `getPrimaryVerification()` | Get primary verified address |
| `getUserIdentifier()` | Get username or FID string |
| `hasVerifiedEthAddress()` | Check if user has verified address |
| `inferLocationType()` | Infer location type from context |
| `isFarcasterUrl()` | Check if URL is Farcaster |
| `isFromCast()` | Check if from cast |
| `isFromChannel()` | Check if from channel |
| `isFromDirectMessage()` | Check if from DM |
| `isFromProfile()` | Check if from profile |
| `isSameUser()` | Compare two users |
| `isValidContext()` | Validate Mini App context |
| `isValidFid()` | Validate FID type |
| `isValidUsername()` | Validate username format |
| `parseLocationFromUrl()` | Parse location from URL |
| `parseUsername()` | Parse username (remove @) |
| `serializeContext()` | Serialize context to string |

## 🎯 Capability Utilities

| Function | Purpose |
|----------|---------|
| `canRunOnHost()` | Check if app can run on host |
| `getAllCapabilities()` | Get all possible capabilities |
| `getAllSupportedChains()` | Get all supported chains |
| `getChainById()` | Get chain CAIP-2 from numeric ID |
| `getFeatureAvailability()` | Get feature availability flags |
| `getMinimumCapabilities()` | Get minimum required capabilities |
| `getSocialRequiredCapabilities()` | Get required social capabilities |
| `getSupportedEVMChains()` | Get supported EVM chains |
| `getSupportedSolanaChains()` | Get supported Solana chains |
| `getWalletRequiredCapabilities()` | Get required wallet capabilities |
| `groupCapabilities()` | Group capabilities by category |
| `groupChains()` | Group chains by namespace |
| `hasMinimumCapabilities()` | Check minimum requirements met |
| `isAuthCapability()` | Check if auth capability |
| `isBasicCapability()` | Check if basic capability |
| `isMediaCapability()` | Check if media capability |
| `isSocialCapability()` | Check if social capability |
| `isValidCapability()` | Validate capability string |
| `isValidChain()` | Validate CAIP-2 chain format |
| `isWalletCapability()` | Check if wallet capability |
| `parseCapability()` | Parse capability string |
| `parseChain()` | Parse CAIP-2 chain |
| `suggestCapabilities()` | Suggest capabilities for features |
| `suggestChains()` | Suggest chains for features |
| `supportsRequiredCapabilities()` | Check capability support |
| `supportsRequiredChains()` | Check chain support |

## 📘 Types

### Core Types
- `FarcasterUser` - User context interface
- `FarcasterLocation` - Location context interface
- `MiniAppContext` - Complete context interface
- `SDKCapability` - SDK capability string type
- `SupportedChain` - Chain identifier (CAIP-2)

### Action Types
- `OpenUrlOptions`
- `ComposeCastOptions`
- `ViewProfileOptions`
- `ViewCastOptions`
- `ViewChannelOptions`
- `OpenMiniAppOptions`

### Wallet Types
- `EthereumProvider` - EIP-1193 provider
- `SolanaProvider` - Solana provider interface

### SDK Interfaces
- `SDKActions` - Actions interface
- `SDKWallet` - Wallet interface
- `MiniAppSDK` - Complete SDK interface

### Error Types
- `MiniAppSDKError` - Base error
- `UnsupportedCapabilityError` - Capability not supported
- `UnsupportedChainError` - Chain not supported

## 🔤 Constants

### Chains
- `ETHEREUM_MAINNET` - `'eip155:1'`
- `BASE` - `'eip155:8453'`
- `OPTIMISM` - `'eip155:10'`
- `POLYGON` - `'eip155:137'`
- `ARBITRUM` - `'eip155:42161'`
- `SOLANA_MAINNET` - `'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'`

### Capability Groups
- `BASIC_CAPABILITIES` - Basic SDK actions
- `SOCIAL_CAPABILITIES` - Social features
- `AUTH_CAPABILITIES` - Authentication
- `WALLET_CAPABILITIES` - Wallet features
- `MEDIA_CAPABILITIES` - Camera/mic access

## 📦 Import Patterns

### Import Everything
```typescript
import * as FC from '@/app/lib/farcaster/utils';
```

### Import Specific Items
```typescript
import {
  useFarcasterMiniApp,
  validateComposeCastOptions,
  formatAddress,
  type FarcasterUser,
} from '@/app/lib/farcaster/utils';
```

### Import by Category
```typescript
// Hooks only
import {
  useFarcasterUser,
  useFarcasterWallet,
} from '@/app/lib/farcaster/utils';

// Validation only
import {
  validateComposeCastOptions,
  validateOpenUrlOptions,
} from '@/app/lib/farcaster/utils';

// Formatting only
import {
  formatAddress,
  formatEther,
  formatUsername,
} from '@/app/lib/farcaster/utils';
```

## 📊 Function Count

| Category | Count |
|----------|-------|
| React Hooks | 7 |
| Action Utilities | 21 |
| Wallet Utilities | 28 |
| Context Utilities | 31 |
| Capability Utilities | 28 |
| **Total Functions** | **115** |
| Types | 15+ |
| Constants | 11 |

## 🎯 Most Commonly Used

Top 10 functions you'll use most:

1. `useFarcasterMiniApp()` - Main hook
2. `formatAddress()` - Display addresses
3. `validateComposeCastOptions()` - Validate casts
4. `getDisplayName()` - Show user names
5. `formatEther()` - Display balances
6. `buildChannelUrl()` - Build links
7. `getEthereumBalance()` - Check balances
8. `signEthereumMessage()` - Sign messages
9. `requestEthereumAccounts()` - Connect wallet
10. `getWalletErrorMessage()` - Handle errors

## 📚 Documentation

- **API Reference**: `README.md`
- **Examples**: `EXAMPLES.md`
- **Quick Reference**: `QUICK_REFERENCE.md`
- **Implementation**: `IMPLEMENTATION_SUMMARY.md`
- **Setup Guide**: `docs/FARCASTER_MINIAPP.md`

---

**115 functions** ready to use! 🚀

