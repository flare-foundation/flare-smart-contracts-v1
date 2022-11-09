/**
 * This script will deploy all contracts for the FTSO MVP.
 * It will output, on stdout, a json encoded list of contracts
 * that were deployed. It will write out to stderr, status info
 * as it executes.
 * @dev Do not send anything out via console.log unless it is
 * json defining the created contracts.
 */

import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Contracts } from "./Contracts";
import { spewNewContractInfo } from './deploy-utils';

export async function deployContractsGovernance(hre: HardhatRuntimeEnvironment,  contracts: Contracts, parameters: any, quiet: boolean = false) {

  const web3 = hre.web3;
  const artifacts = hre.artifacts;

  // Define repository for created contracts
  // Define address updater contracts names list
  // Define accounts in play for the deployment process
  let deployerAccount: any;

  try {
    deployerAccount = web3.eth.accounts.privateKeyToAccount(parameters.deployerPrivateKey);
  } catch (e) {
    throw Error("Check .env file, if the private keys are correct and are prefixed by '0x'.\n" + e)
  }

  // Wire up the default account that will do the deployment
  web3.eth.defaultAccount = deployerAccount.address;

  const PollingFoundation = artifacts.require("PollingFoundation");
  const GovernanceVotePower = artifacts.require("GovernanceVotePower");

  // Deploy governance vote power
  const wNat = contracts.getContractAddress(Contracts.WNAT);
  const governanceVotePower = await GovernanceVotePower.new(wNat);
  spewNewContractInfo(contracts, GovernanceVotePower.contractName, `GovernanceVotePower.sol`, governanceVotePower.address, quiet);

  // Deploy polling foundation
  const pollingFoundation = await PollingFoundation.new(
    deployerAccount.address,
    parameters.proposers
  );
  spewNewContractInfo(contracts, PollingFoundation.contractName, `PollingFoundation.sol`, pollingFoundation.address, quiet);

  if (!quiet) {
    console.error("Contracts in JSON:");
    console.log(contracts.serialize());
    console.error("Deploy complete.");
  }

  // set contract addresses
  const ftsoManager = contracts.getContractAddress(Contracts.FTSO_MANAGER);
  const supply = contracts.getContractAddress(Contracts.SUPPLY);
  const ftsoRegistry = contracts.getContractAddress(Contracts.FTSO_REGISTRY);

  await pollingFoundation.setContractAddresses(governanceVotePower.address, ftsoRegistry, ftsoManager, supply);

  await pollingFoundation.transferGovernance(parameters.governancePublicKey);

  return {
    contracts: contracts,
  };
}
