/**
 * Nouns DAO Subgraph - GraphQL Queries
 * 
 * Complete set of GraphQL queries for the Nouns DAO subgraph
 */

import { gql } from '@apollo/client';

// ============================================================================
// Fragments
// ============================================================================

export const NOUN_SEED_FRAGMENT = gql`
  fragment NounSeedFields on Seed {
    id
    background
    body
    accessory
    head
    glasses
  }
`;

export const ACCOUNT_FRAGMENT = gql`
  fragment AccountFields on Account {
    id
    tokenBalance
    tokenBalanceRaw
  }
`;

export const DELEGATE_FRAGMENT = gql`
  fragment DelegateFields on Delegate {
    id
    delegatedVotesRaw
    delegatedVotes
    tokenHoldersRepresentedAmount
  }
`;

export const NOUN_FRAGMENT = gql`
  ${NOUN_SEED_FRAGMENT}
  ${ACCOUNT_FRAGMENT}
  fragment NounFields on Noun {
    id
    seed {
      ...NounSeedFields
    }
    owner {
      ...AccountFields
    }
  }
`;

export const BID_FRAGMENT = gql`
  ${ACCOUNT_FRAGMENT}
  fragment BidFields on Bid {
    id
    amount
    blockNumber
    blockTimestamp
    txIndex
    txHash
    clientId
    bidder {
      ...AccountFields
    }
  }
`;

export const AUCTION_FRAGMENT = gql`
  ${NOUN_FRAGMENT}
  ${BID_FRAGMENT}
  fragment AuctionFields on Auction {
    id
    amount
    startTime
    endTime
    settled
    noun {
      ...NounFields
    }
    bidder {
      ...BidFields
    }
  }
`;

export const VOTE_FRAGMENT = gql`
  ${DELEGATE_FRAGMENT}
  ${NOUN_FRAGMENT}
  fragment VoteFields on Vote {
    id
    support
    supportDetailed
    votes
    votesRaw
    reason
    voter {
      ...DelegateFields
    }
    nouns {
      ...NounFields
    }
    blockNumber
    blockTimestamp
    transactionHash
    clientId
  }
`;

export const PROPOSAL_VERSION_FRAGMENT = gql`
  fragment ProposalVersionFields on ProposalVersion {
    id
    createdBlock
    createdAt
    createdTransactionHash
    targets
    values
    signatures
    calldatas
    title
    description
    updateMessage
  }
`;

export const PROPOSAL_FRAGMENT = gql`
  ${ACCOUNT_FRAGMENT}
  ${DELEGATE_FRAGMENT}
  fragment ProposalFields on Proposal {
    id
    title
    description
    status
    proposalThreshold
    quorumVotes
    forVotes
    againstVotes
    abstainVotes
    totalSupply
    proposer {
      ...DelegateFields
    }
    createdBlock
    createdTimestamp
    createdTransactionHash
    startBlock
    endBlock
    updatePeriodEndBlock
    objectionPeriodEndBlock
    executionETA
    canceledBlock
    canceledTimestamp
    queuedBlock
    queuedTimestamp
    executedBlock
    executedTimestamp
    targets
    values
    signatures
    calldatas
  }
`;

// ============================================================================
// Noun Queries
// ============================================================================

export const GET_NOUN = gql`
  ${NOUN_FRAGMENT}
  query GetNoun($id: ID!) {
    noun(id: $id) {
      ...NounFields
    }
  }
`;

export const GET_NOUNS = gql`
  ${NOUN_FRAGMENT}
  query GetNouns(
    $first: Int = 10
    $skip: Int = 0
    $orderBy: Noun_orderBy = createdAtTimestamp
    $orderDirection: OrderDirection = desc
    $where: Noun_filter
  ) {
    nouns(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      ...NounFields
    }
  }
`;

export const GET_NOUNS_BY_OWNER = gql`
  ${NOUN_FRAGMENT}
  query GetNounsByOwner($owner: String!, $first: Int = 10, $skip: Int = 0) {
    nouns(
      where: { owner: $owner }
      first: $first
      skip: $skip
      orderBy: id
      orderDirection: desc
    ) {
      ...NounFields
    }
  }
`;

// ============================================================================
// Auction Queries
// ============================================================================

