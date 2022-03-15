/**
 * This script will deploy NAT FTSO.
 * It will output, on stdout, a json encoded list of contracts
 * that were deployed (+ old PriceSubmitter, FtsoManager and WNAT).
 * It will write out to stderr, status info as it executes.
 * @dev Do not send anything out via console.log unless it is
 * json defining the created contracts.
 */

import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { pascalCase } from "pascal-case";
import { Contract, Contracts } from "./Contracts";
import { verifyParameters } from './verify-parameters';

export async function deployNatFtso(hre: HardhatRuntimeEnvironment, oldContracts: Contracts, parameters: any, quiet: boolean = false) {
  const web3 = hre.web3;
  const artifacts = hre.artifacts;
  const BN = web3.utils.toBN;

  // Define repository for created contracts
  const contracts = new Contracts();
  verifyParameters(parameters);
  // Define accounts in play for the deployment process
  let deployerAccount: any;

  try {
    deployerAccount = web3.eth.accounts.privateKeyToAccount(parameters.deployerPrivateKey);
  } catch (e) {
    throw Error("Check .env file, if the private keys are correct and are prefixed by '0x'.\n" + e)
  }

  // Wire up the default account that will do the deployment
  web3.eth.defaultAccount = deployerAccount.address;

  // Contract definitions
  const PriceSubmitter = artifacts.require("PriceSubmitter");
  const FtsoManager = artifacts.require("FtsoManager");
  const WNAT = artifacts.require("WNat");
  const Ftso = artifacts.require("Ftso");
  
  const priceSubmitter = await PriceSubmitter.at(oldContracts.getContractAddress(Contracts.PRICE_SUBMITTER));
  spewNewContractInfo(contracts, PriceSubmitter.contractName, `PriceSubmitter.sol`, priceSubmitter.address, quiet);
  const ftsoManager = await FtsoManager.at(oldContracts.getContractAddress(Contracts.FTSO_MANAGER));
  spewNewContractInfo(contracts, FtsoManager.contractName, `FtsoManager.sol`, ftsoManager.address, quiet);
  const wnat = await WNAT.at(oldContracts.getContractAddress(Contracts.WNAT));
  spewNewContractInfo(contracts, WNAT.contractName, `WNat.sol`, wnat.address, quiet);


  const ftsoWnat = await Ftso.new(parameters.nativeSymbol, priceSubmitter.address, wnat.address, ftsoManager.address, parameters.initialWnatPriceUSDDec5, parameters.priceDeviationThresholdBIPS, parameters.priceEpochCyclicBufferSize);
  spewNewContractInfo(contracts, `FTSO WNAT`, `Ftso.sol`, ftsoWnat.address, quiet);
  
  if (!quiet) {
    console.error("Contracts in JSON:");
    console.log(contracts.serialize());
    console.error("Deploy complete.");
  }
}


function spewNewContractInfo(contracts: Contracts, name: string, contractName: string, address: string, quiet = false, pascal = true) {
  if (!quiet) {
    console.error(`${name} contract: `, address);
  }
  if (pascal) {
    contracts.add(new Contract(pascalCase(name), contractName, address));
  }
  else {
    contracts.add(new Contract(name.replace(/\s/g, ""), contractName, address));
  }
}
