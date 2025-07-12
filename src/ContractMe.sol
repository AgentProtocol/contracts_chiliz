// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title ContractMe
 * @dev A buy-in system with logarithmic cost increase and prize pool management
 * @author amaucher
 */
contract ContractMe {
    // State variables
    address public owner;
    uint256 public baseFee;
    uint256 public buyInCount;
    uint256 public prizePool;
    uint256 public ownerFees;
    uint256 public constant OWNER_FEE_PERCENTAGE = 5; // 5%
    uint256 public constant PERCENTAGE_BASE = 100;
    
    // Events for transparency and frontend integration
    event BuyIn(address indexed user, uint256 cost, uint256 buyInNumber);
    event PrizeFunded(address indexed funder, uint256 amount);
    event Payout(address indexed recipient, uint256 amount);
    event CostReset(uint256 newBuyInCount);
    event ContractDrained(uint256 prizePoolAmount, uint256 ownerFeesAmount);
    event BaseFeeUpdated(uint256 oldBaseFee, uint256 newBaseFee);
    event OwnerFeesWithdrawn(address indexed owner, uint256 amount);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    modifier validAmount(uint256 amount) {
        require(amount > 0, "Amount must be greater than 0");
        _;
    }
    
    /**
     * @dev Constructor sets the initial base fee and owner
     */
    constructor() {
        owner = msg.sender;
        baseFee = 2.5 ether; // 2.5 CHZ
        buyInCount = 0;
        prizePool = 0;
        ownerFees = 0;
    }
    
    /**
     * @dev Calculate current action cost using logarithmic formula
     * Feeₙ = BaseFee × (1 + log₂(n + 1))
     */
    function actionCost() public view returns (uint256) {
        if (buyInCount == 0) {
            return baseFee;
        }
        
        // Calculate log₂(buyInCount + 1)
        uint256 logValue = log2(buyInCount + 1);
        
        // Fee = BaseFee × (1 + log₂(n + 1))
        // Using fixed point arithmetic with 18 decimals
        uint256 multiplier = 1 ether + (logValue * 1 ether);
        return (baseFee * multiplier) / 1 ether;
    }
    
    /**
     * @dev Returns current prize pool amount
     */
    function prizePoolAmount() public view returns (uint256) {
        return prizePool;
    }
    
    /**
     * @dev Returns current owner fees accumulated
     */
    function ownerFeesAmount() public view returns (uint256) {
        return ownerFees;
    }
    
    /**
     * @dev Returns current buy-in count
     */
    function totalBuyIns() public view returns (uint256) {
        return buyInCount;
    }
    
    /**
     * @dev Allows users to buy in by paying the current action cost
     */
    function buyIn() external payable {
        uint256 currentCost = actionCost();
        require(msg.value >= currentCost, "Insufficient payment");
        
        // Calculate owner fee (5%) and prize pool amount (95%)
        uint256 ownerFee = (currentCost * OWNER_FEE_PERCENTAGE) / PERCENTAGE_BASE;
        uint256 prizePoolAmount = currentCost - ownerFee;
        
        // Update state
        buyInCount++;
        prizePool += prizePoolAmount;
        ownerFees += ownerFee;
        
        // Refund excess payment if any
        if (msg.value > currentCost) {
            payable(msg.sender).transfer(msg.value - currentCost);
        }
        
        emit BuyIn(msg.sender, currentCost, buyInCount);
    }
    
    /**
     * @dev Allows anyone to fund the prize pool
     */
    function fundPrizePool() external payable validAmount(msg.value) {
        prizePool += msg.value;
        emit PrizeFunded(msg.sender, msg.value);
    }
    
    /**
     * @dev Owner-only function to payout from prize pool
     */
    function payout(address recipient, uint256 amount) external onlyOwner validAmount(amount) {
        require(recipient != address(0), "Invalid recipient");
        require(amount <= prizePool, "Insufficient prize pool");
        
        prizePool -= amount;
        payable(recipient).transfer(amount);
        
        emit Payout(recipient, amount);
    }
    
    /**
     * @dev Owner-only function to withdraw accumulated owner fees
     */
    function withdrawOwnerFees() external onlyOwner {
        require(ownerFees > 0, "No owner fees to withdraw");
        
        uint256 amount = ownerFees;
        ownerFees = 0;
        payable(owner).transfer(amount);
        
        emit OwnerFeesWithdrawn(owner, amount);
    }
    
    /**
     * @dev Owner-only function to reset buy-in count (resets cost calculation)
     */
    function resetCost() external onlyOwner {
        buyInCount = 0;
        emit CostReset(buyInCount);
    }
    
    /**
     * @dev Owner-only function to drain all funds and reset state
     */
    function drain() external onlyOwner {
        uint256 prizePoolAmount = prizePool;
        uint256 ownerFeesAmount = ownerFees;
        uint256 totalAmount = prizePoolAmount + ownerFeesAmount;
        
        // Reset state
        prizePool = 0;
        ownerFees = 0;
        buyInCount = 0;
        
        // Transfer all funds to owner
        if (totalAmount > 0) {
            payable(owner).transfer(totalAmount);
        }
        
        emit ContractDrained(prizePoolAmount, ownerFeesAmount);
    }
    
    /**
     * @dev Owner-only function to update base fee
     */
    function updateBaseFee(uint256 newBaseFee) external onlyOwner validAmount(newBaseFee) {
        uint256 oldBaseFee = baseFee;
        baseFee = newBaseFee;
        emit BaseFeeUpdated(oldBaseFee, newBaseFee);
    }
    
    /**
     * @dev Owner-only function to transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        owner = newOwner;
    }
    
    /**
     * @dev Calculate log₂ of a number using bit manipulation
     * Returns the result with 18 decimal places
     */
    function log2(uint256 x) internal pure returns (uint256) {
        require(x > 0, "Cannot calculate log of zero");
        
        if (x == 1) return 0;
        
        uint256 result = 0;
        uint256 temp = x;
        
        // Find the highest bit position
        while (temp > 1) {
            temp >>= 1;
            result++;
        }
        
        // Simple approximation for fractional part
        // This gives us a rough approximation of log₂
        // For more precision, you could implement a more sophisticated algorithm
        return result * 1 ether;
    }
    
    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Emergency function to pause contract (optional safety feature)
     */
    bool public paused = false;
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    function togglePause() external onlyOwner {
        paused = !paused;
    }
    
    // Add pause protection to critical functions
    function buyIn_safe() external payable whenNotPaused {
        // This would replace buyIn() if you want pause functionality
        // For now, keeping the original buyIn() as requested
    }
} 