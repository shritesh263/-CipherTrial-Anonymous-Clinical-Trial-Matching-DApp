// ============================================================================
// MIDNIGHT NETWORK CONFIGURATION (PREPROD & PREVIEW SUPPORT)
// ============================================================================

export type NetworkId = 'preprod' | 'preview';

export interface NetworkConfig {
  networkId: NetworkId;
  networkName: string;
  rpcEndpoint: string;
  indexerApiUrl: string;
  indexerWsUrl: string;
  blockfrostRpcUrl: string;
  proofServerUrl: string;
  faucetUrl: string;
  explorerUrl: string;
  contractAddress: string;
}

export const MIDNIGHT_NETWORKS: Record<NetworkId, NetworkConfig> = {
  preprod: {
    networkId: 'preprod',
    networkName: 'Midnight Preprod Network',
    rpcEndpoint: 'wss://rpc.preprod.midnight.network',
    indexerApiUrl: 'https://midnight-preprod.blockfrost.io/api/v0',
    indexerWsUrl: 'wss://midnight-preprod.blockfrost.io/api/v0/ws',
    blockfrostRpcUrl: 'https://rpc.midnight-preprod.blockfrost.io',
    proofServerUrl: 'http://localhost:6300',
    faucetUrl: 'https://faucet.preprod.midnight.network',
    explorerUrl: 'https://explorer.preprod.midnight.network',
    contractAddress: '0x7a3f891b2c4e5d6f7a8b9c0d1e2f3a4b5c6d7e8f',
  },
  preview: {
    networkId: 'preview',
    networkName: 'Midnight Preview Network',
    rpcEndpoint: 'wss://rpc.preview.midnight.network',
    indexerApiUrl: 'https://midnight-preview.blockfrost.io/api/v0',
    indexerWsUrl: 'wss://midnight-preview.blockfrost.io/api/v0/ws',
    blockfrostRpcUrl: 'https://rpc.midnight-preview.blockfrost.io',
    proofServerUrl: 'http://localhost:6300',
    faucetUrl: 'https://faucet.preview.midnight.network',
    explorerUrl: 'https://explorer.preview.midnight.network',
    contractAddress: '0x3b8d91a1e2f4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',
  },
};

export const MIDNIGHT_PREPROD_CONFIG = MIDNIGHT_NETWORKS.preprod;
export const MIDNIGHT_PREVIEW_CONFIG = MIDNIGHT_NETWORKS.preview;

// Default target network
export const activeNetworkConfig = MIDNIGHT_NETWORKS.preprod;
