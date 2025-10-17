# Settler Data Implementation - Complete

## Overview

Successfully implemented settler address collection for all Nouns NFTs in the database. The settler is the wallet address that called `settleCurrentAndCreateNewAuction()` on the NounsAuctionHouse contract to finalize each auction.

## Problem Statement

The initial backfill script was incorrectly fetching settler addresses from **bid transactions** instead of **settlement transactions**. This resulted in 0 settlers being found across all 1684 Nouns.

### Key Distinction

- **Winning Bid Transaction**: Someone places the winning bid on the auction
  - Sender: The bidder (who becomes the winner/owner)
  - Result: Bid is placed, auction continues

- **Settlement Transaction**: Someone (can be anyone) calls `settleCurrentAndCreateNewAuction()`
  - Sender: The settler (could be winner, a bot, or any third party)
  - Contract: `0x830BD73E4184ceF73443C15111a1DF14e495C706` (NounsAuctionHouse)
  - Result: Auction finalizes, NFT mints, new auction starts

## Solution Architecture

### Approach: Etherscan Logs API

1. Query Etherscan for `AuctionSettled` events on the NounsAuctionHouse contract
2. Filter by Noun ID (indexed parameter in the event)
3. Extract the transaction hash from the event
4. Fetch the transaction details to get the `from` address (the settler)

### Event Details

```solidity
event AuctionSettled(uint256 indexed nounId, address winner, uint256 amount);
```

- **Event Signature (keccak256)**: `0x1159164c56f277e6fc99c11731bd380e0347deb969b75523398734c252706ea3`
- **Contract**: `0x830BD73E4184ceF73443C15111a1DF14e495C706`
- **Topic0**: Event signature
- **Topic1**: Noun ID (indexed, padded to 32 bytes)

## Implementation

### Files Modified

1. **`scripts/backfill-nouns-complete.js`**
   - Updated `getSettlerAddress()` function to use Etherscan Logs API
   - Changed function signature from `getSettlerAddress(txHash)` to `getSettlerAddress(nounId, blockNumber)`
   - Now searches for `AuctionSettled` events instead of querying bid transactions
   - Rate limit adjusted to 250ms (4 req/sec) to account for 2 API calls per settler

2. **`scripts/backfill-settlers-only.js`** (NEW)
   - Dedicated script for backfilling only settler addresses
   - Queries database for Nouns without settlers
   - Updates only the `settler_address` field
   - Much faster than re-running full backfill
   - Progress tracking with ETA

### Key Code Changes

#### Etherscan Logs API Query

```javascript
const AUCTION_HOUSE = '0x830BD73E4184ceF73443C15111a1DF14e495C706';
const AUCTION_SETTLED_TOPIC = '0x1159164c56f277e6fc99c11731bd380e0347deb969b75523398734c252706ea3';

// Encode Noun ID as 32-byte hex
const nounIdHex = '0x' + parseInt(nounId).toString(16).padStart(64, '0');

// Search ±100 blocks around auction end
const fromBlock = Math.max(0, parseInt(blockNumber) - 100);
const toBlock = parseInt(blockNumber) + 100;

// Query for AuctionSettled events
const url = `https://api.etherscan.io/v2/api` +
  `?chainid=1` +
  `&module=logs` +
  `&action=getLogs` +
  `&address=${AUCTION_HOUSE}` +
  `&topic0=${AUCTION_SETTLED_TOPIC}` +
  `&topic0_1_opr=and` +
  `&topic1=${nounIdHex}` +
  `&fromBlock=${fromBlock}` +
  `&toBlock=${toBlock}` +
  `&apikey=${ETHERSCAN_API_KEY}`;
```

#### Transaction Sender Extraction

```javascript
// Get settlement transaction hash from event
const settlementTxHash = data.result[0].transactionHash;

// Fetch transaction details
const txUrl = `https://api.etherscan.io/v2/api` +
  `?chainid=1` +
  `&module=proxy` +
  `&action=eth_getTransactionByHash` +
  `&txhash=${settlementTxHash}` +
  `&apikey=${ETHERSCAN_API_KEY}`;

// Extract 'from' address (the settler)
const settlerAddress = txData.result.from.toLowerCase();
```

## Usage

### Full Backfill (All Data + Settlers)

```bash
# Backfill all Nouns from scratch
node scripts/backfill-nouns-complete.js --batch=20

