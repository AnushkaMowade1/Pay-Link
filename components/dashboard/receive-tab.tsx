"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, QrCode, Share, AlertCircle, CheckCircle } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import QRCodeLib from "qrcode"
import { useEffect } from "react"

export function ReceiveTab() {
  const { isConnected, address, isOnShardeumNetwork } = useWallet()
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [copied, setCopied] = useState(false)

  // Generate QR code when address or amount changes
  useEffect(() => {
    if (address) {
      const generateQR = async () => {
        try {
          let qrData = address
          if (amount) {
            // Create a payment request format
            qrData = `ethereum:${address}?value=${Number.parseFloat(amount) * Math.pow(10, 18)}`
            if (note) {
              qrData += `&message=${encodeURIComponent(note)}`
            }
          }

          const qrUrl = await QRCodeLib.toDataURL(qrData, {
            width: 256,
            margin: 2,
            color: {
              dark: "#164e63", // Primary color
              light: "#ffffff",
            },
          })
          setQrCodeUrl(qrUrl)
        } catch (error) {
          console.error("Failed to generate QR code:", error)
        }
      }

      generateQR()
    }
  }, [address, amount, note])

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const sharePaymentRequest = async () => {
    if (address) {
      const shareData = {
        title: "PayLink Payment Request",
        text: `Send ${amount || "any amount"} SHM to my PayLink wallet`,
        url: `https://PayLink.app/pay?to=${address}&amount=${amount}&note=${encodeURIComponent(note)}`,
      }

      if (navigator.share) {
        try {
          await navigator.share(shareData)
        } catch (error) {
          // Fallback to copying URL
          await navigator.clipboard.writeText(shareData.url)
        }
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(shareData.url)
      }
    }
  }

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Receive Money</h2>
          <p className="text-muted-foreground">Connect your wallet to receive SHM payments</p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please connect your wallet to receive money.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Receive Money</h2>
        <p className="text-muted-foreground">Share your address or QR code to receive SHM payments</p>
      </div>

      {!isOnShardeumNetwork && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You're not connected to Shardeum Unstablenet. Switch networks to ensure proper payment processing.{" "}
            <a
              href="https://docs.shardeum.org/docs/endpoints"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary font-medium"
            >
              Add Shardeum network to MetaMask
            </a>
          </AlertDescription>
        </Alert>
      )}

      {/* Wallet Address Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Wallet Address</CardTitle>
          <CardDescription>Share this address to receive SHM payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <code className="flex-1 text-sm font-mono break-all">{address}</code>
              <Button variant="ghost" size="sm" onClick={copyAddress} className={copied ? "text-green-600" : ""}>
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            {copied && (
              <div className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Address copied to clipboard!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Payment Request</CardTitle>
          <CardDescription>Specify an amount and note to create a payment request</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="request-amount">Amount (SHM)</Label>
                <Input
                  id="request-amount"
                  type="number"
                  step="0.0001"
                  min="0"
                  placeholder="0.0000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Leave empty to request any amount</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="request-note">Note (Optional)</Label>
                <Input
                  id="request-note"
                  type="text"
                  placeholder="Payment for..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            {(amount || note) && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">Payment Request Summary:</div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>Amount: {amount || "Any amount"} SHM</div>
                  {note && <div>Note: {note}</div>}
                  <div>
                    To: {address?.slice(0, 10)}...{address?.slice(-8)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* QR Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code
          </CardTitle>
          <CardDescription>Scan this QR code to send payment to your wallet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            {qrCodeUrl && (
              <div className="p-4 bg-white rounded-lg border">
                <img src={qrCodeUrl || "/placeholder.svg"} alt="Payment QR Code" className="w-64 h-64" />
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={copyAddress}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Address
              </Button>
              <Button variant="outline" onClick={sharePaymentRequest}>
                <Share className="w-4 h-4 mr-2" />
                Share Request
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>How to Receive Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Share your address</p>
                <p className="text-muted-foreground">Copy and share your wallet address with the sender</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Or show QR code</p>
                <p className="text-muted-foreground">Let them scan your QR code for instant payment</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Receive instantly</p>
                <p className="text-muted-foreground">Payments arrive in seconds with minimal fees</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
