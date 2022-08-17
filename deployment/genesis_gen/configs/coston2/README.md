# Generating genesis C-chain config for Coston2

## Setting up the configuration

Based on the distribution of funds to the accounts on protected spreadsheet the configuration file 
`deployment/genesis/coston2/coston2-genesis-accounts-definitions.ts` should be set up.

## Generate account info

```
yarn generate_genesis_coston2
```

The result will appear `deployment/genesis/coston2/outputs`

You can use `coston2.csv`, open it in Excel (import it and set delimiter to comma) and paste blocks of data into relevant fields of the spreadsheet.
- Use relevant columns for block-copy-paste of columns (C,D) -> (D, E), from CSV to the spreadsheet.
- To check for matching addresses, use Column I, Address check

## Generate genesis config

```
yarn genesis_json_coston2
```

The result will appear in `deployment/genesis_gen/generated/coston2.json`.

Use the `cChainGenesis` key and put the value in the `genesis_coston2.go` in the validator repo.

Beside `coston2.json` additional files are generated:
- `deployment/genesis_gen/generated/coston2-staging.json` - includes additional accounts from `test-1020-accounts.json`
- `deployment/genesis_gen/generated/coston2-cChainGenesis.json` - pretty print of `cChainGenesis` key of `coston2.json`
- `deployment/genesis_gen/generated/coston2-staging-cChainGenesis.json` - pretty print of `cChainGenesis` key of `coston2-staging.json`

