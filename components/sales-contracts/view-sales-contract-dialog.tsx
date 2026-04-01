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

interface SalesContract {
  id: number
  contractNo: string
  buyerId: number
  buyerName: string
  style: string
  jobNo: string
  btbLcNo: string
  createdAt: string
  status: "draft" | "active" | "completed" | "cancelled"
  value: number
}

interface ViewSalesContractDialogProps {
  contract: SalesContract
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewSalesContractDialog({ contract, open, onOpenChange }: ViewSalesContractDialogProps) {
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
      active: { variant: "default" as const, label: "Active" },
      completed: { variant: "default" as const, label: "Completed" },
      cancelled: { variant: "destructive" as const, label: "Cancelled" },
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sales Contract Details</DialogTitle>
          <DialogDescription>Complete information about this sales contract</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Contract Number</span>
              <span className="font-mono font-medium">{contract.contractNo}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Status</span>
              {getStatusBadge(contract.status)}
            </div>

          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Buyer Information</h4>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Buyer Name</span>
                <span className="font-medium">{contract.buyerName}</span>
              </div>

            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Contract Details</h4>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Style</span>
                <span className="font-medium">{contract.style}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Job Number</span>
                <span className="font-mono font-medium">{contract.jobNo}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">BTB LC Number</span>
                <span className="font-mono font-medium">{contract.btbLcNo || "Not specified"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Contract Value</span>
                <span className="font-medium">{formatCurrency(contract.value)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Created Date</span>
                <span className="font-medium">{formatDate(contract.createdAt)}</span>
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
