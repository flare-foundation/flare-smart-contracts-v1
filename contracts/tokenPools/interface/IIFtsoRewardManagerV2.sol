// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6 <0.9;

import "../../userInterfaces/IFtsoRewardManager.sol";
import "./IIFtsoRewardManager.sol";
import "../../inflation/interface/IIInflationReceiver.sol";

interface IIFtsoRewardManagerV2 is IIFtsoRewardManager {
    
    event RewardsBurned(uint256 amountBurnedWei);
    event UnearnedRewardsAccrued(
        uint256 epochId,
        uint256 reward
    );
    
    function accrueUnearnedRewards(
        uint256 epochId,
        uint256 priceEpochDurationSeconds,
        uint256 priceEpochEndTime
    ) external;

    /**
     * @notice Allows a percentage delegator to claim and wrap rewards.
     * @notice This function is intended to be used to claim and wrap rewards in case of delegation by percentage.
     * @param _recipient            address to transfer funds to
     * @param _rewardEpochs         array of reward epoch numbers to claim for
     * @return _rewardAmount        amount of total claimed rewards
     * @dev Reverts if `msg.sender` is delegating by amount
     */
    function claimAndWrapReward(address payable _recipient, uint256[] memory _rewardEpochs)
        external returns (uint256 _rewardAmount);

    /**
     * @notice Allows a percentage delegator to claim and wrap rewards.
     * @notice This function is intended to be used to claim and wrap rewards in case of delegation by percentage.
     * @notice The caller does not have to be the owner, but must be allowed by owner by calling `addClaimExecutor`.
     *   It is actually safe for this to be called by anybody (nothing can be stolen), but by limiting who can
     *   call, we allow the owner to control the timing of the calls.
     * @param _rewardOwner          address of the reward owner; also, funds will be tranfered there
     * @param _rewardEpochs         array of reward epoch numbers to claim for
     * @return _rewardAmount        amount of total claimed rewards
     * @dev Reverts if `msg.sender` is delegating by amount
     */
    function claimAndWrapRewardToOwner(
        address payable _rewardOwner,
        uint256[] memory _rewardEpochs
    ) external returns (uint256 _rewardAmount);

    /**
     * @notice Allows the sender to claim and wrap rewards from specified data providers.
     * @notice This function is intended to be used to claim and wrap rewards in case of delegation by amount.
     * @param _recipient            address to transfer funds to
     * @param _rewardEpochs         array of reward epoch numbers to claim for
     * @param _dataProviders        array of addresses representing data providers to claim the reward from
     * @return _rewardAmount        amount of total claimed rewards
     * @dev Function can be used by a percentage delegator but is more gas consuming than `claimReward`.
     */
    function claimAndWrapRewardFromDataProviders(
        address payable _recipient,
        uint256[] memory _rewardEpochs,
        address[] memory _dataProviders
    )
        external
        returns (uint256 _rewardAmount);

    /**
     * @notice Allows the sender to claim and wrap rewards from specified data providers.
     * @notice This function is intended to be used to claim and wrap rewards in case of delegation by amount.
     * @notice The caller does not have to be the owner, but must be allowed by owner by calling `addClaimExecutor`.
     *   It is actually safe for this to be called by anybody (nothing can be stolen), but by limiting who can
     *   call, we allow the owner to control the timing of the calls.
     * @param _rewardOwner          address of the reward owner; also, funds will be tranfered there
     * @param _rewardEpochs         array of reward epoch numbers to claim for
     * @param _dataProviders        array of addresses representing data providers to claim the reward from
     * @return _rewardAmount        amount of total claimed rewards
     * @dev Function can be used by a percentage delegator but is more gas consuming than `claimReward`.
     */
    function claimAndWrapRewardFromDataProvidersToOwner(
        address payable _rewardOwner,
        uint256[] memory _rewardEpochs,
        address[] memory _dataProviders
    ) 
        external
        returns (uint256 _rewardAmount);
        
    /**
     * Called by reward owner to allow `_executor` to call `claimAndWrapRewardToOwner` or 
     * `claimAndWrapRewardFromDataProvidersToOwner`.
     * @param _executor the account that will be able to call the `claim to owner` methods
     */
    function addClaimExecutor(address _executor) external;

    /**
     * Called by reward owner to revoke the allowance of `_executor` to call `claimAndWrapRewardToOwner` or 
     * `claimAndWrapRewardFromDataProvidersToOwner`.
     * @param _executor the account that won't be able to call the `claim to owner` methods any more
     */
    function removeClaimExecutor(address _executor) external;

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
}
