/**
 * Contract Function Mappings
 * Maps user-friendly function names to actual contract helper functions
 */

import { Address } from 'viem';
import {
  TreasuryHelpers,
  GovernanceHelpers,
  AdminHelpers,
  TokenHelpers,
  AuctionHelpers,
  DataProxyHelpers,
  TokenBuyerHelpers,
  PayerHelpers,
  StreamingHelpers,
  RewardsHelpers,
  DescriptorHelpers,
  SeederHelpers,
  ForkHelpers
} from '@/app/lib/Nouns/Contracts/utils';

// ============================================================================
// TREASURY FUNCTIONS
// ============================================================================

export const TreasuryFunctions = {
  // Read
  'Check if transaction queued': (params: { txHash: string }) => 
    TreasuryHelpers.getQueuedTransaction(params.txHash as `0x${string}`),
  
  'Get timelock delay': () =>
    TreasuryHelpers.getDelay(),
  
  'Get grace period': () =>
    TreasuryHelpers.getGracePeriod(),
  
  'Check admin': () =>
    TreasuryHelpers.getAdmin(),
  
  'Get pending admin': () =>
    TreasuryHelpers.getPendingAdmin(),

  // Write
  'Queue transaction': (params: { 
    target: string; 
    value: string; 
    signature: string; 
    data: string; 
    eta: string 
  }) =>
    TreasuryHelpers.prepareQueueTransaction(
      params.target as Address,
      BigInt(params.value),
      params.signature,
      params.data as `0x${string}`,
      BigInt(params.eta)
    ),

  'Send ETH': (params: { recipient: string; amount: string }) =>
    TreasuryHelpers.prepareSendETH(
      params.recipient as Address,
      BigInt(params.amount)
    ),

  'Send ERC20': (params: { token: string; recipient: string; amount: string }) =>
    TreasuryHelpers.prepareSendERC20(
      params.token as Address,
      params.recipient as Address,
      BigInt(params.amount)
    ),
};

// ============================================================================
// GOVERNANCE FUNCTIONS
// ============================================================================

export const GovernanceFunctions = {
  // Read
  'Get proposal state': (params: { proposalId: string }) =>
    GovernanceHelpers.getProposalState(BigInt(params.proposalId)),
  
  'Get proposal details': (params: { proposalId: string }) =>
    GovernanceHelpers.getProposalDetails(BigInt(params.proposalId)),
  
  'Get voting power': (params: { account: string }) =>
    GovernanceHelpers.getVotingPower(params.account as Address),
  
  'Get quorum votes': (params: { proposalId: string }) =>
    GovernanceHelpers.getQuorumVotes(BigInt(params.proposalId)),
  
  'Has voted': (params: { proposalId: string; voter: string }) =>
    GovernanceHelpers.hasVoted(BigInt(params.proposalId), params.voter as Address),
  
  'Get proposal threshold': () =>
    GovernanceHelpers.getProposalThreshold(),
  
  'Get fork threshold': () =>
    GovernanceHelpers.getForkThreshold(),

  // Write
  'Cast vote with Berry OS': (params: { proposalId: string; support: string }) =>
    GovernanceHelpers.prepareVoteTransaction(
      BigInt(params.proposalId),
      Number(params.support) as 0 | 1 | 2,
      '' // Empty reason, but uses Berry OS Client ID 11
    ),
  
  'Cast vote with reason (Berry OS)': (params: { proposalId: string; support: string; reason: string }) =>
    GovernanceHelpers.prepareVoteTransaction(
      BigInt(params.proposalId),
      Number(params.support) as 0 | 1 | 2,
      params.reason // Uses Berry OS Client ID 11
    ),
  
  'Queue proposal': (params: { proposalId: string }) =>
    GovernanceHelpers.prepareQueueProposal(BigInt(params.proposalId)),
  
  'Execute proposal': (params: { proposalId: string }) =>
    GovernanceHelpers.prepareExecuteProposal(BigInt(params.proposalId)),
};

// ============================================================================
// ADMIN FUNCTIONS
// ============================================================================

export const AdminFunctions = {
  // Read
  'Get max fork period': () => AdminHelpers.getMaxForkPeriod(),
  'Get min fork period': () => AdminHelpers.getMinForkPeriod(),
  'Get max voting delay': () => AdminHelpers.getMaxVotingDelayBlocks(),
  'Get min voting delay': () => AdminHelpers.getMinVotingDelayBlocks(),
  'Get max voting period': () => AdminHelpers.getMaxVotingPeriodBlocks(),
  'Get min voting period': () => AdminHelpers.getMinVotingPeriodBlocks(),

  // Write
  'Set voting delay': (params: { newVotingDelay: string }) =>
    AdminHelpers.prepareSetVotingDelay(BigInt(params.newVotingDelay)),
  
  'Set voting period': (params: { newVotingPeriod: string }) =>
    AdminHelpers.prepareSetVotingPeriod(BigInt(params.newVotingPeriod)),
  
  'Set proposal threshold BPS': (params: { newProposalThresholdBPS: string }) =>
    AdminHelpers.prepareSetProposalThresholdBPS(BigInt(params.newProposalThresholdBPS)),
};

