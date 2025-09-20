"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Plus, History, Calculator } from "lucide-react"
import { SplitBillDialog } from "./split-bill-dialog"

export function SplitTab() {
  const [showSplitDialog, setShowSplitDialog] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Split Bills</h2>
        <p className="text-muted-foreground">
          Split expenses with friends and send payments to multiple people at once.
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowSplitDialog(true)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              New Split Bill
            </CardTitle>
            <CardDescription>
              Create a new bill to split between multiple people
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                Multiple participants
              </div>
              <div className="flex items-center gap-1">
                <Calculator className="w-4 h-4" />
                Auto calculation
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <History className="w-5 h-5 text-secondary" />
              </div>
              Split History
            </CardTitle>
            <CardDescription>
              View past split bills and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Coming soon - track all your split bill payments
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            How Split Bills Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-semibold">1</span>
              </div>
              <h4 className="font-semibold mb-2">Set Up Bill</h4>
              <p className="text-sm text-muted-foreground">
                Enter the total amount and add participants with their wallet addresses
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-semibold">2</span>
              </div>
              <h4 className="font-semibold mb-2">Split Amount</h4>
              <p className="text-sm text-muted-foreground">
                Choose equal split or set custom amounts for each participant
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-semibold">3</span>
              </div>
              <h4 className="font-semibold mb-2">Send Payments</h4>
              <p className="text-sm text-muted-foreground">
                Automatically send the split amount to each participant's wallet
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Split Bill Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <div>
                <h5 className="font-medium">Equal Split</h5>
                <p className="text-sm text-muted-foreground">Automatically divide the total amount equally among all participants</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <div>
                <h5 className="font-medium">Custom Amounts</h5>
                <p className="text-sm text-muted-foreground">Set different amounts for each participant based on their share</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <div>
                <h5 className="font-medium">Batch Payments</h5>
                <p className="text-sm text-muted-foreground">Send payments to all participants in one go with secure authentication</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <div>
                <h5 className="font-medium">Reward Earnings</h5>
                <p className="text-sm text-muted-foreground">Earn rewards for each payment sent as part of the split bill</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <SplitBillDialog
        open={showSplitDialog}
        onOpenChange={setShowSplitDialog}
        onSplitComplete={() => {
          setShowSplitDialog(false)
          // Could add a success notification here
        }}
      />
    </div>
  )
}