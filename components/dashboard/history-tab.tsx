"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { History, AlertCircle, Search, Filter, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import type { Transaction } from "@/types/wallet"
import { TransactionItem } from "./transaction-item"
import { fetchTransactionHistory } from "@/lib/shardeum"

export function HistoryTab() {
  const { isConnected, address, isOnShardeumNetwork } = useWallet()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isConnected && address) {
      setIsLoading(true)
      console.log("[v0] Loading transaction history for:", address)

      fetchTransactionHistory(address)
        .then((realTransactions) => {
          console.log("[v0] Loaded transactions:", realTransactions.length)
          setTransactions(realTransactions)
          setFilteredTransactions(realTransactions)
        })
        .catch((error) => {
          console.error("[v0] Failed to load transactions:", error)
          setTransactions([])
          setFilteredTransactions([])
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setTransactions([])
      setFilteredTransactions([])
    }
  }, [isConnected, address])

  useEffect(() => {
    let filtered = transactions

    if (searchTerm) {
      filtered = filtered.filter(
        (tx) =>
          tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.note?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((tx) => tx.status === statusFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((tx) => tx.type === typeFilter)
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, statusFilter, typeFilter])

  const refreshTransactions = () => {
    if (address) {
      setIsLoading(true)
      console.log("[v0] Refreshing transaction history")

      fetchTransactionHistory(address)
        .then((realTransactions) => {
          console.log("[v0] Refreshed transactions:", realTransactions.length)
          setTransactions(realTransactions)
          setFilteredTransactions(realTransactions)
        })
        .catch((error) => {
          console.error("[v0] Failed to refresh transactions:", error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`

    return date.toLocaleDateString()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Transaction History</h2>
          <p className="text-muted-foreground">Connect your wallet to view your transaction history</p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please connect your wallet to view transaction history.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Transaction History</h2>
          <p className="text-muted-foreground">View and manage your payment history</p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshTransactions} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {!isOnShardeumNetwork && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You're not connected to Shardeum Unstablenet. Transaction history may not be accurate.{" "}
            <a
              href="https://docs.shardeum.org/docs/endpoints"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary font-medium"
            >
              Connect to Shardeum network
            </a>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="send">Sent</SelectItem>
                  <SelectItem value="receive">Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            {transactions.length > 0 ? "Recent Transactions" : "Transaction History"}
          </CardTitle>
          <CardDescription>
            {filteredTransactions.length > 0
              ? `${filteredTransactions.length} of ${transactions.length} transactions`
              : transactions.length === 0
                ? "No transactions yet"
                : "No transactions match your filters"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading transactions...</p>
              </div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {transactions.length === 0
                  ? "No transactions found. Start by sending or receiving payments!"
                  : "No transactions match your filters"}
              </p>
              {transactions.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Your transaction history will appear here after you make your first payment.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  userAddress={address || ""}
                  getStatusIcon={getStatusIcon}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
