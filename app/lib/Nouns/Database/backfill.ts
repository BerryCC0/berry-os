/**
 * Nouns Database - Backfill Logic
 * Functions for populating database with historical Nouns data
 */

import { generateNounSVG, getNounTraits } from '@/src/Apps/Nouns/Auction/utils/helpers/nounImageHelper';
import { getSettlerAddress } from './etherscan';
import {
  insertNoun,
  insertAuctionHistory,
  insertOwnershipHistory,
  insertDelegationHistory,
  insertVoteHistory,
} from './persistence';
import type { Noun, Auction, TransferEvent, DelegationEvent, Vote } from '../Goldsky/utils/types';
import type {
  InsertNounData,
  InsertAuctionHistoryData,
  InsertOwnershipHistoryData,
  InsertDelegationHistoryData,
  InsertVoteHistoryData,
} from './types';

/**
 * Progress callback for backfill operations
 */
export type BackfillProgressCallback = (
  completed: number,
  total: number,
  message: string
) => void;

/**
 * Process a single Noun from the subgraph and insert into database
 */
export async function processNoun(
  noun: Noun,
  auction?: Auction,
  transfers?: TransferEvent[],
  delegations?: DelegationEvent[],
  votes?: Vote[]
): Promise<void> {
  try {
    // 1. Extract traits and generate SVG
    const traits = getNounTraits(noun);
    if (!traits) {
      console.error(`Failed to extract traits for Noun ${noun.id}`);
      return;
    }

    const svgData = generateNounSVG(traits);

    // 2. Prepare Noun data
    const nounData: InsertNounData = {
      noun_id: parseInt(noun.id),
      background: traits.background,
      body: traits.body,
      accessory: traits.accessory,
      head: traits.head,
      glasses: traits.glasses,
      svg_data: svgData,
      created_timestamp: (noun as any).createdAtTimestamp || '0',
      created_block: (noun as any).createdAtBlockNumber || '0',
      current_owner: noun.owner.id,
      current_delegate: null, // Will be updated from delegation history
    };

    // 3. Insert Noun
    await insertNoun(nounData);

    // 4. Process auction history
    if (auction && auction.settled) {
      // Get settler address from Etherscan
      let settlerAddress: string | null = null;
      
      // Try to get tx hash from the auction's winning bid
      const winningBid = auction.bidder;
      if (winningBid?.txHash) {
        settlerAddress = await getSettlerAddress(winningBid.txHash);
      }

      const auctionData: InsertAuctionHistoryData = {
        noun_id: parseInt(noun.id),
        winner_address: auction.bidder?.bidder?.id || auction.noun.owner.id,
        winning_bid_eth: auction.amount,
        settler_address: settlerAddress,
        start_time: auction.startTime,
        end_time: auction.endTime,
        settled_timestamp: auction.endTime, // Approximate
        tx_hash: winningBid?.txHash || '',
        block_number: winningBid?.blockNumber || '0',
        client_id: winningBid?.clientId || null,
      };

      await insertAuctionHistory(auctionData);
    }

    // 5. Process ownership transfers
    if (transfers && transfers.length > 0) {
      for (const transfer of transfers) {
        const transferData: InsertOwnershipHistoryData = {
          noun_id: parseInt(noun.id),
          from_address: transfer.from.id,
          to_address: transfer.to.id,
          timestamp: transfer.blockTimestamp,
          block_number: transfer.blockNumber,
          tx_hash: `0x${transfer.id.split('-')[0]}`, // Extract tx hash from event ID
        };

        await insertOwnershipHistory(transferData);
      }
    }

    // 6. Process delegation events
    if (delegations && delegations.length > 0) {
      for (const delegation of delegations) {
        const delegationData: InsertDelegationHistoryData = {
          noun_id: parseInt(noun.id),
          delegator: delegation.delegator.id,
          from_delegate: delegation.fromDelegate.id,
          to_delegate: delegation.toDelegate.id,
          timestamp: delegation.blockTimestamp,
          block_number: delegation.blockNumber,
          tx_hash: `0x${delegation.id.split('-')[0]}`,
        };

        await insertDelegationHistory(delegationData);

        // Update current delegate if this is the latest delegation
        if (delegation.toDelegate.id) {
          // This would need to check if it's the latest - for simplicity,
          // we'll update in a separate pass after all delegations are inserted
        }
      }
    }

    // 7. Process votes
    if (votes && votes.length > 0) {
      for (const vote of votes) {
        const voteData: InsertVoteHistoryData = {
          noun_id: parseInt(noun.id),
          proposal_id: vote.proposal.id,
          support: vote.support,
          voter_address: vote.voter.id,
          votes_cast: vote.votesRaw,
          reason: vote.reason || null,
          timestamp: vote.blockTimestamp,
          block_number: vote.blockNumber,
          tx_hash: vote.transactionHash,
        };

        await insertVoteHistory(voteData);
      }
    }
  } catch (error) {
    console.error(`Error processing Noun ${noun.id}:`, error);
    throw error;
  }
}

