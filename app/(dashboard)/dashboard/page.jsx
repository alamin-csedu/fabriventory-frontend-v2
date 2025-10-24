"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Package, 
  Users, 
  Building2, 
  FileText, 
  Database, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Calendar,
  MapPin,
  Palette,
  Tag,
  Ruler,
  ArrowRightLeft,
  RefreshCw,
  Activity,
  Zap,
  Target,
  Award,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { apiService } from "@/lib/api"
import { toast } from "sonner"

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else {
      fetchDashboardData()
    }
  }, [isAuthenticated, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await apiService.getDashboardOverview()
      setDashboardData(response.data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Failed to load dashboard data</p>
          <Button onClick={fetchDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const { stats, stock_ledger, items, storage, vendors, jobs, time_series } = dashboardData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Dashboard Overview</h1>
          <p className="text-muted-foreground text-pretty">
            System statistics and analytics for Fabrimentory
          </p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.total_items)}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.total_categories} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Ledgers</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.total_stock_ledgers)}</div>
            <p className="text-xs text-muted-foreground">
              {stock_ledger.total_bookings} bookings, {stock_ledger.total_deliveries} deliveries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.total_jobs)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total_customers} customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.total_vendors)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total_storage} storage locations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Ledger Analytics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stock Ledger Analytics</CardTitle>
            <CardDescription>Booking vs Delivery breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="default">Bookings</Badge>
                  <span className="text-sm font-medium">{stock_ledger.total_bookings}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatNumber(stock_ledger.booking_quantity)} units
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">Deliveries</Badge>
                  <span className="text-sm font-medium">{stock_ledger.total_deliveries}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatNumber(stock_ledger.delivery_quantity)} units
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Quantity</span>
                  <span className="text-sm font-bold">{formatNumber(stock_ledger.total_quantity)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items by Category</CardTitle>
            <CardDescription>Distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.items_by_category.slice(0, 5).map((category) => (
                <div key={category.category_id} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.category_name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{category.count} items</span>
                    <Badge variant="outline">{category.count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Items and Vendors */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Items by Quantity</CardTitle>
            <CardDescription>Most stocked items in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.top_items.slice(0, 5).map((item) => (
                  <TableRow key={item.item_id}>
                    <TableCell className="font-medium">{item.item_name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Vendors</CardTitle>
            <CardDescription>Most active vendors by transaction count</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.top_vendors.slice(0, 5).map((vendor) => (
                  <TableRow key={vendor.vendor_id}>
                    <TableCell className="font-medium">{vendor.vendor_name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(vendor.count)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Storage and Recent Jobs */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Storage Capacity</CardTitle>
            <CardDescription>Storage utilization across locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {storage.storage_capacity.slice(0, 5).map((storageItem) => {
                const utilizationPercentage = (storageItem.used / storageItem.capacity) * 100
                return (
                  <div key={storageItem.storage_id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{storageItem.storage_name}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(storageItem.used)} / {formatNumber(storageItem.capacity)}
                      </span>
                    </div>
                    <Progress value={utilizationPercentage} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{utilizationPercentage.toFixed(1)}% utilized</span>
                      <span>{formatNumber(storageItem.available)} available</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
            <CardDescription>Latest job activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobs.recent_jobs.slice(0, 5).map((job) => (
                <div key={job.job_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{job.job_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Customer #{job.customer_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(job.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Complete system statistics and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatNumber(stats.total_categories)}</div>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatNumber(stats.total_colors)}</div>
              <p className="text-sm text-muted-foreground">Colors</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatNumber(stats.total_units)}</div>
              <p className="text-sm text-muted-foreground">Units</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{formatNumber(stats.total_stock_items)}</div>
              <p className="text-sm text-muted-foreground">Stock Items</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{formatNumber(stats.total_storage)}</div>
              <p className="text-sm text-muted-foreground">Storage</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{formatNumber(stats.total_customers)}</div>
              <p className="text-sm text-muted-foreground">Customers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {formatDate(dashboardData.last_updated)}
      </div>
    </div>
  )
}