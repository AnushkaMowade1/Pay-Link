// Shardeum network configuration
export const SHARDEUM_CONFIG = {
  chainId: "0x1F90", // 8080 in hex
  chainName: "Shardeum Unstablenet",
  nativeCurrency: {
    name: "Shardeum",
    symbol: "SHM",
    decimals: 18,
  },
  rpcUrls: ["https://api-unstable.shardeum.org"],
  blockExplorerUrls: ["https://explorer-unstable.shardeum.org"],
}

// MetaMask integration utilities
export const addShardeumNetwork = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [SHARDEUM_CONFIG],
      })
      return true
    } catch (error) {
      console.error("Failed to add Shardeum network:", error)
      return false
    }
  }
  return false
}

export const switchToShardeum = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SHARDEUM_CONFIG.chainId }],
      })
      return true
    } catch (error) {
      console.error("Failed to switch to Shardeum network:", error)
      return false
    }
  }
  return false
}

export const connectWallet = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      return accounts[0]
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      return null
    }
  }
  return null
}

export const getBalance = async (address: string) => {
  if (typeof window.ethereum !== "undefined") {
    try {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })
      // Convert from wei to SHM
      return Number.parseInt(balance, 16) / Math.pow(10, 18)
    } catch (error) {
      console.error("Failed to get balance:", error)
      return 0
    }
  }
  return 0
}

export const sendTransaction = async (to: string, amount: number) => {
  if (typeof window.ethereum !== "undefined") {
    try {
      // Get current account
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      if (!accounts || accounts.length === 0) {
        throw new Error("No wallet connected")
      }

      const amountInWei = BigInt(Math.floor(amount * Math.pow(10, 18))).toString(16)

      const gasPrice = await window.ethereum.request({
        method: "eth_gasPrice",
        params: [],
      })

      console.log("[v0] Sending transaction:", {
        from: accounts[0],
        to,
        value: `0x${amountInWei}`,
        gas: "0x5208", // 21000 gas limit
        gasPrice,
      })

      const transactionHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: accounts[0], // Added from address
            to,
            value: `0x${amountInWei}`,
            gas: "0x5208", // 21000 gas limit for simple transfers
            gasPrice, // Use network gas price
          },
        ],
      })

      console.log("[v0] Transaction sent:", transactionHash)
      return transactionHash
    } catch (error) {
      console.error("Failed to send transaction:", error)
      throw error
    }
  }
  throw new Error("MetaMask not available")
}

export const getTransactionStatus = async (hash: string) => {
  if (typeof window.ethereum !== "undefined") {
    try {
      const receipt = await window.ethereum.request({
        method: "eth_getTransactionReceipt",
        params: [hash],
      })

      if (receipt) {
        return receipt.status === "0x1" ? "completed" : "failed"
      }
      return "pending"
    } catch (error) {
      console.error("Failed to get transaction status:", error)
      return "unknown"
    }
  }
  return "unknown"
}

export const estimateGas = async (to: string, amount: number) => {
  if (typeof window.ethereum !== "undefined") {
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      if (!accounts || accounts.length === 0) {
        return { gasLimit: 21000, gasPrice: "0x9184e72a000", estimatedFee: 0.001 }
      }

      const amountInWei = BigInt(Math.floor(amount * Math.pow(10, 18))).toString(16)

      const gasPrice = await window.ethereum.request({
        method: "eth_gasPrice",
        params: [],
      })

      const gasLimit = await window.ethereum.request({
        method: "eth_estimateGas",
        params: [
          {
            from: accounts[0],
            to,
            value: `0x${amountInWei}`,
          },
        ],
      })

      const gasPriceDecimal = Number.parseInt(gasPrice, 16)
      const gasLimitDecimal = Number.parseInt(gasLimit, 16)
      const estimatedFee = (gasPriceDecimal * gasLimitDecimal) / Math.pow(10, 18)

      return {
        gasLimit: gasLimitDecimal,
        gasPrice,
        estimatedFee: Math.max(estimatedFee, 0.0001), // Minimum fee display
      }
    } catch (error) {
      console.error("Failed to estimate gas:", error)
      // Return default values for Shardeum (very low fees)
      return { gasLimit: 21000, gasPrice: "0x9184e72a000", estimatedFee: 0.0001 }
    }
  }
  return { gasLimit: 21000, gasPrice: "0x9184e72a000", estimatedFee: 0.0001 }
}

