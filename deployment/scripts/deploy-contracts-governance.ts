/**
 * This script will deploy all contracts for the FTSO MVP.
 * It will output, on stdout, a json encoded list of contracts
 * that were deployed. It will write out to stderr, status info
 * as it executes.
 * @dev Do not send anything out via console.log unless it is
 * json defining the created contracts.
 */

import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { PollingAcceptContract, PollingRejectContract } from '../../typechain-truffle';
import { ChainParameters } from '../chain-config/chain-parameters';
import { Contracts } from "./Contracts";
import { DeployedFlareGovernanceContracts, spewNewContractInfo } from './deploy-utils';

export async function deployContractsGovernance(hre: HardhatRuntimeEnvironment,  contracts: Contracts, parameters: ChainParameters, quiet: boolean = false) {
  const web3 = hre.web3;
  const artifacts = hre.artifacts;

  // Define repository for created contracts
  // Define address updater contracts names list
  const addressUpdaterContracts: string[] = [];
  // Define accounts in play for the deployment process
  let deployerAccount: any;

  
  try {
    deployerAccount = web3.eth.accounts.privateKeyToAccount(parameters.deployerPrivateKey);
  } catch (e) {
    throw Error("Check .env file, if the private keys are correct and are prefixed by '0x'.\n" + e)
  }

  // Wire up the default account that will do the deployment
  web3.eth.defaultAccount = deployerAccount.address;

  const PollingReject: PollingRejectContract = artifacts.require("PollingReject");
  const PollingAccept: PollingAcceptContract = artifacts.require("PollingAccept");

  const addressUpdater = contracts.getContractAddress(Contracts.ADDRESS_UPDATER);

  // Deploy polling reject
  const pollingReject = await PollingReject.new(
    [
      parameters.rejectProposalThresholdBIPS, 
      parameters.votingDelaySeconds,
      parameters.votingPeriodSeconds,
      parameters.executionDelaySeconds,
      parameters.executionPeriodSeconds,
      parameters.ftsoRewardExpiryOffsetDays,
      parameters.vpBlockPeriodSeconds,
      parameters.wrappingThresholdBIPS,
      parameters.absoluteThresholdBIPS,
      parameters.relativeThresholdBIPS
    ],
    deployerAccount.address,
    parameters.priceSubmitterAddress,
    addressUpdater,
    parameters.proposers
  );
  spewNewContractInfo(contracts, addressUpdaterContracts, PollingReject.contractName, `PollingReject.sol`, pollingReject.address, quiet);

  // Deploy polling reject
  const pollingAccept = await PollingAccept.new(
    [
      parameters.acceptProposalThresholdBIPS, 
      parameters.votingDelaySeconds,
      parameters.votingPeriodSeconds,
      parameters.executionDelaySeconds,
      parameters.executionPeriodSeconds,
      parameters.ftsoRewardExpiryOffsetDays,
      parameters.vpBlockPeriodSeconds,
      parameters.wrappingThresholdBIPS,
      parameters.absoluteThresholdBIPS,
      parameters.relativeThresholdBIPS
    ],
    deployerAccount.address,
    parameters.priceSubmitterAddress,
    addressUpdater
    );
  spewNewContractInfo(contracts, addressUpdaterContracts, PollingAccept.contractName, `PollingAccept.sol`, pollingAccept.address, quiet);

  if (!quiet) {
    console.error("Contracts in JSON:");
    console.log(contracts.serialize());
    console.error("Deploy complete.");
  }

  await pollingAccept.switchToProductionMode();
  await pollingReject.switchToProductionMode();

  return {
    pollingReject: pollingReject,
    pollingAccept: PollingAccept,
    contracts: contracts,
  };
}
