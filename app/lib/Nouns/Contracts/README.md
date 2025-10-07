# Nouns DAO Smart Contracts Integration

Complete user-facing API for interacting with all Nouns DAO smart contracts on Ethereum Mainnet.

**Built for Berry OS** • Automatically includes Client ID 11 for rewards tracking

---

## 🚀 Quick Start

### Using React Hooks (Recommended)

```typescript
import { useAuctionActions } from '@/app/lib/Nouns/Contracts';

function BidButton() {
  const { createBid, currentAuction, isPending, isConfirming, isConfirmed } = useAuctionActions();
  
  const handleBid = async () => {
    try {
      await createBid(currentAuction.nounId, "1.5"); // Bid 1.5 ETH
      alert('Bid placed successfully!');
    } catch (error) {
      console.error('Bid failed:', error);
    }
  };
  
  return (
    <button onClick={handleBid} disabled={isPending || isConfirming}>
      {isPending ? 'Sending...' : isConfirming ? 'Confirming...' : 'Bid 1.5 ETH'}
    </button>
  );
}
```

### Using Actions Directly

```typescript
import { AuctionActions } from '@/app/lib/Nouns/Contracts';
import { useWriteContract } from 'wagmi';

function BidButton() {
  const { writeContractAsync } = useWriteContract();
  
  const handleBid = async () => {
    const config = AuctionActions.createBid(BigInt(123), "1.5");
    await writeContractAsync(config);
  };
  
  return <button onClick={handleBid}>Bid 1.5 ETH</button>;
}
```

---

## 📚 Core Features

### ✅ Auction House
- **Place bids** with Berry OS Client ID (11) automatically included
- **Settle auctions** and start new ones
- **Read auction state** (current bid, time remaining, etc.)

### ✅ Governance
- **Vote on proposals** (FOR, AGAINST, ABSTAIN)
- **Create proposals** with Berry OS tracking
- **Queue and execute** passed proposals
- **Update proposals** during updatable period

### ✅ Token (Nouns NFTs)
- **Delegate voting power** to any address
- **Transfer Nouns** safely
- **Check balances** and voting power

### ✅ Data Proxy
- **Create proposal candidates** (draft proposals)
- **Send feedback** on proposals and candidates
- **Update candidates** based on community input

### ✅ Client Rewards
- **Check Berry OS rewards** (Client ID 11)
- **Withdraw rewards** earned from bids and votes

---

## 🎯 Usage Examples

### Bidding on Auctions

```typescript
import { useAuctionActions } from '@/app/lib/Nouns/Contracts';

function AuctionInterface() {
  const {
    currentAuction,
    createBid,
    settleCurrentAndCreateNewAuction,
    isPending,
    isConfirming,
    isConfirmed,
    error
  } = useAuctionActions();
  
  if (!currentAuction) return <div>Loading auction...</div>;
  
  const handleBid = async (amount: string) => {
    try {
      await createBid(currentAuction.nounId, amount);
    } catch (err) {
      console.error('Bid failed:', err);
    }
  };
  
  const handleSettle = async () => {
    try {
      await settleCurrentAndCreateNewAuction();
    } catch (err) {
      console.error('Settlement failed:', err);
    }
  };
  
  return (
    <div>
      <h2>Noun {currentAuction.nounId.toString()}</h2>
      <p>Current Bid: {formatEther(currentAuction.amount)} ETH</p>
      <p>Bidder: {currentAuction.bidder}</p>
      
      <button onClick={() => handleBid("1.5")} disabled={isPending || isConfirming}>
        {isPending ? 'Bidding...' : isConfirming ? 'Confirming...' : 'Bid 1.5 ETH'}
      </button>
      
      {currentAuction.settled && (
        <button onClick={handleSettle}>Settle & Start New Auction</button>
      )}
      
      {error && <p>Error: {error.message}</p>}
      {isConfirmed && <p>✅ Transaction confirmed!</p>}
    </div>
  );
}
```

### Voting on Proposals

