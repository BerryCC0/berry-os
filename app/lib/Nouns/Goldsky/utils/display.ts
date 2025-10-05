/**
 * Display Utilities for Berry OS UI
 * 
 * Ready-to-render data transformations that combine Goldsky subgraph data
 * with Contract helper formatting for consistent UI rendering.
 * 
 * These functions return plain objects optimized for React components.
 */

import type { Auction, Proposal, Noun, Vote, Delegate, Account, Bid } from './types';
import * as auction from './auction';
import * as proposal from './proposal';
import * as vote from './vote';
import * as noun from './noun';
import * as delegate from './delegate';
import * as account from './account';
import { formatEth, formatTimeRemaining as formatTime } from '../../Contracts/utils';

// Local helper for address formatting
function formatAddr(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ============================================================================
// AUCTION DISPLAYS
// ============================================================================

/**
 * Get auction data ready for card display
 * Perfect for auction list/grid views
 */
export interface AuctionCardDisplay {
  nounId: string;
  currentBid: string;
  currentBidRaw: bigint;
  timeRemaining: string;
  timeRemainingSeconds: number;
  bidCount: number;
  isActive: boolean;
  isSettled: boolean;
  hasEnded: boolean;
  url: string;
  winningBidder: string | null;
  nounBackground: number;
  nounBody: number;
  nounAccessory: number;
  nounHead: number;
  nounGlasses: number;
}

export function auctionForCard(data: Auction): AuctionCardDisplay {
  const timeRemaining = auction.getTimeRemaining(data);
  
  return {
    nounId: data.noun.id,
    currentBid: formatEth(BigInt(data.amount)),
    currentBidRaw: BigInt(data.amount),
    timeRemaining: formatTime(timeRemaining),
    timeRemainingSeconds: timeRemaining,
    bidCount: auction.getBidCount(data),
    isActive: auction.isActive(data),
    isSettled: auction.isSettled(data),
    hasEnded: auction.hasEnded(data),
    url: auction.getAuctionUrl(data),
    winningBidder: auction.getWinningBidder(data),
    nounBackground: data.noun.background,
    nounBody: data.noun.body,
    nounAccessory: data.noun.accessory,
    nounHead: data.noun.head,
    nounGlasses: data.noun.glasses,
  };
}

/**
 * Get auction data ready for detailed view
 * Perfect for auction detail pages
 */
export interface AuctionDetailDisplay extends AuctionCardDisplay {
  startDate: Date;
  endDate: Date;
  startDateFormatted: string;
  endDateFormatted: string;
  minNextBid: string;
  minNextBidRaw: bigint;
  uniqueBidders: number;
  auctionDuration: number;
  summary: string;
  owner: {
    address: string;
    addressShort: string;
    nounCount: string;
  };
  topBids: Array<{
    amount: string;
    amountRaw: bigint;
    bidder: string;
    bidderShort: string;
    timestamp: Date;
    timestampFormatted: string;
  }>;
}

export function auctionForDetail(data: Auction): AuctionDetailDisplay {
  const cardData = auctionForCard(data);
  const minNextBid = BigInt(auction.getMinimumNextBid(data));
  
  // Get top 10 bids sorted by amount
  const topBids = data.bids
    ? auction.sortBidsByAmountDesc(data.bids).slice(0, 10).map(bid => ({
        amount: formatEth(BigInt(bid.amount)),
        amountRaw: BigInt(bid.amount),
        bidder: bid.bidder.id,
        bidderShort: formatAddr(bid.bidder.id),
        timestamp: new Date(parseInt(bid.blockTimestamp, 10) * 1000),
        timestampFormatted: new Date(parseInt(bid.blockTimestamp, 10) * 1000).toLocaleString(),
      }))
    : [];
  
  return {
    ...cardData,
    startDate: auction.getStartDate(data),
    endDate: auction.getEndDate(data),
    startDateFormatted: auction.formatStartDate(data),
    endDateFormatted: auction.formatEndDate(data),
    minNextBid: formatEth(minNextBid),
    minNextBidRaw: minNextBid,
    uniqueBidders: auction.getUniqueBiddersCount(data),
    auctionDuration: auction.getAuctionDuration(data),
    summary: auction.getAuctionSummary(data),
    owner: {
      address: data.noun.owner.id,
      addressShort: formatAddr(data.noun.owner.id),
      nounCount: data.noun.owner.tokenBalance,
    },
    topBids,
  };
}

/**
 * Get bid history ready for table display
 */
export interface BidHistoryDisplay {
  id: string;
  amount: string;
  amountRaw: bigint;
  bidder: string;
  bidderShort: string;
  timestamp: Date;
  timestampFormatted: string;
  isWinning: boolean;
}

export function bidHistoryForTable(data: Auction): BidHistoryDisplay[] {
  if (!data.bids) return [];
  
  const winningBidder = auction.getWinningBidder(data);
  
  return auction.sortBidsByTimeDesc(data.bids).map(bid => ({
    id: bid.id,
    amount: formatEth(BigInt(bid.amount)),
    amountRaw: BigInt(bid.amount),
    bidder: bid.bidder.id,
    bidderShort: formatAddr(bid.bidder.id),
    timestamp: new Date(parseInt(bid.blockTimestamp, 10) * 1000),
    timestampFormatted: new Date(parseInt(bid.blockTimestamp, 10) * 1000).toLocaleString(),
    isWinning: winningBidder?.toLowerCase() === bid.bidder.id.toLowerCase(),
  }));
}

// ============================================================================
// PROPOSAL DISPLAYS
// ============================================================================

/**
 * Get proposal data ready for card display
 * Perfect for proposal list views
 */
export interface ProposalCardDisplay {
  id: string;
  title: string;
  status: string;
  statusColor: string;
  forVotes: string;
  againstVotes: string;
  abstainVotes: string;
  forVotesRaw: bigint;
  againstVotesRaw: bigint;
  abstainVotesRaw: bigint;
  forPercentage: number;
  againstPercentage: number;
  abstainPercentage: number;
  hasReachedQuorum: boolean;
  quorumProgress: number;
  isActive: boolean;
  canBeVotedOn: boolean;
  proposer: string;
  proposerShort: string;
  createdDate: Date;
  createdDateFormatted: string;
  age: string;
  url: string;
  actionCount: number;
}

export function proposalForCard(data: Proposal): ProposalCardDisplay {
  const forVotesRaw = proposal.getForVotes(data);
  const againstVotesRaw = proposal.getAgainstVotes(data);
  const abstainVotesRaw = proposal.getAbstainVotes(data);
  const totalVotes = proposal.getTotalVotes(data);
  const quorumThreshold = proposal.getQuorumThreshold(data);
  const quorumVotes = forVotesRaw + abstainVotesRaw;
  const quorumProgress = quorumThreshold > BigInt(0)
    ? Number((quorumVotes * BigInt(100)) / quorumThreshold)
    : 0;
  
  const age = proposal.getProposalAge(data);
  const ageString = age === 0 ? 'Today' : age === 1 ? '1 day ago' : `${age} days ago`;
  
  return {
    id: data.id,
    title: proposal.getTitle(data),
    status: proposal.formatStatus(data),
    statusColor: proposal.getStatusColor(data),
    forVotes: proposal.formatVotes(forVotesRaw),
    againstVotes: proposal.formatVotes(againstVotesRaw),
    abstainVotes: proposal.formatVotes(abstainVotesRaw),
    forVotesRaw,
    againstVotesRaw,
    abstainVotesRaw,
    forPercentage: proposal.getForPercentage(data),
    againstPercentage: proposal.getAgainstPercentage(data),
    abstainPercentage: proposal.getAbstainPercentage(data),
    hasReachedQuorum: proposal.hasReachedQuorum(data),
    quorumProgress,
    isActive: proposal.isActive(data),
    canBeVotedOn: proposal.canBeVotedOn(data),
    proposer: proposal.getProposer(data),
    proposerShort: formatAddr(proposal.getProposer(data)),
    createdDate: proposal.getCreatedDate(data),
    createdDateFormatted: proposal.getCreatedDate(data).toLocaleString(),
    age: ageString,
    url: proposal.getProposalUrl(data),
    actionCount: proposal.getActionCount(data),
  };
}

/**
 * Get proposal data ready for detailed view
 * Perfect for proposal detail pages
 */
export interface ProposalDetailDisplay extends ProposalCardDisplay {
  description: string;
  startBlock: number;
  endBlock: number;
  executionETA: Date | null;
  executionETAFormatted: string | null;
  totalVotes: string;
  totalVotesRaw: bigint;
  isFinalized: boolean;
  isPending: boolean;
  isQueued: boolean;
  isExecuted: boolean;
  isDefeated: boolean;
  isCancelled: boolean;
  isVetoed: boolean;
  actions: Array<{
    target: string;
    targetShort: string;
    value: string;
    signature: string;
    calldata: string;
  }>;
  summary: string;
}

export function proposalForDetail(data: Proposal): ProposalDetailDisplay {
  const cardData = proposalForCard(data);
  const totalVotesRaw = proposal.getTotalVotes(data);
  const actions = proposal.getActions(data).map(action => ({
    target: action.target,
    targetShort: formatAddr(action.target),
    value: formatEth(BigInt(action.value)),
    signature: action.signature,
    calldata: action.calldata,
  }));
  
  return {
    ...cardData,
    description: proposal.getDescription(data),
    startBlock: proposal.getStartBlock(data),
    endBlock: proposal.getEndBlock(data),
    executionETA: proposal.getExecutionETA(data),
    executionETAFormatted: proposal.formatExecutionETA(data),
    totalVotes: proposal.formatVotes(totalVotesRaw),
    totalVotesRaw,
    isFinalized: proposal.isFinalized(data),
    isPending: proposal.isPending(data),
    isQueued: proposal.isQueued(data),
    isExecuted: proposal.isExecuted(data),
    isDefeated: proposal.isDefeated(data),
    isCancelled: proposal.isCancelled(data),
    isVetoed: proposal.isVetoed(data),
    actions,
    summary: proposal.getProposalSummary(data),
  };
}

/**
 * Get vote data ready for table display
 */
export interface VoteDisplayRow {
  id: string;
  voter: string;
  voterShort: string;
  support: string;
  supportIcon: '✓' | '✗' | '−';
  votes: string;
  votesRaw: bigint;
  reason: string | null;
  blockNumber: number;
}

export function votesForTable(data: Proposal): VoteDisplayRow[] {
  if (!data.votes) return [];
  
  return data.votes.map(v => ({
    id: v.id,
    voter: v.voter.id,
    voterShort: formatAddr(v.voter.id),
    support: vote.getSupportString(v),
    supportIcon: vote.isFor(v) ? '✓' : vote.isAgainst(v) ? '✗' : '−',
    votes: vote.formatVotingPower(v),
    votesRaw: BigInt(v.votes),
    reason: v.reason || null,
    blockNumber: parseInt(v.blockNumber, 10),
  }));
}

// ============================================================================
// NOUN DISPLAYS
// ============================================================================

/**
 * Get noun data ready for card display
 * Perfect for noun gallery views
 */
export interface NounCardDisplay {
  id: string;
  idNumber: number;
  displayName: string;
  owner: string;
  ownerShort: string;
  background: number;
  body: number;
  accessory: number;
  head: number;
  glasses: number;
  createdDate: Date;
  createdDateFormatted: string;
  url: string;
}

export function nounForCard(data: Noun): NounCardDisplay {
  return {
    id: data.id,
    idNumber: noun.getNounIdAsNumber(data),
    displayName: noun.getNounDisplayName(data),
    owner: data.owner.id,
    ownerShort: formatAddr(data.owner.id),
    background: data.background,
    body: data.body,
    accessory: data.accessory,
    head: data.head,
    glasses: data.glasses,
    createdDate: noun.getCreatedDate(data),
    createdDateFormatted: noun.formatCreatedDate(data),
    url: noun.getNounNounsWtfUrl(data),
  };
}

/**
 * Get noun data ready for detailed view
 */
export interface NounDetailDisplay extends NounCardDisplay {
  ownerNounCount: string;
  ownerDelegate: string | null;
  ownerDelegateShort: string | null;
  hasAuction: boolean;
  auction?: AuctionDetailDisplay;
}

export function nounForDetail(data: Noun): NounDetailDisplay {
  const cardData = nounForCard(data);
  
  return {
    ...cardData,
    ownerNounCount: data.owner.tokenBalance,
    ownerDelegate: data.owner.delegate?.id || null,
    ownerDelegateShort: data.owner.delegate ? formatAddr(data.owner.delegate.id) : null,
    hasAuction: Boolean(data.auction),
    auction: data.auction ? auctionForDetail(data.auction) : undefined,
  };
}

// ============================================================================
// DELEGATE DISPLAYS
// ============================================================================

/**
 * Get delegate data ready for leaderboard display
 */
export interface DelegateLeaderboardDisplay {
  address: string;
  addressShort: string;
  votingPower: string;
  votingPowerRaw: bigint;
  tokenHoldersRepresented: number;
  proposalCount: number;
  voteCount: number;
}

export function delegateForLeaderboard(data: Delegate): DelegateLeaderboardDisplay {
  return {
    address: data.id,
    addressShort: formatAddr(data.id),
    votingPower: delegate.formatDelegatedVotes(data),
    votingPowerRaw: delegate.getDelegatedVotesRaw(data),
    tokenHoldersRepresented: delegate.getTokenHoldersCount(data),
    proposalCount: data.proposals?.length || 0,
    voteCount: data.votes?.length || 0,
  };
}

/**
 * Get delegate data ready for detailed view
 */
export interface DelegateDetailDisplay extends DelegateLeaderboardDisplay {
  nounsRepresented: string[];
  recentVotes: VoteDisplayRow[];
  recentProposals: ProposalCardDisplay[];
}

export function delegateForDetail(data: Delegate): DelegateDetailDisplay {
  const leaderboardData = delegateForLeaderboard(data);
  
  return {
    ...leaderboardData,
    nounsRepresented: data.nounsRepresented?.map(n => n.id) || [],
    recentVotes: [], // Would need to map from data.votes if available
    recentProposals: [], // Would need to map from data.proposals if available
  };
}

// ============================================================================
// ACCOUNT DISPLAYS
// ============================================================================

/**
 * Get account data ready for profile display
 */
export interface AccountProfileDisplay {
  address: string;
  addressShort: string;
  nounCount: string;
  nounCountNumber: number;
  votingPower: string;
  votingPowerRaw: bigint;
  delegate: string | null;
  delegateShort: string | null;
  isDelegatedToSelf: boolean;
  hasNouns: boolean;
  hasVotingPower: boolean;
}

export function accountForProfile(data: Account): AccountProfileDisplay {
  const nounCountNumber = account.getTokenBalance(data);
  const votingPowerRaw = account.getTokenBalanceRaw(data);
  const delegateAddress = data.delegate?.id || null;
  
  return {
    address: data.id,
    addressShort: formatAddr(data.id),
    nounCount: nounCountNumber.toString(),
    nounCountNumber,
    votingPower: votingPowerRaw.toString(),
    votingPowerRaw,
    delegate: delegateAddress,
    delegateShort: delegateAddress ? formatAddr(delegateAddress) : null,
    isDelegatedToSelf: account.isSelfDelegated(data),
    hasNouns: account.ownsNouns(data),
    hasVotingPower: account.ownsNouns(data), // In Nouns, voting power = token balance
  };
}

/**
 * Get account data ready for detailed view
 */
export interface AccountDetailDisplay extends AccountProfileDisplay {
  ownedNouns: NounCardDisplay[];
  recentVotes: number;
  recentProposals: number;
}

export function accountForDetail(data: Account): AccountDetailDisplay {
  const profileData = accountForProfile(data);
  
  return {
    ...profileData,
    ownedNouns: data.nouns?.map(nounForCard) || [],
    recentVotes: data.votes?.length || 0,
    recentProposals: data.proposals?.length || 0,
  };
}

// ============================================================================
// STATISTICS DISPLAYS
// ============================================================================

/**
 * Get auction statistics ready for dashboard
 */
export interface AuctionStatsDisplay {
  totalVolume: string;
  totalVolumeRaw: bigint;
  averagePrice: string;
  averagePriceRaw: bigint;
  highestPrice: string;
  highestPriceRaw: bigint;
  lowestPrice: string;
  lowestPriceRaw: bigint;
  totalAuctions: number;
}

export function auctionStats(auctions: Auction[]): AuctionStatsDisplay {
  const totalVolumeRaw = BigInt(auction.getTotalVolume(auctions));
  const averagePriceRaw = BigInt(auction.getAverageAuctionPrice(auctions));
  const highestPriceRaw = BigInt(auction.getHighestAuctionPrice(auctions));
  const lowestPriceRaw = BigInt(auction.getLowestAuctionPrice(auctions));
  
  return {
    totalVolume: formatEth(totalVolumeRaw),
    totalVolumeRaw,
    averagePrice: formatEth(averagePriceRaw),
    averagePriceRaw,
    highestPrice: formatEth(highestPriceRaw),
    highestPriceRaw,
    lowestPrice: formatEth(lowestPriceRaw),
    lowestPriceRaw,
    totalAuctions: auctions.length,
  };
}

/**
 * Get proposal statistics ready for dashboard
 */
export interface ProposalStatsDisplay {
  total: number;
  active: number;
  executed: number;
  defeated: number;
  queued: number;
  cancelled: number;
  vetoed: number;
  passRate: number;
}

export function proposalStats(proposals: Proposal[]): ProposalStatsDisplay {
  const active = proposal.getActiveProposals(proposals).length;
  const executed = proposal.getExecutedProposals(proposals).length;
  const defeated = proposal.getDefeatedProposals(proposals).length;
  const queued = proposals.filter(p => proposal.isQueued(p)).length;
  const cancelled = proposals.filter(p => proposal.isCancelled(p)).length;
  const vetoed = proposals.filter(p => proposal.isVetoed(p)).length;
  
  const finalized = executed + defeated + cancelled + vetoed;
  const passRate = finalized > 0 ? (executed / finalized) * 100 : 0;
  
  return {
    total: proposals.length,
    active,
    executed,
    defeated,
    queued,
    cancelled,
    vetoed,
    passRate,
  };
}

