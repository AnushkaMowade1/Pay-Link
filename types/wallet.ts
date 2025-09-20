export interface WalletState {
  isConnected: boolean
  address: string | null
  balance: number
  chainId: string | null
}

export interface Transaction {
  id: string
  from: string
  to: string
  amount: number
  timestamp: Date
  status: "pending" | "completed" | "failed"
  hash: string
  type: "send" | "receive"
  note?: string
}

export interface PaymentRequest {
  to: string
  amount: number
  note?: string
}
