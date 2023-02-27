import inquirer from 'inquirer';
import { ethers } from 'ethers';
import { getHolderList } from './utils/index.mjs';

const providerResponse = await inquirer.prompt([
  {
    type: 'input',
    name: 'providerURL',
    message: 'Please enter the provider URL:'
  }
]);

const provider = new ethers.JsonRpcProvider(providerResponse.providerURL);

const jobResponse = await inquirer.prompt([
  {
    type: 'input',
    name: 'nftAddress',
    message: 'Please enter the NFT address:'
  },
  { 
    type: 'list',
    name: 'job',
    message: 'Please select a job:',
    choices: [
      'getHolderList'
    ]
  }
]);

try {
  switch(jobResponse.job) {
    case 'getHolderList':
      await getHolderList({
        nftAddress: jobResponse.nftAddress,
        provider: provider
      });
      break;
  }
} catch (err) {
  console.error(err);
}

process.exit();