// ============================================================================
// TOKEN FUNCTIONS
// ============================================================================

export const TokenFunctions = {
  // Read
  'Get balance': (params: { owner: string }) =>
    TokenHelpers.getBalance(params.owner as Address),
  
  'Get voting power': (params: { account: string }) =>
    TokenHelpers.getVotingPower(params.account as Address),
  
  'Get delegate': (params: { account: string }) =>
    TokenHelpers.getDelegate(params.account as Address),
  
  'Get total supply': () =>
    TokenHelpers.getTotalSupply(),

  // Write
  'Delegate votes': (params: { delegatee: string }) =>
    TokenHelpers.prepareDelegateVotes(params.delegatee as Address),
  
  'Transfer token': (params: { to: string; tokenId: string }) =>
    TokenHelpers.prepareTransferToken(
      params.to as Address,
      BigInt(params.tokenId)
    ),
};

// ============================================================================
// AUCTION FUNCTIONS
// ============================================================================

export const AuctionFunctions = {
  // Read
  'Get current auction': () => AuctionHelpers.getCurrentAuction(),
  'Get reserve price': () => AuctionHelpers.getReservePrice(),
  'Get time buffer': () => AuctionHelpers.getTimeBuffer(),
  'Get min bid increment': () => AuctionHelpers.getMinBidIncrement(),
  'Is paused': () => AuctionHelpers.isPaused(),

  // Write
  'Create bid with Berry OS': (params: { nounId: string }) =>
    AuctionHelpers.prepareCreateBid(BigInt(params.nounId)), // Uses Berry OS Client ID 11
  
  'Settle auction': () => AuctionHelpers.prepareSettleAuction(),
};

// ============================================================================
// DATA PROXY FUNCTIONS
// ============================================================================

export const DataProxyFunctions = {
  // Read
  'Get create candidate cost': () => DataProxyHelpers.getCreateCandidateCost(),
  'Get update candidate cost': () => DataProxyHelpers.getUpdateCandidateCost(),

  // Write
  'Create proposal candidate': (params: { description: string; slug: string }) =>
    DataProxyHelpers.prepareCreateProposalCandidate(
      params.description,
      params.slug
    ),
};

// ============================================================================
// TOKEN BUYER FUNCTIONS
// ============================================================================

export const TokenBuyerFunctions = {
  // Read
  'Calculate USDC output': (params: { ethAmount: string; ethUsdcPrice: string; slippage?: string }) =>
    TokenBuyerHelpers.calculateUSDCOutput(
      BigInt(params.ethAmount),
      Number(params.ethUsdcPrice),
      params.slippage ? Number(params.slippage) : 100
    ),
  
  'Calculate ETH input': (params: { usdcAmount: string; ethUsdcPrice: string; slippage?: string }) =>
    TokenBuyerHelpers.calculateETHInput(
      BigInt(params.usdcAmount),
      Number(params.ethUsdcPrice),
      params.slippage ? Number(params.slippage) : 100
    ),
  
  'Calculate price impact': (params: { inputAmount: string; outputAmount: string; marketPrice: string }) =>
    TokenBuyerHelpers.calculatePriceImpact(
      BigInt(params.inputAmount),
      BigInt(params.outputAmount),
      Number(params.marketPrice)
    ),

  // Write
  'Buy tokens (ETH → USDC)': (params: { ethAmount: string; minUSDCOut: string }) =>
    TokenBuyerHelpers.prepareBuyTokens(BigInt(params.ethAmount), BigInt(params.minUSDCOut)),
};

// ============================================================================
// PAYER FUNCTIONS
// ============================================================================

export const PayerFunctions = {
  // Read
  'Is authorized payer': (params: { address: string }) =>
    ({ address: params.address as Address }),
  
  'Format payment amount': (params: { amount: string }) =>
    PayerHelpers.formatPaymentAmount(BigInt(params.amount)),
  
  'Calculate total with fees': (params: { baseAmount: string; feePercentage: string }) =>
    PayerHelpers.calculateTotalWithFees(BigInt(params.baseAmount), Number(params.feePercentage)),
  
  'Validate payment': (params: { amount: string }) =>
    PayerHelpers.validatePaymentAmount(BigInt(params.amount)),

  // Write
  'Pay (send USDC)': (params: { recipient: string; amount: string; reason?: string }) =>
    PayerHelpers.preparePay(
      params.recipient as Address,
      BigInt(params.amount),
      params.reason || ''
    ),
  
  'Send or register debt': (params: { recipient: string; amount: string; reason?: string }) =>
    PayerHelpers.prepareSendOrRegisterDebt(
      params.recipient as Address,
      BigInt(params.amount),
      params.reason || ''
    ),
};

