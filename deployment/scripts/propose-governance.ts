import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Contracts } from "./Contracts";

export async function proposeGovernance(
  hre: HardhatRuntimeEnvironment,
  contracts: Contracts,
  deployerPrivateKey: string,
  genesisGovernancePrivateKey: string,
  newGovernanceAccountAddress: string,
  quiet: boolean = false) {

  const web3 = hre.web3;
  const artifacts = hre.artifacts;

  // Turn over governance
  if (!quiet) {
    console.error("Proposing governance...");
  }

  // Define accounts in play for the deployment process
  let deployerAccount: any;
  let genesisGovernanceAccount: any;

  // Get deployer account
  try {
    deployerAccount = web3.eth.accounts.privateKeyToAccount(deployerPrivateKey);
    genesisGovernanceAccount = web3.eth.accounts.privateKeyToAccount(genesisGovernancePrivateKey);
  } catch (e) {
    throw Error("Check .env file, if the private keys are correct and are prefixed by '0x'.\n" + e)
  }

  if (!quiet) {
    console.error(`Proposing with address ${deployerAccount.address}`)
  }

  // Wire up the default account that will do the deployment
  web3.eth.defaultAccount = deployerAccount.address;

  // Contract definitions
  const InflationAllocation = artifacts.require("InflationAllocation");
  const FlareDaemon = artifacts.require("FlareDaemon");
  const Inflation = artifacts.require("Inflation");
  const PriceSubmitter = artifacts.require("PriceSubmitter");
  const Supply = artifacts.require("Supply");
  const WNat = artifacts.require("WNat");

  // Get deployed contracts
  const supply = await Supply.at(contracts.getContractAddress(Contracts.SUPPLY));
  const inflation = await Inflation.at(contracts.getContractAddress(Contracts.INFLATION));
  const inflationAllocation = await InflationAllocation.at(contracts.getContractAddress(Contracts.INFLATION_ALLOCATION));
  const flareDaemon = await FlareDaemon.at(contracts.getContractAddress(Contracts.FLARE_DAEMON));
  const priceSubmitter = await PriceSubmitter.at(contracts.getContractAddress(Contracts.PRICE_SUBMITTER));
  const wNat = await WNat.at(contracts.getContractAddress(Contracts.WNAT));

  if (!quiet) {
    console.error(`Proposed address is ${newGovernanceAccountAddress}`);
  }

  // Propose
  await supply.proposeGovernance(newGovernanceAccountAddress);
  await inflation.proposeGovernance(newGovernanceAccountAddress);
  await inflationAllocation.proposeGovernance(newGovernanceAccountAddress);
  await flareDaemon.proposeGovernance(newGovernanceAccountAddress, { from: genesisGovernanceAccount.address });
  await priceSubmitter.proposeGovernance(newGovernanceAccountAddress, { from: genesisGovernanceAccount.address });
  await wNat.proposeGovernance(newGovernanceAccountAddress);
}
