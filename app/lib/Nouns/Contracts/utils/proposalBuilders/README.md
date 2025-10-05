## Proposal Transaction Builders

Pure business logic functions for building proposal actions that interact with all Nouns DAO contracts.

## Purpose

These helpers make it easy for Berry OS users to create proposals and candidates by providing pre-built transaction actions. Users can select from a list of common operations instead of manually crafting contract calls.

## Structure

Each file contains builders for a specific contract category:

- **`treasury.ts`** - Send ETH/ERC20, batch distributions, treasury admin
- **`governance.ts`** - Voting parameters, quorum settings, governance config
- **`rewards.ts`** - Client approvals, reward parameters, NounsOS approval
- **`auction.ts`** - Auction config, reserve price, pause/unpause
- **`token.ts`** - Minter, descriptor, seeder settings, lock functions
- **`streaming.ts`** - Payment streams, token buying, monthly grants
- **`descriptor.ts`** - Add traits, backgrounds, renderers, lock parts

## Usage Pattern

### 1. Build Proposal Actions

```typescript
import { TreasuryBuilders, GovernanceHelpers } from '@/app/lib/Nouns/Contracts/utils';

// Build action to send 10 ETH
const sendEthAction = TreasuryBuilders.buildSendEthAction(
  '0xRecipient...' as Address,
  '10'
);

// Build action to update voting period
const updateVotingAction = GovernanceBuilders.buildSetVotingPeriodAction(
  BigInt(7200) // 7200 blocks
);

// Combine multiple actions
const combinedActions = GovernanceHelpers.combineProposalActions([
  sendEthAction,
  updateVotingAction,
]);
```

### 2. Create Proposal

```typescript
import { GovernanceHelpers } from '@/app/lib/Nouns/Contracts/utils';
import { useWriteContract } from 'wagmi';

function ProposeButton() {
  const { writeContract } = useWriteContract();
  
  const handlePropose = () => {
    // Use the actions from step 1
    const tx = GovernanceHelpers.prepareProposeTransaction(
      combinedActions,
      '# Treasury Grant\n\nSend 10 ETH to contributor and update voting period.'
    );
    
    writeContract(tx);
  };
  
  return <button onClick={handlePropose}>Create Proposal</button>;
}
```

### 3. Create Candidate

```typescript
import { DataProxyHelpers } from '@/app/lib/Nouns/Contracts/utils';
import { useWriteContract } from 'wagmi';

function CreateCandidateButton() {
  const { writeContract } = useWriteContract();
  
  const handleCreateCandidate = () => {
    const slug = DataProxyHelpers.generateSlug('My Proposal Idea');
    
    const tx = DataProxyHelpers.prepareCreateCandidateTransaction(
      slug,
      combinedActions,
      '# My Proposal Idea\n\nThis proposal will...'
    );
    
    writeContract(tx);
  };
  
  return <button onClick={handleCreateCandidate}>Create Candidate</button>;
}
```

## Examples by Category

### Treasury Operations

```typescript
import { TreasuryBuilders } from '@/app/lib/Nouns/Contracts/utils/proposalBuilders';

// Send ETH to single recipient
const action1 = TreasuryBuilders.buildSendEthAction(
  '0xRecipient...' as Address,
  '5.5' // 5.5 ETH
);

// Batch ETH distribution
const action2 = TreasuryBuilders.buildBatchEthDistribution([
  { recipient: '0xAlice...' as Address, amount: '10' },
  { recipient: '0xBob...' as Address, amount: '15' },
  { recipient: '0xCarol...' as Address, amount: '20' },
]);

// Send ERC20 (USDC example)
const action3 = TreasuryBuilders.buildSendERC20Action(
  '0xUSDC...' as Address, // USDC contract
  '0xRecipient...' as Address,
  BigInt(50000 * 1e6) // 50,000 USDC (6 decimals)
);

// Set treasury delay
const action4 = TreasuryBuilders.buildSetTreasuryDelayAction(
  BigInt(172800) // 2 days in seconds
);
```

### Governance Operations

