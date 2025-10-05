# Display Utilities for Berry OS

Ready-to-render data transformations for Berry OS UI components.

## Overview

The display utilities combine Goldsky subgraph data with Contract helper formatting to provide clean, typed objects optimized for React component rendering. All display functions return plain objects with all necessary formatting applied.

## Quick Start

```typescript
import { useQuery } from '@apollo/client';
import { display, GET_CURRENT_AUCTION } from '@/app/lib/Nouns/Goldsky';

function AuctionCard() {
  const { data } = useQuery(GET_CURRENT_AUCTION);
  
  if (!data?.auctions[0]) return null;
  
  // Get ready-to-render auction data
  const auction = display.auctionForCard(data.auctions[0]);
  
  return (
    <div>
      <h2>Noun {auction.nounId}</h2>
      <p>Current Bid: {auction.currentBid}</p>
      <p>Time Remaining: {auction.timeRemaining}</p>
      <p>Bids: {auction.bidCount}</p>
      <p>Status: {auction.isActive ? 'Active' : 'Ended'}</p>
    </div>
  );
}
```

---

## Auction Displays

### `auctionForCard(auction): AuctionCardDisplay`

Perfect for auction list/grid views with essential info.

**Returns:**
```typescript
{
  nounId: string;                    // "123"
  currentBid: string;                // "15.5 ETH"
  currentBidRaw: bigint;             // Raw wei amount
  timeRemaining: string;             // "2h 15m 30s"
  timeRemainingSeconds: number;      // 8130
  bidCount: number;                  // 42
  isActive: boolean;                 // true
  isSettled: boolean;                // false
  hasEnded: boolean;                 // false
  url: string;                       // "https://nouns.wtf/noun/123"
  winningBidder: string | null;      // "0x1234..." or null
  nounBackground: number;            // 0
  nounBody: number;                  // 12
  nounAccessory: number;             // 5
  nounHead: number;                  // 34
  nounGlasses: number;               // 8
}
```

**Example:**
```typescript
import { display } from '@/app/lib/Nouns/Goldsky';

const auction = display.auctionForCard(data);

<Card>
  <img src={`https://noun.pics/${auction.nounId}`} />
  <h3>Noun {auction.nounId}</h3>
  <p className={auction.isActive ? 'active' : 'ended'}>
    {auction.currentBid}
  </p>
  <p>{auction.timeRemaining}</p>
  <p>{auction.bidCount} bids</p>
  <a href={auction.url}>View on Nouns.wtf</a>
</Card>
```

---

### `auctionForDetail(auction): AuctionDetailDisplay`

Perfect for auction detail pages with comprehensive info.

**Returns:** All fields from `auctionForCard` plus:
```typescript
{
  startDate: Date;
  endDate: Date;
  startDateFormatted: string;        // "10/5/2025, 2:30:00 PM"
  endDateFormatted: string;
  minNextBid: string;                // "16.3 ETH"
  minNextBidRaw: bigint;
  uniqueBidders: number;             // 28
  auctionDuration: number;           // 86400 (seconds)
  summary: string;                   // Full summary text
  owner: {
    address: string;                 // "0x1234..."
    addressShort: string;            // "0x1234...5678"
    nounCount: string;               // "3"
  };
  topBids: Array<{
    amount: string;                  // "15.5 ETH"
    amountRaw: bigint;
    bidder: string;                  // "0x1234..."
    bidderShort: string;             // "0x1234...5678"
    timestamp: Date;
    timestampFormatted: string;
  }>;
}
```

---

### `bidHistoryForTable(auction): BidHistoryDisplay[]`

Perfect for bid history tables.

**Returns:**
```typescript
Array<{
  id: string;
  amount: string;                    // "15.5 ETH"
  amountRaw: bigint;
  bidder: string;                    // "0x1234..."
  bidderShort: string;               // "0x1234...5678"
  timestamp: Date;
  timestampFormatted: string;
  isWinning: boolean;
}>
```

---

## Proposal Displays

### `proposalForCard(proposal): ProposalCardDisplay`

Perfect for proposal list views.

**Returns:**
```typescript
{
  id: string;                        // "123"
  title: string;                     // "Fund Berry OS Development"
  status: string;                    // "Active"
  statusColor: string;               // "blue"
  forVotes: string;                  // "1,234"
  againstVotes: string;              // "567"
  abstainVotes: string;              // "89"
  forVotesRaw: bigint;
  againstVotesRaw: bigint;
  abstainVotesRaw: bigint;
  forPercentage: number;             // 65.42
  againstPercentage: number;         // 30.12
  abstainPercentage: number;         // 4.46
  hasReachedQuorum: boolean;         // true
  quorumProgress: number;            // 120 (%)
  isActive: boolean;                 // true
  canBeVotedOn: boolean;             // true
  proposer: string;                  // "0x1234..."
  proposerShort: string;             // "0x1234...5678"
  createdDate: Date;
  createdDateFormatted: string;
  age: string;                       // "3 days ago"
  url: string;                       // "https://nouns.wtf/vote/123"
  actionCount: number;               // 2
}
```

**Example:**
```typescript
const proposal = display.proposalForCard(data);

