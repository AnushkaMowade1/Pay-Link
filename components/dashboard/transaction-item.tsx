"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Copy, CheckCircle } from "lucide-react"
import type { Transaction } from "@/types/wallet"

interface TransactionItemProps {
  transaction: Transaction
  userAddress: string
  getStatusIcon: (status: string) => React.ReactElement
  getStatusBadge: (status: string) => React.ReactElement
}

export function TransactionItem({ transaction, userAddress, getStatusIcon, getStatusBadge }: TransactionItemProps) {
  const [copied, setCopied] = useState(false)

  const isOutgoing = transaction.from.toLowerCase() === userAddress.toLowerCase()
  const otherAddress = isOutgoing ? transaction.to : transaction.from

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`

    return date.toLocaleDateString()
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isOutgoing ? "bg-red-100 dark:bg-red-900" : "bg-green-100 dark:bg-green-900"
              }`}
            >
              {isOutgoing ? (
                <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />
              ) : (
                <ArrowDownLeft className="w-5 h-5 text-green-600 dark:text-green-400" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{isOutgoing ? "Sent to" : "Received from"}</span>
                {getStatusIcon(transaction.status)}
              </div>
              <div className="text-sm text-muted-foreground font-mono">
                {otherAddress.slice(0, 10)}...{otherAddress.slice(-8)}
              </div>
              {transaction.note && <div className="text-sm text-muted-foreground mt-1">{transaction.note}</div>}
            </div>
          </div>

          <div className="text-right">
            <div
              className={`font-semibold ${
                isOutgoing ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
              }`}
            >
              {isOutgoing ? "-" : "+"}
              {transaction.amount.toFixed(4)} SHM
            </div>
            <div className="text-sm text-muted-foreground">{formatDate(transaction.timestamp)}</div>
            <div className="mt-1">{getStatusBadge(transaction.status)}</div>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isOutgoing ? (
              <ArrowUpRight className="w-5 h-5 text-red-600" />
            ) : (
              <ArrowDownLeft className="w-5 h-5 text-green-600" />
            )}
            Transaction Details
          </DialogTitle>
          <DialogDescription>
            {isOutgoing ? "Payment sent" : "Payment received"} • {formatDate(transaction.timestamp)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Amount</label>
              <div
                className={`text-2xl font-bold ${
                  isOutgoing ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                }`}
              >
                {isOutgoing ? "-" : "+"}
                {transaction.amount.toFixed(4)} SHM
              </div>
              <div className="text-sm text-muted-foreground">≈ ${(transaction.amount * 0.12).toFixed(2)} USD</div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(transaction.status)}
                {getStatusBadge(transaction.status)}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">From</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm font-mono bg-background p-1 rounded flex-1 break-all">{transaction.from}</code>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(transaction.from)}>
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">To</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm font-mono bg-background p-1 rounded flex-1 break-all">{transaction.to}</code>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(transaction.to)}>
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {transaction.note && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Note</label>
                <div className="text-sm mt-1 p-2 bg-background rounded">{transaction.note}</div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground">Transaction Hash</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs font-mono bg-background p-1 rounded flex-1 break-all">{transaction.hash}</code>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(transaction.hash)}>
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
              <div className="text-sm mt-1">{transaction.timestamp.toLocaleString()}</div>
            </div>
          </div>

          <Button asChild className="w-full">
            <a
              href={`https://explorer-unstable.shardeum.org/tx/${transaction.hash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Shardeum Explorer
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