// ============================================================================
// DESCRIPTOR FUNCTIONS
// ============================================================================

export const DescriptorFunctions = {
  // Read
  'Get background count': () => ({ 
    functionName: 'backgroundCount' 
  }),
  
  'Get body count': () => ({ 
    functionName: 'bodyCount' 
  }),
  
  'Get accessory count': () => ({ 
    functionName: 'accessoryCount' 
  }),
  
  'Get head count': () => ({ 
    functionName: 'headCount' 
  }),
  
  'Get glasses count': () => ({ 
    functionName: 'glassesCount' 
  }),
  
  'Parse trait data': (params: { traitData: string }) =>
    DescriptorHelpers.parseTraitData(params.traitData),
  
  'Calculate total traits': (params: { 
    backgrounds: string; 
    bodies: string; 
    accessories: string; 
    heads: string; 
    glasses: string;
  }) =>
    DescriptorHelpers.calculateTotalTraits({
      backgrounds: BigInt(params.backgrounds),
      bodies: BigInt(params.bodies),
      accessories: BigInt(params.accessories),
      heads: BigInt(params.heads),
      glasses: BigInt(params.glasses),
    }),

  // Write
  'Add backgrounds': (params: { backgrounds: string }) =>
    DescriptorHelpers.prepareAddManyBackgrounds(
      JSON.parse(params.backgrounds)
    ),
};

// ============================================================================
// SEEDER FUNCTIONS
// ============================================================================

export const SeederFunctions = {
  // Read
  'Generate seed (view function)': (params: { nounId: string }) => ({
    functionName: 'generateSeed',
    args: [BigInt(params.nounId)],
  }),
};

// ============================================================================
// STREAMING FUNCTIONS
// ============================================================================

export const StreamingFunctions = {
  // Read
  'Is stream active': (params: { streamId: string }) =>
    ({ streamId: params.streamId }),
  
  'Calculate stream progress': (params: { startTime: string; stopTime: string }) =>
    StreamingHelpers.calculateStreamProgress(BigInt(params.startTime), BigInt(params.stopTime)),
  
  'Calculate remaining amount': (params: { totalAmount: string; withdrawnAmount: string }) =>
    StreamingHelpers.calculateRemainingAmount(BigInt(params.totalAmount), BigInt(params.withdrawnAmount)),
  
  'Calculate available amount': (params: { totalAmount: string; startTime: string; stopTime: string; withdrawnAmount: string }) =>
    StreamingHelpers.calculateAvailableAmount(
      BigInt(params.totalAmount),
      BigInt(params.startTime),
      BigInt(params.stopTime),
      BigInt(params.withdrawnAmount)
    ),
  
  'Calculate stream rate': (params: { totalAmount: string; startTime: string; stopTime: string }) =>
    StreamingHelpers.calculateStreamRate(
      BigInt(params.totalAmount),
      BigInt(params.startTime),
      BigInt(params.stopTime)
    ),

  // Write
  'Create stream': (params: { payer: string; recipient: string; amount: string; token: string; startTime: string; stopTime: string; nonce: string }) =>
    StreamingHelpers.prepareCreateStream(
      params.payer as Address,
      params.recipient as Address,
      BigInt(params.amount),
      params.token as Address,
      BigInt(params.startTime),
      BigInt(params.stopTime),
      BigInt(params.nonce)
    ),
  
  'Withdraw from stream': (params: { streamId: string; amount: string }) =>
    StreamingHelpers.prepareWithdrawFromStream(
      BigInt(params.streamId),
      BigInt(params.amount)
    ),
  
  'Cancel stream': (params: { streamId: string }) =>
    StreamingHelpers.prepareCancelStream(BigInt(params.streamId)),
};

// ============================================================================
// REWARDS FUNCTIONS
// ============================================================================

