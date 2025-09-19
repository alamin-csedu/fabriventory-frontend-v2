"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle } from "lucide-react"

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

interface DeletePurchaseInvoiceDialogProps {
  invoice: PurchaseInvoice
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeletePurchaseInvoiceDialog({
  invoice,
  open,
  onOpenChange,
  onSuccess,
}: DeletePurchaseInvoiceDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setLoading(true)

    try {
      // API call to delete purchase invoice
      const response = await fetch(`http://localhost:8080/api/v1/purchase-invoices/${invoice.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Purchase invoice deleted successfully",
        })
        onSuccess()
      } else {
        throw new Error("Failed to delete purchase invoice")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete purchase invoice. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Delete Purchase Invoice</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete invoice <strong>{invoice?.piNo}</strong>? This action cannot be undone and
            will remove all associated data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
