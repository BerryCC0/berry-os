# Camp Polling - Testing Guide

## Quick Test Checklist

### 1. Basic Polling Functionality

**Open Camp app and Activity tab:**
```bash
npm run dev
# Navigate to: http://localhost:3000/
# Open Camp app → Activity tab
```

**Open browser console and watch for:**
```
✅ Initial data loads
✅ "Polling started" (implicit - no logs by default)
✅ Data updates every 15 seconds (watch timestamps)
```

**Test all tabs:**
- Activity: Should show recent votes/signatures
- Proposals: Should show proposal list
- Candidates: Should show proposal candidates
- Voters: Should show delegates

---

### 2. Tab Visibility Testing

**Test inactive tab behavior:**

1. Open Camp app
2. Wait for initial data load
3. **Switch to another browser tab** (e.g., open a new tab)
4. Wait 2 minutes
5. **Switch back to Camp tab**

**Expected behavior:**
- ✅ Polling stopped when tab inactive (saves resources)
- ✅ Polling resumed when tab active
- ✅ Fresh data loaded immediately on resume

**How to verify:**
- Open Network tab in DevTools
- Filter by "goldsky.com"
- Watch for requests stopping/resuming

---

### 3. Component Mount/Unmount Testing

**Test remounting:**

1. Open Camp app
2. Click away to Desktop
3. Click Camp icon again to reopen

**Expected behavior:**
- ✅ Polling stops on unmount
- ✅ Fresh data loads on remount
- ✅ Polling starts again

---

### 4. Multi-Tab Polling

**Test intervals:**

1. Open Camp app
2. Open DevTools → Network tab
3. Filter by "goldsky.com"
4. Click through each tab:
   - Activity
   - Proposals
   - Candidates
   - Voters

**Expected intervals:**
- Activity: Request every ~15 seconds
- Proposals: Request every ~30 seconds
- Candidates: Request every ~45 seconds
- Voters: Request every ~60 seconds

**Tip**: Look at the "Time" column in Network tab to see request intervals.

---

### 5. Cache Behavior Testing

**Test instant cache + background update:**

1. Open Camp app → Proposals tab
2. Wait for data to load
3. **Close and reopen Camp app**
4. Watch the UI

**Expected behavior:**
- ✅ Cached data appears **instantly** (< 100ms)
- ✅ Background network request happens silently
- ✅ UI updates if new data available (no loading state)

**How to verify:**
- UI should never show "Loading..." after initial load
- Data should appear immediately on reopen
- Network tab shows request happening in background

---

### 6. Real-Time Update Testing

**Simulate new governance activity:**

This requires actual on-chain activity, but here's how to test:

1. Open Camp app → Activity tab
2. Wait for someone to vote on an active proposal (or vote yourself)
3. Watch for the new vote to appear

**Expected timing:**
- Vote confirmed on-chain: Instant
- Goldsky indexes: ~5-10 seconds
- Next poll happens: 0-15 seconds
- **Total delay**: ~15-25 seconds

**Alternative test:**
Use DevTools to manually trigger a refetch and watch UI update.

---

### 7. Error Handling Testing

**Test network failure:**

1. Open Camp app
2. Open DevTools → Network tab
3. **Set network to "Offline"** (Network conditions dropdown)
4. Wait for next poll attempt

**Expected behavior:**
- ✅ UI doesn't break
- ✅ Error logged to console
- ✅ Apollo retry mechanism kicks in
- ✅ Polling continues when back online

**Test back online:**
1. Set network back to "Online"
2. Watch for data to resume loading

---

### 8. Performance Testing

**Check resource usage:**

1. Open Camp app
2. Open DevTools → Performance tab
3. Start recording
4. Let it run for 2 minutes across all tabs
5. Stop recording

**Expected behavior:**
- ✅ No memory leaks
- ✅ No excessive re-renders
- ✅ Polling intervals stable
- ✅ CPU usage minimal when idle