```typescript
import { useGovernanceActions } from '@/app/lib/Nouns/Contracts';

function VoteButtons({ proposalId }: { proposalId: bigint }) {
  const {
    voteFor,
    voteAgainst,
    voteAbstain,
    isPending,
    isConfirming,
    isConfirmed
  } = useGovernanceActions();
  
  const handleVote = async (voteFunction: (id: bigint, reason?: string) => Promise<any>) => {
    try {
      await voteFunction(proposalId, "Voting from Berry OS!");
      alert('Vote cast successfully!');
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };
  
  const disabled = isPending || isConfirming;
  
  return (
    <div>
      <button onClick={() => handleVote(voteFor)} disabled={disabled}>
        Vote FOR
      </button>
      <button onClick={() => handleVote(voteAgainst)} disabled={disabled}>
        Vote AGAINST
      </button>
      <button onClick={() => handleVote(voteAbstain)} disabled={disabled}>
        Vote ABSTAIN
      </button>
      
      {isPending && <p>Sending transaction...</p>}
      {isConfirming && <p>Waiting for confirmation...</p>}
      {isConfirmed && <p>✅ Vote confirmed!</p>}
    </div>
  );
}
```

### Delegating Voting Power

```typescript
import { useTokenActions } from '@/app/lib/Nouns/Contracts';
import { useAccount } from 'wagmi';

function DelegateInterface() {
  const { address } = useAccount();
  const { delegate, isPending, isConfirming, isConfirmed } = useTokenActions();
  const [delegatee, setDelegatee] = useState('');
  
  const handleDelegate = async () => {
    if (!delegatee) return;
    
    try {
      await delegate(delegatee as Address);
      alert('Delegation successful!');
    } catch (error) {
      console.error('Delegation failed:', error);
    }
  };
  
  const handleDelegateToSelf = async () => {
    if (!address) return;
    
    try {
      await delegate(address);
      alert('Delegated to self!');
    } catch (error) {
      console.error('Delegation failed:', error);
    }
  };
  
  return (
    <div>
      <h3>Delegate Voting Power</h3>
      
      <input
        type="text"
        placeholder="0x..."
        value={delegatee}
        onChange={(e) => setDelegatee(e.target.value)}
      />
      
      <button onClick={handleDelegate} disabled={isPending || isConfirming}>
        {isPending ? 'Delegating...' : isConfirming ? 'Confirming...' : 'Delegate'}
      </button>
      
      <button onClick={handleDelegateToSelf} disabled={isPending || isConfirming}>
        Delegate to Self
      </button>
      
      {isConfirmed && <p>✅ Delegation confirmed!</p>}
    </div>
  );
}
```

### Creating Proposals

```typescript
import { useGovernanceActions } from '@/app/lib/Nouns/Contracts';
import { Address } from 'viem';

function ProposalCreator() {
  const { propose, proposeBySigs, isPending, isConfirming, isConfirmed } = useGovernanceActions();
  
  // Simple proposal creation
  const handleCreateProposal = async () => {
    const targets = ['0x1234...'] as Address[];
    const values = [BigInt(0)];
    const signatures = ['transfer(address,uint256)'];
    const calldatas = ['0x...'] as `0x${string}`[];
    const description = '# My Proposal\n\nThis proposal will...';
    
    try {
      await propose(targets, values, signatures, calldatas, description);
      alert('Proposal created!');
    } catch (error) {
      console.error('Proposal creation failed:', error);
    }
  };
  
  // Multi-signer proposal (requires EIP-712 signatures from co-proposers)
  const handleMultiSignerProposal = async () => {
    const proposerSignatures = [
      {
        sig: '0x...' as `0x${string}`,
        signer: '0x...' as Address,
        expirationTimestamp: BigInt(Date.now() + 86400000), // 24h expiry
      },
      // Additional co-signers...
    ];
    
    const targets = ['0x1234...'] as Address[];
    const values = [BigInt(0)];
    const signatures = ['transfer(address,uint256)'];
    const calldatas = ['0x...'] as `0x${string}`[];
    const description = '# Multi-Signer Proposal\n\nCo-signed by...';
    
    try {
      await proposeBySigs(
        proposerSignatures,
        targets,
        values,
        signatures,
        calldatas,
        description
      );
      alert('Multi-signer proposal created!');
    } catch (error) {
      console.error('Proposal creation failed:', error);
    }
  };
  
  return (
    <div>
      <h3>Create Proposal</h3>
      <button onClick={handleCreateProposal} disabled={isPending || isConfirming}>
        {isPending ? 'Creating...' : isConfirming ? 'Confirming...' : 'Create Proposal'}
      </button>
      
      <button onClick={handleMultiSignerProposal} disabled={isPending || isConfirming}>
        {isPending ? 'Creating...' : isConfirming ? 'Confirming...' : 'Create Multi-Signer Proposal'}
      </button>
      
      {isConfirmed && <p>✅ Proposal created!</p>}
      <p className="note">All proposals automatically include Berry OS Client ID (11)</p>
    </div>
  );
}
```

