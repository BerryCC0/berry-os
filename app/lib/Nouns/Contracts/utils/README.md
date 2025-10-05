# Nouns DAO Smart Contract Utilities

**Status**: 🚧 To be implemented once all ABIs are added

## Overview

This directory will contain helper functions, transaction writing hooks, and business logic for interacting with Nouns DAO smart contracts.

## Planned Implementation

### 1. Contract Helper Functions

For each contract, we need to create helper files with:

#### Read Functions (View/Pure)
- Functions to query contract state
- Format return values for UI consumption
- Aggregate multiple contract calls
- Cache frequently accessed data

#### Write Functions (State-changing)
- Transaction preparation helpers
- Parameter validation
- Gas estimation utilities
- Transaction simulation

#### Business Logic
- State calculations (e.g., proposal status, voting power)
- Validation logic (e.g., can user vote, can proposal execute)
- Formatting utilities (e.g., format token amounts, timestamps)
- Type conversions and transformations

### 2. Transaction Writing Hooks

React hooks for contract interactions:

#### Pattern
```typescript
// Example structure
export function useCreateProposal() {
  const { writeContract, status, error } = useWriteContract();
  
  return {
    createProposal: async (params) => {
      // Validate params
      // Prepare transaction
      // Execute
      // Handle result
    },
    isPending: status === 'pending',
    error,
  };
}
```

#### Hooks Needed
- Token operations: `useDelegate`, `useTransfer`
- Auction operations: `useCreateBid`, `useSettleAuction`
- Governance operations: `useCreateProposal`, `useCastVote`, `useExecuteProposal`
- Treasury operations: `useQueueTransaction`, `useExecuteTransaction`
- Data proxy operations: `useCreateCandidate`, `useSendFeedback`

### 3. Batch Operations

Utilities for batching multiple contract calls:
- Multi-call aggregation
- Transaction bundling
- Optimistic updates
- Error recovery

### 4. Error Handling

Comprehensive error handling:
- Contract revert reasons
- User-friendly error messages
- Error recovery strategies
- Logging and debugging

### 5. Event Parsing

Parse and format contract events:
- Event listeners
- Historical event queries
- Event filtering and sorting
- Real-time updates

## Contracts to Implement

### Priority 1: Core Protocol
- [ ] **Nouns Token** (`NounsToken.ts`)
  - Read: `balanceOf`, `ownerOf`, `delegates`, `totalSupply`, `getPriorVotes`
  - Write: `delegate`, `delegateBySig`, `transfer`, `approve`
  - Helpers: Format voting power, check delegation status

- [ ] **Auction House** (`NounsAuctionHouse.ts`)
  - Read: `auction` (current), `getSettlements`, `reservePrice`, `duration`
  - Write: `createBid`, `settleAuction`, `settleCurrentAndCreateNewAuction`
  - Helpers: Calculate minimum bid, check if auction ended, format auction data

- [ ] **DAO Governor** (`NounsDAOLogicV3.ts`)
  - Read: `proposals`, `state`, `getActions`, `proposalThreshold`, `quorumVotes`
  - Write: `propose`, `castVote`, `castRefundableVote`, `queue`, `execute`, `cancel`
  - Helpers: Calculate proposal status, check voting eligibility, format proposal data

### Priority 2: Treasury & Governance
- [ ] **Treasury (Timelock)** (`TreasuryTimelock.ts`)
  - Read: `queuedTransactions`, `delay`, `admin`
  - Write: `queueTransaction`, `executeTransaction`, `cancelTransaction`
  - Helpers: Calculate execution time, validate transaction parameters

- [ ] **Data Proxy** (`DataProxy.ts`)
  - Read: `propCandidates`, `createCandidateCost`, `updateCandidateCost`
  - Write: `createProposalCandidate`, `updateProposalCandidate`, `sendFeedback`
  - Helpers: Validate candidate data, check fees

### Priority 3: Additional Contracts
- [ ] **Nouns Descriptor** (if needed for trait/artwork generation)
- [ ] **Client Rewards** (if implementing proposal creation/voting rewards)
- [ ] **Token Buyer** (if implementing treasury operations)
- [ ] **Payer** (if implementing payment streams)
- [ ] **Fork Escrow** (if implementing fork mechanism)

## Integration with Web3 Libraries

### Wagmi / Viem
- Use `useReadContract` for read operations
- Use `useWriteContract` for state changes
- Use `useWaitForTransactionReceipt` for confirmation
- Use `useWatchContractEvent` for event listening

### Example Hook Structure
```typescript
import { useReadContract, useWriteContract } from 'wagmi';
import { NounsTokenABI } from '../abis/NounsToken';
import { NOUNS_CONTRACTS } from '../addresses';

export function useDelegate() {
  const { writeContract, ...rest } = useWriteContract();
  
  return {
    delegate: (delegatee: Address) => {
      return writeContract({
        address: NOUNS_CONTRACTS.NounsToken.address,
        abi: NounsTokenABI,
        functionName: 'delegate',
        args: [delegatee],
      });
    },
    ...rest,
  };
}
```

## Testing Strategy

Each helper and hook should have:
1. Unit tests for pure functions
2. Integration tests with forked mainnet
3. E2E tests for user flows
4. Gas optimization tests

## Documentation

Each function should include:
- JSDoc comments with parameter descriptions
- Example usage
- Expected return values
- Error cases
- Gas cost estimates (where applicable)

## Next Steps

1. **Complete ABI collection** - Get all remaining contract ABIs from Etherscan
2. **Design API surface** - Define the public interface for each helper module
3. **Implement read functions** - Start with view functions (no gas cost)
4. **Implement write functions** - Add transaction helpers with proper error handling
5. **Create hooks** - Build React hooks on top of helpers
6. **Add tests** - Comprehensive test coverage
7. **Document** - Clear documentation and examples
8. **Optimize** - Gas optimization and batching where possible

## File Structure (Planned)

```
utils/
├── README.md (this file)
├── token/
│   ├── NounsToken.ts
│   ├── useDelegate.ts
│   ├── useTransfer.ts
│   └── types.ts
├── auction/
│   ├── NounsAuctionHouse.ts
│   ├── useCreateBid.ts
│   ├── useSettleAuction.ts
│   └── types.ts
├── governance/
│   ├── NounsDAOLogicV3.ts
│   ├── useCreateProposal.ts
│   ├── useCastVote.ts
│   ├── useExecuteProposal.ts
│   └── types.ts
├── treasury/
│   ├── TreasuryTimelock.ts
│   ├── useQueueTransaction.ts
│   └── types.ts
├── data/
│   ├── DataProxy.ts
│   ├── useCreateCandidate.ts
│   └── types.ts
├── shared/
│   ├── formatting.ts
│   ├── validation.ts
│   ├── errors.ts
│   └── constants.ts
└── index.ts
```

## Notes

- Follow the repository's design principle: **separation of business logic and presentation**
- All business logic should be pure TypeScript functions (no React dependencies)
- Hooks should be thin wrappers around business logic
- Use TypeScript strictly (no `any` types)
- Optimize for readability and maintainability
- Consider gas optimization for write operations
- Handle edge cases and errors gracefully