export const RewardsFunctions = {
  // Read
  'Get client balance': (params: { clientId: string }) =>
    ({ clientId: BigInt(params.clientId) }),
  
  'Calculate total claimable': (params: { proposalRewards: string; auctionRewards: string }) =>
    RewardsHelpers.calculateTotalClaimable(
      BigInt(params.proposalRewards),
      BigInt(params.auctionRewards)
    ),
  
  'Is client registered': (params: { clientId: string }) =>
    ({ clientId: Number(params.clientId) }),
  
  'Calculate reward percentage': (params: { rewardAmount: string; totalAmount: string }) =>
    RewardsHelpers.calculateRewardPercentage(
      BigInt(params.rewardAmount),
      BigInt(params.totalAmount)
    ),

  // Write
  'Register client': (params: { name: string; description: string }) =>
    RewardsHelpers.prepareRegisterClient(params.name, params.description),
  
  'Update client description': (params: { clientId: string; description: string }) =>
    RewardsHelpers.prepareUpdateClientDescription(
      Number(params.clientId),
      params.description
    ),
  
  'Claim rewards': (params: { clientId: string }) =>
    RewardsHelpers.prepareClaimRewards(Number(params.clientId)),
};

// ============================================================================
// FORK FUNCTIONS
// ============================================================================

export const ForkFunctions = {
  // Read
  'Is fork active': (params: { forkEndTimestamp: string }) =>
    ForkHelpers.isForkActive(BigInt(params.forkEndTimestamp)),
  
  'Get fork time remaining': (params: { forkEndTimestamp: string }) =>
    ForkHelpers.getForkTimeRemaining(BigInt(params.forkEndTimestamp)),
  
  'Can execute fork': (params: { userTokens: string; forkThreshold: string }) =>
    ForkHelpers.canExecuteFork(BigInt(params.userTokens), BigInt(params.forkThreshold)),
  
  'Calculate fork progress': (params: { escrowedTokens: string; forkThreshold: string }) =>
    ForkHelpers.calculateForkProgress(BigInt(params.escrowedTokens), BigInt(params.forkThreshold)),
  
  'Validate token IDs': (params: { tokenIds: string }) =>
    ForkHelpers.validateTokenIds(JSON.parse(params.tokenIds).map((id: number) => BigInt(id))),

  // Write
  'Escrow to fork': (params: { tokenIds: string; proposalIds: string; reason: string }) =>
    ForkHelpers.prepareEscrowToFork(
      JSON.parse(params.tokenIds).map((id: number) => BigInt(id)),
      JSON.parse(params.proposalIds).map((id: number) => BigInt(id)),
      params.reason
    ),
  
  'Withdraw from fork escrow': (params: { tokenIds: string }) =>
    ForkHelpers.prepareWithdrawFromForkEscrow(
      JSON.parse(params.tokenIds).map((id: number) => BigInt(id))
    ),
};

// ============================================================================
// MAIN FUNCTION MAPPER
// ============================================================================

export function getContractFunction(
  contractName: string,
  functionName: string
): ((params: any) => any) | null {
  const mainName = contractName.split('[')[0].trim();

  switch (mainName) {
    case 'Treasury':
      return (TreasuryFunctions as any)[functionName];
    case 'DAO Governor':
      return (GovernanceFunctions as any)[functionName];
    case 'DAO Admin':
      return (AdminFunctions as any)[functionName];
    case 'Nouns Token':
      return (TokenFunctions as any)[functionName];
    case 'Auction House':
    case 'Auction House Proxy':
      return (AuctionFunctions as any)[functionName];
    case 'Data Proxy':
      return (DataProxyFunctions as any)[functionName];
    case 'Token Buyer':
      return (TokenBuyerFunctions as any)[functionName];
    case 'Payer':
      return (PayerFunctions as any)[functionName];
    case 'Descriptor':
      return (DescriptorFunctions as any)[functionName];
    case 'Seeder':
      return (SeederFunctions as any)[functionName];
    case 'Stream Factory':
      return (StreamingFunctions as any)[functionName];
    case 'Client Rewards':
    case 'Client Rewards Proxy':
      return (RewardsFunctions as any)[functionName];
    case 'Fork Escrow':
    case 'Fork DAO Deployer':
      return (ForkFunctions as any)[functionName];
    default:
      return null;
  }
}

// ============================================================================
// FUNCTION TYPE DETECTION
// ============================================================================

export function isReadFunction(contractName: string, functionName: string): boolean {
  const readFunctions = [
    'Check if transaction queued',
    'Can execute transaction',
    'Is transaction expired',
    'Get timelock delay',
    'Get grace period',
    'Check admin',
    'Get pending admin',
    'Get proposal state',
    'Get proposal details',
    'Get voting power',
    'Get quorum votes',
    'Has voted',
    'Get proposal threshold',
    'Get fork threshold',
    'Get balance',
    'Get delegate',
    'Get total supply',
    'Get current auction',
    'Get reserve price',
    'Get time buffer',
    'Get min bid increment',
    'Is paused',
    'Get create candidate cost',
    'Get update candidate cost',
    'Get max fork period',
    'Get min fork period',
    'Get max voting delay',
    'Get min voting delay',
    'Get max voting period',
    'Get min voting period',
  ];
  return readFunctions.includes(functionName);
}

