// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./TenantshieldToken.sol";
import "./NAVOracle.sol";

/**
 * InvestmentVault — accepts investor deposits (ETH), mints TNSH at current NAV.
 * Only owner (SPV) can deploy capital to targets. No investor voting on properties.
 */
contract InvestmentVault is Ownable {
    TenantshieldToken public token;
    NAVOracle public navOracle;

    event Invested(address indexed investor, uint256 amountEth, uint256 tokensMinted);
    event CapitalDeployed(address target, uint256 amount);

    constructor(address _token, address _navOracle) Ownable(msg.sender) {
        token = TenantshieldToken(_token);
        navOracle = NAVOracle(_navOracle);
    }

    function invest() external payable {
        require(msg.value > 0, "Zero amount");
        uint256 nav = navOracle.getCurrentNAV();
        require(nav > 0, "NAV not set");
        uint256 tokensToMint = (msg.value * 1e18) / nav;
        token.mint(msg.sender, tokensToMint);
        emit Invested(msg.sender, msg.value, tokensToMint);
    }

    function deployCapital(address target, uint256 amount) external onlyOwner {
        require(target != address(0), "Invalid target");
        (bool ok,) = target.call{value: amount}("");
        require(ok, "Deploy failed");
        emit CapitalDeployed(target, amount);
    }

    receive() external payable {}
}
