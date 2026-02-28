// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * NAVOracle — stores current NAV per token (HKD with 18 decimals).
 * Only owner (SPV) updates after portfolio valuation.
 */
contract NAVOracle is Ownable {
    uint256 public currentNAVPerToken; // 18 decimals (e.g. 1073 * 1e18 for HKD 1073)

    event NAVUpdated(uint256 newNAVPerToken);

    constructor() Ownable(msg.sender) {}

    function updateNAV(uint256 newNAVPerToken) external onlyOwner {
        currentNAVPerToken = newNAVPerToken;
        emit NAVUpdated(newNAVPerToken);
    }

    function getCurrentNAV() external view returns (uint256) {
        return currentNAVPerToken;
    }
}
