# BalanceCard Improvements Plan

## Overview
Enhance the BalanceCard component by replacing emojis with Mac OS 8 style SVG token icons and adding more robust features for better balance display and token support.

## Current Issues

1. **Emojis Used:**
   - 🔷 for ETH
   - 💵 for USDC/USDT  
   - 🪙 for generic tokens
   - ₿ and ◎ (symbols, not emojis, but inconsistent)

2. **Limited Functionality:**
   - No USD value display (commented out)
   - Limited token icon support
   - No loading states
   - No error handling for missing balance
   - No refresh/reload capability

## Improvements to Implement

### 1. Create Token Icon SVGs
**Location:** `/public/icons/tokens/`

Create Mac OS 8 style token icons:
- `eth.svg` - Ethereum diamond
- `btc.svg` - Bitcoin ₿ symbol
- `sol.svg` - Solana ◎ symbol
- `usdc.svg` - USDC coin
- `usdt.svg` - USDT coin
- `bnb.svg` - BNB coin
- `generic.svg` - Default token icon

**Style:**
- 32x32px for larger display
- Black on transparent
- Bold, clear symbols
- Mac OS 8 aesthetic

### 2. Replace Emoji with SVG Icons

**File:** `BalanceCard.tsx`

Update `getSymbolIcon` function:
```typescript
// Before: Returns emoji strings
function getSymbolIcon(symbol?: string): string {
  return '🔷';
}

// After: Returns SVG paths
function getSymbolIcon(symbol?: string): string {
  return '/icons/tokens/eth.svg';
}
```

Update JSX to use `<img>` tags:
```typescript
<img src={getSymbolIcon(symbol)} alt={symbol} className={styles.symbol} />
```

### 3. Add Loading & Error States

```typescript
interface BalanceCardProps {
  balance?: string;
  symbol?: string;
  decimals?: number;
  isLoading?: boolean;  // NEW
  error?: string;       // NEW
}
```

Display loading skeleton or error message when appropriate.

### 4. Add Balance Refresh Button

Add a small refresh icon button to reload balance data:
- Create `refresh.svg` icon
- Add button next to balance display
- Emit event or callback for parent to refresh

### 5. Improve Balance Formatting

- Show appropriate decimals based on token (e.g., 2 for stablecoins, 4-6 for ETH)
- Add comma separators for large numbers
- Handle very small balances (< 0.0001)
- Handle very large balances (> 1,000,000)

### 6. Add USD Value Display (Optional Enhancement)

- Integrate with price feed
- Show approximate USD value
- Add update timestamp
- Handle loading state for price data

### 7. Add Balance Details Tooltip/Popup

On click, show:
- Full balance (all decimals)
- Contract address
- Token details
- Recent transactions

## Implementation Steps

### Step 1: Create Token Icon Directory & SVGs
- Create `/public/icons/tokens/` directory
- Create 7 token SVG icons matching Mac OS 8 style

### Step 2: Update BalanceCard Component
- Replace `getSymbolIcon` to return SVG paths
- Update JSX to use `<img>` instead of `<span>`
- Add loading, error states
- Improve balance formatting logic
- Add refresh button

### Step 3: Update BalanceCard CSS
- Update `.symbol` styles for `<img>` tags
- Add loading skeleton styles
- Add error state styles
- Add refresh button styles

### Step 4: Create Helper Utilities
- Create `formatBalance` utility with smart decimal handling
- Create `formatLargeNumber` for comma separators
- Create token metadata lookup (optional)

## Files to Create/Modify

### New Files:
1. `/public/icons/tokens/eth.svg`
2. `/public/icons/tokens/btc.svg`
3. `/public/icons/tokens/sol.svg`
4. `/public/icons/tokens/usdc.svg`
5. `/public/icons/tokens/usdt.svg`
6. `/public/icons/tokens/bnb.svg`
7. `/public/icons/tokens/generic.svg`
8. `/public/icons/actions/refresh.svg` (if not exists)

### Modified Files:
1. `src/OS/components/UI/WalletControlCenter/components/BalanceCard.tsx`
2. `src/OS/components/UI/WalletControlCenter/components/BalanceCard.module.css`

## Token Icon Specifications

### Design Guidelines:
- **Size:** 32x32px (larger for balance display)
- **Style:** Bold, recognizable symbols
- **Colors:** Black (#000000) on transparent
- **Stroke:** 2-3px for clarity
- **Detail:** Minimal, iconic representation

### Examples:

**ETH Icon:**
```svg
<svg width="32" height="32" viewBox="0 0 32 32">
  <path d="M16 4L8 17L16 21L24 17L16 4Z" stroke="#000" stroke-width="2"/>
  <path d="M16 23L8 18L16 30L24 18L16 23Z" stroke="#000" stroke-width="2"/>
</svg>
```

**Generic Token Icon:**
```svg
<svg width="32" height="32" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="12" stroke="#000" stroke-width="2" fill="none"/>
  <circle cx="16" cy="16" r="6" stroke="#000" stroke-width="2" fill="none"/>
</svg>
```

## Enhanced Features

### Smart Balance Formatting

```typescript
function formatBalance(balance?: string, symbol?: string): string {
  if (!balance) return '0.00';
  
  const num = parseFloat(balance);
  
  // Very small balances
  if (num < 0.0001 && num > 0) return '< 0.0001';
  
  // Stablecoins: 2 decimals
  if (symbol && ['USDC', 'USDT', 'DAI'].includes(symbol.toUpperCase())) {
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }
  
  // Other tokens: 4 decimals
  return num.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 4 
  });
}
```

### Loading State

```typescript
{isLoading ? (
  <div className={styles.loadingSkeleton}>
    <div className={styles.skeletonIcon} />
    <div className={styles.skeletonValue} />
  </div>
) : (
  // Normal display
)}
```

### Error State

```typescript
{error ? (
  <div className={styles.errorState}>
    <img src="/icons/actions/warning.svg" alt="Error" />
    <span>Unable to load balance</span>
  </div>
) : (
  // Normal display
)}
```

## Testing Checklist

- [ ] All token icons display correctly
- [ ] Generic icon shows for unknown tokens
- [ ] Icons scale properly (32px display size)
- [ ] Loading state shows properly
- [ ] Error state displays correctly
- [ ] Balance formats with appropriate decimals
- [ ] Large numbers show with commas
- [ ] Very small balances show "< 0.0001"
- [ ] Refresh button works (if implemented)
- [ ] Mobile display maintains quality
- [ ] Works across all themes

## Benefits

1. **Consistent Visuals:** SVG icons match Mac OS 8 aesthetic
2. **Better UX:** Loading and error states inform users
3. **Flexibility:** Easy to add new token icons
4. **Maintainability:** Centralized icon management
5. **Professionalism:** No emoji rendering inconsistencies
6. **Robustness:** Handles edge cases (very large/small balances)
7. **Accessibility:** Proper alt text and error messages

## Future Enhancements

1. **Price Integration:** Real USD values from price feeds
2. **Multi-token Support:** Show multiple token balances
3. **Balance History:** Chart of balance over time
4. **Portfolio View:** Total portfolio value across all tokens
5. **Quick Actions:** Send/Receive buttons per token
6. **Token Search:** Filter and find specific tokens
7. **Custom Tokens:** User can add custom token icons

