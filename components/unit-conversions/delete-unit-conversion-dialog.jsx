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
import { Loader2, AlertTriangle } from "lucide-react"

export const DeleteUnitConversionDialog = ({ open, onOpenChange, conversion, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      await onSuccess(conversion.from_id, conversion.to_id)
      onOpenChange(false)
    } catch (error) {
      console.error("Error deleting unit conversion:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Unit Conversion
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the unit conversion from "{conversion?.from_unit?.name || `Unit ${conversion?.from_id}`}" to "{conversion?.to_unit?.name || `Unit ${conversion?.to_id}`}"?
            <br />
            <span className="text-sm text-muted-foreground mt-2 block">
              This action cannot be undone.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Conversion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