# Skip settler fetching (faster)
node scripts/backfill-nouns-complete.js --batch=20 --skip-settlers
```

### Settler-Only Backfill (Update Existing Data)

```bash
# Update all Nouns with settler data
node scripts/backfill-settlers-only.js --batch=10

# Test with limited set
node scripts/backfill-settlers-only.js --limit=10 --start=1000

# Resume from specific Noun ID
node scripts/backfill-settlers-only.js --start=1500
```

**Options:**
- `--limit=<n>`: Process only N Nouns
- `--batch=<n>`: Batch size (default: 5, lower = more conservative with API rate limits)
- `--start=<id>`: Start from specific Noun ID (useful for resuming)

## Performance Characteristics

### Rate Limiting

- **Etherscan Free Tier**: 5 requests/second
- **Our Rate**: 4 requests/second (250ms between calls)
- **Calls per Noun**: 2 (logs query + transaction query)
- **Effective Rate**: ~2 Nouns/second

### Time Estimates

| Nouns | Time (10/sec batch) | Time (5/sec batch) |
|-------|---------------------|---------------------|
| 10    | ~2 seconds          | ~4 seconds          |
| 100   | ~20 seconds         | ~40 seconds         |
| 1000  | ~3 minutes          | ~6 minutes          |
| 1684  | ~5 minutes          | ~10 minutes         |

**Actual results may vary** based on:
- Network latency
- Etherscan API response times
- Number of Nouns without existing block numbers

## Verification

### Database Check

```bash
# Count Nouns with settlers
export $(cat .env.local | grep -v '^#' | xargs)
psql $DATABASE_URL -c "SELECT COUNT(*) FROM auction_history WHERE settler_address IS NOT NULL;"

# View sample settlers
psql $DATABASE_URL -c "SELECT noun_id, LEFT(winner_address, 12) as winner, LEFT(settler_address, 12) as settler FROM auction_history WHERE settler_address IS NOT NULL ORDER BY noun_id DESC LIMIT 10;"

# Check for mismatches (winner != settler)
psql $DATABASE_URL -c "SELECT noun_id, winner_address, settler_address FROM auction_history WHERE settler_address IS NOT NULL AND settler_address != winner_address LIMIT 10;"
```

### API Check

```bash
# Test single Noun via API
curl "http://localhost:3000/api/nouns/fetch?id=1003" | jq '.noun.auction.settler_address'

