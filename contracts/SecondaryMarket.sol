// Bulletin board P2P market — NOT automated matching
// Compliant with SFC guidance: no Type 7 licence required
// All participants must be KYC-verified Professional Investors

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IIdentityRegistry {
    function isVerified(address account) external view returns (bool);
}

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

struct Listing {
    uint256 id;
    address seller;
    uint256 tokenAmount;
    uint256 pricePerTokenUSDT; // 6 decimals (USDT)
    bool active;
    uint256 createdAt;
}

contract SecondaryMarket is Ownable, ReentrancyGuard {
    IIdentityRegistry public identityRegistry;
    IERC20 public token;
    IERC20 public usdt;

    uint256 public nextListingId;
    uint256 public constant platformFee = 150; // 1.5% in basis points
    address public feeRecipient;

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => bool) public listingExists;

    event ListingCreated(uint256 indexed id, address indexed seller, uint256 tokenAmount, uint256 pricePerTokenUSDT);
    event ListingSold(uint256 indexed id, address indexed buyer, uint256 tokenAmount, uint256 pricePerTokenUSDT);
    event ListingCancelled(uint256 indexed id);

    modifier onlyWhitelisted() {
        require(address(identityRegistry) != address(0), "IdentityRegistry not set");
        require(identityRegistry.isVerified(msg.sender), "Not whitelisted");
        _;
    }

    constructor(address _identityRegistry, address _token, address _usdt, address _feeRecipient) Ownable(msg.sender) {
        identityRegistry = IIdentityRegistry(_identityRegistry);
        token = IERC20(_token);
        usdt = IERC20(_usdt);
        feeRecipient = _feeRecipient;
    }

    function createListing(uint256 tokenAmount, uint256 pricePerTokenUSDT) external onlyWhitelisted nonReentrant returns (uint256 id) {
        require(tokenAmount > 0 && pricePerTokenUSDT > 0, "Invalid amount or price");
        id = nextListingId++;
        listings[id] = Listing({
            id: id,
            seller: msg.sender,
            tokenAmount: tokenAmount,
            pricePerTokenUSDT: pricePerTokenUSDT,
            active: true,
            createdAt: block.timestamp
        });
        listingExists[id] = true;
        require(token.transferFrom(msg.sender, address(this), tokenAmount), "Transfer failed");
        emit ListingCreated(id, msg.sender, tokenAmount, pricePerTokenUSDT);
        return id;
    }

    function buyListing(uint256 listingId) external onlyWhitelisted nonReentrant {
        Listing storage l = listings[listingId];
        require(listingExists[listingId] && l.active, "Invalid or inactive listing");
        require(l.seller != msg.sender, "Cannot buy own listing");

        uint256 totalUSDT = l.tokenAmount * l.pricePerTokenUSDT / 1e6;
        uint256 feeAmount = totalUSDT * platformFee / 10000;
        uint256 sellerAmount = totalUSDT - feeAmount;

        l.active = false;

        require(usdt.transferFrom(msg.sender, address(this), totalUSDT), "USDT transfer failed");
        require(usdt.transfer(l.seller, sellerAmount), "USDT to seller failed");
        if (feeAmount > 0) {
            address feeTo = feeRecipient != address(0) ? feeRecipient : owner();
            require(usdt.transfer(feeTo, feeAmount), "USDT fee failed");
        }
        require(token.transfer(msg.sender, l.tokenAmount), "Token transfer failed");

        emit ListingSold(listingId, msg.sender, l.tokenAmount, l.pricePerTokenUSDT);
    }

    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage l = listings[listingId];
        require(listingExists[listingId] && l.active, "Invalid or inactive listing");
        require(msg.sender == l.seller || msg.sender == owner(), "Not seller or owner");
        l.active = false;
        require(token.transfer(l.seller, l.tokenAmount), "Return tokens failed");
        emit ListingCancelled(listingId);
    }

    function getActiveListings() external view returns (Listing[] memory) {
        uint256 count;
        for (uint256 i = 0; i < nextListingId; i++) {
            if (listingExists[i] && listings[i].active) count++;
        }
        Listing[] memory result = new Listing[](count);
        uint256 j;
        for (uint256 i = 0; i < nextListingId; i++) {
            if (listingExists[i] && listings[i].active) {
                result[j++] = listings[i];
            }
        }
        return result;
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        feeRecipient = _feeRecipient;
    }
}