/**
 * Batch process multiple Nouns
 */
export async function batchProcessNouns(
  nouns: Array<{
    noun: Noun;
    auction?: Auction;
    transfers?: TransferEvent[];
    delegations?: DelegationEvent[];
    votes?: Vote[];
  }>,
  progressCallback?: BackfillProgressCallback
): Promise<{
  successful: number;
  failed: number;
  errors: Array<{ nounId: string; error: string }>;
}> {
  let successful = 0;
  let failed = 0;
  const errors: Array<{ nounId: string; error: string }> = [];

  for (let i = 0; i < nouns.length; i++) {
    const { noun, auction, transfers, delegations, votes } = nouns[i];

    try {
      await processNoun(noun, auction, transfers, delegations, votes);
      successful++;

      if (progressCallback) {
        progressCallback(
          i + 1,
          nouns.length,
          `Processed Noun ${noun.id} (${i + 1}/${nouns.length})`
        );
      }
    } catch (error) {
      failed++;
      errors.push({
        nounId: noun.id,
        error: error instanceof Error ? error.message : String(error),
      });

      if (progressCallback) {
        progressCallback(
          i + 1,
          nouns.length,
          `Failed to process Noun ${noun.id}: ${error}`
        );
      }
    }
  }

  return { successful, failed, errors };
}

/**
 * Update settler addresses for existing auctions in batch
 * This can be run separately to backfill settler data
 */
export async function backfillSettlerAddresses(
  auctions: Array<{ nounId: number; txHash: string }>,
  progressCallback?: BackfillProgressCallback
): Promise<{
  successful: number;
  failed: number;
}> {
  let successful = 0;
  let failed = 0;

  for (let i = 0; i < auctions.length; i++) {
    const { nounId, txHash } = auctions[i];

    try {
      const settlerAddress = await getSettlerAddress(txHash);

      if (settlerAddress) {
        // Update the auction record with settler address
        const { updateAuctionSettler } = await import('./persistence');
        await updateAuctionSettler(nounId, settlerAddress);
        successful++;
      } else {
        failed++;
      }

      if (progressCallback) {
        progressCallback(
          i + 1,
          auctions.length,
          `Updated settler for Noun ${nounId} (${i + 1}/${auctions.length})`
        );
      }
    } catch (error) {
      failed++;
      console.error(`Failed to update settler for Noun ${nounId}:`, error);

      if (progressCallback) {
        progressCallback(
          i + 1,
          auctions.length,
          `Failed to update settler for Noun ${nounId}`
        );
      }
    }
  }

  return { successful, failed };
}

/**
 * Validate a Noun record before inserting
 */
export function validateNounData(noun: Noun): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!noun.id || isNaN(parseInt(noun.id))) {
    errors.push('Invalid Noun ID');
  }

  if (!noun.seed) {
    errors.push('Missing seed data');
  } else {
    if (noun.seed.background === undefined) errors.push('Missing background trait');
    if (noun.seed.body === undefined) errors.push('Missing body trait');
    if (noun.seed.accessory === undefined) errors.push('Missing accessory trait');
    if (noun.seed.head === undefined) errors.push('Missing head trait');
    if (noun.seed.glasses === undefined) errors.push('Missing glasses trait');
  }

  if (!noun.owner?.id) {
    errors.push('Missing owner data');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get backfill statistics
 */
export interface BackfillStats {
  totalNouns: number;
  processedNouns: number;
  remainingNouns: number;
  successRate: number;
}

/**
 * Calculate backfill progress statistics
 */
export function calculateBackfillStats(
  totalNouns: number,
  processedNouns: number,
  failed: number
): BackfillStats {
  const successful = processedNouns - failed;
  const successRate = processedNouns > 0 ? (successful / processedNouns) * 100 : 0;

  return {
    totalNouns,
    processedNouns,
    remainingNouns: totalNouns - processedNouns,
    successRate,
  };
}

