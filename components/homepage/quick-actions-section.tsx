"use client"

import { useState } from "react"
import { Send, QrCode, Scan, ArrowRight, Users } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export function QuickActionsSection() {
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [scanDialogOpen, setScanDialogOpen] = useState(false)
  const router = useRouter()

  const handleQuickAction = (action: string) => {
    // For demo purposes, redirect to dashboard
    router.push("/dashboard")
  }

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">Quick Actions</h3>
          <p className="text-muted-foreground text-lg">Access all payment features instantly</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {/* Send Money */}
          <Card
            className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => handleQuickAction("send")}
          >
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Send className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-lg">Send Money</CardTitle>
              <CardDescription>Transfer funds instantly</CardDescription>
            </CardHeader>
          </Card>

          {/* Split Bill */}
          <Card
            className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => handleQuickAction("split")}
          >
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <CardTitle className="text-lg">Split Bill</CardTitle>
              <CardDescription>Split expenses with friends</CardDescription>
            </CardHeader>
          </Card>

          {/* QR Code Payment */}
          <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
            <DialogTrigger asChild>
              <Card className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                    <QrCode className="w-8 h-8 text-secondary" />
                  </div>
                  <CardTitle className="text-lg">Generate QR</CardTitle>
                  <CardDescription>Create payment QR code</CardDescription>
                </CardHeader>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Payment QR Code</DialogTitle>
                <DialogDescription>Create a QR code for others to scan and pay you</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (SHM)</Label>
                  <Input id="amount" placeholder="0.00" type="number" />
                </div>
                <div>
                  <Label htmlFor="note">Note (optional)</Label>
                  <Input id="note" placeholder="Payment for..." />
                </div>
                <div className="flex justify-center p-8 bg-muted rounded-lg">
                  <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-muted-foreground" />
                  </div>
                </div>
                <Button className="w-full">Generate QR Code</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Scan QR */}
          <Dialog open={scanDialogOpen} onOpenChange={setScanDialogOpen}>
            <DialogTrigger asChild>
              <Card className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Scan className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Scan QR</CardTitle>
                  <CardDescription>Scan to pay instantly</CardDescription>
                </CardHeader>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Scan QR Code</DialogTitle>
                <DialogDescription>Point your camera at a PayLink QR code to make a payment</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-center p-8 bg-muted rounded-lg">
                  <div className="w-48 h-48 bg-black/10 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                    <div className="text-center">
                      <Scan className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Camera view</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full">Start Camera</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-8">
          <Card
            className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => handleQuickAction("history")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <ArrowRight className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Transaction History</h4>
                  <p className="text-sm text-muted-foreground">View all payments</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => handleQuickAction("wallet")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Send className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Wallet</h4>
                  <p className="text-sm text-muted-foreground">Manage your funds</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
