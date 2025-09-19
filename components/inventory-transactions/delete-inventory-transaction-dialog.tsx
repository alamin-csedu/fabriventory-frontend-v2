"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, AlertTriangle, Package, ArrowUp, ArrowDown } from "lucide-react"

interface InventoryTransaction {
  id: number
  transactionDate: string
  buyerId?: number
  supplierId?: number
  salesContractId?: number
  purchaseInvoiceId?: number
  itemId: number
  color: string
  openingBalance: number
  receivedQty: number
  issueQty: number
  closingBalance: number
  issueLocation?: string
  rate: number
  receivedValue: number
  issueValue: number
  closingValue: number
  weightWastage: number
  remarks: string
  createdAt: string
  // Related data
  buyerName?: string
  supplierName?: string
  salesContractNo?: string
  purchaseInvoiceNo?: string
  itemName: string
  itemUom: string
}

interface DeleteInventoryTransactionDialogProps {
  transaction: InventoryTransaction
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeleteInventoryTransactionDialog({ 
  transaction, 
  open, 
  onOpenChange, 
  onSuccess 
}: DeleteInventoryTransactionDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      // Mock API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log("Deleting inventory transaction:", transaction.id)

      toast({
        title: "Success",
        description: "Inventory transaction deleted successfully",
      })

      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete inventory transaction",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

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

  const isReceipt = transaction.receivedQty > 0
  const isIssue = transaction.issueQty > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Inventory Transaction
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the inventory transaction and remove it from the system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Card */}
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-destructive text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Warning
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-destructive/80">
                Deleting this transaction will affect your inventory balance calculations. 
                Make sure you have proper backups before proceeding.
              </p>
            </CardContent>
          </Card>

          {/* Transaction Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4" />
                Transaction Details
              </CardTitle>
              <CardDescription>
                Review the transaction details before deletion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {isReceipt ? (
                  <Badge variant="default" className="gap-1">
                    <ArrowUp className="h-3 w-3" />
                    Stock Receipt
                  </Badge>
                ) : isIssue ? (
                  <Badge variant="secondary" className="gap-1">
                    <ArrowDown className="h-3 w-3" />
                    Stock Issue
                  </Badge>
                ) : (
                  <Badge variant="outline">Adjustment</Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  Transaction #{transaction.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-muted-foreground">Date</label>
                  <p>{formatDate(transaction.transactionDate)}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Item</label>
                  <p>{transaction.itemName} ({transaction.itemUom})</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Color</label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full border" 
                      style={{ backgroundColor: transaction.color.toLowerCase() }}
                    />
                    <span>{transaction.color}</span>
                  </div>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Rate</label>
                  <p>{formatCurrency(transaction.rate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <label className="font-medium text-muted-foreground block">Opening</label>
                  <p className="font-bold">{transaction.openingBalance.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <label className="font-medium text-muted-foreground block">Received</label>
                  <p className="font-bold text-green-600">
                    {transaction.receivedQty > 0 ? `+${transaction.receivedQty.toLocaleString()}` : "-"}
                  </p>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <label className="font-medium text-muted-foreground block">Issued</label>
                  <p className="font-bold text-red-600">
                    {transaction.issueQty > 0 ? `-${transaction.issueQty.toLocaleString()}` : "-"}
                  </p>
                </div>
              </div>

              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <label className="font-medium text-muted-foreground block">Closing Balance</label>
                <p className="text-xl font-bold text-blue-600">{transaction.closingBalance.toLocaleString()}</p>
              </div>

              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <label className="font-medium text-muted-foreground block">Total Value</label>
                <p className="text-lg font-bold">{formatCurrency(transaction.closingValue)}</p>
              </div>

              {transaction.remarks && (
                <div>
                  <label className="font-medium text-muted-foreground text-sm">Remarks</label>
                  <p className="text-sm mt-1 p-2 bg-muted/30 rounded">{transaction.remarks}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Transaction
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
