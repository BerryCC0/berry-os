# Nouns DAO Subgraph Integration

Complete business logic implementation for the Nouns DAO subgraph with Apollo Client.

## Overview

This module provides a comprehensive set of utilities for interacting with the Nouns DAO subgraph, including:

- **Apollo Client** configuration with error handling and retry logic
- **GraphQL queries** for all Nouns DAO entities
- **Business logic utilities** for Nouns, Auctions, Proposals, Votes, Delegates, and Accounts
- **TypeScript types** for complete type safety

## Project Structure

```
app/lib/nouns/
├── apolloClient.ts              # Apollo Client configuration
├── queries.ts                   # GraphQL queries & fragments
├── utils/
│   ├── types.ts                 # TypeScript type definitions
│   ├── noun.ts                  # Noun entity utilities
│   ├── auction.ts               # Auction & bid utilities
│   ├── proposal.ts              # Proposal utilities
│   ├── vote.ts                  # Vote utilities
│   ├── delegate.ts              # Delegate utilities
│   ├── account.ts               # Account utilities
│   └── index.ts                 # Central exports
├── index.ts                     # Main export
└── README.md                    # This file
```

## Installation

The required dependencies are already installed:

```bash
npm install @apollo/client graphql viem
```

## Quick Start

### 1. Import the Apollo Client

```typescript
import { nounsApolloClient } from '@/app/lib/nouns';
```

### 2. Use GraphQL Queries

```typescript
import { useQuery } from '@apollo/client';
import { GET_NOUNS, noun } from '@/app/lib/nouns';

function NounsList() {
  const { data, loading, error } = useQuery(GET_NOUNS, {
    variables: { first: 10 },
    client: nounsApolloClient,
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.nouns.map((n) => (
        <div key={n.id}>
          <h3>{noun.getNounDisplayName(n)}</h3>
          <p>Owner: {noun.getNounOwner(n)}</p>
          <p>Created: {noun.formatCreatedDate(n)}</p>
        </div>
      ))}
    </div>
  );
}
```

### 3. Use Business Logic Utilities

```typescript
import { noun, auction, proposal, vote } from '@/app/lib/nouns';

// Noun utilities
const traits = noun.getNounTraits(myNoun);
const rarityScore = noun.getOverallRarityScore(myNoun, allNouns);
const imageUrl = noun.getNounImageUrl(myNoun);

// Auction utilities
const isActive = auction.isActive(myAuction);
const timeRemaining = auction.formatTimeRemaining(myAuction);
const highestBid = auction.getHighestBid(myAuction);

// Proposal utilities
const canVote = proposal.canBeVotedOn(myProposal);
const hasQuorum = proposal.hasReachedQuorum(myProposal);
const forPercentage = proposal.getForPercentage(myProposal);

// Vote utilities
const isFor = vote.isFor(myVote);
const votingPower = vote.formatVotingPower(myVote);
const reason = vote.getReason(myVote);
```

## Available Queries

### Noun Queries

```typescript
import { GET_NOUN, GET_NOUNS, GET_NOUNS_BY_OWNER } from '@/app/lib/nouns';

// Get single Noun
const { data } = useQuery(GET_NOUN, {
  variables: { id: '42' },
  client: nounsApolloClient,
});

// Get multiple Nouns with pagination
const { data } = useQuery(GET_NOUNS, {
  variables: {
    first: 10,
    skip: 0,
    orderBy: 'createdAtTimestamp',
    orderDirection: 'desc',
  },
  client: nounsApolloClient,
});

// Get Nouns by owner
const { data } = useQuery(GET_NOUNS_BY_OWNER, {
  variables: {
    owner: '0x...',
    first: 10,
  },
  client: nounsApolloClient,
});
```

### Auction Queries

```typescript
import {
  GET_AUCTION,
  GET_AUCTIONS,
  GET_CURRENT_AUCTION,
  GET_AUCTION_BIDS,
} from '@/app/lib/nouns';

// Get current auction
const { data } = useQuery(GET_CURRENT_AUCTION, {
  client: nounsApolloClient,
});

// Get auction by ID
const { data } = useQuery(GET_AUCTION, {
  variables: { id: '42' },
  client: nounsApolloClient,
});

// Get auction bids
const { data } = useQuery(GET_AUCTION_BIDS, {
  variables: { auctionId: '42', first: 100 },
  client: nounsApolloClient,
});
```

### Proposal Queries

