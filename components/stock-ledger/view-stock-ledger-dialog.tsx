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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Stock Ledger Details</DialogTitle>
          <DialogDescription>
            View detailed information about stock ledger #{stockLedger.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 min-w-0 overflow-hidden">
          {/* Basic Information */}
          <div className="space-y-4 min-w-0">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">ID</label>
                <p className="text-sm">#{stockLedger.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <div className="mt-1">{getTypeBadge(stockLedger.type)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Job</label>
                <p className="text-sm">{stockLedger.job?.name || `Job #${stockLedger.job_id}`}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Vendor</label>
                <p className="text-sm">{stockLedger.vendor?.name || `Vendor #${stockLedger.vendor_id}`}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Parent</label>
                <p className="text-sm">
                  {stockLedger.parent ? `#${stockLedger.parent.id} (${stockLedger.parent.type})` : "None"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Payment Reference</label>
                <p className="text-sm">{stockLedger.payment_reference || "None"}</p>
              </div>
            </div>
            
            {stockLedger.delivery_receipt_url && (
              <div className="space-y-2 min-w-0 max-w-full">
                <label className="text-sm font-medium text-muted-foreground">Delivery Receipt</label>
                <div className="text-sm font-medium text-gray-700">Preview</div>
                <div
                  className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 max-w-full w-full"
                  onClick={() => setShowImageModal(true)}
                >
                  <img
                    src={
                      stockLedger.delivery_receipt_url.startsWith("http")
                        ? stockLedger.delivery_receipt_url
                        : `https://${stockLedger.delivery_receipt_url}`
                    }
                    alt="Delivery receipt"
                    className="w-full h-48 object-cover object-center max-w-full group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                      const fallback = target.parentElement?.querySelector(".fallback") as HTMLElement
                      if (fallback) fallback.style.display = "flex"
                    }}
                  />
                  <div className="fallback hidden absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Eye className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Click to view full image</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 rounded-full p-2">
                      <Eye className="h-5 w-5 text-gray-700" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 truncate min-w-0 max-w-full">
                  {stockLedger.delivery_receipt_url}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => {
                    const raw = stockLedger.delivery_receipt_url!
                    const url = raw.startsWith("http") ? raw : `https://${raw}`
                    window.open(url, "_blank")
                  }}
                >
                  View Receipt
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Timestamps</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p className="text-sm">{formatDate(stockLedger.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                <p className="text-sm">{formatDate(stockLedger.updated_at)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Stock Ledger Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Items</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsItemsDialogOpen(true)}
              >
                Manage Items
              </Button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : stockLedgerItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items found for this stock ledger.</p>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockLedgerItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">
                          {item.item?.name || `Item #${item.item_id}`}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {item.quantity.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.unit?.name || `Unit #${item.unit_id}`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
