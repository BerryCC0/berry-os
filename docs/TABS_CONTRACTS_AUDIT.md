# Tabs Contracts Audit & Implementation Plan

**Date**: 2025-10-05  
**Purpose**: Comprehensive audit of all Nouns DAO contracts to ensure Tabs app has complete coverage

---

## Executive Summary

**Current Status**: ✅ All 13 mainnet contracts have ABIs  
**Helper Coverage**: ⚠️ Partial - only 4 core contracts have helpers  
**Contracts in Tabs**: ⚠️ Missing implementations and some auxiliary contracts

---

## 1. Complete Contract Inventory

### Core Contracts (Priority 1)

| Contract | Address | ABI | Helpers | In Tabs | Status |
|----------|---------|-----|---------|---------|--------|
| **Nouns Token** | `0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03` | ✅ | ✅ Full | ✅ | Complete |
| **Auction House (Proxy)** | `0x830BD73E4184ceF73443C15111a1DF14e495C706` | ✅ | ✅ Full | ✅ | Complete |
| **DAO Governor (Proxy)** | `0x6f3E6272A167e8AcCb32072d08E0957F9c79223d` | ✅ | ✅ Full | ✅ | Complete |
| **Treasury (Proxy)** | `0xb1a32FC9F9D8b2cf86C068Cae13108809547ef71` | ✅ | ⚠️ Partial | ✅ | Needs helpers |
| **Data Proxy (Proxy)** | `0xf790A5f59678dd733fb3De93493A91f472ca1365` | ✅ | ✅ Full | ✅ | Complete |

### Financial Contracts (Priority 2)

| Contract | Address | ABI | Helpers | In Tabs | Status |
|----------|---------|-----|---------|---------|--------|
| **Token Buyer** | `0x4f2acdc74f6941390d9b1804fabc3e780388cfe5` | ✅ | ❌ None | ✅ | Needs helpers |
| **Payer** | `0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D` | ✅ | ❌ None | ✅ | Needs helpers |
| **Stream Factory** | `0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff` | ✅ | ❌ None | ✅ | Needs helpers |
| **Client Rewards (Proxy)** | `0x883860178F95d0C82413eDc1D6De530cB4771d55` | ✅ | ❌ None | ✅ | Needs helpers |

### Art & Metadata (Priority 3)

| Contract | Address | ABI | Helpers | In Tabs | Status |
|----------|---------|-----|---------|---------|--------|
| **Descriptor V3** | `0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac` | ✅ | ⚠️ Partial | ✅ | Needs helpers |
| **Seeder** | `0xCC8a0FB5ab3C7132c1b2A0109142Fb112c4Ce515` | ✅ | ❌ None | ❌ | **MISSING FROM TABS** |

### Fork Mechanism (Priority 4)

| Contract | Address | ABI | Helpers | In Tabs | Status |
|----------|---------|-----|---------|---------|--------|
| **Fork Escrow** | `0x44d97D22B3d37d837cE4b22773aAd9d1566055D9` | ✅ | ❌ None | ✅ | Needs helpers |
| **Fork DAO Deployer** | `0xcD65e61f70e0b1Aa433ca1d9A6FC2332e9e73cE3` | ✅ | ❌ None | ✅ | Needs helpers |

### Legacy (Priority 5)

| Contract | Address | ABI | Helpers | In Tabs | Status |
|----------|---------|-----|---------|---------|--------|
| **Treasury V1** | `0x0BC3807Ec262cB779b38D65b38158acC3bfedE10` | ✅ | ❌ None | ✅ | Needs helpers |

### Implementation Contracts (Not in Tabs)

| Contract | Type | Address | Notes |
|----------|------|---------|-------|
| **Auction Implementation** | Implementation | `0x1D835808ddCa38fbE14e560D8e25b3D256810aF0` | Same ABI as proxy |
| **DAO Governor Implementation** | Implementation | `0xA23e8A919D29d74Ee24d909D80f4bC8778d656d1` | Same ABI as proxy |
| **Treasury Implementation** | Implementation | `0x0FB7CF84F171154cBC3F553aA9Df9b0e9076649D` | Same ABI as proxy |
| **Data Proxy Implementation** | Implementation | `0x513e9277192767eb4dc044A08da8228862828150` | Same ABI as proxy |
| **Client Rewards Implementation** | Implementation | `0xaaF173E6b65aa4473C830EDB402D26B7A33c5E94` | Same ABI as proxy |

---

## 2. Missing from Tabs

