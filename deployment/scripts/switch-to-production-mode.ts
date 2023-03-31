import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Contracts } from "./Contracts";

type Account = ReturnType<typeof web3.eth.accounts.privateKeyToAccount>;

export async function switchToProductionMode(
    hre: HardhatRuntimeEnvironment,
    contracts: Contracts,
    deployerPrivateKey: string,
    genesisGovernancePrivateKey: string,
    distributionDeployed: boolean,
    quiet: boolean = false
) {
    const web3 = hre.web3;
    const artifacts = hre.artifacts as Truffle.Artifacts;

    // Turn over governance
    if (!quiet) {
        console.error("Switching to production mode...");
    }

    // Define accounts in play for the deployment process
    let deployerAccount: Account;
    let genesisGovernanceAccount: Account;

    // Get deployer account
    try {
        deployerAccount = web3.eth.accounts.privateKeyToAccount(deployerPrivateKey);
    } catch (e) {
        throw Error("Check .env file, if the private keys are correct and are prefixed by '0x'.\n" + e)
    }

    // Get deployer account
    try {
        genesisGovernanceAccount = web3.eth.accounts.privateKeyToAccount(genesisGovernancePrivateKey);
    } catch (e) {
        throw Error("Check .env file, if the private keys are correct and are prefixed by '0x'.\n" + e)
    }


    if (!quiet) {
        console.error(`Switching to production from deployer address ${deployerAccount.address} and genesis governance address ${genesisGovernanceAccount.address}`);
        console.error(`Using governance settings at ${contracts.getContractAddress(Contracts.GOVERNANCE_SETTINGS)}`);
    }

    // Wire up the default account that will do the deployment
    web3.eth.defaultAccount = deployerAccount.address;

    // Contract definitions
    const AddressUpdater = artifacts.require("AddressUpdater");
    const FtsoManager = artifacts.require("FtsoManager");
    const FtsoRegistry = artifacts.require("FtsoRegistry");
    const PollingFoundation = artifacts.require("PollingFoundation");
    const VoterWhitelister = artifacts.require("VoterWhitelister");
    const PollingFtso = artifacts.require("PollingFtso");

    // Get deployed contracts
    const addressUpdater = await AddressUpdater.at(contracts.getContractAddress(Contracts.ADDRESS_UPDATER));
    const ftsoManager = await FtsoManager.at(contracts.getContractAddress(Contracts.FTSO_MANAGER));
    const ftsoRegistry = await FtsoRegistry.at(contracts.getContractAddress(Contracts.FTSO_REGISTRY));
    const pollingFoundation = await PollingFoundation.at(contracts.getContractAddress(Contracts.POLLING_FOUNDATION));
    const voterWhitelister = await VoterWhitelister.at(contracts.getContractAddress(Contracts.VOTER_WHITELISTER));
    const pollingFtso = await PollingFtso.at(contracts.getContractAddress(Contracts.POLLING_FTSO));

    // switch to production mode
    await addressUpdater.switchToProductionMode();
    await ftsoManager.switchToProductionMode();
    await ftsoRegistry.switchToProductionMode();
    await pollingFoundation.switchToProductionMode();
    await voterWhitelister.switchToProductionMode();
    await pollingFtso.switchToProductionMode();
}
