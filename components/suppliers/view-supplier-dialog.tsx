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

interface Supplier {
  id: number
  name: string
  createdAt: string
  purchaseOrdersCount: number
  totalValue: number
  status: "active" | "inactive"
  rating: number
}

interface ViewSupplierDialogProps {
  supplier: Supplier
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewSupplierDialog({ supplier, open, onOpenChange }: ViewSupplierDialogProps) {
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

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-2">
        <span className="font-medium">{rating}</span>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={`text-sm ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}>
              ★
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Supplier Details</DialogTitle>
          <DialogDescription>Complete information about this supplier</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Name</span>
              <span className="font-medium">{supplier.name}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Status</span>
              <Badge variant={supplier.status === "active" ? "default" : "secondary"}>{supplier.status}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Supplier ID</span>
              <span className="font-mono text-sm">#{supplier.id}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Rating</span>
              {renderRating(supplier.rating)}
            </div>
          </div>

          <Separator />

          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Purchase Orders</span>
              <span className="font-medium">{supplier.purchaseOrdersCount}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Value</span>
              <span className="font-medium">{formatCurrency(supplier.totalValue)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Created Date</span>
              <span className="font-medium">{formatDate(supplier.createdAt)}</span>
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
