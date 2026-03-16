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
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import { AlertTriangle } from "lucide-react"

export function DeleteStorageDialog({ storage, open, onOpenChange, onSubmit }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      await onSubmit(storage.id)
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting storage:', error)
      // Error handling is now done in the parent component
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
            Delete Storage Location
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{storage.name}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Storage Details:</h4>
            <p><strong>Name:</strong> {storage.name}</p>
            <p><strong>Parent ID:</strong> {storage.parent_id || "N/A"}</p>
            <p><strong>Capacity:</strong> {storage.capacity || "N/A"}</p>
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
            {loading ? "Deleting..." : "Delete Storage"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