### 🚨 Contracts Not Listed in Tabs

1. **Nouns Seeder** (`0xCC8a0FB5ab3C7132c1b2A0109142Fb112c4Ce515`)
   - Generates pseudorandom seeds for Noun traits
   - Should be in Tabs under "Art & Descriptor" section

### 💡 Should We Add Implementation Contracts?

**Recommendation**: **NO** - Keep only proxy addresses in Tabs
- Users interact with proxies, not implementations
- Implementations are for reference/advanced users only
- Can add a "View Implementation" link next to proxy contracts
- Reduces clutter and confusion

---

## 3. Function Coverage Analysis

### ✅ Fully Covered Contracts

#### **Nouns Token** (54 functions)
**Read Functions** (35):
- ✅ `balanceOf`, `ownerOf`, `totalSupply`
- ✅ `seeds`, `dataURI`, `tokenURI`
- ✅ `delegates`, `getCurrentVotes`, `getPriorVotes`
- ✅ `getApproved`, `isApprovedForAll`
- ✅ `name`, `symbol`, `decimals`
- ✅ All ERC-721 read functions

**Write Functions** (19):
- ✅ `delegate`, `delegateBySig`
- ✅ `transfer`, `transferFrom`, `safeTransferFrom`
- ✅ `approve`, `setApprovalForAll`
- ✅ All ERC-721 write functions

#### **Auction House** (38 functions)
**Read Functions** (15):
- ✅ `auction`, `auctionStorage`
- ✅ `getPrices`, `getSettlements`
- ✅ `biddingClient`, `duration`, `timeBuffer`
- ✅ `reservePrice`, `minBidIncrementPercentage`
- ✅ `paused`, `owner`, `nouns`, `weth`

**Write Functions** (23):
- ✅ `createBid` (with and without clientId)
- ✅ `settleAuction`, `settleCurrentAndCreateNewAuction`
- ✅ `pause`, `unpause`
- ✅ Admin functions: `setReservePrice`, `setTimeBuffer`, etc.

#### **DAO Governor** (72 functions)
**Read Functions** (42):
- ✅ `proposals`, `proposalsV3`
- ✅ `state`, `getActions`, `getReceipt`
- ✅ `proposalCount`, `proposalThreshold`, `quorumVotes`
- ✅ `votingDelay`, `votingPeriod`
- ✅ `getDynamicQuorumParamsAt`
- ✅ `forkThreshold`, `forkPeriod`, `forkEndTimestamp`
- ✅ All fork-related reads

**Write Functions** (30):
- ✅ `propose`, `proposeBySigs`, `proposeOnTimelockV1`
- ✅ `castVote`, `castRefundableVote`, `castVoteWithReason`
- ✅ `queue`, `execute`, `cancel`, `veto`
- ✅ `updateProposal`, `updateProposalDescription`, `updateProposalTransactions`
- ✅ `executeFork`, `joinFork`, `escrowToFork`, `withdrawFromForkEscrow`

#### **Data Proxy** (24 functions)
**Read Functions** (9):
- ✅ `propCandidates`
- ✅ `createCandidateCost`, `updateCandidateCost`
- ✅ `feeRecipient`, `dunaAdmin`
- ✅ `nounsDao`, `nounsToken`, `owner`

**Write Functions** (15):
- ✅ `createProposalCandidate`, `updateProposalCandidate`, `cancelProposalCandidate`
- ✅ `addSignature`
- ✅ `sendFeedback`, `sendCandidateFeedback`
- ✅ `signalProposalCompliance`
- ✅ Admin: `setCreateCandidateCost`, `setFeeRecipient`, etc.

---

### ⚠️ Partially Covered Contracts

#### **Treasury Timelock** (18 functions)
**ABI**: ✅ Complete  
**Helpers**: ⚠️ Basic only

**Read Functions** (9):
- ✅ `admin`, `pendingAdmin`, `delay`
- ✅ `queuedTransactions`
- ✅ `GRACE_PERIOD`, `MINIMUM_DELAY`, `MAXIMUM_DELAY`, `NAME`

**Write Functions** (9):
- ⚠️ `queueTransaction` - **NEED HELPER**
- ⚠️ `executeTransaction` - **NEED HELPER**
- ⚠️ `cancelTransaction` - **NEED HELPER**
- ⚠️ `sendETH` - **NEED HELPER**
- ⚠️ `sendERC20` - **NEED HELPER**
- ❌ `acceptAdmin`, `setPendingAdmin`, `setDelay` (admin only)