<Card>
  <h3>{proposal.title}</h3>
  <Badge color={proposal.statusColor}>{proposal.status}</Badge>
  <div>
    <span>For: {proposal.forVotes} ({proposal.forPercentage}%)</span>
    <span>Against: {proposal.againstVotes} ({proposal.againstPercentage}%)</span>
  </div>
  <p>Quorum: {proposal.quorumProgress}%</p>
  <p>By {proposal.proposerShort} • {proposal.age}</p>
  {proposal.canBeVotedOn && <Button>Vote</Button>}
</Card>
```

---

### `proposalForDetail(proposal): ProposalDetailDisplay`

Perfect for proposal detail pages.

**Returns:** All fields from `proposalForCard` plus:
```typescript
{
  description: string;               // Full markdown description
  startBlock: number;
  endBlock: number;
  executionETA: Date | null;
  executionETAFormatted: string | null;
  totalVotes: string;                // "1,890"
  totalVotesRaw: bigint;
  isFinalized: boolean;
  isPending: boolean;
  isQueued: boolean;
  isExecuted: boolean;
  isDefeated: boolean;
  isCancelled: boolean;
  isVetoed: boolean;
  actions: Array<{
    target: string;                  // "0xTreasuryAddress"
    targetShort: string;             // "0xTrea...ress"
    value: string;                   // "10.0 ETH"
    signature: string;               // "transfer(address,uint256)"
    calldata: string;                // "0x..."
  }>;
  summary: string;
}
```

---

### `votesForTable(proposal): VoteDisplayRow[]`

Perfect for vote tables.

**Returns:**
```typescript
Array<{
  id: string;
  voter: string;                     // "0x1234..."
  voterShort: string;                // "0x1234...5678"
  support: string;                   // "For"
  supportIcon: '✓' | '✗' | '−';      // Visual icon
  votes: string;                     // "12"
  votesRaw: bigint;
  reason: string | null;             // Vote reason or null
  blockNumber: number;
}>
```

---

## Noun Displays

### `nounForCard(noun): NounCardDisplay`

Perfect for noun gallery/grid views.

**Returns:**
```typescript
{
  id: string;                        // "123"
  idNumber: number;                  // 123
  displayName: string;               // "Noun 123"
  owner: string;                     // "0x1234..."
  ownerShort: string;                // "0x1234...5678"
  background: number;                // 0
  body: number;                      // 12
  accessory: number;                 // 5
  head: number;                      // 34
  glasses: number;                   // 8
  createdDate: Date;
  createdDateFormatted: string;
  url: string;                       // "https://nouns.wtf/noun/123"
}
```

---

### `nounForDetail(noun): NounDetailDisplay`

Perfect for noun detail pages.

**Returns:** All fields from `nounForCard` plus:
```typescript
{
  ownerNounCount: string;            // "3"
  ownerDelegate: string | null;      // "0xDelegate..." or null
  ownerDelegateShort: string | null; // "0xDele...gate"
  hasAuction: boolean;
  auction?: AuctionDetailDisplay;    // If hasAuction = true
}
```

---

## Delegate Displays

### `delegateForLeaderboard(delegate): DelegateLeaderboardDisplay`

Perfect for delegate leaderboards.

**Returns:**
```typescript
{
  address: string;                   // "0x1234..."
  addressShort: string;              // "0x1234...5678"
  votingPower: string;               // "42"
  votingPowerRaw: bigint;
  tokenHoldersRepresented: number;   // 15
  proposalCount: number;             // 5
  voteCount: number;                 // 89
}
```

---

## Account Displays

### `accountForProfile(account): AccountProfileDisplay`

Perfect for account profiles.

**Returns:**
```typescript
{
  address: string;                   // "0x1234..."
  addressShort: string;              // "0x1234...5678"
  nounCount: string;                 // "3"
  nounCountNumber: number;           // 3
  votingPower: string;               // "3"
  votingPowerRaw: bigint;
  delegate: string | null;           // "0xDelegate..."
  delegateShort: string | null;      // "0xDele...gate"
  isDelegatedToSelf: boolean;        // false
  hasNouns: boolean;                 // true
  hasVotingPower: boolean;           // true
}
```

---

## Statistics Displays

### `auctionStats(auctions[]): AuctionStatsDisplay`

Perfect for dashboards showing auction analytics.

**Returns:**
```typescript
{
  totalVolume: string;               // "15,420.5 ETH"
  totalVolumeRaw: bigint;
  averagePrice: string;              // "15.2 ETH"
  averagePriceRaw: bigint;
  highestPrice: string;              // "125.0 ETH"
  highestPriceRaw: bigint;
  lowestPrice: string;               // "0.5 ETH"
  lowestPriceRaw: bigint;
  totalAuctions: number;             // 1,234
}
```

---

### `proposalStats(proposals[]): ProposalStatsDisplay`

Perfect for dashboards showing governance analytics.

**Returns:**
```typescript
{
  total: number;                     // 456
  active: number;                    // 3
  executed: number;                  // 234
  defeated: number;                  // 123
  queued: number;                    // 2
  cancelled: number;                 // 45
  vetoed: number;                    // 12
  passRate: number;                  // 65.5 (%)
}
```

---

## Design Principles

1. **Ready-to-Render**: All data is formatted and ready for UI
2. **No Business Logic in Components**: Keep components simple
3. **Consistent Formatting**: Uses Contract helpers for ETH amounts
4. **TypeScript First**: Fully typed for autocomplete and type safety
5. **Performance Optimized**: Returns plain objects (no functions/closures)
6. **Mobile Friendly**: Short addresses, compact formatting

---

## Full Example: Auction Detail Page

```typescript
import { useQuery } from '@apollo/client';
import { display, GET_AUCTION } from '@/app/lib/Nouns/Goldsky';

