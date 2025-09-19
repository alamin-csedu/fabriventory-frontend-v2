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

interface DeleteSalesContractDialogProps {
  contract: SalesContract
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeleteSalesContractDialog({ contract, open, onOpenChange, onSuccess }: DeleteSalesContractDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setLoading(true)

    try {
      // API call to delete sales contract
      const response = await fetch(`http://localhost:8080/api/v1/sales-contracts/${contract.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Sales contract deleted successfully",
        })
        onSuccess()
      } else {
        throw new Error("Failed to delete sales contract")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete sales contract. Please try again.",
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
            <DialogTitle>Delete Sales Contract</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete contract <strong>{contract?.contractNo}</strong>? This action cannot be
            undone and will remove all associated data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete Contract"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