export const GET_AUCTION = gql`
  ${AUCTION_FRAGMENT}
  query GetAuction($id: ID!) {
    auction(id: $id) {
      ...AuctionFields
      bids(orderBy: amount, orderDirection: desc) {
        ...BidFields
      }
    }
  }
`;

export const GET_AUCTIONS = gql`
  ${AUCTION_FRAGMENT}
  query GetAuctions(
    $first: Int = 10
    $skip: Int = 0
    $orderBy: Auction_orderBy = startTime
    $orderDirection: OrderDirection = desc
    $where: Auction_filter
  ) {
    auctions(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      ...AuctionFields
    }
  }
`;

export const GET_CURRENT_AUCTION = gql`
  ${AUCTION_FRAGMENT}
  query GetCurrentAuction {
    auctions(
      where: { settled: false }
      orderBy: startTime
      orderDirection: desc
      first: 1
    ) {
      ...AuctionFields
      bids(orderBy: blockTimestamp, orderDirection: desc, first: 10) {
        ...BidFields
      }
    }
  }
`;

export const GET_AUCTION_BIDS = gql`
  ${BID_FRAGMENT}
  query GetAuctionBids(
    $auctionId: String!
    $first: Int = 100
    $skip: Int = 0
  ) {
    bids(
      where: { auction: $auctionId }
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      ...BidFields
    }
  }
`;

// ============================================================================
// Proposal Queries
// ============================================================================

export const GET_PROPOSAL = gql`
  ${PROPOSAL_FRAGMENT}
  ${VOTE_FRAGMENT}
  query GetProposal($id: ID!) {
    proposal(id: $id) {
      ...ProposalFields
      votes(orderBy: blockTimestamp, orderDirection: desc) {
        ...VoteFields
      }
    }
  }
`;

export const GET_PROPOSALS = gql`
  ${PROPOSAL_FRAGMENT}
  query GetProposals(
    $first: Int = 10
    $skip: Int = 0
    $orderBy: Proposal_orderBy = createdTimestamp
    $orderDirection: OrderDirection = desc
    $where: Proposal_filter
  ) {
    proposals(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      ...ProposalFields
    }
  }
`;

export const GET_ACTIVE_PROPOSALS = gql`
  ${PROPOSAL_FRAGMENT}
  query GetActiveProposals($first: Int = 10) {
    proposals(
      where: { status: ACTIVE }
      first: $first
      orderBy: createdTimestamp
      orderDirection: desc
    ) {
      ...ProposalFields
    }
  }
`;

export const GET_PROPOSALS_BY_PROPOSER = gql`
  ${PROPOSAL_FRAGMENT}
  query GetProposalsByProposer(
    $proposer: String!
    $first: Int = 10
    $skip: Int = 0
  ) {
    proposals(
      where: { proposer: $proposer }
      first: $first
      skip: $skip
      orderBy: createdTimestamp
      orderDirection: desc
    ) {
      ...ProposalFields
    }
  }
`;

// ============================================================================
// Vote Queries
// ============================================================================

export const GET_VOTE = gql`
  ${VOTE_FRAGMENT}
  query GetVote($id: ID!) {
    vote(id: $id) {
      ...VoteFields
      proposal {
        id
        title
        status
      }
    }
  }
`;

export const GET_VOTES = gql`
  ${VOTE_FRAGMENT}
  query GetVotes(
    $first: Int = 10
    $skip: Int = 0
    $orderBy: Vote_orderBy = blockTimestamp
    $orderDirection: OrderDirection = desc
    $where: Vote_filter
  ) {
    votes(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      ...VoteFields
      proposal {
        id
        title
        status
      }
    }
  }
`;

export const GET_VOTES_BY_VOTER = gql`
  ${VOTE_FRAGMENT}
  query GetVotesByVoter($voter: String!, $first: Int = 10, $skip: Int = 0) {
    votes(
      where: { voter: $voter }
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      ...VoteFields
      proposal {
        id
        title
        status
      }
    }
  }
`;

export const GET_VOTES_BY_PROPOSAL = gql`
  ${VOTE_FRAGMENT}
  query GetVotesByProposal(
    $proposalId: String!
    $first: Int = 100
    $skip: Int = 0
  ) {
    votes(
      where: { proposal: $proposalId }
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      ...VoteFields
    }
  }
`;

