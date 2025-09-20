"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, AlertTriangle } from "lucide-react"
import { sendTransaction } from "@/lib/shardeum"
import { useWallet } from "@/hooks/use-wallet"
import { usePassword } from "@/hooks/use-password"
import { storeTransaction } from "@/lib/shardeum"
import { PasswordSetupDialog } from "@/components/auth/password-setup-dialog"
import { PasswordVerifyDialog } from "@/components/auth/password-verify-dialog"

interface WithdrawDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentBalance: number
  onWithdrawSuccess: () => void
}

export function WithdrawDialog({ open, onOpenChange, currentBalance, onWithdrawSuccess }: WithdrawDialogProps) {
  const { address } = useWallet()
  const { isPasswordSet } = usePassword()
  const [recipientAddress, setRecipientAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPasswordSetup, setShowPasswordSetup] = useState(false)
  const [showPasswordVerify, setShowPasswordVerify] = useState(false)

  const maxAmount = Math.max(0, currentBalance - 0.001) // Reserve for gas fees

  const handleWithdraw = async () => {
    if (!address) return

    setError("")

    // Validate form first
    const withdrawAmount = Number.parseFloat(amount)

    if (withdrawAmount <= 0) {
      setError("Amount must be greater than 0")
      return
    }

    if (withdrawAmount > maxAmount) {
      setError(`Insufficient balance. Maximum: ${maxAmount.toFixed(4)} SHM`)
      return
    }

    if (!recipientAddress || recipientAddress.length !== 42) {
      setError("Please enter a valid Ethereum address")
      return
    }

    // Check if password is set, if not, prompt to set it
    if (!isPasswordSet) {
      setShowPasswordSetup(true)
      return
    }

    // Show password verification dialog
    setShowPasswordVerify(true)
  }

  const handlePasswordSetupComplete = () => {
    setShowPasswordSetup(false)
    // After setting password, show verification dialog
    setShowPasswordVerify(true)
  }

  const handlePasswordVerified = async () => {
    setShowPasswordVerify(false)
    setIsLoading(true)

    try {
      const withdrawAmount = Number.parseFloat(amount)

      console.log("[v0] Initiating withdrawal:", { recipientAddress, amount: withdrawAmount })

      const transactionHash = await sendTransaction(recipientAddress, withdrawAmount)

      console.log("[v0] Withdrawal successful:", transactionHash)

      // Store transaction
      const transaction = {
        id: transactionHash,
        from: address,
        to: recipientAddress,
        amount: withdrawAmount,
        timestamp: new Date(),
        status: "pending" as const,
        hash: transactionHash,
        type: "send" as const,
        note: "Withdrawal",
      }

      storeTransaction(address!, transaction)

      onWithdrawSuccess()
      onOpenChange(false)

      // Reset form
      setRecipientAddress("")
      setAmount("")
    } catch (error) {
      console.error("[v0] Withdrawal failed:", error)
      setError(error instanceof Error ? error.message : "Withdrawal failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5" />
            Withdraw Funds
          </DialogTitle>
          <DialogDescription>Send SHM from your wallet to another address</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">{currentBalance.toFixed(4)} SHM</div>
                <div className="text-sm text-muted-foreground">Available Balance</div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (SHM)</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.0000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.0001"
                  min="0"
                  max={maxAmount}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2 text-xs"
                  onClick={() => setAmount(maxAmount.toString())}
                >
                  MAX
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Maximum: {maxAmount.toFixed(4)} SHM (reserves 0.001 SHM for gas)
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleWithdraw} disabled={isLoading || !recipientAddress || !amount} className="flex-1">
              {isLoading ? "Withdrawing..." : "Withdraw"}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Password Setup Dialog */}
      <PasswordSetupDialog 
        open={showPasswordSetup}
        onOpenChange={setShowPasswordSetup}
        onPasswordSet={handlePasswordSetupComplete}
      />

      {/* Password Verification Dialog */}
      <PasswordVerifyDialog
        open={showPasswordVerify}
        onOpenChange={setShowPasswordVerify}
        onVerified={handlePasswordVerified}
        title="Authorize Withdrawal"
        description="Enter your password to authorize this withdrawal transaction"
      />
    </Dialog>
  )
}
