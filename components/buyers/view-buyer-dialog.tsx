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

interface Buyer {
  id: number
  name: string
  createdAt: string
  contractsCount: number
  totalValue: number
  status: "active" | "inactive"
}

interface ViewBuyerDialogProps {
  buyer: Buyer
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewBuyerDialog({ buyer, open, onOpenChange }: ViewBuyerDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buyer Details</DialogTitle>
          <DialogDescription>Complete information about this buyer</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Name</span>
              <span className="font-medium">{buyer.name}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Status</span>
              <Badge variant={buyer.status === "active" ? "default" : "secondary"}>{buyer.status}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Buyer ID</span>
              <span className="font-mono text-sm">#{buyer.id}</span>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Contracts</span>
              <span className="font-medium">{buyer.contractsCount}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Value</span>
              <span className="font-medium">{formatCurrency(buyer.totalValue)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Created Date</span>
              <span className="font-medium">{formatDate(buyer.createdAt)}</span>
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
