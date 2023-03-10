import { ethers } from 'ethers';
import { resolve } from 'path';
import { writeFile } from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { JobArg, Tokens, Log } from './types.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ABI = [
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'function supportsInterface(bytes4 interfaceId) external view returns (bool)'
];

const logs: Log[] = [];

export const getHolderList = async (arg: JobArg) => {
  const currentBlock = await arg.provider.getBlockNumber();
  
  const contract = new ethers.Contract(arg.nftAddress, ABI, arg.provider);

  const isNFT = await contract.supportsInterface('0x80ac58cd');
  if (!isNFT) throw new Error('Not NFT');

  const searchRange = [{ start: 0, end: currentBlock }];

  while (searchRange.length > 0) {
    const { start, end } = searchRange.pop() as { start: number, end: number };
    try {
      const events = await contract.queryFilter('Transfer', start, end);
      if (!events || events.length === 0) continue;

      for (const event of events) {
        logs.push({
          // @ts-ignore
          from: event.args[0],
          // @ts-ignore
          to: event.args[1],
          // @ts-ignore
          tokenId: Number(event.args[2])
        })
      }
    } catch (err) {
      if (start === end) break;

      const middle = parseInt(`${(start + end) / 2}`);
      searchRange.push({ start: middle + 1, end: end });
      searchRange.push({ start: start, end: middle });
    }
  }

  const tokens: Tokens = {};
  for (const log of logs) {
    if (log.to === ethers.ZeroAddress) {
      delete tokens[log.tokenId];
      continue;
    }

    tokens[log.tokenId] = log.to;
  }

  writeFile(resolve(__dirname, `../../output/holder-list-${arg.nftAddress}.json`), JSON.stringify(tokens, null, 2));
}