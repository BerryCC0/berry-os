# Nouns Database Integration Examples

Complete examples showing how to integrate the Nouns database with your apps.

---

## Example 1: Display a Single Noun

```typescript
// src/Apps/Nouns/Auction/components/NounDisplay.tsx
'use client';

import { useNoun } from '@/app/lib/Nouns/Database/hooks';
import styles from './NounDisplay.module.css';

interface NounDisplayProps {
  nounId: number;
}

export function NounDisplay({ nounId }: NounDisplayProps) {
  const { noun, isLoading, error, refetch } = useNoun(nounId);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}>Loading Noun {nounId}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error loading Noun {nounId}</p>
        <p>{error.message}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  if (!noun) {
    return (
      <div className={styles.notFound}>
        Noun {nounId} not found
      </div>
    );
  }

  return (
    <div className={styles.nounDisplay}>
      {/* SVG Image */}
      <div 
        className={styles.nounImage}
        dangerouslySetInnerHTML={{ __html: noun.noun.svg_data }} 
      />

      {/* Noun Info */}
      <div className={styles.nounInfo}>
        <h2>Noun {noun.noun.noun_id}</h2>
        
        <div className={styles.traits}>
          <span>Background: {noun.noun.background}</span>
          <span>Body: {noun.noun.body}</span>
          <span>Accessory: {noun.noun.accessory}</span>
          <span>Head: {noun.noun.head}</span>
          <span>Glasses: {noun.noun.glasses}</span>
        </div>

        <div className={styles.owner}>
          <strong>Owner:</strong>
          <a 
            href={`https://etherscan.io/address/${noun.noun.current_owner}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {noun.noun.current_owner.slice(0, 6)}...{noun.noun.current_owner.slice(-4)}
          </a>
        </div>

        {/* Auction Info */}
        {noun.auction && (
          <div className={styles.auction}>
            <h3>Auction Details</h3>
            <p>
              <strong>Winning Bid:</strong> {noun.auction.winning_bid_eth} ETH
            </p>
            <p>
              <strong>Winner:</strong>{' '}
              {noun.auction.winner_address?.slice(0, 6)}...
              {noun.auction.winner_address?.slice(-4)}
            </p>
            {noun.auction.settler_address && (
              <p>
                <strong>Settled By:</strong>{' '}
                {noun.auction.settler_address.slice(0, 6)}...
                {noun.auction.settler_address.slice(-4)}
              </p>
            )}
            <a 
              href={`https://etherscan.io/tx/${noun.auction.tx_hash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Transaction →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Example 2: Current Auction Display

```typescript
// src/Apps/Nouns/Auction/Auction.tsx
'use client';

import { useCurrentAuction } from '@/app/lib/Nouns/Database/hooks';
import styles from './Auction.module.css';

export function AuctionApp() {
  const { currentNoun, isLoading, error, refetch } = useCurrentAuction(30000); // Poll every 30s

  if (isLoading) {
    return <div className={styles.loading}>Loading current auction...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error loading auction: {error.message}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  if (!currentNoun) {
    return <div className={styles.noAuction}>No auction data available</div>;
  }

  return (
    <div className={styles.auctionApp}>
      <header className={styles.header}>
        <h1>Nouns Auction</h1>
        <p>Currently Auctioning: Noun {currentNoun.noun.noun_id}</p>
      </header>

      <main className={styles.main}>
        {/* Noun Image */}
        <div 
          className={styles.nounImage}
          dangerouslySetInnerHTML={{ __html: currentNoun.noun.svg_data }} 
        />

        {/* Auction Info */}
        <div className={styles.auctionInfo}>
          <h2>Noun {currentNoun.noun.noun_id}</h2>
          
          {currentNoun.auction && (
            <>
              <div className={styles.bid}>
                <span className={styles.label}>Current Bid:</span>
                <span className={styles.amount}>
                  {currentNoun.auction.winning_bid_eth} ETH
                </span>
              </div>

              <div className={styles.times}>
                <div>
                  <strong>Started:</strong> {' '}
                  {new Date(parseInt(currentNoun.auction.start_time) * 1000).toLocaleString()}
                </div>
                <div>
                  <strong>Ends:</strong> {' '}
                  {new Date(parseInt(currentNoun.auction.end_time) * 1000).toLocaleString()}
                </div>
              </div>
            </>
          )}

          <button className={styles.bidButton}>
            Place Bid
          </button>
        </div>
      </main>
    </div>
  );
}
```

---

## Example 3: Nouns Gallery (Paginated List)

```typescript
// src/Apps/Nouns/Camp/components/NounsGallery.tsx
'use client';

import { useState } from 'react';
import { useNouns } from '@/app/lib/Nouns/Database/hooks';
import styles from './NounsGallery.module.css';

export function NounsGallery() {
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 20;

  const { nouns, pagination, isLoading, error, refetch } = useNouns({
    limit: ITEMS_PER_PAGE,
    offset: page * ITEMS_PER_PAGE,
  });

  if (isLoading) {
    return <div className={styles.loading}>Loading Nouns...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error: {error.message}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  if (!nouns || nouns.length === 0) {
    return <div className={styles.empty}>No Nouns found</div>;
  }

  return (
    <div className={styles.gallery}>
      <header className={styles.header}>
        <h1>Nouns Gallery</h1>
        <p>
          Showing {pagination.offset + 1} - {pagination.offset + nouns.length} of {pagination.total}
        </p>
      </header>

      {/* Grid of Nouns */}
      <div className={styles.grid}>
        {nouns.map((noun) => (
          <div key={noun.noun_id} className={styles.nounCard}>
            <div 
              className={styles.nounImage}
              dangerouslySetInnerHTML={{ __html: noun.svg_data }} 
            />
            <div className={styles.nounId}>Noun {noun.noun_id}</div>
            <div className={styles.owner}>
              {noun.current_owner.slice(0, 6)}...{noun.current_owner.slice(-4)}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <footer className={styles.pagination}>
        <button 
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          ← Previous
        </button>

        <span>
          Page {page + 1} of {Math.ceil(pagination.total / ITEMS_PER_PAGE)}
        </span>

        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={!pagination.hasMore}
        >
          Next →
        </button>
      </footer>
    </div>
  );
}
```

---

## Example 4: Noun Details Modal

```typescript
// src/Apps/Nouns/Camp/components/NounDetailsModal.tsx
'use client';

import { useNoun, useAuctionHistory } from '@/app/lib/Nouns/Database/hooks';
import styles from './NounDetailsModal.module.css';

interface NounDetailsModalProps {
  nounId: number;
  onClose: () => void;
}

export function NounDetailsModal({ nounId, onClose }: NounDetailsModalProps) {
  const { noun, isLoading: nounLoading } = useNoun(nounId);
  const { auction, isLoading: auctionLoading } = useAuctionHistory(nounId);

  const isLoading = nounLoading || auctionLoading;

  if (isLoading) {
    return (
      <div className={styles.modal}>
        <div className={styles.content}>
          <div className={styles.loading}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!noun) {
    return (
      <div className={styles.modal}>
        <div className={styles.content}>
          <p>Noun not found</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>

        <div className={styles.details}>
          {/* Image */}
          <div 
            className={styles.image}
            dangerouslySetInnerHTML={{ __html: noun.noun.svg_data }} 
          />

          {/* Info */}
          <div className={styles.info}>
            <h2>Noun {noun.noun.noun_id}</h2>

            {/* Traits */}
            <section>
              <h3>Traits</h3>
              <dl>
                <dt>Background:</dt>
                <dd>{noun.noun.background}</dd>
                <dt>Body:</dt>
                <dd>{noun.noun.body}</dd>
                <dt>Accessory:</dt>
                <dd>{noun.noun.accessory}</dd>
                <dt>Head:</dt>
                <dd>{noun.noun.head}</dd>
                <dt>Glasses:</dt>
                <dd>{noun.noun.glasses}</dd>
              </dl>
            </section>

            {/* Owner */}
            <section>
              <h3>Ownership</h3>
              <p>
                <strong>Current Owner:</strong><br />
                <a 
                  href={`https://etherscan.io/address/${noun.noun.current_owner}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {noun.noun.current_owner}
                </a>
              </p>
              {noun.noun.current_delegate && (
                <p>
                  <strong>Delegate:</strong><br />
                  <a 
                    href={`https://etherscan.io/address/${noun.noun.current_delegate}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {noun.noun.current_delegate}
                  </a>
                </p>
              )}
            </section>

            {/* Auction */}
            {auction && (
              <section>
                <h3>Auction</h3>
                <p>
                  <strong>Winning Bid:</strong> {auction.winning_bid_eth} ETH
                </p>
                <p>
                  <strong>Winner:</strong><br />
                  {auction.winner_address}
                </p>
                {auction.settler_address && (
                  <p>
                    <strong>Settled By:</strong><br />
                    {auction.settler_address}
                  </p>
                )}
                <a 
                  href={`https://etherscan.io/tx/${auction.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.txLink}
                >
                  View Settlement Transaction →
                </a>
              </section>
            )}

            {/* History */}
            {noun.transfers && noun.transfers.length > 0 && (
              <section>
                <h3>Transfer History</h3>
                <ul className={styles.history}>
                  {noun.transfers.map((transfer) => (
                    <li key={transfer.id}>
                      From {transfer.from_address.slice(0, 6)}... to{' '}
                      {transfer.to_address.slice(0, 6)}... on{' '}
                      {new Date(parseInt(transfer.timestamp) * 1000).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Example 5: Search Nouns by Owner

```typescript
// src/Apps/Nouns/Camp/components/OwnerSearch.tsx
'use client';

import { useState } from 'react';
import styles from './OwnerSearch.module.css';

export function OwnerSearch() {
  const [address, setAddress] = useState('');
  const [nouns, setNouns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      // You'll need to create this API endpoint
      const response = await fetch(`/api/nouns/by-owner?address=${address}`);
      
      if (!response.ok) {
        throw new Error('Failed to search');
      }

      const data = await response.json();
      setNouns(data.nouns);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.search}>
      <div className={styles.searchBar}>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter wallet address (0x...)"
          className={styles.input}
        />
        <button 
          onClick={handleSearch}
          disabled={isLoading || !address}
          className={styles.button}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className={styles.error}>{error}</div>
      )}

      {nouns.length > 0 && (
        <div className={styles.results}>
          <h3>Found {nouns.length} Noun{nouns.length === 1 ? '' : 's'}</h3>
          <div className={styles.grid}>
            {nouns.map((noun) => (
              <div key={noun.noun_id} className={styles.nounCard}>
                <div 
                  className={styles.nounImage}
                  dangerouslySetInnerHTML={{ __html: noun.svg_data }} 
                />
                <div className={styles.nounId}>Noun {noun.noun_id}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Corresponding API endpoint:**

```typescript
// app/api/nouns/by-owner/route.ts
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return Response.json({ error: 'Address required' }, { status: 400 });
  }

  try {
    const nouns = await sql`
      SELECT * FROM nouns
      WHERE LOWER(current_owner) = LOWER(${address})
      ORDER BY noun_id DESC
    `;

    return Response.json({ nouns });
  } catch (error) {
    console.error('Error fetching Nouns by owner:', error);
    return Response.json({ error: 'Failed to fetch Nouns' }, { status: 500 });
  }
}
```

---

## Migration Guide: From GraphQL to Database

### Step 1: Update Imports

**Before:**
```typescript
import { useCurrentAuction } from '@/app/lib/Nouns/Goldsky';
```

**After:**
```typescript
import { useCurrentAuction } from '@/app/lib/Nouns/Database/hooks';
```

### Step 2: Update Data Structure

The database returns slightly different data structures. Update your components:

**GraphQL Response:**
```typescript
{
  auction: {
    id: "123",
    noun: {
      id: "123",
      seed: {
        background: 0,
        body: 14,
        // ...
      }
    }
  }
}
```

**Database Response:**
```typescript
{
  noun: {
    noun_id: 123,
    background: 0,
    body: 14,
    svg_data: "<svg>...</svg>",
    current_owner: "0x...",
    // ...
  },
  auction: {
    winning_bid_eth: "0.5",
    winner_address: "0x...",
    // ...
  }
}
```

### Step 3: Replace GraphQL Queries

Find all instances of GraphQL queries and replace them with database hooks:

```bash
# Find GraphQL usage
grep -r "useQuery" src/Apps/Nouns/
grep -r "gql\`" src/Apps/Nouns/
```

### Step 4: Test Thoroughly

- Test all Noun displays
- Test pagination
- Test error states
- Test loading states
- Compare with GraphQL version for accuracy

---

## Best Practices

1. **Always handle loading states** - The database might be slow, show a loading indicator
2. **Handle errors gracefully** - Network issues happen, provide retry functionality
3. **Use pagination** - Don't fetch all Nouns at once, use limit/offset
4. **Cache aggressively** - Consider using React Query for automatic caching
5. **Poll for updates** - Use the `pollInterval` parameter for real-time data
6. **Optimize images** - Consider lazy loading SVGs for large lists
7. **Type safety** - Always use the provided TypeScript types

---

## Next Steps

1. Replace GraphQL in Auction app with database hooks
2. Replace GraphQL in Camp app with database hooks
3. Add search functionality
4. Add filtering by traits
5. Set up automated sync cron job
6. Monitor performance and optimize queries

