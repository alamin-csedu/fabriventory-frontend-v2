"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye } from "lucide-react"
import { ImagePreviewModal } from "@/components/ui/image-preview-modal"
import { apiService } from "@/lib/api"
import { formatQuantity } from "@/lib/utils"
import { toast } from "sonner"
import { StockLedgerItemsDialog } from "./stock-ledger-items-dialog"

interface StockLedger {
  id: number
  job_id: number
  type: "Booking" | "Delivery"
  parent_id: number | null
  vendor_id: number
  delivery_receipt_url: string | null
  payment_reference: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  job?: {
    id: number
    name: string
    description: string
    customer_id: number
    created_at: string
    updated_at: string
    deleted_at: string | null
  }
  vendor?: {
    id: number
    name: string
    address: string
    phone_number: string[]
    email: string
    created_at: string
    updated_at: string
    deleted_at: string | null
  }
  parent?: {
    id: number
    job_id: number
    type: string
    parent_id: number | null
    vendor_id: number
    delivery_receipt_url: string
    payment_reference: string
    created_at: string
    updated_at: string
    deleted_at: string | null
  }
}

interface StockLedgerItem {
  id: number
  stock_ledger_id: number
  item_id: number
  quantity: number
  unit_id: number
  item?: {
    id: number
    name: string
  }
  unit?: {
    id: number
    name: string
  }
}

interface ViewStockLedgerDialogProps {
  stockLedger: StockLedger | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewStockLedgerDialog({ stockLedger, open, onOpenChange }: ViewStockLedgerDialogProps) {
  const [loading, setLoading] = useState(false)
  const [stockLedgerItems, setStockLedgerItems] = useState<StockLedgerItem[]>([])
  const [isItemsDialogOpen, setIsItemsDialogOpen] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)

  const fetchStockLedgerItems = async () => {
    if (!stockLedger) return

    try {
      setLoading(true)
      const response = await apiService.getStockLedgerItems({
        stock_ledger_id: stockLedger.id,
        page: 1,
        size: 100
      })
      setStockLedgerItems(response.data.data || [])
    } catch (error) {
      console.error("Error fetching stock ledger items:", error)
      toast.error("Failed to fetch stock ledger items")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && stockLedger) {
      fetchStockLedgerItems()
    }
  }, [open, stockLedger])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      Booking: { variant: "default" as const, label: "Booking" },
      Delivery: { variant: "secondary" as const, label: "Delivery" },
    }
    const config = typeConfig[type as keyof typeof typeConfig] || { variant: "outline" as const, label: type }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (!stockLedger) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="space-y-3 border-b border-border/60 bg-muted/20 px-6 py-5 pr-14 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="text-xl font-semibold tracking-tight">Stock ledger</DialogTitle>
            {getTypeBadge(stockLedger.type)}
          </div>
          <DialogDescription className="text-sm leading-relaxed">
            {stockLedger.type === "Delivery"
              ? "Delivery record — quantities and receipt below."
              : "Booking record — line items and job details below."}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-0 overflow-y-auto">
          {/* Line items — primary */}
          <div className="space-y-4 px-6 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold leading-none">Line items</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Quantities booked or delivered for this entry.
                </p>
              </div>
              <Button type="button" size="sm" onClick={() => setIsItemsDialogOpen(true)} className="shrink-0">
                Manage items
              </Button>
            </div>
            {loading ? (
              <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/15">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : stockLedgerItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/10 px-4 py-10 text-center text-sm text-muted-foreground">
                No line items for this stock ledger yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-12 font-semibold">#</TableHead>
                      <TableHead className="font-semibold">Item</TableHead>
                      <TableHead className="text-right font-semibold">Quantity</TableHead>
                      <TableHead className="text-right font-semibold">Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockLedgerItems.map((item, index) => (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="font-medium">{item.item?.name || "—"}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {formatQuantity(item.quantity)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {item.unit?.name || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <Separator />

          {/* Summary & delivery */}
          <div className="space-y-5 px-6 py-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Details</h3>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Job</label>
                <p className="mt-1 text-sm">{stockLedger.job?.name || "—"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Vendor</label>
                <p className="mt-1 text-sm">{stockLedger.vendor?.name || "—"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Parent</label>
                <p className="mt-1 text-sm">{stockLedger.parent ? stockLedger.parent.type : "None"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Payment reference</label>
                <p className="mt-1 font-mono text-sm">{stockLedger.payment_reference || "—"}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">
                  {stockLedger.type === "Delivery" ? "Delivered at" : "Recorded at"}
                </label>
                <p className="mt-1 text-sm font-medium">{formatDate(stockLedger.created_at)}</p>
              </div>
            </div>

            {stockLedger.delivery_receipt_url && (
              <div className="space-y-3 rounded-xl border border-border/70 bg-muted/10 p-4">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Delivery receipt
                </label>
                <div
                  className="group relative w-full max-w-full cursor-pointer overflow-hidden rounded-lg border-2 border-border transition-colors hover:border-primary/40"
                  onClick={() => setShowImageModal(true)}
                >
                  <img
                    src={
                      stockLedger.delivery_receipt_url.startsWith("http")
                        ? stockLedger.delivery_receipt_url
                        : `https://${stockLedger.delivery_receipt_url}`
                    }
                    alt="Delivery receipt"
                    className="h-44 w-full max-w-full object-cover object-center transition-transform group-hover:scale-[1.02]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                      const fallback = target.parentElement?.querySelector(".fallback") as HTMLElement
                      if (fallback) fallback.style.display = "flex"
                    }}
                  />
                  <div className="fallback absolute inset-0 hidden items-center justify-center bg-muted">
                    <div className="text-center text-muted-foreground">
                      <Eye className="mx-auto mb-2 h-8 w-8" />
                      <p className="text-sm">Preview unavailable — open link below</p>
                    </div>
                  </div>
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                    <div className="rounded-full bg-background/90 p-2 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                      <Eye className="h-5 w-5 text-foreground" />
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => {
                    const raw = stockLedger.delivery_receipt_url!
                    const url = raw.startsWith("http") ? raw : `https://${raw}`
                    window.open(url, "_blank")
                  }}
                >
                  Open receipt
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {stockLedger?.delivery_receipt_url && (
        <ImagePreviewModal
          imageUrl={stockLedger.delivery_receipt_url}
          open={showImageModal}
          onOpenChange={setShowImageModal}
        />
      )}

      <StockLedgerItemsDialog
        stockLedgerId={stockLedger?.id || null}
        open={isItemsDialogOpen}
        onOpenChange={setIsItemsDialogOpen}
      />
    </Dialog>
  )
}
