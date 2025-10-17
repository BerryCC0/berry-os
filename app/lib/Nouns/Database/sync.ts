/**
 * Nouns Database - Sync Logic
 * Real-time synchronization of new Nouns and updates
 */

import { getSyncState, updateSyncState } from './persistence';
import { processNoun, BackfillProgressCallback } from './backfill';
import type { Noun, Auction, TransferEvent, DelegationEvent, Vote } from '../Goldsky/utils/types';

/**
 * Sync result
 */
export interface SyncResult {
  newNouns: number;
  updatedNouns: number;
  errors: Array<{ nounId: string; error: string }>;
  lastSyncedBlock: string;
  lastSyncedTimestamp: string;
}

/**
 * Sync new Nouns from the subgraph
 * Fetches Nouns created since last sync
 */
export async function syncNewNouns(
  fetchNounsSince: (blockNumber: string) => Promise<Noun[]>,
  fetchAuction: (nounId: string) => Promise<Auction | null>,
  progressCallback?: BackfillProgressCallback
): Promise<SyncResult> {
  try {
    // Get last sync state
    const syncState = await getSyncState('nouns');
    const lastSyncedBlock = syncState?.last_synced_block || '0';

    // Fetch new Nouns since last sync
    const newNouns = await fetchNounsSince(lastSyncedBlock);

    if (newNouns.length === 0) {
      return {
        newNouns: 0,
        updatedNouns: 0,
        errors: [],
        lastSyncedBlock,
        lastSyncedTimestamp: syncState?.last_synced_timestamp || '0',
      };
    }

    // Process each new Noun
    let processed = 0;
    const errors: Array<{ nounId: string; error: string }> = [];

    for (let i = 0; i < newNouns.length; i++) {
      const noun = newNouns[i];

      try {
        // Fetch auction data for this Noun
        const auction = await fetchAuction(noun.id);

        // Process and insert into database
        await processNoun(noun, auction || undefined);
        processed++;

        if (progressCallback) {
          progressCallback(
            i + 1,
            newNouns.length,
            `Synced Noun ${noun.id} (${i + 1}/${newNouns.length})`
          );
        }
      } catch (error) {
        errors.push({
          nounId: noun.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Update sync state
    const latestNoun = newNouns[newNouns.length - 1];
    const newSyncState = {
      entity_type: 'nouns',
      last_synced_block: latestNoun.createdAtBlockNumber || lastSyncedBlock,
      last_synced_timestamp: latestNoun.createdAtTimestamp || Date.now().toString(),
      last_synced_noun_id: parseInt(latestNoun.id),
    };

    await updateSyncState(newSyncState);

    return {
      newNouns: processed,
      updatedNouns: 0,
      errors,
      lastSyncedBlock: newSyncState.last_synced_block,
      lastSyncedTimestamp: newSyncState.last_synced_timestamp,
    };
  } catch (error) {
    console.error('Error during sync:', error);
    throw error;
  }
}

/**
 * Sync ownership updates
 * Fetches recent transfers and updates current owners
 */
export async function syncOwnershipUpdates(
  fetchTransfersSince: (blockNumber: string) => Promise<TransferEvent[]>,
  progressCallback?: BackfillProgressCallback
): Promise<SyncResult> {
  try {
    const syncState = await getSyncState('transfers');
    const lastSyncedBlock = syncState?.last_synced_block || '0';

    const transfers = await fetchTransfersSince(lastSyncedBlock);

    if (transfers.length === 0) {
      return {
        newNouns: 0,
        updatedNouns: 0,
        errors: [],
        lastSyncedBlock,
        lastSyncedTimestamp: syncState?.last_synced_timestamp || '0',
      };
    }

    // Process transfers and update owners
    const { updateNounOwner, insertOwnershipHistory } = await import('./persistence');
    let updated = 0;
    const errors: Array<{ nounId: string; error: string }> = [];

    for (let i = 0; i < transfers.length; i++) {
      const transfer = transfers[i];

      try {
        const nounId = parseInt(transfer.noun.id);

        // Insert transfer record
        await insertOwnershipHistory({
          noun_id: nounId,
          from_address: transfer.from.id,
          to_address: transfer.to.id,
          timestamp: transfer.blockTimestamp,
          block_number: transfer.blockNumber,
          tx_hash: `0x${transfer.id.split('-')[0]}`,
        });

        // Update current owner
        await updateNounOwner(nounId, transfer.to.id);
        updated++;

        if (progressCallback) {
          progressCallback(
            i + 1,
            transfers.length,
            `Updated ownership for Noun ${nounId} (${i + 1}/${transfers.length})`
          );
        }
      } catch (error) {
        errors.push({
          nounId: transfer.noun.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Update sync state
    const latestTransfer = transfers[transfers.length - 1];
    await updateSyncState({
      entity_type: 'transfers',
      last_synced_block: latestTransfer.blockNumber,
      last_synced_timestamp: latestTransfer.blockTimestamp,
      last_synced_noun_id: null,
    });

    return {
      newNouns: 0,
      updatedNouns: updated,
      errors,
      lastSyncedBlock: latestTransfer.blockNumber,
      lastSyncedTimestamp: latestTransfer.blockTimestamp,
    };
  } catch (error) {
    console.error('Error syncing ownership updates:', error);
    throw error;
  }
}

/**
 * Sync delegation updates
 */
export async function syncDelegationUpdates(
  fetchDelegationsSince: (blockNumber: string) => Promise<DelegationEvent[]>,
  progressCallback?: BackfillProgressCallback
): Promise<SyncResult> {
  try {
    const syncState = await getSyncState('delegations');
    const lastSyncedBlock = syncState?.last_synced_block || '0';

    const delegations = await fetchDelegationsSince(lastSyncedBlock);

    if (delegations.length === 0) {
      return {
        newNouns: 0,
        updatedNouns: 0,
        errors: [],
        lastSyncedBlock,
        lastSyncedTimestamp: syncState?.last_synced_timestamp || '0',
      };
    }

    const { updateNounDelegate, insertDelegationHistory } = await import('./persistence');
    let updated = 0;
    const errors: Array<{ nounId: string; error: string }> = [];

    for (let i = 0; i < delegations.length; i++) {
      const delegation = delegations[i];

      try {
        // Note: DelegationEvent doesn't have a direct noun reference
        // We would need to determine which Noun this delegation affects
        // For now, we'll skip this or implement when we have the proper data structure

        await insertDelegationHistory({
          noun_id: 0, // TODO: Derive from delegator's Nouns
          delegator: delegation.delegator.id,
          from_delegate: delegation.fromDelegate.id,
          to_delegate: delegation.toDelegate.id,
          timestamp: delegation.blockTimestamp,
          block_number: delegation.blockNumber,
          tx_hash: `0x${delegation.id.split('-')[0]}`,
        });

        updated++;

        if (progressCallback) {
          progressCallback(
            i + 1,
            delegations.length,
            `Updated delegation (${i + 1}/${delegations.length})`
          );
        }
      } catch (error) {
        errors.push({
          nounId: 'unknown',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const latestDelegation = delegations[delegations.length - 1];
    await updateSyncState({
      entity_type: 'delegations',
      last_synced_block: latestDelegation.blockNumber,
      last_synced_timestamp: latestDelegation.blockTimestamp,
      last_synced_noun_id: null,
    });

    return {
      newNouns: 0,
      updatedNouns: updated,
      errors,
      lastSyncedBlock: latestDelegation.blockNumber,
      lastSyncedTimestamp: latestDelegation.blockTimestamp,
    };
  } catch (error) {
    console.error('Error syncing delegation updates:', error);
    throw error;
  }
}

/**
 * Comprehensive sync - syncs everything
 */
export async function syncAll(
  fetchers: {
    fetchNounsSince: (blockNumber: string) => Promise<Noun[]>;
    fetchAuction: (nounId: string) => Promise<Auction | null>;
    fetchTransfersSince: (blockNumber: string) => Promise<TransferEvent[]>;
    fetchDelegationsSince: (blockNumber: string) => Promise<DelegationEvent[]>;
  },
  progressCallback?: BackfillProgressCallback
): Promise<{
  nouns: SyncResult;
  ownership: SyncResult;
  delegations: SyncResult;
}> {
  const [nouns, ownership, delegations] = await Promise.all([
    syncNewNouns(fetchers.fetchNounsSince, fetchers.fetchAuction, progressCallback),
    syncOwnershipUpdates(fetchers.fetchTransfersSince, progressCallback),
    syncDelegationUpdates(fetchers.fetchDelegationsSince, progressCallback),
  ]);

  return {
    nouns,
    ownership,
    delegations,
  };
}

/**
 * Check if sync is needed
 * Returns true if it's been more than the specified interval since last sync
 */
export async function shouldSync(
  entityType: string,
  intervalMinutes: number = 30
): Promise<boolean> {
  const syncState = await getSyncState(entityType);

  if (!syncState) {
    return true; // Never synced, should sync
  }

  const now = Date.now();
  const lastSync = new Date(syncState.updated_at).getTime();
  const intervalMs = intervalMinutes * 60 * 1000;

  return now - lastSync >= intervalMs;
}

