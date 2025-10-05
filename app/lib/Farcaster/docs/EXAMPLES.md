# Farcaster Mini App SDK - Usage Examples

Complete examples showing how to use the business logic in real components.

## 🎯 Quick Start

```typescript
// Import what you need
import {
  useFarcasterMiniApp,
  validateComposeCastOptions,
  formatAddress,
  getDisplayName,
} from '@/app/lib/farcaster/utils';
```

## 📱 Example 1: Simple Mini App Component

```typescript
'use client';

import { useFarcasterMiniApp } from '@/app/lib/farcaster/utils';

export function WelcomeScreen() {
  const {
    user,
    location,
    actions,
    contextSummary,
    isSDKLoaded,
  } = useFarcasterMiniApp();
  
  if (!isSDKLoaded) {
    return <div className={styles.loading}>Loading Mini App...</div>;
  }
  
  console.log('Mini App Context:', contextSummary);
  
  return (
    <div className={styles.welcome}>
      <h1>Welcome to Nouns OS!</h1>
      
      {user.user && (
        <div className={styles.userInfo}>
          {user.pfpUrl && <img src={user.pfpUrl} alt={user.displayName} />}
          <p>{user.formattedDisplayName}</p>
          <p className={styles.mention}>{user.mention}</p>
        </div>
      )}
      
      {location.isFromChannel && (
        <p>You opened this from /{location.channelKey} 🎉</p>
      )}
      
      <button onClick={() => actions.actions?.close()}>
        Close Mini App
      </button>
    </div>
  );
}
```

## 🎨 Example 2: Compose Cast Component

```typescript
'use client';

import { useState } from 'react';
import {
  useFarcasterActions,
  validateComposeCastOptions,
  isCastTooLong,
  truncateCastText,
  calculateCastLength,
} from '@/app/lib/farcaster/utils';

export function ComposeCast() {
  const { actions, canComposeCast } = useFarcasterActions();
  const [text, setText] = useState('');
  const [channelKey, setChannelKey] = useState('nouns');
  const [embeds, setEmbeds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  if (!canComposeCast) {
    return <div>Compose not available in this context</div>;
  }
  
  const handleSubmit = async () => {
    setError(null);
    
    // Validate using business logic
    const options = { text, channelKey, embeds };
    const validation = validateComposeCastOptions(options);
    
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }
    
    // Truncate if too long
    let finalText = text;
    if (isCastTooLong(text, embeds)) {
      finalText = truncateCastText(text, 320);
    }
    
    try {
      await actions?.composeCast({
        text: finalText,
        channelKey,
        embeds: embeds.length > 0 ? embeds : undefined,
      });
    } catch (err) {
      setError('Failed to compose cast');
      console.error(err);
    }
  };
  
  const currentLength = calculateCastLength(text, embeds);
  const isTooLong = currentLength > 320;
  
  return (
    <div className={styles.composeCast}>
      <h2>Compose Cast</h2>
      
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What's happening?"
        className={isTooLong ? styles.error : ''}
      />
      
      <div className={styles.meta}>
        <span className={isTooLong ? styles.errorText : ''}>
          {currentLength} / 320
        </span>
      </div>
      
      <input
        type="text"
        value={channelKey}
        onChange={e => setChannelKey(e.target.value)}
        placeholder="Channel (optional)"
      />
      
      {error && <div className={styles.error}>{error}</div>}
      
      <button onClick={handleSubmit} disabled={isTooLong}>
        Post Cast
      </button>
    </div>
  );
}
```

## 💰 Example 3: Wallet Integration

