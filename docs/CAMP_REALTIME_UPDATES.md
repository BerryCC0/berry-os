# Camp Real-Time Updates Implementation

## Overview

Implemented seamless real-time data updates for all 4 Camp tabs using **smart polling** with Apollo Client. This provides near real-time governance monitoring without requiring manual refresh buttons or disruptive loading banners.

**Implementation Date**: October 14, 2025  
**Status**: ✅ Complete

---

## Why Polling Instead of Subscriptions?

### Goldsky Limitations

**Goldsky does NOT support GraphQL subscriptions (WebSocket).**

From Goldsky's official FAQ:
> "Do Goldsky subgraphs support subscriptions? **Not at the moment**, though similar functionality for 'live queries' can be accomplished by polling our querying endpoints. We also do support webhooks, which can be similarly useful for certain push-based use cases."

### Our Solution: Smart Polling

We implemented an intelligent polling system that:
- ✅ **Automatically polls** when the tab is active
- ✅ **Stops polling** when the tab is inactive (battery efficient)
- ✅ **Fetches fresh data** on component mount/remount
- ✅ **Uses Apollo cache** for instant UI updates
- ✅ **No manual refresh buttons** (just works™)
- ✅ **No loading banners** (seamless experience)

---

## Architecture

### 1. Smart Polling Hook

**File**: `/src/Apps/Nouns/Camp/utils/hooks/useSmartPolling.ts`

A reusable hook that manages polling lifecycle based on tab visibility:

```typescript
useSmartPolling({
  interval: 30000,        // Poll every 30 seconds
  startPolling,           // Apollo's startPolling function
  stopPolling,            // Apollo's stopPolling function
  enabled: true,          // Optional: conditionally enable/disable
});
```

**Features**:
- Detects tab visibility using `document.visibilitychange` event
- Automatically starts polling when tab becomes active
- Automatically stops polling when tab becomes inactive
- Cleans up on component unmount

**Benefits**:
- ✅ **Battery efficient**: No polling when user isn't looking
- ✅ **Network efficient**: Reduces unnecessary requests
- ✅ **Automatic**: No user intervention required
- ✅ **Reusable**: Works with any Apollo query

---

### 2. Apollo Client Configuration

**File**: `/app/lib/Apollo/client.ts`

Apollo Client already configured with optimal settings:

```typescript
defaultOptions: {
  watchQuery: {
    fetchPolicy: 'cache-and-network',  // Instant cache + background update
    errorPolicy: 'all',
  },
}
```

**How it works**:
1. **First load**: Returns cached data instantly (if available)
2. **Background**: Fetches fresh data from network
3. **Update**: Silently updates UI when new data arrives
4. **Result**: No loading states, seamless updates

---

### 3. Polling Intervals by Tab

Each tab polls at a different interval based on data volatility:

| Tab | Interval | Reason |
|-----|----------|--------|
| **Activity** | 15 seconds | Most volatile (votes/signatures happen frequently) |
| **Proposals** | 30 seconds | Important for active voting |
| **Candidates** | 45 seconds | Moderate update frequency |
| **Voters** | 60 seconds | Least volatile (delegate rankings change slowly) |

These intervals provide a good balance between freshness and network efficiency.

---

## Implementation Details

### Activity Tab

**File**: `/src/Apps/Nouns/Camp/utils/hooks/useActivityFeed.ts`

Fetches 4 separate GraphQL queries and combines them chronologically:

```typescript
// Poll all 4 queries together every 15 seconds
useSmartPolling({
  interval: 15000,
  startPolling: (interval) => {
    startVotesPolling(interval);
    startFeedbackPolling(interval);
    startSignaturesPolling(interval);
    startCandidateFeedbackPolling(interval);
  },
  stopPolling: () => {
    stopVotesPolling();
    stopFeedbackPolling();
    stopSignaturesPolling();
    stopCandidateFeedbackPolling();
  },
});
```

**Queries**:
- `GET_ALL_VOTES` - Proposal votes
- `GET_ALL_PROPOSAL_FEEDBACKS` - Proposal signals
- `GET_CANDIDATE_SIGNATURES` - Candidate signatures
- `GET_CANDIDATE_FEEDBACKS` - Candidate feedback

**Cache Strategy**: `cache-and-network` with `nextFetchPolicy: cache-first`
- Initial load: Network + cache
- Subsequent polls: Cache first, then network update in background

---

### Proposals Tab

**File**: `/src/Apps/Nouns/Camp/utils/hooks/useProposals.ts`

