import { Magic } from 'magic-sdk';
import Web3 from 'web3';

const customNodeOptions = {
  rpcUrl: 'https://goerli.optimism.io/',
  chainId: 420,
};

// Setting network to Optimism Testnet
export const magicOptimism = new Magic(
  process.env.REACT_APP_MAGIC_PUBLISHABLE_KEY, 
  { 
    network: customNodeOptions,
  },
);
magicOptimism.network = 'optimism';

export const web3Optimism = new Web3(magicOptimism.rpcProvider);

// Setting network to Ethereum (Goerli Testnet)
export const magicEthereum = new Magic(
  process.env.REACT_APP_MAGIC_PUBLISHABLE_KEY, 
  { 
    network: 'goerli',
  },
);
magicEthereum.network = 'ethereum';

export const web3Ethereum = new Web3(magicEthereum.rpcProvider);