# Nouns Database - Testing Guide

Complete guide for testing the Nouns Database implementation.

## Pre-requisites

1. **Database Setup**
   ```bash
   # Connect to your Neon database
   psql $DATABASE_URL -f docs/migrations/nouns-database-schema.sql
   ```

2. **Environment Variables**
   ```bash
   # Add to .env.local
   DATABASE_URL=postgresql://...
   ETHERSCAN_API_KEY=FYBQKTA9IF438WAQNVWIR1K33W2HJQ6S8A
   CRON_SECRET=test-secret-123
   ```

3. **Dependencies**
   ```bash
   npm install
   ```

## Test 1: Etherscan Settler Extraction

Test that we can extract settler addresses from Etherscan:

```bash
node scripts/test-etherscan-settler.js
```

Expected output:
```
=== Etherscan Settler Extraction Test ===

Testing transaction: 0xf4cbb2c708b4fc26469aab706be667baf29b6e4017554ee6cdbf8b644de982ae

✅ Transaction fetched successfully

Transaction Details:
  Hash: 0xf4cbb2c...
  From (Settler): 0x...
  To (Auction House): 0x830BD73E4184ceF73443C15111a1DF14e495C706
  Block Number: 12985438
  ...

✅ Confirmed: Transaction is to Nouns Auction House
🎯 Settler Address: 0x...
✅ Test completed successfully!
```

## Test 2: Database Persistence Layer

Test direct database operations:

```typescript
// Create test file: scripts/test-persistence.ts
import {
  insertNoun,
  getNoun,
  getNouns,
} from '../app/lib/Nouns/Database';

async function testPersistence() {
  // Insert a test Noun
  await insertNoun({
    noun_id: 9999,
    background: 0,
    body: 1,
    accessory: 2,
    head: 3,
    glasses: 4,
    svg_data: '<svg>...</svg>',
    created_timestamp: '1629878400',
    created_block: '13043478',
    current_owner: '0x0000000000000000000000000000000000000001',
    current_delegate: null,
  });

  // Fetch it back
  const noun = await getNoun(9999);
  console.log('✅ Noun inserted and fetched:', noun);

  // List Nouns
  const result = await getNouns({ limit: 5, offset: 0 });
  console.log('✅ Fetched', result.data.length, 'Nouns');
}

testPersistence();
```

Run:
```bash
npx ts-node scripts/test-persistence.ts
```

## Test 3: Backfill Script (Dry Run)

Test the backfill script without inserting data:

```bash
node scripts/backfill-nouns-database.js --start=0 --end=10 --dry-run
```

Expected output:
```
=== Nouns Database Backfill ===

Start ID: 0
End ID: 10
Batch Size: 10
Dry Run: true

Fetching Nouns from subgraph...
Fetched 10 Nouns...

Processing 10 Nouns in batches of 10...

Progress: 10/10 (100.0%) | Success: 10 | Failed: 0 | ...

=== Backfill Complete ===
Total Nouns: 10
Processed: 10
Successful: 10
Failed: 0
```

## Test 4: Small Backfill

Insert first 10 Nouns into database:

```bash
node scripts/backfill-nouns-database.js --start=0 --end=10 --skip-settlers
```

This should insert Nouns 0-10 into the database without fetching settler addresses.

Verify in database:
```sql
psql $DATABASE_URL -c "SELECT noun_id, current_owner FROM nouns ORDER BY noun_id LIMIT 10;"
```

## Test 5: API Routes

### Test Fetch Single Noun
```bash
curl "http://localhost:3000/api/nouns/fetch?id=1"
```

Expected: JSON with complete Noun data

### Test List Nouns
```bash
curl "http://localhost:3000/api/nouns/list?limit=5&offset=0"
```

Expected: Paginated list of Nouns

### Test Settler Info
```bash
curl "http://localhost:3000/api/nouns/settler?nounId=1"
```

Expected: Auction and settler data

### Test Statistics
```bash
curl "http://localhost:3000/api/nouns/stats"
```

Expected: Aggregate statistics

### Test Sync (requires CRON_SECRET)
```bash
curl -X POST "http://localhost:3000/api/nouns/sync" \
  -H "Authorization: Bearer test-secret-123"
```

Expected: Sync result JSON

## Test 6: React Hooks

Create a test page: `app/test-nouns-db/page.tsx`

```typescript
'use client';

import { useNoun, useNouns } from '@/app/lib/Nouns/Database/hooks';

export default function TestNounsDBPage() {
  const { noun, isLoading: nounLoading } = useNoun(1);
  const { nouns, isLoading: listLoading } = useNouns({ limit: 5 });

  return (
    <div style={{ padding: '20px' }}>
      <h1>Nouns Database Test</h1>
      
      <h2>Single Noun (ID: 1)</h2>
      {nounLoading ? (
        <p>Loading...</p>
      ) : noun ? (
        <div>
          <p>Noun ID: {noun.noun.noun_id}</p>
          <p>Owner: {noun.noun.current_owner}</p>
          <img 
            src={`data:image/svg+xml,${encodeURIComponent(noun.noun.svg_data)}`}
            alt="Noun 1"
            width="200"
          />
        </div>
      ) : (
        <p>Not found</p>
      )}

      <h2>Nouns List</h2>
      {listLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {nouns.map(n => (
            <li key={n.noun_id}>
              Noun {n.noun_id} - Owner: {n.current_owner.slice(0, 10)}...
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

Visit: `http://localhost:3000/test-nouns-db`

