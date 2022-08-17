// NOTE: We assume both repos, this one `flare-smart-contracts` and Flare Network repo (`flare`) are in the same parent folder.
// Here we are actually reading template from `flare` repo and writing back genesis file.
import { genesisGenerate } from "../genesis-lib";
import { coston2GenesisAccountDefinitions, coston2PChainFunds, coston2TargetTotalSupply } from "./coston2-genesis-accounts-definitions";

const fs = require('fs');

genesisGenerate("coston2", coston2GenesisAccountDefinitions, coston2TargetTotalSupply.sub(coston2PChainFunds));