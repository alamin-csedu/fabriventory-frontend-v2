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
import { Progress } from "@/components/ui/progress"
import { AlertTriangle } from "lucide-react"

interface Item {
  id: number
  name: string
  uom: string
  category: string
  currentStock: number
  minStock: number
  maxStock: number
  unitPrice: number
  totalValue: number
  createdAt: string
  status: "active" | "inactive" | "low-stock"
}

interface ViewItemDialogProps {
  item: Item
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewItemDialog({ item, open, onOpenChange }: ViewItemDialogProps) {
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

  const getStatusBadge = (item: Item) => {
    if (item.status === "low-stock" || item.currentStock <= item.minStock) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Low Stock
        </Badge>
      )
    }
    if (item.status === "inactive" || item.currentStock === 0) {
      return <Badge variant="secondary">Out of Stock</Badge>
    }
    return <Badge variant="default">In Stock</Badge>
  }

  const stockPercentage = item.maxStock > 0 ? (item.currentStock / item.maxStock) * 100 : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Item Details</DialogTitle>
          <DialogDescription>Complete information about this fabric item</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Item Name</span>
              <span className="font-medium">{item.name}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Category</span>
              <span className="font-medium capitalize">{item.category}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Unit of Measurement</span>
              <span className="font-medium">{item.uom}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Status</span>
              {getStatusBadge(item)}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Item ID</span>
              <span className="font-mono text-sm">#{item.id}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Stock Information</h4>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Current Stock</span>
                <span className="font-medium">
                  {item.currentStock} {item.uom}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Min Stock Level</span>
                <span className="font-medium">
                  {item.minStock} {item.uom}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Max Stock Level</span>
                <span className="font-medium">
                  {item.maxStock} {item.uom}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-muted-foreground">Stock Level</span>
                  <span className="font-medium">{Math.round(stockPercentage)}%</span>
                </div>
                <Progress value={stockPercentage} className="h-2" />
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Unit Price</span>
              <span className="font-medium">{formatCurrency(item.unitPrice)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Value</span>
              <span className="font-medium">{formatCurrency(item.totalValue)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Created Date</span>
              <span className="font-medium">{formatDate(item.createdAt)}</span>
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
