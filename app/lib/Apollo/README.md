## # Apollo Client - Generic GraphQL Utilities

Reusable Apollo Client configuration and utilities for any GraphQL endpoint.

## Overview

This module provides a **generic, reusable** Apollo Client setup that can be used for any GraphQL API or subgraph. It includes:

- **Client Factory**: Create configured Apollo Client instances for any endpoint
- **Generic Provider**: React provider wrapper for Apollo Client
- **Business Logic Utilities**: Pure functions for query operations, cache management, and error handling
- **TypeScript Support**: Full type safety for all utilities

## Architecture

```
app/lib/Apollo/
├── client.ts              # Client factory & configuration
├── ApolloProvider.tsx     # Generic React provider
├── utils/
│   ├── types.ts           # TypeScript type definitions
│   ├── query.ts           # Query utilities
│   ├── cache.ts           # Cache management
│   ├── error.ts           # Error handling
│   └── index.ts           # Central exports
├── index.ts               # Main export
└── README.md              # This file
```

## Quick Start

### 1. Create a Client

```typescript
import { createApolloClient } from '@/app/lib/Apollo';

const myClient = createApolloClient({
  uri: 'https://api.example.com/graphql',
  name: 'My Subgraph',
  enableRetry: true,
  retryAttempts: 3,
});
```

### 2. Use the Provider

```typescript
import { ApolloProvider } from '@/app/lib/Apollo';
import { myClient } from './clients';

function App() {
  return (
    <ApolloProvider client={myClient}>
      <YourApp />
    </ApolloProvider>
  );
}
```

### 3. Query with Utilities

```typescript
import { useQuery } from '@apollo/client';
import { query } from '@/app/lib/Apollo';

function MyComponent() {
  const result = useQuery(MY_QUERY, {
    client: myClient,
    variables: query.buildPaginationVariables({ first: 10, skip: 0 })
  });

  if (query.isLoading(result.loading, result.networkStatus)) {
    return <div>Loading...</div>;
  }

  const data = query.extractData(result);
  // ...
}
```

## API Reference

### Client Factory

#### `createApolloClient(config)`

Creates a configured Apollo Client instance with error handling and retry logic.

**Parameters:**
- `uri` (string): GraphQL endpoint URL
- `name` (string, optional): Client name for logging
- `enableRetry` (boolean, optional): Enable retry on network errors (default: true)
- `retryAttempts` (number, optional): Maximum retry attempts (default: 3)
- `retryDelay` (number, optional): Initial retry delay in ms (default: 300)
- `cacheConfig` (object, optional): Custom cache configuration

**Returns:** `ApolloClient<NormalizedCacheObject>`

**Example:**
```typescript
const client = createApolloClient({
  uri: 'https://api.goldsky.com/...',
  name: 'Example Subgraph',
  retryAttempts: 5,
});
```

#### `createPaginatedCacheConfig(typePolicies?)`

Creates cache configuration optimized for paginated queries.

**Parameters:**
- `typePolicies` (object, optional): Additional type policies

**Returns:** Cache configuration object

**Example:**
```typescript
const cacheConfig = createPaginatedCacheConfig({
  Query: {
    fields: {
      items: {
        keyArgs: false,
        merge(existing = [], incoming) {
          return [...existing, ...incoming];
        },
      },
    },
  },
});
```

### Query Utilities

See [`utils/query.ts`](./utils/query.ts) for complete API.

**Key functions:**
- `buildPaginationVariables(options)` - Build pagination variables
- `buildOrderingVariables(orderBy, direction)` - Build ordering variables
- `extractData(result)` - Extract data from query result
- `isLoading(loading, networkStatus)` - Check loading state
- `hasNextPage(page, total, size)` - Check pagination state
- `calculateSkip(page, size)` - Calculate skip value

### Cache Utilities

See [`utils/cache.ts`](./utils/cache.ts) for complete API.

**Key functions:**
- `generateCacheKey(typename, id)` - Generate cache key
- `createCacheReference(typename, id)` - Create cache reference
- `mergeArrays(existing, incoming, keyField)` - Merge arrays without duplicates
- `estimateCacheSize(data)` - Estimate cache size

### Error Utilities

See [`utils/error.ts`](./utils/error.ts) for complete API.