**Missing Helpers**:
```typescript
// Need in /app/lib/Nouns/Contracts/utils/treasury/
- prepareQueueTransaction()
- prepareExecuteTransaction()
- prepareCancelTransaction()
- prepareSendETH()
- prepareSendERC20()
- calculateTransactionHash()
- isTransactionQueued()
- canExecuteTransaction()
```

#### **Descriptor V3** (40 functions)
**ABI**: ✅ Complete  
**Helpers**: ⚠️ Read only

**Read Functions** (30+):
- ✅ `backgroundCount`, `bodyCount`, `accessoryCount`, `headCount`, `glassesCount`
- ✅ `backgrounds`, `bodies`, `accessories`, `heads`, `glasses`
- ✅ `generateSVGImage`, `tokenURI`, `dataURI`
- ✅ `palettes`, `baseURI`, `isDataURIEnabled`

**Write Functions** (10+):
- ❌ `addManyBackgrounds`, `addManyBodies`, etc. - **NEED HELPERS**
- ❌ `setPalette`, `setBaseURI`, `toggleDataURIEnabled` (admin only)

**Missing Helpers**:
```typescript
// Need in /app/lib/Nouns/Contracts/utils/descriptor/
- prepareAddBackgrounds()
- prepareAddBodies()
- prepareAddAccessories()
- prepareAddHeads()
- prepareAddGlasses()
- parseTraitData()
- generatePreviewSVG()
```

---

### ❌ Not Covered Contracts

#### **Token Buyer** (20+ functions)
**ABI**: ✅ Complete  
**Helpers**: ❌ None

**Key Functions**:
- `buyTokens` - Convert ETH to USDC
- `getBuyQuote` - Get swap rate
- `setAdmin`, `setPayer`, `setTokensReceiver`
- `withdraw`, `withdrawToken`

**Need to Create**:
```typescript
// /app/lib/Nouns/Contracts/utils/tokenbuyer/
- read.ts: Quote functions, admin checks
- write.ts: Buy tokens, admin functions
```

#### **Payer** (15+ functions)
**ABI**: ✅ Complete  
**Helpers**: ❌ None

**Key Functions**:
- `pay` - Execute USDC payment
- `sendOrRegisterDebt` - Handle payment or debt
- `withdrawToken` - Withdraw funds
- `setAdmin`, `setTreasury`

**Need to Create**:
```typescript
// /app/lib/Nouns/Contracts/utils/payer/
- read.ts: Payment info, balances, permissions
- write.ts: Make payments, admin functions
```

#### **Stream Factory** (25+ functions)
**ABI**: ✅ Complete  
**Helpers**: ❌ None

**Key Functions**:
- `createStream` - Create payment stream
- `stopStream`, `cancelStream`
- `getStream`, `getStreams`, `getPaginatedStreams`
- `rescueERC20`, `rescueETH`

**Need to Create**:
```typescript
// /app/lib/Nouns/Contracts/utils/streaming/
- read.ts: Stream queries, status checks
- write.ts: Create/stop/cancel streams
```

#### **Client Rewards** (40+ functions)
**ABI**: ✅ Complete  
**Helpers**: ❌ None

**Key Functions**:
- `updateRewardsForProposalWritingAndVoting` - Calculate rewards
- `claimClientRewards` - Claim rewards
- `getClientBalance`, `getClientRewardsStats`
- `registerClient`, `updateDescription`

**Need to Create**:
```typescript
// /app/lib/Nouns/Contracts/utils/rewards/
- read.ts: Reward queries, balances, eligibility
- write.ts: Claim rewards, register client
```

#### **Nouns Seeder** (2 functions)
**ABI**: ✅ Complete  
**Helpers**: ❌ None

**Key Functions**:
- `generateSeed` - Generate random seed for new Noun

**Need to Create**:
```typescript
// /app/lib/Nouns/Contracts/utils/seeder/
- read.ts: Generate seed (view function)
```

#### **Fork Escrow** (15 functions)
**ABI**: ✅ Complete  
**Helpers**: ❌ None

**Key Functions**:
- `escrowToFork` - Escrow tokens for fork
- `returnTokensToOwner` - Return tokens
- `numTokensInEscrow`, `numTokensOwnedByDAO`

**Need to Create**:
```typescript
// /app/lib/Nouns/Contracts/utils/fork/
- read.ts: Escrow status, token counts
- write.ts: Escrow/return tokens
```

#### **Fork DAO Deployer** (5 functions)
**ABI**: ✅ Complete  
**Helpers**: ❌ None