```typescript
'use client';

import { useState, useEffect } from 'react';
import {
  useFarcasterWallet,
  useFarcasterUser,
  formatAddress,
  formatEther,
  getEthereumBalance,
  getPrimaryAccount,
  requestEthereumAccounts,
  getWalletErrorMessage,
} from '@/app/lib/farcaster/utils';

export function WalletDisplay() {
  const { wallet, canUseEthereumWallet } = useFarcasterWallet();
  const { user } = useFarcasterUser();
  
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!canUseEthereumWallet) return;
    
    const loadWallet = async () => {
      try {
        setIsLoading(true);
        const provider = await wallet?.getEthereumProvider();
        
        if (!provider) return;
        
        // Request accounts
        const accounts = await requestEthereumAccounts(provider);
        
        if (accounts.length > 0) {
          const primaryAccount = getPrimaryAccount(provider);
          setAddress(primaryAccount);
          
          // Get balance
          if (primaryAccount) {
            const bal = await getEthereumBalance(provider, primaryAccount);
            setBalance(formatEther(bal, 4));
          }
        }
      } catch (err) {
        setError(getWalletErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWallet();
  }, [wallet, canUseEthereumWallet]);
  
  if (!canUseEthereumWallet) {
    return <div>Wallet not available</div>;
  }
  
  if (isLoading) {
    return <div>Loading wallet...</div>;
  }
  
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }
  
  return (
    <div className={styles.wallet}>
      <h2>Your Wallet</h2>
      
      {user.hasVerifiedAddress && (
        <div className={styles.verified}>
          ✓ Verified on Farcaster
        </div>
      )}
      
      {address && (
        <>
          <div className={styles.address}>
            <label>Address:</label>
            <code>{formatAddress(address, 6)}</code>
          </div>
          
          <div className={styles.balance}>
            <label>Balance:</label>
            <span>{balance} ETH</span>
          </div>
        </>
      )}
    </div>
  );
}
```

## 🌐 Example 4: Context-Aware Navigation

```typescript
'use client';

import {
  useFarcasterLocation,
  useFarcasterActions,
  buildCastUrl,
  buildChannelUrl,
  buildProfileUrl,
} from '@/app/lib/farcaster/utils';

export function ContextNavigation() {
  const {
    location,
    isFromCast,
    isFromChannel,
    isFromProfile,
    castHash,
    channelKey,
    profileFid,
  } = useFarcasterLocation();
  
  const { actions } = useFarcasterActions();
  
  const handleViewSource = async () => {
    if (isFromCast && castHash) {
      await actions?.viewCast({ hash: castHash });
    } else if (isFromChannel && channelKey) {
      await actions?.viewChannel({ channelKey });
    } else if (isFromProfile && profileFid) {
      await actions?.viewProfile({ fid: profileFid });
    }
  };
  
  const getSourceUrl = () => {
    if (isFromCast && castHash) return buildCastUrl(castHash);
    if (isFromChannel && channelKey) return buildChannelUrl(channelKey);
    if (isFromProfile && profileFid) return buildProfileUrl(profileFid);
    return null;
  };
  
  return (
    <div className={styles.contextNav}>
      <h3>Context Info</h3>
      
      <div className={styles.locationBadge}>
        Opened from: <strong>{location?.type}</strong>
      </div>
      
      {isFromChannel && (
        <div className={styles.channelInfo}>
          <span>Channel: /{channelKey}</span>
          <button onClick={handleViewSource}>
            View Channel
          </button>
        </div>
      )}
      
      {isFromCast && (
        <div className={styles.castInfo}>
          <span>Replying to cast</span>
          <button onClick={handleViewSource}>
            View Original
          </button>
        </div>
      )}
      
      {getSourceUrl() && (
        <a href={getSourceUrl()!} target="_blank" rel="noopener noreferrer">
          Open in Warpcast
        </a>
      )}
    </div>
  );
}
```

## 🔗 Example 5: Deep Linking & Data Passing

```typescript
'use client';

import { useEffect, useState } from 'react';
import {
  buildMiniAppUrl,
  extractMiniAppData,
  serializeMiniAppData,
  deserializeMiniAppData,
} from '@/app/lib/farcaster/utils';

interface ItemData {
  itemId: number;
  view: 'detail' | 'edit';
  returnUrl?: string;
}

export function DeepLinkingExample() {
  const [data, setData] = useState<ItemData | null>(null);
  
  useEffect(() => {
    // Extract data passed from another Mini App
    const received = extractMiniAppData(window.location.href);
    
    if (received) {
      setData(received as ItemData);
    }
  }, []);
  
  const handleOpenAnotherApp = async () => {
    // Pass data to another Mini App
    const dataToPass: ItemData = {
      itemId: 123,
      view: 'detail',
      returnUrl: window.location.href,
    };
    
    const url = buildMiniAppUrl(
      'https://other-miniapp.example.com',
      dataToPass
    );
    
    // Open the other Mini App
    window.open(url, '_blank');
  };
  
  const handleShare = () => {
    // Create shareable link with current state
    const currentState = {
      itemId: data?.itemId || 0,
      view: 'detail' as const,
    };
    
    const shareUrl = buildMiniAppUrl(window.location.origin, currentState);
    
    // Copy to clipboard or share
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  };
  
  return (
    <div className={styles.deepLinking}>
      <h2>Deep Linking Example</h2>
      
      {data && (
        <div className={styles.receivedData}>
          <h3>Received Data:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
      
      <button onClick={handleOpenAnotherApp}>
        Open Another Mini App
      </button>
      
      <button onClick={handleShare}>
        Share Current State
      </button>
    </div>
  );
}
```

