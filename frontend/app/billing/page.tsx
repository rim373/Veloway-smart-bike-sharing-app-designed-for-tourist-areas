"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { usePayment } from "@/lib/payment-context"
import { useNotifications } from "@/lib/notifications-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function BillingPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { wallet, paymentMethods, transactions, isLoading: paymentLoading, topupWallet } = usePayment()
  const { addNotification } = useNotifications()
  const router = useRouter()
  const [topupAmount, setTopupAmount] = useState("10")
  const [showTopupForm, setShowTopupForm] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const handleTopup = async (amount: number, paymentMethodId: string) => {
    try {
      await topupWallet(amount, paymentMethodId)
      addNotification({
        type: "payment",
        title: "Wallet Topped Up",
        message: `Successfully added $${amount.toFixed(2)} to your wallet`,
        read: false,
        priority: "medium",
      })
      setShowTopupForm(false)
      setTopupAmount("10")
    } catch (error) {
      addNotification({
        type: "payment",
        title: "Topup Failed",
        message: "Failed to add funds to your wallet. Please try again.",
        read: false,
        priority: "high",
      })
    }
  }

  if (authLoading || paymentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !wallet) {
    return null
  }

  const predefinedAmounts = [10, 25, 50, 100]

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Billing & Wallet</h1>
            <p className="text-muted-foreground">Manage your payments and account balance</p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="wallet" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="payment">Payment Methods</TabsTrigger>
              <TabsTrigger value="history">Transaction History</TabsTrigger>
            </TabsList>

            {/* Wallet Tab */}
            <TabsContent value="wallet" className="space-y-6">
              {/* Balance Card */}
              <Card className="p-8 border border-border bg-gradient-to-br from-primary/5 to-accent/5">
                <p className="text-muted-foreground text-sm mb-2">Available Balance</p>
                <h2 className="text-5xl font-bold text-primary mb-6">${wallet.balance.toFixed(2)}</h2>
                <Button
                  onClick={() => setShowTopupForm(!showTopupForm)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {showTopupForm ? "Cancel" : "Add Funds"}
                </Button>
              </Card>

              {/* Topup Form */}
              {showTopupForm && (
                <Card className="p-6 border border-border bg-card">
                  <h3 className="text-lg font-bold text-foreground mb-4">Add Funds to Wallet</h3>
                  <div className="space-y-4">
                    {/* Quick Amount Buttons */}
                    <div>
                      <p className="text-muted-foreground text-sm mb-3">Quick amounts:</p>
                      <div className="grid grid-cols-4 gap-2">
                        {predefinedAmounts.map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            className={`border-border ${
                              topupAmount === amount.toString()
                                ? "border-accent bg-accent/10 text-accent"
                                : "bg-transparent"
                            }`}
                            onClick={() => setTopupAmount(amount.toString())}
                          >
                            ${amount}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Amount */}
                    <div>
                      <label className="text-muted-foreground text-sm mb-2 block">Custom Amount</label>
                      <input
                        type="number"
                        value={topupAmount}
                        onChange={(e) => setTopupAmount(e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                        placeholder="Enter amount"
                        min="1"
                        step="0.01"
                      />
                    </div>

                    {/* Payment Method Selection */}
                    <div>
                      <p className="text-muted-foreground text-sm mb-2">Payment Method</p>
                      <select className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground">
                        {paymentMethods.map((method) => (
                          <option key={method.id} value={method.id}>
                            {method.name} •••• {method.lastFour}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Confirm Button */}
                    <Button
                      onClick={() => handleTopup(Number.parseFloat(topupAmount), paymentMethods[0]?.id || "")}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      Add ${topupAmount} to Wallet
                    </Button>
                  </div>
                </Card>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 border border-border bg-card">
                  <p className="text-muted-foreground text-xs uppercase font-medium">Total Spent</p>
                  <p className="text-2xl font-bold text-foreground mt-2">${wallet.totalSpent.toFixed(2)}</p>
                </Card>
                <Card className="p-4 border border-border bg-card">
                  <p className="text-muted-foreground text-xs uppercase font-medium">Total Top-ups</p>
                  <p className="text-2xl font-bold text-foreground mt-2">${wallet.totalTopups.toFixed(2)}</p>
                </Card>
              </div>
            </TabsContent>

            {/* ... existing Payment Methods and Transaction History tabs ... */}
            <TabsContent value="payment" className="space-y-4">
              {/* Add Payment Method */}
              <Card className="p-6 border border-border bg-card">
                <h3 className="text-lg font-bold text-foreground mb-4">Add Payment Method</h3>
                <form className="space-y-4">
                  <div>
                    <label className="text-muted-foreground text-sm mb-2 block">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-muted-foreground text-sm mb-2 block">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground text-sm mb-2 block">CVC</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                      />
                    </div>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Add Payment Method
                  </Button>
                </form>
              </Card>

              {/* Existing Payment Methods */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4">Your Payment Methods</h3>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <Card key={method.id} className="p-4 border border-border bg-card">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-foreground font-medium">
                            {method.name} •••• {method.lastFour}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {method.isDefault ? "Default" : "Not default"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {!method.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-border bg-transparent"
                              onClick={() => {
                                // Set as default - would need payment context update
                              }}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Transaction History Tab */}
            <TabsContent value="history" className="space-y-4">
              {transactions.length === 0 ? (
                <Card className="p-12 border border-border bg-card text-center">
                  <p className="text-muted-foreground">No transactions yet</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <Card key={transaction.id} className="p-4 border border-border bg-card">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-foreground font-medium">{transaction.description}</p>
                          <p className="text-muted-foreground text-sm">
                            {new Date(transaction.timestamp).toLocaleDateString()} at{" "}
                            {new Date(transaction.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-lg font-bold ${
                              transaction.type === "wallet_topup" ? "text-green-600" : "text-foreground"
                            }`}
                          >
                            {transaction.type === "wallet_topup" ? "+" : "-"}${transaction.amount.toFixed(2)}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                transaction.status === "completed"
                                  ? "bg-green-500/10 text-green-700"
                                  : "bg-yellow-500/10 text-yellow-700"
                              }`}
                            >
                              {transaction.status}
                            </span>
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Back Link */}
          <div className="mt-8">
            <Link href="/profile">
              <Button variant="outline" className="border-border bg-transparent">
                ← Back to Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