// ============================================================================
// Delegate Queries
// ============================================================================

export const GET_DELEGATE = gql`
  ${DELEGATE_FRAGMENT}
  query GetDelegate($id: ID!) {
    delegate(id: $id) {
      ...DelegateFields
      nounsRepresented {
        id
      }
      tokenHoldersRepresented {
        id
      }
      votes(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
        ...VoteFields
      }
      proposals(first: 10, orderBy: createdTimestamp, orderDirection: desc) {
        ...ProposalFields
      }
    }
  }
`;

export const GET_DELEGATES = gql`
  ${DELEGATE_FRAGMENT}
  ${NOUN_SEED_FRAGMENT}
  query GetDelegates(
    $first: Int = 10
    $skip: Int = 0
    $orderBy: Delegate_orderBy = delegatedVotesRaw
    $orderDirection: OrderDirection = desc
  ) {
    delegates(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      ...DelegateFields
      nounsRepresented(first: 1000, orderBy: id, orderDirection: desc) {
        id
        seed {
          ...NounSeedFields
        }
      }
      tokenHoldersRepresented(first: 1000) {
        id
        tokenBalance
        tokenBalanceRaw
      }
    }
  }
`;

export const GET_TOP_DELEGATES = gql`
  ${DELEGATE_FRAGMENT}
  ${NOUN_SEED_FRAGMENT}
  query GetTopDelegates($first: Int = 20) {
    delegates(
      first: $first
      orderBy: delegatedVotesRaw
      orderDirection: desc
      where: { delegatedVotesRaw_gt: "0" }
    ) {
      ...DelegateFields
      nounsRepresented(first: 1000, orderBy: id, orderDirection: desc) {
        id
        seed {
          ...NounSeedFields
        }
      }
      tokenHoldersRepresented(first: 1000) {
        id
        tokenBalance
        tokenBalanceRaw
      }
    }
  }
`;

// ============================================================================
// Account Queries
// ============================================================================

export const GET_ACCOUNT = gql`
  ${ACCOUNT_FRAGMENT}
  ${DELEGATE_FRAGMENT}
  query GetAccount($id: ID!) {
    account(id: $id) {
      ...AccountFields
      delegate {
        ...DelegateFields
      }
      nouns(orderBy: createdAtTimestamp, orderDirection: desc) {
        ...NounFields
      }
      votes(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
        ...VoteFields
      }
      proposals(first: 10, orderBy: createdTimestamp, orderDirection: desc) {
        ...ProposalFields
      }
    }
  }
`;

export const GET_ACCOUNTS = gql`
  ${ACCOUNT_FRAGMENT}
  query GetAccounts(
    $first: Int = 10
    $skip: Int = 0
    $orderBy: Account_orderBy = tokenBalanceRaw
    $orderDirection: OrderDirection = desc
  ) {
    accounts(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      ...AccountFields
      nouns {
        id
      }
    }
  }
`;

// ============================================================================
// Governance Queries
// ============================================================================

export const GET_GOVERNANCE = gql`
  query GetGovernance($id: ID! = "GOVERNANCE") {
    governance(id: $id) {
      id
      delegatedVotesRaw
      delegatedVotes
      currentTokenHolders
      currentDelegates
      totalTokenHolders
      totalDelegates
      proposalThreshold
      quorumVotesBPS
      dynamicQuorumStartBlock
    }
  }
`;

export const GET_DYNAMIC_QUORUM_PARAMS = gql`
  query GetDynamicQuorumParams($first: Int = 1) {
    dynamicQuorumParams(
      first: $first
      orderBy: createdBlock
      orderDirection: desc
    ) {
      id
      minQuorumVotesBPS
      maxQuorumVotesBPS
      quorumCoefficient
      createdBlock
      createdTimestamp
    }
  }
`;

// ============================================================================
// Governance V3 Queries (Proposal Candidates & Feedback)
// ============================================================================