```typescript
import {
  GET_PROPOSAL,
  GET_PROPOSALS,
  GET_ACTIVE_PROPOSALS,
  GET_PROPOSALS_BY_PROPOSER,
} from '@/app/lib/nouns';

// Get active proposals
const { data } = useQuery(GET_ACTIVE_PROPOSALS, {
  variables: { first: 10 },
  client: nounsApolloClient,
});

// Get proposal by ID (includes votes)
const { data } = useQuery(GET_PROPOSAL, {
  variables: { id: '123' },
  client: nounsApolloClient,
});

// Get proposals by proposer
const { data } = useQuery(GET_PROPOSALS_BY_PROPOSER, {
  variables: { proposer: '0x...', first: 10 },
  client: nounsApolloClient,
});
```

### Vote Queries

```typescript
import {
  GET_VOTES,
  GET_VOTES_BY_VOTER,
  GET_VOTES_BY_PROPOSAL,
} from '@/app/lib/nouns';

// Get votes by voter
const { data } = useQuery(GET_VOTES_BY_VOTER, {
  variables: { voter: '0x...', first: 10 },
  client: nounsApolloClient,
});

// Get votes by proposal
const { data } = useQuery(GET_VOTES_BY_PROPOSAL, {
  variables: { proposalId: '123', first: 100 },
  client: nounsApolloClient,
});
```

### Delegate Queries

```typescript
import { GET_DELEGATE, GET_DELEGATES, GET_TOP_DELEGATES } from '@/app/lib/nouns';

// Get top delegates
const { data } = useQuery(GET_TOP_DELEGATES, {
  variables: { first: 20 },
  client: nounsApolloClient,
});

// Get delegate by address
const { data } = useQuery(GET_DELEGATE, {
  variables: { id: '0x...' },
  client: nounsApolloClient,
});
```

### Account Queries

```typescript
import { GET_ACCOUNT, GET_ACCOUNTS } from '@/app/lib/nouns';

// Get account by address
const { data } = useQuery(GET_ACCOUNT, {
  variables: { id: '0x...' },
  client: nounsApolloClient,
});

// Get all accounts (paginated)
const { data } = useQuery(GET_ACCOUNTS, {
  variables: { first: 10, orderBy: 'tokenBalanceRaw', orderDirection: 'desc' },
  client: nounsApolloClient,
});
```

### Governance Queries

```typescript
import { GET_GOVERNANCE, GET_DAO_STATS } from '@/app/lib/nouns';

// Get governance configuration
const { data } = useQuery(GET_GOVERNANCE, {
  client: nounsApolloClient,
});

// Get DAO statistics
const { data } = useQuery(GET_DAO_STATS, {
  client: nounsApolloClient,
});
```

## Business Logic API

### Noun Utilities

```typescript
import { noun } from '@/app/lib/nouns';

// Validation
noun.isValidNoun(obj);
noun.isValidSeed(seed);

// Properties
noun.getNounIdAsNumber(noun);
noun.getNounOwner(noun);
noun.isOwnedBy(noun, address);
noun.getNounTraits(noun);
noun.getNounSeed(noun);

// Seeds
noun.seedsAreEqual(seed1, seed2);
noun.filterByTrait(nouns, 'background', 0);
noun.filterByBackground(nouns, 0);
noun.filterByBody(nouns, 1);

// Timestamps
noun.getCreatedDate(noun);
noun.getCreatedBlock(noun);
noun.formatCreatedDate(noun);
noun.getNounAge(noun);

// Filtering & Sorting
noun.filterByOwner(nouns, address);
noun.filterByIdRange(nouns, 0, 100);
noun.sortByIdAsc(nouns);
noun.sortByIdDesc(nouns);
noun.sortByNewest(nouns);
noun.sortByOldest(nouns);

// Trait Analysis
noun.getUniqueTraitValues(nouns, 'background');
noun.getTraitDistribution(nouns, 'body');
noun.getRarestTraitValue(nouns, 'accessory');
noun.getMostCommonTraitValue(nouns, 'head');
noun.getTraitRarityScore(noun, allNouns, 'glasses');
noun.getOverallRarityScore(noun, allNouns);

// Search
noun.findNounById(nouns, 42);
noun.findSimilarNouns(noun, allNouns, 3);

// Display
noun.getNounDisplayName(noun);
noun.getNounImageUrl(noun);
noun.getNounOpenSeaUrl(noun);
noun.getNounNounsWtfUrl(noun);
noun.getNounSummary(noun);
```

### Auction Utilities

