"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Package,
  Users,
  Building2,
  FileText,
  Database,
  RefreshCw,
  LayoutDashboard,
  ArrowUpRight,
  Warehouse,
  Tag,
  Palette,
  Ruler,
  Boxes,
  Sparkles,
} from "lucide-react"
import { apiService } from "@/lib/api"
import { cn, getFirstNStoragePathSegments } from "@/lib/utils"
import { toast } from "sonner"

function StatCard({ title, value, hint, icon: Icon, className }) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/[0.06]" />
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-[13px] font-medium leading-none text-muted-foreground">{title}</CardTitle>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="font-semibold tabular-nums tracking-tight text-2xl text-foreground sm:text-3xl">{value}</div>
        {hint ? <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  )
}

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

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 18) return "Good afternoon"
    return "Good evening"
  }, [])

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-9 w-48 max-w-full rounded-lg" />
            <Skeleton className="h-4 w-72 max-w-full rounded-md" />
          </div>
          <Skeleton className="h-9 w-[100px] rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[124px] w-full rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[220px] w-full rounded-xl" />
          <Skeleton className="h-[220px] w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/30 px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Database className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          We couldn&apos;t load your overview. Check your connection and try again.
        </p>
        <Button onClick={fetchDashboardData} variant="default" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  const { stats, stock_ledger, items, storage, vendors, jobs } = dashboardData

  const bookingShare =
    stock_ledger.total_quantity > 0
      ? (Number(stock_ledger.booking_quantity) / Number(stock_ledger.total_quantity)) * 100
      : 0

  const overviewMetrics = [
    { label: "Categories", value: stats.total_categories, icon: Tag },
    { label: "Colors", value: stats.total_colors, icon: Palette },
    { label: "Units", value: stats.total_units, icon: Ruler },
    { label: "Stock items", value: stats.total_stock_items, icon: Boxes },
    { label: "Storage", value: stats.total_storage, icon: Warehouse },
    { label: "Customers", value: stats.total_customers, icon: Users },
  ]

  return (
    <div className="relative mx-auto max-w-[1400px] space-y-8 pb-8">
      {/* Ambient background */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.45] dark:opacity-[0.25]"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.55 0.12 240 / 0.15), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 0%, oklch(0.6 0.08 200 / 0.08), transparent 50%)",
        }}
      />

      {/* Header */}
      <header className="flex flex-col gap-6 border-b border-border/60 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{greeting}</p>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Home</h1>
            <Badge variant="secondary" className="font-normal">
              <Sparkles className="mr-1 h-3 w-3" />
              Overview
            </Badge>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Fabric inventory at a glance — stock, bookings, and activity in one place.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            onClick={fetchDashboardData}
            variant="outline"
            size="sm"
            className="gap-2 border-border/80 bg-background/80 shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </header>

      {/* KPI row */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total items"
          value={formatNumber(stats.total_items)}
          hint={`Across ${formatNumber(stats.total_categories)} categories`}
          icon={Package}
        />
        <StatCard
          title="Stock ledgers"
          value={formatNumber(stats.total_stock_ledgers)}
          hint={`${formatNumber(stock_ledger.total_bookings)} bookings · ${formatNumber(stock_ledger.total_deliveries)} deliveries`}
          icon={Database}
        />
        <StatCard
          title="Active jobs"
          value={formatNumber(stats.total_jobs)}
          hint={`${formatNumber(stats.total_customers)} customers`}
          icon={FileText}
        />
        <StatCard
          title="Vendors"
          value={formatNumber(stats.total_vendors)}
          hint={`${formatNumber(stats.total_storage)} storage locations`}
          icon={Building2}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <LayoutDashboard className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Bookings & deliveries</CardTitle>
                <CardDescription className="text-xs">Volume split across your stock ledger</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Booking share</span>
                <span className="tabular-nums font-medium text-foreground">{bookingShare.toFixed(0)}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.min(100, bookingShare)}%` }}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/60 bg-muted/40 px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">Bookings</p>
                <p className="mt-1 text-lg font-semibold tabular-nums">{formatNumber(stock_ledger.total_bookings)}</p>
                <p className="text-xs text-muted-foreground">{formatNumber(stock_ledger.booking_quantity)} units</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/40 px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">Deliveries</p>
                <p className="mt-1 text-lg font-semibold tabular-nums">{formatNumber(stock_ledger.total_deliveries)}</p>
                <p className="text-xs text-muted-foreground">{formatNumber(stock_ledger.delivery_quantity)} units</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border/60 pt-4 text-sm">
              <span className="text-muted-foreground">Total quantity</span>
              <span className="font-semibold tabular-nums">{formatNumber(stock_ledger.total_quantity)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Items by category</CardTitle>
            <CardDescription className="text-xs">Top categories by item count</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-0 divide-y divide-border/60 rounded-xl border border-border/60">
              {items.items_by_category?.slice(0, 5).map((category, idx) => (
                <li
                  key={category.category_id}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 first:rounded-t-xl last:rounded-b-xl"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
                      {idx + 1}
                    </span>
                    <span className="truncate text-sm font-medium">{category.category_name}</span>
                  </div>
                  <Badge variant="secondary" className="shrink-0 font-mono text-xs tabular-nums">
                    {formatNumber(category.count)}
                  </Badge>
                </li>
              ))}
            </ul>
            {(!items.items_by_category || items.items_by_category.length === 0) && (
              <p className="py-8 text-center text-sm text-muted-foreground">No category data yet.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top items by quantity</CardTitle>
            <CardDescription className="text-xs">Highest volume in stock</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="h-10 pl-6 text-xs font-medium">Item</TableHead>
                  <TableHead className="h-10 pr-6 text-right text-xs font-medium">Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.top_items?.slice(0, 5).map((item) => (
                  <TableRow key={item.item_id} className="border-border/40 hover:bg-muted/50">
                    <TableCell className="max-w-[200px] pl-6 font-medium">{item.item_name}</TableCell>
                    <TableCell className="pr-6 text-right font-mono text-sm tabular-nums text-muted-foreground">
                      {formatNumber(item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top vendors</CardTitle>
            <CardDescription className="text-xs">By transaction count</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="h-10 pl-6 text-xs font-medium">Vendor</TableHead>
                  <TableHead className="h-10 pr-6 text-right text-xs font-medium">Txns</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.top_vendors?.slice(0, 5).map((vendor) => (
                  <TableRow key={vendor.vendor_id} className="border-border/40 hover:bg-muted/50">
                    <TableCell className="pl-6 font-medium">{vendor.vendor_name}</TableCell>
                    <TableCell className="pr-6 text-right font-mono text-sm tabular-nums text-muted-foreground">
                      {formatNumber(vendor.count)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Storage capacity</CardTitle>
            <CardDescription className="text-xs">Locations with defined capacity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[320px] space-y-5 overflow-y-auto pr-1">
              {storage.storage_capacity
                ?.filter((s) => s.capacity != null && Number(s.capacity) !== 0)
                .map((storageItem) => {
                  const utilizationPercentage =
                    Number(storageItem.capacity) > 0
                      ? (Number(storageItem.used) / Number(storageItem.capacity)) * 100
                      : 0
                  const address = storageItem.address ?? storageItem.storage_name ?? ""
                  const displayAddress = getFirstNStoragePathSegments(address, 3) || address
                  return (
                    <div key={storageItem.storage_id} className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-sm font-medium" title={address}>
                          {displayAddress}
                        </span>
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          {formatNumber(storageItem.used)} / {formatNumber(storageItem.capacity)}
                        </span>
                      </div>
                      <Progress value={utilizationPercentage} className="h-1.5" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{utilizationPercentage.toFixed(1)}% used</span>
                        <span>{formatNumber(storageItem.available)} free</span>
                      </div>
                    </div>
                  )
                })}
              {(!storage.storage_capacity ||
                storage.storage_capacity.filter((s) => s.capacity != null && Number(s.capacity) !== 0).length ===
                  0) && (
                <p className="py-8 text-center text-sm text-muted-foreground">No capacity data for storage locations.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent jobs</CardTitle>
            <CardDescription className="text-xs">Latest activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {jobs.recent_jobs?.slice(0, 5).map((job) => (
                <li
                  key={job.job_id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border/50 bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{job.job_name}</p>
                    <p className="text-xs text-muted-foreground">Customer #{job.customer_id}</p>
                  </div>
                  <time className="shrink-0 text-xs tabular-nums text-muted-foreground">{formatDate(job.created_at)}</time>
                </li>
              ))}
            </ul>
            {(!jobs.recent_jobs || jobs.recent_jobs.length === 0) && (
              <p className="py-8 text-center text-sm text-muted-foreground">No recent jobs.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/60 bg-gradient-to-b from-card/90 to-muted/20 shadow-sm backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">System overview</CardTitle>
          <CardDescription className="text-xs">Reference counts across your workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {overviewMetrics.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-background/60 px-3 py-4 text-center shadow-sm"
              >
                <Icon className="mb-2 h-4 w-4 text-primary/80" />
                <div className="text-xl font-semibold tabular-nums tracking-tight">{formatNumber(value)}</div>
                <p className="mt-1 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <footer className="flex items-center justify-center gap-2 border-t border-border/40 pt-6 text-xs text-muted-foreground">
        <span>Updated {formatDate(dashboardData.last_updated)}</span>
        <span className="text-border">·</span>
        <span className="inline-flex items-center gap-1">
          Fabriventory
          <ArrowUpRight className="h-3 w-3 opacity-60" />
        </span>
      </footer>
    </div>
  )
}
