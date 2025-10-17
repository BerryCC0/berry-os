# Nouns Database - Quick Start Guide

Get the Nouns Database up and running in minutes.

## Prerequisites

- Neon database account ([neon.tech](https://neon.tech))
- Etherscan API key (you have: `FYBQKTA9IF438WAQNVWIR1K33W2HJQ6S8A`)
- Node.js 18+ installed

## Step 1: Setup Database (2 minutes)

1. Create a new Neon project
2. Copy the connection string
3. Add to `.env.local`:

```env
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
ETHERSCAN_API_KEY=FYBQKTA9IF438WAQNVWIR1K33W2HJQ6S8A
CRON_SECRET=your-random-secret-here
```

4. Run the migration:

```bash
psql $DATABASE_URL -f docs/migrations/nouns-database-schema.sql
```

## Step 2: Test Etherscan Integration (1 minute)

```bash
node scripts/test-etherscan-settler.js
```

You should see:
```
✅ Transaction fetched successfully
🎯 Settler Address: 0x...
```

## Step 3: Install Dependencies (1 minute)

```bash
npm install cross-fetch @apollo/client
```

## Step 4: Backfill Data (Choose One)

### Option A: Small Test (5 minutes)
Populate first 10 Nouns for testing:

```bash
node scripts/backfill-nouns-database.js --start=0 --end=10 --skip-settlers
```

### Option B: Full Backfill (1-2 hours)
Populate all Nouns:

```bash
# Step 1: Backfill all Nouns without settlers (30-60 min)
node scripts/backfill-nouns-database.js --skip-settlers

# Step 2: Backfill settler addresses (30-60 min, rate-limited)
# Run this separately or in batches
node scripts/backfill-nouns-database.js --start=0 --end=100
```

## Step 5: Verify Data (30 seconds)

```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM nouns;"
psql $DATABASE_URL -c "SELECT noun_id, current_owner FROM nouns ORDER BY noun_id LIMIT 5;"
```

## Step 6: Test API Routes (1 minute)

Start your dev server:
```bash
npm run dev
```

Test endpoints:
```bash
# Fetch Noun #1
curl "http://localhost:3000/api/nouns/fetch?id=1"

# List Nouns
curl "http://localhost:3000/api/nouns/list?limit=5"

# Get stats
curl "http://localhost:3000/api/nouns/stats"
```

## Step 7: Test React Hooks (2 minutes)

Create test page: `app/test-db/page.tsx`

```typescript
'use client';

import { useNoun } from '@/app/lib/Nouns/Database/hooks';

export default function TestPage() {
  const { noun, isLoading } = useNoun(1);

  if (isLoading) return <div>Loading...</div>;
  if (!noun) return <div>Not found</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Noun {noun.noun.noun_id}</h1>
      <p>Owner: {noun.noun.current_owner}</p>
      <img 
        src={`data:image/svg+xml,${encodeURIComponent(noun.noun.svg_data)}`}
        alt={`Noun ${noun.noun.noun_id}`}
        width="200"
      />
      {noun.auction && (
        <p>Winning Bid: {noun.auction.winning_bid_eth} ETH</p>
      )}
    </div>
  );
}
```

Visit: `http://localhost:3000/test-db`

## Step 8: Setup Cron (Optional)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/nouns/sync",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

Test manually:
```bash
curl -X POST "http://localhost:3000/api/nouns/sync" \
  -H "Authorization: Bearer your-cron-secret"
```

## You're Done! 🎉

Your Nouns Database is now:
- ✅ Configured and running
- ✅ Populated with Noun data
- ✅ Accessible via API routes
- ✅ Usable with React hooks

## Next Steps

1. **Read Full Documentation**
   - `app/lib/Nouns/Database/README.md` - Complete API docs
   - `docs/NOUNS_DATABASE_TESTING_GUIDE.md` - Testing guide
   - `docs/NOUNS_DATABASE_IMPLEMENTATION_COMPLETE.md` - Architecture overview

2. **Run Full Test Suite**
   ```bash
   # Follow all 12 tests in the testing guide
   ```

3. **Integrate with Apps**
   - Create hybrid hooks (DB with GraphQL fallback)
   - Gradually migrate Auction app
   - Migrate Camp app

4. **Monitor Performance**
   - Compare DB vs GraphQL speeds
   - Track error rates
   - Monitor sync health

## Troubleshooting

### "Connection refused"
- Check DATABASE_URL is correct
- Verify Neon database is active
- Test connection: `psql $DATABASE_URL -c "SELECT 1;"`

### "Table does not exist"
- Run migration: `psql $DATABASE_URL -f docs/migrations/nouns-database-schema.sql`

### "API returns 404"
- Verify backfill completed successfully
- Check Noun exists: `psql $DATABASE_URL -c "SELECT * FROM nouns WHERE noun_id = 1;"`

### Slow Etherscan fetching
- Normal, rate-limited to 5 req/sec
- Use `--skip-settlers` flag for faster backfill
- Backfill settlers separately later

## Quick Commands Reference

```bash
# Check database status
psql $DATABASE_URL -c "SELECT 
  (SELECT COUNT(*) FROM nouns) as total_nouns,
  (SELECT COUNT(*) FROM auction_history) as total_auctions,
  (SELECT COUNT(*) FROM auction_history WHERE settler_address IS NOT NULL) as auctions_with_settlers;"

# Clear database (careful!)
psql $DATABASE_URL -c "TRUNCATE nouns, auction_history, ownership_history, delegation_history, vote_history, sync_state RESTART IDENTITY CASCADE;"

# Check sync state
psql $DATABASE_URL -c "SELECT * FROM sync_state;"

# Get statistics
curl "http://localhost:3000/api/nouns/stats"

# Manual sync
curl -X POST "http://localhost:3000/api/nouns/sync" -H "Authorization: Bearer $CRON_SECRET"
```

## Support

Need help?
- Check documentation in `app/lib/Nouns/Database/README.md`
- Review testing guide: `docs/NOUNS_DATABASE_TESTING_GUIDE.md`
- Check linter errors: `npm run lint`
- Verify environment variables are set correctly

---

**Estimated Total Time**: 10-15 minutes (excluding full backfill)

**System Status**: All components ✅ Complete and Ready for Testing