Polls proposal data and individual proposal votes:

```typescript
// Main proposals list - 30 seconds
useSmartPolling({
  interval: 30000,
  startPolling,
  stopPolling,
});
```

**Also includes**:
- `useProposal(id)` - Single proposal (no polling, fetched on-demand)
- `useProposalVotes(id)` - Proposal votes with 30-second polling
- `useHasVoted(id, voter)` - Uses Wagmi contract read (real-time)

**Cache Strategy**: `cache-and-network` with `nextFetchPolicy: cache-first`

---

### Candidates Tab

**File**: `/src/Apps/Nouns/Camp/utils/hooks/useCandidates.ts`

Polls candidate data every 45 seconds:

```typescript
useSmartPolling({
  interval: 45000,
  startPolling,
  stopPolling,
});
```

**Query**: `GET_PROPOSAL_CANDIDATES`

**Cache Strategy**: `cache-and-network` with `nextFetchPolicy: cache-first`

**Note**: Previously a mock implementation, now using real GraphQL data.

---

### Voters Tab

**File**: `/src/Apps/Nouns/Camp/utils/hooks/useVoters.ts`

Polls delegate data every 60 seconds:

```typescript
useSmartPolling({
  interval: 60000,
  startPolling,
  stopPolling,
});
```

**Queries**:
- `GET_DELEGATES` - All delegates
- `GET_TOP_DELEGATES` - Top delegates by voting power

**Cache Strategy**: `cache-and-network` with `nextFetchPolicy: cache-first`

**Also includes**:
- `useVotingPower(address)` - Uses Wagmi contract reads (real-time)
- `useDelegate(address)` - Single delegate (no polling)

---

## How It Works: User Experience

### Scenario 1: User Opens Camp App

1. **Component mounts** → Initial data load from Apollo cache (instant)
2. **Background fetch** → Fresh data loaded from Goldsky (silent)
3. **UI updates** → New data appears seamlessly (no loading state)
4. **Polling starts** → Data refreshes every N seconds (no user action)

### Scenario 2: User Switches Tabs

1. **Tab becomes inactive** → Polling stops automatically
2. **User switches back** → Polling resumes automatically
3. **Fresh data appears** → No reload needed

### Scenario 3: User Closes/Reopens Tab

1. **Tab closes** → Component unmounts, polling stops
2. **User reopens tab** → Component remounts
3. **Fresh data loads** → Cache + network fetch
4. **Polling resumes** → Data stays fresh

### Scenario 4: New Vote Happens

1. **Vote submitted** → Transaction confirmed on-chain
2. **Goldsky indexes** → ~5-10 second delay
3. **Next poll** → Fresh data includes new vote
4. **UI updates** → New vote appears (15-60s total delay)

**Total delay**: 15-70 seconds depending on tab
- Activity: ~20-25 seconds
- Proposals: ~35-40 seconds
- Candidates: ~50-55 seconds
- Voters: ~65-70 seconds

This is acceptable for governance monitoring and matches industry standards.

---

## Benefits

### ✅ User Experience

- **No manual refresh** - Data just appears
- **No loading spinners** - Seamless updates
- **No "New data available" banners** - Clean UI
- **Battery efficient** - Stops when inactive
- **Network efficient** - Smart intervals

### ✅ Developer Experience

- **Reusable hook** - `useSmartPolling` works anywhere
- **Type-safe** - Full TypeScript support
- **Easy to maintain** - Single source of truth
- **Easy to test** - Pure functions and hooks
- **Easy to adjust** - Change intervals in one place

### ✅ Performance

- **Instant initial load** - Apollo cache
- **Background updates** - Non-blocking
- **Optimized queries** - Paginated and filtered
- **Smart caching** - Reduces redundant fetches
- **Resource conscious** - Stops when not needed

---

## Testing Checklist

### ✅ Component Mount/Unmount
- [x] Data loads on initial mount
- [x] Polling starts automatically
- [x] Polling stops on unmount
- [x] No memory leaks

### ✅ Tab Visibility
- [x] Polling stops when tab inactive
- [x] Polling resumes when tab active
- [x] Event listener cleanup on unmount

### ✅ Data Updates
- [x] Activity tab polls every 15s
- [x] Proposals tab polls every 30s
- [x] Candidates tab polls every 45s
- [x] Voters tab polls every 60s
- [x] UI updates seamlessly (no loading states)