export const GET_PROPOSAL_CANDIDATE = gql`
  query GetProposalCandidate($id: ID!) {
    proposalCandidate(id: $id) {
      id
      proposer {
        id
      }
      slug
      targets
      values
      signatures
      calldatas
      description
      encodedProposalHash
      requiredSignatures
      createdBlock
      createdTimestamp
      createdTransactionHash
      canceledBlock
      canceledTimestamp
      signatures {
        id
        signer {
          id
        }
        sig
        expirationTimestamp
        reason
        createdBlock
        createdTimestamp
      }
      latestVersion {
        id
        description
        updateMessage
        createdTimestamp
      }
    }
  }
`;

export const GET_PROPOSAL_CANDIDATES = gql`
  ${PROPOSAL_VERSION_FRAGMENT}
  query GetProposalCandidates(
    $first: Int = 10
    $skip: Int = 0
    $where: ProposalCandidate_filter
  ) {
    proposalCandidates(
      first: $first
      skip: $skip
      orderBy: createdTimestamp
      orderDirection: desc
      where: $where
    ) {
      id
      proposer
      slug
      createdTimestamp
      createdBlock
      createdTransactionHash
      lastUpdatedTimestamp
      lastUpdatedBlock
      canceled
      canceledTimestamp
      canceledBlock
      number
      latestVersion {
        ...ProposalVersionFields
      }
      versions {
        ...ProposalVersionFields
      }
    }
  }
`;

export const GET_PROPOSAL_FEEDBACK = gql`
  query GetProposalFeedback(
    $proposalId: String!
    $first: Int = 100
    $skip: Int = 0
  ) {
    proposalFeedbacks(
      where: { proposal: $proposalId }
      first: $first
      skip: $skip
      orderBy: createdTimestamp
      orderDirection: desc
    ) {
      id
      voter {
        id
      }
      supportDetailed
      reason
      createdBlock
      createdTimestamp
    }
  }
`;

export const GET_PROPOSAL_VERSIONS = gql`
  ${PROPOSAL_VERSION_FRAGMENT}
  query GetProposalVersions(
    $proposalId: String!
    $first: Int = 100
    $skip: Int = 0
  ) {
    proposalVersions(
      where: { proposal: $proposalId }
      first: $first
      skip: $skip
      orderBy: createdBlock
      orderDirection: asc
    ) {
      ...ProposalVersionFields
    }
  }
`;

// ============================================================================
// Events & Activity Queries
// ============================================================================

export const GET_RECENT_ACTIVITY = gql`
  ${BID_FRAGMENT}
  ${VOTE_FRAGMENT}
  ${PROPOSAL_FRAGMENT}
  query GetRecentActivity($first: Int = 20) {
    bids(first: $first, orderBy: blockTimestamp, orderDirection: desc) {
      ...BidFields
      noun {
        id
      }
    }
    votes(first: $first, orderBy: blockTimestamp, orderDirection: desc) {
      ...VoteFields
    }
    proposals(first: $first, orderBy: createdTimestamp, orderDirection: desc) {
      ...ProposalFields
    }
  }
`;

export const GET_DELEGATION_EVENTS = gql`
  query GetDelegationEvents($first: Int = 100, $skip: Int = 0) {
    delegationEvents(
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      delegator {
        id
      }
      fromDelegate {
        id
      }
      toDelegate {
        id
      }
      blockNumber
      blockTimestamp
    }
  }
`;

export const GET_TRANSFER_EVENTS = gql`
  query GetTransferEvents($first: Int = 100, $skip: Int = 0) {
    transferEvents(
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      noun {
        id
      }
      from {
        id
      }
      to {
        id
      }
      blockNumber
      blockTimestamp
    }
  }
`;

// ============================================================================
// Statistics & Aggregation Queries
// ============================================================================

export const GET_DAO_STATS = gql`
  query GetDAOStats {
    governance(id: "GOVERNANCE") {
      currentTokenHolders
      currentDelegates
      totalTokenHolders
      totalDelegates
      proposalThreshold
      quorumVotesBPS
    }
    proposals(first: 1000) {
      id
      status
    }
    auctions(first: 1, orderBy: startTime, orderDirection: desc) {
      id
    }
  }
`;

// ============================================================================
// Activity Feed Queries (All Votes & Signals)
// ============================================================================