```typescript
import { GovernanceBuilders } from '@/app/lib/Nouns/Contracts/utils/proposalBuilders';

// Set voting delay (blocks before voting starts)
const action1 = GovernanceBuilders.buildSetVotingDelayAction(
  BigInt(7200) // ~1 day
);

// Set voting period (blocks for voting)
const action2 = GovernanceBuilders.buildSetVotingPeriodAction(
  BigInt(50400) // ~1 week
);

// Set proposal threshold (BPS)
const action3 = GovernanceBuilders.buildSetProposalThresholdBPSAction(
  BigInt(25) // 0.25%
);

// Update all quorum parameters at once
const action4 = GovernanceBuilders.buildSetDynamicQuorumParamsAction(
  1000, // minQuorumVotesBPS (10%)
  2000, // maxQuorumVotesBPS (20%)
  BigInt(1000000) // quorumCoefficient
);

// Comprehensive update
const action5 = GovernanceBuilders.buildGovernanceUpdateAction({
  votingDelay: BigInt(7200),
  votingPeriod: BigInt(50400),
  proposalThresholdBPS: BigInt(25),
  minQuorumVotesBPS: BigInt(1000),
});
```

### Client Rewards

```typescript
import { RewardsBuilders } from '@/app/lib/Nouns/Contracts/utils/proposalBuilders';

// Approve Berry OS (Client ID 11)
const action1 = RewardsBuilders.buildApproveBerryOSClientAction();

// Approve any client
const action2 = RewardsBuilders.buildSetClientApprovalAction(
  42, // Client ID
  true // Approved
);

// Set auction reward parameters
const action3 = RewardsBuilders.buildSetAuctionRewardParamsAction(
  500, // 5% reward
  10   // Minimum 10 auctions between updates
);

// Enable/disable rewards
const action4 = RewardsBuilders.buildEnableAuctionRewardsAction();
const action5 = RewardsBuilders.buildDisableProposalRewardsAction();
```

### Auction House

```typescript
import { AuctionBuilders } from '@/app/lib/Nouns/Contracts/utils/proposalBuilders';

// Set reserve price
const action1 = AuctionBuilders.buildSetReservePriceAction(
  parseEther('0.1') // 0.1 ETH minimum
);

// Set minimum bid increment
const action2 = AuctionBuilders.buildSetMinBidIncrementPercentageAction(
  10 // 10%
);

// Set auction duration
const action3 = AuctionBuilders.buildSetAuctionDurationAction(
  BigInt(86400) // 24 hours
);

// Comprehensive update
const action4 = AuctionBuilders.buildAuctionConfigUpdateAction({
  reservePrice: parseEther('0.1'),
  timeBuffer: BigInt(600), // 10 minutes
  minBidIncrementPercentage: 10,
  duration: BigInt(86400),
});

// Pause/unpause
const action5 = AuctionBuilders.buildPauseAuctionHouseAction();
const action6 = AuctionBuilders.buildUnpauseAuctionHouseAction();
```

### Token Operations

```typescript
import { TokenBuilders } from '@/app/lib/Nouns/Contracts/utils/proposalBuilders';

// Set descriptor (for artwork)
const action1 = TokenBuilders.buildSetDescriptorAction(
  '0xNewDescriptor...' as Address
);

// Set minter (auction house)
const action2 = TokenBuilders.buildSetMinterAction(
  '0xNewAuctionHouse...' as Address
);

// Lock functions (IRREVERSIBLE!)
const action3 = TokenBuilders.buildLockDescriptorAction();
const action4 = TokenBuilders.buildLockMinterAction();
```

### Streaming Payments

```typescript
import { StreamingBuilders } from '@/app/lib/Nouns/Contracts/utils/proposalBuilders';

// Create monthly USDC stream
const action1 = StreamingBuilders.buildMonthlyStreamAction(
  '0xContributor...' as Address,
  BigInt(5000 * 1e6), // 5,000 USDC/month
  '0xUSDC...' as Address,
  new Date('2025-01-01'),
  6 // 6 months
);

// Buy USDC + create stream (grant pattern)
const action2 = StreamingBuilders.buildGrantWithStreamAction(
  '0xContributor...' as Address,
  BigInt(30000 * 1e6), // 30,000 USDC total
  '0xUSDC...' as Address,
  BigInt(Math.floor(Date.now() / 1000)),
  BigInt(180 * 24 * 60 * 60) // 180 days
);

// Just buy tokens
const action3 = StreamingBuilders.buildBuyTokensAction(
  BigInt(100000 * 1e6) // Buy 100,000 USDC
);
```

