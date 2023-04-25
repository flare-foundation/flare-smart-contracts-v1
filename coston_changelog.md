# Coston change log

## Align Coston contracts - April 2023
### Background: [SIP.01 | Flare Governance Proposals](https://proposals.flare.network/SIP/SIP_1.html)

#### Upgraded contract: **FtsoRewardManager**
The upgrade adds support for claim-and-wrap and autoclaim.
The change also burns expired rewards instead of redistributing them in the following epochs.

#### Upgraded contract:  **CleanupBlockNumberManager**
Functionality is not modified, but the code is aligned with the one on the Flare network.

#### New Contract: **ClaimSetupManager**
This contract is part of the autoclaiming setup.
Enables public executors to register themselves. Enables token holders to define claim executors and claim recipients. See [the flare documentation](https://docs.flare.network/user/personal-delegation-account/) for more details.

#### New Contract: **DelegationAccount**
Enables a user to set a personal delegation account. See [the flare documentation](https://docs.flare.network/user/personal-delegation-account/) for more details.

## FTSO polling - March 2023
### Background: [STP.03 | Flare Governance Proposals](https://proposals.flare.network/STP/STP_3.html)

#### Upgraded contract: **VoterWhitelister**
The upgraded contract now has governance APIs to enable chilling of FTSO providers and to view chilling data.
 - A chilled data provider cannot be whitelisted or submit prices.
 - The data provider can whitelist itself again after the chill period is over.
 - There is one new method `chilledUntilRewardEpoch(address)` that can be used to check when chill periods are over for a specific address.

#### New Contract: **PollingFtso**
The voting contract for the FTSO management group. Each member of the group can submit a chilling proposal and vote on active chilling proposals. See more in STP.03.