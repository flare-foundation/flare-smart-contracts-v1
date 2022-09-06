import { BigNumber } from "ethers";
import { GenesisAccount } from "../genesis-lib";

// 15 billion SGB
const TARGET_TOTAL_SUPPLY = "100,000,000,000,000.000 000 000 000 000 000" 
const P_CHAIN_FUNDS = "50,000.000 000 000 000 000 000" 

export const coston2TargetTotalSupply = BigNumber.from(TARGET_TOTAL_SUPPLY.replace(/[., ]/g, ""));
export const coston2PChainFunds = BigNumber.from(P_CHAIN_FUNDS.replace(/[., ]/g, ""));
// THE AUTHORITATIVE LIST OF ADDRESSES AND BALANCES
// Should match the line numbers in Gdocs
export const coston2GenesisAccountDefinitions: GenesisAccount[] = [
    {
        id: 2,
        address: "0x1000000000000000000000000000000000000006",
        initialEntryWei: "3,900,330,239.094 370 633 065 000 000"
    },
    {
        id: 3,
        address: "0x1000000000000000000000000000000000000004",
        initialEntryWei: "22,101,871,354.868 100 254 035 000 000"
    },
    {
        id: 4,
        address: "0x1000000000000000000000000000000000000005",
        initialEntryWei: "20,000,000,000.000 000 000 000 000 000"
    },
////
    {
        id: 7,
        address: "0x1b0d19194BA0BFfE31e8A30873d94F6B90Ad2d1c",
        initialEntryNat: "10,000,000,000,000"
    },
    {
        id: 8,
        address: "0x6C371BB1A1724e6eFa157929f13Dad83a59c3C33",
        initialEntryNat: "10,000,000,000,000"
    },
    {
        id: 9,
        address: "0x3C5F00Df0e06727073E9dc290A1B9EE1FDde3087",
        initialEntryNat: "10,000,000,000,000"
    },
    {
        id: 10,
        address: "0xfBbcd569e54963E7eC61413B261e9c7Bb6fAC63a",
        initialEntryNat: "10,000,000,000,000"
    },
    {
        id: 11,
        address: "0xF20646801f0B99fd745ab1Bc4E61EF44A4c1300F",
        initialEntryNat: "10,000,000,000,000"
    },
    {
        id: 12,
        address: "0x3C58186885aB9A9EC68b5C3142E0A32fb5d2FD1a",
        initialEntryNat: "10,000,000,000,000"
    },
    {
        id: 13,
        address: "0x7F4B80C578a70d3EB0A5234EdC0bD35013F0a262",
        initialEntryNat: "10,000,000,000,000"
    },
    {
        id: 14,
        address: "0xE7FC55D67E8c057F6Ae133484EA4a29536bC9295",
        initialEntryNat: "10,000,000,000,000"
    },
    {
        id: 15,
        address: "0xB3f2736d41da493F2F45a7BE30562B536490B444",
        initialEntryNat: "10,000,000,000,000"
    },
    {
        id: 16,
        address: "0x480e12a6d3D2935eb6dCC0BE08a28Ec2b8aA90fA",
        initialEntryWei: "0",
        isBalancing: true
    },
////    
    {
        id: 19,
        address: "0x4598A6c05910ab914F0CbAAca1911Cd337d10D29",
        initialEntryNat: "15,000"
    }
//////
]
