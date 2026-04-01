"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Plus,
  Edit,
  Eye,
  Calendar,
  Package,
  Truck,
} from "lucide-react"
import { apiService } from "@/lib/api"
import { formatQuantity } from "@/lib/utils"
import { toast } from "sonner"
import { AddStockLedgerDialog } from "@/components/stock-ledger/add-stock-ledger-dialog"
import { EditStockLedgerDialog } from "@/components/stock-ledger/edit-stock-ledger-dialog"
import { ViewStockLedgerDialog } from "@/components/stock-ledger/view-stock-ledger-dialog"

export default function StockLedgerTimelinePage() {
  const params = useParams()
  const router = useRouter()
  const stockLedgerId = params.id 

  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)

  const fetchTimeline = async () => {
    try {
      setLoading(true)
      const response = await apiService.getStockLedgerTimeline(stockLedgerId)
      setTimeline(response.data || [])
    } catch (error) {
      console.error("Error fetching timeline:", error)
      toast.error("Failed to fetch timeline")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (stockLedgerId) {
      fetchTimeline()
    }
  }, [stockLedgerId])

  const handleEdit = (entry) => {
    setSelectedEntry(entry)
    setIsEditDialogOpen(true)
  }

  const handleView = (entry) => {
    setSelectedEntry(entry)
    setIsViewDialogOpen(true)
  }

  const handleAddDelivery = () => {
    setIsAddDialogOpen(true)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDeliveryDateParts = (dateString) => {
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return { date: "—", time: "" }
    return {
      date: d.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const bookingEntry = timeline.find((entry) => entry.type === "Booking")
  const deliveryEntries = timeline.filter((entry) => entry.type === "Delivery")

  const jobName = bookingEntry?.job?.name?.trim()
  const vendorName = bookingEntry?.vendor?.name?.trim()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/25 px-4 py-5 shadow-sm sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-3 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10 shrink-0 rounded-xl border-border/80 bg-background/80 shadow-sm hover:bg-muted"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1 space-y-1 pt-0.5">
              <h1 className="text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
                { "Booking Details"}
              </h1>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                {jobName}
                {vendorName ? (
                  <span className="mt-1 block text-xs text-muted-foreground/90">
                    Vendor: <span className="font-medium text-foreground/80">{vendorName}</span>
                  </span>
                ) : null}
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleAddDelivery}
            className="h-10 w-full shrink-0 gap-2 shadow-sm sm:w-auto sm:self-center"
          >
            <Plus className="h-4 w-4" />
            Add delivery
          </Button>
        </div>
      </div>

      {/* Booking Details */}
      {bookingEntry && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Job Information</h4>
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>Job:</strong> {bookingEntry.job?.name ?? "—"}
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>Description:</strong> {bookingEntry.job?.description ?? "—"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Created:</strong> {formatDate(bookingEntry.created_at)}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Vendor Information</h4>
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>Vendor:</strong> {bookingEntry.vendor?.name ?? "—"}
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>Email:</strong> {bookingEntry.vendor?.email ?? "—"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Address:</strong> {bookingEntry.vendor?.address ?? "—"}
                </p>
              </div>
            </div>
            
            {/* Item-wise Delivery Breakdown */}
            {bookingEntry.items && bookingEntry.items.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Item Delivery Status</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-sm">Item</th>
                        <th className="text-center py-3 px-4 font-semibold text-sm">Ordered</th>
                        <th className="text-center py-3 px-4 font-semibold text-sm">Delivered</th>
                        <th className="text-center py-3 px-4 font-semibold text-sm">Remaining</th>
                        <th className="text-center py-3 px-4 font-semibold text-sm">Progress</th>
                        <th className="text-center py-3 px-4 font-semibold text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingEntry.items.map((item, index) => {
                        const pct = Number(item.item_stats?.percentage ?? 0)
                        const delivered = item.item_stats?.delivered ?? 0
                        const remaining = item.item_stats?.remaining ?? 0
                        return (
                        <tr key={item.id ?? index} className="border-b hover:bg-muted/30">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-blue-600" />
                              <div>
                                <div className="font-medium">{item.item?.name ?? "—"}</div>
                                <div className="text-xs text-muted-foreground">{item.unit?.name ?? "—"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="font-semibold text-blue-600">
                              {formatQuantity(item.quantity ?? 0)}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="font-semibold text-green-600">
                              {formatQuantity(delivered)}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="font-semibold text-orange-600">
                              {formatQuantity(remaining)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <div className="text-xs text-center text-muted-foreground">
                                {formatQuantity(pct)}%
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge 
                              variant="outline"
                              className={
                                pct === 100
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : pct > 0
                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                              }
                            >
                              {pct === 100 ? "Complete" : 
                               pct > 0 ? "In Progress" : "Pending"}
                            </Badge>
                          </td>
                        </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delivery timeline */}
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/20 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold tracking-tight sm:text-xl">
                  Delivery timeline
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Chronological record of each delivery for this booking.
                </CardDescription>
              </div>
            </div>
            {deliveryEntries.length > 0 && (
              <Badge variant="secondary" className="w-fit shrink-0 font-medium tabular-nums">
                {deliveryEntries.length}{" "}
                {deliveryEntries.length === 1 ? "delivery" : "deliveries"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {deliveryEntries.length === 0 ? (
            <div className="mx-4 my-6 rounded-xl border border-dashed border-border/80 bg-muted/15 px-5 py-9 text-center sm:mx-5">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 ring-1 ring-border/60">
                <Truck className="h-6 w-6 text-muted-foreground/70" />
              </div>
              <p className="text-sm font-medium text-foreground">No deliveries recorded yet</p>
              <p className="mx-auto mt-1.5 max-w-sm text-xs text-muted-foreground sm:text-sm">
                When you add a delivery, it will appear here in chronological order.
              </p>
            </div>
          ) : (
            <div className="relative px-3 py-4 sm:px-5 sm:py-5">
              {/* Continuous vertical rail */}
              <div
                className="absolute left-[1.625rem] top-8 bottom-8 hidden w-px bg-gradient-to-b from-primary/35 via-border to-transparent sm:left-[1.875rem] sm:block"
                aria-hidden
              />
              <ul className="relative space-y-0">
                {deliveryEntries.map((entry, index) => {
                  const { date, time } = formatDeliveryDateParts(entry.created_at)
                  return (
                    <li key={entry.id ?? index} className="relative flex gap-3 pb-6 last:pb-0 sm:gap-4 sm:pb-7">
                      {/* Step node */}
                      <div className="relative z-[1] flex shrink-0 flex-col items-center">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary/35 bg-gradient-to-br from-primary/15 to-primary/5 text-primary shadow-sm ring-2 ring-background sm:h-10 sm:w-10"
                          aria-hidden
                        >
                          <Truck className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2} />
                        </div>
                        <span className="mt-1.5 rounded-full bg-muted px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                          #{index + 1}
                        </span>
                      </div>

                      {/* Card */}
                      <div className="min-w-0 flex-1 pt-px">
                        <div className="rounded-xl border border-border/70 bg-card p-3 shadow-sm transition-shadow hover:shadow-md sm:p-3.5">
                          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                            <div className="min-w-0 space-y-1">
                              <Badge
                                variant="outline"
                                className="w-fit gap-1 border-emerald-200/80 bg-emerald-50 px-2 py-px text-[9px] font-semibold uppercase tracking-wider text-emerald-900 shadow-none dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-100"
                              >
                                <Truck className="h-3 w-3" aria-hidden />
                                Delivered
                              </Badge>
                              <p className="text-sm font-semibold tabular-nums leading-snug text-foreground sm:text-base">
                                {date}
                                {time ? (
                                  <span className="font-normal text-muted-foreground">
                                    {" "}
                                    · {time}
                                  </span>
                                ) : null}
                              </p>
                            </div>
                            <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:justify-end">
                              <div className="flex items-center gap-0.5 rounded-md border border-border/60 bg-muted/30 p-px">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => handleView(entry)}
                                >
                                  <Eye className="mr-1 h-3 w-3" />
                                  View
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => handleEdit(entry)}
                                >
                                  <Edit className="mr-1 h-3 w-3" />
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddStockLedgerDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchTimeline}
        initialData={{ 
          type: "Delivery", 
          parent_id: bookingEntry?.id,
          job_id: bookingEntry?.job_id,
          vendor_id: bookingEntry?.vendor_id 
        }}
      />
      
      <EditStockLedgerDialog 
        stockLedger={selectedEntry}
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
        onSuccess={fetchTimeline}
      />
      
      <ViewStockLedgerDialog 
        stockLedger={selectedEntry}
        open={isViewDialogOpen} 
        onOpenChange={setIsViewDialogOpen}
      />
    </div>
  )
}
