import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ClaimSetupManagerContract, CleanupBlockNumberManagerContract, DelegationAccountContract, FlareAssetRegistryContract, FtsoRewardManagerContract, WNatRegistryProviderContract } from '../../typechain-truffle';
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
  const FtsoRewardManager: FtsoRewardManagerContract = artifacts.require("FtsoRewardManager");
  const CleanupBlockNumberManager: CleanupBlockNumberManagerContract = artifacts.require("CleanupBlockNumberManager");
  const DelegationAccount: DelegationAccountContract = artifacts.require("DelegationAccount");
  const ClaimSetupManager: ClaimSetupManagerContract = artifacts.require("ClaimSetupManager");
  const FlareAssetRegistry: FlareAssetRegistryContract = artifacts.require("FlareAssetRegistry");
  const WNatRegistryProvider: WNatRegistryProviderContract = artifacts.require("WNatRegistryProvider");


  // FtsoRewardManager contract (must link first)
  const ftsoRewardManager = await FtsoRewardManager.new(
    parameters.governancePublicKey, // small multisig
    deployerAccount.address, // temp addressUpdater
    contracts.getContractAddress(Contracts.FTSO_REWARD_MANAGER), // old ftso reward manager
    parameters.rewardFeePercentageUpdateOffsetEpochs,
    parameters.defaultRewardFeePercentageBIPS);
  spewNewContractInfo(contracts, addressUpdaterContracts, FtsoRewardManager.contractName, `FtsoRewardManager.sol`, ftsoRewardManager.address, quiet);

  // CleanupBlockNumberManager contract
  const cleanupBlockNumberManager = await CleanupBlockNumberManager.new(
    deployerAccount.address,
    deployerAccount.address, // temp addressUpdater
    "FtsoManager"
  );
  spewNewContractInfo(contracts, addressUpdaterContracts, CleanupBlockNumberManager.contractName, `CleanupBlockNumberManager.sol`, cleanupBlockNumberManager.address, quiet);

  await cleanupBlockNumberManager.registerToken(contracts.getContractAddress(Contracts.WNAT));

  // ClaimSetupManager contract
  const claimSetupManager = await ClaimSetupManager.new(
    deployerAccount.address,
    deployerAccount.address, // temp addressUpdater
    parameters.executorFeeValueUpdateOffsetEpochs,
    BN(parameters.executorMinFeeValueWei.replace(/\s/g, '')),
    BN(parameters.executorMaxFeeValueNAT).mul(BN(10).pow(BN(18))),
    BN(parameters.executorRegisterFeeValueNAT).mul(BN(10).pow(BN(18)))
  );
  spewNewContractInfo(contracts, addressUpdaterContracts, ClaimSetupManager.contractName, `ClaimSetupManager.sol`, claimSetupManager.address, quiet);

  // DelegationAccount contract
  const delegationAccount = await DelegationAccount.new();
  spewNewContractInfo(contracts, null, DelegationAccount.contractName, `DelegationAccount.sol`, delegationAccount.address, quiet);
  await delegationAccount.initialize(claimSetupManager.address, claimSetupManager.address);
  await claimSetupManager.setLibraryAddress(delegationAccount.address);

  // FlareAssetRegistry contract
  const flareAssetRegistry = await FlareAssetRegistry.new(deployerAccount.address);
  spewNewContractInfo(contracts, addressUpdaterContracts, FlareAssetRegistry.contractName, `FlareAssetRegistry.sol`, flareAssetRegistry.address, quiet);

  // WNatRegistryProvider contract
  const wNatRegistryProvider = await WNatRegistryProvider.new(contracts.getContractAddress(Contracts.ADDRESS_UPDATER), flareAssetRegistry.address);
  await flareAssetRegistry.registerProvider(wNatRegistryProvider.address, true);
  spewNewContractInfo(contracts, null, WNatRegistryProvider.contractName, `WNatRegistryProvider.sol`, wNatRegistryProvider.address, quiet);

  // set other contract addresses
  await ftsoRewardManager.updateContractAddresses(
    encodeContractNames([Contracts.ADDRESS_UPDATER, Contracts.INFLATION, Contracts.FTSO_MANAGER, Contracts.WNAT, Contracts.CLAIM_SETUP_MANAGER]),
    [contracts.getContractAddress(Contracts.ADDRESS_UPDATER), contracts.getContractAddress(Contracts.INFLATION), contracts.getContractAddress(Contracts.FTSO_MANAGER),
      contracts.getContractAddress(Contracts.WNAT), claimSetupManager.address]);

  await cleanupBlockNumberManager.updateContractAddresses(
    encodeContractNames([Contracts.ADDRESS_UPDATER, Contracts.FTSO_MANAGER]),
    [contracts.getContractAddress(Contracts.ADDRESS_UPDATER), contracts.getContractAddress(Contracts.FTSO_MANAGER)]);

  await claimSetupManager.updateContractAddresses(
    encodeContractNames([Contracts.ADDRESS_UPDATER, Contracts.FTSO_MANAGER, Contracts.WNAT]),
    [contracts.getContractAddress(Contracts.ADDRESS_UPDATER), contracts.getContractAddress(Contracts.FTSO_MANAGER), contracts.getContractAddress(Contracts.WNAT)]);

  // switch to production mode
  await cleanupBlockNumberManager.switchToProductionMode();
  await claimSetupManager.switchToProductionMode();
  await flareAssetRegistry.switchToProductionMode();


  if (!quiet) {
    console.error("Contracts in JSON:");
    console.log(contracts.serialize());
    console.error("Deploy complete.");
  }
}