```typescript
import { auction } from '@/app/lib/nouns';

// Validation
auction.isValidAuction(obj);
auction.isValidBid(bid);

// Status
auction.isActive(auction);
auction.hasEnded(auction);
auction.isSettled(auction);
auction.getTimeRemaining(auction);
auction.formatTimeRemaining(auction);

// Amounts
auction.getCurrentBidETH(auction);
auction.getBidAmountETH(bid);
auction.formatBidAmount(bid);
auction.formatCurrentBid(auction);
auction.getMinimumNextBid(auction);

// Bids
auction.getHighestBid(auction);
auction.getWinningBidder(auction);
auction.isWinningBidder(auction, address);
auction.getBidCount(auction);
auction.getUniqueBiddersCount(auction);
auction.hasBid(auction, address);
auction.getBidsByAddress(auction, address);

// Sorting
auction.sortBidsByAmountDesc(bids);
auction.sortBidsByTimeDesc(bids);
auction.sortByNewest(auctions);
auction.sortByHighestBid(auctions);

// Filtering
auction.filterBySettled(auctions, true);
auction.getActiveAuctions(auctions);
auction.getSettledAuctions(auctions);
auction.filterByMinimumBid(auctions, '1.0');

// Statistics
auction.getAverageAuctionPrice(auctions);
auction.getTotalVolume(auctions);
auction.getHighestAuctionPrice(auctions);

// Display
auction.getAuctionDisplayName(auction);
auction.getAuctionSummary(auction);
auction.getAuctionUrl(auction);
```

### Proposal Utilities

```typescript
import { proposal } from '@/app/lib/nouns';

// Validation
proposal.isValidProposal(obj);

// Status
proposal.isPending(proposal);
proposal.isActive(proposal);
proposal.isSucceeded(proposal);
proposal.isExecuted(proposal);
proposal.canBeVotedOn(proposal);
proposal.isFinalized(proposal);

// Vote Counting
proposal.getForVotes(proposal);
proposal.getAgainstVotes(proposal);
proposal.getAbstainVotes(proposal);
proposal.getTotalVotes(proposal);
proposal.hasReachedQuorum(proposal);
proposal.getForPercentage(proposal);
proposal.getAgainstPercentage(proposal);

// Content
proposal.getTitle(proposal);
proposal.getDescription(proposal);
proposal.getProposer(proposal);
proposal.isProposer(proposal, address);
proposal.getActionCount(proposal);
proposal.getActions(proposal);

// Filtering
proposal.filterByStatus(proposals, status);
proposal.getActiveProposals(proposals);
proposal.getExecutedProposals(proposals);
proposal.filterByProposer(proposals, address);
proposal.filterByQuorumReached(proposals);

// Sorting
proposal.sortByNewest(proposals);
proposal.sortByMostVotes(proposals);
proposal.sortByMostForVotes(proposals);

// Search
proposal.findProposalById(proposals, 123);
proposal.searchProposals(proposals, 'query');

// Display
proposal.formatStatus(proposal);
proposal.getStatusColor(proposal);
proposal.getProposalSummary(proposal);
proposal.getProposalUrl(proposal);
```

### Vote Utilities

```typescript
import { vote } from '@/app/lib/nouns';

// Validation
vote.isValidVote(obj);

// Support
vote.isFor(vote);
vote.isAgainst(vote);
vote.isAbstain(vote);
vote.getSupportString(vote);

// Weight
vote.getVotingPower(vote);
vote.formatVotingPower(vote);
vote.getNounCount(vote);

// Voter
vote.getVoter(vote);
vote.isVoter(vote, address);
vote.hasReason(vote);
vote.getReason(vote);

// Timestamps
vote.getVoteDate(vote);
vote.formatVoteDate(vote);
vote.getVoteAge(vote);

// Filtering
vote.filterBySupport(votes, support);
vote.getForVotes(votes);
vote.getAgainstVotes(votes);
vote.filterByVoter(votes, address);
vote.filterWithReasons(votes);

// Sorting
vote.sortByMostPower(votes);
vote.sortByNewest(votes);

// Statistics
vote.getTotalVotingPower(votes);
vote.getAverageVotingPower(votes);
vote.getVoteDistribution(votes);
vote.getReasonRate(votes);

// Search
vote.findVote(votes, voter, proposalId);
vote.hasVoted(votes, voter, proposalId);
vote.searchByReason(votes, query);

// Display
vote.getVoteSummary(vote);
vote.getSupportColor(vote);
vote.getSupportEmoji(vote);
```

### Delegate Utilities

