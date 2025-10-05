# Nouns Contracts Helpers - Implementation Status

**Last Updated**: 2025-10-05  
**Status**: Phase 1 Complete, Phase 2 In Progress

---

## ✅ Completed Helpers

### 1. Treasury Timelock (**COMPLETE**)
**Location**: `/app/lib/Nouns/Contracts/utils/treasury/`

**Read Functions**:
- ✅ `calculateTransactionHash()` - Calculate tx hash for timelock
- ✅ `isTransactionQueued()` - Check if tx is queued
- ✅ `canExecuteTransaction()` - Check if tx can be executed
- ✅ `isTransactionExpired()` - Check if tx expired
- ✅ `calculateETA()` - Calculate execution timestamp
- ✅ `formatTimeUntilExecution()` - Human-readable time
- ✅ `formatTimeUntilExpiration()` - Grace period countdown
- ✅ `validateTransactionParams()` - Validate tx parameters
- ✅ `isTreasuryAdmin()` - Check admin status
- ✅ `formatDelay()` - Format delay value

**Write Functions**:
- ✅ `prepareQueueTransaction()` - Queue tx for execution
- ✅ `prepareExecuteTransaction()` - Execute queued tx
- ✅ `prepareCancelTransaction()` - Cancel queued tx
- ✅ `prepareSendETH()` - Direct ETH transfer
- ✅ `prepareSendERC20()` - Direct ERC20 transfer
- ✅ `prepareAcceptAdmin()` - Accept admin role
- ✅ `prepareSetPendingAdmin()` - Set new pending admin
- ✅ `prepareSetDelay()` - Update timelock delay
- ✅ `buildTreasuryTransaction()` - Helper builder
- ✅ `validateSendETH()` - Validate ETH send params
- ✅ `validateSendERC20()` - Validate ERC20 send params

---

### 2. Descriptor V3 (**COMPLETE**)
**Location**: `/app/lib/Nouns/Contracts/utils/descriptor/`

**Read Functions**:
- ✅ `getDescriptorAddress()` - Get contract address
- ✅ `parseTraitData()` - Parse compressed trait data
- ✅ `isValidTraitIndex()` - Validate trait index
- ✅ `getTraitTypeName()` - Get human-readable type
- ✅ `parsePalette()` - Parse palette colors
- ✅ `isDataURIEnabled()` - Check data URI mode
- ✅ `extractSVGFromDataURI()` - Extract SVG from data URI
- ✅ `calculateTotalTraits()` - Total trait count
- ✅ `formatTraitCounts()` - Format counts for display
- ✅ `isValidBaseURI()` - Validate base URI format

**Write Functions**:
- ✅ `prepareAddManyBackgrounds()` - Add background traits
- ✅ `prepareAddManyBodies()` - Add body traits
- ✅ `prepareAddManyAccessories()` - Add accessory traits
- ✅ `prepareAddManyHeads()` - Add head traits
- ✅ `prepareAddManyGlasses()` - Add glasses traits
- ✅ `prepareSetPalette()` - Set palette
- ✅ `prepareAddColorToPalette()` - Add color to palette
- ✅ `prepareSetBaseURI()` - Set base URI
- ✅ `prepareToggleDataURIEnabled()` - Toggle data URI mode
- ✅ `prepareSetArtDescriptor()` - Set art descriptor
- ✅ `prepareSetArtInflator()` - Set art inflator
- ✅ `prepareSetRenderer()` - Set renderer
- ✅ `prepareLockParts()` - Permanently lock traits
- ✅ `validateTraitData()` - Validate trait data
- ✅ `validatePalette()` - Validate palette
- ✅ `validateBaseURI()` - Validate base URI
- ✅ `rgbToHex()` - Convert RGB to hex
- ✅ `createPalette()` - Create palette from colors

---

### 3. Token Buyer (**COMPLETE**)
**Location**: `/app/lib/Nouns/Contracts/utils/tokenbuyer/`

**Read Functions**:
- ✅ `getTokenBuyerAddress()` - Get contract address
- ✅ `calculateUSDCOutput()` - Calculate expected USDC
- ✅ `calculateETHInput()` - Calculate required ETH
- ✅ `formatETH()` - Format ETH amount
- ✅ `formatUSDC()` - Format USDC amount
- ✅ `calculatePriceImpact()` - Calculate price impact %
- ✅ `isAcceptablePriceImpact()` - Check if impact acceptable
- ✅ `validateBuyAmount()` - Validate buy amount
- ✅ `isTokenBuyerAdmin()` - Check admin status

**Write Functions**:
- ✅ `prepareBuyTokens()` - Buy USDC with ETH
- ✅ `prepareSetAdmin()` - Set new admin
- ✅ `prepareSetPayer()` - Set payer contract
- ✅ `prepareSetTokensReceiver()` - Set tokens receiver
- ✅ `prepareWithdraw()` - Withdraw ETH
- ✅ `prepareWithdrawToken()` - Withdraw tokens
- ✅ `prepareSetBotDiscountBPS()` - Set bot discount
- ✅ `prepareSetBaseSwapFeeBPS()` - Set swap fee
- ✅ `prepareSetPaymentToken()` - Set payment token
- ✅ `validateBuyTokens()` - Validate buy params
- ✅ `validateWithdraw()` - Validate withdraw params
- ✅ `validateBPS()` - Validate BPS value
- ✅ `calculateMinUSDCWithSlippage()` - Calculate min USDC
- ✅ Slippage presets exported

---

### 4. Payer (**COMPLETE**)
**Location**: `/app/lib/Nouns/Contracts/utils/payer/`