## Test 7: Full Backfill (Production)

⚠️ **Warning**: This will take 1-2 hours and consume Etherscan API quota.

```bash
# Step 1: Backfill all Nouns without settlers
node scripts/backfill-nouns-database.js --skip-settlers

# Step 2: Backfill settler addresses (slower, rate-limited)
node scripts/backfill-nouns-database.js --start=0 --end=100
```

Monitor progress and verify:
```sql
psql $DATABASE_URL -c "SELECT COUNT(*) FROM nouns;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM auction_history WHERE settler_address IS NOT NULL;"
```

## Test 8: Sync Automation

Test the sync endpoint with a cron simulator:

```bash
# Manual trigger
curl -X POST "http://localhost:3000/api/nouns/sync" \
  -H "Authorization: Bearer test-secret-123"

# Check sync state
psql $DATABASE_URL -c "SELECT * FROM sync_state;"
```

## Test 9: App Integration (Auction)

The Auction app currently uses GraphQL. To test database integration:

1. **Create Hybrid Hook** (uses DB with GraphQL fallback):

```typescript
// src/Apps/Nouns/Auction/utils/hooks/useAuctionWithDB.ts
import { useNoun } from '@/app/lib/Nouns/Database/hooks';
import { useQuery } from '@apollo/client';
import { GET_AUCTION } from '@/app/lib/Nouns/Goldsky/queries';

export function useAuctionWithDB(nounId: string) {
  // Try database first
  const { noun: dbNoun, isLoading: dbLoading, error: dbError } = useNoun(parseInt(nounId));
  
  // Fallback to GraphQL if DB fails
  const { data: gqlData, loading: gqlLoading } = useQuery(GET_AUCTION, {
    variables: { id: nounId },
    skip: !dbError && dbLoading,
  });
  
  // Return DB data if available, otherwise GraphQL
  return {
    noun: dbNoun || gqlData?.auction?.noun,
    loading: dbLoading || gqlLoading,
    source: dbNoun ? 'database' : 'graphql',
  };
}
```

2. **Test in Auction App**:
   - Modify Auction.tsx to use the hybrid hook
   - Verify it works with both sources
   - Measure performance difference

## Test 10: Performance Benchmarks

Compare database vs GraphQL performance:

```typescript
// scripts/benchmark-db-vs-graphql.ts
async function benchmark() {
  const nounId = 100;
  
  // Benchmark database
  const dbStart = performance.now();
  const dbResult = await fetch(`http://localhost:3000/api/nouns/fetch?id=${nounId}`);
  await dbResult.json();
  const dbTime = performance.now() - dbStart;
  
  // Benchmark GraphQL
  const gqlStart = performance.now();
  // ... GraphQL query
  const gqlTime = performance.now() - gqlStart;
  
  console.log(`Database: ${dbTime.toFixed(2)}ms`);
  console.log(`GraphQL: ${gqlTime.toFixed(2)}ms`);
  console.log(`Speedup: ${(gqlTime / dbTime).toFixed(2)}x`);
}
```

Expected: Database should be 2-5x faster than GraphQL.

## Test 11: Error Handling

Test error scenarios:

```bash
# Invalid Noun ID
curl "http://localhost:3000/api/nouns/fetch?id=999999"
# Expected: 404 error

# Missing parameters
curl "http://localhost:3000/api/nouns/fetch"
# Expected: 400 error

# Unauthorized sync
curl -X POST "http://localhost:3000/api/nouns/sync"
# Expected: 401 error

# Invalid pagination
curl "http://localhost:3000/api/nouns/list?limit=1000"
# Expected: Max limit enforced (100)
```

## Test 12: Data Integrity

Verify data matches between GraphQL and Database:

```typescript
// scripts/verify-data-integrity.ts
async function verifyIntegrity(nounId: number) {
  // Fetch from database
  const dbRes = await fetch(`http://localhost:3000/api/nouns/fetch?id=${nounId}`);
  const dbData = await dbRes.json();
  
  // Fetch from GraphQL
  const gqlData = await client.query({ ... });
  
  // Compare
  assert(dbData.noun.noun_id === gqlData.noun.id);
  assert(dbData.noun.background === gqlData.noun.seed.background);
  // ... compare all fields
  
  console.log(`✅ Noun ${nounId} data integrity verified`);
}
```

## Troubleshooting

### "Module not found" errors
```bash
npm install
npm run build
```

### Database connection errors
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Etherscan API rate limits
- Free tier: 5 calls/second
- Solution: Add delays in backfill script
- Or: Upgrade to paid tier

### Missing settler addresses
- Run settler backfill separately
- Check tx_hash is valid
- Verify Etherscan API key

## Success Criteria

✅ All tests pass without errors
✅ Database contains at least 10 Nouns
✅ API routes return valid JSON
✅ React hooks render without errors
✅ Performance is 2x+ faster than GraphQL
✅ Data integrity verified between sources

## Next Steps

After all tests pass:
1. Deploy database schema to production
2. Run full backfill on production
3. Set up Vercel Cron for syncing
4. Gradually migrate apps from GraphQL to DB
5. Monitor performance and errors

## Support

If tests fail:
1. Check logs in terminal
2. Verify environment variables
3. Test database connection
4. Check Etherscan API quota
5. Review error messages carefully

