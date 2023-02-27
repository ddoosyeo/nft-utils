import { JsonRpcProvider } from 'ethers';

export type JobArg = {
  nftAddress: string;
  provider: JsonRpcProvider;
}

export type Tokens = {
  [tokenId: number]: string;
};

export type Log = {
  from: string;
  to: string;
  tokenId: number;
}