"use client"

import { useState, useEffect } from "react"

interface User {
  email: string
  name: string
  isAuthenticated: boolean
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("paylink_user")
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
      } catch (error) {
        console.error("Failed to parse stored user data:", error)
        localStorage.removeItem("paylink_user")
      }
    }
    setIsLoading(false)
  }, [])

  const signin = (userData: User) => {
    localStorage.setItem("paylink_user", JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("paylink_user")
    setUser(null)
    window.location.reload()
  }

  return {
    user,
    isAuthenticated: !!user?.isAuthenticated,
    isLoading,
    signin, // Expose signin function
    logout,
  }
}
