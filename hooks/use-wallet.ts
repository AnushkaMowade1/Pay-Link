"use client"

import { useState, useEffect, useCallback } from "react"
import { addShardeumNetwork, switchToShardeum, connectWallet, getBalance, SHARDEUM_CONFIG } from "@/lib/shardeum"

interface WalletState {
  isConnected: boolean
  address: string | null
  balance: number
  chainId: string | null
  isLoading: boolean
  error: string | null
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: 0,
    chainId: null,
    isLoading: false,
    error: null,
  })

  const updateBalance = useCallback(async (address: string) => {
    try {
      const balance = await getBalance(address)
      setWalletState((prev) => ({ ...prev, balance }))
    } catch (error) {
      console.error("Failed to update balance:", error)
    }
  }, [])

  const checkConnection = useCallback(async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        const chainId = await window.ethereum.request({ method: "eth_chainId" })

        console.log("[v0] Current chainId:", chainId, "Expected:", SHARDEUM_CONFIG.chainId)

        if (accounts.length > 0) {
          setWalletState((prev) => ({
            ...prev,
            isConnected: true,
            address: accounts[0],
            chainId,
          }))
          await updateBalance(accounts[0])
        } else {
          setWalletState((prev) => ({
            ...prev,
            isConnected: false,
            address: null,
            chainId,
          }))
        }
      } catch (error) {
        console.error("Failed to check connection:", error)
      }
    }
  }, [updateBalance])

  const connect = async () => {
    setWalletState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.")
      }

      // Connect to wallet
      const address = await connectWallet()
      if (!address) {
        throw new Error("Failed to connect to wallet")
      }

      // Check current network
      const chainId = await window.ethereum.request({ method: "eth_chainId" })
      console.log("[v0] Connected with chainId:", chainId)

      if (chainId !== SHARDEUM_CONFIG.chainId) {
        console.log("[v0] Switching to Shardeum network...")
        const switched = await switchToShardeum()
        if (!switched) {
          console.log("[v0] Switch failed, trying to add network...")
          const added = await addShardeumNetwork()
          if (!added) {
            throw new Error("Failed to add Shardeum network to MetaMask")
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 1000))

        const newChainId = await window.ethereum.request({ method: "eth_chainId" })
        console.log("[v0] Network switched to:", newChainId)

        setWalletState((prev) => ({
          ...prev,
          isConnected: true,
          address,
          chainId: newChainId,
          isLoading: false,
        }))
      } else {
        setWalletState((prev) => ({
          ...prev,
          isConnected: true,
          address,
          chainId,
          isLoading: false,
        }))
      }

      // Get balance
      await updateBalance(address)
    } catch (error) {
      setWalletState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to connect wallet",
      }))
    }
  }

  const disconnect = () => {
    setWalletState({
      isConnected: false,
      address: null,
      balance: 0,
      chainId: null,
      isLoading: false,
      error: null,
    })
  }

  const refreshBalance = async () => {
    if (walletState.address) {
      await updateBalance(walletState.address)
    }
  }

  // Listen for account and network changes
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("[v0] Accounts changed:", accounts)
        if (accounts.length === 0) {
          disconnect()
        } else {
          setWalletState((prev) => ({ ...prev, address: accounts[0] }))
          updateBalance(accounts[0])
        }
      }

      const handleChainChanged = async (chainId: string) => {
        console.log("[v0] Chain changed to:", chainId)
        setWalletState((prev) => ({ ...prev, chainId }))

        await checkConnection()
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      // Check initial connection
      checkConnection()

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [checkConnection, updateBalance])

  return {
    ...walletState,
    connect,
    disconnect,
    refreshBalance,
    isOnShardeumNetwork: walletState.chainId?.toLowerCase() === SHARDEUM_CONFIG.chainId.toLowerCase(),
  }
}
