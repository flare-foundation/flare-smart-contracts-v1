import { constants } from "@openzeppelin/test-helpers";
import { FtsoContract, FtsoInstance } from "../../typechain-truffle";
import { Contracts } from "../scripts/Contracts";

/**
 * This test assumes a local chain is running with Flare allocated in accounts
 * listed in `./hardhat.config.ts`
 */
contract(`deploy-nat-ftso.ts system tests`, async accounts => {
  let contracts: Contracts;
  let parameters: any;

  before(async () => {
    contracts = new Contracts();
    await contracts.deserialize(process.stdin);
    parameters = require("hardhat").getChainConfigParameters(process.env.CHAIN_CONFIG);
  });

  describe(Contracts.FTSO_WNAT, async () => {
    let FtsoWnat: FtsoContract;
    let ftsoWnat: FtsoInstance;

    beforeEach(async () => {
      FtsoWnat = artifacts.require("Ftso");
      ftsoWnat = await FtsoWnat.at(contracts.getContractAddress(Contracts.FTSO_WNAT));
    });

    it("Should be on oracle for WNAT", async () => {
      // Assemble
      // Act
      const address = await ftsoWnat.wNat();
      const assetAddress = await ftsoWnat.getAsset();
      // Assert
      assert.equal(address, contracts.getContractAddress(Contracts.WNAT));
      assert.equal(assetAddress, constants.ZERO_ADDRESS);
    });

    it("Should know about FtsoManager", async () => {
      // Assemble
      // Act
      const ftsoManager = await ftsoWnat.ftsoManager();
      // Assert
      assert.equal(ftsoManager, contracts.getContractAddress(Contracts.FTSO_MANAGER));
    });

    it("Should know about PriceSubmitter", async () => {
      // Assemble
      // Act
      const priceSubmitter = await ftsoWnat.priceSubmitter();
      // Assert
      assert.equal(priceSubmitter, contracts.getContractAddress(Contracts.PRICE_SUBMITTER));
    });

  });
});
