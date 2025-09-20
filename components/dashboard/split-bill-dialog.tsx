"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Trash2, Calculator, Send, AlertCircle, CheckCircle, DollarSign } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { usePassword } from "@/hooks/use-password"
import { sendTransaction, estimateGas } from "@/lib/shardeum"
import { mintRewardsForPayment } from "@/lib/rewards"
import { 
  createSplitBill, 
  saveSplitBill, 
  updateSplitBillStatus, 
  validateSplitBill, 
  calculateEqualSplit,
  type SplitBillParticipant as SplitParticipant
} from "@/lib/split-bill"
import { PasswordVerifyDialog } from "@/components/auth/password-verify-dialog"
import { PasswordSetupDialog } from "@/components/auth/password-setup-dialog"

interface Participant {
  id: string
  name: string
  address: string
  amount: number
  isPaid: boolean
}

interface SplitBillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSplitComplete?: () => void
}

export function SplitBillDialog({ open, onOpenChange, onSplitComplete }: SplitBillDialogProps) {
  const { address, balance, refreshBalance } = useWallet()
  const { isPasswordSet } = usePassword()
  
  // Form state
  const [billTitle, setBillTitle] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [description, setDescription] = useState("")
  const [participants, setParticipants] = useState<Participant[]>([])
  const [splitMethod, setSplitMethod] = useState<"equal" | "custom">("equal")
  
  // UI state
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showPasswordSetup, setShowPasswordSetup] = useState(false)
  const [currentStep, setCurrentStep] = useState<"setup" | "review" | "processing" | "complete">("setup")
  const [completedPayments, setCompletedPayments] = useState<string[]>([])
  
  // New participant form
  const [newParticipantName, setNewParticipantName] = useState("")
  const [newParticipantAddress, setNewParticipantAddress] = useState("")

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setBillTitle("")
      setTotalAmount("")
      setDescription("")
      setParticipants([])
      setSplitMethod("equal")
      setNewParticipantName("")
      setNewParticipantAddress("")
      setError(null)
      setCurrentStep("setup")
      setCompletedPayments([])
      setIsProcessing(false)
    }
  }, [open])

  // Calculate split amounts when total or method changes
  useEffect(() => {
    if (splitMethod === "equal" && totalAmount && participants.length > 0) {
      const amount = calculateEqualSplit(parseFloat(totalAmount), participants.length)
      setParticipants(prev => prev.map(p => ({ ...p, amount })))
    }
  }, [totalAmount, participants.length, splitMethod])

  const addParticipant = () => {
    if (!newParticipantName.trim() || !newParticipantAddress.trim()) {
      setError("Please fill in both name and wallet address")
      return
    }

    // Basic address validation
    if (!newParticipantAddress.startsWith("0x") || newParticipantAddress.length !== 42) {
      setError("Please enter a valid wallet address (0x...)")
      return
    }

    // Check for duplicate addresses
    if (participants.some(p => p.address.toLowerCase() === newParticipantAddress.toLowerCase())) {
      setError("This wallet address is already added")
      return
    }

    const newParticipant: Participant = {
      id: `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newParticipantName.trim(),
      address: newParticipantAddress.trim(),
      amount: 0,
      isPaid: false
    }

    setParticipants(prev => [...prev, newParticipant])
    setNewParticipantName("")
    setNewParticipantAddress("")
    setError(null)
  }

  const removeParticipant = (participantId: string) => {
    setParticipants(prev => prev.filter(p => p.id !== participantId))
  }

  const updateParticipantAmount = (participantId: string, amount: number) => {
    setParticipants(prev => prev.map(p => 
      p.id === participantId ? { ...p, amount: parseFloat(amount.toFixed(4)) } : p
    ))
  }

  const getTotalSplitAmount = () => {
    return participants.reduce((sum, p) => sum + p.amount, 0)
  }

  const validateForm = (): string | null => {
    // Use the utility validation function
    const validationError = validateSplitBill(billTitle, parseFloat(totalAmount), participants)
    if (validationError) return validationError

    // Check if user has enough balance for all payments
    const totalToSend = participants.reduce((sum, p) => sum + p.amount, 0)
    if (balance !== null && totalToSend > balance) {
      return `Insufficient balance. Need ${totalToSend.toFixed(4)} SHM, have ${balance.toFixed(4)} SHM`
    }

    return null
  }

  const handleReviewBill = () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setCurrentStep("review")
  }

  const handleSendPayments = () => {
    if (!isPasswordSet) {
      setShowPasswordSetup(true)
      return
    }

    setShowPasswordDialog(true)
  }

  const processSplitBill = async () => {
    if (!address) {
      setError("Wallet not connected")
      return
    }

    setIsProcessing(true)
    setCurrentStep("processing")
    setError(null)
    
    // Create and save the split bill
    const splitBill = createSplitBill(
      billTitle,
      parseFloat(totalAmount),
      participants,
      address,
      description,
      splitMethod
    )
    
    saveSplitBill(splitBill)
    updateSplitBillStatus(address, splitBill.id, "processing")
    
    const successfulPayments: string[] = []
    const failedPayments: { name: string; error: string }[] = []

    try {
      for (const participant of participants) {
        try {
          console.log(`[SplitBill] Sending ${participant.amount} SHM to ${participant.name} (${participant.address})`)
          
          const hash = await sendTransaction(participant.address, participant.amount)
          
          // Store transaction and mint rewards
          try {
            await mintRewardsForPayment(address, participant.amount, hash)
            console.log(`[SplitBill] Rewards minted for payment to ${participant.name}`)
          } catch (rewardError) {
            console.error(`[SplitBill] Failed to mint rewards for ${participant.name}:`, rewardError)
          }

          successfulPayments.push(participant.id)
          setCompletedPayments(prev => [...prev, participant.id])
          
          // Small delay between transactions
          await new Promise(resolve => setTimeout(resolve, 1000))
          
        } catch (error) {
          console.error(`[SplitBill] Failed to send payment to ${participant.name}:`, error)
          failedPayments.push({
            name: participant.name,
            error: error instanceof Error ? error.message : "Transaction failed"
          })
        }
      }

      // Update participants' paid status
      const updatedParticipants = participants.map(p => ({
        ...p,
        isPaid: successfulPayments.includes(p.id)
      }))
      
      setParticipants(updatedParticipants)

      // Update split bill status
      const finalStatus = failedPayments.length === 0 ? "completed" : "failed"
      updateSplitBillStatus(address, splitBill.id, finalStatus, updatedParticipants)

      if (failedPayments.length > 0) {
        setError(`Some payments failed: ${failedPayments.map(f => f.name).join(", ")}`)
      }

      setCurrentStep("complete")
      
      // Refresh balance after all transactions
      setTimeout(() => {
        refreshBalance()
      }, 2000)

      if (onSplitComplete) {
        onSplitComplete()
      }

    } catch (error) {
      console.error("[SplitBill] Split bill processing failed:", error)
      setError(error instanceof Error ? error.message : "Failed to process split bill")
      updateSplitBillStatus(address, splitBill.id, "failed")
      setCurrentStep("review")
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePasswordVerified = () => {
    setShowPasswordDialog(false)
    processSplitBill()
  }

  const handlePasswordSetupComplete = () => {
    setShowPasswordSetup(false)
    // After setup, show verification dialog
    setShowPasswordDialog(true)
  }

  const renderSetupStep = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="billTitle">Bill Title</Label>
          <Input
            id="billTitle"
            placeholder="e.g., Dinner at Restaurant"
            value={billTitle}
            onChange={(e) => setBillTitle(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="totalAmount">Total Amount (SHM)</Label>
          <Input
            id="totalAmount"
            type="number"
            step="0.0001"
            placeholder="0.0000"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Additional details about the bill..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Split Method</Label>
          <div className="flex gap-2">
            <Button
              variant={splitMethod === "equal" ? "default" : "outline"}
              size="sm"
              onClick={() => setSplitMethod("equal")}
            >
              Equal Split
            </Button>
            <Button
              variant={splitMethod === "custom" ? "default" : "outline"}
              size="sm"
              onClick={() => setSplitMethod("custom")}
            >
              Custom Amounts
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participants ({participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add participant form */}
            <div className="space-y-3 p-3 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Participant name"
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                />
                <Input
                  placeholder="Wallet address (0x...)"
                  value={newParticipantAddress}
                  onChange={(e) => setNewParticipantAddress(e.target.value)}
                />
              </div>
              <Button onClick={addParticipant} size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Participant
              </Button>
            </div>

            {/* Participants list */}
            {participants.length > 0 && (
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{participant.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {participant.address}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {splitMethod === "custom" ? (
                        <Input
                          type="number"
                          step="0.0001"
                          placeholder="0.0000"
                          value={participant.amount || ""}
                          onChange={(e) => updateParticipantAmount(participant.id, parseFloat(e.target.value) || 0)}
                          className="w-20 h-8 text-sm"
                        />
                      ) : (
                        <Badge variant="secondary">
                          {participant.amount.toFixed(4)} SHM
                        </Badge>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeParticipant(participant.id)}
                        className="p-1 h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium">Total Split:</span>
                  <Badge variant={Math.abs(parseFloat(totalAmount || "0") - getTotalSplitAmount()) > 0.01 ? "destructive" : "default"}>
                    {getTotalSplitAmount().toFixed(4)} SHM
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleReviewBill} className="flex-1">
          <Calculator className="w-4 h-4 mr-2" />
          Review Split
        </Button>
      </div>
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Bill Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="font-medium">Title:</span>
            <span>{billTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Total Amount:</span>
            <span>{totalAmount} SHM</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Participants:</span>
            <span>{participants.length} people</span>
          </div>
          {description && (
            <div>
              <span className="font-medium">Description:</span>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Payment Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {participants.map((participant) => (
              <div key={participant.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{participant.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {participant.address}
                  </div>
                </div>
                <Badge variant="outline">
                  {participant.amount.toFixed(4)} SHM
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setCurrentStep("setup")} className="flex-1">
          Back to Edit
        </Button>
        <Button onClick={handleSendPayments} className="flex-1" disabled={isProcessing}>
          <Send className="w-4 h-4 mr-2" />
          Send Payments
        </Button>
      </div>
    </div>
  )

  const renderProcessingStep = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <Send className="w-8 h-8 text-primary animate-pulse" />
      </div>
      
      <div>
        <h3 className="font-semibold text-lg">Processing Split Bill</h3>
        <p className="text-muted-foreground">Sending payments to all participants...</p>
      </div>

      <div className="space-y-2">
        {participants.map((participant) => (
          <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="text-left">
              <div className="font-medium">{participant.name}</div>
              <div className="text-sm text-muted-foreground">
                {participant.amount.toFixed(4)} SHM
              </div>
            </div>
            <div className="flex items-center gap-2">
              {completedPayments.includes(participant.id) ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )

  const renderCompleteStep = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      
      <div>
        <h3 className="font-semibold text-lg">Split Bill Complete!</h3>
        <p className="text-muted-foreground">
          Successfully sent payments to {completedPayments.length} of {participants.length} participants
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between">
                <span className="text-sm">{participant.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{participant.amount.toFixed(4)} SHM</span>
                  {participant.isPaid ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => onOpenChange(false)} className="w-full">
        Close
      </Button>
    </div>
  )

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Split Bill
            </DialogTitle>
            <DialogDescription>
              {currentStep === "setup" && "Set up a bill to split with multiple people"}
              {currentStep === "review" && "Review the split before sending payments"}
              {currentStep === "processing" && "Processing payments..."}
              {currentStep === "complete" && "Split bill completed"}
            </DialogDescription>
          </DialogHeader>

          {currentStep === "setup" && renderSetupStep()}
          {currentStep === "review" && renderReviewStep()}
          {currentStep === "processing" && renderProcessingStep()}
          {currentStep === "complete" && renderCompleteStep()}
        </DialogContent>
      </Dialog>

      <PasswordVerifyDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onVerified={handlePasswordVerified}
        title="Verify Password to Send Payments"
        description="Please enter your password to authorize the split bill payments."
      />

      <PasswordSetupDialog
        open={showPasswordSetup}
        onOpenChange={setShowPasswordSetup}
        onPasswordSet={handlePasswordSetupComplete}
      />
    </>
  )
}