function AuctionDetailPage({ nounId }: { nounId: string }) {
  const { data, loading } = useQuery(GET_AUCTION, {
    variables: { id: nounId },
  });
  
  if (loading) return <Loading />;
  if (!data?.auction) return <NotFound />;
  
  // Get all ready-to-render data
  const auction = display.auctionForDetail(data.auction);
  const bidHistory = display.bidHistoryForTable(data.auction);
  
  return (
    <div>
      {/* Hero Section */}
      <div>
        <img src={`https://noun.pics/${auction.nounId}`} />
        <h1>Noun {auction.nounId}</h1>
        <Badge className={auction.isActive ? 'active' : 'ended'}>
          {auction.isActive ? 'Active' : 'Settled'}
        </Badge>
      </div>
      
      {/* Auction Info */}
      <div>
        <h2>Current Bid: {auction.currentBid}</h2>
        {auction.isActive && (
          <>
            <p>Min Next Bid: {auction.minNextBid}</p>
            <p>Time Remaining: {auction.timeRemaining}</p>
            <Button>Place Bid</Button>
          </>
        )}
        <p>{auction.bidCount} bids from {auction.uniqueBidders} bidders</p>
      </div>
      
      {/* Noun Info */}
      <div>
        <h3>Owner</h3>
        <a href={`/account/${auction.owner.address}`}>
          {auction.owner.addressShort}
        </a>
        <p>{auction.owner.nounCount} Nouns owned</p>
      </div>
      
      {/* Bid History */}
      <div>
        <h3>Bid History</h3>
        <table>
          <thead>
            <tr>
              <th>Bidder</th>
              <th>Amount</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {bidHistory.map(bid => (
              <tr key={bid.id} className={bid.isWinning ? 'winning' : ''}>
                <td>{bid.bidderShort}</td>
                <td>{bid.amount}</td>
                <td>{bid.timestampFormatted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Top Bids */}
      <div>
        <h3>Top Bids</h3>
        {auction.topBids.map((bid, i) => (
          <div key={i}>
            <span>#{i + 1}</span>
            <span>{bid.bidderShort}</span>
            <span>{bid.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Tips

1. **Use with React Query**: Display utilities work great with Apollo Client's `useQuery`
2. **Combine Multiple Displays**: Mix auction + noun data for rich UIs
3. **Cache Results**: Display functions are pure - safe to memoize
4. **Mobile Adaptive**: `addressShort` fields are perfect for mobile
5. **Accessibility**: Use `url` fields for proper navigation

---

Built for **Berry OS** 🎨

