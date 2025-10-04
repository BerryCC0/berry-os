/**
 * GraphQL Queries
 * Pre-defined queries for Nouns subgraph
 */

import { gql } from '@apollo/client';

/**
 * Get Nouns owned by an address
 */
export const GET_NOUNS_BY_OWNER = gql`
  query GetNounsByOwner($owner: String!) {
    nouns(
      where: { owner: $owner }
      first: 100
      orderBy: id
      orderDirection: desc
    ) {
      id
      owner {
        id
      }
      seed {
        background
        body
        accessory
        head
        glasses
      }
    }
  }
`;

/**
 * Get recent Nouns proposals
 */
export const GET_PROPOSALS = gql`
  query GetProposals($first: Int = 20) {
    proposals(
      first: $first
      orderBy: createdBlock
      orderDirection: desc
    ) {
      id
      proposer {
        id
      }
      status
      createdBlock
      createdTimestamp
      title
      description
      forVotes
      againstVotes
      abstainVotes
      quorumVotes
      executionETA
    }
  }
`;

/**
 * Get a specific Noun by ID
 */
export const GET_NOUN_BY_ID = gql`
  query GetNounById($id: String!) {
    noun(id: $id) {
      id
      owner {
        id
      }
      seed {
        background
        body
        accessory
        head
        glasses
      }
    }
  }
`;

/**
 * Get recent Noun sales/transfers
 */
export const GET_NOUN_TRANSFERS = gql`
  query GetNounTransfers($nounId: String!) {
    transfers(
      where: { noun: $nounId }
      orderBy: blockTimestamp
      orderDirection: desc
      first: 20
    ) {
      id
      from
      to
      blockNumber
      blockTimestamp
      txHash
    }
  }
`;

/**
 * Get votes for a proposal
 */
export const GET_PROPOSAL_VOTES = gql`
  query GetProposalVotes($proposalId: String!) {
    votes(
      where: { proposal: $proposalId }
      orderBy: blockNumber
      orderDirection: desc
      first: 100
    ) {
      id
      voter {
        id
      }
      support
      votes
      reason
      blockNumber
    }
  }
`;

/**
 * Get account activity (delegate actions, votes, etc.)
 */
export const GET_ACCOUNT = gql`
  query GetAccount($address: String!) {
    account(id: $address) {
      id
      tokenBalance
      tokenBalanceRaw
      totalTokensHeldRaw
      nouns {
        id
      }
    }
  }
`;

/**
 * Search Nouns by traits
 */
export const SEARCH_NOUNS_BY_TRAITS = gql`
  query SearchNounsByTraits(
    $background: Int
    $body: Int
    $accessory: Int
    $head: Int
    $glasses: Int
  ) {
    nouns(
      where: {
        seed_: {
          background: $background
          body: $body
          accessory: $accessory
          head: $head
          glasses: $glasses
        }
      }
      first: 100
    ) {
      id
      owner {
        id
      }
      seed {
        background
        body
        accessory
        head
        glasses
      }
    }
  }
`;

