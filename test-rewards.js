// Test script for rewards system
console.log("Testing rewards system...")

// Simulate the rewards storage
const rewardsStorage = {}

function getRewardBalance(address) {
    return rewardsStorage[address] || 0
}

function mintRewardsForPayment(address, paymentAmount, txHash) {
    console.log(`Minting rewards for payment: ${paymentAmount} SHM`)
    const rewardAmount = paymentAmount * 10
    console.log(`Reward amount: ${rewardAmount} RWD`)
    
    if (!rewardsStorage[address]) {
        rewardsStorage[address] = 0
    }
    rewardsStorage[address] += rewardAmount
    
    console.log(`New balance for ${address}: ${rewardsStorage[address]} RWD`)
    return true
}

function redeemRewards(address, amount) {
    console.log(`Attempting to redeem ${amount} RWD for ${address}`)
    
    if (!rewardsStorage[address] || rewardsStorage[address] < amount) {
        console.log("Insufficient balance")
        return false
    }
    
    rewardsStorage[address] -= amount
    console.log(`Redemption successful. New balance: ${rewardsStorage[address]} RWD`)
    return true
}

// Test the system
const testAddress = "0x1234567890abcdef"

console.log("\n1. Check initial balance:")
console.log("Balance:", getRewardBalance(testAddress))

console.log("\n2. Make a payment of 1 SHM:")
mintRewardsForPayment(testAddress, 1, "0xtest")

console.log("\n3. Check balance after payment:")
console.log("Balance:", getRewardBalance(testAddress))

console.log("\n4. Make another payment of 2.5 SHM:")
mintRewardsForPayment(testAddress, 2.5, "0xtest2")

console.log("\n5. Check balance after second payment:")
console.log("Balance:", getRewardBalance(testAddress))

console.log("\n6. Redeem 15 RWD:")
redeemRewards(testAddress, 15)

console.log("\n7. Final balance:")
console.log("Balance:", getRewardBalance(testAddress))

console.log("\n✅ Rewards system test completed!")