interface Transaction {
  id: string
  timestamp: Date
  hash: string
  status: string
  // other transaction properties
}

export const pollTransactionStatus = async (hash: string, maxAttempts = 30): Promise<string> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await getTransactionStatus(hash)

    if (status === "completed" || status === "failed") {
      return status
    }

    // Wait 2 seconds before next attempt
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  return "pending" // Still pending after max attempts
}

export const updateTransactionStatus = (address: string, transactionHash: string, newStatus: string) => {
  try {
    const existingTransactions = localStorage.getItem(`paylink_transactions_${address}`)
    if (!existingTransactions) return

    const transactions = JSON.parse(existingTransactions)
    const updatedTransactions = transactions.map((tx: any) =>
      tx.hash === transactionHash ? { ...tx, status: newStatus } : tx,
    )

    localStorage.setItem(`paylink_transactions_${address}`, JSON.stringify(updatedTransactions))
    console.log("[v0] Updated transaction status:", transactionHash, "to", newStatus)
  } catch (error) {
    console.error("Failed to update transaction status:", error)
  }
}

export const storeTransaction = (address: string, transaction: Transaction) => {
  try {
    const existingTransactions = localStorage.getItem(`paylink_transactions_${address}`)
    const transactions = existingTransactions ? JSON.parse(existingTransactions) : []

    // Add new transaction
    transactions.unshift({
      ...transaction,
      timestamp: transaction.timestamp.toISOString(),
    })

    // Keep only last 100 transactions
    const limitedTransactions = transactions.slice(0, 100)

    localStorage.setItem(`paylink_transactions_${address}`, JSON.stringify(limitedTransactions))
    console.log("[v0] Stored transaction:", transaction.id)

    if (transaction.status === "pending") {
      pollTransactionStatus(transaction.hash).then((finalStatus) => {
        if (finalStatus !== "pending") {
          updateTransactionStatus(address, transaction.hash, finalStatus)
        }
      })
    }
  } catch (error) {
    console.error("Failed to store transaction:", error)
  }
}

export const fetchTransactionHistory = async (address: string): Promise<Transaction[]> => {
  if (typeof window.ethereum !== "undefined") {
    try {
      // Get the latest block number
      const latestBlock = await window.ethereum.request({
        method: "eth_blockNumber",
        params: [],
      })

      const latestBlockNumber = Number.parseInt(latestBlock, 16)
      const fromBlock = Math.max(0, latestBlockNumber - 1000) // Last 1000 blocks

      console.log("[v0] Fetching transaction history for:", address, "from block:", fromBlock)

      // Get transaction logs for the address
      const logs = await window.ethereum.request({
        method: "eth_getLogs",
        params: [
          {
            fromBlock: `0x${fromBlock.toString(16)}`,
            toBlock: "latest",
            address: null, // Get all transactions
            topics: null,
          },
        ],
      })

      console.log("[v0] Found logs:", logs?.length || 0)

      const storedTransactions = localStorage.getItem(`paylink_transactions_${address}`)
      if (storedTransactions) {
        const parsed = JSON.parse(storedTransactions)
        const transactions = parsed.map((tx: any) => ({
          ...tx,
          timestamp: new Date(tx.timestamp),
        }))

        const pendingTransactions = transactions.filter((tx: any) => tx.status === "pending")
        for (const tx of pendingTransactions) {
          const currentStatus = await getTransactionStatus(tx.hash)
          if (currentStatus !== "pending" && currentStatus !== tx.status) {
            updateTransactionStatus(address, tx.hash, currentStatus)
            tx.status = currentStatus
          }
        }

        return transactions
      }

      return []
    } catch (error) {
      console.error("Failed to fetch transaction history:", error)

      const storedTransactions = localStorage.getItem(`paylink_transactions_${address}`)
      if (storedTransactions) {
        const parsed = JSON.parse(storedTransactions)
        return parsed.map((tx: any) => ({
          ...tx,
          timestamp: new Date(tx.timestamp),
        }))
      }

      return []
    }
  }
  return []
}
