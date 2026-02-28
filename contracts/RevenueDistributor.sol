// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./TenantshieldToken.sol";

/**
 * RevenueDistributor — SPV deposits 90% of net rental income here.
 * Proportional to TNSH balance. Tokenholders claim or reinvest.
 */
contract RevenueDistributor is Ownable {
    TenantshieldToken public token;
    uint256 public totalDistributable;
    mapping(address => uint256) public claimedPerShare;
    uint256 public totalSupplySnapshot;

    event RevenueDistributed(uint256 amount);
    event Claimed(address indexed holder, uint256 amount);

    constructor(address _token) Ownable(msg.sender) {
        token = TenantshieldToken(_token);
    }

    function distributeRevenue(uint256 amount) external onlyOwner {
        totalDistributable += amount;
        if (token.totalSupply() > 0) {
            totalSupplySnapshot = token.totalSupply();
        }
        emit RevenueDistributed(amount);
    }

    function pendingClaim(address holder) public view returns (uint256) {
        uint256 bal = token.balanceOf(holder);
        if (bal == 0 || totalSupplySnapshot == 0) return 0;
        uint256 share = (totalDistributable * bal) / totalSupplySnapshot;
        uint256 already = claimedPerShare[holder];
        return share > already ? share - already : 0;
    }

    function claim() external {
        uint256 amount = pendingClaim(msg.sender);
        require(amount > 0, "Nothing to claim");
        claimedPerShare[msg.sender] += amount;
        (bool ok,) = msg.sender.call{value: amount}("");
        require(ok, "Transfer failed");
        emit Claimed(msg.sender, amount);
    }
}
