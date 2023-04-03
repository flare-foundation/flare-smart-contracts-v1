import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Contracts } from "./Contracts";

export async function claimGovernance(
  hre: HardhatRuntimeEnvironment,
  contracts: Contracts,
  governanceClaimaintPrivateKey: string,
  quiet: boolean = false) {

  const web3 = hre.web3;
  const artifacts = hre.artifacts;

  // Claim governance
  if (!quiet) {
    console.error("Claiming governance...");
  }

  // Define accounts in play
  let claimantAccount: any;

  // Get deployer account
  try {
    claimantAccount = web3.eth.accounts.privateKeyToAccount(governanceClaimaintPrivateKey);
  } catch (e) {
    throw Error("Check .env file, if the private keys are correct and are prefixed by '0x'.\n" + e)
  }

  // Wire up the default account that will do the claiming
  web3.eth.defaultAccount = claimantAccount.address;

  if (!quiet) {
    console.error(`Claiming governance with address ${claimantAccount.address}`)
  }

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

  // Claim
  await supply.claimGovernance({from: claimantAccount.address});
  await inflation.claimGovernance({from: claimantAccount.address});
  await inflationAllocation.claimGovernance({from: claimantAccount.address});
  await flareDaemon.claimGovernance({from: claimantAccount.address});
  await priceSubmitter.claimGovernance({from: claimantAccount.address});
  await wNat.claimGovernance({from: claimantAccount.address});
}