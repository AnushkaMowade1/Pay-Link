"use client"

import Link from "next/link"
import { ArrowLeft, Zap, Shield, Send, CreditCard, Coins, Users, Globe, CheckCircle, Info, Lock, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function LearnMorePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <ArrowLeft className="w-5 h-5" />
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    PayFi
                  </h1>
                  <span className="text-xs bg-gradient-to-r from-primary/20 to-secondary/20 text-primary px-3 py-1 rounded-full border border-primary/20 font-medium">
                    Shardeum
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Info className="w-8 h-8 text-primary mr-3" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                How PayFi Works
              </span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold text-balance mb-8 leading-tight">
              Your Complete Guide to
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-pulse block">
                Decentralized Payments
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground text-balance mb-12 leading-relaxed">
              Discover how PayFi revolutionizes digital payments on Shardeum's lightning-fast blockchain network
            </p>
          </div>
        </div>
      </section>

      {/* What is PayFi Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-muted/30 to-muted/10">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <Card className="mb-12 border-primary/20 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold mb-4">What is PayFi?</CardTitle>
                <CardDescription className="text-lg">
                  PayFi is a next-generation decentralized payment platform built on Shardeum blockchain
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-primary">🚀 Key Features</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <span>Instant, low-cost transactions on Shardeum</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <span>Earn rewards for every payment made</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <span>QR code payments for easy transactions</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <span>Complete transaction history and analytics</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-primary">🌟 Benefits</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <span>No intermediaries or hidden fees</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <span>Enhanced security with Web3 technology</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <span>Global accessibility 24/7</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <span>Transparent and auditable transactions</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">How PayFi Works</h3>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Simple steps to start using PayFi for your digital payments
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Connect Wallet",
                description: "Connect your MetaMask or compatible Web3 wallet to PayFi",
                icon: <Shield className="w-8 h-8" />,
                color: "from-blue-500 to-blue-600"
              },
              {
                step: "02",
                title: "Set Security Password",
                description: "Create a secure password for transaction authorization",
                icon: <Lock className="w-8 h-8" />,
                color: "from-green-500 to-green-600"
              },
              {
                step: "03",
                title: "Add Funds",
                description: "Deposit SHM tokens to your PayFi wallet for transactions",
                icon: <CreditCard className="w-8 h-8" />,
                color: "from-purple-500 to-purple-600"
              },
              {
                step: "04",
                title: "Start Transacting",
                description: "Send, receive, and manage payments with ease",
                icon: <Send className="w-8 h-8" />,
                color: "from-orange-500 to-orange-600"
              }
            ].map((step, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-primary/10">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${step.color}`}></div>
                <CardHeader className="text-center pt-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                      {step.icon}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono mb-2">
                    STEP {step.step}
                  </Badge>
                  <CardTitle className="text-xl font-bold">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-muted/30 to-muted/10">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-4xl md:text-5xl font-bold mb-4">Security First</h3>
              <p className="text-muted-foreground text-xl">
                Your security is our top priority with multiple layers of protection
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-green-200 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">Password Protection</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Every transaction requires password verification, ensuring only you can authorize payments. 
                    Passwords are stored securely using Web3 encryption standards.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-blue-200 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">Blockchain Security</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Built on Shardeum's secure blockchain infrastructure with smart contract auditing 
                    and decentralized validation for maximum security.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-purple-200 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">Wallet Integration</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Seamless integration with MetaMask and other Web3 wallets ensures your private keys 
                    never leave your device and remain under your control.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-orange-200 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">Decentralized</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    No central authority controls your funds. PayFi operates as a fully decentralized 
                    application, giving you complete control over your assets.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Rewards System Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <Card className="border-primary/20 shadow-xl">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Coins className="w-12 h-12 text-yellow-500" />
                </div>
                <CardTitle className="text-3xl font-bold mb-4">Earn Rewards</CardTitle>
                <CardDescription className="text-lg">
                  Get rewarded for every transaction you make on PayFi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200">
                    <h4 className="text-2xl font-bold text-yellow-600 mb-2">How Rewards Work</h4>
                    <p className="text-gray-700">
                      Earn PayFi Reward Coins (PRC) for every successful transaction. The more you use PayFi, 
                      the more rewards you accumulate. Redeem your rewards for discounts on transaction fees 
                      or convert them back to SHM tokens.
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 mt-8">
                    <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">1%</div>
                      <div className="text-sm text-gray-600">Reward rate per transaction</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="text-2xl font-bold text-green-600">Instant</div>
                      <div className="text-sm text-gray-600">Rewards credited immediately</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="text-2xl font-bold text-purple-600">Flexible</div>
                      <div className="text-sm text-gray-600">Multiple redemption options</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Getting Started CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-4xl font-bold mb-6">Ready to Get Started?</h3>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of users already enjoying fast, secure, and rewarding payments with PayFi
            </p>
            <Link href="/">
              <Button
                size="lg"
                className="text-lg px-10 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl shadow-primary/25 transform hover:scale-105 transition-all duration-200"
              >
                Start Using PayFi
                <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}