// Mock Reward system for PayLink Demo
// In production, this would integrate with deployed smart contracts

// Reward calculation: 10 RWD per 1 SHM sent
export const REWARD_RATE = 10

// Conversion rate: 100 RWD = 1 SHM
export const CONVERSION_RATE = 100

// Local storage keys for mock rewards system
const REWARDS_STORAGE_KEY = "PayLink_rewards_"
const REWARDS_HISTORY_KEY = "PayLink_rewards_history_"

interface RewardTransaction {
  id: string
  type: "earned" | "redeemed"
  amount: number
  paymentAmount?: number
  timestamp: Date
  transactionHash?: string
}

/**
 * Get reward token balance for an address (Mock implementation)
 */
export const getRewardBalance = async (address: string): Promise<number> => {
  if (!address) {
    console.log("[v0] No address provided for reward balance")
    return 0
  }

  try {
    // Check localStorage for mock rewards balance
    const storedBalance = localStorage.getItem(`${REWARDS_STORAGE_KEY}${address.toLowerCase()}`)
    const balance = storedBalance ? parseFloat(storedBalance) : 0
    
    console.log(`[v0] Reward balance for ${address}: ${balance} RWD`)
    return balance
  } catch (error) {
    console.error("Failed to get reward balance:", error)
    return 0
  }
}

/**
 * Set reward balance (internal helper)
 */
const setRewardBalance = (address: string, balance: number): void => {
  localStorage.setItem(`${REWARDS_STORAGE_KEY}${address.toLowerCase()}`, balance.toString())
}

/**
 * Add a reward transaction to history
 */
const addRewardTransaction = (address: string, transaction: RewardTransaction): void => {
  try {
    const historyKey = `${REWARDS_HISTORY_KEY}${address.toLowerCase()}`
    const existingHistory = localStorage.getItem(historyKey)
    const history: RewardTransaction[] = existingHistory ? JSON.parse(existingHistory) : []
    
    history.unshift(transaction) // Add to beginning
    
    // Keep only last 100 transactions
    if (history.length > 100) {
      history.splice(100)
    }
    
    localStorage.setItem(historyKey, JSON.stringify(history))
  } catch (error) {
    console.error("Failed to save reward transaction:", error)
  }
}

/**
 * Get reward transaction history
 */
export const getRewardHistory = (address: string): RewardTransaction[] => {
  try {
    const historyKey = `${REWARDS_HISTORY_KEY}${address.toLowerCase()}`
    const existingHistory = localStorage.getItem(historyKey)
    return existingHistory ? JSON.parse(existingHistory) : []
  } catch (error) {
    console.error("Failed to get reward history:", error)
    return []
  }
}

/**
 * Mint rewards after a successful payment (Mock implementation)
 */
export const mintRewardsForPayment = async (
  senderAddress: string,
  paymentAmount: number,
  transactionHash: string,
): Promise<boolean> => {
  if (!senderAddress || paymentAmount <= 0) {
    console.log("[v0] Invalid parameters for reward minting")
    return false
  }

  try {
    // Calculate reward amount: 10 RWD per 1 SHM
    const rewardAmount = paymentAmount * REWARD_RATE
    
    // Get current balance
    const currentBalance = await getRewardBalance(senderAddress)
    const newBalance = currentBalance + rewardAmount
    
    // Update balance
    setRewardBalance(senderAddress, newBalance)
    
    // Add to transaction history
    const transaction: RewardTransaction = {
      id: `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "earned",
      amount: rewardAmount,
      paymentAmount,
      timestamp: new Date(),
      transactionHash,
    }
    
    addRewardTransaction(senderAddress, transaction)

    console.log(`[v0] Rewards minted successfully: ${rewardAmount} RWD for ${paymentAmount} SHM payment`)
    return true
  } catch (error) {
    console.error("Failed to mint rewards:", error)
    return false
  }
}

/**
 * Calculate SHM amount for given RWD amount
 */
export const calculateShmAmount = (rwdAmount: number): number => {
  return rwdAmount / CONVERSION_RATE
}

/**
 * Redeem RWD tokens for SHM (Mock implementation)
 */
export const redeemRewards = async (
  address: string,
  rwdAmount: number
): Promise<{ success: boolean; shmAmount?: number; transactionHash?: string; error?: string }> => {
  if (!address || rwdAmount <= 0) {
    return { success: false, error: "Invalid parameters" }
  }

  try {
    // Get current balance
    const currentBalance = await getRewardBalance(address)
    
    if (currentBalance < rwdAmount) {
      return { success: false, error: "Insufficient reward balance" }
    }
    
    // Calculate SHM amount
    const shmAmount = calculateShmAmount(rwdAmount)
    
    // Update balance
    const newBalance = currentBalance - rwdAmount
    setRewardBalance(address, newBalance)
    
    // Generate mock transaction hash
    const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`
    
    // Add to transaction history
    const transaction: RewardTransaction = {
      id: `redeem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "redeemed",
      amount: rwdAmount,
      timestamp: new Date(),
      transactionHash,
    }
    
    addRewardTransaction(address, transaction)

    console.log(`[v0] Rewards redeemed successfully: ${rwdAmount} RWD → ${shmAmount} SHM`)
    
    return {
      success: true,
      shmAmount,
      transactionHash,
    }
  } catch (error) {
    console.error("Failed to redeem rewards:", error)
    return { success: false, error: "Redemption failed" }
  }
}

/**
 * Get conversion rate (how many RWD = 1 SHM)
 */
export const getConversionRate = (): number => {
  return CONVERSION_RATE
}

/**
 * Check if user has enough rewards to redeem
 */
export const canRedeem = async (address: string, rwdAmount: number): Promise<boolean> => {
  const balance = await getRewardBalance(address)
  return balance >= rwdAmount && rwdAmount > 0
}

/**
 * Get minimum redemption amount
 */
export const getMinimumRedemption = (): number => {
  return CONVERSION_RATE // Minimum 100 RWD (1 SHM)
}