export const GET_RECENT_PROPOSALS = gql`
  ${PROPOSAL_FRAGMENT}
  query GetRecentProposals(
    $first: Int = 100
    $skip: Int = 0
  ) {
    proposals(
      first: $first
      skip: $skip
      orderBy: createdTimestamp
      orderDirection: desc
    ) {
      ...ProposalFields
    }
  }
`;

export const GET_RECENT_PROPOSAL_VERSIONS = gql`
  ${PROPOSAL_VERSION_FRAGMENT}
  query GetRecentProposalVersions(
    $first: Int = 100
    $skip: Int = 0
  ) {
    proposalVersions(
      first: $first
      skip: $skip
      orderBy: createdAt
      orderDirection: desc
    ) {
      ...ProposalVersionFields
      proposal {
        id
        title
        status
        proposer {
          id
        }
      }
    }
  }
`;

export const GET_CANDIDATE_FEEDBACKS = gql`
  query GetCandidateFeedbacks(
    $first: Int = 100
    $skip: Int = 0
  ) {
    candidateFeedbacks(
      first: $first
      skip: $skip
      orderBy: createdTimestamp
      orderDirection: desc
    ) {
      id
      voter {
        id
      }
      supportDetailed
      reason
      votes
      createdBlock
      createdTimestamp
      candidate {
        id
        slug
      }
    }
  }
`;

export const GET_CANDIDATE_SIGNATURES = gql`
  query GetCandidateSignatures(
    $first: Int = 100
    $skip: Int = 0
  ) {
    proposalCandidateSignatures(
      first: $first
      skip: $skip
      orderBy: createdTimestamp
      orderDirection: desc
    ) {
      id
      signer {
        id
      }
      reason
      expirationTimestamp
      createdBlock
      createdTimestamp
      content {
        id
        title
        proposer
      }
    }
  }
`;

export const GET_ALL_VOTES = gql`
  ${VOTE_FRAGMENT}
  query GetAllVotes(
    $first: Int = 100
    $skip: Int = 0
  ) {
    votes(
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      ...VoteFields
      proposal {
        id
        title
        status
      }
    }
  }
`;

export const GET_ALL_PROPOSAL_FEEDBACKS = gql`
  query GetAllProposalFeedbacks(
    $first: Int = 100
    $skip: Int = 0
  ) {
    proposalFeedbacks(
      first: $first
      skip: $skip
      orderBy: createdTimestamp
      orderDirection: desc
    ) {
      id
      voter {
        id
      }
      supportDetailed
      reason
      createdBlock
      createdTimestamp
      proposal {
        id
        title
        status
      }
    }
  }
`;

// ============================================================================
// Voter Detail Queries
// ============================================================================

export const GET_DELEGATE_DETAILS = gql`
  ${NOUN_SEED_FRAGMENT}
  ${VOTE_FRAGMENT}
  ${PROPOSAL_FRAGMENT}
  query GetDelegateDetails(
    $id: ID!
    $votesSkip: Int = 0
    $proposalsSkip: Int = 0
    $nounsSkip: Int = 0
  ) {
    delegate(id: $id) {
      id
      delegatedVotes
      delegatedVotesRaw
      tokenHoldersRepresentedAmount
      tokenHoldersRepresented(first: 1000) {
        id
        tokenBalance
        tokenBalanceRaw
      }
      nounsRepresented(
        first: 1000
        skip: $nounsSkip
        orderBy: id
        orderDirection: desc
      ) {
        id
        seed {
          ...NounSeedFields
        }
      }
      votes(
        first: 1000
        skip: $votesSkip
        orderBy: blockNumber
        orderDirection: desc
      ) {
        ...VoteFields
        proposal {
          id
          title
          status
          createdBlock
          createdTimestamp
        }
      }
      proposals(
        first: 100
        skip: $proposalsSkip
        orderBy: createdBlock
        orderDirection: desc
      ) {
        ...ProposalFields
      }
    }
    account(id: $id) {
      id
      tokenBalance
      tokenBalanceRaw
      totalTokensHeld
      totalTokensHeldRaw
      delegate {
        id
        delegatedVotes
      }
      nouns(first: 1000, orderBy: id, orderDirection: desc) {
        id
        seed {
          ...NounSeedFields
        }
      }
    }
  }
`;

