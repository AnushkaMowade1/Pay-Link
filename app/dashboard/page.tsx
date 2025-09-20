"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { WalletTab } from "@/components/dashboard/wallet-tab"
import { SendTab } from "@/components/dashboard/send-tab"
import { SplitTab } from "@/components/dashboard/split-tab"
import { ReceiveTab } from "@/components/dashboard/receive-tab"
import { HistoryTab } from "@/components/dashboard/history-tab"
import { QRTab } from "@/components/dashboard/qr-tab"
import { useAuth } from "@/hooks/use-auth"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("wallet")

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold mb-4">Access Your PayLink Dashboard</h2>
          <p className="text-muted-foreground mb-6">
            Sign in to manage your wallet, send money, and view transaction history.
          </p>
          <AuthDialog>
            <Button size="lg">Sign In to Continue</Button>
          </AuthDialog>
        </div>
      </div>
    )
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "wallet":
        return <WalletTab />
      case "send":
        return <SendTab />
      case "split":
        return <SplitTab />
      case "receive":
        return <ReceiveTab />
      case "history":
        return <HistoryTab />
      case "qr":
        return <QRTab />
      default:
        return <WalletTab />
    }
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderActiveTab()}
    </DashboardLayout>
  )
}