**Key Functions**:
- `deployForkDAO` - Deploy new forked DAO

**Need to Create**:
```typescript
// /app/lib/Nouns/Contracts/utils/fork/
- write.ts: Deploy fork DAO
```

#### **Treasury V1 (Legacy)** (20 functions)
**ABI**: ✅ Complete  
**Helpers**: ❌ None

**Note**: Legacy contract, low priority for helpers

---

## 4. Implementation Recommendations

### Phase 1: Complete Core Contracts (Week 1)

**Priority**: 🔴 CRITICAL

1. **Treasury Timelock Helpers**
   - Location: `/app/lib/Nouns/Contracts/utils/treasury/`
   - Add: `queueTransaction`, `executeTransaction`, `cancelTransaction`, `sendETH`, `sendERC20` helpers
   - Update: `ContractHelpers.tsx` with Treasury write functions

2. **Add Nouns Seeder to Tabs**
   - Add to mainnet contracts list in `Tabs.tsx`
   - Category: "Art & Metadata"
   - Create helpers in `/app/lib/Nouns/Contracts/utils/seeder/`

### Phase 2: Financial Contracts (Week 2)

**Priority**: 🟠 HIGH

3. **Token Buyer Helpers**
   - Create `/app/lib/Nouns/Contracts/utils/tokenbuyer/`
   - Read: `getBuyQuote`, admin checks
   - Write: `buyTokens`, admin functions

4. **Payer Helpers**
   - Create `/app/lib/Nouns/Contracts/utils/payer/`
   - Read: Payment info, balances
   - Write: `pay`, `sendOrRegisterDebt`, admin functions

5. **Stream Factory Helpers**
   - Create `/app/lib/Nouns/Contracts/utils/streaming/`
   - Read: Stream queries, paginated streams
   - Write: `createStream`, `stopStream`, `cancelStream`

6. **Client Rewards Helpers**
   - Create `/app/lib/Nouns/Contracts/utils/rewards/`
   - Read: Reward calculations, balances, stats
   - Write: `claimClientRewards`, `registerClient`

### Phase 3: Art & Fork (Week 3)

**Priority**: 🟡 MEDIUM

7. **Complete Descriptor Helpers**
   - Add write helpers to `/app/lib/Nouns/Contracts/utils/descriptor/`
   - Write: Add traits, set palette, toggle data URI

8. **Fork Mechanism Helpers**
   - Create `/app/lib/Nouns/Contracts/utils/fork/`
   - Read: Escrow status, token counts
   - Write: Escrow/return tokens, deploy fork

### Phase 4: Polish & Advanced (Week 4)

**Priority**: 🟢 LOW

9. **Treasury V1 Legacy Helpers** (optional)
10. **Add "View Implementation" links** for proxy contracts
11. **Create comprehensive testing suite**
12. **Add function parameter input forms**

---

## 5. Function Parameter Requirements

### Complex Function Examples

#### 1. **Propose (DAO Governor)**
```typescript
function propose(
  targets: address[],        // Contract addresses to call
  values: uint256[],         // ETH values to send
  signatures: string[],      // Function signatures
  calldatas: bytes[],        // Encoded function calls
  description: string,       // Proposal description
  clientId: uint32          // Client ID for rewards
): uint256
```
**UI Needed**: Multi-step form builder

#### 2. **Create Bid (Auction)**
```typescript
function createBid(
  nounId: uint256,          // Current auction Noun ID
  clientId: uint32          // Client ID (optional)
): void payable
```
**UI Needed**: ETH amount input + client ID selector

#### 3. **Cast Vote (DAO Governor)**
```typescript
function castRefundableVoteWithReason(
  proposalId: uint256,      // Proposal to vote on
  support: uint8,           // 0=Against, 1=For, 2=Abstain
  reason: string,           // Vote reason
  clientId: uint32          // Client ID for rewards
): void
```
**UI Needed**: Support selector + text area + client ID

#### 4. **Create Proposal Candidate (Data Proxy)**
```typescript
function createProposalCandidate(
  targets: address[],
  values: uint256[],
  signatures: string[],
  calldatas: bytes[],
  description: string,
  slug: string,             // Unique identifier
  proposalIdToUpdate: uint256  // 0 for new
): void payable
```
**UI Needed**: Same as propose + slug input + fee

---

## 6. Tabs Contract Organization

### Proposed Tabs Structure

