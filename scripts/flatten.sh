#!/bin/bash

echo "$1"
mkdir -p "flattened/$(dirname "$1")"
pnpm hardhat flatten "$1" > "flattened/$1"
pnpm ts-node scripts/flatten-fix.ts "flattened/$1"
