# Tabs Interactive Functions - Implementation Plan

## Current Status

We've built the UI framework for interactive contract functions in Tabs:
- ✅ `FunctionExecutor.tsx` - Modal UI with input fields, validation, transaction execution
- ✅ `FunctionExecutor.module.css` - Mac OS 8 styled interface
- ✅ `ContractHelpers.tsx` - Updated to use FunctionExecutor
- ✅ `contractFunctions.ts` - Mapping layer between UI and contract helpers
- ✅ Treasury read functions added (getDelay, getAdmin, etc.)

## The Issue (Not Actually A Problem!)

The linter errors revealed that many helper modules are **incomplete**. They have:
- ✅ Transaction preparation functions (`prepareX`)
- ✅ Utility/formatting functions
- ❌ Missing: Direct contract read functions for `useReadContract`

**This isn't a problem with our approach - it's just incomplete implementation!**

## The Solution

Systematically add the missing functions to each helper module. Pattern:

```typescript
// In /app/lib/Nouns/Contracts/utils/[contract]/read.ts

/**
 * Get [something] from contract
 */
export function get[Something](param?: Type) {
  return {
    address: NOUNS_CONTRACTS.mainnet.[contract],
    abi: [Contract]ABI,
    functionName: '[functionName]',
    args: param ? [param] : undefined
  } as const;
}
```

## Missing Functions By Module

### 1. Governance (`/governance/read.ts`)
**Missing Read Functions:**
- `getProposalState(proposalId)` ✅ (exists as getProposalStateName, add getProposalState)
- `getProposalDetails(proposalId)`
- `getVotingPower(account)`
- `getQuorumVotes(proposalId)`
- `hasVoted(proposalId, voter)`
- `getProposalThreshold()`
- `getForkThreshold()`

**Missing Write Functions:**
- `prepareCastVote(proposalId, support)`
- `prepareCastVoteWithReason(proposalId, support, reason)`
- `prepareQueueProposal(proposalId)`
- `prepareExecuteProposal(proposalId)`

### 2. Token (`/token/read.ts`)
**Missing Read Functions:**
- `getBalance(owner)`
- `getVotingPower(account)`
- `getDelegate(account)`
- `getTotalSupply()`

**Missing Write Functions:**
- `prepareDelegateVotes(delegatee)`
- `prepareTransferToken(to, tokenId)`

### 3. Auction (`/auction/read.ts`)
**Missing Read Functions:**
- `getCurrentAuction()`
- `getReservePrice()`
- `getTimeBuffer()`
- `getMinBidIncrement()`
- `isPaused()`

**Missing Write Functions:**
- `prepareCreateBid(nounId)`
- `prepareSettleAuction()`

### 4. Data Proxy (`/dataproxy/read.ts`)
**Missing Read Functions:**
- `getCreateCandidateCost()`
- `getUpdateCandidateCost()`

**Missing Write Functions:**
- `prepareCreateProposalCandidate(description, slug)`

## Implementation Strategy

**Phase 1: Core Functions (30 min)**
1. ✅ Treasury - DONE
2. Governance (most critical - 11 functions)
3. Token (basic reads - 6 functions)

**Phase 2: User-Facing Functions (20 min)**
4. Auction (active bidding - 7 functions)
5. Data Proxy (proposal candidates - 3 functions)

**Phase 3: Testing & Polish (15 min)**
6. Test each function in Tabs UI
7. Add loading states and better error messages
8. Document common patterns

## Benefits of This Approach

1. **Complete Helper System** - Once done, ANY app can use these helpers
2. **Type Safety** - Full TypeScript support with wagmi
3. **Reusability** - One implementation, infinite uses
4. **Maintainability** - Clear structure, easy to update
5. **No Workarounds** - Proper implementation, not hacks

## Next Steps

1. Add missing functions to governance/read.ts
2. Add missing functions to governance/write.ts
3. Continue through each module
4. Test in Tabs UI
5. Celebrate! 🎉

## Why This is Better Than Simplifying

**Simplified approach would give us:**
- Quick demo
- Limited functionality
- Technical debt
- Need to rewrite later

**Complete approach gives us:**
- Production-ready system
- Full contract coverage
- Reusable across entire app
- Foundation for future features

**The work is the same - might as well do it right!** 🚀