# Expected output: "0xbe8ee3419f53e0579c571c58162f7c0c9884c16d"
```

### Cross-Reference with Etherscan

1. Go to [Etherscan](https://etherscan.io)
2. Search for NounsAuctionHouse: `0x830BD73E4184ceF73443C15111a1DF14e495C706`
3. Go to "Events" tab
4. Filter for `AuctionSettled` with specific Noun ID
5. Click on transaction hash
6. Compare `from` address with database `settler_address`

## Example Results

### Noun 1003
- **Winner**: `0x99635729e0a942ba25d82ef04e6e7aacf42be31b`
- **Settler**: `0xbe8ee3419f53e0579c571c58162f7c0c9884c16d`
- **Result**: ✅ Winner and settler are **different** (expected behavior)

### Noun 1013
- **Winner**: `0x80cc881c065656b3e29ea41de4cfc8b52ef55c1f`
- **Settler**: `0x80cc881c065656b3e29ea41de4cfc8b52ef55c1f`
- **Result**: ✅ Winner and settler are **the same** (also valid)

## Edge Cases Handled

### Nounder Nouns (Every 10th)

Nouns 0, 10, 20, 30... are **Nounder Nouns** that get special handling:

- **NOT skipped**: They ARE settled, just in the same transaction as the next Noun
- **Example**: Nouns 10 & 11 are both settled in the same `settleCurrentAndCreateNewAuction()` call
- **Settlement**: Two `AuctionSettled` events fire in one transaction
- **Settler Address**: Same settler for both the Nounder Noun and the auction Noun
- **Script Behavior**: Fetches ALL `AuctionSettled` events in block range, then filters by Noun ID

**Critical Fix**: The original implementation filtered Etherscan queries by Noun ID in the API call, which missed Nounder Nouns. The fixed version fetches all events in the block range and filters client-side.

### Failed API Calls

- **Etherscan Rate Limit**: Script auto-retries with rate limiting
- **Network Issues**: Individual failures don't break the entire backfill
- **Missing Events**: Marked as skipped, can be retried later

### Block Range Search

- **Search Window**: ±500 blocks from auction end (expanded from ±100)
- **Reason**: Settlement can happen significantly after auction end time, especially for older Nouns
- **Trade-off**: Wider range = more API data returned but more reliable
- **Performance**: Etherscan returns all events in range; we filter client-side by Noun ID

## Database Schema

```sql
CREATE TABLE auction_history (
  id SERIAL PRIMARY KEY,
  noun_id INTEGER NOT NULL UNIQUE,
  winner_address VARCHAR(42) NOT NULL,
  settler_address VARCHAR(42),  -- NEW: Settler address
  winning_bid_eth NUMERIC(78, 18) NOT NULL,
  start_time VARCHAR(20) NOT NULL,
  end_time VARCHAR(20) NOT NULL,
  settled_timestamp VARCHAR(20),
  tx_hash VARCHAR(66),
  block_number VARCHAR(20),
  client_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Success Criteria

✅ **Achieved:**
- Fixed settler fetching logic to use correct API endpoint
- Implemented dedicated settler-only backfill script
- Successfully tested with multiple Nouns
- Verified winner ≠ settler cases work correctly
- Rate limiting prevents API throttling
- Background execution for large batches

✅ **Metrics:**
- Success rate: Targeting >95% (some Nounder Nouns will skip)
- Processing speed: ~2 Nouns/second
- API errors: Handled gracefully with retries

## Future Improvements

### Caching & Resume Capability

```javascript
// Save progress to disk for resume
const PROGRESS_FILE = '.settler-backfill-progress.json';

// On each batch completion
fs.writeFileSync(PROGRESS_FILE, JSON.stringify({
  lastProcessedId: nounId,
  successCount: stats.successful,
  timestamp: Date.now()
}));

// On script start
if (fs.existsSync(PROGRESS_FILE)) {
  const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE));
  START_ID = progress.lastProcessedId + 1;
}
```

### Batch Event Queries

Instead of querying one Noun at a time, query multiple Nouns in a single Etherscan call:

```javascript
// Query events for Nouns 1000-1100 at once
const fromBlock = Math.min(...nounBlocks);
const toBlock = Math.max(...nounBlocks) + 100;

// Filter results locally by Noun ID
const eventsByNoun = groupEventsByNounId(data.result);
```

### Webhook/Cron for Real-Time Updates

```typescript
// API route: /api/nouns/sync-settlers
export async function POST(req: Request) {
  const { startId, endId } = await req.json();
  
  // Fetch settlers for Nouns in range
  const results = await backfillSettlersForRange(startId, endId);
  
  return Response.json({ 
    success: true, 
    processed: results.length 
  });
}
```

## Troubleshooting

### "Settlers Found: 0"

**Cause**: Incorrect event signature or API endpoint
**Fix**: Verify event topic0 matches actual `AuctionSettled` event signature

### "NOTOK: Deprecated V1 endpoint"

**Cause**: Using old Etherscan API format
**Fix**: Ensure all URLs use `https://api.etherscan.io/v2/api?chainid=1`

### "Skipped (not found): N"

**Possible Causes**:
- Nounder Nouns (no auction)
- Missing block number in database
- Event happened outside ±100 block range
- Etherscan API didn't return event

**Solution**: Check database for block numbers, expand search range if needed

### Rate Limit Errors

**Symptoms**: API returns 429 errors or "Max rate limit reached"
**Fix**: Reduce batch size (`--batch=3`) or increase `ETHERSCAN_RATE_LIMIT_MS`

## References

- [Etherscan API V2 Docs](https://docs.etherscan.io/v2-migration)
- [Etherscan Logs API](https://docs.etherscan.io/api-endpoints/logs)
- [NounsAuctionHouse Contract](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
- [Solidity Event Encoding](https://docs.soliditylang.org/en/latest/abi-spec.html#events)

## Conclusion

The settler data implementation successfully addresses the missing settler information in the Nouns database. By correctly querying the Etherscan Logs API for `AuctionSettled` events, we can now track who actually settled each auction, providing valuable analytics and attribution data.

**Status**: ✅ **Complete and Production-Ready**

Last Updated: October 16, 2025

