"use client"

import { useState, useEffect } from "react"
import { useWallet } from "./use-wallet"

interface PasswordState {
  isPasswordSet: boolean
  isLoading: boolean
}

export function usePassword() {
  const { address } = useWallet()
  const [passwordState, setPasswordState] = useState<PasswordState>({
    isPasswordSet: false,
    isLoading: true,
  })

  useEffect(() => {
    checkPasswordStatus()
  }, [address])

  const checkPasswordStatus = async () => {
    if (!address) {
      setPasswordState({ isPasswordSet: false, isLoading: false })
      return
    }

    try {
      // Check if password hash exists in localStorage for this wallet address
      const passwordHash = localStorage.getItem(`payfi_password_${address.toLowerCase()}`)
      setPasswordState({
        isPasswordSet: !!passwordHash,
        isLoading: false,
      })
    } catch (error) {
      console.error("Error checking password status:", error)
      setPasswordState({ isPasswordSet: false, isLoading: false })
    }
  }

  const hashPassword = async (password: string, salt: string): Promise<string> => {
    // Create a secure hash using Web Crypto API
    const encoder = new TextEncoder()
    const data = encoder.encode(password + salt + address?.toLowerCase())
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    return hashHex
  }

  const generateSalt = (): string => {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  const setPassword = async (password: string): Promise<boolean> => {
    if (!address) {
      throw new Error("Wallet not connected")
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long")
    }

    try {
      const salt = generateSalt()
      const hashedPassword = await hashPassword(password, salt)
      
      // Store both salt and hash
      const passwordData = {
        hash: hashedPassword,
        salt: salt,
        timestamp: Date.now(),
      }

      localStorage.setItem(`payfi_password_${address.toLowerCase()}`, JSON.stringify(passwordData))
      
      setPasswordState({ isPasswordSet: true, isLoading: false })
      return true
    } catch (error) {
      console.error("Error setting password:", error)
      throw error
    }
  }

  const verifyPassword = async (password: string): Promise<boolean> => {
    if (!address) {
      throw new Error("Wallet not connected")
    }

    try {
      const storedData = localStorage.getItem(`payfi_password_${address.toLowerCase()}`)
      if (!storedData) {
        throw new Error("No password set for this wallet")
      }

      const passwordData = JSON.parse(storedData)
      const { hash: storedHash, salt } = passwordData
      
      const inputHash = await hashPassword(password, salt)
      
      return inputHash === storedHash
    } catch (error) {
      console.error("Error verifying password:", error)
      throw error
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!address) {
      throw new Error("Wallet not connected")
    }

    try {
      // Verify current password first
      const isCurrentValid = await verifyPassword(currentPassword)
      if (!isCurrentValid) {
        throw new Error("Current password is incorrect")
      }

      // Set new password
      return await setPassword(newPassword)
    } catch (error) {
      console.error("Error changing password:", error)
      throw error
    }
  }

  const removePassword = async (password: string): Promise<boolean> => {
    if (!address) {
      throw new Error("Wallet not connected")
    }

    try {
      // Verify password first
      const isValid = await verifyPassword(password)
      if (!isValid) {
        throw new Error("Password is incorrect")
      }

      localStorage.removeItem(`payfi_password_${address.toLowerCase()}`)
      setPasswordState({ isPasswordSet: false, isLoading: false })
      return true
    } catch (error) {
      console.error("Error removing password:", error)
      throw error
    }
  }

  return {
    isPasswordSet: passwordState.isPasswordSet,
    isLoading: passwordState.isLoading,
    setPassword,
    verifyPassword,
    changePassword,
    removePassword,
    checkPasswordStatus,
  }
}