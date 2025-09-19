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

interface Buyer {
  id: number
  name: string
  createdAt: string
  contractsCount: number
  totalValue: number
  status: "active" | "inactive"
}

interface DeleteBuyerDialogProps {
  buyer: Buyer
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeleteBuyerDialog({ buyer, open, onOpenChange, onSuccess }: DeleteBuyerDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setLoading(true)

    try {
      // API call to delete buyer
      const response = await fetch(`http://localhost:8080/api/v1/buyers/${buyer.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Buyer deleted successfully",
        })
        onSuccess()
      } else {
        throw new Error("Failed to delete buyer")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete buyer. Please try again.",
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
            <DialogTitle>Delete Buyer</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete <strong>{buyer?.name}</strong>? This action cannot be undone and will remove
            all associated data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete Buyer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