### ✅ Cache Behavior
- [x] Initial load returns cached data instantly
- [x] Background fetch updates cache
- [x] UI updates when new data arrives
- [x] No duplicate requests

### ✅ Error Handling
- [x] Network errors don't break polling
- [x] Retries with exponential backoff
- [x] Errors logged to console
- [x] UI remains functional

---

## Alternatives Considered

### ❌ GraphQL Subscriptions (WebSocket)

**Why not**: Goldsky doesn't support subscriptions.

**If it did**:
```typescript
const { data } = useSubscription(PROPOSAL_VOTE_SUBSCRIPTION);
```

**Pros**: Instant updates (< 1 second)  
**Cons**: Not available with Goldsky

---

### ❌ Goldsky Webhooks

**Why not**: Requires server-side infrastructure and broadcast mechanism.

**How it would work**:
```typescript
// Server-side webhook endpoint
POST /api/webhooks/goldsky
→ Receive event from Goldsky
→ Broadcast to connected clients
→ Clients update instantly
```

**Pros**: Push-based (efficient)  
**Cons**: Complex setup, needs server infra, not ideal for Vercel serverless

---

### ❌ Manual Refresh Button

**Why not**: Poor UX, requires user action.

**Cons**:
- User has to remember to refresh
- Outdated data until refresh
- Clunky UI element
- Breaks flow

---

### ✅ Smart Polling (Chosen Solution)

**Pros**:
- ✅ Works with Goldsky as-is
- ✅ No server-side changes needed
- ✅ Automatic and seamless
- ✅ Battery and network efficient
- ✅ Easy to implement and maintain
- ✅ Acceptable latency (15-60s)

**Cons**:
- ⚠️ Not instant (15-60s delay)
- ⚠️ More network requests than webhooks

**Verdict**: Best balance of simplicity, reliability, and UX for a governance app.

---

## Future Enhancements

### Phase 2: Optimistic Updates

For user actions (voting, signing), show immediate UI feedback before confirmation:

```typescript
// Optimistic update on vote submission
await castVote(proposalId, support);

// Immediately add vote to local cache
cache.writeQuery({
  query: GET_VOTES,
  data: {
    votes: [...existingVotes, newVote],
  },
});
```

### Phase 3: Cross-Tab Synchronization

Use `BroadcastChannel` API to sync data across multiple tabs:

```typescript
const channel = new BroadcastChannel('nouns-camp');

// Tab 1 receives new data
channel.postMessage({ type: 'DATA_UPDATED', tab: 'proposals' });

// Tab 2 refetches
channel.onmessage = (event) => {
  if (event.data.type === 'DATA_UPDATED') {
    refetch();
  }
};
```

### Phase 4: Adaptive Polling

Adjust intervals based on activity:

```typescript
// If user is actively voting, poll faster
const interval = isActiveSession ? 10000 : 30000;
```

---

## Summary

We've successfully implemented **seamless real-time updates** for all 4 Camp tabs using smart polling with Apollo Client. This provides a **clean, battery-efficient, user-friendly** experience without requiring manual refresh buttons or disruptive loading states.

**Key Points**:
- ✅ **No GraphQL subscriptions** (Goldsky limitation)
- ✅ **Smart polling** with tab visibility detection
- ✅ **Optimized intervals** (15-60s based on volatility)
- ✅ **Apollo caching** for instant UI + background updates
- ✅ **No manual refresh** or loading banners
- ✅ **Battery and network efficient**

**Result**: A governance monitoring app that **just works™** and keeps data fresh automatically.

---

## Files Changed

### New Files
- `/src/Apps/Nouns/Camp/utils/hooks/useSmartPolling.ts` - Smart polling hook

### Modified Files
- `/src/Apps/Nouns/Camp/utils/hooks/useActivityFeed.ts` - Added 15s polling
- `/src/Apps/Nouns/Camp/utils/hooks/useProposals.ts` - Added 30s polling
- `/src/Apps/Nouns/Camp/utils/hooks/useCandidates.ts` - Replaced mock with real data + 45s polling
- `/src/Apps/Nouns/Camp/utils/hooks/useVoters.ts` - Added 60s polling

### Configuration
- `/app/lib/Apollo/client.ts` - Already optimal (no changes needed)
- `/app/lib/Nouns/Goldsky/NounsApolloWrapper.tsx` - Using existing Apollo setup

---

**Implemented by**: Claude (Sonnet 4.5)  
**Requested by**: Berry  
**Project**: Nouns OS - Camp Governance App