```typescript
// Update in Tabs.tsx
const mainnetContracts = [
  // CORE (Priority 1)
  {
    name: "Nouns Token [ERC-721 + Delegation]",
    address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03",
    priority: 1
  },
  {
    name: "Auction House [Proxy]",
    address: "0x830BD73E4184ceF73443C15111a1DF14e495C706",
    implementation: "0x1D835808ddCa38fbE14e560D8e25b3D256810aF0",
    priority: 1
  },
  {
    name: "DAO Governor [Proxy, Proposing/Voting]",
    address: "0x6f3E6272A167e8AcCb32072d08E0957F9c79223d",
    implementation: "0xA23e8A919D29d74Ee24d909D80f4bC8778d656d1",
    priority: 1
  },
  {
    name: "Treasury [Proxy, Executor/Timelock]",
    address: "0xb1a32FC9F9D8b2cf86C068Cae13108809547ef71",
    implementation: "0x0FB7CF84F171154cBC3F553aA9Df9b0e9076649D",
    priority: 1
  },
  {
    name: "Data Proxy [Proxy, Candidates/Feedback]",
    address: "0xf790A5f59678dd733fb3De93493A91f472ca1365",
    implementation: "0x513e9277192767eb4dc044A08da8228862828150",
    priority: 1
  },
  
  // FINANCIAL (Priority 2)
  {
    name: "Token Buyer [ETH → USDC]",
    address: "0x4f2acdc74f6941390d9b1804fabc3e780388cfe5",
    priority: 2
  },
  {
    name: "Payer [USDC Payments]",
    address: "0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D",
    priority: 2
  },
  {
    name: "Stream Factory [Payment Streams]",
    address: "0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff",
    priority: 2
  },
  {
    name: "Client Rewards [Proxy]",
    address: "0x883860178F95d0C82413eDc1D6De530cB4771d55",
    implementation: "0xaaF173E6b65aa4473C830EDB402D26B7A33c5E94",
    priority: 2
  },
  
  // ART & METADATA (Priority 3)
  {
    name: "Descriptor [Traits/Artwork, v3]",
    address: "0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac",
    priority: 3
  },
  {
    name: "Seeder [Random Trait Generation]",  // ⚠️ MISSING - ADD THIS
    address: "0xCC8a0FB5ab3C7132c1b2A0109142Fb112c4Ce515",
    priority: 3
  },
  
  // FORK MECHANISM (Priority 4)
  {
    name: "Fork Escrow",
    address: "0x44d97D22B3d37d837cE4b22773aAd9d1566055D9",
    priority: 4
  },
  {
    name: "Fork DAO Deployer",
    address: "0xcD65e61f70e0b1Aa433ca1d9A6FC2332e9e73cE3",
    priority: 4
  },
  
  // LEGACY (Priority 5)
  {
    name: "Treasury V1 [Legacy]",
    address: "0x0BC3807Ec262cB779b38D65b38158acC3bfedE10",
    priority: 5
  }
];
```

---

## 7. Next Steps

### Immediate Actions

1. **Add Nouns Seeder to Tabs** (5 min)
2. **Create helper file structure** (30 min)
   ```bash
   mkdir -p app/lib/Nouns/Contracts/utils/{treasury,tokenbuyer,payer,streaming,rewards,seeder,fork}
   ```
3. **Implement Treasury helpers** (2 hours)
4. **Update ContractHelpers.tsx** with new functions (1 hour)

### Testing Checklist

- [ ] Every contract has complete ABIs
- [ ] Every contract is listed in Tabs
- [ ] Every read function has a helper
- [ ] Every write function has a helper
- [ ] All helpers have TypeScript types
- [ ] All helpers are tested with mainnet data
- [ ] UI can render all function inputs
- [ ] UI can display all function outputs

---

## 8. Summary

**Total Contracts**: 15 (13 main + 2 external references)  
**In Tabs**: 13/14 (missing Seeder)  
**Complete ABIs**: 15/15 ✅  
**Complete Helpers**: 4/15 (27%)  

**Work Required**:
- Add 1 contract to Tabs (Seeder)
- Create helpers for 11 contracts
- Estimated: 40-60 hours of development

**Priority Order**:
1. 🔴 Treasury Timelock (critical for DAO operations)
2. 🔴 Add Seeder to Tabs (missing contract)
3. 🟠 Financial contracts (high user value)
4. 🟡 Art & Fork (medium priority)
5. 🟢 Legacy & polish (low priority)

---

**Author**: Claude (with Berry Team)  
**Status**: Ready for Implementation

