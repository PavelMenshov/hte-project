// Quarterly redemption windows — guaranteed exit mechanism
// Investors may exit at NAV price within 14-day window each quarter
// Pro-rata if redemption requests exceed reserve pool

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
}

contract RedemptionManager is Ownable, ReentrancyGuard {
    IIdentityRegistry public identityRegistry;
    IERC20 public token;
    IERC20 public usdt;

    bool public windowOpen;
    uint256 public windowStart;
    uint256 public windowDuration; // default 14 days
    uint256 public navPerToken;     // USDT per token (6 decimals)
    uint256 public totalRequestedThisWindow;
    uint256 public redemptionReserve; // USDT available for this window

    mapping(address => uint256) public requests; // token amount requested per address
    address[] private _requestors; // list of addresses that requested this window

    event WindowOpened(uint256 start, uint256 navPerToken, uint256 reserve);
    event RedemptionRequested(address indexed investor, uint256 tokenAmount);
    event RedemptionsProcessed(uint256 totalProcessed, uint256 totalUSDT);
    event WindowClosed();

    modifier onlyWhitelisted() {
        require(address(identityRegistry) != address(0), "IdentityRegistry not set");
        require(identityRegistry.isVerified(msg.sender), "Not whitelisted");
        _;
    }

    constructor(address _identityRegistry, address _token, address _usdt) Ownable(msg.sender) {
        identityRegistry = IIdentityRegistry(_identityRegistry);
        token = IERC20(_token);
        usdt = IERC20(_usdt);
        windowDuration = 14 days;
    }

    function openWindow(uint256 _navPerToken, uint256 reserveAmount) external onlyOwner {
        require(!windowOpen, "Window already open");
        require(_navPerToken > 0, "Invalid NAV");
        windowOpen = true;
        windowStart = block.timestamp;
        navPerToken = _navPerToken;
        totalRequestedThisWindow = 0;
        redemptionReserve = reserveAmount;
        if (reserveAmount > 0) {
            require(usdt.transferFrom(msg.sender, address(this), reserveAmount), "USDT transfer failed");
        }
        emit WindowOpened(windowStart, _navPerToken, reserveAmount);
    }

    function requestRedemption(uint256 tokenAmount) external onlyWhitelisted nonReentrant {
        require(windowOpen, "Window not open");
        require(block.timestamp < windowStart + windowDuration, "Window closed");
        require(tokenAmount > 0, "Zero amount");
        if (requests[msg.sender] == 0) {
            _requestors.push(msg.sender);
        }
        requests[msg.sender] += tokenAmount;
        totalRequestedThisWindow += tokenAmount;
        require(token.transferFrom(msg.sender, address(this), tokenAmount), "Token transfer failed");
        emit RedemptionRequested(msg.sender, tokenAmount);
    }

    function processRedemptions() external onlyOwner nonReentrant {
        require(windowOpen, "Window not open");
        require(block.timestamp >= windowStart + windowDuration, "Window still open");

        uint256 totalRequested = totalRequestedThisWindow;
        uint256 reserve = redemptionReserve;
        uint256 totalUSDTNeeded = totalRequested * navPerToken / 1e6;

        uint256 totalProcessed;
        uint256 totalUSDTSent;

        if (totalRequested == 0 || reserve == 0) {
            _clearRequestors();
            _closeWindow();
            emit RedemptionsProcessed(0, 0);
            return;
        }

        uint256 usdtBalance = usdt.balanceOf(address(this));
        uint256 effectiveReserve = usdtBalance < reserve ? usdtBalance : reserve;
        bool proRata = totalUSDTNeeded > effectiveReserve;

        for (uint256 i = 0; i < _requestors.length; i++) {
            address requestor = _requestors[i];
            uint256 tokenReq = requests[requestor];
            if (tokenReq == 0) continue;

            uint256 usdtToSend;
            uint256 tokensToReturn;
            if (proRata) {
                usdtToSend = tokenReq * effectiveReserve / totalRequested;
                tokensToReturn = tokenReq - (usdtToSend * 1e6 / navPerToken);
            } else {
                usdtToSend = tokenReq * navPerToken / 1e6;
            }

            delete requests[requestor];
            totalProcessed += (tokenReq - tokensToReturn);
            totalUSDTSent += usdtToSend;

            if (usdtToSend > 0) {
                require(usdt.transfer(requestor, usdtToSend), "USDT transfer failed");
            }
            if (tokensToReturn > 0) {
                require(token.transfer(requestor, tokensToReturn), "Token return failed");
            }
        }

        _clearRequestors();
        _closeWindow();
        emit RedemptionsProcessed(totalProcessed, totalUSDTSent);
    }

    function _clearRequestors() internal {
        for (uint256 i = 0; i < _requestors.length; i++) {
            delete requests[_requestors[i]];
        }
        delete _requestors;
    }

    function _closeWindow() internal {
        windowOpen = false;
        totalRequestedThisWindow = 0;
        redemptionReserve = 0;
        emit WindowClosed();
    }

    function getRequestorsCount() external view returns (uint256) {
        return _requestors.length;
    }

    function closeWindow() external onlyOwner {
        require(windowOpen, "Window not open");
        _closeWindow();
    }

    function setWindowDuration(uint256 _days) external onlyOwner {
        windowDuration = _days * 1 days;
    }
}
