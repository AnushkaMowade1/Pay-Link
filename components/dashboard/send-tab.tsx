"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Send, AlertCircle, CheckCircle, ExternalLink, Loader2 } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { usePassword } from "@/hooks/use-password"
import { sendTransaction, estimateGas, storeTransaction } from "@/lib/shardeum"
import { mintRewardsForPayment } from "@/lib/rewards"
import { PasswordSetupDialog } from "@/components/auth/password-setup-dialog"
import { PasswordVerifyDialog } from "@/components/auth/password-verify-dialog"

interface SendFormData {
  recipient: string
  amount: string
  note: string
}

export function SendTab() {
  const { isConnected, address, balance, isOnShardeumNetwork, refreshBalance } = useWallet()
  const { isPasswordSet, isLoading: passwordLoading } = usePassword()
  const [formData, setFormData] = useState<SendFormData>({
    recipient: "",
    amount: "",
    note: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showPasswordSetup, setShowPasswordSetup] = useState(false)
  const [showPasswordVerify, setShowPasswordVerify] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [estimatedFee, setEstimatedFee] = useState(0.0001)

  useEffect(() => {
    const estimateFees = async () => {
      if (formData.recipient && formData.amount && Number.parseFloat(formData.amount) > 0) {
        try {
          const gasEstimate = await estimateGas(formData.recipient, Number.parseFloat(formData.amount))
          setEstimatedFee(gasEstimate.estimatedFee)
        } catch (error) {
          console.error("Gas estimation failed:", error)
          setEstimatedFee(0.0001) // Fallback to minimum
        }
      }
    }

    const timeoutId = setTimeout(estimateFees, 500) // Debounce
    return () => clearTimeout(timeoutId)
  }, [formData.recipient, formData.amount])

  const validateForm = (): string | null => {
    if (!formData.recipient.trim()) {
      return "Recipient address is required"
    }

    if (!formData.recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
      return "Invalid recipient address format"
    }

    if (!formData.amount.trim()) {
      return "Amount is required"
    }

    const amount = Number.parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      return "Amount must be a positive number"
    }

    if (amount > balance) {
      return "Insufficient balance"
    }

    if (amount + estimatedFee > balance) {
      return `Insufficient balance for transaction + gas fees (${estimatedFee.toFixed(6)} SHM)`
    }

    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
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

  const handlePasswordVerified = () => {
    setShowPasswordVerify(false)
    setShowConfirmDialog(true)
  }

  const handleConfirmSend = async () => {
    setIsLoading(true)
    setShowConfirmDialog(false)

    try {
      const amount = Number.parseFloat(formData.amount)
      console.log("[v0] Initiating transaction:", { recipient: formData.recipient, amount })

      const hash = await sendTransaction(formData.recipient, amount)
      console.log("[v0] Transaction successful:", hash)

      if (address) {
        const transaction = {
          id: hash,
          from: address,
          to: formData.recipient,
          amount: amount,
          timestamp: new Date(),
          status: "pending" as const,
          hash: hash,
          type: "send" as const,
          note: formData.note || undefined,
        }

        storeTransaction(address, transaction)
        console.log("[v0] Transaction stored for history:", transaction.id)

        try {
          const rewardsMinted = await mintRewardsForPayment(address, amount, hash)
          if (rewardsMinted) {
            console.log("[v0] Rewards minted for payment:", amount * 10, "RWD")
          }
        } catch (rewardError) {
          console.error("[v0] Failed to mint rewards, but payment was successful:", rewardError)
          // Don't fail the entire transaction if reward minting fails
        }
      }

      setTransactionHash(hash)
      setShowSuccessDialog(true)

      setTimeout(() => {
        refreshBalance()
      }, 2000)

      // Reset form
      setFormData({
        recipient: "",
        amount: "",
        note: "",
      })
    } catch (error) {
      console.error("[v0] Transaction failed:", error)
      setError(error instanceof Error ? error.message : "Failed to send transaction")
    } finally {
      setIsLoading(false)
    }
  }

  const amount = Number.parseFloat(formData.amount) || 0
  const total = amount + estimatedFee

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Send Money</h2>
          <p className="text-muted-foreground">Connect your wallet to send SHM to other addresses</p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please connect your wallet to send money.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!isOnShardeumNetwork) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Send Money</h2>
          <p className="text-muted-foreground">Send SHM instantly with ultra-low fees</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You're not connected to Shardeum Unstablenet. Please switch networks in MetaMask to use PayLink features.{" "}
            <a
              href="https://docs.shardeum.org/docs/endpoints"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-destructive-foreground"
            >
              Learn how to add Shardeum network
            </a>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Send Money</h2>
        <p className="text-muted-foreground">Send SHM instantly with ultra-low fees on Shardeum</p>
      </div>

      {/* Balance Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{balance.toFixed(4)} SHM</div>
          <div className="text-sm text-muted-foreground">≈ ${(balance * 0.12).toFixed(2)} USD</div>
        </CardContent>
      </Card>

      {/* Send Form */}
      <Card>
        <CardHeader>
          <CardTitle>Send Payment</CardTitle>
          <CardDescription>Enter the recipient's address and amount to send</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                type="text"
                placeholder="0x..."
                value={formData.recipient}
                onChange={(e) => setFormData((prev) => ({ ...prev, recipient: e.target.value }))}
                className="font-mono"
                required
              />
              <p className="text-xs text-muted-foreground">Enter a valid Shardeum wallet address</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (SHM)</Label>
              <Input
                id="amount"
                type="number"
                step="0.0001"
                min="0"
                max={balance}
                placeholder="0.0000"
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                required
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Available: {balance.toFixed(4)} SHM</span>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, amount: Math.max(0, balance - estimatedFee).toFixed(4) }))
                  }
                >
                  Use Max
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Add a note for this transaction..."
                value={formData.note}
                onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Transaction Summary */}
            {amount > 0 && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Amount:</span>
                  <span>{amount.toFixed(4)} SHM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Network Fee:</span>
                  <span className="text-green-600">~{estimatedFee.toFixed(6)} SHM</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{total.toFixed(4)} SHM</span>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || !formData.recipient || !formData.amount}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Payment
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Transaction</DialogTitle>
            <DialogDescription>Please review the transaction details before confirming</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">To:</label>
                <div className="font-mono text-sm break-all">{formData.recipient}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Amount:</label>
                <div className="text-lg font-semibold">{formData.amount} SHM</div>
              </div>

              {formData.note && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Note:</label>
                  <div className="text-sm">{formData.note}</div>
                </div>
              )}

              <div className="border-t pt-2">
                <div className="flex justify-between text-sm">
                  <span>Network Fee:</span>
                  <span>~{estimatedFee.toFixed(6)} SHM</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{total.toFixed(4)} SHM</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleConfirmSend} disabled={isLoading} className="flex-1">
                {isLoading ? "Confirming..." : "Confirm & Send"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Transaction Sent!
            </DialogTitle>
            <DialogDescription>Your payment has been successfully submitted to the Shardeum network</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">Transaction Hash:</div>
              <div className="font-mono text-xs break-all text-green-700 dark:text-green-300">{transactionHash}</div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowSuccessDialog(false)} className="flex-1">
                Close
              </Button>
              <Button asChild className="flex-1">
                <a
                  href={`https://explorer-unstable.shardeum.org/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Explorer
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
        title="Authorize Transaction"
        description="Enter your password to authorize this payment transaction"
      />
    </div>
  )
}
