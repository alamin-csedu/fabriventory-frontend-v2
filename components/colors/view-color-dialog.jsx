"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"

export const ViewColorDialog = ({ open, onOpenChange, colorId, onSuccess }) => {
  const [color, setColor] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && colorId) {
      fetchColor()
    }
  }, [open, colorId])

  const fetchColor = async () => {
    setIsLoading(true)
    try {
      const colorData = await onSuccess(colorId)
      setColor(colorData)
    } catch (error) {
      console.error("Error fetching color:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!color && !isLoading) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Color Details</DialogTitle>
          <DialogDescription>
            View detailed information about this color.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : color ? (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">Color Name</label>
              <p className="text-sm">{color.name}</p>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">Color Code</label>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: color.color_code }}
                />
                <span className="font-mono text-sm">{color.color_code}</span>
              </div>
            </div>

            {color.rgb && (
              <div className="grid gap-2">
                <label className="text-sm font-medium text-muted-foreground">RGB Values</label>
                <p className="font-mono text-sm">{color.rgb}</p>
              </div>
            )}

            {color.pantone_code && (
              <div className="grid gap-2">
                <label className="text-sm font-medium text-muted-foreground">Pantone Code</label>
                <Badge variant="outline">{color.pantone_code}</Badge>
              </div>
            )}

            {color.description && (
              <div className="grid gap-2">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm">{color.description}</p>
              </div>
            )}

            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p className="text-sm">{format(new Date(color.created_at), 'MMM dd, yyyy HH:mm')}</p>
            </div>

            {color.updated_at !== color.created_at && (
              <div className="grid gap-2">
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm">{format(new Date(color.updated_at), 'MMM dd, yyyy HH:mm')}</p>
              </div>
            )}
          </div>
        ) : null}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