```typescript
import { delegate } from '@/app/lib/nouns';

// Validation
delegate.isValidDelegate(obj);

// Voting Power
delegate.getDelegatedVotesRaw(delegate);
delegate.getDelegatedVotes(delegate);
delegate.formatDelegatedVotes(delegate);
delegate.getTokenHoldersCount(delegate);
delegate.hasVotingPower(delegate);

// Representation
delegate.getNounsRepresented(delegate);
delegate.getNounsCount(delegate);
delegate.getTokenHoldersRepresented(delegate);
delegate.representsNoun(delegate, nounId);
delegate.representsTokenHolder(delegate, address);

// Activity
delegate.getVoteCount(delegate);
delegate.getProposalCount(delegate);
delegate.hasVoted(delegate);
delegate.hasProposed(delegate);

// Filtering
delegate.filterByMinimumVotingPower(delegates, minVotes);
delegate.filterActive(delegates);
delegate.filterWithVotes(delegates);

// Sorting
delegate.sortByMostPower(delegates);
delegate.sortByMostRepresented(delegates);
delegate.sortByMostVotes(delegates);

// Statistics
delegate.getTotalVotingPower(delegates);
delegate.getAverageVotingPower(delegates);
delegate.getVotingPowerConcentration(delegates, 10);

// Search
delegate.findDelegate(delegates, address);
delegate.isDelegate(delegates, address);

// Display
delegate.getDelegateDisplayName(delegate);
delegate.getDelegateSummary(delegate);
delegate.getDelegateUrl(delegate);
```

### Account Utilities

```typescript
import { account } from '@/app/lib/nouns';

// Validation
account.isValidAccount(obj);
account.isValidAddress(address);

// Balance
account.getTokenBalanceRaw(account);
account.getTokenBalance(account);
account.ownsNouns(account);
account.getNounsOwnedCount(account);

// Delegation
account.hasDelegate(account);
account.getDelegate(account);
account.getDelegateAddress(account);
account.delegatesTo(account, address);
account.isSelfDelegated(account);

// Activity
account.getVoteCount(account);
account.getProposalCount(account);
account.hasVoted(account);
account.hasProposed(account);
account.isActive(account);

// Nouns Owned
account.getNounsOwned(account);
account.getNounIds(account);
account.ownsNoun(account, nounId);

// Filtering
account.filterOwners(accounts);
account.filterByMinimumBalance(accounts, minBalance);
account.filterWithVotes(accounts);
account.filterSelfDelegated(accounts);

// Sorting
account.sortByMostNouns(accounts);
account.sortByMostVotes(accounts);

// Statistics
account.getTotalNounsOwned(accounts);
account.getAverageNounsPerAccount(accounts);
account.getSelfDelegationRate(accounts);
account.getVotingParticipationRate(accounts);

// Search
account.findAccount(accounts, address);
account.accountExists(accounts, address);

// Display
account.formatAddress(address);
account.getAccountDisplayName(account);
account.getAccountSummary(account);
account.getEtherscanUrl(account);
account.getNounsWtfUrl(account);
```

## Architecture

### Separation of Concerns

- **Apollo Client** (`apolloClient.ts`): GraphQL client configuration
- **Queries** (`queries.ts`): All GraphQL queries and fragments
- **Types** (`utils/types.ts`): Complete TypeScript type definitions
- **Business Logic** (`utils/*.ts`): Pure functions for data manipulation

### Design Principles

1. **Pure Functions**: All utility functions are pure (no side effects)
2. **Type Safety**: Full TypeScript coverage with strict types
3. **Testability**: Functions are easily testable in isolation
4. **Reusability**: Generic utilities that work with any data source
5. **Performance**: Efficient algorithms and minimal re-computation

## Examples

See the `examples/` directory for complete usage examples:

- **Noun Gallery**: Display Nouns with trait filtering
- **Auction Monitor**: Real-time auction tracking
- **Governance Dashboard**: Proposals and voting stats
- **Delegate Leaderboard**: Top delegates by voting power

## Resources

- **Nouns DAO**: https://nouns.wtf
- **Subgraph**: https://github.com/nounsDAO/nouns-monorepo/tree/master/packages/nouns-subgraph
- **Goldsky Endpoint**: https://api.goldsky.com/api/public/project_cldf2o9pqagp43svvbk5u3kmo/subgraphs/nouns/prod/gn
- **Apollo Client Docs**: https://www.apollographql.com/docs/react/

## Contributing

When adding new utilities:

1. Add types to `utils/types.ts`
2. Create utility functions in appropriate `utils/*.ts` file
3. Export from `utils/index.ts`
4. Update this README
5. Add tests

---

**Built with ⌐◨-◨ by Berry for Nouns OS**

