import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { PollingFtsoContract, VoterWhitelisterContract, WNatRegistryProviderContract } from '../../typechain-truffle';
import { ChainParameters } from '../chain-config/chain-parameters';
import { Contracts } from "./Contracts";
import {
  spewNewContractInfo,
  verifyParameters
} from './deploy-utils';


export async function redeployContracts(hre: HardhatRuntimeEnvironment, contracts: Contracts, parameters: ChainParameters, quiet: boolean = false) {

  function encodeContractNames(names: string[]): string[] {
    return names.map(name => encodeString(name));
  }

  function encodeString(text: string): string {
    return hre.ethers.utils.keccak256(hre.ethers.utils.defaultAbiCoder.encode(["string"], [text]));
  }

  const web3 = hre.web3;
  const artifacts = hre.artifacts;
  const BN = web3.utils.toBN;


  verifyParameters(parameters);
  // Define accounts in play for the deployment process
  let deployerAccount: any;
  // Define address updater contracts names list
  const addressUpdaterContracts: string[] = [];

  try {
    deployerAccount = web3.eth.accounts.privateKeyToAccount(parameters.deployerPrivateKey);
  } catch (e) {
    throw Error("Check .env file, if the private keys are correct and are prefixed by '0x'.\n" + e)
  }

  // Wire up the default account that will do the deployment
  web3.eth.defaultAccount = deployerAccount.address;

  // Contract definitions
  const WNatRegistryProvider: WNatRegistryProviderContract = artifacts.require("WNatRegistryProvider");

  // WNAT registry provider contract
  const wNatRegistryProvider = await WNatRegistryProvider.new(contracts.getContractAddress(Contracts.ADDRESS_UPDATER), contracts.getContractAddress(Contracts.FLARE_ASSET_REGISTRY));
  spewNewContractInfo(contracts, null, WNatRegistryProvider.contractName, `WNatRegistryProvider.sol`, wNatRegistryProvider.address, quiet);


  if (!quiet) {
    console.error("Contracts in JSON:");
    console.log(contracts.serialize());
    console.error("Deploy complete.");
  }
}
