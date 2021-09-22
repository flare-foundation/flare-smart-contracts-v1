# Calls for fixing Inflation

For old contract names use `deployment/deploys/songbird.json` and for new contract addresses use `deployment/deploys/songbird_fix.json`.

## Instructions

- Contracts needed to make calls
```
flareDaemon = "0x1000000000000000000000000000000000000002"
ftsoManager = "0xbfA12e4E1411B62EdA8B035d71735667422A6A9e"
oldRewardManager = "0xaa7f26a7611e041FEd257019B29F0f0D47a24844"
````

- update inflation address on `FlareDaemon` (`setInflation`)
```
flareDaemon.setInflation("0x8004432D24AfD71C8749CC80969B99601aC15A31")
```

- update daemonized contracts (new `Inflation` and old `FtsoManager`) on `FlareDaemon` (`registerToDaemonize`)
```
flareDaemon.registerToDaemonize([
    { daemonizedContract: "0x8004432D24AfD71C8749CC80969B99601aC15A31", gasLimit: "2000000" },  // Inflation, hex gasLimit: "0x1e8480"
    { daemonizedContract: "0xbfA12e4E1411B62EdA8B035d71735667422A6A9e", gasLimit: "40000000" }  // FtsoManager, hex gasLimit: "0x02625a00"
]);
``` 

- update contract addresses (new `FtsoRewardManager`, old `FtsoRegistry`, old `VoterWhitelister`, new `Supply`, old `CleanupBlockNumberManager`) on `FtsoManager` (`setContractAddresses`)
```
ftsoManager.setContractAddresses(
        "0xC8579Dc7bc5bf6EE0A7ce4Fe92d80F527d1978EC", // new FtsoRewardManager
        "0x6D222fb4544ba230d4b90BA1BfC0A01A94E6cB23", // old FtsoRegistry
        "0xa76906EfBA6dFAe155FfC4c0eb36cDF0A28ae24D",  // old VoterWhitelister
        "0x1032F2a0Efa3559692c28EF4Cb40eA6FBE6DEF12",  // new Supply
        "0x93764A73d3c575Df0f555b8527F004cEf4AE2079"  // old CleanupBlockNumberManager
)
```

- deactivate old `FtsoRewardManager` (`deactivate`) - this one can be skipped
```
oldRewardManager.deactivate()
```

