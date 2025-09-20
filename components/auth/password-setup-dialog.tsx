"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Lock, Shield, CheckCircle, AlertCircle } from "lucide-react"
import { usePassword } from "@/hooks/use-password"
import { useWallet } from "@/hooks/use-wallet"

interface PasswordSetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPasswordSet?: () => void
}

export function PasswordSetupDialog({ open, onOpenChange, onPasswordSet }: PasswordSetupDialogProps) {
  const { isConnected } = useWallet()
  const { setPassword, isPasswordSet } = usePassword()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  })

  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (!isConnected) {
        throw new Error("Please connect your wallet first")
      }

      if (passwordForm.password !== passwordForm.confirmPassword) {
        throw new Error("Passwords do not match")
      }

      if (passwordForm.password.length < 8) {
        throw new Error("Password must be at least 8 characters long")
      }

      // Check password strength
      const hasLowerCase = /[a-z]/.test(passwordForm.password)
      const hasUpperCase = /[A-Z]/.test(passwordForm.password)
      const hasNumbers = /\d/.test(passwordForm.password)
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.password)

      if (!hasLowerCase || !hasUpperCase || !hasNumbers || !hasSpecialChar) {
        throw new Error("Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character")
      }

      await setPassword(passwordForm.password)
      setSuccess(true)
      
      setTimeout(() => {
        onPasswordSet?.()
        onOpenChange(false)
        setPasswordForm({ password: "", confirmPassword: "" })
        setSuccess(false)
      }, 2000)

    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++

    if (score < 2) return { level: "Weak", color: "text-red-500", bg: "bg-red-500" }
    if (score < 4) return { level: "Medium", color: "text-yellow-500", bg: "bg-yellow-500" }
    return { level: "Strong", color: "text-green-500", bg: "bg-green-500" }
  }

  const passwordStrength = getPasswordStrength(passwordForm.password)

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Password Set Successfully!</h3>
            <p className="text-muted-foreground">
              Your payment password has been securely stored. You can now make transactions.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">Set Payment Password</DialogTitle>
              <DialogDescription>
                Create a secure password for transaction authorization
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Security Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm leading-relaxed">
              Your password is encrypted and stored locally using Web3 security standards. 
              It will be required for all payment transactions and cannot be recovered if lost.
            </CardDescription>
          </CardContent>
        </Card>

        <form onSubmit={handlePasswordSetup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={passwordForm.password}
                onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                placeholder="Enter a strong password"
                className="pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {passwordForm.password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Password Strength:</span>
                  <span className={passwordStrength.color}>{passwordStrength.level}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${passwordStrength.bg} h-2 rounded-full transition-all duration-300`}
                    style={{ width: passwordStrength.level === "Weak" ? "33%" : passwordStrength.level === "Medium" ? "66%" : "100%" }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                className="pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-amber-800">Important Security Notes:</h4>
                <ul className="text-sm text-amber-700 mt-1 space-y-1">
                  <li>• Your password cannot be recovered if lost</li>
                  <li>• Use a unique password not used elsewhere</li>
                  <li>• Password is required for all transactions</li>
                  <li>• Consider using a password manager</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              disabled={isLoading || !passwordForm.password || !passwordForm.confirmPassword}
            >
              {isLoading ? "Setting Password..." : "Set Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}