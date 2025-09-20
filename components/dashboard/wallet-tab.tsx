"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, Eye, EyeOff, Copy, ExternalLink, RefreshCw, AlertCircle, CheckCircle, Gift } from "lucide-react"
import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/use-wallet"
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button"
import { getRewardBalance } from "@/lib/rewards"
import { RedeemRewardsDialog } from "./redeem-rewards-dialog"
import { AddFundsDialog } from "./add-funds-dialog"
import { WithdrawDialog } from "./withdraw-dialog"
import { PasswordSettingsCard } from "./password-settings-card"

export function WalletTab() {
  const { isConnected, address, balance, isOnShardeumNetwork, refreshBalance } = useWallet()
  const [showBalance, setShowBalance] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [rewardBalance, setRewardBalance] = useState(0)
  const [isLoadingRewards, setIsLoadingRewards] = useState(false)
  const [showRedeemDialog, setShowRedeemDialog] = useState(false)
  const [showAddFundsDialog, setShowAddFundsDialog] = useState(false)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      // In a real app, you'd show a toast notification here
    }
  }

  const handleRefreshBalance = async () => {
    setIsRefreshing(true)
    await refreshBalance()
    await refreshRewardBalance()
    setTimeout(() => setIsRefreshing(false), 1000) // Show loading for at least 1 second
  }

  const refreshRewardBalance = async () => {
    if (!address) return

    setIsLoadingRewards(true)
    try {
      const rwdBalance = await getRewardBalance(address)
      setRewardBalance(rwdBalance)
    } catch (error) {
      console.error("Failed to fetch reward balance:", error)
    } finally {
      setIsLoadingRewards(false)
    }
  }

  const handleRedemptionSuccess = () => {
    refreshBalance()
    refreshRewardBalance()
  }

  useEffect(() => {
    if (address && isConnected) {
      refreshRewardBalance()
    }
  }, [address, isConnected])

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground">Connect your MetaMask wallet to start using PayLink</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Connect your wallet to view your balance and start making payments</CardDescription>
          </CardHeader>
          <CardContent>
            <WalletConnectButton size="lg" className="w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Why Connect Your Wallet?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Send & Receive SHM</p>
                <p className="text-sm text-muted-foreground">Transfer Shardeum tokens instantly</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Ultra-Low Fees</p>
                <p className="text-sm text-muted-foreground">Pay fractions of a cent per transaction</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Lightning Speed</p>
                <p className="text-sm text-muted-foreground">Transactions complete in seconds</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Earn Rewards</p>
                <p className="text-sm text-muted-foreground">Get RWD tokens for every payment you make</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Wallet Overview</h2>
        <p className="text-muted-foreground">Manage your Shardeum wallet and view your balance</p>
      </div>

      {!isOnShardeumNetwork && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You're not connected to Shardeum Unstablenet. Please switch networks in MetaMask to use PayLink features.{" "}
            <a
              href="https://docs.shardeum.org/docs/endpoints"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary font-medium"
            >
              Learn how to add Shardeum network
            </a>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  SHM Balance
                </CardTitle>
                <CardDescription>Shardeum Native Token</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleRefreshBalance} disabled={isRefreshing}>
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowBalance(!showBalance)}>
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              {showBalance ? `${balance.toFixed(4)} SHM` : "••••••••"}
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              {showBalance ? `≈ $${(balance * 0.12).toFixed(2)} USD` : "≈ $••••••"}
            </div>
            <div className="flex gap-2">
              <Button size="sm" disabled={!isOnShardeumNetwork} onClick={() => setShowAddFundsDialog(true)}>
                Add Funds
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!isOnShardeumNetwork || balance === 0}
                onClick={() => setShowWithdrawDialog(true)}
              >
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-orange-500" />
                  RWD Rewards
                </CardTitle>
                <CardDescription>PayLink Reward Tokens</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={refreshRewardBalance} disabled={isLoadingRewards}>
                  <RefreshCw className={`w-4 h-4 ${isLoadingRewards ? "animate-spin" : ""}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowBalance(!showBalance)}>
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500 mb-2">
              {showBalance ? `${rewardBalance.toFixed(2)} RWD` : "••••••••"}
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              Earned from {Math.floor(rewardBalance / 10)} SHM in payments
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={!isOnShardeumNetwork || rewardBalance < 10}
                variant="outline"
                onClick={() => setShowRedeemDialog(true)}
              >
                Redeem for SHM
              </Button>
            </div>
            {rewardBalance < 10 && (
              <p className="text-xs text-muted-foreground mt-2">Minimum 10 RWD required to redeem</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Password Settings */}
      <PasswordSettingsCard />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-orange-500" />
            How Rewards Work
          </CardTitle>
          <CardDescription>Earn RWD tokens for every payment you make</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium">Earn 10 RWD per 1 SHM sent</p>
              <p className="text-sm text-muted-foreground">Automatic rewards for every payment transaction</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium">Redeem RWD for SHM</p>
              <p className="text-sm text-muted-foreground">Convert 100 RWD back to 1 SHM anytime</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium">No Expiration</p>
              <p className="text-sm text-muted-foreground">Your RWD tokens never expire</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wallet Address</CardTitle>
          <CardDescription>Your Shardeum wallet address for receiving payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-sm font-mono break-all">{address}</code>
            <Button variant="ghost" size="sm" onClick={copyAddress}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a
                href={`https://explorer-unstable.shardeum.org/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Network Status</CardTitle>
          <CardDescription>Shardeum Unstablenet connection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnShardeumNetwork ? "bg-green-500" : "bg-yellow-500"}`}></div>
            <span className="text-sm">
              {isOnShardeumNetwork ? "Connected to Shardeum Unstablenet" : "Wrong Network"}
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Chain ID: 8080 • RPC: api-unstable.shardeum.org</div>
        </CardContent>
      </Card>

      <AddFundsDialog open={showAddFundsDialog} onOpenChange={setShowAddFundsDialog} address={address || ""} />

      <WithdrawDialog
        open={showWithdrawDialog}
        onOpenChange={setShowWithdrawDialog}
        currentBalance={balance}
        onWithdrawSuccess={refreshBalance}
      />

      <RedeemRewardsDialog
        open={showRedeemDialog}
        onOpenChange={setShowRedeemDialog}
        rewardBalance={rewardBalance}
        onRedemptionSuccess={handleRedemptionSuccess}
      />
    </div>
  )
}
