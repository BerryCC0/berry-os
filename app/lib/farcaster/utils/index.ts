/**
 * Farcaster Mini App SDK - Utilities Index
 * Central export point for all business logic utilities
 */

// Type exports
export type {
  FarcasterUser,
  FarcasterLocation,
  MiniAppContext,
  SDKCapability,
  SupportedChain,
  OpenUrlOptions,
  ComposeCastOptions,
  ViewProfileOptions,
  ViewCastOptions,
  ViewChannelOptions,
  OpenMiniAppOptions,
  EthereumProvider,
  SolanaProvider,
  SDKActions,
  SDKWallet,
  MiniAppSDK,
} from './types';

// Error exports
export {
  MiniAppSDKError,
  UnsupportedCapabilityError,
  UnsupportedChainError,
} from './types';

// Constant exports
export {
  ETHEREUM_MAINNET,
  BASE,
  OPTIMISM,
  POLYGON,
  ARBITRUM,
  SOLANA_MAINNET,
  BASIC_CAPABILITIES,
  SOCIAL_CAPABILITIES,
  AUTH_CAPABILITIES,
  WALLET_CAPABILITIES,
  MEDIA_CAPABILITIES,
} from './types';

// Action utilities
export {
  validateUrl,
  validateFid,
  validateCastHash,
  validateChannelKey,
  isCapabilitySupported,
  validateOpenUrlOptions,
  validateComposeCastOptions,
  validateViewProfileOptions,
  validateViewCastOptions,
  validateViewChannelOptions,
  validateOpenMiniAppOptions,
  serializeMiniAppData,
  deserializeMiniAppData,
  buildMiniAppUrl,
  extractMiniAppData,
  truncateCastText,
  formatChannelKey,
  parseChannelKey,
  checkIsMiniAppEnvironment,
  getMiniAppLaunchContext,
  calculateCastLength,
  isCastTooLong,
} from './actions';

// Wallet utilities
export {
  parseChainId,
  isEVMChain,
  isSolanaChain,
  chainIdToHex,
  hexToChainId,
  getChainName,
  getChainExplorer,
  formatAddress,
  isValidEthereumAddress,
  isValidSolanaAddress,
  isEthereumProviderConnected,
  isSolanaProviderConnected,
  getPrimaryAccount,
  getSolanaPublicKey,
  requestEthereumAccounts,
  switchEthereumChain,
  getCurrentChainId,
  getEthereumBalance,
  formatEther,
  parseEther,
  signEthereumMessage,
  signSolanaMessage,
  estimateGas,
  sendEthereumTransaction,
  getTransactionReceipt,
  waitForTransaction,
  supportsMethod,
  getWalletErrorMessage,
} from './wallet';

// Context utilities
export {
  isValidFid,
  isValidUsername,
  formatUsername,
  parseUsername,
  isFarcasterUrl,
  extractFidFromUrl,
  buildProfileUrl,
  buildProfileUrlFromUsername,
  buildCastUrl,
  buildChannelUrl,
  inferLocationType,
  parseLocationFromUrl,
  hasVerifiedEthAddress,
  getPrimaryVerification,
  getAllVerifications,
  getDisplayName,
  getUserIdentifier,
  buildMention,
  isSameUser,
  isValidContext,
  createDefaultContext,
  serializeContext,
  deserializeContext,
  getContextSummary,
  isFromCast,
  isFromChannel,
  isFromProfile,
  isFromDirectMessage,
  getChannelKey,
  getCastHash,
  getProfileFid,
} from './context';

// Capabilities utilities
export {
  isBasicCapability,
  isSocialCapability,
  isAuthCapability,
  isWalletCapability,
  isMediaCapability,
  groupCapabilities,
  getAllCapabilities,
  getMinimumCapabilities,
  hasMinimumCapabilities,
  isValidCapability,
  parseCapability,
  getWalletRequiredCapabilities,
  getSocialRequiredCapabilities,
  supportsRequiredCapabilities,
  parseChain,
  isValidChain,
  getSupportedEVMChains,
  getSupportedSolanaChains,
  getAllSupportedChains,
  supportsRequiredChains,
  getChainById,
  extractChainId,
  groupChains,
  canRunOnHost,
  getFeatureAvailability,
  suggestCapabilities,
  suggestChains,
} from './capabilities';

// Hook exports
export {
  useFarcasterUser,
  useFarcasterLocation,
  useFarcasterCapabilities,
  useFarcasterActions,
  useFarcasterMiniApp,
  useIsMiniApp,
  useFarcasterWallet,
} from './hooks';