## 🎭 Example 6: User Profile Component

```typescript
'use client';

import {
  useFarcasterUser,
  useFarcasterActions,
  formatUsername,
  buildProfileUrlFromUsername,
  buildMention,
} from '@/app/lib/farcaster/utils';

export function UserProfile() {
  const {
    user,
    fid,
    username,
    displayName,
    pfpUrl,
    mention,
    identifier,
    hasVerifiedAddress,
    primaryVerification,
    allVerifications,
    isLoaded,
  } = useFarcasterUser();
  
  const { actions, canViewProfile } = useFarcasterActions();
  
  if (!isLoaded) {
    return <div>Loading user...</div>;
  }
  
  if (!user) {
    return <div>No user context</div>;
  }
  
  const handleViewProfile = async () => {
    if (canViewProfile && fid) {
      await actions?.viewProfile({ fid });
    }
  };
  
  return (
    <div className={styles.userProfile}>
      <div className={styles.avatar}>
        {pfpUrl ? (
          <img src={pfpUrl} alt={displayName} />
        ) : (
          <div className={styles.placeholder}>
            {displayName?.[0]?.toUpperCase()}
          </div>
        )}
      </div>
      
      <div className={styles.info}>
        <h2>{displayName}</h2>
        
        {username && (
          <p className={styles.username}>
            <a
              href={buildProfileUrlFromUsername(username)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {mention}
            </a>
          </p>
        )}
        
        <p className={styles.fid}>FID: {fid}</p>
        
        {hasVerifiedAddress && (
          <div className={styles.verified}>
            <span className={styles.badge}>✓ Verified</span>
            
            <div className={styles.verifications}>
              <h4>Verified Addresses:</h4>
              <ul>
                {allVerifications.map((addr, i) => (
                  <li key={i}>
                    <code>{addr.slice(0, 6)}...{addr.slice(-4)}</code>
                    {addr === primaryVerification && (
                      <span className={styles.primary}>Primary</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {canViewProfile && (
        <button onClick={handleViewProfile}>
          View Full Profile
        </button>
      )}
    </div>
  );
}
```

## 🎮 Example 7: Full Mini App with All Features

```typescript
'use client';

import { useState } from 'react';
import {
  useFarcasterMiniApp,
  validateComposeCastOptions,
  formatAddress,
  getEthereumBalance,
  formatEther,
  buildChannelUrl,
  getWalletErrorMessage,
} from '@/app/lib/farcaster/utils';

export function CompleteM iniApp() {
  const {
    user,
    location,
    actions,
    contextSummary,
    isSDKLoaded,
  } = useFarcasterMiniApp();
  
  const [view, setView] = useState<'home' | 'compose' | 'wallet'>('home');
  const [castText, setCastText] = useState('');
  const [balance, setBalance] = useState<string | null>(null);
  
  // Home View
  const renderHome = () => (
    <div className={styles.home}>
      <h1>Welcome to Nouns OS Mini App</h1>
      
      {user.user && (
        <div className={styles.userCard}>
          {user.pfpUrl && <img src={user.pfpUrl} alt={user.displayName} />}
          <div>
            <p className={styles.name}>{user.formattedDisplayName}</p>
            <p className={styles.mention}>{user.mention}</p>
            {user.hasVerifiedAddress && <span>✓ Verified</span>}
          </div>
        </div>
      )}
      
      {location.isFromChannel && (
        <div className={styles.context}>
          <p>You're in /{location.channelKey}</p>
          <a href={buildChannelUrl(location.channelKey!)}>
            Visit Channel
          </a>
        </div>
      )}
      
      <div className={styles.actions}>
        <button onClick={() => setView('compose')}>
          Compose Cast
        </button>
        <button onClick={() => setView('wallet')}>
          View Wallet
        </button>
      </div>
      
      <p className={styles.debug}>Context: {contextSummary}</p>
    </div>
  );
  
  // Compose View
  const renderCompose = () => (
    <div className={styles.compose}>
      <button onClick={() => setView('home')}>← Back</button>
      
      <h2>Compose Cast</h2>
      
      <textarea
        value={castText}
        onChange={e => setCastText(e.target.value)}
        placeholder="What's on your mind?"
      />
      
      <button
        onClick={async () => {
          const validation = validateComposeCastOptions({
            text: castText,
            channelKey: location.channelKey,
          });
          
          if (!validation.valid) {
            alert(validation.error);
            return;
          }
          
          await actions.actions?.composeCast({
            text: castText,
            channelKey: location.channelKey,
          });
          
          setCastText('');
          setView('home');
        }}
      >
        Post
      </button>
    </div>
  );
  
  // Wallet View
  const renderWallet = () => (
    <div className={styles.wallet}>
      <button onClick={() => setView('home')}>← Back</button>
      
      <h2>Your Wallet</h2>
      
      {user.hasVerifiedAddress && (
        <div>
          <p>Verified Address:</p>
          <code>{formatAddress(user.primaryVerification!)}</code>
        </div>
      )}
      
      <button
        onClick={async () => {
          try {
            const provider = await actions.wallet?.getEthereumProvider();
            if (provider && user.primaryVerification) {
              const bal = await getEthereumBalance(
                provider,
                user.primaryVerification
              );
              setBalance(formatEther(bal));
            }
          } catch (err) {
            alert(getWalletErrorMessage(err));
          }
        }}
      >
        Load Balance
      </button>
      
      {balance && <p>Balance: {balance} ETH</p>}
    </div>
  );
  
  if (!isSDKLoaded) {
    return <div className={styles.loading}>Loading...</div>;
  }
  
  return (
    <div className={styles.miniApp}>
      {view === 'home' && renderHome()}
      {view === 'compose' && renderCompose()}
      {view === 'wallet' && renderWallet()}
    </div>
  );
}
```

