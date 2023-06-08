import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { FtsoContract, FtsoManagerContract, FtsoRegistryContract, FtsoRegistryInstance } from '../../typechain-truffle';
import { ChainParameters } from '../chain-config/chain-parameters';
import { Contracts } from "./Contracts";
import {
  verifyParameters,
  spewNewContractInfo
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
  const Ftso: FtsoContract = artifacts.require("Ftso");
  const FtsoRegistry: FtsoRegistryContract = artifacts.require("FtsoRegistry");
  const FtsoManager: FtsoManagerContract = artifacts.require("FtsoManager");

  let ftsoRegistry = await FtsoRegistry.at(contracts.getContractAddress(Contracts.FTSO_REGISTRY));
  let ftsoManager = await FtsoManager.at(contracts.getContractAddress(Contracts.FTSO_MANAGER));

  // get currently supported assets
  let supportedSymbols = (await ftsoRegistry.getSupportedIndicesAndSymbols())[1];

  // deploy new assets
  let ftsosToAdd: string[] = [];
  let startTs = (await ftsoManager.getPriceEpochConfiguration())[0];
  for (let asset of parameters.assets) {

    // Deploy an FTSO only for the new assets
    if (!supportedSymbols.includes(asset.assetSymbol)) {
      if (!quiet) {
        console.error(`Deploying ${asset.assetSymbol}`);
      }
      const ftso = await Ftso.new(asset.assetSymbol, asset.ftsoDecimals, contracts.getContractAddress(Contracts.PRICE_SUBMITTER), contracts.getContractAddress(Contracts.WNAT), contracts.getContractAddress(Contracts.FTSO_MANAGER), startTs, parameters.priceEpochDurationSeconds, parameters.revealEpochDurationSeconds, asset.initialPriceUSDDec5, parameters.priceDeviationThresholdBIPS, parameters.priceEpochCyclicBufferSize);

      spewNewContractInfo(contracts, null, `FTSO ${asset.assetSymbol}`, `Ftso.sol`, ftso.address, quiet);
      ftsosToAdd.push(ftso.address);
    }
  }

  console.error(`Deployed FTSOs ${ftsosToAdd}`);


  // switch to production mode

  if (!quiet) {
    console.error("Contracts in JSON:");
    console.log(contracts.serialize());
    console.error("Deploy complete.");
  }
}
