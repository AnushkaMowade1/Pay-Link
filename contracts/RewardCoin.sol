// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RewardCoin (RWD)
 * @dev ERC-20 token that gets minted as rewards for payments in PayLink
 */
contract RewardCoin is ERC20, Ownable {
    // Mapping to track authorized minters (PayLink contracts)
    mapping(address => bool) public authorizedMinters;
    
    // Events
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event RewardMinted(address indexed to, uint256 amount, bytes32 indexed paymentHash);
    
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {}
    
    /**
     * @dev Add an authorized minter (PayLink backend or contract)
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        authorizedMinters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove an authorized minter
     */
    function removeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Mint rewards to user (only authorized minters)
     */
    function mintReward(
        address to, 
        uint256 amount, 
        bytes32 paymentHash
    ) external {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be positive");
        
        _mint(to, amount);
        emit RewardMinted(to, amount, paymentHash);
    }
    
    /**
     * @dev Burn tokens (used by RewardVault for redemption)
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev Burn tokens from specific address (used by RewardVault)
     */
    function burnFrom(address from, uint256 amount) external {
        uint256 currentAllowance = allowance(from, msg.sender);
        require(currentAllowance >= amount, "Burn amount exceeds allowance");
        
        _approve(from, msg.sender, currentAllowance - amount);
        _burn(from, amount);
    }
}
