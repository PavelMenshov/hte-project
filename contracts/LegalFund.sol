// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * TenantShield Legal Fund — QDay / Abelian.
 * Tenants contribute HK$5/month (or any amount). Dispute payouts handled by backend/oracle.
 */
contract LegalFund {
    uint256 public totalPool;

    event Contributed(address indexed from_, uint256 amount);

    function contribute() external payable {
        require(msg.value > 0, "Amount must be > 0");
        totalPool += msg.value;
        emit Contributed(msg.sender, msg.value);
    }
}
