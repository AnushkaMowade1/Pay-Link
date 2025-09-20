"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { WalletTab } from "@/components/dashboard/wallet-tab"
import { SendTab } from "@/components/dashboard/send-tab"
import { SplitTab } from "@/components/dashboard/split-tab"
import { ReceiveTab } from "@/components/dashboard/receive-tab"
import { HistoryTab } from "@/components/dashboard/history-tab"
import { QRTab } from "@/components/dashboard/qr-tab"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("wallet")

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
