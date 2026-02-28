// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * TenantShield Collective Rent Pool — demo contract for QDay / Abelian.
 * Students join by district hash + budget range (privacy-preserving).
 * Owner can record deals and discount. No individual addresses stored per pool.
 */
contract CollectiveRentPool {
    address public owner;

    struct PoolStats {
        uint256 participantCount;
        uint256 lastDealDiscountBps;
    }
    mapping(bytes32 => PoolStats) public poolStats;

    event PoolUpdated(bytes32 indexed districtHash, uint256 participantCount);
    event DealRecorded(bytes32 indexed districtHash, uint256 discountBps);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * Join the pool. districtHash = keccak256(abi.encodePacked(districtName)), budgetRange = budget rounded to nearest 2000.
     */
    function joinPool(bytes32 districtHash, uint256 budgetRange) external {
        require(budgetRange > 0, "Invalid budget");
        PoolStats storage s = poolStats[districtHash];
        s.participantCount += 1;
        emit PoolUpdated(districtHash, s.participantCount);
    }

    /**
     * Owner records a deal for a district. discountBps = basis points (1800 = 18%).
     */
    function recordDeal(bytes32 districtHash, uint256 discountBps) external onlyOwner {
        require(discountBps <= 10000, "Invalid bps");
        PoolStats storage s = poolStats[districtHash];
        s.lastDealDiscountBps = discountBps;
        emit DealRecorded(districtHash, discountBps);
    }
}