## 🧪 Example 8: Testing with Business Logic

```typescript
// In your test file
import {
  validateComposeCastOptions,
  formatAddress,
  buildMiniAppUrl,
  extractMiniAppData,
  getDisplayName,
} from '@/app/lib/farcaster/utils';

describe('Farcaster Business Logic', () => {
  test('validates cast options correctly', () => {
    const validCast = {
      text: 'Hello Farcaster!',
      channelKey: 'nouns',
    };
    
    const result = validateComposeCastOptions(validCast);
    expect(result.valid).toBe(true);
  });
  
  test('rejects invalid cast', () => {
    const invalidCast = {
      text: 'a'.repeat(400), // Too long
    };
    
    const result = validateComposeCastOptions(invalidCast);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceeds maximum length');
  });
  
  test('formats addresses correctly', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    expect(formatAddress(address)).toBe('0x1234...5678');
  });
  
  test('handles Mini App data serialization', () => {
    const data = { itemId: 123, view: 'detail' };
    const url = buildMiniAppUrl('https://app.example.com', data);
    
    expect(url).toContain('miniAppData=');
    
    const extracted = extractMiniAppData(url);
    expect(extracted).toEqual(data);
  });
  
  test('gets display name with fallbacks', () => {
    const user1 = { fid: 123, displayName: 'Alice' };
    const user2 = { fid: 456, username: 'bob' };
    const user3 = { fid: 789 };
    
    expect(getDisplayName(user1)).toBe('Alice');
    expect(getDisplayName(user2)).toBe('@bob');
    expect(getDisplayName(user3)).toBe('fid:789');
  });
});
```

## 📝 Best Practices Summary

1. **Always validate before SDK calls**:
   ```typescript
   const validation = validateComposeCastOptions(options);
   if (!validation.valid) return;
   await actions.composeCast(options);
   ```

2. **Use business logic for all data formatting**:
   ```typescript
   // Good
   const display = formatAddress(address);
   
   // Bad
   const display = address.slice(0, 6) + '...';
   ```

3. **Check capabilities before rendering UI**:
   ```typescript
   const { canComposeCast } = useFarcasterActions();
   return canComposeCast && <ComposeButton />;
   ```

4. **Handle errors gracefully**:
   ```typescript
   try {
     await action();
   } catch (err) {
     alert(getWalletErrorMessage(err));
   }
   ```

5. **Extract context early**:
   ```typescript
   const { contextSummary } = useFarcasterMiniApp();
   console.log('App loaded:', contextSummary);
   ```

All examples follow Nouns OS architecture principles! 🎉

