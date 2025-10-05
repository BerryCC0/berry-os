# Nouns DAO Contracts Integration - TODO

## ✅ Completed

### ABIs Added (14/14 contracts) 🎉
- [x] **Nouns Token** - Direct contract (no proxy)
- [x] **Auction House** - Implementation ABI added
- [x] **DAO Governor (NounsDAOLogicV3)** - Implementation ABI added
- [x] **Treasury (Timelock Executor)** - Implementation ABI added
- [x] **Data Proxy (Candidates/Feedback)** - Implementation ABI added
- [x] **Nouns Descriptor V3** - Implementation ABI added
- [x] **Client Rewards** - Implementation ABI added
- [x] **Token Buyer** - Implementation ABI added
- [x] **Payer** - Implementation ABI added
- [x] **Stream Factory** - Implementation ABI added
- [x] **Nouns Treasury V1 (Legacy)** - Implementation ABI added
- [x] **Fork Escrow** - Implementation ABI added
- [x] **Fork DAO Deployer** - Implementation ABI added
- [x] **Nouns Seeder** - Implementation ABI added

### Infrastructure
- [x] Contract addresses file with all 14 contracts
- [x] ABI directory structure
- [x] Export structure for addresses and ABIs (updated with all 14 ABIs)
- [x] Helper functions plan documented in `./utils/README.md`

## 🚧 Next Steps

### 1. Implement Helper Functions & Hooks

Once all ABIs are added, implement utilities in `./utils/` directory:

#### Phase 1: Read Functions (View/Pure)
- Token helpers: balanceOf, ownerOf, delegates, voting power
- Auction helpers: current auction, settlement history, bid calculations
- Governance helpers: proposal state, voting eligibility, quorum calculations
- Treasury helpers: queued transactions, execution time

#### Phase 2: Write Functions (State-changing)
- Token hooks: useDelegate, useTransfer
- Auction hooks: useCreateBid, useSettleAuction
- Governance hooks: useCreateProposal, useCastVote, useExecuteProposal
- Treasury hooks: useQueueTransaction, useExecuteTransaction

#### Phase 3: Advanced Features
- Batch operations (multicall)
- Event listeners and parsers
- Transaction simulation
- Gas estimation
- Error handling

See `./utils/README.md` for full implementation plan.

### 3. Testing & Documentation

- [ ] Unit tests for helper functions
- [ ] Integration tests with forked mainnet
- [ ] Usage examples for each contract
- [ ] API documentation
- [ ] Gas cost benchmarks

## Notes

- All ABIs should be added to `./abis/` directory
- Follow the pattern: `ContractName.ts` with `const` assertion
- Export from `./abis/index.ts`
- Implementation ABIs should be used (not proxy ABIs) for actual contract logic
- Helpers should separate business logic (pure TS) from React hooks