### Descriptor/Art

```typescript
import { DescriptorBuilders } from '@/app/lib/Nouns/Contracts/utils/proposalBuilders';

// Add new backgrounds
const action1 = DescriptorBuilders.buildAddManyBackgroundsAction([
  'e1d7d5', // Hex colors
  'c2e1f0',
  'f3e7f3',
]);

// Add new traits from storage pointer
const action2 = DescriptorBuilders.buildAddHeadsFromPointerAction(
  '0xStoragePointer...' as Address,
  BigInt(10000), // Decompressed length
  5 // 5 new head images
);

// Set renderer
const action3 = DescriptorBuilders.buildSetRendererAction(
  '0xNewRenderer...' as Address
);

// Lock parts (IRREVERSIBLE!)
const action4 = DescriptorBuilders.buildLockPartsAction();
```

## UI Integration Pattern

For Berry OS, you can create a proposal builder interface:

```typescript
// Proposal builder UI component
function ProposalBuilder() {
  const [selectedActions, setSelectedActions] = useState<ProposalActions[]>([]);
  
  const availableActions = [
    {
      category: 'Treasury',
      name: 'Send ETH',
      builder: (params) => TreasuryBuilders.buildSendEthAction(
        params.recipient,
        params.amount
      ),
      params: [
        { name: 'recipient', type: 'address' },
        { name: 'amount', type: 'eth' },
      ],
    },
    {
      category: 'Rewards',
      name: 'Approve Berry OS Client',
      builder: () => RewardsBuilders.buildApproveBerryOSClientAction(),
      params: [],
    },
    // ... more actions
  ];
  
  const handleAddAction = (action, params) => {
    const builtAction = action.builder(params);
    setSelectedActions([...selectedActions, builtAction]);
  };
  
  const handleSubmitProposal = () => {
    const combined = combineProposalActions(selectedActions);
    const tx = prepareProposeTransaction(combined, description);
    writeContract(tx);
  };
  
  return (
    <div>
      <ActionSelector actions={availableActions} onAdd={handleAddAction} />
      <ActionList actions={selectedActions} />
      <button onClick={handleSubmitProposal}>Submit Proposal</button>
    </div>
  );
}
```

## Key Principles

1. **Pure Functions**: All builders are pure - no side effects, just return `ProposalActions`
2. **Type Safe**: Full TypeScript types for all parameters
3. **Composable**: Use `combineProposalActions()` to merge multiple actions
4. **Validated**: Input validation happens before building (use governance validators)
5. **Documented**: Each function has clear JSDoc with parameter descriptions

## Common Patterns

### Single Action Proposal
```typescript
const action = TreasuryBuilders.buildSendEthAction(recipient, amount);
const tx = prepareProposeTransaction(action, description);
```

### Multi-Action Proposal
```typescript
const actions = combineProposalActions([
  action1,
  action2,
  action3,
]);
const tx = prepareProposeTransaction(actions, description);
```

### Validation Before Building
```typescript
const error = validateProposalActions(action);
if (error) {
  alert(error);
  return;
}
const tx = prepareProposeTransaction(action, description);
```

## Testing Strategy

Test builders by verifying:
1. Correct contract address
2. Correct function signature
3. Correct parameter encoding
4. Combined actions have matching array lengths

```typescript
test('buildSendEthAction creates valid action', () => {
  const action = buildSendEthAction('0x...', '10');
  expect(action.targets[0]).toBe(recipient);
  expect(action.values[0]).toBe(parseEther('10'));
  expect(action.signatures[0]).toBe('');
  expect(action.calldatas[0]).toBe('0x');
});
```

## Next Steps

1. **UI Components**: Build React components that use these builders
2. **Templates**: Create proposal templates for common scenarios
3. **Validation UI**: Show parameter validation errors before submission
4. **Preview**: Display human-readable summary of actions before submitting

