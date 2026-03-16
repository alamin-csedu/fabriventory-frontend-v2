"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface PurchaseInvoice {
  id: number
  piNo: string
  piQty: number
  supplierId: number
  supplierName: string
  unitPrice: number
  totalValue: number
  createdAt: string
  status: "draft" | "pending" | "approved" | "paid" | "cancelled"
}

interface ViewPurchaseInvoiceDialogProps {
  invoice: PurchaseInvoice
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewPurchaseInvoiceDialog({ invoice, open, onOpenChange }: ViewPurchaseInvoiceDialogProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: "secondary" as const, label: "Draft" },
      pending: { variant: "default" as const, label: "Pending" },
      approved: { variant: "default" as const, label: "Approved" },
      paid: { variant: "default" as const, label: "Paid" },
      cancelled: { variant: "destructive" as const, label: "Cancelled" },
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Purchase Invoice Details</DialogTitle>
          <DialogDescription>Complete information about this purchase invoice</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">PI Number</span>
              <span className="font-mono font-medium">{invoice.piNo}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Status</span>
              {getStatusBadge(invoice.status)}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Invoice ID</span>
              <span className="font-mono text-sm">#{invoice.id}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Supplier Information</h4>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Supplier Name</span>
                <span className="font-medium">{invoice.supplierName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Supplier ID</span>
                <span className="font-mono text-sm">#{invoice.supplierId}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Invoice Details</h4>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Quantity</span>
                <span className="font-medium">{invoice.piQty.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Unit Price</span>
                <span className="font-medium">{formatCurrency(invoice.unitPrice)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total Value</span>
                <span className="font-medium text-lg">{formatCurrency(invoice.totalValue)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Created Date</span>
                <span className="font-medium">{formatDate(invoice.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