**Key functions:**
- `isApolloError(error)` - Check if error is Apollo error
- `getErrorMessage(error)` - Extract error message
- `getErrorSeverity(error)` - Get error severity level
- `isRetryableError(error)` - Check if error should be retried
- `getUserFriendlyErrorMessage(error)` - Get user-friendly message

## Usage Examples

### Multiple Clients

```typescript
// clients.ts
import { createApolloClient } from '@/app/lib/Apollo';

export const nounsClient = createApolloClient({
  uri: 'https://api.goldsky.com/.../nouns',
  name: 'Nouns DAO',
});

export const uniswapClient = createApolloClient({
  uri: 'https://api.thegraph.com/.../uniswap',
  name: 'Uniswap V3',
});

export const ensClient = createApolloClient({
  uri: 'https://api.thegraph.com/.../ens',
  name: 'ENS',
});
```

### With Custom Cache

```typescript
import { createApolloClient, createPaginatedCacheConfig } from '@/app/lib/Apollo';

const client = createApolloClient({
  uri: 'https://api.example.com/graphql',
  cacheConfig: createPaginatedCacheConfig({
    Query: {
      fields: {
        myItems: {
          keyArgs: ['filter'],
          merge(existing = [], incoming, { args }) {
            if (args?.skip === 0) {
              return incoming; // Reset on first page
            }
            return [...existing, ...incoming];
          },
        },
      },
    },
    MyType: {
      keyFields: ['customId'], // Use custom ID field
    },
  }),
});
```

### Error Handling

```typescript
import { useQuery } from '@apollo/client';
import { error as errorUtils } from '@/app/lib/Apollo';

function MyComponent() {
  const { data, error } = useQuery(MY_QUERY);

  if (error) {
    if (errorUtils.isNetworkError(error)) {
      return <div>Network error. Please check your connection.</div>;
    }
    
    if (errorUtils.isRetryableError(error)) {
      // Will be retried automatically
      return <div>Retrying...</div>;
    }
    
    return <div>{errorUtils.getUserFriendlyErrorMessage(error)}</div>;
  }

  return <div>{/* Render data */}</div>;
}
```

### Pagination

```typescript
import { useQuery } from '@apollo/client';
import { query } from '@/app/lib/Apollo';

function PaginatedList() {
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const { data, loading, fetchMore } = useQuery(MY_QUERY, {
    variables: {
      ...query.buildPaginationVariables({
        first: pageSize,
        skip: query.calculateSkip(page, pageSize),
      }),
      ...query.buildOrderingVariables('createdAt', 'desc'),
    },
  });

  const hasNext = query.hasNextPage(page, totalCount, pageSize);

  return (
    <div>
      {/* Render items */}
      {hasNext && (
        <button onClick={() => setPage(p => p + 1)}>
          Next Page
        </button>
      )}
    </div>
  );
}
```

## Design Principles

1. **Generic & Reusable**: Works with any GraphQL endpoint
2. **Type Safe**: Full TypeScript coverage
3. **Separation of Concerns**: Business logic separate from React components
4. **Testable**: Pure functions that can be tested in isolation
5. **Extensible**: Easy to add custom configurations and utilities

## Integration with Subgraphs

This Apollo module is designed to be **consumed by** specific subgraph integrations:

- **Nouns DAO**: `/app/lib/Nouns/` uses Apollo to query Nouns subgraph
- **Future subgraphs**: Can easily create new clients using `createApolloClient()`

### Example: Creating a New Subgraph Integration

```typescript
// app/lib/MySubgraph/apolloClient.ts
import { createApolloClient, createPaginatedCacheConfig } from '@/app/lib/Apollo';

const cacheConfig = createPaginatedCacheConfig({
  Query: {
    fields: {
      myEntities: {
        keyArgs: false,
        merge(existing = [], incoming) {
          return [...existing, ...incoming];
        },
      },
    },
  },
});

export const mySubgraphClient = createApolloClient({
  uri: 'https://api.thegraph.com/.../my-subgraph',
  name: 'My Subgraph',
  cacheConfig,
});
```

## Resources

- **Apollo Client Docs**: https://www.apollographql.com/docs/react/
- **The Graph**: https://thegraph.com/
- **Goldsky**: https://goldsky.com/

---

**Built for Nouns OS by Berry**

