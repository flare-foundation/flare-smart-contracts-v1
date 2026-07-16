# Contributing

Contributions to Flare Smart Contracts v1 must follow the guidelines below.

A merge request must pass the relevant lint, static-analysis, and test jobs and must be reviewed by at least one other contributor. Keep changes focused, include tests for changed behavior, and update documentation when workflows or public behavior change.

> **IMPORTANT:** If you use AI assistance such as GitHub Copilot, ChatGPT, or Claude while contributing, you must disclose it in the merge request description.

## Set up your development environment

This repository requires Node.js 24 and uses the pnpm version pinned in [`package.json`](./package.json).

```bash
# Enable the package manager distributed with Node.js.
corepack enable

# Install exactly the dependencies recorded in pnpm-lock.yaml.
pnpm install --frozen-lockfile

# Compile contracts and generate TypeChain bindings.
pnpm compile
```

Hardhat downloads the configured Solidity compilers on the first build. Generated `artifacts/`, `cache/`, and TypeChain directories are ignored and should not be committed.

## Testing

Recompile after changing Solidity contracts so tests use current artifacts and generated bindings.

```bash
# Primary Hardhat suites: unit, integration, performance, and end-to-end tests.
pnpm testHH

# Individual suites.
pnpm test_unit_hh
pnpm test_integration_hh
pnpm test_performance_hh
pnpm test_endtoend_hardhat

# Unit-test coverage.
pnpm cov
```

Run a specific test file with:

```bash
pnpm hardhat test --network hardhat path/to/Test.ts
```

Tests under [`test/scdev/`](./test/scdev/) require a local Flare validator. Docker-based system tests can be run with:

```bash
pnpm test_system_scdev
```

The test suite is sharded across GitLab CI jobs. If you add tests in a new directory, update the CI matrix so they are executed. See [`test/README.md`](./test/README.md) for details.

## Linting and static analysis

Run the checks relevant to your changes before opening a merge request:

```bash
# Solidity linting.
pnpm lint

# TypeScript linting.
pnpm eslint

# Solidity static analysis. This requires Python 3 and pip.
pnpm slither
```

## Merge requests

- Describe the motivation and observable behavior of the change.
- Keep unrelated refactors out of the merge request.
- Add or update tests for bug fixes and behavior changes.
- Document changes to configuration, deployment steps, or public interfaces.
- Do not commit private keys, RPC credentials, generated deployment secrets, or `.env` files.
- Confirm that every new test directory is covered by a GitLab CI job.
- Request review from the appropriate code owners.

Deployment, upgrade, and governance scripts can affect live networks. Changes to these workflows should identify the intended network and include the configuration, generated output, and verification steps needed for review.
