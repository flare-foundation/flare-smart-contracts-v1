// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;


/**
 * @notice This contract works around an issue in the contract that will not accept transfers.
 *         Instead, this contract self-destructs tokens to that address.
 */

contract SelfdestructTransfer {
    address payable public selfdestructAddress;
    address public owner;

    event Received(uint256 amountWei);
    event SelfdestructTransferred(address payable selfdestructAddress, uint256 amountWei);

    constructor(address payable _selfdestructAddress) {
        selfdestructAddress = _selfdestructAddress;
        owner = msg.sender;
    }

    receive() external payable {
        emit Received(msg.value);
    }

    //slither-disable-next-line suicidal
    function die() external {
        require (msg.sender == owner, "only owner");
        emit SelfdestructTransferred(selfdestructAddress, address(this).balance);
        selfdestruct(selfdestructAddress);
    }
}