**Check network usage:**
- Activity tab: ~4 requests/minute (15s interval)
- Proposals tab: ~2 requests/minute (30s interval)
- Candidates tab: ~1.3 requests/minute (45s interval)
- Voters tab: ~1 request/minute (60s interval)

---

## Console Commands for Testing

### Manually Trigger Refetch

```javascript
// In browser console:
window.__APOLLO_CLIENT__.refetchQueries({ include: 'all' });
```

### Check Apollo Cache

```javascript
// View cached data:
window.__APOLLO_CLIENT__.cache.extract();
```

### Check Polling Status

```javascript
// Check if query is polling:
window.__APOLLO_CLIENT__.queryManager.queries.forEach((query, id) => {
  console.log(`Query ${id}:`, query.options.pollInterval);
});
```

---

## Common Issues & Solutions

### Issue: Polling doesn't stop when tab inactive

**Cause**: `visibilitychange` event not supported or blocked

**Solution**: Check browser compatibility (all modern browsers support it)

**Verify**:
```javascript
// In console:
console.log('Hidden:', document.hidden);
document.addEventListener('visibilitychange', () => {
  console.log('Visibility changed:', document.hidden);
});
```

---

### Issue: Data doesn't update

**Cause**: Apollo cache not invalidating

**Solution**: Check `fetchPolicy` is set to `cache-and-network`

**Verify**:
```javascript
// In query options:
fetchPolicy: 'cache-and-network',
nextFetchPolicy: 'cache-first',
```

---

### Issue: Too many network requests

**Cause**: Multiple components using same query without shared cache

**Solution**: Ensure all queries use the same `nounsApolloClient`

**Verify**:
```javascript
// Each query should have:
client: nounsApolloClient,
```

---

### Issue: Polling continues after unmount

**Cause**: Cleanup function not running

**Solution**: Check `useEffect` cleanup in `useSmartPolling`

**Verify**:
```typescript
useEffect(() => {
  // ...
  return () => {
    stopPolling(); // This MUST run on unmount
  };
}, []);
```

---

## Debugging Tips

### Enable Apollo Client DevTools

1. Install: [Apollo Client DevTools](https://chrome.google.com/webstore/detail/apollo-client-devtools)
2. Open DevTools → Apollo tab
3. View queries, cache, and polling status

### Enable Verbose Logging

Add to `useSmartPolling`:
```typescript
useEffect(() => {
  console.log('[useSmartPolling] Starting polling:', interval);
  
  const handleVisibilityChange = () => {
    console.log('[useSmartPolling] Visibility changed:', document.hidden);
    // ...
  };
  
  return () => {
    console.log('[useSmartPolling] Cleanup - stopping polling');
  };
}, []);
```

### Monitor Network Timing

```javascript
// In console:
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('goldsky'))
  .forEach(r => console.log(r.name, r.duration, 'ms'));
```

---

## Success Criteria

### ✅ All Tests Pass

- [x] Initial data loads instantly
- [x] Polling starts automatically
- [x] Polling stops when tab inactive
- [x] Polling resumes when tab active
- [x] Polling stops on unmount
- [x] Data updates seamlessly (no loading states)
- [x] Different intervals per tab
- [x] Cache works (instant on remount)
- [x] No memory leaks
- [x] No excessive network requests

### ✅ User Experience

- [x] No manual refresh button needed
- [x] No "New data available" banners
- [x] No loading spinners on updates
- [x] Data feels fresh and up-to-date
- [x] Battery efficient (stops when inactive)

### ✅ Developer Experience

- [x] Easy to understand code
- [x] Reusable `useSmartPolling` hook
- [x] Type-safe implementation
- [x] Clear documentation
- [x] Easy to adjust intervals

---

## Next Steps After Testing

If all tests pass:

1. ✅ Commit changes
2. ✅ Push to main
3. ✅ Deploy to Vercel
4. ✅ Monitor production metrics

If issues found:

1. ❌ Document the issue
2. ❌ Add console.log debugging
3. ❌ Check DevTools Network/Performance
4. ❌ Review implementation
5. ❌ Fix and retest

---

**Happy Testing!** 🎉

