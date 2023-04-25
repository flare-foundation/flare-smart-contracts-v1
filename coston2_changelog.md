# Coston2 change log

## FTSO polling - March 2023
### Background: [FIP.02 | Flare Governance Proposals](https://proposals.flare.network/FIP/FIP_2.html)

#### Upgraded contract: **VoterWhitelister**
The upgraded contract now has governance APIs to enable chilling of FTSO providers and to view chilling data.
 - A chilled data provider cannot be whitelisted or submit prices.
 - The data provider can whitelist itself again after the chill period is over.
 - There is one new method `chilledUntilRewardEpoch(address)` that can be used to check when chill periods are over for a specific address.

#### New Contract: **PollingFtso**
The voting contract for the FTSO management group. Each member of the group can submit a chilling proposal and vote on active chilling proposals. See more in FIP.02.