### Sending Feedback

```typescript
import { useDataProxyActions } from '@/app/lib/Nouns/Contracts';

function FeedbackForm({ proposalId }: { proposalId: bigint }) {
  const { sendFeedback, isPending, isConfirming, isConfirmed } = useDataProxyActions();
  const [reason, setReason] = useState('');
  const [support, setSupport] = useState<number>(1); // 1 = FOR
  
  const handleSubmit = async () => {
    try {
      await sendFeedback(proposalId, support, reason);
      alert('Feedback sent!');
      setReason('');
    } catch (error) {
      console.error('Feedback failed:', error);
    }
  };
  
  return (
    <div>
      <h3>Send Feedback</h3>
      
      <select value={support} onChange={(e) => setSupport(Number(e.target.value))}>
        <option value={0}>Against</option>
        <option value={1}>For</option>
        <option value={2}>Abstain</option>
      </select>
      
      <textarea
        placeholder="Your feedback..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      
      <button onClick={handleSubmit} disabled={isPending || isConfirming}>
        {isPending ? 'Sending...' : isConfirming ? 'Confirming...' : 'Send Feedback'}
      </button>
      
      {isConfirmed && <p>✅ Feedback sent!</p>}
    </div>
  );
}
```

### Checking & Withdrawing Rewards

```typescript
import { useRewardsActions } from '@/app/lib/Nouns/Contracts';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';

function RewardsPanel() {
  const { address } = useAccount();
  const {
    berryOSBalance,
    withdrawBerryOSRewards,
    isPending,
    isConfirming,
    isConfirmed
  } = useRewardsActions();
  
  const handleWithdraw = async () => {
    if (!address) return;
    
    try {
      await withdrawBerryOSRewards(address);
      alert('Rewards withdrawn!');
    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };
  
  if (!berryOSBalance) return <div>Loading rewards...</div>;
  
  const balanceETH = formatEther(berryOSBalance);
  const hasRewards = berryOSBalance > BigInt(0);
  
  return (
    <div>
      <h3>Berry OS Rewards (Client ID 11)</h3>
      <p>Balance: {balanceETH} ETH</p>
      
      {hasRewards && (
        <button onClick={handleWithdraw} disabled={isPending || isConfirming}>
          {isPending ? 'Withdrawing...' : isConfirming ? 'Confirming...' : 'Withdraw Rewards'}
        </button>
      )}
      
      {isConfirmed && <p>✅ Withdrawal confirmed!</p>}
    </div>
  );
}
```

### Updating Rewards (Permissionless)

Anyone can trigger reward distribution! This helps keep the system up-to-date.

**Important**: Proposal rewards can only be updated every **30 days** or **10 qualified proposals** (whichever is sooner).