**Read Functions**:
- ✅ `getPayerAddress()` - Get contract address
- ✅ `isAuthorizedPayer()` - Check authorization
- ✅ `isPayerAdmin()` - Check admin status
- ✅ `formatPaymentAmount()` - Format USDC amount
- ✅ `calculateTotalWithFees()` - Calculate total with fees
- ✅ `validatePaymentAmount()` - Validate amount
- ✅ `parsePaymentReason()` - Parse & validate reason

**Write Functions**:
- ✅ `preparePay()` - Send USDC payment
- ✅ `prepareSendOrRegisterDebt()` - Pay or register debt
- ✅ `prepareWithdrawToken()` - Withdraw tokens
- ✅ `prepareSetAdmin()` - Set new admin
- ✅ `prepareSetTreasury()` - Set treasury address
- ✅ `prepareAuthorizePayer()` - Authorize payer
- ✅ `prepareRevokePayer()` - Revoke payer
- ✅ `validatePayment()` - Validate payment params

---

### 5. Nouns Seeder (**COMPLETE**)
**Location**: `/app/lib/Nouns/Contracts/utils/seeder/`

**Functions**:
- ✅ `getSeederAddress()` - Get contract address
- ✅ Documentation for `generateSeed()` usage with wagmi

**Note**: Seeder only has one view function, so comprehensive read/write helpers not needed.

---

## 🚧 Stub Implementations (Need Full Implementation)

### 6. Stream Factory (**STUB ONLY**)
**Location**: `/app/lib/Nouns/Contracts/utils/streaming/`
**Status**: Exports ABIs only, no helpers yet

**Needed Functions**:
- ❌ `createStream()` - Create payment stream
- ❌ `stopStream()` - Stop active stream
- ❌ `cancelStream()` - Cancel stream
- ❌ `getStream()` - Get stream info
- ❌ `getPaginatedStreams()` - Get streams with pagination
- ❌ `rescueERC20()` - Rescue tokens
- ❌ `rescueETH()` - Rescue ETH

**Estimated Time**: 4-6 hours

---

### 7. Client Rewards (**STUB ONLY**)
**Location**: `/app/lib/Nouns/Contracts/utils/rewards/`
**Status**: Exports ABIs only, no helpers yet

**Needed Functions**:
- ❌ `claimClientRewards()` - Claim rewards
- ❌ `getClientBalance()` - Get client balance
- ❌ `getClientRewardsStats()` - Get reward stats
- ❌ `registerClient()` - Register new client
- ❌ `updateDescription()` - Update client description
- ❌ `calculateRewards()` - Calculate eligible rewards
- ❌ `isEligibleForRewards()` - Check eligibility

**Estimated Time**: 4-6 hours

---

### 8. Fork Mechanism (**STUB ONLY**)
**Location**: `/app/lib/Nouns/Contracts/utils/fork/`
**Status**: Exports ABIs only, no helpers yet

**Needed Functions**:
- ❌ `escrowToFork()` - Escrow tokens for fork
- ❌ `returnTokensToOwner()` - Return escrowed tokens
- ❌ `numTokensInEscrow()` - Get escrow count
- ❌ `deployForkDAO()` - Deploy fork DAO
- ❌ `withdrawFromForkEscrow()` - Withdraw from escrow
- ❌ `joinFork()` - Join existing fork

**Estimated Time**: 3-4 hours

---

## 📊 Summary Statistics

**Total Contracts**: 15  
**Contracts with Full Helpers**: 9 (60%)
- ✅ Nouns Token (existing)
- ✅ Auction House (existing)
- ✅ DAO Governor (existing)
- ✅ Data Proxy (existing)
- ✅ Treasury Timelock (new)
- ✅ Descriptor V3 (new)
- ✅ Token Buyer (new)
- ✅ Payer (new)
- ✅ Nouns Seeder (new)

**Contracts with Stub Implementations**: 3 (20%)
- 🚧 Stream Factory
- 🚧 Client Rewards
- 🚧 Fork Mechanism

**Contracts Needing Basic Helpers**: 3 (20%)
- ❌ Fork Escrow
- ❌ Fork DAO Deployer
- ❌ Treasury V1 (legacy, low priority)

---

## 🎯 Next Steps

### Immediate (Today)
1. ✅ Add Nouns Seeder to Tabs app
2. ✅ Update `ContractHelpers.tsx` with all new functions
3. ✅ Test helpers in development

### Short-term (This Week)
4. ⏳ Implement Stream Factory helpers
5. ⏳ Implement Client Rewards helpers
6. ⏳ Implement Fork Mechanism helpers

### Medium-term (Next Week)
7. ⏳ Add UI forms for complex function inputs
8. ⏳ Add result display components
9. ⏳ Implement transaction status tracking
10. ⏳ Create comprehensive testing suite

---

## 📝 Helper File Structure

Each helper module follows this pattern:

```
utils/
├── [contract]/
│   ├── read.ts        # Pure read functions & utilities
│   ├── write.ts       # Transaction builders for wagmi
│   └── index.ts       # Re-exports + ABI
```

**Read Functions**: Pure TypeScript functions for calculations, formatting, validation
**Write Functions**: Transaction builders that return wagmi-compatible config objects

---

## 🔗 Usage Example

```typescript
import { TreasuryHelpers } from '@/app/lib/Nouns/Contracts/utils';
import { useWriteContract } from 'wagmi';

function MyComponent() {
  const { writeContract } = useWriteContract();
  
  const handleSendETH = () => {
    const tx = TreasuryHelpers.prepareSendETH(
      recipient,
      parseEther('1.0')
    );
    writeContract(tx);
  };
  
  return <button onClick={handleSendETH}>Send 1 ETH</button>;
}
```

---

**Status**: 60% Complete
**Next Milestone**: 100% Helper Coverage
**ETA**: End of Week

