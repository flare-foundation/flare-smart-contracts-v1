import { pascalCase } from "pascal-case";
import { Contract, Contracts } from "./Contracts";

export function spewNewContractInfo(contracts: Contracts, name: string, contractName: string, address: string, quiet = false, pascal = true) {
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
