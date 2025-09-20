"use client"

import { Send, History, QrCode, Zap, Shield, DollarSign, CreditCard, Receipt, ArrowRight, Sparkles, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  const handleQuickAction = (action: string) => {
    router.push("/dashboard")
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  PayLink
                </h1>
                <span className="text-xs bg-gradient-to-r from-primary/20 to-secondary/20 text-primary px-3 py-1 rounded-full border border-primary/20 font-medium">
                  Shardeum
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <div className="hidden md:flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => handleQuickAction('send')}
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => handleQuickAction('split')}
                >
                  <Users className="w-4 h-4" />
                  <span>Split</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => handleQuickAction('qr')}
                >
                  <QrCode className="w-4 h-4" />
                  <span>QR</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => handleQuickAction('history')}
                >
                  <History className="w-4 h-4" />
                  <span>History</span>
                </Button>
              </div>
              <WalletConnectButton
                size="sm"
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg shadow-primary/25"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>

        <div className="container mx-auto text-center relative">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-primary mr-3 animate-pulse" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                Revolutionary Payments
              </span>
            </div>

            <h2 className="text-5xl md:text-7xl font-bold text-balance mb-8 leading-tight">
              Lightning-Fast Payments on{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-pulse">
                Shardeum
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-muted-foreground text-balance mb-12 leading-relaxed">
              Send money instantly with almost zero fees. Experience the future of peer-to-peer payments powered by
              Shardeum's revolutionary blockchain technology.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <WalletConnectButton
                size="lg"
                className="text-lg px-10 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl shadow-primary/25 transform hover:scale-105 transition-all duration-200"
              />
              <Link href="/learn-more">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-10 py-4 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transform hover:scale-105 transition-all duration-200 group bg-transparent"
                >
                  Learn More
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* Features Grid */}
      <section className="py-20 px-4 bg-gradient-to-b from-muted/30 to-muted/10">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-primary to-secondary rounded-full mr-4"></div>
              <h3 className="text-4xl md:text-5xl font-bold">Complete Payment Solution</h3>
              <div className="w-1 h-8 bg-gradient-to-b from-secondary to-primary rounded-full ml-4"></div>
            </div>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Everything you need for modern digital payments on Shardeum's lightning-fast network
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Send,
                title: "Send Money",
                desc: "Instant transfers to any wallet address worldwide",
                color: "primary",
              },
              {
                icon: QrCode,
                title: "QR Payments",
                desc: "Scan QR codes for instant payments and receipts",
                color: "secondary",
              },
              {
                icon: CreditCard,
                title: "Recharge Wallet",
                desc: "Top up your wallet with multiple funding options",
                color: "primary",
              },
              {
                icon: Receipt,
                title: "Bill Payments",
                desc: "Pay utilities, mobile, and other bills instantly",
                color: "secondary",
              },
              {
                icon: Zap,
                title: "Lightning Speed",
                desc: "Transactions complete in seconds, not minutes",
                color: "primary",
              },
              {
                icon: DollarSign,
                title: "Almost Free",
                desc: "Pay fractions of a cent per transaction",
                color: "secondary",
              },
              {
                icon: Shield,
                title: "Secure & Reliable",
                desc: "Built on Shardeum's proven blockchain technology",
                color: "primary",
              },
              {
                icon: History,
                title: "Transaction History",
                desc: "Track all your payments with detailed analytics",
                color: "secondary",
              },
            ].map((feature, index) => (
              <Card
                key={feature.title}
                className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="text-center">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.color === "primary" ? "from-primary/20 to-primary/10" : "from-secondary/20 to-secondary/10"} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <feature.icon
                      className={`w-8 h-8 ${feature.color === "primary" ? "text-primary" : "text-secondary"}`}
                    />
                  </div>
                  <CardTitle className="text-xl mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">{feature.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="border-t py-12 px-4 bg-gradient-to-b from-muted/30 to-muted/50">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              PayLink
            </span>
          </div>
          <p className="text-muted-foreground">Powered by Shardeum Blockchain</p>
        </div>
      </footer>
    </div>
  )
}
