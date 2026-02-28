// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * TenantShield Deposit Pool (Escrow) — for QDay / Abelian.
 * Tenant deposits; landlord sees guarantee. Release by tenant + landlord or dispute resolution.
 * Identity is not stored on-chain; only amounts and state.
 */
contract Escrow {
    struct Deposit {
        address tenant;
        address landlord;
        uint256 amount;
        uint256 createdAt;
        bool released;
        bool disputed;
    }

    mapping(bytes32 => Deposit) public deposits;
    uint256 public depositCount;

    event Deposited(bytes32 indexed id, address tenant, address landlord, uint256 amount);
    event Released(bytes32 indexed id);
    event Disputed(bytes32 indexed id);

    function deposit(address landlord) external payable {
        require(msg.value > 0, "Amount must be > 0");
        bytes32 id = keccak256(abi.encodePacked(msg.sender, landlord, block.timestamp, depositCount));
        deposits[id] = Deposit({
            tenant: msg.sender,
            landlord: landlord,
            amount: msg.value,
            createdAt: block.timestamp,
            released: false,
            disputed: false
        });
        depositCount++;
        emit Deposited(id, msg.sender, landlord, msg.value);
    }

    function release(bytes32 id) external {
        Deposit storage d = deposits[id];
        require(!d.released, "Already released");
        require(!d.disputed, "Under dispute");
        require(msg.sender == d.tenant || msg.sender == d.landlord, "Not party");
        d.released = true;
        (bool ok,) = payable(d.landlord).call{value: d.amount}("");
        require(ok, "Transfer failed");
        emit Released(id);
    }

    function markDisputed(bytes32 id) external {
        Deposit storage d = deposits[id];
        require(!d.released, "Already released");
        require(msg.sender == d.tenant || msg.sender == d.landlord, "Not party");
        d.disputed = true;
        emit Disputed(id);
    }
}
