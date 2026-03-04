// TenantShield Real Estate Token — ERC-3643 Security Token
// Compliant with SFC (HK) security token requirements
// Whitelist-gated: only KYC-verified addresses may hold or transfer
// Professional Investors Only — Securities and Futures Ordinance (Cap. 571)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IIdentityRegistry {
    function isVerified(address account) external view returns (bool);
}

interface ICompliance {
    function canTransfer(address from, address to, uint256 amount) external view returns (bool);
}

contract TenantshieldToken is ERC20, Ownable, Pausable {
    IIdentityRegistry public identityRegistry;
    ICompliance public compliance;

    event IdentityRegistrySet(address indexed registry);
    event ComplianceSet(address indexed compliance);
    event ForcedTransfer(address indexed from, address indexed to, uint256 amount);

    modifier onlyVerified(address account) {
        require(address(identityRegistry) != address(0), "IdentityRegistry not set");
        require(identityRegistry.isVerified(account), "Address not whitelisted");
        _;
    }

    constructor() ERC20("Tenantshield Token", "TNSH") Ownable(msg.sender) {}

    function setIdentityRegistry(address _registry) external onlyOwner {
        identityRegistry = IIdentityRegistry(_registry);
        emit IdentityRegistrySet(_registry);
    }

    function setCompliance(address _compliance) external onlyOwner {
        compliance = ICompliance(_compliance);
        emit ComplianceSet(_compliance);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) external onlyOwner onlyVerified(to) {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function burnFrom(address account, uint256 amount) external onlyOwner {
        _burn(account, amount);
    }

    function forcedTransfer(address from, address to, uint256 amount) external onlyOwner {
        require(from != address(0) && to != address(0), "Zero address");
        if (address(identityRegistry) != address(0)) {
            require(identityRegistry.isVerified(to), "Recipient not whitelisted");
        }
        _transfer(from, to, amount);
        emit ForcedTransfer(from, to, amount);
    }

    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        if (from != address(0) && to != address(0)) {
            if (address(identityRegistry) != address(0)) {
                require(identityRegistry.isVerified(from), "Sender not whitelisted");
                require(identityRegistry.isVerified(to), "Recipient not whitelisted");
            }
            if (address(compliance) != address(0)) {
                require(compliance.canTransfer(from, to, value), "Transfer not compliant");
            }
        }
        super._update(from, to, value);
    }
}
