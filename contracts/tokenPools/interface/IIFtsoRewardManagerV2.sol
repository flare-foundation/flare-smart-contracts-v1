// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6 <0.9;

import "./IIFtsoRewardManager.sol";

interface IIFtsoRewardManagerV2 is IIFtsoRewardManager {

    event RewardsBurned(uint256 amountBurnedWei);
    event UnearnedRewardsAccrued(
        uint256 epochId,
        uint256 reward
    );
    event RewardClaimsEnabled(
        uint256 rewardEpochId
    );
    event FtsoRewardManagerActivated(address ftsoRewardManager);
    event FtsoRewardManagerDeactivated(address ftsoRewardManager);

    function enableClaims() external;

    function accrueUnearnedRewards(
        uint256 epochId,
        uint256 priceEpochDurationSeconds,
        uint256 priceEpochEndTime
    ) external;

    function firstClaimableRewardEpoch() external view returns (uint256);

    /**
     * @notice Allows the sender to claim or wrap rewards for reward owner.
     * @notice This function is intended to be used to claim rewards in case of delegation by percentage.
     * @notice The caller does not have to be the owner, but must be approved by the owner to claim on his behalf,
     *   this approval is done by calling `setClaimExecutors`.
     * @notice It is actually safe for this to be called by anybody (nothing can be stolen), but by limiting who can
     *   call, we allow the owner to control the timing of the calls.
     * @notice Reward owner can claim to any `_recipient`, while the executor can only claim to the reward owner,
     *   reward owners's personal delegation account or one of the addresses set by `setAllowedClaimRecipients`.
     * @param _rewardOwner          address of the reward owner
     * @param _recipient            address to transfer funds to
     * @param _rewardEpoch          last reward epoch to claim for
     * @param _wrap                 should reward be wrapped immediately
     * @return _rewardAmount        amount of total claimed rewards
     * @dev Reverts if `msg.sender` is delegating by amount
     */
    function claim(
        address _rewardOwner,
        address payable _recipient,
        uint256 _rewardEpoch,
        bool _wrap
    )
        external returns (uint256 _rewardAmount);


    /**
     * @notice Allows the sender to claim or wrap rewards for reward owner from specified data providers.
     * @notice This function is intended to be used to claim rewards in case of delegation by amount.
     * @notice The caller does not have to be the owner, but must be approved by the owner to claim on his behalf,
     *   this approval is done by calling `setClaimExecutors`.
     * @notice It is actually safe for this to be called by anybody (nothing can be stolen), but by limiting who can
     *   call, we allow the owner to control the timing of the calls.
     * @notice Reward owner can claim to any `_recipient`, while the executor can only claim to the reward owner,
     *   reward owners's personal delegation account or one of the addresses set by `setAllowedClaimRecipients`.
     * @param _rewardOwner          address of the reward owner
     * @param _recipient            address to transfer funds to
     * @param _rewardEpochs         array of reward epoch numbers to claim for
     * @param _dataProviders        array of addresses representing data providers to claim the reward from
     * @param _wrap                 should reward be wrapped immediately
     * @return _rewardAmount        amount of total claimed rewards
     * @dev Function can only be used for explicit delegations.
     */
    function claimFromDataProviders(
        address _rewardOwner,
        address payable _recipient,
        uint256[] calldata _rewardEpochs,
        address[] calldata _dataProviders,
        bool _wrap
    )
        external returns (uint256 _rewardAmount);

    /**
     * @notice Allows batch claiming for the list of '_rewardOwners' and for all unclaimed epochs <= '_rewardEpoch'.
     * @notice If reward owner has enabled delegation account, rewards are also claimed for that delegation account and
     *   total claimed amount is sent to that delegation account, otherwise claimed amount is sent to owner's account.
     * @notice Claimed amount is automatically wrapped.
     * @notice Method can be used by reward owner or executor. If executor is registered with fee > 0,
     *   then fee is paid to executor for each claimed address from the list.
     * @param _rewardOwners         list of reward owners to claim for
     * @param _rewardEpoch          last reward epoch to claim for
     */
    function autoClaim(address[] calldata _rewardOwners, uint256 _rewardEpoch) external;

    /**
     * @notice Returns the fee percentage of `_dataProvider` at `_rewardEpoch`
     * @param _dataProvider         address representing data provider
     * @param _rewardEpoch          reward epoch number
     */
    function getDataProviderFeePercentage(
        address _dataProvider,
        uint256 _rewardEpoch
    )
        external view
        returns (uint256 _feePercentageBIPS);

    /**
     * @notice Return reward epoch vote power block
     * @param _rewardEpoch          reward epoch number
     */
    function getRewardEpochVotePowerBlock(uint256 _rewardEpoch) external view returns (uint256);

    /**
     * @notice Return current reward epoch number
     */
    function getCurrentRewardEpoch() external view returns (uint256);

    /**
     * @notice Return initial reward epoch number
     */
    function getInitialRewardEpoch() external view returns (uint256);

    /**
     * @notice Returns the next claimable reward epoch for '_rewardOwner'.
     * @param _rewardOwner          address of the reward owner
     */
    function nextClaimableRewardEpoch(address _rewardOwner) external view returns (uint256);

    /**
     * @notice Returns the information on rewards and initial vote power of `_dataProvider` for `_rewardEpoch`
     * @param _rewardEpoch                      reward epoch number
     * @param _dataProvider                     address representing the data provider
     * @return _rewardAmount                    number representing the amount of rewards
     * @return _votePowerIgnoringRevocation     number representing the vote power ignoring revocations
     */
    function getDataProviderPerformanceInfo(
        uint256 _rewardEpoch,
        address _dataProvider
    )
        external view
        returns (
            uint256 _rewardAmount,
            uint256 _votePowerIgnoringRevocation
        );

}
