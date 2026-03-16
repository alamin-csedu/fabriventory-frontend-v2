"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface DeleteStockTransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transferId: number
  onSuccess?: () => void
}

export function DeleteStockTransferDialog({
  open,
  onOpenChange,
  transferId,
  onSuccess,
}: DeleteStockTransferDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await apiService.deleteStockTransfer(transferId)
      toast.success("Stock transfer deleted")
      onOpenChange(false)
      onSuccess?.()
    } catch (e) {
      console.error(e)
      toast.error("Failed to delete transfer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete stock transfer</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this transfer? This action cannot be undone. Storage stock may be updated.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