```typescript
import { useRewardsActions, getVotingClientIds } from '@/app/lib/Nouns/Contracts';
import { useReadContract } from 'wagmi';

function RewardUpdater() {
  const {
    nextProposalIdToReward,
    nextAuctionIdToReward,
    updateRewardsForProposalWritingAndVoting,
    updateRewardsForAuctions,
    isPending,
    isConfirming
  } = useRewardsActions();
  
  // Get the most recent ended proposal ID (e.g., from governance hook)
  const mostRecentProposalId = BigInt(150); // Example
  
  // Step 1: Get the voting client IDs for this proposal
  const { data: votingClientIds } = useReadContract(
    getVotingClientIds(mostRecentProposalId)
  );
  
  const handleUpdateProposalRewards = async () => {
    if (!votingClientIds) return;
    
    try {
      // Step 2: Use the same proposal ID and the fetched client IDs
      await updateRewardsForProposalWritingAndVoting(
        mostRecentProposalId,
        votingClientIds
      );
      alert('Proposal rewards updated!');
    } catch (error) {
      console.error('Update failed:', error);
    }
  };
  
  const handleUpdateAuctionRewards = async () => {
    try {
      // For auctions, just pass the most recent Noun ID
      const latestNounId = BigInt(1000); // Example
      await updateRewardsForAuctions(latestNounId);
      alert('Auction rewards updated!');
    } catch (error) {
      console.error('Update failed:', error);
    }
  };
  
  return (
    <div>
      <h3>Update Rewards (Help the DAO!)</h3>
      
      <div>
        <p>Next proposal to reward: {nextProposalIdToReward?.toString()}</p>
        <button 
          onClick={handleUpdateProposalRewards} 
          disabled={isPending || isConfirming || !votingClientIds}
        >
          Update Proposal Rewards
        </button>
      </div>
      
      <div>
        <p>Next auction to reward: {nextAuctionIdToReward?.toString()}</p>
        <button 
          onClick={handleUpdateAuctionRewards} 
          disabled={isPending || isConfirming}
        >
          Update Auction Rewards
        </button>
      </div>
      
      {isConfirming && <p>⏳ Confirming transaction...</p>}
    </div>
  );
}
```

---

## 🔧 Utilities

### Formatting

```typescript
import {
  formatAddress,
  formatEth,
  formatNounId,
  formatTimeRemaining,
  formatPercentage
} from '@/app/lib/Nouns/Contracts';

// Format addresses
formatAddress('0x1234567890abcdef1234567890abcdef12345678'); // '0x1234...5678'

// Format ETH amounts
formatEth(BigInt('1500000000000000000')); // '1.5000'

// Format Noun IDs
formatNounId(BigInt(123)); // 'Noun 123'

// Format time remaining
formatTimeRemaining(3665); // '1h 1m'

// Format percentages
formatPercentage(BigInt(45), BigInt(100)); // '45.00%'
```

### Calculations

```typescript
import {
  calculateMinBid,
  isAuctionActive,
  hasReachedQuorum,
  calculateVotePercentages
} from '@/app/lib/Nouns/Contracts';

// Calculate minimum bid
const minBid = calculateMinBid(
  BigInt('1000000000000000000'), // current bid (1 ETH)
  BigInt(5),                      // 5% increment
  BigInt('100000000000000000')    // 0.1 ETH reserve
);

// Check auction status
const active = isAuctionActive(auction);

// Check quorum
const reachedQuorum = hasReachedQuorum(proposal);

// Calculate vote percentages
const percentages = calculateVotePercentages(proposal);
// { for: 45.67, against: 32.11, abstain: 22.22 }
```

---

## 🌐 Farcaster MiniApp Support

**Works automatically!** The `farcasterMiniApp()` connector in our Wagmi config makes Farcaster wallets work seamlessly. No special handling needed.

```typescript
// Same code works in both regular wallets AND Farcaster MiniApps
import { useAuctionActions } from '@/app/lib/Nouns/Contracts';

function BidButton() {
  const { createBid, isPending } = useAuctionActions();
  
  // This works in:
  // ✅ MetaMask
  // ✅ WalletConnect
  // ✅ Farcaster Wallet (via MiniApp)
  // ✅ Any wagmi-compatible wallet
  
  return (
    <button onClick={() => createBid(BigInt(123), "1.5")} disabled={isPending}>
      Bid 1.5 ETH
    </button>
  );
}
```

---

## 📦 What's Included

### Actions (Transaction Builders)
Pure TypeScript functions that return wagmi-compatible transaction configs:
- `AuctionActions` - Bidding, settling
- `GovernanceActions` - Voting, proposals
- `TokenActions` - Delegation, transfers
- `DataProxyActions` - Candidates, feedback
- `RewardsActions` - Claiming rewards

### Hooks (React)
React hooks that wrap actions with transaction state management:
- `useAuctionActions()`
- `useGovernanceActions()`
- `useTokenActions()`
- `useDataProxyActions()`
- `useRewardsActions()`

