import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { FtsoContract, FtsoManagerContract, FtsoV2UpgraderContract, IIFtsoManagerV1Contract } from '../../typechain-truffle';
import { ChainParameters } from '../chain-config/chain-parameters';
import { Contracts } from "./Contracts";
import { AssetContracts, spewNewContractInfo, verifyParameters } from './deploy-utils';


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

  try {
    deployerAccount = web3.eth.accounts.privateKeyToAccount(parameters.deployerPrivateKey);
  } catch (e) {
    throw Error("Check .env file, if the private key is correct and is prefixed by '0x'.\n" + e)
  }

  // Wire up the default account that will do the deployment
  web3.eth.defaultAccount = deployerAccount.address;

  const Ftso: FtsoContract = artifacts.require("Ftso");
  const FtsoManager: FtsoManagerContract = artifacts.require("FtsoManager");
  const FtsoV2Upgrader: FtsoV2UpgraderContract = artifacts.require("FtsoV2Upgrader");
  const OldFtsoManager: IIFtsoManagerV1Contract = artifacts.require("IIFtsoManagerV1");

  const oldFtsoManager = await OldFtsoManager.at(contracts.getContractAddress(Contracts.FTSO_MANAGER));
  const priceSubmitterAddress = contracts.getContractAddress(Contracts.PRICE_SUBMITTER);
  const wNatAddress = contracts.getContractAddress(Contracts.WNAT);

  // deploy FtsoV2Upgrader contract
  const ftsoV2Upgrader = await FtsoV2Upgrader.new(deployerAccount.address);
  spewNewContractInfo(contracts, null, FtsoV2Upgrader.contractName, `FtsoV2Upgrader.sol`, ftsoV2Upgrader.address, quiet);

  const priceEpochConfiguration = await oldFtsoManager.getPriceEpochConfiguration();
  const startTs = priceEpochConfiguration[0];
  const priceEpochDurationSeconds = priceEpochConfiguration[1];
  const revealEpochDurationSeconds = priceEpochConfiguration[2];

  // Get reward epoch start time
  const rewardEpochStartTs = await oldFtsoManager.rewardEpochsStartTs();
  const rewardEpochDurationSeconds = await oldFtsoManager.rewardEpochDurationSeconds();

  // deploy new FtsoManager contract
  const ftsoManager = await FtsoManager.new(
    ftsoV2Upgrader.address, // governance
    contracts.getContractAddress(Contracts.FLARE_DAEMON),
    deployerAccount.address, // temp address updater
    oldFtsoManager.address,
    startTs,
    priceEpochDurationSeconds,
    revealEpochDurationSeconds,
    rewardEpochStartTs,
    rewardEpochDurationSeconds,
    parameters.votePowerIntervalFraction);
  spewNewContractInfo(contracts, null, FtsoManager.contractName, `FtsoManager.sol`, ftsoManager.address, quiet);

  await ftsoManager.updateContractAddresses(
    encodeContractNames([Contracts.ADDRESS_UPDATER, Contracts.PRICE_SUBMITTER, Contracts.FTSO_REWARD_MANAGER, Contracts.FTSO_REGISTRY, Contracts.VOTER_WHITELISTER, Contracts.SUPPLY, Contracts.CLEANUP_BLOCK_NUMBER_MANAGER]),
    [contracts.getContractAddress(Contracts.ADDRESS_UPDATER), priceSubmitterAddress, contracts.getContractAddress(Contracts.FTSO_REWARD_MANAGER), contracts.getContractAddress(Contracts.FTSO_REGISTRY), contracts.getContractAddress(Contracts.VOTER_WHITELISTER), contracts.getContractAddress(Contracts.SUPPLY), contracts.getContractAddress(Contracts.CLEANUP_BLOCK_NUMBER_MANAGER)]);


  const assetToContracts = new Map<string, AssetContracts>();
  // Deploy an FTSO for WNAT
  let ftsoWnat: any;
  if (parameters.deployNATFtso) {
    ftsoWnat = await Ftso.new(parameters.nativeSymbol, parameters.nativeFtsoDecimals, priceSubmitterAddress, wNatAddress, ftsoManager.address, startTs, priceEpochDurationSeconds,
      revealEpochDurationSeconds, parameters.initialWnatPriceUSDDec5, parameters.priceDeviationThresholdBIPS, parameters.priceEpochCyclicBufferSize);
    spewNewContractInfo(contracts, null, `FTSO WNAT`, `Ftso.sol`, ftsoWnat.address, quiet);

    assetToContracts.set(parameters.nativeSymbol, {
      ftso: ftsoWnat,
      assetSymbol: parameters.nativeSymbol
    })
  }

  // Deploy asset FTSOs
  for (let asset of parameters.assets) {
    if (!quiet) {
      console.error(`Rigging ${asset.assetSymbol}...`);
    }

    // Deploy an FTSO for the asset
    const ftso = await Ftso.new(asset.assetSymbol, asset.ftsoDecimals, priceSubmitterAddress, wNatAddress, ftsoManager.address, startTs, priceEpochDurationSeconds,
      revealEpochDurationSeconds, asset.initialPriceUSDDec5, parameters.priceDeviationThresholdBIPS, parameters.priceEpochCyclicBufferSize);
    spewNewContractInfo(contracts, null, `FTSO ${asset.assetSymbol}`, `Ftso.sol`, ftso.address, quiet);

    assetToContracts.set(asset.assetSymbol, {
      ftso: ftso,
      assetSymbol: asset.assetSymbol
    });
  }

  // Setup governance parameters for the ftso manager
  if (!quiet) {
    console.error("Setting FTSO manager governance parameters...");
  }
  await ftsoV2Upgrader.setGovernanceParametersOnFtsoManager(
    ftsoManager.address,
    parameters.maxVotePowerNatThresholdFraction,
    parameters.maxVotePowerAssetThresholdFraction,
    parameters.lowAssetThresholdUSDDec5,
    parameters.highAssetThresholdUSDDec5,
    parameters.highAssetTurnoutThresholdBIPS,
    parameters.lowNatTurnoutThresholdBIPS,
    parameters.elasticBandRewardBIPS,
    Math.floor(parameters.ftsoRewardExpiryOffsetDays * 60 * 60 * 24),
    parameters.trustedAddresses);

  if (!quiet) {
    console.error(`Setting upgrade data...`);
  }
  let assetList = [
    ...parameters.assets,
    ...(parameters.deployNATFtso ? [{ assetSymbol: parameters.nativeSymbol, elasticBandWidthPPM: parameters.nativeElasticBandWidthPPM }] : [])
  ]
  let ftsoAddresses: string[] = [];
  let elasticBandWidthsPPM: number[] = [];
  for (let asset of assetList) {
    let ftsoContract = (assetToContracts.get(asset.assetSymbol) as AssetContracts).ftso;
    ftsoAddresses.push(ftsoContract.address);
    elasticBandWidthsPPM.push(asset.elasticBandWidthPPM);
  }

  let multiAssetFtsos: string[] = [];
  if (parameters.deployNATFtso) {
    // Set FTSOs to multi Asset WNAT contract
    let multiAssets = parameters.NATMultiAssets;
    multiAssetFtsos = multiAssets.map((asset: any) => assetToContracts.get(asset)!.ftso!.address)
  }
  await ftsoV2Upgrader.setUpgradeData(ftsoAddresses, elasticBandWidthsPPM, parameters.deployNATFtso ? ftsoWnat.address : "0x0000000000000000000000000000000000000000", multiAssetFtsos);

  if (!quiet) {
    console.error(`Switching to production mode...`);
  }
  await ftsoV2Upgrader.switchToProductionMode();

  if (!quiet) {
    console.error("Contracts in JSON:");
    console.log(contracts.serialize());
    console.error("Deploy complete.");
  }
}
