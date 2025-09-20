"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, AlertCircle, CheckCircle, ExternalLink } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"

interface WalletConnectButtonProps {
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "default" | "lg"
  className?: string
}

export function WalletConnectButton({ variant = "default", size = "default", className }: WalletConnectButtonProps) {
  const { isConnected, address, balance, isLoading, error, connect, disconnect, isOnShardeumNetwork } = useWallet()
  const [showDialog, setShowDialog] = useState(false)

  if (isConnected && address) {
    return (
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button variant={variant} size={size} className={className}>
            <Wallet className="w-4 h-4 mr-2" />
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wallet Connected</DialogTitle>
            <DialogDescription>Your MetaMask wallet is connected to PayFi</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Wallet Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <div className="font-mono text-sm bg-muted p-2 rounded mt-1 break-all">{address}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Balance</label>
                  <div className="text-lg font-semibold text-primary mt-1">{balance.toFixed(4)} SHM</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Network</label>
                  <div className="flex items-center gap-2 mt-1">
                    {isOnShardeumNetwork ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Shardeum Unstablenet</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">Wrong Network</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {!isOnShardeumNetwork && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Please switch to Shardeum Unstablenet to use PayFi features.</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                <a
                  href={`https://explorer-unstable.shardeum.org/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Explorer
                </a>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  disconnect()
                  setShowDialog(false)
                }}
                className="flex-1"
              >
                Disconnect
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className} disabled={isLoading}>
          <Wallet className="w-4 h-4 mr-2" />
          {isLoading ? "Connecting..." : "Connect Wallet"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription>Connect your MetaMask wallet to start using PayFi on Shardeum</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <img src="/metamask-logo.png" alt="MetaMask" className="w-6 h-6" />
                MetaMask
              </CardTitle>
              <CardDescription>Connect using your MetaMask wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={connect} disabled={isLoading} className="w-full">
                {isLoading ? "Connecting..." : "Connect MetaMask"}
              </Button>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">What happens next:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>MetaMask will open and ask for permission</li>
              <li>We'll add Shardeum Unstablenet to your networks</li>
              <li>Your wallet will switch to Shardeum automatically</li>
              <li>You can start making fast, low-cost payments</li>
            </ul>
          </div>

          {typeof window !== "undefined" && typeof window.ethereum === "undefined" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                MetaMask is not installed.
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline ml-1"
                >
                  Install MetaMask
                </a>{" "}
                to continue.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