### Utilities
- **Formatting**: Display-friendly text formatting
- **Calculations**: Business logic for bids, votes, quorum
- **Constants**: Berry OS Client ID (11), chain info, etc.
- **Types**: Full TypeScript definitions

### ABIs
Complete ABIs for all 16 Nouns contracts

---

## 🎨 Berry OS Integration

All write actions automatically include **Berry OS Client ID (11)** where applicable:

- ✅ **Auction bids** → Tracked with Client ID 11
- ✅ **Votes** → Tracked with Client ID 11 (refundable votes)
- ✅ **Proposals** → Tracked with Client ID 11

This means Berry OS earns rewards for all user activity!

---

## 📖 API Reference

### Hooks

#### `useAuctionActions()`
```typescript
const {
  // Data
  currentAuction,
  auctionDuration,
  minReservePrice,
  minBidIncrement,
  
  // Actions
  createBid,
  settleCurrentAndCreateNewAuction,
  settleAuction,
  
  // Status
  isPending,
  isConfirming,
  isConfirmed,
  hash,
  error,
  
  // Utils
  refetchAuction,
  resetWrite
} = useAuctionActions();
```

#### `useGovernanceActions()`
```typescript
const {
  // Data
  proposalThreshold,
  votingDelay,
  votingPeriod,
  proposalCount,
  
  // Voting Actions
  voteFor,
  voteAgainst,
  voteAbstain,
  castVote,
  castVoteWithReason,
  
  // Proposal Actions
  propose,
  queue,
  execute,
  cancel,
  veto,
  
  // Update Actions
  updateProposal,
  updateProposalDescription,
  updateProposalTransactions,
  
  // Status
  isPending,
  isConfirming,
  isConfirmed,
  hash,
  error,
  
  // Utils
  resetWrite
} = useGovernanceActions();
```

#### `useTokenActions()`
```typescript
const {
  // Data
  totalSupply,
  
  // Actions
  delegate,
  transferFrom,
  safeTransferFrom,
  approve,
  setApprovalForAll,
  
  // Status
  isPending,
  isConfirming,
  isConfirmed,
  hash,
  error,
  
  // Utils
  resetWrite
} = useTokenActions();
```

#### `useDataProxyActions()`
```typescript
const {
  // Data
  createCandidateCost,
  updateCandidateCost,
  
  // Actions
  createProposalCandidate,
  updateProposalCandidate,
  cancelProposalCandidate,
  sendFeedback,
  sendCandidateFeedback,
  
  // Status
  isPending,
  isConfirming,
  isConfirmed,
  hash,
  error,
  
  // Utils
  resetWrite
} = useDataProxyActions();
```

#### `useRewardsActions()`
```typescript
const {
  // Data
  berryOSBalance,
  berryOSClient,
  
  // Actions
  withdrawClientBalance,
  withdrawBerryOSRewards,
  
  // Status
  isPending,
  isConfirming,
  isConfirmed,
  hash,
  error,
  
  // Utils
  refetchBalance,
  resetWrite
} = useRewardsActions();
```

---

## 🔗 Contract Addresses

All contracts on **Ethereum Mainnet (Chain ID: 1)**:

| Contract | Address |
|----------|---------|
| **Nouns Token** | `0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03` |
| **Auction House** | `0x830BD73E4184ceF73443C15111a1DF14e495C706` |
| **DAO Governor** | `0x6f3E6272A167e8AcCb32072d08E0957F9c79223d` |
| **Data Proxy** | `0xf790A5f59678dd733fb3De93493A91f472ca1365` |
| **Client Rewards** | `0x883860178F95d0C82413eDc1D6De530cB4771d55` |
| **Treasury** | `0xb1a32FC9F9D8b2cf86C068Cae13108809547ef71` |

[See all contracts →](./utils/addresses.ts)

---

## 🛠️ Development

### Adding New Actions

1. Create action function in `actions/[contract].ts`
2. Export from `actions/index.ts`
3. Create hook in `hooks/use[Contract]Actions.ts`
4. Export from `hooks/index.ts`
5. Update main `index.ts`

### Testing

Manual testing recommended. Use with real wallet on mainnet or testnet.

---

## 📄 License

MIT

---

**Built with ❤️ for Berry OS**