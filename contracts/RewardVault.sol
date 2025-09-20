// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./RewardCoin.sol";

/**
 * @title RewardVault
 * @dev Contract that holds SHM and allows users to redeem RWD tokens for SHM
 */
contract RewardVault is Ownable, ReentrancyGuard {
    RewardCoin public immutable rewardToken;
    
    // Conversion rate: how many RWD tokens = 1 SHM (in wei)
    // Default: 100 RWD = 1 SHM
    uint256 public conversionRate = 100 * 10**18; // 100 RWD tokens
    
    // Minimum redemption amount to prevent spam
    uint256 public minimumRedemption = 10 * 10**18; // 10 RWD tokens
    
    // Events
    event Redeemed(address indexed user, uint256 rwdAmount, uint256 shmAmount);
    event ConversionRateUpdated(uint256 oldRate, uint256 newRate);
    event VaultFunded(address indexed funder, uint256 amount);
    event EmergencyWithdraw(address indexed owner, uint256 amount);
    
    constructor(address _rewardToken, address initialOwner) Ownable(initialOwner) {
        require(_rewardToken != address(0), "Invalid reward token address");
        rewardToken = RewardCoin(_rewardToken);
    }
    
    /**
     * @dev Fund the vault with SHM
     */
    function fundVault() external payable onlyOwner {
        require(msg.value > 0, "Must send SHM to fund vault");
        emit VaultFunded(msg.sender, msg.value);
    }
    
    /**
     * @dev Redeem RWD tokens for SHM
     */
    function redeem(uint256 rwdAmount) external nonReentrant {
        require(rwdAmount >= minimumRedemption, "Amount below minimum redemption");
        require(rewardToken.balanceOf(msg.sender) >= rwdAmount, "Insufficient RWD balance");
        
        // Calculate SHM amount to send
        uint256 shmAmount = (rwdAmount * 10**18) / conversionRate;
        require(address(this).balance >= shmAmount, "Insufficient SHM in vault");
        
        // Burn RWD tokens
        rewardToken.burnFrom(msg.sender, rwdAmount);
        
        // Send SHM to user
        (bool success, ) = payable(msg.sender).call{value: shmAmount}("");
        require(success, "SHM transfer failed");
        
        emit Redeemed(msg.sender, rwdAmount, shmAmount);
    }
    
    /**
     * @dev Update conversion rate (only owner)
     */
    function updateConversionRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "Rate must be positive");
        uint256 oldRate = conversionRate;
        conversionRate = newRate;
        emit ConversionRateUpdated(oldRate, newRate);
    }
    
    /**
     * @dev Update minimum redemption amount (only owner)
     */
    function updateMinimumRedemption(uint256 newMinimum) external onlyOwner {
        minimumRedemption = newMinimum;
    }
    
    /**
     * @dev Get vault SHM balance
     */
    function getVaultBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Calculate SHM amount for given RWD amount
     */
    function calculateShmAmount(uint256 rwdAmount) external view returns (uint256) {
        return (rwdAmount * 10**18) / conversionRate;
    }
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No SHM to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit EmergencyWithdraw(owner(), balance);
    }
    
    // Allow contract to receive SHM
    receive() external payable {
        emit VaultFunded(msg.sender, msg.value);
    }
}
