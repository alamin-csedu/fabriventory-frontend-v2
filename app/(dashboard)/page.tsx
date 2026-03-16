"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Package, Users, Building2, FileText, Receipt, TrendingUp, AlertTriangle, DollarSign } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-balance">Dashboard</h1>
            <p className="text-muted-foreground text-pretty">Welcome to your fabric inventory management system</p>
          </div>

          {/* Key Metrics - Beautiful Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {/* Total Items Card */}
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-indigo-500/10 hover:from-blue-500/20 hover:via-blue-600/10 hover:to-indigo-500/20 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">Total Items</CardTitle>
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Package className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">1,247</div>
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium">
                    <TrendingUp className="h-3 w-3" />
                    +12%
                  </div>
                  <span className="text-xs text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>

            {/* Active Buyers Card */}
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-green-500/10 hover:from-emerald-500/20 hover:via-emerald-600/10 hover:to-green-500/20 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Active Buyers</CardTitle>
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-1">89</div>
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                    <TrendingUp className="h-3 w-3" />
                    +5
                  </div>
                  <span className="text-xs text-muted-foreground">new this month</span>
                </div>
              </CardContent>
            </Card>

            {/* Suppliers Card */}
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-violet-500/10 hover:from-purple-500/20 hover:via-purple-600/10 hover:to-violet-500/20 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">Suppliers</CardTitle>
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-1">34</div>
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium">
                    <TrendingUp className="h-3 w-3" />
                    +2
                  </div>
                  <span className="text-xs text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>

            {/* Total Value Card */}
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-amber-500/10 via-orange-600/5 to-yellow-500/10 hover:from-amber-500/20 hover:via-orange-600/10 hover:to-yellow-500/20 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-amber-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-300">Total Value</CardTitle>
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-1">$2.4M</div>
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                    <TrendingUp className="h-3 w-3" />
                    +8%
                  </div>
                  <span className="text-xs text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Alerts */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="md:col-span-1 lg:col-span-4">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest inventory movements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { item: "Cotton Fabric - Blue", type: "Received", qty: "500 Meters", value: "$12,500" },
                    { item: "Silk Blend - White", type: "Issued", qty: "200 Meters", value: "$8,000" },
                    { item: "Denim - Dark Blue", type: "Received", qty: "300 Meters", value: "$9,000" },
                    { item: "Polyester - Black", type: "Issued", qty: "150 Meters", value: "$3,750" },
                  ].map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{transaction.item}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={transaction.type === "Received" ? "default" : "secondary"}>
                            {transaction.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{transaction.qty}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{transaction.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-1 lg:col-span-3">
              <CardHeader>
                <CardTitle>Inventory Alerts</CardTitle>
                <CardDescription>Items requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Low Stock Alert</p>
                      <p className="text-xs text-muted-foreground">Cotton Fabric - Red (50 meters remaining)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">High Demand</p>
                      <p className="text-xs text-muted-foreground">Silk Blend fabrics trending up 25%</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-accent mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Pending Orders</p>
                      <p className="text-xs text-muted-foreground">3 purchase invoices awaiting approval</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Status */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
                <CardDescription>Current stock levels by category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { category: "Cotton Fabrics", current: 850, total: 1000, percentage: 85 },
                  { category: "Silk Blends", current: 420, total: 500, percentage: 84 },
                  { category: "Synthetic", current: 300, total: 600, percentage: 50 },
                  { category: "Denim", current: 180, total: 300, percentage: 60 },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.category}</span>
                      <span className="text-muted-foreground">
                        {item.current}/{item.total} meters
                      </span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Add Item</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">New Buyer</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Add Supplier</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                    <Receipt className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">New Invoice</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
  )
}
