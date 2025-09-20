// Split Bill utility functions for PayLink

export interface SplitBillParticipant {
  id: string
  name: string
  address: string
  amount: number
  isPaid: boolean
  transactionHash?: string
}

export interface SplitBill {
  id: string
  title: string
  description?: string
  totalAmount: number
  createdBy: string
  createdAt: Date
  participants: SplitBillParticipant[]
  splitMethod: "equal" | "custom"
  status: "pending" | "processing" | "completed" | "failed"
  completedAt?: Date
}

// Local storage keys
const SPLIT_BILLS_STORAGE_KEY = "PayLink_split_bills_"

/**
 * Calculate equal split amounts for participants
 */
export const calculateEqualSplit = (totalAmount: number, participantCount: number): number => {
  if (participantCount === 0) return 0
  return parseFloat((totalAmount / participantCount).toFixed(4))
}

/**
 * Validate split bill data
 */
export const validateSplitBill = (
  title: string,
  totalAmount: number,
  participants: SplitBillParticipant[]
): string | null => {
  if (!title.trim()) {
    return "Please enter a bill title"
  }

  if (!totalAmount || totalAmount <= 0) {
    return "Please enter a valid total amount"
  }

  if (participants.length === 0) {
    return "Please add at least one participant"
  }

  // Check for duplicate addresses
  const addresses = participants.map(p => p.address.toLowerCase())
  const uniqueAddresses = new Set(addresses)
  if (addresses.length !== uniqueAddresses.size) {
    return "Duplicate wallet addresses found"
  }

  // Validate addresses format
  for (const participant of participants) {
    if (!participant.address.startsWith("0x") || participant.address.length !== 42) {
      return `Invalid wallet address for ${participant.name}`
    }
    if (participant.amount <= 0) {
      return `Invalid amount for ${participant.name}`
    }
  }

  // Check if split amounts match total
  const splitTotal = participants.reduce((sum, p) => sum + p.amount, 0)
  if (Math.abs(totalAmount - splitTotal) > 0.01) {
    return `Split amounts (${splitTotal.toFixed(4)} SHM) don't match total (${totalAmount} SHM)`
  }

  return null
}

/**
 * Create a new split bill
 */
export const createSplitBill = (
  title: string,
  totalAmount: number,
  participants: SplitBillParticipant[],
  createdBy: string,
  description?: string,
  splitMethod: "equal" | "custom" = "equal"
): SplitBill => {
  return {
    id: `split_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    description,
    totalAmount,
    createdBy,
    createdAt: new Date(),
    participants,
    splitMethod,
    status: "pending"
  }
}

/**
 * Save split bill to local storage
 */
export const saveSplitBill = (splitBill: SplitBill): void => {
  try {
    const storageKey = `${SPLIT_BILLS_STORAGE_KEY}${splitBill.createdBy.toLowerCase()}`
    const existingBills = getSplitBills(splitBill.createdBy)
    
    // Add new bill to the beginning of the array
    const updatedBills = [splitBill, ...existingBills]
    
    // Keep only last 50 split bills
    if (updatedBills.length > 50) {
      updatedBills.splice(50)
    }
    
    localStorage.setItem(storageKey, JSON.stringify(updatedBills))
    console.log(`[SplitBill] Saved split bill: ${splitBill.title}`)
  } catch (error) {
    console.error("Failed to save split bill:", error)
  }
}

/**
 * Get all split bills for a user
 */
export const getSplitBills = (userAddress: string): SplitBill[] => {
  try {
    const storageKey = `${SPLIT_BILLS_STORAGE_KEY}${userAddress.toLowerCase()}`
    const storedBills = localStorage.getItem(storageKey)
    
    if (!storedBills) return []
    
    const bills: SplitBill[] = JSON.parse(storedBills)
    
    // Convert date strings back to Date objects
    return bills.map(bill => ({
      ...bill,
      createdAt: new Date(bill.createdAt),
      completedAt: bill.completedAt ? new Date(bill.completedAt) : undefined
    }))
  } catch (error) {
    console.error("Failed to get split bills:", error)
    return []
  }
}

/**
 * Update split bill status
 */
export const updateSplitBillStatus = (
  userAddress: string,
  splitBillId: string,
  status: SplitBill["status"],
  participants?: SplitBillParticipant[]
): void => {
  try {
    const bills = getSplitBills(userAddress)
    const billIndex = bills.findIndex(bill => bill.id === splitBillId)
    
    if (billIndex === -1) {
      console.error("Split bill not found:", splitBillId)
      return
    }
    
    bills[billIndex].status = status
    if (participants) {
      bills[billIndex].participants = participants
    }
    if (status === "completed") {
      bills[billIndex].completedAt = new Date()
    }
    
    const storageKey = `${SPLIT_BILLS_STORAGE_KEY}${userAddress.toLowerCase()}`
    localStorage.setItem(storageKey, JSON.stringify(bills))
    
    console.log(`[SplitBill] Updated status for ${splitBillId} to ${status}`)
  } catch (error) {
    console.error("Failed to update split bill status:", error)
  }
}

/**
 * Get split bill statistics for a user
 */
export const getSplitBillStats = (userAddress: string) => {
  const bills = getSplitBills(userAddress)
  
  const stats = {
    total: bills.length,
    pending: bills.filter(b => b.status === "pending").length,
    processing: bills.filter(b => b.status === "processing").length,
    completed: bills.filter(b => b.status === "completed").length,
    failed: bills.filter(b => b.status === "failed").length,
    totalAmount: bills.reduce((sum, b) => sum + b.totalAmount, 0),
    totalParticipants: bills.reduce((sum, b) => sum + b.participants.length, 0)
  }
  
  return stats
}

/**
 * Clear all split bills for a user (for testing/debugging)
 */
export const clearSplitBills = (userAddress: string): void => {
  try {
    const storageKey = `${SPLIT_BILLS_STORAGE_KEY}${userAddress.toLowerCase()}`
    localStorage.removeItem(storageKey)
    console.log(`[SplitBill] Cleared all split bills for ${userAddress}`)
  } catch (error) {
    console.error("Failed to clear split bills:", error)
  }
}

/**
 * Format participant list for display
 */
export const formatParticipants = (participants: SplitBillParticipant[]): string => {
  if (participants.length === 0) return "No participants"
  if (participants.length === 1) return participants[0].name
  if (participants.length === 2) return `${participants[0].name} and ${participants[1].name}`
  
  return `${participants[0].name}, ${participants[1].name} and ${participants.length - 2} others`
}

/**
 * Get the success rate for split bills
 */
export const getSplitBillSuccessRate = (userAddress: string): number => {
  const bills = getSplitBills(userAddress)
  if (bills.length === 0) return 0
  
  const completed = bills.filter(b => b.status === "completed").length
  return Math.round((completed / bills.length) * 100)
}