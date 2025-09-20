// Test script for split bill functionality
console.log("Testing split bill system...")

// Import the utility functions (simulate)
// In a real test, you'd import from the actual module

// Mock the split bill logic
const participants = [
  { id: "1", name: "Alice", address: "0x1111111111111111111111111111111111111111", amount: 0, isPaid: false },
  { id: "2", name: "Bob", address: "0x2222222222222222222222222222222222222222", amount: 0, isPaid: false },
  { id: "3", name: "Charlie", address: "0x3333333333333333333333333333333333333333", amount: 0, isPaid: false }
]

function calculateEqualSplit(totalAmount, participantCount) {
  if (participantCount === 0) return 0
  return parseFloat((totalAmount / participantCount).toFixed(4))
}

function validateSplitBill(title, totalAmount, participants) {
  if (!title.trim()) return "Please enter a bill title"
  if (!totalAmount || totalAmount <= 0) return "Please enter a valid total amount"
  if (participants.length === 0) return "Please add at least one participant"
  
  // Validate addresses
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

function createSplitBill(title, totalAmount, participants, createdBy, description, splitMethod) {
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

// Test the split bill functionality
console.log("\n1. Test Equal Split Calculation:")
const totalAmount = 100
const equalAmount = calculateEqualSplit(totalAmount, participants.length)
console.log(`Total: ${totalAmount} SHM`)
console.log(`Participants: ${participants.length}`)
console.log(`Equal split amount: ${equalAmount} SHM each`)

// Set equal amounts
participants.forEach(p => { p.amount = equalAmount })

console.log("\n2. Test Split Bill Validation:")
const validationResult = validateSplitBill("Dinner Bill", totalAmount, participants)
console.log(`Validation result: ${validationResult || "✅ Valid"}`)

console.log("\n3. Test Split Bill Creation:")
const splitBill = createSplitBill(
  "Dinner Bill",
  totalAmount,
  participants,
  "0x1234567890abcdef1234567890abcdef12345678",
  "Restaurant dinner with friends",
  "equal"
)

console.log(`Created split bill:`)
console.log(`- ID: ${splitBill.id}`)
console.log(`- Title: ${splitBill.title}`)
console.log(`- Total: ${splitBill.totalAmount} SHM`)
console.log(`- Participants: ${splitBill.participants.length}`)
console.log(`- Status: ${splitBill.status}`)

console.log("\n4. Test Participant Details:")
splitBill.participants.forEach((p, index) => {
  console.log(`${index + 1}. ${p.name}: ${p.amount} SHM (${p.address.substring(0, 8)}...)`)
})

console.log("\n5. Test Custom Split:")
const customParticipants = [
  { id: "1", name: "Alice", address: "0x1111111111111111111111111111111111111111", amount: 40, isPaid: false },
  { id: "2", name: "Bob", address: "0x2222222222222222222222222222222222222222", amount: 35, isPaid: false },
  { id: "3", name: "Charlie", address: "0x3333333333333333333333333333333333333333", amount: 25, isPaid: false }
]

const customValidation = validateSplitBill("Custom Split Bill", 100, customParticipants)
console.log(`Custom split validation: ${customValidation || "✅ Valid"}`)

console.log("\n6. Test Invalid Cases:")
// Test invalid title
const invalidTitle = validateSplitBill("", 100, participants)
console.log(`Empty title: ${invalidTitle}`)

// Test invalid amount
const invalidAmount = validateSplitBill("Test", 0, participants)
console.log(`Zero amount: ${invalidAmount}`)

// Test no participants
const noParticipants = validateSplitBill("Test", 100, [])
console.log(`No participants: ${noParticipants}`)

// Test mismatched total
const mismatchedTotal = validateSplitBill("Test", 100, [
  { id: "1", name: "Alice", address: "0x1111111111111111111111111111111111111111", amount: 50, isPaid: false },
  { id: "2", name: "Bob", address: "0x2222222222222222222222222222222222222222", amount: 60, isPaid: false }
])
console.log(`Mismatched total: ${mismatchedTotal}`)

console.log("\n✅ Split bill system test completed!")
console.log("Ready for integration testing in the webapp!")