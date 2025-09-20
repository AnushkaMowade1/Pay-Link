"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, Camera, Upload, AlertCircle, CheckCircle, Send, Download } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { sendTransaction, storeTransaction } from "@/lib/shardeum"
import QRCodeLib from "qrcode"
import QrScanner from "qr-scanner"
import { mintRewardsForPayment } from "@/lib/rewards"

interface QRPaymentData {
  address: string
  amount?: number
  note?: string
}

export function QRTab() {
  const { isConnected, address, balance, isOnShardeumNetwork, refreshBalance } = useWallet()
  const [activeTab, setActiveTab] = useState("generate")

  // Generate QR states
  const [generateForm, setGenerateForm] = useState({
    amount: "",
    note: "",
  })
  const [generatedQR, setGeneratedQR] = useState<string>("")

  // Scan QR states
  const [scannedData, setScannedData] = useState<QRPaymentData | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentNote, setPaymentNote] = useState("")
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const qrScannerRef = useRef<QrScanner | null>(null)

  // Generate QR code
  const generateQRCode = async () => {
    if (!address) return

    try {
      let qrData = address
      const amount = Number.parseFloat(generateForm.amount)

      if (amount > 0) {
        // Create payment request format
        qrData = `ethereum:${address}?value=${(amount * Math.pow(10, 18)).toString()}`
        if (generateForm.note) {
          qrData += `&message=${encodeURIComponent(generateForm.note)}`
        }
      }

      const qrUrl = await QRCodeLib.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: "#164e63",
          light: "#ffffff",
        },
      })

      setGeneratedQR(qrUrl)
    } catch (error) {
      console.error("Failed to generate QR code:", error)
    }
  }

  const parseQRData = (data: string): QRPaymentData | null => {
    try {
      // Handle ethereum: URI format
      if (data.startsWith("ethereum:")) {
        const url = new URL(data)
        const address = url.pathname

        // Validate Ethereum address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
          throw new Error("Invalid Ethereum address")
        }

        const amount = url.searchParams.get("value")
        const note = url.searchParams.get("message")

        return {
          address,
          amount: amount ? Number.parseInt(amount) / Math.pow(10, 18) : undefined,
          note: note ? decodeURIComponent(note) : undefined,
        }
      }

      // Handle plain address with validation
      if (/^0x[a-fA-F0-9]{40}$/.test(data)) {
        return { address: data }
      }

      return null
    } catch (error) {
      console.error("QR parsing error:", error)
      return null
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setScanError(null)
      const result = await QrScanner.scanImage(file)
      const parsed = parseQRData(result)
      if (parsed) {
        setScannedData(parsed)
        setPaymentAmount(parsed.amount?.toString() || "")
        setPaymentNote(parsed.note || "")
        setScanError(null)
      } else {
        setScanError("Invalid QR code format. Please scan a valid payment QR code.")
      }
    } catch (error) {
      setScanError("Could not read QR code from image. Please try a clearer image.")
    }
  }

  const startCameraScanning = async () => {
    try {
      setIsScanning(true)
      setScanError(null)

      if (!videoRef.current) {
        setScanError("Camera not available")
        setIsScanning(false)
        return
      }

      // Create QR scanner instance
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          const parsed = parseQRData(result.data)
          if (parsed) {
            setScannedData(parsed)
            setPaymentAmount(parsed.amount?.toString() || "")
            setPaymentNote(parsed.note || "")
            stopCameraScanning()
            setScanError(null)
          } else {
            setScanError("Invalid QR code format. Please scan a valid payment QR code.")
          }
        },
        {
          onDecodeError: (error) => {
            // Don't show decode errors as they happen frequently during scanning
            console.log("QR decode error:", error)
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: "environment", // Use back camera on mobile
        },
      )

      await qrScannerRef.current.start()
    } catch (error) {
      setScanError("Camera access denied or not available. Please allow camera access and try again.")
      setIsScanning(false)
    }
  }

  const stopCameraScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      qrScannerRef.current.destroy()
      qrScannerRef.current = null
    }
    setIsScanning(false)
  }

  const processQRPayment = async () => {
    if (!scannedData || !paymentAmount || !address) return

    setIsProcessingPayment(true)
    try {
      const amount = Number.parseFloat(paymentAmount)

      // Validate amount
      if (amount <= 0) {
        throw new Error("Amount must be greater than 0")
      }

      if (amount > balance) {
        throw new Error("Insufficient balance")
      }

      const transactionHash = await sendTransaction(scannedData.address, amount)

      // Store transaction locally
      const transaction = {
        id: transactionHash,
        from: address,
        to: scannedData.address,
        amount,
        timestamp: new Date(),
        status: "pending" as const,
        hash: transactionHash,
        type: "send" as const,
        note: paymentNote || undefined,
      }

      storeTransaction(address, transaction)

      try {
        const rewardsMinted = await mintRewardsForPayment(address, amount, transactionHash)
        if (rewardsMinted) {
          console.log("[v0] Rewards minted for QR payment:", amount * 10, "RWD")
        }
      } catch (rewardError) {
        console.error("[v0] Failed to mint rewards for QR payment:", rewardError)
        // Don't fail the payment if reward minting fails
      }

      // Refresh balance
      await refreshBalance()

      // Reset form
      setScannedData(null)
      setPaymentAmount("")
      setPaymentNote("")
      setScanError(null)

      // Show success message
      setScanError(null)
    } catch (error) {
      setScanError(error instanceof Error ? error.message : "Payment failed")
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Generate QR on form change
  useEffect(() => {
    if (address) {
      generateQRCode()
    }
  }, [address, generateForm])

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCameraScanning()
    }
  }, [])

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">QR Payments</h2>
          <p className="text-muted-foreground">Connect your wallet to use QR code payments</p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please connect your wallet to use QR payments.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">QR Payments</h2>
        <p className="text-muted-foreground">Generate or scan QR codes for instant payments</p>
      </div>

      {!isOnShardeumNetwork && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You're not connected to Shardeum Unstablenet. Please switch networks in MetaMask to use PayFi features.{" "}
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate QR</TabsTrigger>
          <TabsTrigger value="scan">Scan QR</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Generate Payment QR Code
              </CardTitle>
              <CardDescription>Create a QR code for others to scan and pay you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-amount">Amount (SHM)</Label>
                  <Input
                    id="qr-amount"
                    type="number"
                    step="0.0001"
                    min="0"
                    placeholder="0.0000"
                    value={generateForm.amount}
                    onChange={(e) => setGenerateForm((prev) => ({ ...prev, amount: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Leave empty for any amount</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qr-note">Note (Optional)</Label>
                  <Input
                    id="qr-note"
                    placeholder="Payment for..."
                    value={generateForm.note}
                    onChange={(e) => setGenerateForm((prev) => ({ ...prev, note: e.target.value }))}
                  />
                </div>
              </div>

              {generatedQR && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <img src={generatedQR || "/placeholder.svg"} alt="Payment QR Code" className="w-64 h-64" />
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Scan this QR code to send payment</p>
                    {generateForm.amount && <p className="font-medium">Amount: {generateForm.amount} SHM</p>}
                    {generateForm.note && <p className="text-sm text-muted-foreground">Note: {generateForm.note}</p>}
                  </div>

                  <Button
                    onClick={() => {
                      const link = document.createElement("a")
                      link.download = "payfi-qr-code.png"
                      link.href = generatedQR
                      link.click()
                    }}
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download QR Code
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Scan Payment QR Code
              </CardTitle>
              <CardDescription>Scan a QR code to make an instant payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {scanError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{scanError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={isScanning ? stopCameraScanning : startCameraScanning}
                  variant={isScanning ? "destructive" : "default"}
                  className="w-full"
                  disabled={!isOnShardeumNetwork}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {isScanning ? "Stop Camera" : "Start Camera"}
                </Button>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                    disabled={!isOnShardeumNetwork}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
              </div>

              {isScanning && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <video ref={videoRef} className="w-full max-w-md rounded-lg border" autoPlay playsInline muted />
                    <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
                      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
                      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary"></div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Point your camera at a QR code</p>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </CardContent>
          </Card>

          {scannedData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  QR Code Scanned Successfully
                </CardTitle>
                <CardDescription>Review the payment details before sending</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">To Address</label>
                    <div className="font-mono text-sm break-all bg-background p-2 rounded border">
                      {scannedData.address}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Amount (SHM)</label>
                    <Input
                      type="number"
                      step="0.0001"
                      min="0"
                      max={balance}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Available balance: {balance.toFixed(4)} SHM</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Note (Optional)</label>
                    <Textarea
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      placeholder="Add a note..."
                      rows={2}
                    />
                  </div>

                  {paymentAmount && (
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-sm">
                        <span>Amount:</span>
                        <span>{paymentAmount} SHM</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Network Fee:</span>
                        <span className="text-green-600">~0.0001 SHM</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-medium">
                        <span>Total:</span>
                        <span>{(Number.parseFloat(paymentAmount) + 0.0001).toFixed(4)} SHM</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setScannedData(null)
                      setPaymentAmount("")
                      setPaymentNote("")
                      setScanError(null)
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={processQRPayment}
                    disabled={
                      !paymentAmount ||
                      isProcessingPayment ||
                      Number.parseFloat(paymentAmount) > balance ||
                      Number.parseFloat(paymentAmount) <= 0
                    }
                    className="flex-1"
                  >
                    {isProcessingPayment ? (
                      "Processing..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Payment
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
