<img src="https://content.flare.network/Flare-2.svg" width="300" alt="Flare Logo" />

# Flare Smart Contracts v1

[![pipeline status](https://gitlab.com/flarenetwork/FSP/flare-smart-contracts-v1/badges/main/pipeline.svg)](https://gitlab.com/flarenetwork/FSP/flare-smart-contracts-v1/-/pipelines)

[About](#about) | [Deployed contracts](#deployed-contracts) | [Development](#development) | [Contributing](./CONTRIBUTING.md)

## About

This repository contains the first-generation Solidity smart contracts used by Flare networks. The contracts implement core protocol, governance, token, reward, inflation, and system functionality, including:

- [Flare Time Series Oracle (FTSO)](./contracts/ftso/)
- [tokens and vote-power delegation](./contracts/token/)
- [inflation and supply accounting](./contracts/inflation/)
- [reward and distribution pools](./contracts/tokenPools/)
- [governance](./contracts/governance/) and [address updates](./contracts/addressUpdater/)
- [genesis and system contracts](./contracts/genesis/), including FlareDaemon, PriceSubmitter, and StateConnector
- [claiming](./contracts/claiming/) and supporting utilities

A diagram covering the v1 and v2 smart-contract systems is available [here](https://content.flare.network/flare-smart-contracts-v1-v2-all_with_background.svg).

For current developer documentation, visit the [Flare Developer Hub](https://dev.flare.network/). For questions and community support, join the [Flare Discord](https://discord.com/invite/flarenetwork).

## Deployed contracts

The network branches capture different deployed versions of the contracts. Use the branch and address file for the network you are inspecting:

| Network | Source branch | Contract addresses |
| --- | --- | --- |
| Flare | [`flare_network_deployed_code`](https://gitlab.com/flarenetwork/FSP/flare-smart-contracts-v1/-/tree/flare_network_deployed_code) | [`deployment/deploys/flare.json`](https://gitlab.com/flarenetwork/FSP/flare-smart-contracts-v1/-/blob/flare_network_deployed_code/deployment/deploys/flare.json) |
| Songbird | [`songbird_network_deployed_code`](https://gitlab.com/flarenetwork/FSP/flare-smart-contracts-v1/-/tree/songbird_network_deployed_code) | [`deployment/deploys/songbird.json`](https://gitlab.com/flarenetwork/FSP/flare-smart-contracts-v1/-/blob/songbird_network_deployed_code/deployment/deploys/songbird.json) |
| Coston | [`coston_network_deployed_code`](https://gitlab.com/flarenetwork/FSP/flare-smart-contracts-v1/-/tree/coston_network_deployed_code) | [`deployment/deploys/coston.json`](https://gitlab.com/flarenetwork/FSP/flare-smart-contracts-v1/-/blob/coston_network_deployed_code/deployment/deploys/coston.json) |
| Coston2 | [`coston2_network_deployed_code`](https://gitlab.com/flarenetwork/FSP/flare-smart-contracts-v1/-/tree/coston2_network_deployed_code) | [`deployment/deploys/coston2.json`](https://gitlab.com/flarenetwork/FSP/flare-smart-contracts-v1/-/blob/coston2_network_deployed_code/deployment/deploys/coston2.json) |

Always select the appropriate network branch before auditing deployed source code or using an address file.

## Repository layout

| Path | Contents |
| --- | --- |
| [`contracts/`](./contracts/) | Solidity contracts, interfaces, libraries, and mocks |
| [`test/`](./test/) | Unit, integration, performance, fuzzing, and system tests |
| [`deployment/`](./deployment/) | Chain configuration, deployment scripts, genesis generation, and deployment tests |
| [`scripts/`](./scripts/) | Development, reporting, and test utilities |
| [`npm-package-data/`](./npm-package-data/) | Files used to prepare the published contract package |

## Development

### Requirements

- Node.js 24
- Corepack, included with Node.js 24
- Git
- Docker for tests that run against a local Flare validator

Hardhat downloads the configured Solidity 0.7.6 and 0.6.12 compilers when needed.

### Setup

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm compile
```

### Common commands

| Command | Purpose |
| --- | --- |
| `pnpm compile` | Compile contracts and generate TypeChain bindings |
| `pnpm testHH` | Run the primary Hardhat suites (unit, integration, performance, and end-to-end) |
| `pnpm test_unit_hh` | Run unit tests |
| `pnpm test_integration_hh` | Run integration tests |
| `pnpm test_performance_hh` | Run performance tests |
| `pnpm test_endtoend_hardhat` | Run end-to-end tests against a local Hardhat node |
| `pnpm cov` | Generate the unit-test coverage report |
| `pnpm lint` | Run Solhint on Solidity contracts |
| `pnpm eslint` | Run ESLint on TypeScript files |
| `pnpm slither` | Run Slither static analysis |

Run a specific Hardhat test with:

```bash
pnpm hardhat test --network hardhat path/to/Test.ts
```

See [`test/README.md`](./test/README.md) for the test-directory layout and CI test-sharding guidance.

### Local Flare validator

The scdev system tests require Docker and bind a local validator to `127.0.0.1:9650`:

```bash
pnpm test_system_scdev
```

Additional scdev, deployment, and network-specific commands are defined in [`package.json`](./package.json). Treat production deployment and governance commands as privileged operations: verify the selected network, configuration, account, and generated transaction data before execution.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup, required checks, and merge-request expectations.
