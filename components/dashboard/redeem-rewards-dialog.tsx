"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Gift, ArrowRight, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { redeemRewards, getConversionRate, calculateShmAmount, canRedeem, getMinimumRedemption } from "@/lib/rewards"
import { useWallet } from "@/hooks/use-wallet"

interface RedeemRewardsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rewardBalance: number
  onRedemptionSuccess: () => void
}

export function RedeemRewardsDialog({
  open,
  onOpenChange,
  rewardBalance,
  onRedemptionSuccess,
}: RedeemRewardsDialogProps) {
  const { address } = useWallet()
  const [redeemAmount, setRedeemAmount] = useState("")
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [shmAmount, setShmAmount] = useState<number>(0)

  const conversionRate = getConversionRate()
  const minimumRedemption = getMinimumRedemption()

  useEffect(() => {
    if (open) {
      setError(null)
      setSuccess(false)
      setTransactionHash(null)
      setRedeemAmount("")
      setShmAmount(0)
    }
  }, [open])

  useEffect(() => {
    const amount = parseFloat(redeemAmount) || 0
    setShmAmount(calculateShmAmount(amount))
  }, [redeemAmount])

  const validateRedemption = (): string | null => {
    const amount = Number.parseFloat(redeemAmount)

    if (!redeemAmount.trim()) {
      return "Please enter an amount to redeem"
    }

    if (isNaN(amount) || amount <= 0) {
      return "Amount must be a positive number"
    }

    if (amount < 10) {
      return "Minimum redemption amount is 10 RWD"
    }

    if (amount > rewardBalance) {
      return "Insufficient RWD balance"
    }

    const shmAmount = calculateShmAmount(amount)
    // In mock system, we don't check vault balance

    return null
  }

  const handleRedeem = async () => {
    const validationError = validateRedemption()
    if (validationError) {
      setError(validationError)
      return
    }

    if (!address) {
      setError("Wallet not connected")
      return
    }

    setIsRedeeming(true)
    setError(null)

    try {
      const amount = Number.parseFloat(redeemAmount)
      console.log("[v0] Starting redemption:", amount, "RWD")

      const success = await redeemRewards(address, amount)

      if (success) {
        setTransactionHash("0x" + Math.random().toString(16).substr(2, 8))
        setSuccess(true)
        onRedemptionSuccess()

        // Reset form after success
        setTimeout(() => {
          setRedeemAmount("")
          setSuccess(false)
          setTransactionHash(null)
          onOpenChange(false)
        }, 3000)
      }
    } catch (error) {
      console.error("[v0] Redemption failed:", error)
      setError(error instanceof Error ? error.message : "Redemption failed")
    } finally {
      setIsRedeeming(false)
    }
  }

  const redeemAmountNum = Number.parseFloat(redeemAmount) || 0

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Redemption Successful!
            </DialogTitle>
            <DialogDescription>Your RWD tokens have been successfully redeemed for SHM</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">Transaction Hash:</div>
              <div className="font-mono text-xs break-all text-green-700 dark:text-green-300">{transactionHash}</div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {redeemAmountNum} RWD redeemed for {shmAmount.toFixed(4)} SHM
              </p>
            </div>

            <Button onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-orange-500" />
            Redeem RWD Tokens
          </DialogTitle>
          <DialogDescription>Convert your RWD reward tokens back to SHM</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="redeem-amount">Amount to Redeem (RWD)</Label>
            <Input
              id="redeem-amount"
              type="number"
              step="0.01"
              min="10"
              max={rewardBalance}
              placeholder="0.00"
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(e.target.value)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Available: {rewardBalance.toFixed(2)} RWD</span>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() => setRedeemAmount(rewardBalance.toString())}
                disabled={rewardBalance < 10}
              >
                Use Max
              </Button>
            </div>
          </div>

          {/* Conversion Preview */}
          {redeemAmountNum > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-orange-500">{redeemAmountNum.toFixed(2)} RWD</div>
                    <div className="text-xs text-muted-foreground">Redeeming</div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-muted-foreground" />

                  <div className="text-center">
                    <div className="text-lg font-semibold text-primary">{shmAmount.toFixed(4)} SHM</div>
                    <div className="text-xs text-muted-foreground">You'll receive</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t text-center">
                  <div className="text-xs text-muted-foreground">
                    Conversion Rate: {getConversionRate()} RWD = 1 SHM
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={isRedeeming}>
              Cancel
            </Button>
            <Button
              onClick={handleRedeem}
              disabled={
                isRedeeming ||
                !redeemAmount ||
                Number.parseFloat(redeemAmount) < 10 ||
                Number.parseFloat(redeemAmount) > rewardBalance
              }
              className="flex-1"
            >
              {isRedeeming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redeeming...
                </>
              ) : (
                "Redeem RWD"
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Minimum redemption: 10 RWD • No fees • Instant conversion
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
