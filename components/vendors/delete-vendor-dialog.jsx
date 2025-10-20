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
import { AlertTriangle } from "lucide-react"

export function DeleteVendorDialog({ vendor, open, onOpenChange, onSubmit }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      await onSubmit(vendor.id)
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Vendor
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{vendor.name}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Vendor Details:</h4>
            <p><strong>Name:</strong> {vendor.name}</p>
            <p><strong>Email:</strong> {vendor.email}</p>
            <p><strong>Address:</strong> {vendor.address || "N/A"}</p>
            <p><strong>Phone:</strong> {vendor.phone_number?.join(", ") || "N/A"}</p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Vendor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
