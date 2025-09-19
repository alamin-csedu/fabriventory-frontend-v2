"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Package, ArrowUp, ArrowDown, Calendar, User, Building2, FileText, Receipt } from "lucide-react"

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

interface ViewInventoryTransactionDialogProps {
  transaction: InventoryTransaction
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewInventoryTransactionDialog({ 
  transaction, 
  open, 
  onOpenChange 
}: ViewInventoryTransactionDialogProps) {
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isReceipt = transaction.receivedQty > 0
  const isIssue = transaction.issueQty > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Transaction Details
          </DialogTitle>
          <DialogDescription>
            View complete details of the inventory transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Type Badge */}
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

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Transaction Date</label>
                  <p className="text-sm">{formatDate(transaction.transactionDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created At</label>
                  <p className="text-sm">{formatDateTime(transaction.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Item Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Item Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Item Name</label>
                  <p className="text-sm font-medium">{transaction.itemName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Unit of Measure</label>
                  <p className="text-sm">{transaction.itemUom}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Color</label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border" 
                      style={{ backgroundColor: transaction.color.toLowerCase() }}
                    />
                    <p className="text-sm">{transaction.color}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Rate per Unit</label>
                  <p className="text-sm font-medium">{formatCurrency(transaction.rate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Parties */}
          {(isReceipt || isIssue) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isReceipt ? (
                    <>
                      <Building2 className="h-4 w-4" />
                      Supplier Information
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4" />
                      Buyer Information
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isReceipt && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                      <p className="text-sm font-medium">{transaction.supplierName || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Purchase Invoice</label>
                      <p className="text-sm font-mono">{transaction.purchaseInvoiceNo || "N/A"}</p>
                    </div>
                  </div>
                )}
                {isIssue && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Buyer</label>
                      <p className="text-sm font-medium">{transaction.buyerName || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Sales Contract</label>
                      <p className="text-sm font-mono">{transaction.salesContractNo || "N/A"}</p>
                    </div>
                  </div>
                )}
                {isIssue && transaction.issueLocation && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Issue Location</label>
                    <p className="text-sm">{transaction.issueLocation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quantity Information */}
          <Card>
            <CardHeader>
              <CardTitle>Quantity Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <label className="text-sm font-medium text-muted-foreground block">Opening Balance</label>
                  <p className="text-2xl font-bold">{transaction.openingBalance.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <label className="text-sm font-medium text-muted-foreground block">Received</label>
                  <p className="text-2xl font-bold text-green-600">
                    {transaction.receivedQty > 0 ? `+${transaction.receivedQty.toLocaleString()}` : "-"}
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <label className="text-sm font-medium text-muted-foreground block">Issued</label>
                  <p className="text-2xl font-bold text-red-600">
                    {transaction.issueQty > 0 ? `-${transaction.issueQty.toLocaleString()}` : "-"}
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <label className="text-sm font-medium text-muted-foreground block">Closing Balance</label>
                  <p className="text-2xl font-bold text-blue-600">{transaction.closingBalance.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Value Information */}
          <Card>
            <CardHeader>
              <CardTitle>Value Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <label className="text-sm font-medium text-muted-foreground block">Received Value</label>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(transaction.receivedValue)}
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <label className="text-sm font-medium text-muted-foreground block">Issue Value</label>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(transaction.issueValue)}
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <label className="text-sm font-medium text-muted-foreground block">Closing Value</label>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(transaction.closingValue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Weight/Wastage</label>
                  <p className="text-sm">{Number(transaction.weightWastage || 0).toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Transaction ID</label>
                  <p className="text-sm font-mono">#{transaction.id}</p>
                </div>
              </div>
              
              {transaction.remarks && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Remarks</label>
                  <p className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">{transaction.remarks}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
